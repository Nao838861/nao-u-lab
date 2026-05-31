---
title: "GameUIAgent: An LLM-Powered Framework for Automated Game UI Design with Structured Intermediate Representation"
url: "https://arxiv.org/abs/2603.14724"
collected_at: "2026-06-01T06:15:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ui, llm-agent, visual-evaluation, figma, structured-ir]
---

## raw_excerpt

arXiv 2603.14724。2026-03-16 submitted。著者は Wei Zeng, Fengwei An, Zhen Liu, Jian Zhao。Game UI の手動制作、とくに rarity tiers をまたぐ視覚的一貫性を問題設定にしている。提案は GameUIAgent。自然言語の説明を editable Figma design に変換するが、直接画像を出すのではなく Design Spec JSON という中間表現を使う。

短い原文引用: "Design Spec JSON intermediate representation"。パイプラインは LLM 生成、決定的な後処理、VLM-guided Reflection Controller を組み合わせる。評価は 110 test cases、3 LLM、3 UI templates。要旨では game-domain failure taxonomy として rarity-dependent degradation や visual emptiness が出ており、Quality Ceiling Effect と Rendering-Evaluation Fidelity Principle という観測も挙げられている。

Phase 1 の収集対象としては、ゲーム UI の自動生成を「画像生成の見栄え」ではなく、構造化 IR、決定的後処理、VLM 評価の組み合わせとして扱う点が素材になる。Nao_u 環境で UI を作る時の、空っぽに見える画面、レアリティ差分、評価器の見落としを考える候補。

## why_relevant_to_games

ゲーム UI 生成と評価を、構造化 JSON と VLM 反省ループに分解する候補。カード/装備/リザルト UI などを自動生成する時の失敗分類にも使えそう。
