---
title: "AI Gamestore: Scalable, Open-Ended Evaluation of Machine General Intelligence with Human Games"
url: "https://arxiv.org/abs/2602.17594"
collected_at: "2026-07-11T08:05:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, ai-player, evaluation, benchmark, game-generation, vlm]
evaluated_at: "2026-07-11T08:10:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-19T21:37:31+09:00"
last_decision: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-6c97712be1a4f523; terminal:memory/shared_reads_candidates/20260526_ai_gamestore_open_ended_human_games_eval.md: posted:https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779793589433579; reason:posted-source index で arXiv 2602.17594 の canonical URL/work 一致を確認したため再投稿対象外"
next_action: none
stale_after: "2026-08-10"
supersedes: []
postpone_reason: >-
  Phase 3 duplicate guard。同一 arXiv 2602.17594 は 2026-05-22 に詳細分析が投稿済みで、
  2026-05-26 にも Codex candidate として投稿済み。今回候補は問題設定、100ゲーム・7 VLM、
  人間平均10%未満、world-model learning・memory・planning の弱点、headless 評価への適用まで
  既存投稿と重複し、再投稿に足る新規実験・新規適用・既存判断の更新がない。
gate_reason: >-
  静的な少数課題への最適化という評価上の問題、ゲーム生成・標準化・human-in-the-loop という中核、
  100 ゲームでの人間比較と最良モデルでも平均 10% 未満という結果が揃い、約4000字の概要を構成できる。
  ゲーム制作では単一 bot スコアを越え、ルール理解・観測・計画要求の異なる試作群を人間基準で比較する評価設計へ具体的に転用できる。
suggested_post_outline:
  overview_angle: "固定ベンチマークの飽和を、継続生成される人間向けゲーム群と人間基準の比較で避ける評価基盤として整理する"
  analysis_axis: "課題供給の開放性、ゲーム生成と標準化、human-in-the-loop 評価、100ゲーム実験が測れている能力と限界"
  application_target: "Log_cdx のゲーム試作評価を、単一 bot 成績からルール理解・視覚観測・記憶・計画要求の異なる小規模試作群と人間ベースラインの比較へ拡張する"
  pros_cons: "多様な能力と未知課題への適応を測れる一方、生成ゲームの品質管理、人間評価コスト、商用ランキング由来の設計偏りが残る"
  verdict_pre: "部分採用"
---

## raw_excerpt

従来のAIベンチマークは限られた能力を静的な課題で測ることが多く、開発側が課題へ最適化すると飽和しやすい。本論文は、人間が人間のために設計した「あらゆる人間のゲーム」を、同程度の経験・時間・資源を与えた人間とAIに遊ばせ、学習とプレイの両面を比較する構想を提示する。その第一歩として、一般的なデジタルゲーム配信基盤からゲーム環境を取得し、標準化・コンテナ化した派生ゲームをLLMとhuman-in-the-loopで合成する、拡張可能でオープンエンドな AI GameStore を導入した。

概念実証では Apple App Store と Steam の人気チャートを基に100ゲームを生成し、7種類の最先端VLMを短いプレイエピソードで評価した。最良モデルでも大半のゲームで人間平均スコアの10%未満にとどまり、特に世界モデルの学習、記憶、計画を要求するゲームで苦戦したと報告する。固定された少数課題ではなく、新しいゲームを継続的に供給することで、課題固有の最適化を避けながら汎用的なゲームプレイ能力を測る方向を示している。

## why_relevant_to_games

ゲーム試作を単一のbot成績だけで測らず、異なるルール・観測・記憶・計画要求を持つゲーム集合と人間基準で評価する際の参考になる。AIテストプレイヤーが苦手とする設計要素を切り分ける評価セット作りにも接続できる。
