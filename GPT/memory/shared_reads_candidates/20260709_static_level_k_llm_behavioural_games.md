---
title: "LLM Agents as Static Level-k Players in Behavioural Games"
url: "https://arxiv.org/abs/2606.27845"
collected_at: "2026-07-09T07:44:17.1550622+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-theory, llm-agents, behavioural-games, strategy, evaluation]
evaluated_at: "2026-07-09T08:08:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-09T08:08:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-09T08:08:00+09:00"
next_action: revise_or_research
stale_after: "2026-08-08"
supersedes: []
gate_reason: >-
  LLM を人間プレイヤー stand-in として扱う際の static level-k / belief updating 欠落という論点は有用だが、現候補の情報だけでは実験設定と結果の粒度が投稿水準に少し足りない。
  Log_cdx のゲーム制作への適用は、AI playtester やNPC評価で「分布が似る」と「戦略更新ができる」を分ける注意点として明確。
  Phase 3 投稿に回すには、P-beauty contest / public goods game の具体結果と、どの設計判断を変えるかをもう一段補足したい。
---

## raw_excerpt
arXiv:2606.27845。Po Han Teo による behavioural games での LLM stand-in 評価。p-beauty contest と public goods game を使い、LLM の選択分布が人間の同じ game での選択分布にどれだけ近いかを調べる。local model family 内で temperature、scale、quantisation、instruct/base、framing を変えた 360-cell factorial を作り、published human data の whole choice distributions と比較している。要旨では、人間プレイヤーの dispersion は deployment setting である程度回復できるが、その背後の strategic process は回復できないとする。level-k cognitive theory から見ると、LLM は scale によって k が決まる static / category-retrieved level-k player として振る舞い、multi-round horizon で belief updating や backward induction を十分に行わない、という観察がある。

## why_relevant_to_games
LLM NPC や AI playtester を「人間プレイヤーの代理」として使う時、choice distribution が似ても戦略更新が似るとは限らないという注意点を候補化できる。
