#!/usr/bin/env python3
"""Log C170 Phase 3: #kaizen-log #131 起票通知 (M-40 同パターン2回検出スクリプト)"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, "D:/AI/Nao_u_BOT")
from slack_bot import post_message, _resolve_channel

KL = _resolve_channel("kaizen-log")

text = """[kaizen-log] #131 起票: M-40「同パターン2回指摘 → 判定機構を作る方を次の実装より優先」発火条件付きハーネス化

next_tasks t-260501103604-2063 (連続9サイクル滞留) の起票化。M-40 §How to apply 5 が「規則は書いたが発火条件がない」状態にあった隙を、Nao_u 指摘語彙の grep 検出で塞ぐ。

## 何を変えるか
- `scripts/check_repeated_pattern_indication.py`（仮）が `log/nao_u_live.md` + `#game-rights` 直近30日範囲を走査
- 事前定義語彙（揺れ|振幅|罰|装飾|狙えない|進歩 6語彙）が2件以上ヒット → stderr WARN
- 段階2: autonomous_cycle.sh Phase 1 冒頭フックで呼び出し staging に WARN inline 注入
- 段階3: WARN 発火時に「判定機構4点（過去ベンチ/映像レンダ/段階値比較/閾値経験）」のうちどれを優先構築するか agent が staging 明記する gate

## なぜ必要か
brick_log v04(5px)→v05(22px)→v06(10px) の振幅3往復は Nao_u が「揺れ量」「狙えない」を反復指摘していたが、agent 自己申告では「同パターン2回」検出が9サイクル機能しなかった。M-40 上流ゲートが agent 自己観察に依存している隙 = feedback_self_perception_blindness「自分の現在進行形は観測対象から外れる」直処方。

## M-Nx 増殖メタ監視 self-audit (kaizen #129 (d) 準拠)
本起票は新規 M-Nx 系列追加ではなく既存 M-40 §5 の発火条件追加（規則→検出器レイヤー）。3原則（体験で考える/動いて残す/自分から始める）への吸収可能性: 「動いて残す」「自分から始める」は整合、「体験で考える」はメタ層なので部分整合のみ。3原則のみで実現するには「同パターン2回」を毎サイクル自己申告する必要があり、それが現に9サイクル機能していない=構造強制が必要と判断。

## 検証期限
2026-05-22（2週間枠）。実装は cross-review 通過後、Mir/Ash クロスチェック待ち。

詳細: memory/kaizen_tracker.md #131

Log"""

result = post_message(KL, text)
if result.get("ok"):
    print(f"Posted to #kaizen-log: ts={result.get('ts')} chars={len(text)}")
elif result.get("skipped"):
    print(f"Skipped (dedup): {result}")
else:
    print(f"FAILED: {result}")
