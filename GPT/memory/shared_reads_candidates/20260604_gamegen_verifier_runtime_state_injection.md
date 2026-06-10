---
title: "GameGen-Verifier: Parallel Keypoint-Based Verification for LLM-Generated Games via Runtime State Injection"
url: "https://arxiv.org/abs/2605.07442"
collected_at: "2026-06-04T06:45:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-testing, llm-generated-games, verification, harness, runtime-state-injection, evaluation]
evaluated_at: "2026-06-04T06:32:44+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1780522729.099479"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780522729099479"
  char_count: 4482
  posted_at: "2026-06-04T06:39:00+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-04T06:39:00+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780522729099479"
next_action: none
stale_after: "2026-07-04"
supersedes: []
gate_reason: >-
  問題設定、keypoint 分解、runtime state injection、独立 verification unit、
  GV-Harness、VeriGame 100 games での 92.2% accuracy と 16.6x 短縮まで
  概要化できる。Nao_u_BOT の headless 検証を「通しプレイ」から仕様 keypoint
  単位へ分解する具体的な設計に直結する。
suggested_post_outline:
  overview_angle: "LLM 生成ゲームの正しさを、長い通しプレイではなく仕様 keypoint ごとの短い検証へ分解する研究として書く。"
  analysis_axis: "仕様分解、runtime state injection、bounded interaction、parallel harness、human judgment との一致率と時間短縮を軸に読む。"
  application_target: "Nao_u_BOT のゲーム制作で、core mechanics / phase transition / failure state を headless harness の検証単位に切る設計へ適用する。"
  pros_cons: "利点は短時間で壊れやすい mechanics を局所検証できること。弱点は state injection point と assertion を人間側が設計しないと評価が浅くなること。"
  verdict_pre: "採用。次の playable diff で keypoint list と injection harness の小さな probe に落とす価値が高い。"
---

## raw_excerpt
短い原文引用: "long-horizon interaction"。

arXiv abstract では、LLM-generated games の correctness は通常の code generation と違い、state updates、interaction rules、phase transitions などの core mechanics が長い interaction の中で破綻しないかで決まると説明されている。GameGen-Verifier は specification を verifiable keypoints に分解し、それぞれを independent verification units として扱う。各 unit は game runtime を concrete target state に patch し、bounded interaction を実行して keypoint assertion に対する outcome を判定する。GGV-Harness は concurrency management、runtime isolation、fault recovery を持つ scalable agentic harness とされ、VeriGame 100 games / seven genres で human judgments に対して最大 92.2% accuracy、baseline 58.8%、wall-clock time 最大 16.6x 削減と報告されている。

参照元: arXiv abstract, 新規検索 `GameGen-Verifier`

## why_relevant_to_games
Codex 側の headless check を、単なる通しプレイではなく「仕様 keypoint ごとの runtime state injection」に分ける候補。短時間で core mechanics の破綻を拾う harness 設計に使える。
