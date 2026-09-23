from __future__ import annotations

import asyncio
from typing import Any

import pytest
from fastapi.testclient import TestClient

from stackchan_avatar.app import (
    _reply_with_optional_filler,
    _select_filler,
    create_application,
)
from stackchan_avatar.brain import EchoBrain
from stackchan_avatar.config import Settings
from stackchan_avatar.web_ui import page
from stackchan_server.listen import TimeoutError as ListenTimeoutError
from stackchan_server.ws_proxy import FirmwareState


class DummyRecognizer:
    async def transcribe(self, pcm_bytes: bytes) -> str:
        return "テスト"


class DummySynthesizer:
    async def synthesize(self, text: str) -> bytes:
        return b""


class RecordingBrain:
    def __init__(self, events: list[str]) -> None:
        self.events = events

    async def reply(self, text: str, *, device: Any = None) -> str:
        del device
        self.events.append(f"reply:{text}")
        return "返事"


class SlowBrain:
    async def reply(self, text: str, *, device: Any = None) -> str:
        del text, device
        await asyncio.sleep(0.03)
        return "検索結果"


class RecordingTalkProxy:
    def __init__(self, events: list[str]) -> None:
        self.events = events
        self.listen_count = 0

    async def listen(self) -> str:
        self.listen_count += 1
        if self.listen_count > 1:
            self.events.append("follow-up-listening")
            raise ListenTimeoutError
        self.events.append("recognition-complete")
        return "こんにちは"

    async def move_servo(self, commands: Any) -> None:
        del commands
        self.events.append("nod")

    async def wait_servo_complete(self, timeout_seconds: float | None = 120.0) -> None:
        del timeout_seconds
        self.events.append("nod-complete")

    async def speak(self, text: str) -> None:
        self.events.append(f"speak:{text}")

    async def send_state_command(self, state: FirmwareState) -> None:
        self.events.append(f"state:{state.name.lower()}")


@pytest.mark.asyncio
async def test_nod_marks_recognition_completion_before_reply_generation() -> None:
    events: list[str] = []
    application = create_application(
        settings=Settings(brain="echo"),
        brain=RecordingBrain(events),
        speech_recognizer=DummyRecognizer(),
        speech_synthesizer=DummySynthesizer(),
    )
    assert application._talk_session_fn is not None

    await application._talk_session_fn(RecordingTalkProxy(events))  # type: ignore[arg-type]

    assert events == [
        "recognition-complete",
        "nod",
        "nod-complete",
        "reply:こんにちは",
        "speak:返事",
        "follow-up-listening",
    ]


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
    assert "PC設定だけ保存（転送しない）" in html
    assert "本体へ書き込む" in html
    assert "本体を再起動" in html
    assert "スタックちゃん接続中" in html
    assert "ファームの再書き込みは不要です" in html
    assert "本体未接続でも実行できます" in html
    assert "この音量にする" in html
    assert "静止画を1枚撮る" in html
    assert "発話を中止して次の音声入力を待ちます" in html
    assert "音量を0にすると口パクも止まります" in html
    assert "近くの話し声を基準に自動調整します" in html
    assert "返答を話し終えた後は15秒間" in html


def test_select_filler_by_intent() -> None:
    assert _select_filler("今日のニュースを調べて") == "うん、ちょっと調べてみるね。"
    assert _select_filler("目の前を見て") == "うん、ちょっと見てみるね。"
    assert _select_filler("右を向いて") == "うん、やってみるね。"
    assert _select_filler("量子力学とは？") == "うーん、ちょっと考えるね。"


@pytest.mark.asyncio
async def test_slow_reply_speaks_filler_while_reply_continues() -> None:
    events: list[str] = []
    proxy = RecordingTalkProxy(events)

    reply = await _reply_with_optional_filler(
        brain=SlowBrain(),  # type: ignore[arg-type]
        proxy=proxy,  # type: ignore[arg-type]
        user_text="今日のニュースを調べて",
        enabled=True,
        delay_seconds=0.001,
    )

    assert reply == "検索結果"
    assert events == [
        "speak:うん、ちょっと調べてみるね。",
        "state:thinking",
    ]


@pytest.mark.asyncio
async def test_fast_reply_skips_filler() -> None:
    events: list[str] = []
    proxy = RecordingTalkProxy(events)
    brain = RecordingBrain(events)

    reply = await _reply_with_optional_filler(
        brain=brain,
        proxy=proxy,  # type: ignore[arg-type]
        user_text="こんにちは",
        enabled=True,
        delay_seconds=0.1,
    )

    assert reply == "返事"
    assert events == ["reply:こんにちは"]
