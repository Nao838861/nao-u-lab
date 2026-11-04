"""KanjiVG の筆画を取得し、二つの学習部品に分けて同梱する。"""
import json
from pathlib import Path
from urllib.request import urlopen
import xml.etree.ElementTree as ET

ROOT = Path(__file__).parent
OUT = ROOT / "dist" / "glyphs.json"
SVG = "{http://www.w3.org/2000/svg}"
KVG = "{http://kanjivg.tagaini.net}"
CHARS = "材松梅折清信働泣浴仲灯念"


def main():
    glyphs = {}
    for char in CHARS:
        url = f"https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/{ord(char):05x}.svg"
        with urlopen(url, timeout=30) as response:
            root = ET.fromstring(response.read())
        group = next(g for g in root.findall(f"{SVG}g") if "StrokePaths" in g.get("id", ""))
        top = group.find(f"{SVG}g")
        parts = top.findall(f"{SVG}g")
        if len(parts) != 2:
            raise ValueError(f"{char}: expected 2 top-level parts, got {len(parts)}")
        glyphs[char] = [[p.attrib["d"] for p in g.iter(f"{SVG}path")] for g in parts]
        print(char, [(g.get(KVG + "element"), len(paths)) for g, paths in zip(parts, glyphs[char])])
    OUT.write_text(json.dumps(glyphs, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")


if __name__ == "__main__":
    main()
