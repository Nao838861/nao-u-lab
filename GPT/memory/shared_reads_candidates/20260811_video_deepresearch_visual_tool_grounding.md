---
title: "Video-DeepResearch: Towards the Next-Generation Multimodal Deepresearch Agent"
url: "https://arxiv.org/abs/2608.03979"
collected_at: "2026-08-11T06:44:53+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agent, multimodal, video-understanding, evaluation, automated-playtesting]
evaluated_at: "2026-08-11T06:48:18+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-11T06:48:18+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-11T06:48:18+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-10"
supersedes: []
gate_reason: >-
  問題設定、二つの失敗要因、段階的 tool 解放を含む中核手法、SFT+GRPO、200 問 benchmark と精度まで抽出でき、CoopEval 水準の概要を構成できる。
  実フレーム観察と既知攻略知識への迂回を分離する設計は、録画ベース自動 playtest の観測順序・trace 監査・ablation に直接適用できる。
suggested_post_outline:
  overview_angle: "映像 agent が『見たふり』をする二つの失敗を、perception-first の tool 制御と benchmark で分離した研究として整理する"
  analysis_axis: "modality bias と parametric knowledge leakage の識別、段階的 tool 解放の因果、200 問評価の射程と限界を検討する"
  application_target: "Log_cdx のゲーム録画ベース自動 playtest で、frame 観察を記憶・攻略情報参照より先に固定し、tool trace と回答根拠を比較する評価 harness に使う"
  pros_cons: "観察迂回を実装レベルで抑えられる一方、動画 QA 精度は操作を伴う実 gameplay の成功率ではなく、200 問という規模にも一般化上の限界がある"
  verdict_pre: "部分採用"
---

## raw_excerpt
arXiv:2608.03979、2026-08-04 公開。Zhen Fang、Yu Zeng、Wenxuan Huang ほかによる Video-DeepResearch（Video-DR）は、静止画中心だった multimodal agent の調査を連続映像へ広げ、時間方向に分散した視覚情報の grounding と open-web exploration を組み合わせる。事前評価では、agent が映像を見るための tool を十分使わず text search に迂回する modality bias と、実際の tool execution より model 内部の既知情報へ依存する parametric knowledge leakage を主要なボトルネックとして報告する。提案 pipeline は perception と exploration を分離し、tool を段階的に解放することで、web retrieval より先に複数 frame を横断した視覚確認を促す。学習は supervised fine-tuning の後に GRPO を行う二段構成。併せて、複雑な multi-hop video question answering 200 問からなる Video-DR-Bench を構築し、Video-DeepResearch-35B-A3B は平均 accuracy 64.0%、30B-A3B は 59.3% と報告される。code は Vision-DeepResearch repository で公開されている。著作権配慮のため、ここでは abstract の長文引用ではなく要点を日本語で記録した。

## why_relevant_to_games
画面・録画を読む自動 playtester が、実フレームの観察を飛ばして既知の攻略知識やテキストへ逃げていないかを切り分ける観測設計に使える。frame 横断の perception を web／記憶参照より先に置く段階的 tool 解放は、映像ベース gameplay 評価の実装候補になる。
