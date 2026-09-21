from __future__ import annotations

import asyncio
import base64
import json
import os
from collections import deque
from typing import Any, Protocol, runtime_checkable


class DeviceController(Protocol):
    async def set_volume(self, level: int) -> int: ...

    async def capture_image(self) -> Any: ...


DEVICE_TOOLS = [
    {
        "type": "function",
        "name": "set_volume",
        "description": (
            "スタックちゃん本体のスピーカー音量を変更する。"
            "0は消音、120前後が普通、230が安全上限。200を超える値は明示的に頼まれた時だけ使う。"
        ),
        "parameters": {
            "type": "object",
            "properties": {
                "level": {"type": "integer", "minimum": 0, "maximum": 230},
            },
            "required": ["level"],
            "additionalProperties": False,
        },
        "strict": True,
    },
    {
        "type": "function",
        "name": "take_photo",
        "description": (
            "ユーザーが見て、撮って、カメラなどと明示的に頼んだ時だけ、"
            "スタックちゃん正面のカメラで静止画を1枚撮る。"
        ),
        "parameters": {
            "type": "object",
            "properties": {},
            "required": [],
            "additionalProperties": False,
        },
        "strict": True,
    },
]


@runtime_checkable
class Brain(Protocol):
    async def reply(self, text: str, *, device: DeviceController | None = None) -> str: ...


class EchoBrain:
    """APIキーなしで通信経路を確認するための頭脳。"""

    async def reply(self, text: str, *, device: DeviceController | None = None) -> str:
        del device
        return f"「{text.strip()}」って聞こえたよ。通信は成功！"


class OpenAIBrain:
    def __init__(
        self,
        *,
        model: str | None = None,
        api_key: str | None = None,
        system_prompt: str,
        max_history_turns: int = 6,
        max_reply_chars: int = 180,
        client: object | None = None,
    ) -> None:
        self.model = model or os.getenv("OPENAI_CHAT_MODEL", "gpt-5.6-luna")
        self.api_key = api_key
        self.system_prompt = system_prompt
        self.max_reply_chars = max_reply_chars
        self._history: deque[dict[str, str]] = deque(maxlen=max_history_turns * 2)
        self._client = client
        self._lock = asyncio.Lock()

    def _get_client(self):
        if self._client is None:
            from openai import OpenAI

            self._client = OpenAI(api_key=self.api_key)
        return self._client

    async def reply(self, text: str, *, device: DeviceController | None = None) -> str:
        clean_text = text.strip()
        if not clean_text:
            return "もう一度話してみてね。"

        async with self._lock:
            messages: list[Any] = [*self._history, {"role": "user", "content": clean_text}]
            response = await self._create_response(messages, device=device)
            for _ in range(3):
                calls = [
                    item
                    for item in getattr(response, "output", [])
                    if getattr(item, "type", "") == "function_call"
                ]
                if not calls:
                    break
                messages.extend(getattr(response, "output", []))
                for call in calls:
                    await self._execute_tool(call, messages, device=device)
                response = await self._create_response(messages, device=device)
            answer = (response.output_text or "").strip()
            if not answer:
                answer = "うまく答えを作れなかったよ。もう一度お願い。"
            answer = answer[: self.max_reply_chars]
            self._history.append({"role": "user", "content": clean_text})
            self._history.append({"role": "assistant", "content": answer})
            return answer

    async def _create_response(
        self, messages: list[Any], *, device: DeviceController | None
    ) -> Any:
        kwargs: dict[str, Any] = {
            "model": self.model,
            "instructions": self.system_prompt,
            "input": messages,
            "max_output_tokens": 180,
            "store": False,
        }
        if device is not None:
            kwargs["tools"] = DEVICE_TOOLS
        return await asyncio.to_thread(self._get_client().responses.create, **kwargs)

    async def _execute_tool(
        self,
        call: Any,
        messages: list[Any],
        *,
        device: DeviceController | None,
    ) -> None:
        image_message: dict[str, Any] | None = None
        if device is None:
            result = {"ok": False, "error": "スタックちゃん本体が接続されていません"}
        else:
            try:
                arguments = json.loads(call.arguments or "{}")
                if call.name == "set_volume":
                    applied = await device.set_volume(int(arguments["level"]))
                    result = {"ok": True, "level": applied}
                elif call.name == "take_photo":
                    photo = await device.capture_image()
                    result = {
                        "ok": True,
                        "width": photo.width,
                        "height": photo.height,
                    }
                    encoded = base64.b64encode(photo.data).decode("ascii")
                    image_message = {
                        "role": "user",
                        "content": [
                            {
                                "type": "input_text",
                                "text": "要求に応じて今撮影した画像です。見える範囲だけ答えてください。",
                            },
                            {
                                "type": "input_image",
                                "image_url": f"data:{photo.mime_type};base64,{encoded}",
                                "detail": "low",
                            },
                        ],
                    }
                else:
                    result = {"ok": False, "error": "未対応の操作です"}
            except Exception as exc:  # noqa: BLE001 - tool failures are returned to the model
                result = {"ok": False, "error": str(exc)}
        messages.append(
            {
                "type": "function_call_output",
                "call_id": call.call_id,
                "output": json.dumps(result, ensure_ascii=False),
            }
        )
        if image_message is not None:
            messages.append(image_message)


def create_brain(settings) -> Brain:
    if settings.brain.lower() == "echo":
        return EchoBrain()
    if settings.brain.lower() == "openai":
        api_key = (
            settings.openai_api_key.get_secret_value() if settings.openai_api_key else None
        )
        return OpenAIBrain(
            api_key=api_key,
            system_prompt=settings.system_prompt,
            max_history_turns=settings.max_history_turns,
            max_reply_chars=settings.max_reply_chars,
        )
    raise ValueError(f"Unknown STACKCHAN_AVATAR_BRAIN: {settings.brain}")


__all__ = ["DEVICE_TOOLS", "Brain", "DeviceController", "EchoBrain", "OpenAIBrain", "create_brain"]
