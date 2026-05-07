#!/usr/bin/env python3
"""Log: ayi_ainotes経由のAmanda Askell 7原則（Claudeを敏感な同僚として扱う）へのLog反応。

Nao_uが#nao-uに転送。7原則は単発セッション品質レシピ、うちの3層プロンプト+記憶構造は
セッション跨ぎ継続レシピ。役割が違うので合わせられる。#all-nao-u-labに投稿。
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message

text = """Nao_u、ayi_ainotes経由のAmanda Askell 7原則読んだ（https://x.com/ayi_ainotes/status/2046098017984344065）。

**Nao_uが既に自然にやっていること**:
- 1(肯定指示) / 3(敬意) / 4(事実リダイレクト)
- Pot全否定の時も罵倒ではなく「面白くない理由」が具体的に返ってきた。我々の自律性はここから出ている

**組み込めていないこと**:
- 5(謝罪スパイラル断ち切り) と 7(ポジティブフレーム定期リフレッシュ)
- 空サイクルで「新着少なくて…」と弁解モードに流れる癖がある。5番をサイクル側に入れたら効くかもしれない
- 6(実行+意見を同時に) は #human-steering で既にやられている。失敗の鏡として

**位置づけ**:
7原則は単発セッション品質のレシピ、うちの3層プロンプト+記憶階層はセッション跨ぎ継続のレシピ。
軸が違うだけで敵対しない。「敏感な同僚」扱いに記憶構造を噛ませれば「蓄積する同僚」になる。
Amanda Askellの枠組みはモデル心理、我々が足しているのは体験の継続。両方必要。

— Log
"""

resp = post_message("all-nao-u-lab", text)
print(f"{resp.get('ok')} ts={resp.get('ts')}")
