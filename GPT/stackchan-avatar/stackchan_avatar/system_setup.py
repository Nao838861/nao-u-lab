from __future__ import annotations

import asyncio
import ipaddress
import json
import os
import socket
import sys
from pathlib import Path

from pydantic import BaseModel, Field

LOCAL_CONFIG_FILENAME = "stackchan.local.json"


class SetupRequest(BaseModel):
    brain: str = Field(pattern="^(echo|openai)$")
    openai_api_key: str = Field(default="", max_length=300)
    wifi_ssid: str = Field(default="", max_length=64)
    wifi_password: str = Field(default="", max_length=128)
    server_host: str = Field(default="", max_length=45)
    server_port: int = Field(default=8000, ge=1, le=65535)


class FirmwareJobRequest(BaseModel):
    action: str = Field(pattern="^(build|upload)$")
    port: str = Field(default="", max_length=200)


def detect_lan_ip() -> str:
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        sock.connect(("192.0.2.1", 80))
        address = sock.getsockname()[0]
    except OSError:
        address = "127.0.0.1"
    finally:
        sock.close()
    return address


def list_serial_ports() -> list[dict[str, str]]:
    try:
        from serial.tools import list_ports
    except ImportError:
        return []
    return [
        {"device": item.device, "description": item.description or item.device}
        for item in list_ports.comports()
    ]


def _c_string(value: str) -> str:
    return value.replace("\\", "\\\\").replace('"', '\\"')


def read_local_config(root: Path) -> dict[str, str]:
    path = root / LOCAL_CONFIG_FILENAME
    if not path.exists():
        return {}
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise ValueError(f"{LOCAL_CONFIG_FILENAME}を読み込めません: {exc}") from exc
    if not isinstance(raw, dict):
        raise TypeError(f"{LOCAL_CONFIG_FILENAME}の内容はJSONオブジェクトにしてください")
    allowed = {"wifi_ssid", "wifi_password", "server_host"}
    config: dict[str, str] = {}
    for key in allowed:
        value = raw.get(key, "")
        if not isinstance(value, str):
            raise TypeError(f"{LOCAL_CONFIG_FILENAME}の{key}は文字列にしてください")
        config[key] = value.strip() if key != "wifi_password" else value
    return config


def write_firmware_config(root: Path, request: SetupRequest) -> None:
    try:
        address = ipaddress.ip_address(request.server_host)
    except ValueError as exc:
        raise ValueError("PCの家庭内LAN IPv4アドレスを指定してください") from exc
    if address.version != 4 or address.is_loopback:
        raise ValueError("PCの家庭内LAN IPv4アドレスを指定してください")

    template_path = root / "firmware" / "include" / "config.template.h"
    output_path = root / "firmware" / "include" / "config.h"
    text = template_path.read_text(encoding="utf-8")
    text = text.replace("__SSID__", _c_string(request.wifi_ssid))
    text = text.replace("__PASSWORD__", _c_string(request.wifi_password))
    text = text.replace('SERVER_HOST_H "192.168.1.179"', f'SERVER_HOST_H "{address}"')
    text = text.replace("SERVER_PORT_H 8000", f"SERVER_PORT_H {request.server_port}")
    output_path.write_text(text, encoding="utf-8")


def _read_env(path: Path) -> list[str]:
    if not path.exists():
        return []
    return path.read_text(encoding="utf-8").splitlines()


def _has_env_value(path: Path, key: str) -> bool:
    return any(
        line.startswith(f"{key}=") and line.split("=", 1)[1].strip() for line in _read_env(path)
    )


def _upsert_env(path: Path, values: dict[str, str]) -> None:
    remaining = dict(values)
    output: list[str] = []
    for line in _read_env(path):
        key = line.split("=", 1)[0].strip() if "=" in line else ""
        if key in remaining:
            output.append(f"{key}={remaining.pop(key)}")
        else:
            output.append(line)
    if output and output[-1] != "":
        output.append("")
    output.extend(f"{key}={value}" for key, value in remaining.items())
    path.write_text("\n".join(output) + "\n", encoding="utf-8")


class SetupService:
    def __init__(self, root: Path) -> None:
        self.root = root
        self._job_task: asyncio.Task[None] | None = None
        self._job_state: dict[str, object] = {
            "running": False,
            "action": None,
            "ok": None,
            "log": [],
        }

    def summary(self, *, brain: str) -> dict[str, object]:
        env_path = self.root / ".env"
        local_config: dict[str, str] = {}
        local_config_error = ""
        try:
            local_config = read_local_config(self.root)
        except (TypeError, ValueError) as exc:
            local_config_error = str(exc)
        return {
            "brain": brain,
            "suggested_ip": local_config.get("server_host") or detect_lan_ip(),
            "default_wifi_ssid": local_config.get("wifi_ssid", ""),
            "local_configured": bool(local_config),
            "local_config_error": local_config_error,
            "firmware_configured": (self.root / "firmware" / "include" / "config.h").exists(),
            "openai_key_configured": _has_env_value(env_path, "OPENAI_API_KEY"),
            "serial_ports": list_serial_ports(),
            "job": self.job_status(),
        }

    def save(self, request: SetupRequest) -> None:
        local_config = read_local_config(self.root)
        local_ssid = local_config.get("wifi_ssid", "")
        wifi_ssid = request.wifi_ssid.strip() or local_ssid
        wifi_password = request.wifi_password
        if not wifi_password and wifi_ssid == local_ssid:
            wifi_password = local_config.get("wifi_password", "")
        server_host = (
            request.server_host.strip()
            or local_config.get("server_host", "")
            or detect_lan_ip()
        )
        if bool(wifi_ssid) != bool(wifi_password):
            raise ValueError("Wi-Fi名とパスワードは両方入力してください")
        if wifi_ssid:
            write_firmware_config(
                self.root,
                request.model_copy(
                    update={
                        "wifi_ssid": wifi_ssid,
                        "wifi_password": wifi_password,
                        "server_host": server_host,
                    }
                ),
            )
        env_path = self.root / ".env"
        if (
            request.brain == "openai"
            and not request.openai_api_key
            and not _has_env_value(env_path, "OPENAI_API_KEY")
        ):
            raise ValueError("OpenAI会話を使う場合はAPIキーを入力してください")
        env_values = {"STACKCHAN_AVATAR_BRAIN": request.brain}
        if request.openai_api_key:
            env_values["OPENAI_API_KEY"] = request.openai_api_key
        _upsert_env(env_path, env_values)

    def job_status(self) -> dict[str, object]:
        return {
            **self._job_state,
            "log": list(self._job_state["log"]),
        }

    async def start_job(self, request: FirmwareJobRequest) -> None:
        if self._job_task is not None and not self._job_task.done():
            raise RuntimeError("別のファーム処理が実行中です")
        if not (self.root / "firmware" / "include" / "config.h").exists():
            raise RuntimeError("先にWi-Fi名とパスワードを入力して、設定を保存してください")
        self._job_state = {
            "running": True,
            "action": request.action,
            "ok": None,
            "log": ["処理を開始します…"],
        }
        self._job_task = asyncio.create_task(self._run_job(request))

    async def _run_job(self, request: FirmwareJobRequest) -> None:
        command = [sys.executable, str(self.root / "scripts" / "firmware.py"), request.action]
        if request.port:
            command.extend(("--port", request.port))
        environment = os.environ.copy()
        environment.setdefault("PLATFORMIO_CORE_DIR", str(self.root / ".platformio-core"))
        environment.setdefault("PLATFORMIO_SETTING_ENABLE_TELEMETRY", "no")
        log = self._job_state["log"]
        assert isinstance(log, list)
        try:
            process = await asyncio.create_subprocess_exec(
                *command,
                cwd=self.root,
                env=environment,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.STDOUT,
            )
            assert process.stdout is not None
            async for raw_line in process.stdout:
                log.append(raw_line.decode(errors="replace").rstrip())
                del log[:-300]
            return_code = await process.wait()
            self._job_state["ok"] = return_code == 0
            log.append(
                "完了しました。" if return_code == 0 else "失敗しました。ログを確認してください。"
            )
        except OSError as exc:
            self._job_state["ok"] = False
            log.append(f"起動エラー: {exc}")
        finally:
            self._job_state["running"] = False


__all__ = [
    "FirmwareJobRequest",
    "SetupRequest",
    "SetupService",
    "detect_lan_ip",
    "read_local_config",
    "write_firmware_config",
]
