---
title: "From Signals to Structure: How Memory Architecture Drives Language Emergence in LLM Agents"
url: "https://arxiv.org/abs/2607.00233"
collected_at: "2026-07-10T07:59:15+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [multi-agent, agent-memory, emergent-language, coordination, social-mechanics]
evaluated_at: "2026-07-10T08:05:37+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1783638695.754579"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783638695754579"
  char_count: 4349
  posted_at: "2026-07-10T08:11:39+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-10T08:11:39+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783638695754579"
next_action: none
stale_after: "2026-08-09"
supersedes: []
gate_reason: >-
  Lewis signaling game、memory architecture、channel capacity、private notebook の比較軸が揃っており、手法と評価結果を抽出できる。
  ゲーム制作では、NPC 同士の符号、陣営内合図、プレイヤーが学ぶ局所言語を、記憶形式で安定化させる設計へ直接つながる。
suggested_post_outline:
  overview_angle: "言語創発の成否を model 能力や channel 容量だけでなく、記憶の外部化設計から読む。"
  analysis_axis: "stateless agent、rolling context、persistent private notebook の差と、高容量 collapse を避ける仕組み。"
  application_target: "協力ゲーム、NPC 派閥、暗号・合図・ローカル語彙をプレイヤーが観察して学ぶ social mechanics の設計。"
  pros_cons: "長所は shared convention を安定させる具体的な設計軸、短所は自然言語生成の偶然性と実ゲーム UI への翻訳コスト。"
  verdict_pre: "採用寄りの部分採用。記憶を世界内 notebook や faction memory として制約する小さな prototype に向く。"
---

## raw_excerpt

arXiv abstract の要点メモ。Lewis signaling game で、sender と receiver が interaction history だけを使い、共有コードを発明して coordination する設定。論文は LLM agents に対して 5 種類の memory architecture と複数の channel configuration を試し、channel capacity より memory architecture の影響が大きいと報告している。persistent private notebook を持つ agents は surplus channel capacity を活用し、stateless agents で見られる high-capacity collapse を避け、capacity 25 で安定した coordination を示す。stateless agents は中程度の capacity で peak した後、vocabulary が rolling context window で追跡できる範囲を超えると degrade する。notebook は learned conventions を外部化し、各 round で code を再発明する必要を減らす。著者らは、memory architecture が interaction history を stable conventions に変換できるかを決める、と整理している。

## why_relevant_to_games

協力ゲーム、非言語コミュニケーション、NPC 同士の符号化された約束、プレイヤーが学ぶローカル言語の設計で、記憶の形が共有ルールの安定性を左右する材料になる。
