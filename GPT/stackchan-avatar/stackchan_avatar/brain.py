from __future__ import annotations

import asyncio
import os
from collections import deque
from typing import Protocol, runtime_checkable


@runtime_checkable
class Brain(Protocol):
    async def reply(self, text: str) -> str: ...


class EchoBrain:
    """APIキーなしで通信経路を確認するための頭脳。"""

    async def reply(self, text: str) -> str:
        return f"「{text.strip()}」って聞こえたよ。通信は成功！"


class OpenAIBrain:
    def __init__(
        self,
        *,
        model: str | None = None,
        system_prompt: str,
        max_history_turns: int = 6,
        max_reply_chars: int = 180,
        client: object | None = None,
    ) -> None:
        self.model = model or os.getenv("OPENAI_CHAT_MODEL", "gpt-5.6-luna")
        self.system_prompt = system_prompt
        self.max_reply_chars = max_reply_chars
        self._history: deque[dict[str, str]] = deque(maxlen=max_history_turns * 2)
        self._client = client
        self._lock = asyncio.Lock()

    def _get_client(self):
        if self._client is None:
            from openai import OpenAI

            self._client = OpenAI()
        return self._client

    async def reply(self, text: str) -> str:
        clean_text = text.strip()
        if not clean_text:
            return "もう一度話してみてね。"

        async with self._lock:
            messages = [*self._history, {"role": "user", "content": clean_text}]
            response = await asyncio.to_thread(
                self._get_client().responses.create,
                model=self.model,
                instructions=self.system_prompt,
                input=messages,
                max_output_tokens=180,
                store=False,
            )
            answer = (response.output_text or "").strip()
            if not answer:
                answer = "うまく答えを作れなかったよ。もう一度お願い。"
            answer = answer[: self.max_reply_chars]
            self._history.append({"role": "user", "content": clean_text})
            self._history.append({"role": "assistant", "content": answer})
            return answer


def create_brain(settings) -> Brain:
    if settings.brain.lower() == "echo":
        return EchoBrain()
    if settings.brain.lower() == "openai":
        return OpenAIBrain(
            system_prompt=settings.system_prompt,
            max_history_turns=settings.max_history_turns,
            max_reply_chars=settings.max_reply_chars,
        )
    raise ValueError(f"Unknown STACKCHAN_AVATAR_BRAIN: {settings.brain}")


__all__ = ["Brain", "EchoBrain", "OpenAIBrain", "create_brain"]
