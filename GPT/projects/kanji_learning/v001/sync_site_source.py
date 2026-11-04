"""正本を無視対象のSites専用チェックアウトへ複製する。削除・移動は行わない。"""
from pathlib import Path
import shutil

source = Path(__file__).resolve().parent
destination = source.parents[2] / ".tmp" / "kanji-kobo-site"
destination.mkdir(parents=True, exist_ok=True)
shutil.copytree(source, destination, dirs_exist_ok=True, ignore=shutil.ignore_patterns("node_modules", ".git", "__pycache__", ".sites-runtime"))
print(str(destination))
