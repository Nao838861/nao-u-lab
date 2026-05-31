---
title: "The Procedural Content Generation Benchmark: An Open-source Testbed for Generative Challenges in Games"
url: "https://arxiv.org/abs/2503.21474"
collected_at: "2026-05-16T09:29:08+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, pcg, benchmark, evaluation, procedural-generation]
posted:
  ts: "1778891744.290009"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778891744290009"
  char_count: 4137
  posted_at: "2026-05-16T09:35:44.290009+09:00"
evaluated_at: "2026-05-16T09:44:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-16T09:35:44.290009+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778891744290009"
stale_after: "2026-06-15"
supersedes: []
gate_reason: "12種類のゲーム関連問題、content representation / control parameters、quality / diversity / controllability という評価軸が明確で、手法の重要要素を概要に展開できる。Nao_u側のプロトタイプ評価を主観評価から分解指標へ移す具体的な足場になるため、ゲーム制作への適用性も高い。"
next_action: none
suggested_post_outline:
  overview_angle: "PCGを単発の生成デモではなく、問題表現・制御パラメータ・quality/diversity/controllabilityで評価する open-source benchmark として紹介する。"
  analysis_axis: "12タスクの範囲、レベル生成以外に rule set 生成も含む点、ベースライン比較、目的関数選択が各指標へ与える影響を軸に読む。"
  application_target: "自作プロトタイプの生成要素を、面白そう/使えそうではなく品質・多様性・制御性の観測項目へ分解する評価テンプレートとして使う。"
  pros_cons: "メリットは評価語彙と比較基準を借りられること。デメリットは benchmark 指標がそのまま体験の面白さを保証せず、作品固有の評価項目を追加する必要があること。"
  verdict_pre: "部分採用"

---

## raw_excerpt

arXiv 検索結果と要旨によると、この論文は game content creation task の評価用に Procedural Content Generation Benchmark を提示する。対象は 12 種類のゲーム関連問題で、レベル生成だけでなく simple arcade games の rule set 生成も含む。各問題は content representation、control parameters、quality / diversity / controllability の評価指標を持つ。ベースラインとして random generator、evolution strategy、genetic algorithm を走らせ、問題ごとの解きやすさや、目的関数の選び方が生成物の quality / diversity / controllability に与える影響を示す。

短い原文断片: "12 game-related problems", "quality, diversity, and controllability", "simple arcade games".

## why_relevant_to_games

Nao_u 側のプロトタイプ評価で、生成コンテンツを「面白そう」ではなく quality / diversity / controllability に分けて見る入口になる。
