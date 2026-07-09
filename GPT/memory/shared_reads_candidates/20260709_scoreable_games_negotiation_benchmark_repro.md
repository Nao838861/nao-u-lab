---
title: "[Re] Benchmarking LLM Capabilities in Negotiation through Scoreable Games"
url: "https://arxiv.org/abs/2602.18230"
collected_at: "2026-07-09T23:48:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, negotiation, benchmark, evaluation, multi-agent]
evaluated_at: "2026-07-09T23:52:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-09T23:52:00+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-09T23:52:00+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-08"
supersedes: []
gate_reason: >-
  Scoreable Games の再現実験と追加 metric という対象が明確で、問題設定・手法・評価・限界を候補本文から抽出できる。
  勝率だけでは歪む negotiation / alliance / betrayal 系 AI 評価の metric 設計に直結し、Nao_u 向け headless multi-agent 評価へ適用しやすい。
suggested_post_outline:
  overview_angle: "Scoreable Games を、LLM 交渉能力の勝敗表ではなく benchmark objectivity と context 依存性を検査する再現研究として読む。"
  analysis_axis: "元 benchmark の replicate、negotiation quality / evaluation evenness の追加 metric、model comparison が ambiguous になる要因、leakage / ablation の限界を分けて整理する。"
  application_target: "交渉・取引・同盟・裏切りを含む自作ゲームの headless multi-agent 評価で、勝率以外の評価軸と benchmark 妥当性チェックを設計する材料にする。"
  pros_cons: "メリットは評価指標の歪みを検出する観点が具体的なこと。デメリットは benchmark 自体の objectivity と leakage 検証に未解決部分が残ること。"
  verdict_pre: "部分採用。Scoreable Games 自体を採用するより、評価指標セットと再現性チェックリストを抽出して使う。"
---

## raw_excerpt
arXiv:2602.18230。Jorge Carrasco Pollo, Ioannis Kapetangeorgis, Joshua Rosenthal, John Hua Yao による Scoreable Games negotiation benchmark の再現・拡張検証。抄録は、LLM は multi-agent negotiation task で大きな可能性を示すが、robust で generalizable な benchmark が不足しているため評価が難しい、という問題設定から始める。

対象は Abdelnabi et al. (2024) の Scoreable Games benchmark。論文は元実験を追加モデルで replicate し、negotiation quality と evaluation evenness を確認する追加 metric を導入する。結果として、benchmark は複雑ではあるが、model comparison は ambiguous であり objectivity に疑問が残る、と述べている。さらに information leakage detection と ablation study の thoroughness に制約がある点を指摘し、より広い model 群での行動分析を通じて、benchmark 利用者に追加 context を与えることを狙う。

短い原文断片: "model comparison is ambiguous" / "importance of context in model-comparative evaluations"。

## why_relevant_to_games
交渉・取引・同盟・裏切りを含むゲームで、AI actor の強さを単純な勝率だけで比べると評価が歪む可能性を拾える。Scoreable Games の再現性論点は、Nao_u 向け headless multi-agent 評価の metric 設計候補になる。
