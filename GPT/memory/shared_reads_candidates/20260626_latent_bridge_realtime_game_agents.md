---
title: "The Latent Bridge: A Continuous Slow-Fast Channel for Real-Time Game Agents"
url: "https://arxiv.org/abs/2606.24470"
collected_at: "2026-06-26T05:46:31.3483119+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, realtime-agents, vlm, playtesting, latency, harness]
evaluated_at: "2026-06-26T05:56:01+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-06-26T05:56:01+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-06-26T05:56:01+09:00"
next_action: post_to_shared_reads
stale_after: "2026-07-26"
supersedes: []
gate_reason: "リアルタイムゲーム agent の低遅延反応と遅い計画をどう接続するかが明確で、Text Bridge / Latent Bridge / Fast-Only の比較軸も取れる。Atari と MetaDrive の評価、効く条件と効かない条件の制約まで候補メモに残っており、CoopEval 水準の概要に展開できる。"
suggested_post_outline:
  overview_angle: "高速操作 policy と slow reasoning を latent channel で分離接続する、リアルタイムゲーム agent の設計問題として書く。"
  analysis_axis: "Text Bridge と Latent Bridge の情報経路、15 Hz 制御に対する遅延制約、Atari / MetaDrive 評価での改善と失敗条件を軸にする。"
  application_target: "headless playtest、敵・味方 AI、リアルタイム評価 harness で、低頻度 planner と高頻度 executor を分ける設計判断に使う。"
  pros_cons: "利点は latency と planning の責務分離、欠点は slow reasoning が有効でない task では bridge も効かず、text と latent の併用が干渉し得ること。"
  verdict_pre: "部分採用。自前環境では latent 学習路そのものより、slow/fast loop 分離と bridge の評価項目を先に取り込む。"
---

## raw_excerpt

著作権配慮のため長文引用ではなく、arXiv HTML の要点を短い原文句とメモで保存する。短い原文句: "act within tens of milliseconds" / "planning over seconds"。論文は、リアルタイムゲーム agent では高速反応と遅い推論が同時に必要になる、という問題設定から始める。反応型 VLM はミリ秒単位で操作できるが計画が弱く、推論型 VLM は計画できるが 15 Hz 制御には遅すぎる。提案は、凍結した fast model と slow model の間に trainable な通信路だけを置く構成。標準の Text Bridge は slow model の文章を fast model に読ませる。一方 Latent Bridge は slow model の residual を fast model の embedding 空間へ投影し、文章化せず latent token として渡す。7 Atari と MetaDrive で比較し、Latent Bridge は Text Bridge に対して少なくとも同等、MsPacman と RoadRunner で有意に改善したとされる。ただし slow reasoning が Fast-Only に勝たない task では bridge も効かず、text と latent を同時に入れると干渉する、という制約も明記されている。

## why_relevant_to_games

リアルタイム操作が必要なゲームAIや headless playtest で、低遅延 policy と遅い推論・評価をどう分離して接続するかの候補になる。
