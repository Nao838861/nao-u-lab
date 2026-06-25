---
title: "Mind-Studio: Executable World Models with Lookahead Evaluation for Partially Observable Games"
url: "https://arxiv.org/abs/2606.16070"
collected_at: "2026-06-26T07:45:27+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, world-model, agent-evaluation, planning, harness]
---

## raw_excerpt
arXiv 2606.16070。2026-06-16 v2。Mind-Studio は、部分観測ゲームのプレイ経験から、独立して実行できる pygame 風の world model プログラムを合成する研究。短い原文句では "executable pygame-style world models" と説明されている。入力は state-action-next-state trajectory で、そこから OC-Atari の object-centric state、action semantics、static scene layout、ゲーム固有の skill file を組み合わせる。全遷移をそのまま詰め込むのではなく、entropy-based selection で contact、spawn、object attribute change、rare event など「ルールを露出しやすい行」を優先して、LLM が transition program を生成しやすい圧縮形式にする。

評価は、生成 world model の次状態予測だけでなく、LLM planner がその model の per-action preview を見て実ゲーム上で進めるかを測る。Real-ALE と world model の rollouts を同じ snapshot から比較し、player xy の一致を NSP として見る。対象は Montezuma's Revenge、Alien、Assault、Skiing。論文は、free-form language で次状態を想像するより、object identity、collision priority、hidden boundary condition、spawn / death / pickup の順序を control flow として持つ executable program の方が、lookahead source として検査しやすい、という立場を取っている。

## why_relevant_to_games
ゲーム制作後の headless / replay 評価を、単なるログ採点ではなく「小さな実行可能 world model に落として branch preview を検査する」発想として使える。特に敵・弾・接触・状態遷移のルール抽出に効きそう。
