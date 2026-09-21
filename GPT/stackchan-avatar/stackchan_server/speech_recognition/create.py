from stackchan_server.types import SpeechRecognizer


def create_speech_recognizer() -> SpeechRecognizer:
    from stackchan_avatar.openai_audio import OpenAISpeechRecognizer

    return OpenAISpeechRecognizer()
