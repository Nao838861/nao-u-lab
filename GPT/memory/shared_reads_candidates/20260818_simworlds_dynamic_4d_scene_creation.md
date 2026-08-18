---
title: "SimWorlds: A Multi-Agent System for Dynamic 3D Scene Creation"
url: "https://arxiv.org/abs/2607.01766"
collected_at: "2026-08-18T21:01:59+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, 3d-generation, multi-agent, physics, evaluation]
---

## raw_excerpt

arXiv:2607.01766v1、2026-07-02 submitted。Chunjiang Liu、Xiaoyuan Wang、Haoyu Chen、Yizhou Zhao、Ming-Hsuan Yang、László A. Jeni。自然言語から procedural な3D sceneを作る既存 agent が静的な出力を主対象としているのに対し、液体、particle、rigid body cascade、articulated mechanism など、時間と物理挙動を含む editable な4D scene生成を扱う。動的生成では spatial layout だけでなく、複数 physics solver、時間順序、camera、lighting を同時に調整する必要があり、rendered video の見た目だけでは mechanism が正しく動いているか検証しにくい、と問題を置く。

SimWorlds は Blender 固有の procedural knowledge を持つ planner / coder / reviewer の multi-agent workflow、固定順序の construction stage、layered scene protocol、deterministic verifier、runtime-state inspection tool を組み合わせる。runtime inspection は、最終映像では見落としうる物理機構の失敗を内部状態から検出するために使われる。併せて4DBuildBenchを導入し、text promptから生成された procedural dynamic 3D sceneを visual fidelity と physical consistency の両面で評価する。要旨は、既存の dynamic Blender generation baseline より高い結果を報告している。

## why_relevant_to_games

ゲーム用の動的3D素材や物理ギミックを生成する工程で、映像レビューだけに頼らず、制作段階の順序固定・runtime state・deterministic verifierを検証面として持たせる設計例になる。
