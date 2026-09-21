from __future__ import annotations

import argparse
import asyncio

from websockets.asyncio.client import connect

from stackchan_server.generated_protobuf import websocket_message_pb2 as pb
from stackchan_server.protobuf_ws import parse_websocket_message


def message(kind: int, body_name: str, *, seq: int = 1) -> bytes:
    item = pb.WebSocketMessage(kind=kind, message_type=pb.MESSAGE_TYPE_DATA, seq=seq)
    body = getattr(item, body_name)
    if body_name == "firmware_metadata":
        body.device_type = pb.DEVICE_TYPE_M5STACK_CORES3
        body.display_width = 320
        body.display_height = 240
        body.has_device_wake_word = True
        body.has_led = True
        body.servo_type = pb.SERVO_TYPE_SCS0009
        body.supports_audio_duplex = False
        body.firmware_version = "mock-0.1"
    elif body_name in ("speak_done_evt", "servo_done_evt"):
        body.done = True
    return item.SerializeToString()


async def run(url: str) -> None:
    async with connect(url) as websocket:
        await websocket.send(message(pb.MESSAGE_KIND_FIRMWARE_METADATA, "firmware_metadata"))
        print(f"mock StackChan connected: {url}")
        while True:
            raw = await websocket.recv()
            if isinstance(raw, str):
                print("server json:", raw)
                continue
            item = parse_websocket_message(raw)
            body = item.WhichOneof("body")
            print("server command:", body)
            if body == "servo_cmd":
                await asyncio.sleep(0.1)
                await websocket.send(message(pb.MESSAGE_KIND_SERVO_DONE_EVT, "servo_done_evt"))
            elif body == "audio_wav_end":
                await asyncio.sleep(0.1)
                await websocket.send(message(pb.MESSAGE_KIND_SPEAK_DONE_EVT, "speak_done_evt"))


def main() -> None:
    parser = argparse.ArgumentParser(description="実機なしでPCサーバとの接続を確認します")
    parser.add_argument("--url", default="ws://127.0.0.1:8000/ws/stackchan")
    args = parser.parse_args()
    asyncio.run(run(args.url))


if __name__ == "__main__":
    main()
