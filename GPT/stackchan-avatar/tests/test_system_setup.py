from __future__ import annotations

import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from stackchan_avatar.app import create_application
from stackchan_avatar.config import Settings
from stackchan_avatar.system_setup import (
    FirmwareJobRequest,
    SetupRequest,
    SetupService,
)


def _project(tmp_path: Path) -> Path:
    include = tmp_path / "firmware" / "include"
    include.mkdir(parents=True)
    include.joinpath("config.template.h").write_text(
        '#define WIFI_SSID_H "__SSID__"\n'
        '#define WIFI_PASSWORD_H "__PASSWORD__"\n'
        '#define SERVER_HOST_H "192.168.1.179"\n'
        "#define SERVER_PORT_H 8000\n",
        encoding="utf-8",
    )
    return tmp_path


def test_setup_saves_secrets_without_returning_them(tmp_path: Path) -> None:
    root = _project(tmp_path)
    service = SetupService(root)
    service.save(
        SetupRequest(
            brain="openai",
            openai_api_key="test-api-key",
            wifi_ssid="Home WiFi",
            wifi_password="secret-pass",
            server_host="192.168.1.20",
        )
    )

    firmware = (root / "firmware" / "include" / "config.h").read_text(encoding="utf-8")
    env = (root / ".env").read_text(encoding="utf-8")
    assert 'WIFI_SSID_H "Home WiFi"' in firmware
    assert 'WIFI_PASSWORD_H "secret-pass"' in firmware
    assert "OPENAI_API_KEY=test-api-key" in env

    summary = service.summary(brain="openai")
    assert summary["firmware_configured"] is True
    assert summary["openai_key_configured"] is True
    assert "secret-pass" not in str(summary)
    assert "test-api-key" not in str(summary)


def test_blank_secrets_keep_existing_configuration(tmp_path: Path) -> None:
    root = _project(tmp_path)
    service = SetupService(root)
    (root / ".env").write_text("OPENAI_API_KEY=existing\n", encoding="utf-8")
    service.save(SetupRequest(brain="openai"))
    assert "OPENAI_API_KEY=existing" in (root / ".env").read_text(encoding="utf-8")


def test_local_config_supplies_wifi_without_exposing_password(tmp_path: Path) -> None:
    root = _project(tmp_path)
    root.joinpath("stackchan.local.json").write_text(
        json.dumps(
            {
                "wifi_ssid": "Local WiFi 2G",
                "wifi_password": "local-secret",
                "server_host": "192.168.1.30",
            }
        ),
        encoding="utf-8",
    )
    service = SetupService(root)

    summary = service.summary(brain="echo")
    assert summary["default_wifi_ssid"] == "Local WiFi 2G"
    assert summary["suggested_ip"] == "192.168.1.30"
    assert summary["local_configured"] is True
    assert "local-secret" not in str(summary)

    service.save(SetupRequest(brain="echo", wifi_ssid="Local WiFi 2G"))
    firmware = (root / "firmware" / "include" / "config.h").read_text(encoding="utf-8")
    assert 'WIFI_SSID_H "Local WiFi 2G"' in firmware
    assert 'WIFI_PASSWORD_H "local-secret"' in firmware


def test_different_wifi_does_not_reuse_local_password(tmp_path: Path) -> None:
    root = _project(tmp_path)
    root.joinpath("stackchan.local.json").write_text(
        json.dumps({"wifi_ssid": "Local WiFi", "wifi_password": "local-secret"}),
        encoding="utf-8",
    )
    service = SetupService(root)
    with pytest.raises(ValueError, match="両方入力"):
        service.save(SetupRequest(brain="echo", wifi_ssid="Other WiFi"))


async def test_firmware_job_requires_saved_wifi_config(tmp_path: Path) -> None:
    service = SetupService(_project(tmp_path))
    with pytest.raises(RuntimeError, match="Wi-Fi"):
        await service.start_job(FirmwareJobRequest(action="build"))


def test_setup_api_writes_only_to_selected_project(tmp_path: Path) -> None:
    root = _project(tmp_path)
    application = create_application(
        settings=Settings(brain="echo"),
        project_root=root,
    )
    client = TestClient(application.fastapi)

    status = client.get("/api/setup")
    assert status.status_code == 200
    assert status.json()["firmware_configured"] is False

    response = client.post(
        "/api/setup/save",
        json={
            "brain": "echo",
            "openai_api_key": "",
            "wifi_ssid": "Test WiFi",
            "wifi_password": "not-a-real-secret",
            "server_host": "192.168.1.20",
            "server_port": 8000,
        },
    )
    assert response.status_code == 200
    assert (root / "firmware" / "include" / "config.h").exists()
    assert (root / ".env").read_text(encoding="utf-8") == "STACKCHAN_AVATAR_BRAIN=echo\n"
