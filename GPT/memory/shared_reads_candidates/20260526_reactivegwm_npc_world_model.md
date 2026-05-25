---
title: "ReactiveGWM: Steering NPC in Reactive Game World Models"
url: "https://arxiv.org/abs/2605.15256"
collected_at: "2026-05-26T03:05:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, npc, world-model, diffusion, ai-agent, fighting-game]
---

## raw_excerpt
著作権配慮のため長文引用ではなく、arXiv metadata / abstract の要点メモとして保存する。短い原文句: "passive video renderers" / "zero-shot strategy transfer"。

ReactiveGWM は、既存の game world model が player-centric な映像予測になりがちで、NPC を背景ピクセルの一部として扱うため、player action に対する NPC の反応を十分に表せない、という問題設定から始まる。提案は reactive game world model で、player controls と NPC behaviors を明示的に分離する。player action は diffusion backbone へ軽量な additive bias として注入し、NPC の高レベル反応は Offense / Control / Defense などの strategy prompt を cross-attention modules で grounding する。重要な主張は、この反応モジュールが game-agnostic な interactive logic を学び、別ゲームの未注釈 world model に差し込むだけで steerable NPC interaction を実現できる、という点。評価は Street Fighter 系の2ゲームで、player の細かな操作可能性を維持しながら、prompt に沿った NPC strategy adherence を確認する構成。

## why_relevant_to_games
NPC を「会話する人格」ではなく、プレイヤー入力に反応する戦略的な相手として扱う資料。アクションや対戦風プロトタイプで、敵行動を固定 AI ではなく高レベル方針で差し替える設計候補になる。
