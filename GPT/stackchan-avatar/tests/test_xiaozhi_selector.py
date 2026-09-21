from __future__ import annotations

from pathlib import Path
from typing import cast

from fastapi.testclient import TestClient

from stackchan_avatar.xiaozhi_selector import (
    SelectorMode,
    SelectorSettings,
    UpstreamResponse,
    UpstreamUnavailable,
    create_selector_application,
)


def settings(tmp_path: Path, *, mode: str = "auto") -> SelectorSettings:
    return SelectorSettings(
        home_ota_url="http://home.test/xiaozhi/ota/",
        official_ota_url="https://official.test/xiaozhi/ota/",
        default_mode=cast(SelectorMode, mode),
        state_file=tmp_path / "selector.json",
        request_timeout_seconds=0.25,
    )


def test_auto_prefers_home_and_preserves_request(tmp_path: Path) -> None:
    calls: list[tuple[str, str, bytes, dict[str, str]]] = []

    async def forward(method, url, body, headers, timeout):
        del timeout
        calls.append((method, url, body, dict(headers)))
        return UpstreamResponse(
            200,
            b'{"websocket":{}}',
            {"Content-Type": "application/json", "X-Selector-Test": "preserved"},
        )

    client = TestClient(create_selector_application(settings(tmp_path), forwarder=forward))
    response = client.post(
        "/xiaozhi/ota/activate?phase=1",
        content=b'{"challenge":"abc"}',
        headers={"Device-Id": "device-1", "Authorization": "secret"},
    )

    assert response.status_code == 200
    assert response.headers["x-selector-test"] == "preserved"
    assert calls[0][0] == "POST"
    assert calls[0][1] == "http://home.test/xiaozhi/ota/activate?phase=1"
    assert calls[0][2] == b'{"challenge":"abc"}'
    assert calls[0][3]["device-id"] == "device-1"
    assert calls[0][3]["authorization"] == "secret"
    assert client.get("/api/mode").json()["last_target"] == "home"


def test_auto_falls_back_to_official_on_unavailable_home(tmp_path: Path) -> None:
    calls: list[str] = []

    async def forward(method, url, body, headers, timeout):
        del method, body, headers, timeout
        calls.append(url)
        if url.startswith("http://home.test"):
            raise UpstreamUnavailable("offline")
        return UpstreamResponse(200, b"official", {})

    client = TestClient(create_selector_application(settings(tmp_path), forwarder=forward))
    response = client.post("/xiaozhi/ota/")

    assert response.status_code == 200
    assert response.content == b"official"
    assert calls == [
        "http://home.test/xiaozhi/ota/",
        "https://official.test/xiaozhi/ota/",
    ]
    status = client.get("/health").json()
    assert status["last_target"] == "official"
    assert "home: offline" in status["last_error"]


def test_auto_falls_back_on_home_5xx_but_not_4xx(tmp_path: Path) -> None:
    status = 503
    calls: list[str] = []

    async def forward(method, url, body, headers, timeout):
        del method, body, headers, timeout
        calls.append(url)
        if url.startswith("http://home.test"):
            return UpstreamResponse(status, b"home error", {})
        return UpstreamResponse(200, b"official", {})

    client = TestClient(create_selector_application(settings(tmp_path), forwarder=forward))
    assert client.get("/xiaozhi/ota/").content == b"official"

    status = 401
    calls.clear()
    response = client.get("/xiaozhi/ota/")
    assert response.status_code == 401
    assert response.content == b"home error"
    assert len(calls) == 1


def test_explicit_home_never_falls_back(tmp_path: Path) -> None:
    calls: list[str] = []

    async def forward(method, url, body, headers, timeout):
        del method, body, headers, timeout
        calls.append(url)
        raise UpstreamUnavailable("offline")

    client = TestClient(
        create_selector_application(settings(tmp_path, mode="home"), forwarder=forward)
    )
    response = client.get("/xiaozhi/ota/")

    assert response.status_code == 502
    assert calls == ["http://home.test/xiaozhi/ota/"]


def test_mode_change_is_persisted(tmp_path: Path) -> None:
    config = settings(tmp_path)

    async def forward(method, url, body, headers, timeout):
        del method, url, body, headers, timeout
        return UpstreamResponse(200, b"ok", {})

    client = TestClient(create_selector_application(config, forwarder=forward))
    response = client.post("/api/mode", json={"mode": "official"})

    assert response.status_code == 200
    assert response.json()["mode"] == "official"
    assert config.state_file.read_text(encoding="utf-8") == '{"mode": "official"}\n'

    restarted = TestClient(create_selector_application(config, forwarder=forward))
    assert restarted.get("/api/mode").json()["mode"] == "official"


def test_page_explains_all_modes(tmp_path: Path) -> None:
    async def forward(method, url, body, headers, timeout):
        del method, url, body, headers, timeout
        return UpstreamResponse(200, b"ok", {})

    client = TestClient(create_selector_application(settings(tmp_path), forwarder=forward))
    page = client.get("/").text

    assert "Auto" in page
    assert "Home" in page
    assert "Official" in page
