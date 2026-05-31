---
title: "Bounded Autonomy: Controlling LLM Characters in Live Multiplayer Games"
url: https://arxiv.org/abs/2604.04703
collected_at: 2026-05-16T07:35:00+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, llm-npc, multiplayer, control-interface, player-steering]
source_note: "新規Web検索: arXiv page checked 2026-05-16"
evaluated_at: 2026-05-16T07:36:00+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-16T08:01:10+09:00"
last_decision: posted
stale_after: "2026-06-15"
supersedes: []
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778884870965799"
posted:
  ts: "1778884870.965799"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778884870965799"
  char_count: 3720
  posted_at: "2026-05-16T08:01:10+09:00"
next_action: none
gate_reason: |
  3つの制御インターフェース、reply-chain decay、action grounding、whisper、評価軸が揃っており、概要の骨格を作れる。
  LLM NPCを自由会話として扱わず、世界実行・相互作用・プレイヤー介入へ分ける視点はゲーム制作に具体的に転用可能。
  ただしライブマルチプレイヤー社会ゲーム前提が強いため、Phase 3では適用範囲をNPC/AI演出に絞る必要がある。
suggested_post_outline:
  overview_angle: "LLMキャラクターの自由度を削る話ではなく、実行可能性・社会的整合・プレイヤー操舵を分離する設計として書く。"
  analysis_axis: "agent-agent、agent-world、player-agent steeringの3面と、decay/grounding/whisperがどの失敗を抑えるかを見る。"
  application_target: "会話NPC、支援AI、群衆/仲間キャラを持つ試作で、AI行動を世界状態とプレイヤー意図に接続する設計レビューに効く。"
  pros_cons: "メリットは暴走会話・実行不能行動・プレイヤー疎外の分解。デメリットは非マルチプレイヤー作品では評価設計を再構成する必要がある。"
  verdict_pre: "部分採用"

---

## raw_excerpt

短い原文フレーズ: "agent-agent interaction, agent-world action execution, and player-agent steering"。

arXiv抄録メモ: この論文は、LLMキャラクターがライブマルチプレイヤーゲーム内で会話や社会的行動を担う時、ゲーム世界で実行可能で、他キャラクターとの社会的整合性を保ち、必要に応じてプレイヤーが操舵できるようにする制御問題を扱う。提案する bounded autonomy は、LLMキャラクター制御を3つのインターフェースに分ける。実装要素として、会話の連鎖が過剰に伸びないようにする probabilistic reply-chain decay、embedding による action grounding と fallback、プレイヤーが完全に上書きせず次の行動に影響を与える軽量 soft-steering 技法 whisper が挙げられている。評価はライブマルチプレイヤー社会ゲームで行われ、interaction stability、grounding quality、whisper intervention success、formative interviews を見る。

## why_relevant_to_games

LLM NPCを「自由会話」だけでなく、世界への実行、NPC同士の相互作用、プレイヤーからの軽い介入に分けて設計する候補になる。
