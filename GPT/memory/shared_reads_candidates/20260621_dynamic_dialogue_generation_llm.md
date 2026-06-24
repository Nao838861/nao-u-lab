---
title: "What if Red Can Talk? Dynamic Dialogue Generation Using Large Language Models"
url: "https://arxiv.org/abs/2407.20382"
collected_at: "2026-06-21T12:59:37+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, npc-dialogue, llm, rpg, immersion]
evaluated_at: "2026-06-21T13:02:28+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1782014997.231839"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782014997231839"
  char_count: 3516
  posted_at: "2026-06-21T13:10:05.8314262+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-21T13:10:05.8314262+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782014997231839"
next_action: none
stale_after: "2026-07-21"
supersedes: []
gate_reason: "既存スクリプトを置き換えるのではなく filler dialogue を足す問題設定が明確で、人格・世界知識・過度な肯定性という評価軸まで抽出できる。小型 RPG の NPC 会話検査に直接つながるため、~4000字の概要と適用判断を書ける。"
suggested_post_outline:
  overview_angle: "scripted RPG の余白を knowledge graph + LLM で埋める filler dialogue 手法として整理する"
  analysis_axis: "人格条件、世界知識補強、作品別環境、性格品質ごとの崩れ方、GPT-4 の肯定性バイアス"
  application_target: "Nao_u_BOT の会話ゲームで NPC の自由会話を広げる前に、既存脚本の隙間を埋める小さな生成タスクと検査軸を作る"
  pros_cons: "長所は導入範囲を限定できる点、短所は人格の微妙な差分や否定的反応の再現が弱い点"
  verdict_pre: "部分採用"
---

## raw_excerpt

arXiv:2407.20382。2024-07-29 submitted。著者は Navapat Nananukul と Wichayaporn Wongkamjan。短い原文片: "What if Red Can Talk?"。

要旨メモ: RPG では dialogue が guide、NPC interaction、storytelling を通じて開発者とプレイヤーをつなぐ主要手段になる。多くのゲームは main story や character personality を written scripts で定義するが、casual interactions が増えると没入感を上げられる可能性がある。この研究は、knowledge graph で補強した LLM dialogue filler framework を使い、Final Fantasy VII Remake と Pokemon の環境で、定義された personality に沿う character interaction を生成できるかを調べている。GPT-4 は personality 付きの発話生成能力を示す一方、過度に肯定的になりやすいこと、timidity のような明示的性格より maturity のような微妙な性格品質が落ちやすいことが課題として挙げられている。

## why_relevant_to_games

LLM NPC を「自由会話」だけでなく、既存 script の隙間を埋める filler dialogue として扱う候補。Nao_u_BOT の小型 RPG / 会話ゲームで、人格・世界知識・過度な肯定性の検査軸を作る材料になる。
