from __future__ import annotations

import io
import math
import struct
import wave


class DiagnosticSpeechRecognizer:
    """Return a fixed phrase so the audio transport can be tested without an API key."""

    async def transcribe(self, pcm_bytes: bytes) -> str:
        if not pcm_bytes:
            return ""
        return "音声テスト"


class DiagnosticSpeechSynthesizer:
    """Generate a short two-note WAV used by the API-free diagnostic mode."""

    def __init__(self, *, sample_rate: int = 24000) -> None:
        self.sample_rate = sample_rate

    async def synthesize(self, text: str) -> bytes:
        del text
        duration_seconds = 0.34
        frame_count = int(self.sample_rate * duration_seconds)
        frames = bytearray()
        for frame in range(frame_count):
            progress = frame / frame_count
            frequency = 659.25 if progress < 0.5 else 783.99
            envelope = min(1.0, frame / (self.sample_rate * 0.02))
            envelope *= min(1.0, (frame_count - frame) / (self.sample_rate * 0.04))
            sample = int(
                8000 * envelope * math.sin(2 * math.pi * frequency * frame / self.sample_rate)
            )
            frames.extend(struct.pack("<h", sample))

        buffer = io.BytesIO()
        with wave.open(buffer, "wb") as wav_file:
            wav_file.setnchannels(1)
            wav_file.setsampwidth(2)
            wav_file.setframerate(self.sample_rate)
            wav_file.writeframes(frames)
        return buffer.getvalue()


__all__ = ["DiagnosticSpeechRecognizer", "DiagnosticSpeechSynthesizer"]
