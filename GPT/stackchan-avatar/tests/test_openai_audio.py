from __future__ import annotations

import io
import wave
from types import SimpleNamespace

from stackchan_avatar.openai_audio import (
    OpenAISpeechSynthesizer,
    _pcm_to_wav,
    _text_for_speech,
)


def test_pcm_to_wav_has_expected_format() -> None:
    pcm = b"\x00\x00" * 160
    buffer = _pcm_to_wav(pcm)
    assert buffer.name == "stackchan.wav"
    with wave.open(io.BytesIO(buffer.read()), "rb") as wav_file:
        assert wav_file.getnchannels() == 1
        assert wav_file.getsampwidth() == 2
        assert wav_file.getframerate() == 16000
        assert wav_file.readframes(160) == pcm


def test_text_for_speech_keeps_source_name_without_reading_url() -> None:
    text = "料金は5セントです。 ([OpenAI Docs](https://developers.openai.com/pricing))"

    spoken = _text_for_speech(text)

    assert spoken == "料金は5セントです。 (OpenAI Docs)"
    assert "https://" not in spoken


def test_openai_streaming_speech_format_is_raw_24khz_pcm() -> None:
    audio_format = OpenAISpeechSynthesizer(api_key="test").output_format

    assert audio_format.sample_rate_hz == 24000
    assert audio_format.channels == 1
    assert audio_format.sample_width == 2


async def test_openai_speech_stream_yields_pcm_chunks() -> None:
    calls: list[dict[str, object]] = []

    class FakeResponse:
        async def iter_bytes(self, chunk_size: int):
            assert chunk_size == 4096
            yield b"first"
            yield b"second"

    class FakeContextManager:
        async def __aenter__(self):
            return FakeResponse()

        async def __aexit__(self, exc_type, exc, traceback):
            return False

    class FakeCreate:
        def create(self, **kwargs):
            calls.append(kwargs)
            return FakeContextManager()

    synthesizer = OpenAISpeechSynthesizer(api_key="test")
    synthesizer._async_client = SimpleNamespace(
        audio=SimpleNamespace(
            speech=SimpleNamespace(
                with_streaming_response=FakeCreate(),
            )
        )
    )

    chunks = [chunk async for chunk in synthesizer.synthesize_stream("こんにちは")]

    assert chunks == [b"first", b"second"]
    assert calls[0]["response_format"] == "pcm"
    assert calls[0]["input"] == "こんにちは"
