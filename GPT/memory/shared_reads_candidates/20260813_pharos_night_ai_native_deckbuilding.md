---
title: '"Pharos Night: Crown Pursuit": An AI-Native Deck-Building and Tactical Arena Game Design Based on Multi-Agent Systems'
url: "https://arxiv.org/abs/2608.12216"
collected_at: "2026-08-13T19:46:25+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, ai-native-games, deck-building, tactical-arena, multi-agent, llm, playtesting]
evaluated_at: "2026-08-13T19:50:31+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-08-13T19:50:31+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-08-13T19:50:31+09:00"
next_action: revise_or_research
stale_after: "2026-09-12"
supersedes: []
gate_reason: >-
  自然言語カード効果を既定 mechanic と数値表へ接続する実装着想は具体的で、ゲーム制作への適用性もある。
  ただし保存済み資料では13人 playtest の手順・比較条件・結果内訳が不足し、約4000字の概要を推測なしで支えられないため保留する。
---

## raw_excerpt

arXiv abstract からの採取メモ（日本語パラフレーズ）: Pharos Night: Crown Pursuit は、生成 AI が gameplay rule に直接関与する AI-native game の事例として作られた、deck-building と tactical arena を組み合わせたゲームである。基盤には multi-agent system があり、LLM は素材とカードの生成、NPC の意思決定、自然言語での相互作用の仲介を担当する。プレイヤーは探索中に素材を集め、望むカード効果を自然言語で記述し、arena で NPC と交渉するか戦闘するかを選ぶ。モデル出力をそのまま数値処理へ流すのではなく、structured JSON として解析し、あらかじめ定義された mechanic からカード効果を組み立て、質的な効果レベルを designer-specified numerical values に割り当てることで、生成結果をゲーム規則へ接続する。13人の小規模 playtest では、AI 駆動の遊びが戦略的な意味と engagement を持ち得ることが示唆された一方、結果の予測可能性、仕組みの透明性、プレイヤーが感じる制御可能性に課題が観測された。論文は、複数の生成・判断役を core loop に配置して emergent なデジタルゲーム体験を作る実装事例として提示されている。

## why_relevant_to_games

自然言語で要求されたカード効果を、既定 mechanic・段階評価・数値表へ落とす構成と、生成、NPC 判断、交渉を分担する multi-agent core loop の実例として参照できる。
