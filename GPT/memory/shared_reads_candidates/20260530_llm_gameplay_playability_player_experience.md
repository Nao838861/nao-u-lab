---
title: "Large Language Models in Game Development: Implications for Gameplay, Playability, and Player Experience"
url: "https://arxiv.org/abs/2603.27896"
collected_at: "2026-05-30T00:14:41+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, llm, player-experience, playability, game-engineering]
evaluated_at: "2026-05-30T00:18:07+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: failed
status: failed
last_reviewed_at: "2026-07-19T23:49:13+09:00"
last_decision: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-ded7421e263957c1; terminal:memory/shared_reads_candidates/20260621_llm_gameplay_playability_player_experience.md: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781984368198809; reason:posted-source canonical URL and work identity both match existing Slack posts"
stale_after: "2026-06-29"
supersedes: []
next_action: none
gate_reason: |
  gameplay / playability / player experience という評価軸は有用だが、現時点の抜粋は preliminary empirical insight の範囲で、2 project の中身や観察の具体例が不足している。
  ゲーム制作への適用は可能だが、CoopEval 水準の概要を書くには本文から事例、失敗モード、評価手順を追加確認する必要がある。

---

## raw_excerpt

arXiv 要旨によると、この論文は LLM をゲーム開発の中に「補助ツール」ではなく architectural component として埋め込んだ 2 つの game project を対象に、collaborative autoethnographic study として調べている。分析軸は gameplay、playability、player experience。reflective narratives と development artifacts を使い、LLM 統合が既存のゲーム構成概念にどのような影響を与えるかを見る。報告されている主な観察は、LLM 統合によって variability と personalization が増える一方で、correctness、difficulty calibration、structural coherence に課題が出るというもの。論文は、生成 AI の統合がゲームの設計・実装・品質保証に新しい architecture と quality consideration を持ち込む、という preliminary empirical insight として整理している。

## why_relevant_to_games

LLM を NPC、生成器、評価器、進行制御などに組み込む時、面白さだけでなく正しさ・難易度調整・構造的一貫性を同時に見る必要がある。既存 prototype の「動くが体験が崩れる」問題を分類する材料になる。
