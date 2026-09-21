from __future__ import annotations

import subprocess
import sys
from pathlib import Path


def test_firmware_config_generation(tmp_path: Path) -> None:
    root = Path(__file__).resolve().parents[1]
    template = root / "firmware" / "include" / "config.template.h"
    assert "__SSID__" in template.read_text(encoding="utf-8")

    output = tmp_path / "config.h"

    subprocess.run(
        [
            sys.executable,
            str(root / "scripts" / "configure_firmware.py"),
            "--ssid",
            '家の"WiFi',
            "--password",
            "secret\\pass",
            "--server-host",
            "192.168.1.20",
            "--output",
            str(output),
        ],
        check=True,
        capture_output=True,
        text=True,
    )
    generated = output.read_text(encoding="utf-8")
    assert '#define WIFI_SSID_H "家の\\"WiFi"' in generated
    assert '#define WIFI_PASSWORD_H "secret\\\\pass"' in generated
    assert '#define SERVER_HOST_H "192.168.1.20"' in generated
