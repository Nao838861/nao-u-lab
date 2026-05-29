---
title: "Automated Generation and Evaluation of Interactive-Fiction Serious Games with Open-Weight LLMs"
url: "https://www.mdpi.com/2076-3417/16/6/2932"
collected_at: "2026-05-30T04:29:22+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, interactive-fiction, llm, automated-validation, serious-games]
---

## raw_excerpt

原文の要点メモ。SINE (Serious Interactive Narrative Engine) は、structured seeds から station-based single-player interactive-fiction serious games を生成し、Ink 形式で offline-executable にする pipeline。four prompting strategies、grammar-guided decoding、deterministic validation、LLM-based fixer agent を比較し、240 seeds と複雑度増加の staged evaluation を行う。最終構成は compilation、playability、learning-goal fidelity の joint criterion で約 68% から 86% の success rates。著者らは、repair iterations が robustness に重要で、grammar masking は一貫して改善するとは限らない、としている。

## why_relevant_to_games

小さなゲームを LLM で量産する時、面白さ以前に「実行できる」「最後まで到達できる」「意図した task が壊れていない」を機械判定する設計候補。Phase 2 以降で headless 評価との接続を見られる。
