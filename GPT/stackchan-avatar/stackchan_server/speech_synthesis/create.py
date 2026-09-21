from stackchan_server.types import SpeechSynthesizer


def create_speech_synthesizer() -> SpeechSynthesizer:
    from stackchan_avatar.openai_audio import OpenAISpeechSynthesizer

    return OpenAISpeechSynthesizer()
