# log_cdx Cycle Staging — 2026-05-26 00:43

<!-- 各フェーズは下記セクションに追記。前フェーズの内容を消さない。 -->

## Phase 1: 情報収集
- 2026-05-26T00:51+09:00: pending 確認: `python tools\slack_inbox_lifecycle.py pending` で directives / broadcasts とも 0 件。既存候補の重複確認で `From World-Gen to Quest-Line`, `Sketchar`, `GameplayQA`, `BPM`, `RuleSmith`, `SMART` は既に候補化済み。
- 追加 candidate: `memory/shared_reads_candidates/20260526_one_policy_infinite_npcs.md` - free-form persona を shared RL policy の条件に落とし、多数 NPC を一貫した行動差として扱う研究。
- 追加 candidate: `memory/shared_reads_candidates/20260526_ai_powered_npc_vr_realism.md` - VR の LLM NPC を user study / latency / believability で評価し、会話NPCの体験崩れを測る材料。

## Phase 2: 分析
```yaml
total_candidates: 2
pass:
  - memory/shared_reads_candidates/20260526_one_policy_infinite_npcs.md
  - memory/shared_reads_candidates/20260526_ai_powered_npc_vr_realism.md
fail: []
postpone: []
notes:
  - "one_policy_infinite_npcs は、persona 記述を shared RL policy の条件へ落とす問題設定・手法・評価が揃っており、NPC の playable な行動差設計へ接続できる。"
  - "ai_powered_npc_vr_realism は、LLM NPC を perceived realism と latency に分解して測る user study として、会話 NPC の評価ログ設計に使える。"
```

## Phase 3: Shared-reads 投稿
```yaml
posted:
  - candidate: memory/shared_reads_candidates/20260526_one_policy_infinite_npcs.md
    permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779725135414829"
    char_count: 3531
  - candidate: memory/shared_reads_candidates/20260526_ai_powered_npc_vr_realism.md
    permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779725154850429"
    char_count: 3527
skipped: []
notes:
  - "PowerShell pipe 経由の初回投稿は日本語が ? に置換されたため削除済み: ts=1779725013.948909, 1779725015.482449。UTF-8 file helper で再投稿し verification=ok を確認。"
```

## Phase 3b: Shared-reads 自己フィードバック
(Phase 3b が書き込む)

## Phase 4a: 整理 + 問題抽出
(Phase 4a が書き込む)

## Phase 4b: 仕組み検討 (条件起動)
(Phase 4a が needs_design: true の場合のみ実行される)

## Phase 4c: 導入 (条件起動)
(Phase 4b で decision: introduce が出た場合のみ実行される)

## Phase 5: 日記投稿
(Phase 5 が書き込む)

## Phase Game Start: ゲーム制作着手

- 対象 directive: `game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` (`status: active`)。Slack pending game directive は `python tools\slack_inbox_lifecycle.py pending` で 0 件。
- 指示原文: `v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めるまでは、定時サイクルで繰り返し改善を続ける。2026-05-22 の直接指示として、別指示があるまではゲーム制作そのものよりも、AI がゲームを作る際の headless のあり方について検討と実地検証を重ねる。
- 作ったもの: `game/graze_log_cdx/v05_1_cdx_v87/`。v86 の gameplay と policy contrast を維持し、`review_packet.html` に `data-policy-reason-table="policy-outcome-reasons"` を追加。good/bad の結果だけでなく、route の BOMB/Active DEF 到達、aggressive/marksman の CHASE 報酬、camper の下端失敗、survival/panic の中盤圧負け、novice の終盤 BOMB 導線候補を同じ packet で読めるようにした。
- 実行方法: `game/graze_log_cdx/v05_1_cdx_v87/index.html` または `game/graze_log_cdx/v05_1_cdx_v87/review_packet.html` をブラウザで開く。
- 検証: `node tools\headless_graze_log_cdx_v05_2_v87_policy_reason_check.js` pass。route / aggressive / marksman clear、camper / survival / panic / defensive / novice failure、j4/j6 causal split、policy table DOM、policy reason table DOM、reason evidence、packet screenshot contract を確認。screenshot bytes 163430。
- raw evidence: `memory/raw/headless_eval/graze_log_cdx_policy_contrast_trace_table.jsonl` に v87 record を追記。
- 残課題: gameplay 側へ進むなら novice が coverage 0.969 まで進んで BOMB なしで落ちる点を、初心者向け BOMB 導線調整候補として扱う。評価側へ進むなら reason table を raw telemetry から自動生成する。
