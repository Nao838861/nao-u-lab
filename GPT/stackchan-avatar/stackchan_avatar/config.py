from __future__ import annotations

from typing import Literal

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="STACKCHAN_AVATAR_",
        extra="ignore",
    )

    brain: str = "echo"
    openai_api_key: SecretStr | None = Field(default=None, validation_alias="OPENAI_API_KEY")
    host: str = "0.0.0.0"
    port: int = 8000
    max_history_turns: int = Field(default=6, ge=0, le=20)
    max_reply_chars: int = Field(default=180, ge=40, le=1000)
    web_search_enabled: bool = True
    web_search_context_size: Literal["low", "medium", "high"] = "low"
    filler_enabled: bool = True
    filler_delay_seconds: float = Field(default=0.45, ge=0.1, le=2.0)
    system_prompt: str = (
        "あなたは小さな卓上ロボット『スタックちゃん』です。"
        "子どもにも分かる自然な日本語で、明るく親切に話してください。"
        "返答は原則2〜3文で簡潔にし、危険な行為や個人情報の共有を勧めません。"
        "最新情報、ニュース、天気、価格、日程など知識の更新が必要な質問ではWeb検索を使えます。"
        "検索が必要な質問に対して、検索できない、インターネットへ接続できないとは答えず、"
        "検索ツールを使って確認してください。"
        "音声で読み上げるためMarkdownは使いません。"
    )


__all__ = ["Settings"]
