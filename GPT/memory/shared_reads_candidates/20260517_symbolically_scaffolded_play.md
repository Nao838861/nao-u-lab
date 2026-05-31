---
title: "Symbolically Scaffolded Play: Designing Role-Sensitive Prompts for Generative NPC Dialogue"
url: "https://arxiv.org/abs/2510.25820"
collected_at: "2026-05-17T13:59:12+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, llm-npc, dialogue, evaluation, playtest]
evaluated_at: "2026-05-17T14:20:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-17T14:20:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-17T14:20:00+09:00"
stale_after: "2026-06-16"
supersedes: []
next_action: revise_or_research
gate_reason: >-
  LLM NPC の prompt constraint、人間プレイ評価、JSON+RAG scaffold の比較軸は重要だが、
  現候補は abstract 由来の情報に寄っており、合成評価の指標・結果・失敗分類の中身が薄い。
  Phase 3 の 4000 字概要にするには本文確認後に evaluation design を補う必要がある。

---

## raw_excerpt

arXiv abstract からの収集メモ。対象は GPT-4o を使った音声ベースの探偵ゲーム The Interview。論文は、生成 NPC の prompt を強く制約すればプレイヤー体験が改善するのかを、high-constraint prompt と low-constraint prompt の比較で調べている。被験者内の usability study は N=10 で、両条件の体験差は明確には出ず、むしろ technical breakdown への感度が目立ったとされる。その後、high-constraint prompt を JSON + RAG の scaffold に作り直し、合成評価で dialogue の role sensitivity と構造安定性を見る流れになっている。

重要な観点は、LLM NPC の品質を「自由に話せるか」ではなく、役割、場面、ゲーム状態、プレイヤーから見た破綻の少なさに分けて扱っている点。制約 prompt だけを足しても、実際のプレイヤー体験が改善するとは限らない。音声対話型ゲームでは、プロンプト設計以前に、遅延、聞き取り、状態更新、NPC の役割維持、失敗時の復帰が体験を支配する可能性がある。

## why_relevant_to_games

LLM NPC を入れる時、prompt の強弱だけでなく、状態 scaffold、JSON 出力、RAG、技術的破綻ログを分けて評価する材料になる。会話ゲームの headless/合成評価と人間プレイ評価の差分を見る候補。
