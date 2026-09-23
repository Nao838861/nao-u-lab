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
        self.servo_commands = []
        self.servo_waits: list[float | None] = []

    async def set_volume(self, level: int) -> int:
        self.volume = level
        return level

    async def capture_image(self):
        return SimpleNamespace(data=b"photo", mime_type="image/jpeg", width=320, height=240)

    async def move_servo(self, commands) -> None:
        self.servo_commands = list(commands)

    async def wait_servo_complete(self, timeout_seconds: float | None = 120.0) -> None:
        self.servo_waits.append(timeout_seconds)


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
    assert call["max_output_tokens"] == 600
    assert call["input"][-1] == {"role": "user", "content": "こんにちは"}
    assert call["tools"] == [{"type": "web_search", "search_context_size": "low"}]
    assert call["tool_choice"] == "auto"


@pytest.mark.asyncio
async def test_openai_brain_can_disable_web_search() -> None:
    client = FakeClient()
    brain = OpenAIBrain(
        model="test-model",
        system_prompt="短く答える",
        web_search_enabled=False,
        client=client,
    )

    await brain.reply("こんにちは")

    call = client.responses.calls[0]
    assert "tools" not in call
    assert "tool_choice" not in call


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
    first_tools = client.responses.calls[0]["tools"]
    assert first_tools[0] == {"type": "web_search", "search_context_size": "low"}
    assert any(tool.get("name") == "set_volume" for tool in first_tools)
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
    assert "80文字以内" in second_input[-1]["content"][0]["text"]
    assert second_input[-1]["content"][1]["type"] == "input_image"
    assert second_input[-1]["content"][1]["image_url"].startswith("data:image/jpeg;base64,")


@pytest.mark.asyncio
async def test_openai_brain_executes_safe_head_motion_tool() -> None:
    call = SimpleNamespace(
        type="function_call",
        name="move_head",
        arguments='{"motion": "shake", "repetitions": 2}',
        call_id="motion-1",
    )
    client = FakeClient()
    client.responses.create = lambda **kwargs: (
        client.responses.calls.append(kwargs)
        or (
            SimpleNamespace(output=[call], output_text="")
            if len(client.responses.calls) == 1
            else SimpleNamespace(output=[], output_text="首を振ったよ。")
        )
    )
    device = FakeDevice()
    brain = OpenAIBrain(model="test-model", system_prompt="短く答える", client=client)

    assert await brain.reply("首を横に振って", device=device) == "首を振ったよ。"
    move_commands = [command for command in device.servo_commands if len(command) == 3]
    assert [command[1] for command in move_commands] == [62, 118, 62, 118, 90]
    assert all(60 <= command[1] <= 120 for command in move_commands)
    assert device.servo_waits == [15.0]
    second_input = client.responses.calls[1]["input"]
    assert second_input[-1]["type"] == "function_call_output"
    assert '"motion": "shake"' in second_input[-1]["output"]
