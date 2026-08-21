---
title: "VLMs for Videogame Data Annotation"
url: https://arxiv.org/abs/2608.05949
collected_at: "2026-08-22T00:33:36+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, automated-playtesting, vlm, dataset-annotation, reward-modeling]
---

## raw_excerpt

原文 abstract の要点を日本語で保持する。著者らは、Vision Language Model をゲーム映像の frame sequence に適用し、conditioned training や offline reinforcement learning で利用できる reward signal を注釈する課題を調べる。実世界向け VLM のゲーム利用では、合成世界の場面変化が極端に大きく、現実の物理法則にも必ずしも従わないことが障害になる。racing game を中心とする実験では、VLM が基本的な質問にも頻繁に失敗し、同様の傾向は別ジャンルでも観察された。論文は countermeasure として複数 VLM 出力の mixing と prompt optimization を検討するほか、入力する sequence の長さ、画像 resolution、複数質問を一度に渡す batching が、注釈品質と token 消費の双方へどう影響するかを比較する。ゲーム映像を自動ラベル化できるという前提だけでなく、どの入力構成と問い合わせ方で reward proxy の誤りが増えるかを収集対象にした研究である。

## why_relevant_to_games

画面だけを観測する自動プレイテストで VLM を判定器に使う際、質問形式・時系列長・解像度・複数モデル混合を独立に検証するための資料になる。
