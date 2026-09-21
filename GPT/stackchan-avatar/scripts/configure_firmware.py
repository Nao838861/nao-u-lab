from __future__ import annotations

import argparse
import ipaddress
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / "firmware" / "include" / "config.template.h"
OUTPUT = ROOT / "firmware" / "include" / "config.h"


def _c_string(value: str) -> str:
    return value.replace("\\", "\\\\").replace('"', '\\"')


def main() -> None:
    parser = argparse.ArgumentParser(description="K151ファームの接続設定を生成します")
    parser.add_argument("--ssid", required=True)
    parser.add_argument("--password", required=True)
    parser.add_argument("--server-host", required=True, help="PCのLAN IPv4アドレス")
    parser.add_argument("--server-port", type=int, default=8000)
    parser.add_argument("--output", type=Path, default=OUTPUT)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    try:
        address = ipaddress.ip_address(args.server_host)
    except ValueError:
        parser.error("--server-host はPCのLAN IPv4アドレスで指定してください")
    if address.version != 4:
        parser.error("--server-host はPCのLAN IPv4アドレスで指定してください")
    if not 1 <= args.server_port <= 65535:
        parser.error("--server-port は1〜65535で指定してください")
    if args.output.exists() and not args.force:
        parser.error(f"{args.output} は既にあります。上書きする場合は --force を付けてください")

    text = TEMPLATE.read_text(encoding="utf-8")
    text = text.replace("__SSID__", _c_string(args.ssid))
    text = text.replace("__PASSWORD__", _c_string(args.password))
    text = text.replace('SERVER_HOST_H "192.168.1.179"', f'SERVER_HOST_H "{args.server_host}"')
    text = text.replace("SERVER_PORT_H 8000", f"SERVER_PORT_H {args.server_port}")
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(text, encoding="utf-8")
    print(f"generated: {args.output}")


if __name__ == "__main__":
    main()
