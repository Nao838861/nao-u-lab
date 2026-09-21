from __future__ import annotations

import io
import wave

from stackchan_avatar.diagnostic_audio import (
    DiagnosticSpeechRecognizer,
    DiagnosticSpeechSynthesizer,
)


async def test_diagnostic_recognizer_returns_fixed_phrase() -> None:
    recognizer = DiagnosticSpeechRecognizer()
    assert await recognizer.transcribe(b"\x00\x00") == "音声テスト"
    assert await recognizer.transcribe(b"") == ""


async def test_diagnostic_synthesizer_generates_supported_wav() -> None:
    wav_bytes = await DiagnosticSpeechSynthesizer().synthesize("テスト")
    with wave.open(io.BytesIO(wav_bytes), "rb") as wav_file:
        assert wav_file.getnchannels() == 1
        assert wav_file.getsampwidth() == 2
        assert wav_file.getframerate() == 24000
        assert wav_file.getnframes() > 0
