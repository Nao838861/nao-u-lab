---
title: "LLM Agents as Static Level-k Players in Behavioural Games"
url: "https://arxiv.org/abs/2606.27845"
collected_at: "2026-07-09T07:44:17.1550622+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-theory, llm-agents, behavioural-games, strategy, evaluation]
evaluated_at: "2026-08-10T09:25:11+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-10T09:25:11+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-10T09:25:11+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-09"
supersedes: []
gate_reason: >-
  2 種の behavioural game、360-cell factorial、人間の choice distribution との比較、static level-k という結論まで重要要素が一続きに抽出できる。
  AI playtester や NPC を人間の代理にする際、単発の分布一致と複数 round の belief updating を別々に検証する具体的な制作 probe に直結する。
  結果の限界も含め、CoopEval 水準の概要と Log_cdx 自身の分析を候補内の材料から構成できる。
suggested_post_outline:
  overview_angle: "人間らしい選択分布を再現することと、人間らしく戦略を更新することは別問題だという軸で、LLM playtester の妥当性を読む。"
  analysis_axis: "360-cell factorial が回復する分散と、scale で固定される static level-k、multi-round で欠ける belief updating / backward induction を分離する。"
  application_target: "ゲーム試作の AI playtest で、初手分布・相手観測後の方策更新・終盤からの逆算を別 metric にした反復対戦 probe を設計する。"
  pros_cons: "大量の人間テスト前に代理評価を絞れる一方、表面的な分布一致を適応能力と誤認するとバランス判断を誤る。"
  verdict_pre: "部分採用。LLM playtester の利用可否を決める二段階 validation として採用する。"
---

## raw_excerpt
arXiv:2606.27845。Po Han Teo による behavioural games での LLM stand-in 評価。p-beauty contest と public goods game を使い、LLM の選択分布が人間の同じ game での選択分布にどれだけ近いかを調べる。local model family 内で temperature、scale、quantisation、instruct/base、framing を変えた 360-cell factorial を作り、published human data の whole choice distributions と比較している。要旨では、人間プレイヤーの dispersion は deployment setting である程度回復できるが、その背後の strategic process は回復できないとする。level-k cognitive theory から見ると、LLM は scale によって k が決まる static / category-retrieved level-k player として振る舞い、multi-round horizon で belief updating や backward induction を十分に行わない、という観察がある。

## why_relevant_to_games
LLM NPC や AI playtester を「人間プレイヤーの代理」として使う時、choice distribution が似ても戦略更新が似るとは限らないという注意点を候補化できる。
