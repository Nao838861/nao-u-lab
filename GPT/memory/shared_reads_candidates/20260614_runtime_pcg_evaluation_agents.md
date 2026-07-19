---
title: "Runtime Evaluation of Procedural Content Generation in an Endless Runner Game Using Autonomous Agents"
url: "https://arxiv.org/html/2605.01783v1"
collected_at: "2026-06-14T19:59:28.8718985+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [procedural-generation, evaluation, autonomous-agents, unity, runtime-validation]
evaluated_at: "2026-06-14T20:18:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-19T19:20:44+09:00"
last_decision: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-965c62c42489ca18; terminal:memory/shared_reads_candidates/20260516_runtime_pcg_autonomous_agents.md: posted https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778884869679689; memory/shared_reads_candidates/20260517_runtime_pcg_evaluation_agents.md: posted https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779018447709959; reason:両 open sibling は同一 arXiv 2605.01783 の再収集であり posted sibling 2件に対する追加資料差がない"
next_action: none
duplicate_note: "Phase 3 duplicate check found an existing #shared-reads post for arXiv 2605.01783, so no duplicate message was sent."
stale_after: "2026-07-14"
supersedes: []
gate_reason: "runtime loop 内で PCG 結果をプレイヤー到達前に検査する問題設定が明確で、air scanner と ground traversal agent、ray casting/physics sweep/structured crash report まで手法要素が具体的。playability を後付け評価でなく生成 pipeline の一部にする話として、ゲーム制作への適用性が高い。"
suggested_post_outline:
  overview_angle: "PCG を作って終わりにせず、生成直後に通行不能・不正配置・無効 section を検出する runtime validation として書く。"
  analysis_axis: "WFC 由来の制約付き配置、navigation surface、air/ground の二種類の評価 agent、crash report に含める再現情報。"
  application_target: "自作ゲームのランタイム生成、ステージ断片生成、敵/障害物配置の自動検査 harness。"
  pros_cons: "メリットはプレイヤーに壊れた生成物を見せる前に落とせる点。デメリットは endless runner/Unity 前提の実装依存があり、面白さや難度曲線は別評価が必要な点。"
  verdict_pre: "採用。PCG やステージ生成の safety gate として優先度が高い。"
---

## raw_excerpt
この論文は、PCG を「生成」だけでなく、生成された内容が playable かを実行時に検査する問題として扱う。対象は Momentum という endless-runner で、プレイヤーの前方に terrain tile や環境オブジェクトを生成し、Wave Function Collapse に着想を得た制約付き配置と、非同期で再構築される navigation surface を組み合わせる。生成された通路がプレイヤーに到達する前に、二種類の autonomous evaluation agent が先行して検査する。

検査は、空中 scanner による幾何的な corridor 確認と、ground traversal agent による navigation 観点の確認で構成される。ray casting、volumetric physics sweep、obstacle-layer filtering、structured crash reporting を組み合わせ、blocked path、危険な obstacle placement、技術的に無効な section を検出する。報告には blockage details、player state、generation parameters、offending objects などが含まれる。論文は、評価を offline pass として後付けするのではなく、runtime loop の中に generation と validation を統合することを主張し、playability、diversity、controllability、runtime performance の軸も置く。

## why_relevant_to_games
自作ゲームの自動生成要素に対して、プレイヤーが触れる前に「通れるか」「詰まないか」「生成条件を再現できるか」を検査するruntime harnessの材料になる。
