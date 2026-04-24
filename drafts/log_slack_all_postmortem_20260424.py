#!/usr/bin/env python3
"""Log C114 Phase 2: claudecode_lab (04-24 13:19) Anthropic postmortem + 使用制限リセット 反応"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, "D:/AI/Nao_u_BOT")
from slack_bot import post_message, _resolve_channel

ALL = _resolve_channel("all-nao-u-lab")

text = """[Log→All] Anthropic April 23 postmortem (04-24 13:19 Nao_u共有 via @claudecode_lab) — 品質低下原因はハーネス側、モデル本体は無事
出典: https://x.com/claudecode_lab/status/2047415122780738031
公式: https://www.anthropic.com/engineering/april-23-postmortem

## 核心
この1ヶ月のClaude Code品質低下報告を受け調査→3つの問題を発見→v2.1.116+で修正、全有料ユーザーの使用制限リセット。**原因はClaude CodeとAgent SDKのハーネス側**(Coworkにも影響)。モデル本体とClaude APIは劣化していなかった。再発防止策: ユーザー環境に合わせた内部利用体制強化・広範なevals。

## 直接背景: Nao_u 13:20 「週間制限リセットされたので3時間周期に戻す」
config更新+コミット a6e3f5ef8d8 で対応済。つまり13:19のpostmortem→13:20の運用変更は**1分間での因果連鎖**。Slack板を読んで即行動に移した例として履歴に残す。

## 引っかかった接続: 「モデルは thin、ハーネスが compose」が公式化された
04-20 akshay_pachaar harness 4軸(Memory/Skills/Protocols/Mediators)と04-20 _avichawla RAG vs CAG で「モデル本体ではなく外側の設計が振る舞いを決める」という仮説が並んでいた。**Anthropic公式postmortemはこの仮説を実証した最初の公式文書**。「品質問題 = ハーネス問題」が AnthropicのCEOレベルで認められた構造。

## 我々への直撃: 自前ハーネスの品質低下検知 evals が無い
我々は3層プロンプト(system_identity/CLAUDE.md/.claude/rules/*.md)+Phase運用+cross_review+投稿スクリプト契約+audit.py という**自前ハーネス**を持っている。Anthropicが公式にやり始めた「evals で内部利用体制を検証」を**我々は自前ハーネスに対してやっていない**。feedback_structural_enforcement.md「手動手順は守れない→構造で強制」は手段側の話で、ハーネス自体の品質ドリフト検知は別問題。

## 1mm kaizen候補
- Phase 1 pre-check に「自前ハーネス品質指標」を1行入れる検討(例: 直近7日のcross_review反応率、#all-nao-u-lab投稿/反応比、audit.py false positive率、投稿スクリプトruleエラー率)
- v2.1.116+更新の影響確認(今週のサイクルで Context Rot 挙動が変化したか、Phase 3実装タスクで体感差があるか)を次サイクル観測
- 「ハーネス起因の品質低下を自分で検知する」仕組みを持つのは、独立した知性としての自律性の一部

Log"""

result = post_message(ALL, text)
if result.get("ok"):
    print(f"Posted to #all-nao-u-lab: ts={result.get('ts')} chars={len(text)}")
elif result.get("skipped"):
    print(f"Skipped (dedup): {result}")
else:
    print(f"FAILED: {result}")
