---
title: "Who embraces AI in play? Exploratory modeling of player preference profiles toward game AI"
url: "https://arxiv.org/abs/2605.09550"
collected_at: "2026-05-16T13:29:22+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, game-ai, player-research, player-segmentation, ai-in-games]
---

## raw_excerpt

著作権配慮のため、arXiv abstract の長文引用ではなく要点メモとして保存する。対象は Ting-Chen Hsu ほかによる 2026-05-10 submitted の HCI 論文。ゲーム AI への受容は用途依存であることが知られているが、この研究は「個別機能への賛否」ではなく、複数文脈にまたがる受容パターンを profile としてモデル化する。

短い原文句: "cross-context AI acceptance" / "Archetypal Analysis" / "context-sensitive"

質問紙データは 771 名の digital game players。8 つの代表的な game AI application context に対する acceptance ratings を centered し、Archetypal Analysis で解釈可能な態度プロファイルを抽出している。抽出された profile は AI-Skeptics, Broad AI-Supporters, Creative-Play Explorers, Experience-Oriented Supporters, Systemic Order Advocates, Emotion-Centered Supporters, Governance-Skeptics の 7 種。さらに one-vs-rest logistic regression で、profile membership と perceived AI literacy, gaming habits, disciplinary background, personality traits, application-specific priorities との関連を探索している。

## why_relevant_to_games

LLM NPC や AI 補助生成を「良い/悪い」で一括判断せず、プレイヤー層ごとに受け入れられる AI 機能が違う前提で設計するための候補。Nao_u 作品で AI 要素を入れる場合、どのプレイヤーに何を見せ、何を隠すかを考える材料になる。
