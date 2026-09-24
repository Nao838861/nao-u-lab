from __future__ import annotations

import asyncio
import base64
from collections.abc import Callable
from logging import getLogger
from pathlib import Path

from fastapi import HTTPException, Request
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, Field

from stackchan_server import StackChanApp
from stackchan_server.listen import EmptyTranscriptError, TimeoutError
from stackchan_server.ws_proxy import (
    FirmwareState,
    ServoMoveType,
    ServoWaitType,
    WsProxy,
)

from .brain import Brain, create_brain
from .config import Settings
from .diagnostic_audio import DiagnosticSpeechRecognizer, DiagnosticSpeechSynthesizer
from .fillers import FillerSelector
from .openai_audio import OpenAISpeechRecognizer, OpenAISpeechSynthesizer
from .system_setup import FirmwareJobRequest, SetupRequest, SetupService
from .web_ui import page

logger = getLogger(__name__)

def _select_filler(text: str) -> str | None:
    return FillerSelector().select(text)


async def _reply_with_optional_filler(
    *,
    brain: Brain,
    proxy: WsProxy,
    user_text: str,
    enabled: bool,
    delay_seconds: float,
    filler_selector: FillerSelector | None = None,
) -> str:
    reply_task = asyncio.create_task(brain.reply(user_text, device=proxy))
    try:
        if not enabled:
            return await reply_task

        done, _pending = await asyncio.wait({reply_task}, timeout=delay_seconds)
        if reply_task not in done:
            filler = (filler_selector or FillerSelector()).select(user_text)
            if filler is not None:
                await proxy.speak(filler)
                # フィラーの再生完了でファームはIdleへ戻る。本回答の音声開始を受け付けるよう
                # Thinkingへ戻してから、並行実行中の回答を待つ。
                await proxy.send_state_command(FirmwareState.THINKING)
        return await reply_task
    finally:
        # タップによる中断や音声送信失敗で、返答生成だけを孤立させない。
        if not reply_task.done():
            reply_task.cancel()
        await asyncio.gather(reply_task, return_exceptions=True)


async def _apply_initial_volume(
    proxy: WsProxy,
    level: int,
    *,
    metadata_timeout_seconds: float = 3.0,
) -> None:
    """接続直後の能力交換を待ち、対応機だけサーバ設定の音量へ揃える。"""
    loop = asyncio.get_running_loop()
    deadline = loop.time() + metadata_timeout_seconds
    while proxy.firmware_metadata is None and not proxy.closed and loop.time() < deadline:
        await asyncio.sleep(0.05)

    metadata = proxy.firmware_metadata
    if metadata is None:
        logger.warning("Initial volume skipped: firmware metadata was not received")
        return
    if not metadata.supports_volume:
        logger.info("Initial volume skipped: firmware does not support volume commands")
        return

    try:
        applied = await proxy.set_volume(level)
    except Exception:  # 音量失敗だけで会話接続を切らない
        logger.warning("Initial volume command failed", exc_info=True)
        return
    logger.info("Applied initial speaker volume=%d", applied)


class ChatRequest(BaseModel):
    text: str = Field(min_length=1, max_length=1000)
    speak: bool = True


class ChatResponse(BaseModel):
    reply: str
    spoken: bool


class VolumeRequest(BaseModel):
    level: int = Field(ge=0, le=230)


async def _nod(proxy: WsProxy) -> None:
    await proxy.move_servo(
        [
            (ServoMoveType.MOVE_Y, 100, 140),
            (ServoWaitType.SLEEP, 120),
            (ServoMoveType.MOVE_Y, 90, 140),
        ]
    )
    await proxy.wait_servo_complete(timeout_seconds=3.0)


def _require_local(request: Request) -> None:
    host = request.client.host if request.client else ""
    if host not in {"127.0.0.1", "::1", "testclient"}:
        raise HTTPException(status_code=403, detail="設定操作はこのPCからだけ実行できます")


def create_application(
    *,
    settings: Settings | None = None,
    brain: Brain | None = None,
    speech_recognizer=None,
    speech_synthesizer=None,
    project_root: Path | None = None,
    stop_callback: Callable[[], None] | None = None,
) -> StackChanApp:
    settings = settings or Settings()
    brain = brain or create_brain(settings)
    if settings.brain == "echo":
        recognizer = speech_recognizer or DiagnosticSpeechRecognizer()
        synthesizer = speech_synthesizer or DiagnosticSpeechSynthesizer()
    else:
        api_key = (
            settings.openai_api_key.get_secret_value() if settings.openai_api_key else None
        )
        recognizer = speech_recognizer or OpenAISpeechRecognizer(api_key=api_key)
        synthesizer = speech_synthesizer or OpenAISpeechSynthesizer(api_key=api_key)
    application = StackChanApp(
        speech_recognizer=recognizer,
        speech_synthesizer=synthesizer,
    )
    setup_service = SetupService(project_root or Path(__file__).resolve().parents[1])
    filler_selector = FillerSelector()

    @application.setup
    async def setup_device(proxy: WsProxy) -> None:
        await _apply_initial_volume(proxy, settings.initial_volume)

    @application.talk_session
    async def talk(proxy: WsProxy) -> None:
        while True:
            try:
                user_text = await proxy.listen()
            except (EmptyTranscriptError, TimeoutError):
                return
            await _nod(proxy)
            reply = await _reply_with_optional_filler(
                brain=brain,
                proxy=proxy,
                user_text=user_text,
                enabled=settings.brain.lower() == "openai" and settings.filler_enabled,
                delay_seconds=settings.filler_delay_seconds,
                filler_selector=filler_selector,
            )
            await proxy.speak(reply)

    @application.fastapi.get("/", response_class=HTMLResponse)
    async def index() -> HTMLResponse:
        return HTMLResponse(page())

    @application.fastapi.get("/api/setup")
    async def setup_status(request: Request) -> dict[str, object]:
        _require_local(request)
        return setup_service.summary(brain=settings.brain)

    @application.fastapi.post("/api/setup/save")
    async def setup_save(request: Request, body: SetupRequest) -> dict[str, object]:
        _require_local(request)
        try:
            setup_service.save(body)
        except (TypeError, ValueError) as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        return {
            "ok": True,
            "restart_required": body.brain != settings.brain or bool(body.openai_api_key),
        }

    @application.fastapi.post("/api/firmware/start")
    async def firmware_start(request: Request, body: FirmwareJobRequest) -> dict[str, object]:
        _require_local(request)
        try:
            await setup_service.start_job(body)
        except RuntimeError as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc
        return setup_service.job_status()

    @application.fastapi.get("/api/firmware/job")
    async def firmware_job(request: Request) -> dict[str, object]:
        _require_local(request)
        return setup_service.job_status()

    @application.fastapi.post("/api/app/stop")
    async def stop_app(request: Request) -> dict[str, bool]:
        _require_local(request)
        if setup_service.job_status()["running"]:
            raise HTTPException(status_code=409, detail="ファーム処理の完了後に終了してください")
        if stop_callback is None:
            raise HTTPException(status_code=501, detail="この起動方法では画面から終了できません")
        asyncio.get_running_loop().call_later(0.3, stop_callback)
        return {"ok": True}

    @application.fastapi.get("/api/status")
    async def status() -> dict[str, object]:
        devices = await application.list_connected()
        proxy = await application.first_connected_proxy()
        metadata = proxy.firmware_metadata if proxy else None
        return {
            "ok": True,
            "brain": settings.brain,
            "web_search_enabled": settings.web_search_enabled,
            "connected_devices": len(devices),
            "devices": devices,
            "has_camera": bool(metadata and metadata.has_camera),
            "supports_volume": bool(metadata and metadata.supports_volume),
        }

    @application.fastapi.post("/api/device/volume")
    async def device_volume(request: Request, body: VolumeRequest) -> dict[str, object]:
        _require_local(request)
        proxy = await application.first_connected_proxy()
        if proxy is None:
            raise HTTPException(status_code=409, detail="スタックちゃんが接続されていません")
        try:
            level = await proxy.set_volume(body.level)
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"音量変更に失敗しました: {exc}") from exc
        return {"ok": True, "level": level}

    @application.fastapi.post("/api/device/camera")
    async def device_camera(request: Request) -> dict[str, object]:
        _require_local(request)
        proxy = await application.first_connected_proxy()
        if proxy is None:
            raise HTTPException(status_code=409, detail="スタックちゃんが接続されていません")
        try:
            photo = await proxy.capture_image()
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"撮影に失敗しました: {exc}") from exc
        encoded = base64.b64encode(photo.data).decode("ascii")
        return {
            "ok": True,
            "width": photo.width,
            "height": photo.height,
            "image_url": f"data:{photo.mime_type};base64,{encoded}",
        }

    @application.fastapi.post("/api/chat", response_model=ChatResponse)
    async def chat(request: ChatRequest) -> ChatResponse:
        proxy = await application.first_connected_proxy()
        try:
            if request.speak and proxy is not None:
                await proxy.send_state_command(FirmwareState.THINKING)
            reply = await brain.reply(request.text, device=proxy)
        except Exception as exc:
            if request.speak and proxy is not None:
                await proxy.reset_state()
            raise HTTPException(status_code=502, detail=f"会話APIエラー: {exc}") from exc

        spoken = False
        if request.speak and proxy is not None:
            await proxy.speak(reply)
            proxy.trigger_wakeword()
            spoken = True
        return ChatResponse(reply=reply, spoken=spoken)

    return application


__all__ = [
    "ChatRequest",
    "ChatResponse",
    "VolumeRequest",
    "_apply_initial_volume",
    "_reply_with_optional_filler",
    "_select_filler",
    "create_application",
]
