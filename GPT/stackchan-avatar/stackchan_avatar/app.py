from __future__ import annotations

from fastapi import HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel, Field

from stackchan_server import StackChanApp
from stackchan_server.listen import EmptyTranscriptError, TimeoutError
from stackchan_server.ws_proxy import ServoMoveType, ServoWaitType, WsProxy

from .brain import Brain, create_brain
from .config import Settings
from .diagnostic_audio import DiagnosticSpeechRecognizer, DiagnosticSpeechSynthesizer
from .openai_audio import OpenAISpeechRecognizer, OpenAISpeechSynthesizer


class ChatRequest(BaseModel):
    text: str = Field(min_length=1, max_length=1000)
    speak: bool = True


class ChatResponse(BaseModel):
    reply: str
    spoken: bool


async def _nod(proxy: WsProxy) -> None:
    await proxy.move_servo(
        [
            (ServoMoveType.MOVE_Y, 100, 140),
            (ServoWaitType.SLEEP, 120),
            (ServoMoveType.MOVE_Y, 90, 140),
        ]
    )


def _page() -> str:
    return """<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>StackChan Avatar</title>
<style>
body{font-family:system-ui,sans-serif;max-width:720px;margin:3rem auto;padding:0 1rem;background:#fffaf2;color:#28231f}
.card{background:white;border:2px solid #28231f;border-radius:20px;padding:1.25rem;box-shadow:5px 5px 0 #f2b84b}
textarea{box-sizing:border-box;width:100%;min-height:7rem;font:inherit;padding:.8rem;border:2px solid #777;border-radius:12px}
button{font:inherit;font-weight:700;padding:.7rem 1.1rem;border:0;border-radius:999px;background:#ef6c57;color:white;cursor:pointer}
#status{font-size:.9rem;color:#655}.reply{white-space:pre-wrap;font-size:1.15rem;min-height:3rem}
</style></head><body><h1>StackChan Avatar</h1><div class="card">
<p id="status">確認中…</p><textarea id="text" placeholder="スタックちゃんに話しかける"></textarea>
<p><button id="send">話す</button></p><div id="reply" class="reply"></div></div>
<script>
const statusEl=document.querySelector('#status'), replyEl=document.querySelector('#reply');
async function refresh(){const r=await fetch('/api/status');const s=await r.json();statusEl.textContent=s.connected_devices?`スタックちゃん接続中 (${s.connected_devices}台)`: 'PC単体モード（実機未接続）';}
document.querySelector('#send').onclick=async()=>{const text=document.querySelector('#text').value.trim();if(!text)return;replyEl.textContent='考え中…';const r=await fetch('/api/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({text,speak:true})});const j=await r.json();replyEl.textContent=r.ok?j.reply:(j.detail||'エラー');refresh();};refresh();setInterval(refresh,3000);
</script></body></html>"""


def create_application(
    *,
    settings: Settings | None = None,
    brain: Brain | None = None,
    speech_recognizer=None,
    speech_synthesizer=None,
) -> StackChanApp:
    settings = settings or Settings()
    brain = brain or create_brain(settings)
    if settings.brain == "echo":
        recognizer = speech_recognizer or DiagnosticSpeechRecognizer()
        synthesizer = speech_synthesizer or DiagnosticSpeechSynthesizer()
    else:
        recognizer = speech_recognizer or OpenAISpeechRecognizer()
        synthesizer = speech_synthesizer or OpenAISpeechSynthesizer()
    application = StackChanApp(
        speech_recognizer=recognizer,
        speech_synthesizer=synthesizer,
    )

    @application.talk_session
    async def talk(proxy: WsProxy) -> None:
        try:
            user_text = await proxy.listen()
        except (EmptyTranscriptError, TimeoutError):
            return
        reply = await brain.reply(user_text)
        await _nod(proxy)
        await proxy.speak(reply)

    @application.fastapi.get("/", response_class=HTMLResponse)
    async def index() -> HTMLResponse:
        return HTMLResponse(_page())

    @application.fastapi.get("/api/status")
    async def status() -> dict[str, object]:
        devices = await application.list_connected()
        return {
            "ok": True,
            "brain": settings.brain,
            "connected_devices": len(devices),
            "devices": devices,
        }

    @application.fastapi.post("/api/chat", response_model=ChatResponse)
    async def chat(request: ChatRequest) -> ChatResponse:
        try:
            reply = await brain.reply(request.text)
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"会話APIエラー: {exc}") from exc

        spoken = False
        if request.speak:
            proxy = await application.first_connected_proxy()
            if proxy is not None:
                await _nod(proxy)
                await proxy.speak(reply)
                spoken = True
        return ChatResponse(reply=reply, spoken=spoken)

    return application


__all__ = ["ChatRequest", "ChatResponse", "create_application"]
