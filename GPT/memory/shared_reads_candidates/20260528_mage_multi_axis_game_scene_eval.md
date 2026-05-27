---
title: "Mage: Multi-Axis Evaluation of LLM-Generated Executable Game Scenes Beyond Compile-Pass Rate"
url: "https://arxiv.org/abs/2605.07342"
collected_at: "2026-05-28T05:44:39.3434070+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-evaluation, llm-game-generation, unity, playable-patterns, harness]
---

## raw_excerpt

arXiv:2605.07342。2026-05-08 submitted。対象は LLM が生成した executable game scene の評価で、compile-pass rate だけでは multi-component domain-specific artifacts の評価信号として誤誘導になり得る、という問題設定。

Mage は 4 軸評価プロトコルとして、compile success、runtime success、structural fidelity、mechanism adherence を使う。858 generation attempts、4 つの open-weight LLM、26 個の手作り Unity goal pattern playable concepts、2 種類の IR granularity level で検証している。結果として、direct NL-to-C# generation は runtime-pass rate が高い一方で structurally vacuous scenes を出しやすく、structural IR conditioning は runtime rate を下げるが domain-faithful structure を回復する、とされる。論文は benchmark、replay logs、per-record metrics の公開にも触れている。

## why_relevant_to_games

LLM 生成ゲームの評価を「ビルドできた」「起動した」から、メカニクス遵守・構造忠実度・replay log へ広げる材料。自作プロトタイプの headless eval 指標を増やす時の候補になる。
