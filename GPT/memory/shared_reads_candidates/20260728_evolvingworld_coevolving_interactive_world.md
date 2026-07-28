---
title: "EvolvingWorld: An Open-Schema Framework for Co-Evolving Role-Play Agents and World Model in Interactive Literary World"
url: "https://arxiv.org/abs/2607.17250"
collected_at: "2026-07-28T09:48:58.2988163+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, interactive-narrative, role-play-agent, world-model, long-horizon-simulation]
---

## raw_excerpt

EvolvingWorld は、interactive literary world における character と world の長期的な共進化を扱う framework と benchmark。既存手法が static persona imitation または孤立した scene generation に寄り、interaction の結果が後続の人物像・場所・世界状態へ残り続けない問題を置く。原文の短い表現では “characters interact, scenes progress, and character and world states are persistently updated.”

構成は二つの連結 module からなる。Character Agent は複数 character の role-play と profile の持続的更新を担い、LLM-based World Model は global state と location / entity 単位の状態を保守しながら scene を進行させる。固定 schema に閉じず、多様な文学世界へ適用する open-schema を採用し、scene initialization、interaction generation、state update にまたがる 7 個の trainable task を定義する。

dataset は 57 冊の書籍から構築した 138,596 件の supervised training sample と 222 件の test snapshot。評価は単発応答ではなく trajectory-level で、10 dimension・20 metric の LLM-as-Judge protocol を用いる。arXiv abstract は、人物と世界の持続的で coherent な発展を保つことで long-horizon simulation を改善したと報告する。

## why_relevant_to_games

NPC の会話だけでなく、人物 profile・場所・entity・global world state を同じ interaction loop で更新する設計は、長期 campaign、生活 simulation、分岐 narrative の state 管理と trajectory 単位の評価を考える材料になる。
