---
title: "When Claws Remember but Do Not Tell: Stealthy Memory Injection in Persistent Personal Agents"
url: "https://arxiv.org/abs/2607.05189"
collected_at: "2026-07-18T20:31:51.9005046+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-memory, security, persistent-agents, benchmark, game-production]
---

## raw_excerpt

arXiv:2607.05189、2026-07-06 submitted。長期記憶と外部環境へのアクセスを持つ personal agent では、untrusted content が記憶へ静かに書き込まれ、後の行動で trusted state として再利用される経路が生まれる。論文は、一通の email payload が poisoned memory を作り、当初の user-facing response では隠れ、将来行動へ影響する stealth memory injection を定義する。WhisperBench は fact / preference poisoning と5 risk categories を含む108 case で、real IMAP/SMTP workflow と実際の email-agent skill を用い、攻撃の全 cycle を評価する。one-shot かつ runtime feedback なしの black-box 条件に対し、MemGhost は environment proxy で persistent agent の実行を模倣し、objective proxy で memory adoption と conversational stealth を密な rubric reward に変換して attacker policy を訓練する。56 held-out cases で、OpenClaw + GPT-5.4 に87.5%、Claude Code SDK + Sonnet 4.6 に71.4%の end-to-end success を報告し、異なる agent architecture と filesystem / vector memory backend への transfer も調べている。原文は persistent memory が “ordinary external processing” を長期 compromise の経路へ変えうると述べる。

## why_relevant_to_games

外部記事、Slack、playtest report、asset metadata を制作 agent の長期記憶へ取り込む運用で、収集時と recall-to-action 時の信頼境界を検討する材料になる。
