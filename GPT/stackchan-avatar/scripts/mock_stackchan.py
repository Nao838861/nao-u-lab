from __future__ import annotations

import argparse
import asyncio
import base64

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
        body.has_camera = True
        body.supports_volume = True
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
            elif body == "volume_cmd":
                response = pb.WebSocketMessage(
                    kind=pb.MESSAGE_KIND_VOLUME_EVT,
                    message_type=pb.MESSAGE_TYPE_DATA,
                    seq=item.seq,
                )
                response.volume_evt.request_id = item.volume_cmd.request_id
                response.volume_evt.level = item.volume_cmd.level
                response.volume_evt.success = True
                await websocket.send(response.SerializeToString())
            elif body == "camera_capture_cmd":
                png = base64.b64decode(
                    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwC"
                    "AAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII="
                )
                request_id = item.camera_capture_cmd.request_id
                start = pb.WebSocketMessage(
                    kind=pb.MESSAGE_KIND_CAMERA_IMAGE,
                    message_type=pb.MESSAGE_TYPE_START,
                    seq=item.seq,
                )
                start.camera_image_start.request_id = request_id
                start.camera_image_start.width = 1
                start.camera_image_start.height = 1
                start.camera_image_start.total_bytes = len(png)
                start.camera_image_start.mime_type = "image/png"
                await websocket.send(start.SerializeToString())
                data = pb.WebSocketMessage(
                    kind=pb.MESSAGE_KIND_CAMERA_IMAGE,
                    message_type=pb.MESSAGE_TYPE_DATA,
                    seq=item.seq,
                )
                data.camera_image_data.request_id = request_id
                data.camera_image_data.image_bytes = png
                await websocket.send(data.SerializeToString())
                end = pb.WebSocketMessage(
                    kind=pb.MESSAGE_KIND_CAMERA_IMAGE,
                    message_type=pb.MESSAGE_TYPE_END,
                    seq=item.seq,
                )
                end.camera_image_end.request_id = request_id
                end.camera_image_end.success = True
                await websocket.send(end.SerializeToString())


def main() -> None:
    parser = argparse.ArgumentParser(description="実機なしでPCサーバとの接続を確認します")
    parser.add_argument("--url", default="ws://127.0.0.1:8000/ws/stackchan")
    args = parser.parse_args()
    asyncio.run(run(args.url))


if __name__ == "__main__":
    main()
