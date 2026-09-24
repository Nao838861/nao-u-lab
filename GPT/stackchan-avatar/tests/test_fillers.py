from __future__ import annotations

import asyncio

import pytest

from stackchan_avatar.app import _reply_with_optional_filler
from stackchan_avatar.fillers import FILLERS, FillerSelector, classify_intent


@pytest.mark.parametrize(
    "text,intent",
    [
        ("今日のニュースを調べて", "news"),
        ("悲しいニュースを教えて", "news"),
        ("ニュースを見て悲しい", "sad"),
        ("疲れた。明日の天気を教えて", "weather"),
        ("明日の天気を教えて", "weather"),
        ("午後は雨が降る？", "weather"),
        ("いま傘は必要？", "weather"),
        ("現在の株価を教えて", "price"),
        ("この商品の値段は？", "price"),
        ("イベントの開催日は？", "schedule"),
        ("これはいつ発売された？", "schedule"),
        ("この件を調べてくれる？", "search"),
        ("目の前に何がある？", "vision"),
        ("写真を撮って", "vision"),
        ("写真の撮り方を教えて", "howto"),
        ("カメラの仕組みを教えて", "explain"),
        ("目の前を見て", "vision"),
        ("右を向いて", "motion"),
        ("首が痛い", None),
        ("首の筋肉の仕組みを教えて", "explain"),
        ("首を振って", "motion"),
        ("声をもっと小さくして", "volume"),
        ("音量を１２０にして", "volume"),
        ("音量を下げないで", None),
        ("音量の仕組みを教えて", "explain"),
        ("今日は疲れた", "tired"),
        ("今日は楽しかった", "happy"),
        ("今日、悲しいことがあった", "sad"),
        ("試験のことが心配", "anxious"),
        ("今日は疲れてないよ", "general"),
        ("疲れた日におすすめの曲は？", "recommend"),
        ("心配という言葉の意味は？", "explain"),
        ("悲しい物語を作って", "creative"),
        ("パソコンが動かない", "troubleshoot"),
        ("不安定な接続を直したい", "troubleshoot"),
        ("首が動かない", "troubleshoot"),
        ("AとBの違いを教えて", "compare"),
        ("おすすめの料理は？", "recommend"),
        ("旅行の計画を立てて", "plan"),
        ("ゲームの作り方を教えて", "howto"),
        ("量子力学とは？", "explain"),
        ("ニュースとは何？", "explain"),
        ("天気って何？", "explain"),
        ("なぜ空は青いの？", "reason"),
        ("どうして天気は変わるの？", "reason"),
        ("１２＋３を計算して", "calculate"),
        ("名前を考えて", "creative"),
        ("これを翻訳して", "translate"),
        ("「右を向いて」を英語で言って", "translate"),
        ("もう少し詳しく教えて", "detail"),
        ("さっきの話をもう一度お願い", "repeat"),
        ("別の方法を考えて", "alternative"),
        ("その考えをどう思う？", "opinion"),
        ("昨日、映画を見てきたんだ", "conversation"),
        ("こんにちは！", None),
        ("ありがとうございます。", None),
        ("うん", None),
        ("静かにして", None),
        ("ちょっと静かに", None),
        ("首の動きを止めて", None),
        ("カメラを使わないで", None),
        ("急いで教えて", None),
        ("助けて、息ができない", None),
        ("写真を撮らないで", None),
    ],
)
def test_intent_uses_request_context_not_a_single_keyword(text: str, intent: str | None) -> None:
    assert classify_intent(text) == intent


def test_repeated_questions_rotate_without_getting_stuck_after_history_fills() -> None:
    selector = FillerSelector()
    heard = [selector.select("明日の天気を教えて") for _ in range(36)]
    for start in range(len(heard) - 5):
        assert len(set(heard[start:start + 6])) == 6


def test_switching_topics_does_not_reset_previous_phrases() -> None:
    selector = FillerSelector()
    first = selector.select("今日のニュースは？")
    selector.select("明日の天気は？")
    assert selector.select("今のニュースを調べて") != first
    assert selector.select("ありがとう") is None


def test_phrases_are_short_and_do_not_use_hesitation_or_claim_completed_actions() -> None:
    for phrases in FILLERS.values():
        assert len(set(phrases)) == len(phrases)
        for text in phrases:
            assert len(text) <= 25
            assert not any(term in text for term in ("えーと", "うーん", "調べたよ", "撮ったよ", "変更したよ"))


class WaitingBrain:
    def __init__(self) -> None:
        self.cancelled = False

    async def reply(self, text: str, *, device=None) -> str:
        try:
            await asyncio.sleep(0.04)
            return "本回答"
        except asyncio.CancelledError:
            self.cancelled = True
            raise


class QuietProxy:
    def __init__(self) -> None:
        self.spoken: list[str] = []

    async def speak(self, text: str) -> None:
        self.spoken.append(text)

    async def send_state_command(self, state) -> None:
        pass


async def test_slow_greeting_does_not_force_a_filler() -> None:
    proxy = QuietProxy()
    reply = await _reply_with_optional_filler(
        brain=WaitingBrain(), proxy=proxy, user_text="ありがとう", enabled=True, delay_seconds=0.001
    )
    assert reply == "本回答"
    assert proxy.spoken == []


async def test_filler_failure_cancels_background_answer() -> None:
    class FailedProxy(QuietProxy):
        async def speak(self, text: str) -> None:
            raise RuntimeError("Device disconnected")

    brain = WaitingBrain()
    with pytest.raises(RuntimeError, match="Device disconnected"):
        await _reply_with_optional_filler(
            brain=brain, proxy=FailedProxy(), user_text="明日の天気は？", enabled=True,
            delay_seconds=0.001,
        )
    assert brain.cancelled
