---
title: "Tacit Coordination of Large Language Models"
url: "https://arxiv.org/abs/2601.22184"
collected_at: "2026-06-28T22:36:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, multi-agent, coordination, llm, game-theory]
evaluated_at: "2026-06-28T22:33:12+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-06-28T22:33:12+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-28T22:33:12+09:00"
next_action: keep_for_reference
stale_after: "2026-07-28"
supersedes: []
gate_reason: |-
  coordination without communication と focal point 評価は面白いが、現時点の candidate だけではゲーム制作の具体工程に落とす軸が弱い。
  multi-agent prototype の評価観点としては参照できるが、CoopEval 水準の投稿に必要な手法分解と適用先が抽象寄り。
---

## raw_excerpt

短い原文引用: "coordination without communication"

arXiv:2601.22184v2。2026-01-28 submitted、2026-06-16 revised。Ido Aharon、Emanuele La Malfa、Michael Wooldridge、Sarit Kraus による、LLM が通信なしで協調できるかを大規模に調べる研究。人間は focal point、つまり互いに目立つと感じる選択肢を使って無通信協調することがある。この論文は cooperative / competitive games と search-and-rescue scenarios を含む評価で、20 以上の open / closed モデルを比較する。結果として、LLM は多くの設定で人間並みかそれ以上に協調する場合がある一方、数的 common sense や文化的に細かい salience を要する課題では失敗しやすい。learning-free な単純 strategy でも、人間-LLM 間と LLM 同士の協調を改善できるとされる。

## why_relevant_to_games

協力 NPC や multi-agent prototype で「明示通信なしに同じ意図を読めるか」を見る材料。敵味方の同期、救助、役割分担、focal point の作り方に関係する。
