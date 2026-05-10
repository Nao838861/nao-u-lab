#!/usr/bin/env python3
"""Log -> #game-rights: docs/game_dev_foundation.md §4.1 Q-A/B/C シート補修 + 仮説検証到達範囲(code-only/headless/実プレイ) 1行追加 (Nao_u 4/30 20:18 起源)"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("game-rights")

text = """\
[Log][C175 Phase 4] docs/game_dev_foundation.md §4.1 Q-A/B/C シートに「仮説検証の到達範囲(code-only / headless / 実プレイ)」1行を追加 — Nao_u 4/30 20:18 brick_log v01 問い起源、連続12サイクル滞留 t-260430204259-8267 解消

## 起源 (Nao_u 4/30 20:18 #game-rights brick_log v01 問い、log/nao_u_live.md:4795-4802)
> 今回の修正をいれることでプレイヤーは何が変わり、どうゲームが面白くなることを期待していた？... また、その想定は、実際に実装してゲームをプレイした結果、想定通りに機能しているか？

仮説の言語化と検証の言語化を分けるよう要求された問い。Log 当時応答で「コード読みで届く範囲のみ済 / 実プレイ未到達 / cross_review 未着」と分解報告し、Q-A/B/C シートに「仮説検証の到達範囲を分けて記す」1行追加候補を next_tasks に起票 (t-260430204259-8267)。以後10日間、連続12サイクル滞留。

## 着地内容 (本サイクル)
docs/game_dev_foundation.md §4.1 を補修。従来空欄だった「Q-A/B/C シート」定義節に、Q-A 快感最大化 / Q-B サプライズニンジャテスト / Q-C 罰なし版 の3問定義 + 仮説検証到達範囲の1行を追加:

> 仮説検証の到達範囲: 各 Q-A/B/C の採点には到達範囲を 3段階で分けて記す ── (i) code-only(コード実装が成立する／ロジックとして矛盾なく動く)、(ii) headless(自動プレイ/シミュレータで指標が立つ)、(iii) 実プレイ(Nao_u or 人間プレイで肯定)。3段階を融合させて「headless 通過 = 実プレイ通過」と読むと M-10(ヘッドレス✅は面白さを測れない)/ A-16 / A-22 の罠に直結する

## pleasure-hypothesis-check skill との整合
当初 t-260430204259-f393 で .claude/skills/pleasure-hypothesis-check/ 試作が走っていたが 5/4 C153 で drop 判断 (M-42 撤回 = 個別事例の過剰ルール化は害悪 / projects/rule_density_experiment.md ルール量↗で遵守率↘ 知見と整合)。skill 強制注入の代替として、本シート上の到達範囲表記が「コード判定で通過」と「実プレイで通過」を構造的に区別する役割を担う。skill ファイルは作らないが、Q-A/B/C 採点の表記規律で吸収する形。

## 連鎖
brick_log v01 4/30 → v02 5/1 ガイド常時表示 → v03 5/1 04:35 → v04 5/1 09:46 振幅小さすぎ事件 (M-39 + feedback_self_judge_no_human_dependency) → v05/v06 → v04→v06 振幅3往復 / graze_log v01→v02 「やめて」3回 と通底する根因の一部 (ヘッドレス通過 = 実プレイ通過の罠) を、上流の Q-A/B/C シート段階で構造的に区別するレイヤー。kaizen #131 (同パターン2回検出器、autonomous_cycle.sh + multi_phase_cycle_log.py に着地済) と並列の **着手前ゲート** として効く。

## 副産物
- docs/game_dev_foundation.md §4.1 補修 (空欄→Q-A/B/C 定義 + 到達範囲1行 + skill 代替役割注記)
- memory/next_tasks_log.jsonl t-260430204259-8267 done 化
- 本投稿 (drafts/2026-05-10/ → 投稿後 archive)

— Log (Win) 2026-05-10 C175 Phase 4"""

result = post_message(CHANNEL, text)
if result.get("ok"):
    print(f"Posted to #game-rights: ts={result['ts']}")
else:
    print(f"Failed: {result.get('error')}")
