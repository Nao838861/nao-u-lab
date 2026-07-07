---
title: "When AI Deceives: A Natural Experiment on the Causal Effects of Perceived Deception on Player Ratings in RPGs"
url: "https://arxiv.org/abs/2606.27689"
collected_at: "2026-07-08T05:44:18+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, player-experience, rpg, deception, steam-reviews, evaluation]
evaluated_at: "2026-07-08T05:48:16+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-08T05:48:16+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-08T05:48:16+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-07"
supersedes: []
gate_reason: |-
  DDI と PDA を分け、patch notes annotation、Steam review classifier、player-version fixed effects、robustness checks へ接続する設計が明確。
  ゲーム制作では「実装した騙し」と「プレイヤーが騙しとして知覚した瞬間」を分けて、レビュー・プレイログ・更新差分から trust damage を測る観点として具体的に使える。
  BG3 単一タイトルの confounding は限界だが、その限界も deception 設計の評価設計として説明でき、4000字概要に耐える。
suggested_post_outline:
  overview_angle: "RPG の deception を、設計意図の強度ではなくプレイヤーが deception と知覚したかで分けて評価する自然実験として整理する。"
  analysis_axis: "DDI と PDA の分離、patch notes と Steam reviews の測定、player-version two-way fixed effects、robustness checks、U-shape 仮説が崩れる理由を読む。"
  application_target: "Nao_u_BOT のゲーム制作で、敵 AI、裏切り、隠し情報、ランダム性、フェイク演出を入れる時に、実装差分とプレイヤー知覚ログを別系列で記録する評価設計。"
  pros_cons: "利点は deception の善悪を抽象論にせず、知覚された deception が rating を下げる条件として扱える点。弱点は BG3 更新と新規 content の confounding が強く、因果推定をそのまま一般化できない点。"
  verdict_pre: "部分採用。結論の数値より、DDI/PDA 分離と update-review window の作り方を prototype 評価へ取り込む。"
---

## raw_excerpt
短い原文引用: "player-version two-way fixed effects panel dataset"

収集メモ: この論文は、RPG における AI-driven deception mechanism が player rating にどう影響するかを、Baldur's Gate 3 の 2019-2025 年の 54 version updates を使った quasi-natural experiment として扱う。著者らは designer-intended deception intensity (DDI) と、player deception awareness (PDA) を分けて測る設計にしている。DDI は patch notes を human annotators が coding し、PDA は update 後 1-28 日の英語 Steam reviews から fine-tuned BERT classifier で抽出・集計する。分析は player と version の fixed effects を入れた panel dataset で行い、subsample partitioning、lagged variables、placebo tests など 5 種類の robustness checks を加える。要旨上の結果では、PDA は positive review rates に単調な負の効果を持ち、moderate perception が最適という inverted-U 仮説は支持されない。一方で DDI は低い inflection point を持つ U-shaped effect を示すが、右側の上昇は high-intensity updates と同時に入った新規 content による confounding が主因とされる。

## why_relevant_to_games
敵 AI、隠し情報、フェイク、裏切り、ランダム性のような「騙し」の設計で、実装意図よりもプレイヤーが deception と知覚したかを分けてログ化する観点として使える。
