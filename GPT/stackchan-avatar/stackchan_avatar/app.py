from __future__ import annotations

import asyncio
import base64
from collections.abc import Callable
from pathlib import Path

from fastapi import HTTPException, Request
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, Field

from stackchan_server import StackChanApp
from stackchan_server.listen import EmptyTranscriptError, TimeoutError
from stackchan_server.ws_proxy import ServoMoveType, ServoWaitType, WsProxy

from .brain import Brain, create_brain
from .config import Settings
from .diagnostic_audio import DiagnosticSpeechRecognizer, DiagnosticSpeechSynthesizer
from .openai_audio import OpenAISpeechRecognizer, OpenAISpeechSynthesizer
from .system_setup import FirmwareJobRequest, SetupRequest, SetupService
from .web_ui import page


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

    @application.talk_session
    async def talk(proxy: WsProxy) -> None:
        try:
            user_text = await proxy.listen()
        except (EmptyTranscriptError, TimeoutError):
            return
        reply = await brain.reply(user_text, device=proxy)
        await _nod(proxy)
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
        try:
            proxy = await application.first_connected_proxy()
            reply = await brain.reply(request.text, device=proxy)
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"会話APIエラー: {exc}") from exc

        spoken = False
        if request.speak and proxy is not None:
            await _nod(proxy)
            await proxy.speak(reply)
            spoken = True
        return ChatResponse(reply=reply, spoken=spoken)

    return application


__all__ = ["ChatRequest", "ChatResponse", "VolumeRequest", "create_application"]
