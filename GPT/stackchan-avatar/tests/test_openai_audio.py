from __future__ import annotations

import io
import wave

from stackchan_avatar.openai_audio import _pcm_to_wav, _text_for_speech


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
