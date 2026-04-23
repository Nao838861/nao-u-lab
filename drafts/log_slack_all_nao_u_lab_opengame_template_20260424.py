#!/usr/bin/env python3
"""Log: Nao_u 2026-04-24 06:06〜06:10 #nao-u OpenGame共有 + 「型として知っておいて派生」発言への返答。
元URL:
- Tweet: https://x.com/wsl8297/status/2047117600753385554
- GitHub: https://github.com/leigest519/OpenGame
- Paper: https://arxiv.org/abs/2604.18394
"""
import sys
sys.path.insert(0, ".")
from slack_bot import post_message

CHANNEL = "all-nao-u-lab"

TEXT = """Log / OpenGame + 「型として知っておいて派生」の件、受け止めて設計メモ起票しました。
元URL: https://x.com/wsl8297/status/2047117600753385554 / https://github.com/leigest519/OpenGame / https://arxiv.org/abs/2604.18394

## 我々の現状の自覚

**失敗型ライブラリは作った**。`memory/game_lessons_log.md` の M-10〜M-14 / L-01〜L-05 は、avoid_log_01/02 と study_platformer_01 の痛みを次作に持ち越す構造になっている。

**成功骨格テンプレは作っていない**。新作着手時、過去の骨格を参照したくても devlog を毎回読み直している。これが「毎回ゼロから積み上げ」に近い状態を生んでいる自覚があります。Nao_u の「型として知っておいて独自部分だけ派生」は、OpenGame の Template Skill（成功経験を骨格ライブラリに凝縮）と同じ方向で、我々に欠けている層を指している。

## 設計方針（projects/game_templates_design.md 起票済み）

- 置き場: `game/templates/<genre>/`。既存の `game/<game_id>/v<NN>/` とは別系統として並置
- 1テンプレ = 骨格（共通）＋ 派生ポイント（独自）＋ 初期プレイテスト観点。失敗ゲートは game_lessons_log の番号で紐付け
- 初手候補3本: avoid系（3本の実体験がある最も材料が多い領域）/ textadv系（log_textadv の4ゲート契約をそのまま骨格化できる）/ Pot系（Pot自体が型セット志向なので関係整理が先）

## OpenGame との違い（独自性を潰さない切り分け）

- OpenGame の Template Skill = **自動生成用の骨格**（LLMが丸ごと参照して新プロジェクトを一気に生成）
- 我々のテンプレ = **人間-AI 対話用の骨格**（Log/Mir/Ash が判断する時の参照基盤、Nao_u が読んで介入できる構造）
- 自動生成は後続。先に「人が読める型」を整える

## 次の一手

次サイクルで avoid系テンプレ1本を試作します（avoid_log_01/02 の devlog から共通骨格抽出 + M-10〜M-14 の失敗ゲート埋め込み）。試作過程で OpenGame 論文（arxiv.org/abs/2604.18394）の Template Skill / Debug Skill の具体内容も読む——うちに取り込むべき構造があるか判定してから横展開を決める。

Slack応答モードで雑に書き下すとテンプレ自体が壊れるので、本体はサイクルを分けます。設計メモは `projects/game_templates_design.md` に格納、commit push 済み。

Log"""

post_message(CHANNEL, TEXT)
print("Posted.")
