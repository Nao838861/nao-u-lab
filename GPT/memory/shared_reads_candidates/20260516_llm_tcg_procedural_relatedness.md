---
title: "From LLM-Driven Trading Card Generation to Procedural Relatedness: A Pokemon Case Study"
url: https://arxiv.org/abs/2604.27972
collected_at: 2026-05-16T03:29:17+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, pcg, generative-ai, trading-card-game, personalization]
evaluated_at: 2026-05-16T03:31:58+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-16T03:40:28+09:00"
last_decision: posted
stale_after: "2026-06-15"
supersedes: []
gate_reason: >-
  問題設定が「メタ安定後の TCG で支配戦略が固定化し、カード選択体験が反復化する」点に立っており、
  LLM/diffusion を単なる大量生成ではなく player-card の固有関係を作る procedural relatedness として扱える。
  49 participants / 196 samples の評価があり、ゲーム制作側の PCG・共創 UI・個人化報酬設計へ具体的に接続できる。
suggested_post_outline:
  overview_angle: "TCG カード生成を、性能差分ではなくプレイヤーが自分の意図や愛着を反映できる procedural relatedness の問題として読む。"
  analysis_axis: "player-centric co-creation、fine-tuned embeddings、local LLM、diffusion の分担と、visuals/mechanics の aesthetics・representativeness 評価。"
  application_target: "Nao_u 側の PCG、装備・スキル・カード的報酬生成、プレイヤー調整 UI、メタ固定化を避ける生成物評価。"
  pros_cons: "メリットは生成物の所有感と反復プレイの理由を設計対象にできる点。デメリットはバランス検証と prompt 調整負荷、TCG 外への転用時に関係性指標を再定義する必要がある点。"
  verdict_pre: "部分採用"
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778870429034319"
next_action: none
posted:
  ts: "1778870429.034319"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778870429034319"
  char_count: 3533
  posted_at: "2026-05-16T03:40:28+09:00"

---

## raw_excerpt
arXiv:2604.27972。Johannes Pfau / Panagiotis Vrettis。2026-04-30 submitted。Trading Card Game は継続的な更新、バランス調整、ローテーション制約でエンゲージメントを維持するが、メタゲームが安定すると支配的戦略が固定化し、使えるカード選択肢が狭まり、体験が反復的になる、という問題設定。

論文は LLM と Image Diffusion Model を TCG カードの PCG に使い、単なる大量生成ではなく、プレイヤーとカードの固有のつながりを作る "procedural relatedness" を狙う。パイプラインは player-centric co-creation、fine-tuned embeddings、local LLMs、Diffusion Models を組み合わせ、動的でパーソナライズされたカードを生成する構成。

評価は 49 participants が 196 Pokemon card samples を生成し、visuals と mechanics の aesthetics / representativeness を評価し、定性的フィードバックも集めた。結果は満足度が高く、多くの参加者が prompt adjustments によって自分のアイデアを実現できた、という報告。

## why_relevant_to_games
カード・装備・スキルを「性能の差し替え」ではなく「プレイヤーが自分の意図を反映した関係性」として生成する候補。Nao_u 側では、メタ停滞を壊す PCG や、LLM生成物をプレイヤーが調整する UI の材料になる。
