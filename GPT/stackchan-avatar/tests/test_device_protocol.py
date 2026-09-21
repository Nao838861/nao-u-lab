from __future__ import annotations

import asyncio

import pytest

from stackchan_server.generated_protobuf import websocket_message_pb2 as pb
from stackchan_server.protobuf_ws import (
    encode_camera_capture_command_message,
    encode_volume_command_message,
    parse_websocket_message,
)
from stackchan_server.ws_proxy import WsProxy


class FakeWebSocket:
    def __init__(self) -> None:
        self.sent: list[bytes] = []

    async def send_bytes(self, data: bytes) -> None:
        self.sent.append(data)


class DummyRecognizer:
    async def transcribe(self, pcm_bytes: bytes) -> str:
        return ""


class DummySynthesizer:
    async def synthesize(self, text: str) -> bytes:
        return b""


def test_device_command_encoders() -> None:
    volume = parse_websocket_message(
        encode_volume_command_message(3, request_id=7, level=120)
    )
    assert volume.kind == pb.MESSAGE_KIND_VOLUME_CMD
    assert volume.volume_cmd.request_id == 7
    assert volume.volume_cmd.level == 120

    camera = parse_websocket_message(encode_camera_capture_command_message(4, request_id=8))
    assert camera.kind == pb.MESSAGE_KIND_CAMERA_CMD
    assert camera.camera_capture_cmd.request_id == 8


@pytest.mark.asyncio
async def test_volume_acknowledgement() -> None:
    ws = FakeWebSocket()
    proxy = WsProxy(ws, DummyRecognizer(), DummySynthesizer())
    task = asyncio.create_task(proxy.set_volume(135))
    await asyncio.sleep(0)
    command = parse_websocket_message(ws.sent[0])
    event = pb.WebSocketMessage(
        kind=pb.MESSAGE_KIND_VOLUME_EVT,
        message_type=pb.MESSAGE_TYPE_DATA,
    )
    event.volume_evt.request_id = command.volume_cmd.request_id
    event.volume_evt.level = 135
    event.volume_evt.success = True
    proxy._handle_volume_event(event)
    assert await task == 135


@pytest.mark.asyncio
async def test_camera_chunks_are_reassembled() -> None:
    ws = FakeWebSocket()
    proxy = WsProxy(ws, DummyRecognizer(), DummySynthesizer())
    task = asyncio.create_task(proxy.capture_image())
    await asyncio.sleep(0)
    command = parse_websocket_message(ws.sent[0])
    request_id = command.camera_capture_cmd.request_id

    start = pb.WebSocketMessage(
        kind=pb.MESSAGE_KIND_CAMERA_IMAGE,
        message_type=pb.MESSAGE_TYPE_START,
    )
    start.camera_image_start.request_id = request_id
    start.camera_image_start.width = 320
    start.camera_image_start.height = 240
    start.camera_image_start.total_bytes = 4
    start.camera_image_start.mime_type = "image/jpeg"
    proxy._handle_camera_image(start)

    data = pb.WebSocketMessage(
        kind=pb.MESSAGE_KIND_CAMERA_IMAGE,
        message_type=pb.MESSAGE_TYPE_DATA,
    )
    data.camera_image_data.request_id = request_id
    data.camera_image_data.image_bytes = b"jpeg"
    proxy._handle_camera_image(data)

    end = pb.WebSocketMessage(
        kind=pb.MESSAGE_KIND_CAMERA_IMAGE,
        message_type=pb.MESSAGE_TYPE_END,
    )
    end.camera_image_end.request_id = request_id
    end.camera_image_end.success = True
    proxy._handle_camera_image(end)

    image = await task
    assert image.data == b"jpeg"
    assert image.mime_type == "image/jpeg"
    assert (image.width, image.height) == (320, 240)
