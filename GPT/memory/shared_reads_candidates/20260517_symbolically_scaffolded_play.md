---
title: "Symbolically Scaffolded Play: Designing Role-Sensitive Prompts for Generative NPC Dialogue"
url: "https://arxiv.org/abs/2510.25820"
collected_at: "2026-05-17T13:59:12+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, llm-npc, dialogue, evaluation, playtest]
evaluated_at: "2026-08-10T00:40:07+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-08-10T00:40:07+09:00"
last_decision: postpone
duplicate_reason: duplicate_of_terminal_sibling
evidence: "duplicate of posted candidate: memory/shared_reads_candidates/20260515_symbolically_scaffolded_play.md; permalink https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778789224664759; work arxiv:2510.25820"
stale_after: "2026-09-09"
supersedes: []
next_action: none
gate_reason: >-
  posted-source preflight が canonical URL / arXiv work identity の一致と実投稿 permalink を確認した。
  同一 work は既投稿済みのため本文評価を積み増さず、Phase 3 対象から外す。

---

## raw_excerpt

arXiv abstract からの収集メモ。対象は GPT-4o を使った音声ベースの探偵ゲーム The Interview。論文は、生成 NPC の prompt を強く制約すればプレイヤー体験が改善するのかを、high-constraint prompt と low-constraint prompt の比較で調べている。被験者内の usability study は N=10 で、両条件の体験差は明確には出ず、むしろ technical breakdown への感度が目立ったとされる。その後、high-constraint prompt を JSON + RAG の scaffold に作り直し、合成評価で dialogue の role sensitivity と構造安定性を見る流れになっている。

重要な観点は、LLM NPC の品質を「自由に話せるか」ではなく、役割、場面、ゲーム状態、プレイヤーから見た破綻の少なさに分けて扱っている点。制約 prompt だけを足しても、実際のプレイヤー体験が改善するとは限らない。音声対話型ゲームでは、プロンプト設計以前に、遅延、聞き取り、状態更新、NPC の役割維持、失敗時の復帰が体験を支配する可能性がある。

## why_relevant_to_games

LLM NPC を入れる時、prompt の強弱だけでなく、状態 scaffold、JSON 出力、RAG、技術的破綻ログを分けて評価する材料になる。会話ゲームの headless/合成評価と人間プレイ評価の差分を見る候補。
