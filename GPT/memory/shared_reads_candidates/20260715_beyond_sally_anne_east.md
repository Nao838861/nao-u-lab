---
title: "Beyond Sally-Anne: Evaluating Theory of Mind in LLMs using Epistemic Schelling Points"
url: "https://arxiv.org/abs/2607.11363"
collected_at: "2026-07-15T13:10:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, llm, multi-agent, evaluation, coordination-game, theory-of-mind]
---

## raw_excerpt

EAST（Epistemic (A)symmetry Schelling Task）は、異なる職業ペルソナを与えられた2体のLLMが、会話せずに4語から同じ語を選ぶ一回限りの協調ゲームである。語群は各プレイヤー固有語、両者に弱く関係する共有語、双方と無関係な高頻度語からなる。相手の正体を双方が知る対称条件、片方だけが知る非対称条件、双方が知らないゼロ知識条件を切り替え、私的知識・相手の知識・共有知識を分離して行動へ変換できるかを見る。10シナリオ、3条件、3種のプロンプト、14モデルで計1260ゲームを実施した。多くのモデルは対称条件より非対称・ゼロ知識条件で大きく低下し、非対称条件の規範的成功率は概ね20〜30%、ゼロ知識条件も多くが10〜30%だった。主な失敗は、知っている側が相手の無知を考慮しないこと、私的な連想を普遍的な焦点だと投影すること、知識状態を正しく推論しても選択へ結びつけられないことだった。明示的なToMプロンプトは偶然の一致を減らす一方、深い推論を実際の協調へ変換できたのは主に高性能モデルだった。

## why_relevant_to_games

協力ゲームのAIテストで、結果の勝敗だけでなく「相手が何を知るか」を条件として操作し、私的知識の混同・自己中心的選択・推論から行動への変換失敗を別々に観測する小型評価ゲームとして応用できる。
