from __future__ import annotations

import json
import os
import socket
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from types import SimpleNamespace

import pytest

from stackchan_avatar import windows_resident

pytestmark = pytest.mark.skipif(sys.platform != "win32", reason="Windows pythonw integration")


@pytest.mark.parametrize("codes,expected,waits", [([1, 0], 0, 1), ([1, 1, 1, 1], 1, 3), ([0], 0, 0)])
def test_supervisor_retries_failures_but_honors_normal_stop(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch, codes: list[int], expected: int, waits: int
) -> None:
    exits = iter(codes)
    delays = []
    monkeypatch.chdir(tmp_path)
    monkeypatch.setattr(windows_resident, "ROOT", tmp_path)
    monkeypatch.setattr(
        windows_resident.subprocess, "run", lambda *a, **kw: SimpleNamespace(returncode=next(exits))
    )
    monkeypatch.setattr(windows_resident.time, "sleep", delays.append)
    assert windows_resident.supervise() == expected
    assert delays == [60] * waits
    assert next(exits, None) is None


def test_pythonw_start_duplicate_stop_and_startup_failure(tmp_path: Path) -> None:
    pythonw = Path(sys.executable).with_name("pythonw.exe")
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        port = sock.getsockname()[1]
    env = {
        **os.environ,
        "STACKCHAN_AVATAR_HOST": "127.0.0.1",
        "STACKCHAN_AVATAR_PORT": str(port),
        "STACKCHAN_AVATAR_BRAIN": "echo",
    }
    code = (
        "import sys; from pathlib import Path; "
        "import stackchan_avatar.windows_resident as r; "
        "r.ROOT=Path(sys.argv[1]); sys.exit(r.main())"
    )
    command = [str(pythonw), "-X", "utf8", "-c", code, str(tmp_path)]
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    url = f"http://127.0.0.1:{port}"
    process = subprocess.Popen(command, env=env)
    try:
        deadline = time.monotonic() + 20
        while True:
            try:
                with opener.open(url + "/api/status", timeout=1) as response:
                    assert json.load(response)["brain"] == "echo"
                break
            except urllib.error.URLError:
                assert process.poll() is None, (tmp_path / "logs/server.log").read_text()
                assert time.monotonic() < deadline
                time.sleep(0.1)
        duplicate = subprocess.run(command, env=env, timeout=10, check=False)
        assert duplicate.returncode == 0
        assert process.poll() is None
        with opener.open(
            urllib.request.Request(url + "/api/app/stop", method="POST"), timeout=5
        ) as response:
            assert json.load(response)["ok"]
        assert process.wait(timeout=15) == 0
        log = (tmp_path / "logs/server.log").read_text(encoding="utf-8")
        assert log.count("Starting StackChan Avatar on port") == 1
        assert "stopped normally" in log
    finally:
        if process.poll() is None:
            process.terminate()
            process.wait(timeout=10)

    failed = subprocess.run(
        command, env={**env, "STACKCHAN_AVATAR_PORT": "invalid-port"}, timeout=10, check=False
    )
    assert failed.returncode != 0
    assert "StackChan Avatar failed" in (tmp_path / "logs/server.log").read_text(encoding="utf-8")
