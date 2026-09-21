from __future__ import annotations

import socket


def main() -> None:
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        try:
            sock.connect(("192.0.2.1", 80))
            address = sock.getsockname()[0]
        except OSError:
            try:
                address = socket.gethostbyname(socket.gethostname())
            except OSError as exc:
                raise SystemExit(
                    "LANアドレスを自動検出できませんでした。OSのネットワーク設定で確認してください。"
                ) from exc
    finally:
        sock.close()
    if address.startswith("127."):
        raise SystemExit(
            "LANアドレスを自動検出できませんでした。OSのネットワーク設定で確認してください。"
        )
    print(address)


if __name__ == "__main__":
    main()
