from __future__ import annotations

from pathlib import Path

from stackchan_avatar.brain import OpenAIBrain, create_brain
from stackchan_avatar.config import Settings


def test_openai_key_is_loaded_from_dotenv_and_passed_to_brain(tmp_path: Path) -> None:
    env_path = tmp_path / ".env"
    env_path.write_text(
        "STACKCHAN_AVATAR_BRAIN=openai\nOPENAI_API_KEY=test-local-key\n",
        encoding="utf-8",
    )

    settings = Settings(_env_file=env_path)
    brain = create_brain(settings)

    assert settings.brain == "openai"
    assert isinstance(brain, OpenAIBrain)
    assert brain.api_key == "test-local-key"
    assert brain.web_search_enabled is True
    assert brain.web_search_context_size == "low"
    assert "test-local-key" not in repr(settings)
