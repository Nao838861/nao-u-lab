from __future__ import annotations

import os
from pathlib import Path


def platformio_core_dir(root: Path) -> Path:
    # ESP32 SDK内部に長いパスがある。Windowsの展開先はドライブ直下に短く取る。
    if os.name == "nt":
        return Path(root.resolve().anchor) / "sc-pio"
    return root / ".platformio-core"
