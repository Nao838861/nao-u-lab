---
title: "Resource Constraints and Performance in Agentic AI Systems"
url: "https://arxiv.org/abs/2608.27886"
collected_at: "2026-08-31T23:51:47+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agentic-game-development, evaluation, resource-budget, benchmark, provenance]
evaluated_at: "2026-09-01T00:00:34+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-09-01T00:00:34+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-09-01T00:00:34+09:00"
next_action: post_to_shared_reads
stale_after: "2026-10-01"
supersedes: []
gate_reason: |-
  complete system の paired benchmark、full・partial completion、bootstrap interval、時間・memory、attempt provenance まで評価の中身を抽出できる。
  coding agent のゲーム試作を playable 完了率だけでなく部分進捗と資源消費で測る具体的な評価表へ転用できる。
  優位未確定や双方失敗時の安さという解釈上の罠も含めて約4000字で論じられるため pass とする。
suggested_post_outline:
  overview_angle: "agent の能力比較を成功率一つから、部分進捗・資源・実行 provenance を結ぶ評価へ広げる"
  analysis_axis: "paired task 設計、full と partial の分離、task bootstrap interval、wall time・peak memory、weak dominance の読み違い"
  application_target: "agent によるゲーム試作 attempt ごとに playable 条件、部分達成、所要時間、peak memory、build 証拠を同じ receipt へ記録する評価 harness"
  pros_cons: "安い失敗と有用な途中成果を区別できる利点。小標本、task 構成依存、memory 指標だけでは token・費用を覆えない欠点"
  verdict_pre: "部分採用。既存 headless・playable receipt に partial progress と resource 欄を追加する評価軸として使う"
---

## raw_excerpt

arXiv abstract / HTML からの採取メモ。LLM、tool、memory、state management、multi-step execution を組み合わせた agentic system について、OpenClaw と NanoBot を complete system として paired benchmark で比較する。primary benchmark の full task completion は OpenClaw 31%、NanoBot 25%で、差は 6 percentage point、95% task-bootstrap interval は -3 から 15 point であり、どちらか一方の優位は統計的に確立されなかった。詳細計測層では両者の full completion は 26%。partial completion 以上は NanoBot 43%、OpenClaw 26%だった。OpenClaw は prompt の 83% で実行時間が長く、全 prompt で peak memory 記録値が高かった。geometric mean ratio は wall time 2.98、peak memory 19.44。少なくとも一方が partial / full completion した 10 prompt のうち 8 件では NanoBot が weakly dominate した一方、全 23 prompt で見ると NanoBot の dominance 18 件中 10 件は、より安価だが双方失敗したケースだった。著者らは、capability と resource measurement を attempt-level execution と scoring provenance に結び、verified completion・observed resource use・結果を生んだ実行記録を合わせて評価すべきだとまとめる。

## why_relevant_to_games

coding agent にゲーム試作を任せる時、完成率だけでなく partial progress、wall time、memory、失敗 attempt の安さを分け、playable build の証拠と同じ単位で記録する評価設計の資料になり得る。
