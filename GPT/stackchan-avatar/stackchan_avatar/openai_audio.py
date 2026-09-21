from __future__ import annotations

import asyncio
import io
import os
import wave


def _pcm_to_wav(pcm_bytes: bytes, *, sample_rate: int = 16000) -> io.BytesIO:
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(pcm_bytes)
    buffer.seek(0)
    buffer.name = "stackchan.wav"
    return buffer


class OpenAISpeechRecognizer:
    def __init__(
        self,
        *,
        model: str | None = None,
        api_key: str | None = None,
        client: object | None = None,
    ) -> None:
        self.model = model or os.getenv("OPENAI_TRANSCRIBE_MODEL", "gpt-4o-mini-transcribe")
        self.api_key = api_key
        self._client = client

    def _get_client(self):
        if self._client is None:
            from openai import OpenAI

            self._client = OpenAI(api_key=self.api_key)
        return self._client

    async def transcribe(self, pcm_bytes: bytes) -> str:
        def request() -> str:
            result = self._get_client().audio.transcriptions.create(
                model=self.model,
                file=_pcm_to_wav(pcm_bytes),
                language="ja",
            )
            return result.text

        return await asyncio.to_thread(request)


class OpenAISpeechSynthesizer:
    def __init__(
        self,
        *,
        model: str | None = None,
        voice: str | None = None,
        api_key: str | None = None,
        client: object | None = None,
    ) -> None:
        self.model = model or os.getenv("OPENAI_TTS_MODEL", "gpt-4o-mini-tts")
        self.voice = voice or os.getenv("OPENAI_TTS_VOICE", "coral")
        self.api_key = api_key
        self._client = client

    def _get_client(self):
        if self._client is None:
            from openai import OpenAI

            self._client = OpenAI(api_key=self.api_key)
        return self._client

    async def synthesize(self, text: str) -> bytes:
        def request() -> bytes:
            response = self._get_client().audio.speech.create(
                model=self.model,
                voice=self.voice,
                input=text,
                instructions="明るく親しみやすい日本語で、少しゆっくり話してください。",
                response_format="wav",
            )
            return response.read()

        return await asyncio.to_thread(request)


__all__ = ["OpenAISpeechRecognizer", "OpenAISpeechSynthesizer"]
