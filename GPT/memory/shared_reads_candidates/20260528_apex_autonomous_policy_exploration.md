---
title: "APEX: Autonomous Policy Exploration for Self-Evolving LLM Agents"
url: "https://arxiv.org/abs/2605.21240"
collected_at: "2026-05-28T21:29:25+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent, memory, exploration, evaluation, game-ai, text-adventure]
---

## raw_excerpt

arXiv 2605.21240。自己進化型 LLM agent は、episode ごとの記憶や reflection を蓄積することで test time に振る舞いを改善しようとするが、記憶が増えるほど既知の高報酬 routine に寄って探索が細る、という問題を扱う。APEX は strategy map を持つ。これは milestone と prerequisite dependency edge からなる有向非巡回グラフで、agent がどの方向を既に試したか、どの方向が未探索かを明示する。Fork Discovery は根拠のある未探索方向を map に追加し、Policy Selection は planning 時に探索と活用の配分を取る。評価対象は Jericho の text-adventure 9 本と WebArena。ablation で各 component の寄与を見ている。

## why_relevant_to_games

ゲーム用 bot / headless 評価で「一度通った攻略だけを繰り返す」問題を、strategy map と未探索 fork として記録する入口になりそう。
