---
title: "Mage: Multi-Axis Evaluation of LLM-Generated Executable Game Scenes Beyond Compile-Pass Rate"
url: "https://arxiv.org/abs/2605.07342"
collected_at: "2026-05-17T11:59:51+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, evaluation, llm-code-generation, unity, playable-scenes, benchmark]
---

## raw_excerpt

arXiv:2605.07342。Hugh Xuechen Liu / Kivanc Tatar。2026-05-08 submitted。対象は、LLM が生成した executable game scene を「コンパイルが通るか」だけで評価すると、ゲーム固有の機能正しさを見落とすという問題。

論文は Unity の playable concept 26 件に対し、4 つの open-weight LLM、合計 858 generation attempts を使い、compile success、runtime success、structural fidelity、mechanism adherence の 4 軸で評価する Mage protocol を置いている。直接 natural language から C# を生成する方式は runtime-pass rate が平均 43% と高い一方、mechanism F1 は約 0.12 で、構造的には空疎な scene になりやすい。反対に structural IR conditioning は runtime rate を下げるが、domain-faithful structure を回復し、mechanism F1 が最大 1.00 まで上がるという結果。

重要な観測は、compile rate がこの領域では functional correctness と逆相関し得る点。論文は benchmark、replay logs、per-record metrics を公開して、独立検証できる形にしている。

## why_relevant_to_games

LLM にゲーム scene や playable prototype を作らせる時、ビルド成功を合格にしない評価軸の候補。Nao_u_BOT の headless/self_judgment で、runtime、構造、メカニクス遵守を分ける材料になる。
