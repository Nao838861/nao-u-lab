---
title: "Beyond Sally-Anne: Evaluating Theory of Mind in LLMs using Epistemic Schelling Points"
url: "https://arxiv.org/abs/2607.11363"
collected_at: "2026-07-15T13:10:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, llm, multi-agent, evaluation, coordination-game, theory-of-mind]
evaluated_at: "2026-07-15T13:15:00+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1784088387.032009"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784088387032009"
  char_count: 3585
  posted_at: "2026-07-15T13:06:32+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-15T13:06:32+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784088387032009"
next_action: none
stale_after: "2026-08-14"
supersedes: []
gate_reason: >-
  EAST の問題設定、知識状態を切り替える実験設計、1260 ゲームの評価、主要な失敗類型まで抽出できる。
  協力ゲーム AI の知識追跡と行動変換を分離して測る小型テストへ直接適用でき、CoopEval 水準の概要を構成可能。
suggested_post_outline:
  overview_angle: "誤信念テストを一回限りの協調ゲームへ拡張し、私的知識・相手の知識・共有知識を行動として測る評価設計"
  analysis_axis: "対称・非対称・ゼロ知識条件の比較と、知識推論・焦点選択・行動変換の失敗分解"
  application_target: "協力 NPC や複数 AI のテストで、観測情報を操作して自己中心的選択と知識状態から行動への変換失敗を検出する小型評価ゲーム"
  pros_cons: "低コストで失敗原因を分離できる一方、語選択課題の成績を長期協力や実時間ゲームへそのまま一般化できない"
  verdict_pre: "部分採用"
---

## raw_excerpt

EAST（Epistemic (A)symmetry Schelling Task）は、異なる職業ペルソナを与えられた2体のLLMが、会話せずに4語から同じ語を選ぶ一回限りの協調ゲームである。語群は各プレイヤー固有語、両者に弱く関係する共有語、双方と無関係な高頻度語からなる。相手の正体を双方が知る対称条件、片方だけが知る非対称条件、双方が知らないゼロ知識条件を切り替え、私的知識・相手の知識・共有知識を分離して行動へ変換できるかを見る。10シナリオ、3条件、3種のプロンプト、14モデルで計1260ゲームを実施した。多くのモデルは対称条件より非対称・ゼロ知識条件で大きく低下し、非対称条件の規範的成功率は概ね20〜30%、ゼロ知識条件も多くが10〜30%だった。主な失敗は、知っている側が相手の無知を考慮しないこと、私的な連想を普遍的な焦点だと投影すること、知識状態を正しく推論しても選択へ結びつけられないことだった。明示的なToMプロンプトは偶然の一致を減らす一方、深い推論を実際の協調へ変換できたのは主に高性能モデルだった。

## why_relevant_to_games

協力ゲームのAIテストで、結果の勝敗だけでなく「相手が何を知るか」を条件として操作し、私的知識の混同・自己中心的選択・推論から行動への変換失敗を別々に観測する小型評価ゲームとして応用できる。
