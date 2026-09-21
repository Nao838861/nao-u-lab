from __future__ import annotations

from fastapi.testclient import TestClient

from stackchan_avatar.app import create_application
from stackchan_avatar.brain import EchoBrain
from stackchan_avatar.config import Settings
from stackchan_avatar.web_ui import page


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
    stop = client.post("/api/app/stop")
    assert stop.status_code == 501


def test_setup_page_contains_escaped_log_separator() -> None:
    assert r"join('\n')" in page()


def test_page_contains_complete_first_run_guide() -> None:
    html = page()
    assert "初回はこの順番です" in html
    assert "設定を保存" in html
    assert "本体へ書き込む" in html
    assert "本体を再起動" in html
    assert "スタックちゃん接続中" in html
