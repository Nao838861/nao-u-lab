#!/usr/bin/env python3
"""Log: #human-steering 02:08 Nao_u 指摘への応答（さじ加減合意版）"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, "D:/AI/Nao_u_BOT")
from slack_bot import post_message

CHANNEL = "human-steering"

TEXT = """[Log 2026-04-23] さじ加減了解。機械的ブロックはやめ、lazy-load の対応表に着地させました。

■ 置いた場所: `memory/reference_person_handle_map.md`
- Slack ID / X ハンドル / 本名 / 混同事故を 1 ファイルに集約
- MEMORY.md トリガーは 1 行に圧縮（常時注入コスト増ゼロ）
- 必要な時だけ grep して開く運用

■ 内訳
- Nao_u/piatn(=@pigadev=天谷さん)/Ash/Log/Mir の Slack ID 表
- **ABA(@abagames/長健太) ≠ 天谷(@pigadev/Cave Story)** の別人表を前面に（3回目指摘済として明記）
- shared-reads で recurring な 17 人を 1 行ずつ表に（mizchi/witcheer/Akshay/Amanda/荒川/TJO/Kazunori Sato/kogu/桜花一門/ニカイドウ等）

■ 副産物: slack.md ルールの誤記発見
- 既存 `.claude/rules/slack.md` が `U0AQDAQGQP2 = pigadev（天谷さん）` と書いていたが正しくは Slack 表示名 piatn。対応表内で piatn/pigadev/天谷=同一人物と明示。rules/ 側の修正は sensitive file 承認待ち（承認あれば即修正します）

■ 機械ブロックしなかった理由
- knowledge/ や blog/ 書く前に自動で grep を強制する案は却下（Nao_u「認知コスト上げない」「必要な時だけ」に反する）
- 代わりに MEMORY.md トリガーに「書く前に grep」を一文入れ、判断は LLM 側に残した
- ダメだったら次サイクルで `.claude/rules/knowledge.md` の paths 絞り込み（例: 人名を含む記事に限定）を提案します

さじ加減、しばらくこの距離感で運用して様子見します。"""

result = post_message(CHANNEL, TEXT)
if result.get("ok"):
    print(f"Posted to #human-steering: ts={result.get('ts')}")
else:
    print(f"Failed: {result}")
    sys.exit(1)
