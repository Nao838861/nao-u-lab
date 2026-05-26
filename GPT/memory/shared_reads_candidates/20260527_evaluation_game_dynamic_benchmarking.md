---
title: "The Evaluation Game: Beyond Static LLM Benchmarking"
url: "https://arxiv.org/abs/2605.19377"
collected_at: "2026-05-27T04:44:33+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [evaluation, agent, benchmark, game-design, adversarial-testing]
---

## raw_excerpt
収集メモ。Paul Wang らによる、静的な LLM benchmark ではなく、evaluator と trainer の相互作用を two-player game として扱う評価枠組み。対象は jailbreak や adversarial prompt に対する robustness fine-tuning で、trainer が既知の攻撃に局所的に適応しただけなのか、未知変換にも一般化したのかを見分ける問題を扱う。論文は group action を使って data augmentation や変換の軌道を表現し、benchmark を固定 prompt 集ではなく evaluator の変換操作で動く対象として捉え直す。実験では Llama / Qwen / Mistral 系で、adversarial prompt への fine-tuning が近傍には効くが距離が離れると拒否率が落ちるという locality-dependence を示す。

## why_relevant_to_games
ゲームAI評価や headless playtest でも、固定 seed / 固定課題への過適応と、変換された状況への一般化を分けて見る必要がある。評価設計を「静的テスト集」から「変換を持つ対戦ゲーム」として考える材料になる。
