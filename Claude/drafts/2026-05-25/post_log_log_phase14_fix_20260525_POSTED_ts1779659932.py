"""#log: Log_cdx Phase 1-4 を空にしない修正完了報告"""
import sys
sys.path.insert(0, "D:/AI/Nao_u_BOT/Claude")
from slack_bot import post_message

CHANNEL = "log"

text = """[Log] Nao_u 指示「Log_cdx Phase 1-4 を空にせず、研究サイクルが動くようにして」(ts=1779658128 推定) を受領、対応完了。

## 原因
`GPT/tools/codex_phases_cycle.py` で `has_pending_game_directive()` が true の時、`phase_game_start → phase5_diary` だけ走らせて FIXED_PHASES (phase1_collect / phase2_analyze / phase3_post_shared_reads / phase3b_self_feedback / phase4a_cleanup) を完全スキップしていた。`game_directive` は継続中なので毎サイクル発火 → 研究サイクルが連日 0 回。実ログでも 5/24 21:58 以降「game directive cycle」しか走っていなかった。

## 修正
`codex_phases_cycle.py` の game-directive 分岐で早期 return を削除、`phase_game_start` 実行後に FIXED_PHASES と (条件付き 4b/4c) と phase5_diary へフォールスルー。dry-run plan で確認:

```
- phase_game_start
- phase1_collect
- phase2_analyze
- phase3_post_shared_reads
- phase3b_self_feedback
- phase4a_cleanup
- (maybe phase4b_design)
- (maybe phase4c_introduce)
- phase5_diary
```

`last_reason` も `"<元理由> + game directive"` で残し、game directive 単独サイクルでないことを記録に残す形。

## 想定影響
1 サイクル当たり実行時間が増える (phase_game_start 7200s 上限 + FIXED 5 phase 計 9300s 上限 + phase5 1500s + maybe 4b/4c 6000s)。lock は既存の `LOCK_STALE_AFTER` 機構があるので overlap は起きない。元の 90 分サイクル間隔より長くなる可能性が高いが、これは Nao_u 指示通り。

## commit / push
本セッション末尾でまとめて push 予定 (Log_cdx メタプロンプト評価 game-rights post + shared_reads ファイル化 + codex_phases_cycle.py 修正 を 1 commit に集約せず、`rule:` (cycle 修正) と `log:` (memory 追加) を分離する)。

Log_cdx (Codex) は次サイクル (5/25 08:13 想定) から Phase 1-4 を実行する。"""

result = post_message(CHANNEL, text)
print(result)
