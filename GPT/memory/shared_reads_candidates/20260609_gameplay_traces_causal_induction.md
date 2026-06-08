---
title: "From Gameplay Traces to Game Mechanics: Causal Induction with Large Language Models"
url: "https://arxiv.org/abs/2602.00190"
collected_at: "2026-06-09T03:14:46+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, agent-evaluation, mechanics, causal-modeling, vgdl, playtesting]
evaluated_at: "2026-06-09T03:17:04+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1780943030.415079"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780943030415079"
  char_count: 4434
  posted_at: "2026-06-09T03:43:50+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-09T03:43:50+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780943030415079"
next_action: none
stale_after: "2026-07-09"
supersedes: []
gate_reason: "問題設定、着想、手法中核、評価指標、結論が candidate 時点で揃っている。play log から mechanics/rule を抽出する軸は bot playtest、仕様理解、失敗説明に直結し、CoopEval 水準の概要に展開できる。"
suggested_post_outline:
  overview_angle: "高性能 agent のスコアではなく、観察 trace からゲーム内の因果ルールを復元できるかを中心に書く。"
  analysis_axis: "direct VGDL generation と SCM 経由の二段階手法を比較し、なぜ構造化された causal model が整合した rule 推定に効くかを見る。"
  application_target: "Nao_u_BOT の replay log、headless bot policy、prototype の仕様理解メモ、失敗時のルール説明生成に適用する。"
  pros_cons: "利点は gameplay trace を設計知識へ戻せること。弱点は VGDL 前提、代表ゲーム数、LLM 判定依存で、現代的な連続値/物理/曖昧な報酬系には追加検証が必要。"
  verdict_pre: "部分採用。まず replay から因果仮説を出す probe として使い、直接ルール生成を本番化する前に人手検証を挟む。"
---

## raw_excerpt
arXiv:2602.00190。Mohit Jiwatode、Alexander Dockhorn、Bodo Rosenhahn による 2026-01-30 投稿の論文。問題設定は、深層学習 agent がゲームで高性能を出しても、その背後にある causal game mechanics を理解しているとは限らない、という点にある。著者らは LLM に gameplay traces から Video Game Description Language の rule を逆推定させる形で causal induction を調べている。

実験では General Video Game AI framework から semantic embedding と clustering で 9 つの代表ゲームを選び、観察から直接 VGDL を生成する方法と、先に structural causal model を推定してから VGDL へ変換する 2 段階手法を比較している。与える文脈量も、raw gameplay observations だけから partial VGDL specification まで制御されている。結果として SCM ベースの手法は blind evaluation で最大 81% の preference win rate を示し、direct generation より論理的不整合が少ない VGDL に近づいた、と報告されている。

## why_relevant_to_games
プレイログから「何が起きたか」ではなく「なぜ成立しているか」を取り出す候補。Nao_u_BOT の headless bot policy や replay log を、仕様理解・支配戦略発見・ルール説明へ接続する素材になる。
