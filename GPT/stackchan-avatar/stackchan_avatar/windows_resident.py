from __future__ import annotations

import ctypes
import json
import logging
import logging.handlers
import os
import subprocess
import sys
import threading
import time
import urllib.error
import urllib.request
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
logger = logging.getLogger(__name__)


class InstanceLock:
    """Windowsがプロセス終了時にも解放する、ポート単位の二重起動防止。"""

    def __init__(self, port: int) -> None:
        from ctypes import wintypes

        self.kernel = ctypes.WinDLL("kernel32", use_last_error=True)
        self.kernel.CreateMutexW.argtypes = [ctypes.c_void_p, wintypes.BOOL, wintypes.LPCWSTR]
        self.kernel.CreateMutexW.restype = wintypes.HANDLE
        self.kernel.CloseHandle.argtypes = [wintypes.HANDLE]
        self.kernel.CloseHandle.restype = wintypes.BOOL
        self.handle = self.kernel.CreateMutexW(None, False, f"Local\\StackChanAvatar-{port}")
        error = ctypes.get_last_error()
        if not self.handle:
            raise ctypes.WinError(error)
        self.already_running = error == 183  # ERROR_ALREADY_EXISTS

    def close(self) -> None:
        if self.handle:
            self.kernel.CloseHandle(self.handle)
            self.handle = None


def open_when_ready(port: int, *, timeout: float = 30) -> bool:
    url = f"http://127.0.0.1:{port}"
    deadline = time.monotonic() + timeout
    # localhostの確認に環境変数のHTTPプロキシを使わない。
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    while time.monotonic() < deadline:
        try:
            with opener.open(f"{url}/api/status", timeout=1) as response:
                status = json.load(response)
            if status.get("ok") is True and "connected_devices" in status:
                webbrowser.open(url)
                return True
        except (OSError, ValueError, urllib.error.URLError):
            pass
        time.sleep(0.2)
    return False


def configure_logging(root: Path = ROOT) -> None:
    directory = root / "logs"
    directory.mkdir(exist_ok=True)
    handler = logging.handlers.RotatingFileHandler(
        directory / "server.log", maxBytes=2_000_000, backupCount=3, encoding="utf-8"
    )
    handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s"))
    logging.basicConfig(level=logging.INFO, handlers=[handler], force=True)
    # pythonwではstdout/stderrがNone。uvicornのコンソール設定を使わない。
    for name in ("uvicorn", "uvicorn.error", "uvicorn.access"):
        logger = logging.getLogger(name)
        logger.handlers.clear()
        logger.propagate = True


def main(*, open_browser: bool = False) -> int:
    if os.name != "nt":
        raise RuntimeError("This launcher requires Windows")
    os.chdir(ROOT)
    os.environ.setdefault("PYTHONUTF8", "1")
    configure_logging(ROOT)
    lock = None
    try:
        from .__main__ import main as run_server
        from .config import Settings

        settings = Settings()
        lock = InstanceLock(settings.port)
        if lock.already_running:
            if open_browser:
                open_when_ready(settings.port)
            return 0
        logger.info("Starting StackChan Avatar on port %d", settings.port)
        if open_browser:
            threading.Thread(target=open_when_ready, args=(settings.port,), daemon=True).start()
        run_server(settings=settings, log_config=None)
        logger.info("StackChan Avatar stopped normally")
        return 0
    except Exception:
        logger.exception("StackChan Avatar failed")
        return 1
    finally:
        if lock:
            lock.close()


def supervise(*, restart_delay: float = 60, max_restarts: int = 3) -> int:
    """pythonw子プロセスの異常終了を監視。ユーザーの正常終了は尊重する。"""
    os.chdir(ROOT)
    (ROOT / "logs").mkdir(exist_ok=True)
    handler = logging.handlers.RotatingFileHandler(
        ROOT / "logs/supervisor.log", maxBytes=500_000, backupCount=1, encoding="utf-8"
    )
    handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s: %(message)s"))
    monitor = logging.getLogger("stackchan.supervisor")
    monitor.handlers = [handler]
    monitor.setLevel(logging.INFO)
    monitor.propagate = False
    try:
        for attempt in range(max_restarts + 1):
            monitor.info("Starting server (attempt %d/%d)", attempt + 1, max_restarts + 1)
            result = subprocess.run(
                [sys.executable, "-X", "utf8", "-m", "stackchan_avatar.windows_resident"],
                cwd=ROOT,
                check=False,
                creationflags=subprocess.CREATE_NO_WINDOW,
            )
            if result.returncode == 0:
                monitor.info("Server stopped normally; not restarting")
                return 0
            monitor.error("Server exited with code %d", result.returncode)
            if attempt < max_restarts:
                monitor.info("Restarting in %s seconds", restart_delay)
                time.sleep(restart_delay)
        monitor.error("Restart limit reached; inspect server.log and start manually")
        return 1
    except OSError:
        monitor.exception("Supervisor failed")
        return 1
    finally:
        monitor.removeHandler(handler)
        handler.close()


if __name__ == "__main__":
    raise SystemExit(main())
