from __future__ import annotations

from fastapi.testclient import TestClient

from stackchan_avatar.app import create_application
from stackchan_avatar.brain import EchoBrain
from stackchan_avatar.config import Settings


class DummyRecognizer:
    async def transcribe(self, pcm_bytes: bytes) -> str:
        return "テスト"


class DummySynthesizer:
    async def synthesize(self, text: str) -> bytes:
        return b""


def test_browser_chat_without_device() -> None:
    application = create_application(
        settings=Settings(brain="echo"),
        brain=EchoBrain(),
        speech_recognizer=DummyRecognizer(),
        speech_synthesizer=DummySynthesizer(),
    )
    client = TestClient(application.fastapi)

    status = client.get("/api/status")
    assert status.status_code == 200
    assert status.json()["connected_devices"] == 0

    response = client.post("/api/chat", json={"text": "こんにちは", "speak": True})
    assert response.status_code == 200
    assert response.json() == {
        "reply": "「こんにちは」って聞こえたよ。通信は成功！",
        "spoken": False,
    }
