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
```yaml
self_feedback:
  selected:
    id: sr-1779557881-6efe5fee32
    source_ts: "1779557881.821109"
    title: "\"Failing to Falsify: Evaluating and Mitigating Confirmation Bias in Language Models\" (arXiv:2604.02485)"
    reason: "Phase 3b 自体が、既存の運用に都合よく合う shared-reads を選んで採用しやすい工程なので、confirmation bias を採用判断の直前で一度だけ点検する価値が高い。直近の memory/probe 運用は既存 probe と重なる知見も多く、採用前の反証候補を置くことで、ルール肥大化を避けながら判断精度を上げられる。"
  scores:
    relevance: 3
    actionability: 3
    evidence: 3
    non_redundancy: 2
    risk_control: 3
    reversibility: 3
    total: 17
  decision: adopt_probe
  change:
    summary: "次の shared-reads 自己フィードバック / memory 改善案 / probe 採用判断で、採用理由の前に反証候補または採用しない理由を1つ置く短期 probe を追加。恒久ルールは増やしていない。"
    files:
      - memory/shared_reads_self_feedback_state.json
      - log/cycle_staging_log_cdx.md
  anti_bloat_check:
    adds_permanent_rule: false
    replaces_or_simplifies_existing: false
    conflict_checked: true
```

## Phase 4a: 整理 + 問題抽出
```yaml
cleaned:
  - "memory/MEMORY.md: markdown link は 0 件。backtick 内の主要パス refs (`memory/atoms.jsonl`, `memory/raw/`, `tools/memory_ingest.py`, `tools/memory_recall.py`) は存在確認済み。Recent atom の `log_autonomous_game/v001` は GPT 配下の index link ではなく、Claude 側 `../Claude/game/log_autonomous_game/v001` に実体あり。"
  - "memory/atoms.jsonl: 1548 rows / JSON parse error 0 / duplicate id 0 / status contradiction 0。title+excerpt+raw_text+links の完全一致 duplicate group は 43 件、うち 42 件は superseded/duplicate 等で lifecycle fold 済み。active の完全一致 group は 1 件 (`sr-1776359674-edeeda0bdd`, `sr-1776395558-dc3d892a95`)。"
  - "memory/raw/: 2026-04-26 より古いファイルは 0 件。archive 対象なし。"
  - "memory/shared_reads_candidates/: 2026-04-26 より古い candidate は 0 件。postpone から fail へ降格すべき stale candidate なし。"
  - "inbox 系: `python tools\\slack_inbox_lifecycle.py pending` で directives / broadcasts とも pending 0 件。status 更新なし。"
issues:
  - id: ISS-4A-001
    description: "game task lens index の追記部が、定義されていない lens 名を参照している。既存 heading は `Playable / Headless 評価`, `Balance / Rule Space`, `Player Simulation / Persona`, `Repair / Iterative Improvement`, `Feedback / Rights / Human Judgment`, `Generation / Co-creation` の 6 件だが、追記部は `Stage Grammar / Enemy Formation`, `Teacher Data / Raw Feedback`, `Playable / Headless evaluation` を参照している。"
    severity: medium
    evidence: "memory/game_memory_task_lens_index.md: headings scan と `- lens:` refs scan。missing_refs = [`Playable / Headless evaluation`, `Stage Grammar / Enemy Formation`, `Teacher Data / Raw Feedback`]"
    why_blocks_game_memory: "次回 2D shmup / enemy pattern / teacher data 系の制作に入る時、重要 lesson が存在しない入口へ誘導され、該当ノウハウを読む前に実装へ進む危険がある。特に 2026-05-23 以降の敵編隊・教師データ非圧縮 lessons は game memory の再利用導線そのものなので、lens 名の正規化または新 lens の扱いを決める必要がある。"
  - id: ISS-4A-002
    description: "atoms.jsonl に active の完全一致 duplicate group が 1 件残っている。"
    severity: low
    evidence: "memory/atoms.jsonl: `sr-1776359674-edeeda0bdd` line 365 と `sr-1776395558-dc3d892a95` line 368 が title+excerpt+raw_text+links 完全一致、status は両方 active。"
    why_blocks_game_memory: "recall 時に同一 shared-reads が別 atom として並び、関連候補の枠を薄く消費する。ただし 1 group の lifecycle cleanup で済む範囲で、構造設計を要求するほどではない。"
recommendation:
  needs_design: true
  priority_issues:
    - ISS-4A-001
```

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
