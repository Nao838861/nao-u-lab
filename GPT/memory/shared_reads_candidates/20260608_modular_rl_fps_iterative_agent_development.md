---
title: "A Modular Reinforcement Learning Framework for Iterative FPS Agent Development"
url: "https://www.mdpi.com/2079-9292/15/3/519"
collected_at: "2026-06-08T16:44:28+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, reinforcement-learning, fps, npc, iterative-development]
evaluated_at: "2026-06-08T16:47:07+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1780905254.541099"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780905254541099"
  char_count: 4045
  posted_at: "2026-06-08T16:54:25+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-08T16:54:25+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780905254541099"
next_action: none
stale_after: "2026-07-08"
supersedes: []
gate_reason: "問題設定、semantic action modules への分解、個別 policy と報酬、win rate と retraining time の評価が候補メモ内で揃っている。ゲーム AI の差し替え可能な行動 module 設計に直結し、~4000字の概要として展開できる。"
suggested_post_outline:
  overview_angle: "monolithic な FPS agent が反復開発に弱い理由から、Movement / Attack などの semantic module 分解で変更容易性を得る手法として整理する。"
  analysis_axis: "module 境界、独立 policy と specialized reward、性能評価と再訓練時間削減の trade-off を見る。"
  application_target: "Nao_u_BOT の headless bot、敵 AI、移動・攻撃・回避・収集の差し替え可能な behavior layer 設計。"
  pros_cons: "利点は解釈性、局所修正、再訓練負荷の低減。弱点は module 間協調、報酬設計、FPS 以外への一般化検証が必要な点。"
  verdict_pre: "部分採用"
---

## raw_excerpt
MDPI / Electronics 2026 論文の要旨メモ。FPS agent を単一の monolithic policy で訓練すると、movement、attack、sensing など異質な機能が一つの network に混ざり、解釈性と変更容易性が下がる。ゲーム開発では mechanics、balance、behavior が頻繁に変わるため、小さな action-space 変更でも全体再訓練が必要になる構造は扱いにくい。提案手法は Modular Reinforcement Learning framework で、Movement と Attack のような semantic action modules に分解し、それぞれを独立 policy network と specialized reward structure で並列最適化する。実験では 1-vs-1 training map 上で modular agent が monolithic policy agent に対して最大 win rate 83.4% を達成し、特定挙動の修正に必要な retraining time を最大 30% 削減したとされる。

短い原文断片: "semantically distinct action modules" / "frequent and iterative updates"。

## why_relevant_to_games
Nao_u_BOT の headless bot や敵 AI を「全部入り policy」ではなく、移動・攻撃・回避・収集の差し替え可能な module として扱う発想に使える。
