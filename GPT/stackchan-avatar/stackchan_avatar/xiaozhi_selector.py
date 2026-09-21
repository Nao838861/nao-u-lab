from __future__ import annotations

import asyncio
import json
import os
import tempfile
import urllib.error
import urllib.request
from collections.abc import Awaitable, Callable, Mapping
from dataclasses import dataclass
from pathlib import Path
from typing import Literal, cast

import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, Response
from pydantic import BaseModel

SelectorMode = Literal["auto", "home", "official"]
Forwarder = Callable[[str, str, bytes, Mapping[str, str], float], Awaitable["UpstreamResponse"]]

_HOP_BY_HOP_HEADERS = {
    "connection",
    "keep-alive",
    "proxy-authenticate",
    "proxy-authorization",
    "te",
    "trailer",
    "transfer-encoding",
    "upgrade",
    "host",
    "content-length",
}


@dataclass(frozen=True)
class SelectorSettings:
    home_ota_url: str = "http://127.0.0.1:12800/xiaozhi/ota/"
    official_ota_url: str = "https://api.tenclass.net/xiaozhi/ota/"
    default_mode: SelectorMode = "auto"
    state_file: Path = Path(".stackchan-selector.json")
    request_timeout_seconds: float = 4.0
    host: str = "0.0.0.0"
    port: int = 8765

    @classmethod
    def from_env(cls) -> SelectorSettings:
        mode = os.getenv("STACKCHAN_SELECTOR_DEFAULT_MODE", "auto").lower()
        if mode not in {"auto", "home", "official"}:
            raise ValueError("STACKCHAN_SELECTOR_DEFAULT_MODE must be auto, home, or official")
        return cls(
            home_ota_url=os.getenv(
                "STACKCHAN_SELECTOR_HOME_OTA_URL",
                "http://127.0.0.1:12800/xiaozhi/ota/",
            ),
            official_ota_url=os.getenv(
                "STACKCHAN_SELECTOR_OFFICIAL_OTA_URL",
                "https://api.tenclass.net/xiaozhi/ota/",
            ),
            default_mode=cast(SelectorMode, mode),
            state_file=Path(os.getenv("STACKCHAN_SELECTOR_STATE_FILE", ".stackchan-selector.json")),
            request_timeout_seconds=float(os.getenv("STACKCHAN_SELECTOR_TIMEOUT_SECONDS", "4")),
            host=os.getenv("STACKCHAN_SELECTOR_HOST", "0.0.0.0"),
            port=int(os.getenv("STACKCHAN_SELECTOR_PORT", "8765")),
        )


@dataclass(frozen=True)
class UpstreamResponse:
    status_code: int
    body: bytes
    headers: Mapping[str, str]


class UpstreamUnavailable(RuntimeError):
    pass


class ModeRequest(BaseModel):
    mode: SelectorMode


def _join_upstream_url(base_url: str, suffix: str, query: str) -> str:
    url = base_url.rstrip("/") + "/"
    if suffix:
        url += suffix.lstrip("/")
    if query:
        url += "?" + query
    return url


async def _urllib_forward(
    method: str,
    url: str,
    body: bytes,
    headers: Mapping[str, str],
    timeout: float,
) -> UpstreamResponse:
    def send() -> UpstreamResponse:
        outgoing_headers = {
            name: value
            for name, value in headers.items()
            if name.lower() not in _HOP_BY_HOP_HEADERS
        }
        request = urllib.request.Request(
            url,
            data=body if method not in {"GET", "HEAD"} else None,
            headers=outgoing_headers,
            method=method,
        )
        try:
            with urllib.request.urlopen(request, timeout=timeout) as result:
                return UpstreamResponse(
                    status_code=result.status,
                    body=result.read(),
                    headers=dict(result.headers.items()),
                )
        except urllib.error.HTTPError as exc:
            return UpstreamResponse(
                status_code=exc.code,
                body=exc.read(),
                headers=dict(exc.headers.items()) if exc.headers else {},
            )
        except (OSError, TimeoutError, urllib.error.URLError) as exc:
            raise UpstreamUnavailable(str(exc)) from exc

    return await asyncio.to_thread(send)


class SelectorService:
    def __init__(self, settings: SelectorSettings, forwarder: Forwarder) -> None:
        self.settings = settings
        self.forwarder = forwarder
        self.mode: SelectorMode = self._load_mode()
        self.last_target: str | None = None
        self.last_error: str | None = None
        self._lock = asyncio.Lock()

    def _load_mode(self) -> SelectorMode:
        try:
            data = json.loads(self.settings.state_file.read_text(encoding="utf-8"))
            mode = data.get("mode")
            if mode in {"auto", "home", "official"}:
                return mode
        except (FileNotFoundError, OSError, ValueError, TypeError):
            pass
        return self.settings.default_mode

    async def set_mode(self, mode: SelectorMode) -> None:
        async with self._lock:
            self.settings.state_file.parent.mkdir(parents=True, exist_ok=True)
            fd, temporary_name = tempfile.mkstemp(
                prefix=self.settings.state_file.name + ".",
                dir=self.settings.state_file.parent,
                text=True,
            )
            try:
                with os.fdopen(fd, "w", encoding="utf-8") as handle:
                    json.dump({"mode": mode}, handle, ensure_ascii=False)
                    handle.write("\n")
                os.replace(temporary_name, self.settings.state_file)
            except Exception:
                try:
                    os.unlink(temporary_name)
                except OSError:
                    pass
                raise
            self.mode = mode

    def status(self) -> dict[str, object]:
        return {
            "ok": True,
            "mode": self.mode,
            "home_ota_url": self.settings.home_ota_url,
            "official_ota_url": self.settings.official_ota_url,
            "last_target": self.last_target,
            "last_error": self.last_error,
        }

    async def forward(
        self,
        *,
        suffix: str,
        query: str,
        method: str,
        body: bytes,
        headers: Mapping[str, str],
    ) -> UpstreamResponse:
        targets = {
            "home": self.settings.home_ota_url,
            "official": self.settings.official_ota_url,
        }
        order = ["home", "official"] if self.mode == "auto" else [self.mode]
        failures: list[str] = []

        for index, target_name in enumerate(order):
            target_url = _join_upstream_url(targets[target_name], suffix, query)
            try:
                result = await self.forwarder(
                    method,
                    target_url,
                    body,
                    headers,
                    self.settings.request_timeout_seconds,
                )
            except UpstreamUnavailable as exc:
                failures.append(f"{target_name}: {exc}")
                if index + 1 < len(order):
                    continue
                self.last_target = None
                self.last_error = "; ".join(failures)
                raise HTTPException(status_code=502, detail="接続先へ到達できません") from exc

            if result.status_code >= 500 and index + 1 < len(order):
                failures.append(f"{target_name}: HTTP {result.status_code}")
                continue

            self.last_target = target_name
            self.last_error = "; ".join(failures) or None
            return result

        raise HTTPException(status_code=502, detail="利用できる接続先がありません")


_PAGE = """<!doctype html><html lang=\"ja\"><meta charset=\"utf-8\">
<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">
<title>StackChan 接続先Selector</title><style>
body{font-family:system-ui,sans-serif;max-width:720px;margin:2rem auto;padding:0 1rem;color:#292522}
.card{border:2px solid #292522;border-radius:16px;padding:1.2rem;box-shadow:4px 4px #292522}
button{font:inherit;font-weight:700;margin:.35rem;padding:.7rem 1rem;border:0;border-radius:999px;background:#287a67;color:white;cursor:pointer}
button[data-mode=official]{background:#526a7b}pre{white-space:pre-wrap;background:#eee8df;padding:1rem;border-radius:10px}
</style><main class=\"card\"><h1>StackChan 接続先Selector</h1>
<p><b>Auto</b>はHomeを優先し、接続不能・タイムアウト・5xxのとき公式へ退避します。</p>
<div><button data-mode=\"auto\">Auto</button><button data-mode=\"home\">Home</button><button data-mode=\"official\">Official</button></div>
<pre id=\"status\">確認中…</pre></main><script>
const status=document.querySelector('#status');
async function refresh(){const r=await fetch('/api/mode');status.textContent=JSON.stringify(await r.json(),null,2)}
for(const b of document.querySelectorAll('button'))b.onclick=async()=>{await fetch('/api/mode',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({mode:b.dataset.mode})});refresh()};
refresh();setInterval(refresh,3000);
</script></html>"""


def _require_local(request: Request) -> None:
    host = request.client.host if request.client else ""
    if host not in {"127.0.0.1", "::1", "testclient"}:
        raise HTTPException(status_code=403, detail="モード変更はSelector本体からだけ実行できます")


def create_selector_application(
    settings: SelectorSettings | None = None,
    *,
    forwarder: Forwarder | None = None,
) -> FastAPI:
    settings = settings or SelectorSettings.from_env()
    service = SelectorService(settings, forwarder or _urllib_forward)
    app = FastAPI(title="StackChan XiaoZhi Selector")
    app.state.selector = service

    @app.get("/", response_class=HTMLResponse)
    async def index() -> HTMLResponse:
        return HTMLResponse(_PAGE)

    @app.get("/health")
    async def health() -> dict[str, object]:
        return service.status()

    @app.get("/api/mode")
    async def get_mode() -> dict[str, object]:
        return service.status()

    @app.post("/api/mode")
    async def set_mode(request: Request, body: ModeRequest) -> dict[str, object]:
        _require_local(request)
        await service.set_mode(body.mode)
        return service.status()

    async def proxy(request: Request, suffix: str = "") -> Response:
        result = await service.forward(
            suffix=suffix,
            query=request.url.query,
            method=request.method,
            body=await request.body(),
            headers=dict(request.headers.items()),
        )
        response_headers = {
            name: value
            for name, value in result.headers.items()
            if name.lower() not in _HOP_BY_HOP_HEADERS
        }
        return Response(
            content=result.body,
            status_code=result.status_code,
            headers=response_headers,
        )

    app.add_api_route(
        "/xiaozhi/ota",
        proxy,
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"],
    )
    app.add_api_route(
        "/xiaozhi/ota/",
        proxy,
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"],
    )
    app.add_api_route(
        "/xiaozhi/ota/{suffix:path}",
        proxy,
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"],
    )
    return app


def main() -> None:
    settings = SelectorSettings.from_env()
    uvicorn.run(create_selector_application(settings), host=settings.host, port=settings.port)


if __name__ == "__main__":
    main()
