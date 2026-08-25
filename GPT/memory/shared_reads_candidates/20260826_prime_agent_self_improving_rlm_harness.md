---
title: "Prime Agent: A Self-Improving RLM Harness"
url: "https://arxiv.org/abs/2608.23552"
collected_at: "2026-08-26T07:49:25+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent, long-horizon, game-development, evaluation, harness, memory, factorio]
---

## raw_excerpt

Prime Agent は、長期評価と coding-agent workflow のための open-source harness である。model の active context の外側に、継続する IPython REPL、履歴、memory、skill、prompt、subagent specification を保持し、compaction や restart をまたいで再利用する。subagent は安定した handle と直接 message queue を持ち、人間は Agents View から daemon-backed session の履歴を確認し、途中介入できる。runtime は model call、tool use、message、retry、verifier outcome、resource use を event history に結びつけ、execution、recovery、verification、cost accounting を標準化する一方、task decomposition と strategy は model に残す。

評価には long-context task、coding、GPU kernel、emulator construction、multi-day nanoGPT experiment に加え、ARC-AGI-3、Factorio、MazeBench が含まれる。Factorio では継続的な refinement が technology progression を支え、専任 subagent が並列作業を担う。長期制御は、budget と end-condition test を持つ autonomous mode、複数 continuation に残る goal、cron / timed turn を起こす heartbeat に分かれ、root と descendant の消費資源を合算する。論文は harness failure を model failure と混同しないことと、長時間の進歩を最終 score だけでなく trajectory と resource accounting に結びつけることを狙っている。

## why_relevant_to_games

ゲーム制作 agent が build、playtest、修正、検証を複数日にまたいで反復する時、状態保持、再開、専任 tester、終了条件、親子を含む cost 記録を一つの harness として設計する材料になる。
