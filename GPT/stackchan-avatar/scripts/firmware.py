from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path

ENVIRONMENT = "m5stack-official-stackchan"
ROOT = Path(__file__).resolve().parents[1]


def run(*args: str) -> None:
    command = [sys.executable, "-m", "platformio", *args]
    environment = os.environ.copy()
    environment.setdefault("PLATFORMIO_CORE_DIR", str(ROOT / ".platformio-core"))
    environment.setdefault("PLATFORMIO_SETTING_ENABLE_TELEMETRY", "no")
    print("+", " ".join(command))
    subprocess.run(command, check=True, env=environment)


def main() -> None:
    parser = argparse.ArgumentParser(description="K151カスタムファーム操作")
    parser.add_argument("action", choices=("build", "upload", "monitor"))
    parser.add_argument("--port", help="例: COM4 または /dev/cu.usbmodem1101")
    args = parser.parse_args()

    if args.action == "build":
        run("run", "-e", ENVIRONMENT)
    elif args.action == "upload":
        command = ["run", "-e", ENVIRONMENT, "-t", "upload"]
        if args.port:
            command.extend(("--upload-port", args.port))
        run(*command)
    else:
        command = ["device", "monitor", "--baud", "115200"]
        if args.port:
            command.extend(("--port", args.port))
        run(*command)


if __name__ == "__main__":
    main()
