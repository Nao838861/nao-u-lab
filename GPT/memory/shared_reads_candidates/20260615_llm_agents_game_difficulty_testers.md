---
title: "LLMs May Not Be Human-Level Players, But They Can Be Testers: Measuring Game Difficulty with LLM Agents"
url: "https://arxiv.org/abs/2410.02829"
collected_at: "2026-06-15T22:45:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, playtesting, difficulty, llm-agents, evaluation]
evaluated_at: "2026-06-15T22:18:36+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781529807.632869"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781529807632869"
  char_count: 3833
  posted_at: "2026-06-15T22:23:57+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-15T22:23:57+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781529807632869"
next_action: none
stale_after: "2026-07-15"
supersedes: []
gate_reason: "問題設定が「LLM を人間代替ではなく難度差の相対測定器として使う」に明確で、Wordle / Slay the Spire と human difficulty indication との相関という評価軸もある。Nao_u_BOT の headless bot / policy matrix / 主観レビュー接続に直接転用でき、CoopEval 水準の概要へ展開できる。"
suggested_post_outline:
  overview_angle: "LLM agent の絶対的な人間らしさではなく、build 間・局面間の難度差を測る検査器として位置づける。"
  analysis_axis: "対象ゲーム、agent performance、人間の difficulty indication、相関の扱い、generic prompting でも得られる signal の限界を分けて読む。"
  application_target: "headless 評価、PlaytestArena、prototype の難度 regression、Nao_u 主観レビュー前の差分検出 probe。"
  pros_cons: "メリットは低コストで反復可能な相対測定。デメリットは楽しさ・納得感・探索動機を人間同等には測れず、agent policy の偏りを誤読しやすい点。"
  verdict_pre: "部分採用。人間代替ではなく、差分検出用の補助計測として採用する。"
---

## raw_excerpt

arXiv / ACM CHI PLAY 2025 候補メモ。Chang Xiao と Brenda Z. Yang による論文。問題設定は、LLM agent が人間プレイヤーほど強くなくても、開発中ゲームの難度測定に使えるかというもの。対象は Wordle と Slay the Spire。LLM agent の絶対性能を人間平均に近づけることではなく、人間プレイヤーが感じる難度や達成困難さと、LLM agent の成績がどれだけ相関するかを見る。検索結果の要旨では、simple / generic prompting による LLM agent の performance が、human players による difficulty indication と統計的に有意で強い相関を示したとされる。論文は、LLM を「人間代替プレイヤー」ではなく、難度差を検出する game-testing agent として扱うための general principles と guidelines も述べている。

ゲーム制作文脈では、headless bot が人間の楽しさを完全に再現しなくても、build 間の難度差、詰まりやすい局面、ルール理解の失敗を検出する probe として使える可能性を示す資料として候補化する。特に Nao_u_BOT の過去 prototype で課題になった「bot policy は弱いが、差分検出には使えるのか」という問いに近い。

## why_relevant_to_games

LLM agent を人間プレイヤーの代替ではなく、難度の相対測定器として使う観点が、headless 評価と Nao_u の主観レビューを接続する設計に効く。
