from __future__ import annotations

import io
import wave

from stackchan_avatar.openai_audio import _pcm_to_wav


def test_pcm_to_wav_has_expected_format() -> None:
    pcm = b"\x00\x00" * 160
    buffer = _pcm_to_wav(pcm)
    assert buffer.name == "stackchan.wav"
    with wave.open(io.BytesIO(buffer.read()), "rb") as wav_file:
        assert wav_file.getnchannels() == 1
        assert wav_file.getsampwidth() == 2
        assert wav_file.getframerate() == 16000
        assert wav_file.readframes(160) == pcm
