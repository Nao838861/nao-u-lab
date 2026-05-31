---
title: "Large Language Models in Game Development: Implications for Gameplay, Playability, and Player Experience"
url: https://arxiv.org/abs/2603.27896
collected_at: 2026-05-17T20:52:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, llm, player-experience, playability, game-engineering]
evaluated_at: "2026-05-17T21:00:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-17T21:00:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-17T21:00:00+09:00"
stale_after: "2026-06-16"
supersedes: []
next_action: revise_or_research
gate_reason: |
  gameplay / playability / player experience という問題設定は Nao_u_BOT に関係するが、candidate 本文は abstract レベルで、2 つの事例の中身や分析手続きがまだ薄い。
  現状では「LLM 統合は多様性を増やすが一貫性を壊す」という一般論に留まり、CoopEval 水準の概要を書くには原文の事例・引用・評価粒度を追加確認する必要がある。

---

## raw_excerpt
arXiv abstract からの要点抜粋。LLM をゲーム開発に統合した時、gameplay / playability / player experience がどう変わるかを扱う。研究方法は、LLM を architectural components として組み込んだ 2 つのゲームプロジェクトの collaborative autoethnographic study。開発者の reflective narratives と development artifacts を、gameplay、playability、player experience の構成概念で分析する。結果として、LLM 統合は variability と personalization を増やす一方で、correctness、difficulty calibration、structural coherence に関する課題を導入する、と整理している。生成AIが既存のゲーム構成概念をどう変形し、game engineering に新しい品質考慮を持ち込むかの preliminary empirical insight という位置づけ。

## why_relevant_to_games
LLM をゲーム内/制作内の部品に入れる時、「個性が増える」だけでなく、正しさ・難度調整・構造的一貫性の検査項目を増やす必要がある、という観点の収集。
