---
title: "LLM Semantic Signaling Game and Mechanism Design: Systematic Blindness, Awareness Shaping, and Mindset Dynamics"
url: "https://arxiv.org/abs/2606.29113"
collected_at: "2026-07-06T08:45:21+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-theory, multi-agent, communication, deception, llm-agents, mechanism-design]
evaluated_at: "2026-07-06T08:47:48+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-06T08:47:48+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-06T08:47:48+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-05"
supersedes: []
gate_reason: >-
  自然言語を単なる生成文ではなく、sender の semantic control、receiver awareness、
  欺瞞検出、mechanism design で閉じた signaling game として扱う核が明確。
  hidden-role、交渉、NPC 会話で「何を見落とすか」を設計変数にでき、4000字級の概要に耐える。
suggested_post_outline:
  overview_angle: "LLM 生成メッセージを、意味操作・受信者の認識範囲・検出規則・制度設計を含む signaling game として解く軸で書く。"
  analysis_axis: "systematic blindness の形式化、likelihood-ratio decision rule、Perfect Bayesian Nash equilibrium、awareness/cost/population 介入の関係を追う。"
  application_target: "hidden-role、交渉、説得、NPC 会話で、台詞本文だけでなく受信者が検出できる特徴量と見落としをゲームメカニクスにする設計へ適用する。"
  pros_cons: "強みは自然言語欺瞞を設計変数へ落とせる点。弱みは Gaussian approximation と数値実験中心で、実プレイヤーの会話 UX には別検証が必要な点。"
  verdict_pre: "部分採用。対話ゲームの deception/awareness 設計語彙として採用し、実装時は小さな会話プローブで検証する。"
---

## raw_excerpt

arXiv:2606.29113。2026-06-27 submitted。論文は、LLM が自然言語を介した戦略的相互作用を仲介する状況で、semantic control、受信者の awareness、欺瞞検出、均衡、mechanism design を一つの signaling game として扱う。sender は semantic control を選び、LLM は stochastic message を生成し、receiver は awareness-dependent scoring mechanism によって message を評価する。ここで receiver awareness は「どの言語特徴を知覚し、推論に使えるか」を決める type としてモデル化され、systematic blindness の形式化に使われる。

手法面では、message score の aggregate を Gaussian approximation で扱い、likelihood-ratio decision rule を導く。さらに Perfect Bayesian Nash equilibrium によって、sender / receiver が互いの type や検出可能性を踏まえてどう振る舞うかを解析する。後半では、receiver awareness を reshaping する、deceptive semantic control に cost を付ける、receiver population を変える、といった mechanism-design 側の介入を置き、benign pooling equilibria や phishing attack 成功率低下を数値実験で見る。実験は Gaussian approximation、awareness ordering、adaptive adversary 下の mindset dynamics、guardrail cost の効果を確認する構成。

## why_relevant_to_games

NPC 会話、交渉、欺瞞、説得、hidden-role 型のゲームで、プレイヤーや agent が「何を見落とすか」まで含めたコミュニケーション設計の参照になる。自然言語を単なる台詞ではなく、状態・検出・駆け引きに接続する候補として保存する。
