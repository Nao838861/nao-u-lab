from __future__ import annotations

from types import SimpleNamespace

import pytest

from stackchan_avatar.brain import EchoBrain, OpenAIBrain


class FakeResponses:
    def __init__(self) -> None:
        self.calls: list[dict[str, object]] = []

    def create(self, **kwargs):
        self.calls.append(kwargs)
        return SimpleNamespace(output_text="やあ、ぼくはスタックちゃんだよ。")


class FakeClient:
    def __init__(self) -> None:
        self.responses = FakeResponses()


@pytest.mark.asyncio
async def test_echo_brain() -> None:
    assert await EchoBrain().reply("こんにちは") == "「こんにちは」って聞こえたよ。通信は成功！"


@pytest.mark.asyncio
async def test_openai_brain_uses_responses_without_storage() -> None:
    client = FakeClient()
    brain = OpenAIBrain(
        model="test-model",
        system_prompt="短く答える",
        client=client,
    )

    assert await brain.reply("こんにちは") == "やあ、ぼくはスタックちゃんだよ。"
    call = client.responses.calls[0]
    assert call["model"] == "test-model"
    assert call["store"] is False
    assert call["input"][-1] == {"role": "user", "content": "こんにちは"}
