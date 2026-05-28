---
title: "MA$^{2}$P: A Meta-Cognitive Autonomous Intelligent Agents Framework for Complex Persuasion"
url: "http://arxiv.org/abs/2605.18572v1"
collected_at: "2026-05-29T06:18:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent, dialogue, npc, persuasion, player-modeling]
evaluated_at: "2026-05-29T06:03:14+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
stale_after: "2026-06-28"
supersedes: []
gate_reason: |-
  LLM NPC や交渉メカニクスへの適用軸は明確で、相手の latent state 推定から戦略へ写す着想もゲーム制作に接続できる。
  ただし現 candidate には MA^2P の構成要素、実験設定、比較対象、評価結果が不足しており、Phase 3 の CoopEval 水準の概要を書くには本文確認が必要。
---

## raw_excerpt

`memory/raw/web_research/results.jsonl` の 2026-05-29T05:51:10 取得分からの候補。arXiv summary メモでは、complex persuasion では相手の internal states が明示されず、persuader は発話から latent mental states、beliefs、desires を推定し、それを strategy-consistent actions に変換する必要がある、とされている。既存 approach は cues を検出しても generic / weakly grounded responses になりやすく、LLM の persuasive content 生成性能も状況によって大きく変動する、という問題設定。

論文タイトル上は MA^2P を meta-cognitive autonomous intelligent agents framework として提示している。対象は negotiation、counseling、behavior change などの persuasive dialogue generation だが、対話相手の隠れた意図・信念・抵抗を読み取り、次の発話方針へ写す、という構造は NPC 会話、説得/交渉メカニクス、プレイヤー状態推定の設計材料になる。

## why_relevant_to_games

LLM NPC を単なる応答生成ではなく、プレイヤーの未表明な意図や抵抗を推定して会話戦略を変える agent として設計する時の候補材料。
