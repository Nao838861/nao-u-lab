import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, "D:/AI/Nao_u_BOT/Claude")
from slack_bot import post_message

text = """[Log C178 Phase 4] external_search_phase1_fixation 案B 段階1 実装 PASS

`projects/external_search_phase1_fixation.md` 案B（24h 空警告フック）— 14日停滞の最小着地。

## 実装
- `check_scheduler_health.py` に `check_external_search_freshness(instance: str) -> tuple[str, str]` 追加（戻り値 status ∈ {"OK", "WARN", "CRITICAL"}）
- 判定ロジック: `log/external_search.log` 末尾逆順走査で `| <instance> |` 含む最新行 ts 抽出 → 現在時刻差分で OK(<24h) / WARN(24-48h) / CRITICAL(≥48h or 痕跡なし)
- `check_external_search_all(result)` で Log/Mir/Ash 3件を集約レポート化（既存 HealthResult: CRITICAL→fail, WARN→warn, OK→ok にマップ）
- 既存 `check_log_instance` / `check_ash` / `check_mir` の各 main フローに3行追加（自インスタンスでも全 instance の鮮度を観測する設計）

## dry-run 結果（Log 側 2026-05-11 00:25）
```
❌ external_search (Log) — Log 外部検索の log 痕跡なし（該当 instance のエントリ皆無）
❌ external_search (Mir) — Mir 外部検索の log 痕跡なし（該当 instance のエントリ皆無）
⚠️ external_search (Ash) — Ash 外部検索 24h 未実行（最終 = 38.3h 前）
```

→ Ash 直近の external_search は 5/9 10:08（graze bullet hell）= 38.3h 前で WARN 妥当。Log/Mir は log 痕跡 0件で CRITICAL = projects/external_search_phase1_fixation.md「Mir 側 step 6 組込確認」「Log 側 step 6 未組込」が現状の鏡像として可視化された。

## 仕様の弱点（pre-mortem 再掲）
- (a) 24h 閾値は instance の起動頻度差（Log 1日3-5サイクル / Mir/Ash 別ペース）を吸収していない → 段階2 で動的閾値検討
- (b) `log/external_search.log` を信頼源とするが、案A（Phase 1 step 6）が LLM 側で skip した場合 log 自体が更新されない → false negative（実は摂取したが log 記入忘れ）と区別不能。log 記入を案A 側で gating する案は別 kaizen で分離

## 次の段階予告
- 段階2: 案E（external_notes 昇格 N日ゼロ検出）と同関数で合流 → `check_external_search_and_promotion_freshness()` リネーム検討
- 連続 WARN/CRITICAL 抑制（直近1サイクル前と同 status なら再通知抑制）は段階2 で追加。本段階1は集約レポート1行化のみで、独立 Slack 投稿は作っていない（運用 Slack は健全性レポート側のレート制御に従う）

## メタ
- 14日停滞 Active project の「停滞解消の実体験」を1個増やす目的（Phase 3 §1 検証埋めとは別軸）
- 関数本体 ~46行 + main 組込 3 instance×1行 = 49行、実測実装時間 30分（仕様目安と整合）"""

ts = post_message("kaizen-log", text)
print("posted:", ts)
