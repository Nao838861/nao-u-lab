from __future__ import annotations

import asyncio
import os
from collections import deque
from collections.abc import Sequence
from contextlib import suppress
from dataclasses import dataclass
from enum import IntEnum, StrEnum
from logging import getLogger
from pathlib import Path
from typing import Any, Literal, TypeAlias

from fastapi import WebSocket, WebSocketDisconnect
from google.protobuf.message import DecodeError
from pydantic_settings import BaseSettings, SettingsConfigDict

from . import __version__
from .generated_protobuf import websocket_message_pb2 as _ws_pb2
from .listen import EmptyTranscriptError, ListenHandler, TimeoutError
from .protobuf_ws import (
    encode_camera_capture_command_message,
    encode_server_metadata_message,
    encode_servo_command_message,
    encode_state_command_message,
    encode_volume_command_message,
    parse_websocket_message,
)
from .speak import SpeakHandler
from .static import LISTEN_AUDIO_FORMAT
from .types import SpeechRecognizer, SpeechSynthesizer

logger = getLogger(__name__)

ws_pb2: Any = _ws_pb2

_BASE_DIR = Path(__file__).resolve().parent
_RECORDINGS_DIR = _BASE_DIR / "recordings"

_DOWN_WAV_CHUNK = 4096  # bytes per WebSocket frame for synthesized audio (raw PCM)
_DOWN_SEGMENT_MILLIS = 500  # 小分けにして、PCMストリームの先頭から早く再生する
_DOWN_SEGMENT_STAGGER_MILLIS = (
    _DOWN_SEGMENT_MILLIS // 2
)  # half interval for the second segment start
_LISTEN_AUDIO_TIMEOUT_SECONDS = 10.0
_DEBUG_RECORDING_ENABLED = os.getenv("DEBUG_RECODING") == "1"


class _WakeWordServerConfig(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="STACKCHAN_")

    no_use_client_wakeup_word: bool = False
    use_open_wake_word: bool = False


_WAKEWORD_SERVER_CONFIG = _WakeWordServerConfig()


class FirmwareState(IntEnum):
    IDLE = 0
    LISTENING = 1
    THINKING = 2
    SPEAKING = 3


class ServoMoveType(StrEnum):
    MOVE_X = "move_x"
    MOVE_Y = "move_y"


class ServoWaitType(StrEnum):
    SLEEP = "sleep"


ServoMoveCommand: TypeAlias = tuple[Literal["move_x", "move_y"] | ServoMoveType, int, int]
ServoSleepCommand: TypeAlias = tuple[Literal["sleep"] | ServoWaitType, int]
ServoCommand: TypeAlias = ServoMoveCommand | ServoSleepCommand


@dataclass(frozen=True)
class FirmwareMetadata:
    device_type: int
    display_width: int
    display_height: int
    has_device_wake_word: bool
    has_led: bool
    servo_type: int
    supports_audio_duplex: bool
    firmware_version: str
    has_camera: bool
    supports_volume: bool


@dataclass(frozen=True)
class CapturedImage:
    data: bytes
    mime_type: str
    width: int
    height: int


@dataclass
class _CameraSession:
    future: asyncio.Future[CapturedImage]
    data: bytearray
    mime_type: str = ""
    width: int = 0
    height: int = 0
    expected_bytes: int = 0


@dataclass(frozen=True)
class ServerMetadata:
    has_server_wake_word: bool
    server_version: str


class WsProxy:
    def __init__(
        self,
        websocket: WebSocket,
        speech_recognizer: SpeechRecognizer,
        speech_synthesizer: SpeechSynthesizer,
    ):
        self.ws = websocket
        self.speech_recognizer = speech_recognizer
        self.speech_synthesizer = speech_synthesizer
        self.recordings_dir = _RECORDINGS_DIR
        self._debug_recording = _DEBUG_RECORDING_ENABLED
        if self._debug_recording:
            _RECORDINGS_DIR.mkdir(parents=True, exist_ok=True)
            self.recordings_dir.mkdir(parents=True, exist_ok=True)
        self._wakeword_event = asyncio.Event()
        self._listener = ListenHandler(
            speech_recognizer=self.speech_recognizer,
            recordings_dir=self.recordings_dir,
            debug_recording=self._debug_recording,
            listen_audio_timeout_seconds=_LISTEN_AUDIO_TIMEOUT_SECONDS,
        )
        self._speaker = SpeakHandler(
            websocket=self.ws,
            down_wav_chunk=_DOWN_WAV_CHUNK,
            down_segment_millis=_DOWN_SEGMENT_MILLIS,
            down_segment_stagger_millis=_DOWN_SEGMENT_STAGGER_MILLIS,
            sample_width=LISTEN_AUDIO_FORMAT.sample_width,
            speech_synthesizer=self.speech_synthesizer,
            recordings_dir=self.recordings_dir,
            debug_recording=self._debug_recording,
        )

        self._receiving_task: asyncio.Task | None = None
        self._closed = False

        self.firmware_metadata: FirmwareMetadata | None = None
        self.server_metadata = ServerMetadata(
            has_server_wake_word=False,
            server_version=__version__,
        )

        self._down_seq = 0
        self._current_firmware_state: FirmwareState = FirmwareState.IDLE
        self._servo_done_counter = 0
        self._servo_sent_counter = 0
        self._pending_servo_wait_targets: deque[int] = deque()
        self._device_request_id = 1
        self._volume_waiters: dict[int, asyncio.Future[int]] = {}
        self._camera_sessions: dict[int, _CameraSession] = {}

    @property
    def closed(self) -> bool:
        return self._closed

    @property
    def current_state(self) -> FirmwareState:
        return self._current_firmware_state

    @property
    def receive_task(self) -> asyncio.Task | None:
        return self._receiving_task

    def trigger_wakeword(self) -> None:
        """Web API から擬似的に WAKEWORD_EVT を発火させる。"""
        logger.info("Triggered wakeword via API")
        self._wakeword_event.set()

    async def wait_for_talk_session(self) -> None:
        while True:
            if self._wakeword_event.is_set():
                self._wakeword_event.clear()
                return
            if self._closed:
                raise WebSocketDisconnect()
            await asyncio.sleep(0.05)

    async def listen(self) -> str:
        return await self._listener.listen(
            send_state_command=self.send_state_command,
            is_closed=lambda: self._closed,
            idle_state=FirmwareState.IDLE,
            listening_state=FirmwareState.LISTENING,
        )

    async def speak(self, text: str) -> None:
        await self._speaker.speak(
            text,
            next_seq=self._next_down_seq,
            send_state_command=self.send_state_command,
            idle_state=FirmwareState.IDLE,
            is_closed=lambda: self._closed,
            should_reset_to_idle=lambda: self.current_state == FirmwareState.SPEAKING,
        )

    async def send_state_command(self, state_id: int | FirmwareState) -> None:
        await self._send_state_command(state_id)

    async def reset_state(self) -> None:
        await self.send_state_command(FirmwareState.IDLE)

    async def move_servo(self, commands: Sequence[ServoCommand]) -> None:
        previous_counter = self._servo_sent_counter
        target_counter = previous_counter + 1
        self._servo_sent_counter = target_counter
        self._pending_servo_wait_targets.append(target_counter)
        try:
            await self.ws.send_bytes(encode_servo_command_message(self._next_down_seq(), commands))
        except Exception:
            if (
                self._pending_servo_wait_targets
                and self._pending_servo_wait_targets[-1] == target_counter
            ):
                self._pending_servo_wait_targets.pop()
            self._servo_sent_counter = previous_counter
            raise

    async def set_volume(self, level: int, *, timeout_seconds: float = 5.0) -> int:
        if self.firmware_metadata and not self.firmware_metadata.supports_volume:
            raise RuntimeError("このスタックちゃんはPCからの音量変更に対応していません")
        safe_level = max(0, min(230, int(level)))
        request_id = self._next_device_request_id()
        future: asyncio.Future[int] = asyncio.get_running_loop().create_future()
        self._volume_waiters[request_id] = future
        try:
            await self.ws.send_bytes(
                encode_volume_command_message(
                    self._next_down_seq(), request_id=request_id, level=safe_level
                )
            )
            return await asyncio.wait_for(future, timeout_seconds)
        finally:
            self._volume_waiters.pop(request_id, None)

    async def capture_image(self, *, timeout_seconds: float = 12.0) -> CapturedImage:
        if self.firmware_metadata and not self.firmware_metadata.has_camera:
            raise RuntimeError("このスタックちゃんはカメラ撮影に対応していません")
        request_id = self._next_device_request_id()
        future: asyncio.Future[CapturedImage] = asyncio.get_running_loop().create_future()
        self._camera_sessions[request_id] = _CameraSession(future=future, data=bytearray())
        try:
            await self.ws.send_bytes(
                encode_camera_capture_command_message(
                    self._next_down_seq(), request_id=request_id
                )
            )
            return await asyncio.wait_for(future, timeout_seconds)
        finally:
            self._camera_sessions.pop(request_id, None)

    async def wait_servo_complete(self, timeout_seconds: float | None = 120.0) -> None:
        target_counter = (
            self._pending_servo_wait_targets.popleft()
            if self._pending_servo_wait_targets
            else self._servo_done_counter + 1
        )
        await self._wait_for_counter(
            current=lambda: self._servo_done_counter,
            min_counter=target_counter,
            timeout_seconds=timeout_seconds,
            is_closed=lambda: self._closed,
            label="servo completed event",
        )

    async def start(self) -> None:
        if self._receiving_task is None:
            self._receiving_task = asyncio.create_task(self._receive_loop())

    async def close(self) -> None:
        self._closed = True
        for future in self._volume_waiters.values():
            if not future.done():
                future.set_exception(RuntimeError("スタックちゃんとの接続が切れました"))
        for session in self._camera_sessions.values():
            if not session.future.done():
                session.future.set_exception(RuntimeError("スタックちゃんとの接続が切れました"))
        if self._receiving_task:
            self._receiving_task.cancel()
            with suppress(asyncio.CancelledError):
                await self._receiving_task
        await self._listener.close()

    async def start_talking(self, text: str) -> None:
        await self.speak(text)

    async def _receive_loop(self) -> None:
        try:
            while True:
                raw_message = await self.ws.receive_bytes()
                try:
                    message = parse_websocket_message(raw_message)
                except DecodeError:
                    await self.ws.close(code=1003, reason="invalid protobuf message")
                    break

                if message.kind == ws_pb2.MESSAGE_KIND_AUDIO_PCM:
                    body_name = message.WhichOneof("body")

                    if (
                        message.message_type == ws_pb2.MESSAGE_TYPE_START
                        and body_name == "audio_pcm_start"
                    ):
                        if not await self._listener.handle_start(self.ws):
                            break
                        continue

                    if (
                        message.message_type == ws_pb2.MESSAGE_TYPE_DATA
                        and body_name == "audio_pcm_data"
                    ):
                        payload = bytes(message.audio_pcm_data.pcm_bytes)
                        if not await self._listener.handle_data(self.ws, len(payload), payload):
                            break
                        continue

                    if (
                        message.message_type == ws_pb2.MESSAGE_TYPE_END
                        and body_name == "audio_pcm_end"
                    ):
                        await self._listener.handle_end(
                            self.ws,
                            payload_bytes=0,
                            payload=b"",
                            send_state_command=self.send_state_command,
                            thinking_state=FirmwareState.THINKING,
                        )
                        continue

                    await self.ws.close(code=1003, reason="unknown PCM protobuf body")
                    break

                if message.kind == ws_pb2.MESSAGE_KIND_WAKE_WORD_EVT:
                    self._handle_wakeword_event(message)
                    continue

                if message.kind == ws_pb2.MESSAGE_KIND_FIRMWARE_METADATA:
                    await self._handle_firmware_metadata(message)
                    continue

                if message.kind == ws_pb2.MESSAGE_KIND_STATE_EVT:
                    self._handle_state_event(message)
                    continue

                if message.kind == ws_pb2.MESSAGE_KIND_SPEAK_DONE_EVT:
                    self._handle_speak_done_event(message)
                    continue

                if message.kind == ws_pb2.MESSAGE_KIND_SERVO_DONE_EVT:
                    self._handle_servo_done_event(message)
                    continue

                if message.kind == ws_pb2.MESSAGE_KIND_VOLUME_EVT:
                    self._handle_volume_event(message)
                    continue

                if message.kind == ws_pb2.MESSAGE_KIND_CAMERA_IMAGE:
                    self._handle_camera_image(message)
                    continue

                await self.ws.close(code=1003, reason="unsupported kind")
                break
        except WebSocketDisconnect:
            pass
        finally:
            self._closed = True

    def _handle_wakeword_event(self, message: Any) -> None:
        if message.message_type != ws_pb2.MESSAGE_TYPE_DATA:
            return
        if message.WhichOneof("body") != "wake_word_evt":
            return
        if not message.wake_word_evt.detected:
            return
        logger.info("Received wakeword event")
        self._wakeword_event.set()

    async def _handle_firmware_metadata(self, message: Any) -> None:
        if message.message_type != ws_pb2.MESSAGE_TYPE_DATA:
            return
        if message.WhichOneof("body") != "firmware_metadata":
            return

        metadata = message.firmware_metadata
        self.firmware_metadata = FirmwareMetadata(
            device_type=int(metadata.device_type),
            display_width=int(metadata.display_width),
            display_height=int(metadata.display_height),
            has_device_wake_word=bool(metadata.has_device_wake_word),
            has_led=bool(metadata.has_led),
            servo_type=int(metadata.servo_type),
            supports_audio_duplex=bool(metadata.supports_audio_duplex),
            firmware_version=metadata.firmware_version,
            has_camera=bool(metadata.has_camera),
            supports_volume=bool(metadata.supports_volume),
        )
        logger.info(
            "Received firmware metadata device_type=%d display=%dx%d wakeword=%s led=%s servo_type=%d duplex=%s version=%s",
            self.firmware_metadata.device_type,
            self.firmware_metadata.display_width,
            self.firmware_metadata.display_height,
            self.firmware_metadata.has_device_wake_word,
            self.firmware_metadata.has_led,
            self.firmware_metadata.servo_type,
            self.firmware_metadata.supports_audio_duplex,
            self.firmware_metadata.firmware_version,
        )
        self.server_metadata = self._build_server_metadata(self.firmware_metadata)
        await self.ws.send_bytes(
            encode_server_metadata_message(
                self._next_down_seq(),
                has_server_wake_word=self.server_metadata.has_server_wake_word,
                server_version=self.server_metadata.server_version,
            )
        )

    def _build_server_metadata(self, firmware_metadata: FirmwareMetadata) -> ServerMetadata:
        should_use_server_wake_word = _WAKEWORD_SERVER_CONFIG.use_open_wake_word and (
            _WAKEWORD_SERVER_CONFIG.no_use_client_wakeup_word
            or not firmware_metadata.has_device_wake_word
        )
        return ServerMetadata(
            has_server_wake_word=should_use_server_wake_word,
            server_version=__version__,
        )

    def _handle_state_event(self, message: Any) -> None:
        if message.message_type != ws_pb2.MESSAGE_TYPE_DATA:
            return
        if message.WhichOneof("body") != "state_evt":
            return
        raw_state = int(message.state_evt.state)
        try:
            state = FirmwareState(raw_state)
            self._current_firmware_state = state
            if state == FirmwareState.LISTENING and self._speaker.speaking:
                self._speaker.handle_speak_cancel_event()
            logger.info("Received firmware state=%s(%d)", state.name, raw_state)
        except ValueError:
            logger.info("Received firmware state=%d", raw_state)

    def _handle_speak_done_event(self, message: Any) -> None:
        if message.message_type != ws_pb2.MESSAGE_TYPE_DATA:
            return
        if message.WhichOneof("body") != "speak_done_evt":
            return
        if not message.speak_done_evt.done:
            return
        self._speaker.handle_speak_done_event()

    def _handle_servo_done_event(self, message: Any) -> None:
        if message.message_type != ws_pb2.MESSAGE_TYPE_DATA:
            return
        if message.WhichOneof("body") != "servo_done_evt":
            return
        if not message.servo_done_evt.done:
            return
        self._servo_done_counter += 1
        logger.info("Received servo done event")

    def _handle_volume_event(self, message: Any) -> None:
        if message.message_type != ws_pb2.MESSAGE_TYPE_DATA:
            return
        if message.WhichOneof("body") != "volume_evt":
            return
        event = message.volume_evt
        future = self._volume_waiters.get(int(event.request_id))
        if future is None or future.done():
            return
        if event.success:
            future.set_result(int(event.level))
        else:
            future.set_exception(RuntimeError("音量を変更できませんでした"))

    def _handle_camera_image(self, message: Any) -> None:
        body_name = message.WhichOneof("body")
        if body_name == "camera_image_start":
            start = message.camera_image_start
            session = self._camera_sessions.get(int(start.request_id))
            if session is None or session.future.done():
                return
            total_bytes = int(start.total_bytes)
            if total_bytes <= 0 or total_bytes > 512_000:
                session.future.set_exception(RuntimeError("カメラ画像のサイズが不正です"))
                return
            session.mime_type = start.mime_type
            session.width = int(start.width)
            session.height = int(start.height)
            session.expected_bytes = total_bytes
            return
        if body_name == "camera_image_data":
            chunk = message.camera_image_data
            session = self._camera_sessions.get(int(chunk.request_id))
            if session is None or session.future.done():
                return
            session.data.extend(bytes(chunk.image_bytes))
            if len(session.data) > session.expected_bytes or len(session.data) > 512_000:
                session.future.set_exception(RuntimeError("カメラ画像が上限を超えました"))
            return
        if body_name == "camera_image_end":
            end = message.camera_image_end
            session = self._camera_sessions.get(int(end.request_id))
            if session is None or session.future.done():
                return
            if not end.success:
                session.future.set_exception(RuntimeError(end.error or "撮影に失敗しました"))
            elif session.expected_bytes != len(session.data):
                session.future.set_exception(RuntimeError("カメラ画像を最後まで受信できませんでした"))
            else:
                session.future.set_result(
                    CapturedImage(
                        data=bytes(session.data),
                        mime_type=session.mime_type or "image/jpeg",
                        width=session.width,
                        height=session.height,
                    )
                )

    async def _send_state_command(self, state_id: int | FirmwareState) -> None:
        await self.ws.send_bytes(encode_state_command_message(self._next_down_seq(), int(state_id)))

    async def _wait_for_counter(
        self,
        *,
        current,
        min_counter: int,
        timeout_seconds: float | None,
        is_closed,
        label: str,
    ) -> None:
        loop = asyncio.get_running_loop()
        deadline = (loop.time() + timeout_seconds) if timeout_seconds else None
        while True:
            if current() >= min_counter:
                return
            if is_closed():
                raise WebSocketDisconnect()
            if deadline and loop.time() >= deadline:
                raise TimeoutError(f"Timed out waiting for {label}")
            await asyncio.sleep(0.05)

    def _next_down_seq(self) -> int:
        seq = self._down_seq
        self._down_seq += 1
        return seq

    def _next_device_request_id(self) -> int:
        request_id = self._device_request_id
        self._device_request_id = 1 if request_id >= 0xFFFFFFFF else request_id + 1
        return request_id


__all__ = [
    "CapturedImage",
    "EmptyTranscriptError",
    "FirmwareMetadata",
    "FirmwareState",
    "ServerMetadata",
    "ServoCommand",
    "ServoMoveType",
    "ServoWaitType",
    "TimeoutError",
    "WsProxy",
]
