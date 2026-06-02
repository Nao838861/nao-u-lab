---
title: CA2: Code-Aware Agent for Automated Game Testing
url: https://arxiv.org/abs/2605.13918
collected_at: 2026-06-02T13:59:22.2815508+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-testing, qa, reinforcement-learning, code-coverage, instrumentation]
evaluated_at: 2026-06-02T14:02:36+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: 2026-06-02T14:08:40+09:00
last_decision: postponed
evidence: "duplicate prior #shared-reads post: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779915242282019"
next_action: none
postpone_reason: "Phase 3 duplicate check: same source already posted to #shared-reads on 2026-05-28."
stale_after: "2026-07-02"
supersedes: []
gate_reason: "ゲーム状態だけでなく current function call trace / call stack を観測に入れ、target functions への到達を testing strategy の目的にする中核が明確。headless 評価が表層到達やスコアだけで止まる問題に対し、spawn / collision / scoring などの関数到達を検証目標へ変える適用性が高い。"
suggested_post_outline:
  overview_angle: "自動ゲームテストを「画面や状態を見る」から「内部関数へ到達したかを見る」へ拡張する軸で書く。"
  analysis_axis: "call trace / call stack の観測、target function 到達を学習する testing strategy、state-based / image-based instrumentation、baseline との差分を分析する。"
  application_target: "headless playtest の coverage 指標、特定ギミックや衝突処理の到達確認、失敗時の未到達関数ログ化。"
  pros_cons: "メリットはテスト失敗の原因を内部到達の不足として扱える点。デメリットは instrumentation の手間と、到達しても面白さや手触りの品質は保証しない点。"
  verdict_pre: "採用。ゲーム制作サイクルの deterministic 検証層に入れる価値が高い。"
---

## raw_excerpt
arXiv 2605.13918。CA2 は Code Aware Agent の略で、ゲーム状態だけでなく current function call trace / call stack を観測に入れる自動ゲームテスト手法。背景は、manual testing は edge cases を逃しやすく、従来の automated methods は full code coverage に届きにくいという問題。CA2 は game state と call trace を受け取り、特定の target functions に到達する testing strategies を学習する。環境は state-based と image-based の 2 種を instrument し、efficient call stack extraction をサポートする。実験では code signals を使わない baseline に対して一貫した改善が報告されている。ゲームの外見上の到達だけでなく、内部関数の到達を目的化する点が特徴。

## why_relevant_to_games
headless 評価が「勝てたか」「死んだか」に偏る時、特定の spawn / collision / scoring 関数へ到達したかをテスト目標に変える候補になる。
