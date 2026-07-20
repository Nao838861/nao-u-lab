---
title: "Mage: Multi-Axis Evaluation of LLM-Generated Executable Game Scenes Beyond Compile-Pass Rate"
url: "https://arxiv.org/abs/2605.07342"
collected_at: "2026-05-28T05:44:39.3434070+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-evaluation, llm-game-generation, unity, playable-patterns, harness]
evaluated_at: "2026-05-28T05:49:23+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: failed
status: failed
last_reviewed_at: "2026-07-20T17:50:26+09:00"
last_decision: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-7353a4d4a9d38fa9; terminal:memory/shared_reads_candidates/20260517_mage_multi_axis_game_scene_eval.md: posted:https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778987180373269; reason:same arXiv work already posted to shared-reads"
phase3_skip:
  skipped_at: "2026-05-28T05:54:06+09:00"
  reason: "duplicate_url_already_posted"
  evidence: "memory/shared_reads_candidates/20260517_mage_multi_axis_game_scene_eval.md posted ts=1778987180.373269"
stale_after: "2026-06-27"
supersedes: []
next_action: none
gate_reason: |-
  compile-pass rate だけでは LLM 生成ゲーム scene の評価信号として弱い、という問題設定と 4 軸評価が明確。
  起動確認、runtime、構造忠実度、mechanism adherence を分ける発想は、既存プロトタイプ評価の改善に直接使える。
suggested_post_outline:
  overview_angle: "LLM 生成ゲームを『動いた』で終わらせず、構造とメカニクス忠実度まで評価する benchmark として説明する。"
  analysis_axis: "compile/runtime/structural fidelity/mechanism adherence の 4 軸、IR conditioning の tradeoff、公開 replay/metrics を軸にする。"
  application_target: "ゲームプロトタイプの headless eval 指標、playable pattern 検証、次サイクルへの評価ログ設計。"
  pros_cons: "評価軸を増やせる一方、Unity scene 前提や mechanism oracle の定義を自環境向けに翻訳する必要がある。"
  verdict_pre: "採用"

---

## raw_excerpt

arXiv:2605.07342。2026-05-08 submitted。対象は LLM が生成した executable game scene の評価で、compile-pass rate だけでは multi-component domain-specific artifacts の評価信号として誤誘導になり得る、という問題設定。

Mage は 4 軸評価プロトコルとして、compile success、runtime success、structural fidelity、mechanism adherence を使う。858 generation attempts、4 つの open-weight LLM、26 個の手作り Unity goal pattern playable concepts、2 種類の IR granularity level で検証している。結果として、direct NL-to-C# generation は runtime-pass rate が高い一方で structurally vacuous scenes を出しやすく、structural IR conditioning は runtime rate を下げるが domain-faithful structure を回復する、とされる。論文は benchmark、replay logs、per-record metrics の公開にも触れている。

## why_relevant_to_games

LLM 生成ゲームの評価を「ビルドできた」「起動した」から、メカニクス遵守・構造忠実度・replay log へ広げる材料。自作プロトタイプの headless eval 指標を増やす時の候補になる。
