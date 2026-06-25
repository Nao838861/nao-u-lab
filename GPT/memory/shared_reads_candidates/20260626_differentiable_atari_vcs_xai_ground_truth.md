---
title: "A Differentiable Atari VCS: A Complex, Fully Known Ground Truth for Explainable AI"
url: "https://arxiv.org/abs/2606.22447"
collected_at: "2026-06-26T05:46:31.3483119+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, xai, emulator, atari, verification, differentiable-simulation]
---

## raw_excerpt

著作権配慮のため長文引用ではなく、arXiv HTML の要点を短い原文句とメモで保存する。短い原文句: "fully known ground truth" / "bit-for-bit"。論文は、XAI の説明が本当に正しいかを検証するには、説明対象の真の機構が分かる複雑な対象が必要だ、という問題設定から始める。対象として Atari 2600 VCS を選び、CPU、bus、TIA、RIOT、cartridge mapper、controller などを differentiable な実装として再構成する。Atari は ALE や DQN で広く使われてきたが、通常の emulator は微分可能ではなく、既存の説明評価はしばしば別の black box との一致に留まる。この研究では Julia/Zygote の jutari と JAX/XLA の jaxtari という 2 実装を作り、xitari reference に対して instruction trace、port 間 cross-check、frame buffer 比較で conformance を検証する。本文の表では 64/64 games で RAM exact と pixel exact を報告し、Differentiable VCS を既知機構を持つ XAI 検証基盤として位置づけている。

## why_relevant_to_games

ゲームAIの説明や saliency を「それっぽい可視化」で終わらせず、既知のゲーム状態遷移と照合する検証基盤の例として参照できる。
