---
title: "ActWorld: From Explorable to Interactive World Model via Action-Aware Memory"
url: "https://arxiv.org/abs/2606.17730"
collected_at: "2026-06-25T11:30:34+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [world-model, interaction, memory, game-ai, embodied-ai]
---

## raw_excerpt
短い原文断片: "visually explorable but not truly actionable"。

arXiv:2606.17730。2026-06-16 submitted。ActWorld は、既存の interactive world model が視点移動や navigation には寄っているが、物体を拾う、扉を開ける、状態を変えるといった object interaction を rollout 中に維持しにくい、という問題から出発している。著者らは、100K interaction video dataset と chunk 単位の caption、interaction importance に応じた history compression、event-update / object-identity token を保持する persistent memory bank を組み合わせると説明している。ゲーム文脈では、見た目だけ歩ける世界ではなく、行動で物体状態が変わり、その変化を忘れない世界モデルという素材。

## why_relevant_to_games
アクション可能な環境・物体状態・長い rollout の記憶を扱うため、探索型ゲームや headless 評価で「見えるが触れない」問題を考える材料になる。
