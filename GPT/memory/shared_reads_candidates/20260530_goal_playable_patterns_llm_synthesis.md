---
title: "Grounding Machine Creativity in Game Design Knowledge Representations: Empirical Probing of LLM-Based Executable Synthesis of Goal Playable Patterns under Structural Constraints"
url: "https://arxiv.org/abs/2603.07101"
collected_at: "2026-05-30T02:14:18+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, computational-creativity, llm-codegen, unity, design-patterns]
---

## raw_excerpt

arXiv 要旨によると、この論文は gameplay idea を executable artifact、特に Unity project / C# code として実現する問題を、game design knowledge representation の側から扱う。Gameplay design patterns は gameplay phenomena を entities、constraints、rule-driven dynamics に分解する構造表現であり、その中でも goal patterns は player-objective relationship を形式化する。Goal Playable Concepts (GPCs) はそれらを playable Unity implementation として operationalize し、experiential exploration と compositional gameplay design を支援する。論文は、generated artifact が Unity の syntactic / architectural requirements を満たしつつ、goal pattern に符号化された semantic gameplay meaning を保つ必要がある、という constrained executable creative synthesis として問題化する。26 の goal pattern instantiation を使い、natural language から直接 C# / Unity を生成する baseline と、人間が書いた Unity-specific intermediate representation に条件付ける pipeline を比較し、自動 Unity replay で compilation success を評価する。failure mode として grounding と hygiene を挙げ、structural / project-level grounding が主な bottleneck だと整理している。

## why_relevant_to_games

「面白そうな説明」から直接ゲームを作るのではなく、goal pattern、IR、Unity 構造制約、replay 検証を挟む発想。Nao_u_BOT の prototype でも、仕様文から playable diff へ落とす中間表現を設計する時の候補になる。
