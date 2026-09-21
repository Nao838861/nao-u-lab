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


class FakeDevice:
    def __init__(self) -> None:
        self.volume = 0

    async def set_volume(self, level: int) -> int:
        self.volume = level
        return level

    async def capture_image(self):
        return SimpleNamespace(data=b"photo", mime_type="image/jpeg", width=320, height=240)


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


@pytest.mark.asyncio
async def test_openai_brain_executes_volume_tool() -> None:
    call = SimpleNamespace(
        type="function_call",
        name="set_volume",
        arguments='{"level": 140}',
        call_id="volume-1",
    )
    client = FakeClient()
    client.responses.create = lambda **kwargs: (
        client.responses.calls.append(kwargs)
        or (
            SimpleNamespace(output=[call], output_text="")
            if len(client.responses.calls) == 1
            else SimpleNamespace(output=[], output_text="音量を変えたよ。")
        )
    )
    device = FakeDevice()
    brain = OpenAIBrain(model="test-model", system_prompt="短く答える", client=client)

    assert await brain.reply("音量を変えて", device=device) == "音量を変えたよ。"
    assert device.volume == 140
    second_input = client.responses.calls[1]["input"]
    assert second_input[-1]["type"] == "function_call_output"
    assert '"level": 140' in second_input[-1]["output"]


@pytest.mark.asyncio
async def test_openai_brain_attaches_captured_image_after_tool_result() -> None:
    call = SimpleNamespace(
        type="function_call",
        name="take_photo",
        arguments="{}",
        call_id="camera-1",
    )
    client = FakeClient()
    client.responses.create = lambda **kwargs: (
        client.responses.calls.append(kwargs)
        or (
            SimpleNamespace(output=[call], output_text="")
            if len(client.responses.calls) == 1
            else SimpleNamespace(output=[], output_text="赤い物が見えるよ。")
        )
    )
    brain = OpenAIBrain(model="test-model", system_prompt="短く答える", client=client)

    assert await brain.reply("何が見える？", device=FakeDevice()) == "赤い物が見えるよ。"
    second_input = client.responses.calls[1]["input"]
    assert second_input[-2]["type"] == "function_call_output"
    assert second_input[-1]["content"][1]["type"] == "input_image"
    assert second_input[-1]["content"][1]["image_url"].startswith("data:image/jpeg;base64,")
