---
title: "FIERO: Empowering Creative Writing Through Collaborative Game Play"
url: "https://arxiv.org/abs/2607.11837"
collected_at: "2026-07-27T09:16:27.7846770+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, collaborative-play, generative-ai, storytelling, player-agency]
evaluated_at: "2026-07-27T09:22:54+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-27T09:22:54+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-27T09:22:54+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-26"
supersedes: []
gate_reason: |-
  共同物語制作の不一致・断片化という問題、物理カードと生成 AI の役割分解、比較条件、N=60、創造性・一貫性・agency の結果が揃っている。
  AI に創作を委譲せず共同選択と統合を支援させる構成を協力ゲームの試作へ具体化でき、評価上の限界を含む約4000字の分析に耐える。
suggested_post_outline:
  overview_angle: "生成 AI 単体の文章生成ではなく、物理カードが社会的参加を、画面側 AI が文脈統合と一貫性維持を担う役割分解として説明する。"
  analysis_axis: "online collaborative writing 条件との比較、N=60、着想流暢性・新規性・物語一貫性・agency を結び、各効果をどの機構が生んだかは分離し切れない限界も扱う。"
  application_target: "Log_cdx の協力ゲーム試作で、プレイヤーが素材提示と選択を所有し、AI は候補の可視化・矛盾検出・複数案統合に限定する interaction loop を設計する。"
  pros_cons: "利点は対面の社会性と生成支援を両立し、agency を残したまま物語の一貫性を上げること。欠点は複合システムのためカード・対面・AI の寄与を切り分けにくく、文章以外への一般化も未検証なこと。"
  verdict_pre: "部分採用。AI 自動執筆ではなく、共同選択の後に統合案を返す一手として小規模なカード型 prototype で検証する。"
---

## raw_excerpt

原文冒頭は “Creativity often flourishes in collaboration” と置く。一方、共同物語制作では、参加者間の筋書きへの不一致や、個別に出された着想の断片化が起こりやすく、既存の同期型オンライン文章共有ツールは対面協働の社会的力学を十分扱わない、と問題を設定する。FIERO はこの課題に対して作られた multiplayer web-based card game である。物理カードが触れられる足場と対面の相互作用を担い、デジタル画面が文脈に沿う画像生成、集団での選択、物語の一貫性維持、生成 AI による複数アイデアの統合を担う。オンライン共同執筆のみの条件と比べた N=60 の実験では、直感的刺激、アイデア流暢性、新規性生成が有意に高まり、完成した物語の筋の一貫性も改善したと報告する。カードは創作の構造と社会的参加を支え、画面側の文脈的 augmentation は player agency を損なわなかったとしている。CHI PLAY 2026 発表予定、51ページ・図14点・表5点。

## why_relevant_to_games

生成 AI を自由回答役にせず、物理カード・共同選択・一貫性維持に役割分解して player agency を残す構成は、協力ゲームや共同物語メカニクスを試作する場面の参照候補になる。
