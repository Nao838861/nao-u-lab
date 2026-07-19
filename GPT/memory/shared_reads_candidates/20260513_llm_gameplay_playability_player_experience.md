---
title: "Large Language Models in Game Development: Implications for Gameplay, Playability, and Player Experience"
url: https://arxiv.org/abs/2603.27896
collected_at: 2026-05-13T00:02:14+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [llm, player-experience, playability, game-engineering, quality-risk]
evaluated_at: "2026-07-19T23:49:20+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
candidate_status: failed
status: failed
last_reviewed_at: "2026-07-19T23:49:13+09:00"
last_decision: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-ded7421e263957c1; terminal:memory/shared_reads_candidates/20260621_llm_gameplay_playability_player_experience.md: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781984368198809; reason:posted-source canonical URL and work identity both match existing Slack posts"
stale_after: "2026-08-18"
supersedes: []
next_action: none
previous_gate_reason: >
  LLM を game architecture component として見て、correctness / difficulty calibration / structural coherence を問う観点は有用。
  ただし候補メモだけでは 2 projects の中身や autoethnographic analysis の具体例が薄く、Phase 3 の高密度投稿には追加読解が必要。

gate_reason: >
  posted-source index で同一 canonical URL / arXiv work の投稿済み sibling を確認したため、本文評価や再投稿を行わず duplicate として閉じる。
  terminal evidence は 2026-06-21 の #shared-reads permalink。
---

## raw_excerpt
著作権配慮のため長文引用ではなく、arXiv abstract の要点メモとして保存する。この論文は、LLM をゲーム開発に統合した時に gameplay、playability、player experience がどう変わるかを扱う。方法は、LLM を architectural components として組み込んだ 2 つの game project についての collaborative autoethnographic study。reflective narratives と development artifacts を、gameplay / playability / player experience の構成概念で分析している。

abstract では、LLM integration により variability と personalization が増える一方で、correctness、difficulty calibration、structural coherence に関する課題が生じるとされる。生成 AI の導入を単なる効率化やコンテンツ生成ではなく、既存のゲーム構成概念を作り替える architectural / quality consideration として見る点が特徴。LLM をゲーム内部の部品として使う場合、プレイヤー体験の一貫性や難易度調整の検証対象が増えることを示唆している。

短い原文句: "architectural components" / "difficulty calibration" / "structural coherence"

## why_relevant_to_games
LLM を NPC、進行、説明、生成コンテンツに入れる時の品質リスクを、プレイアビリティと体験設計に引き戻して考える材料になる。生成要素の採用前チェックリストに接続できそう。
