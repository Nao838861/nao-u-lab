---
title: "Mage: Multi-Axis Evaluation of LLM-Generated Executable Game Scenes Beyond Compile-Pass Rate"
url: "https://arxiv.org/abs/2605.07342"
collected_at: "2026-05-17T11:59:51+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, evaluation, llm-code-generation, unity, playable-scenes, benchmark]
evaluated_at: "2026-05-17T12:02:16+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-17T12:08:49+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778987180373269"
posted:
  ts: "1778987180.373269"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778987180373269"
  char_count: 3551
  posted_at: "2026-05-17T12:08:49+09:00"
stale_after: "2026-06-16"
supersedes: []
gate_reason: "問題設定、手法の中核、4 軸評価、858 attempts の評価結果、結論が候補本文だけで抽出できる。Nao_u_BOT の LLM 生成 playable prototype 判定に直結し、compile pass 偏重を避ける具体軸として使える。CoopEval 水準の概要は、compile/runtime/structure/mechanism の分離を軸に十分書ける。"
next_action: none
suggested_post_outline:
  overview_angle: "LLM 生成ゲーム scene を compile 成功率だけで評価すると何を見落とすか、Mage の 4 軸で説明する。"
  analysis_axis: "compile success と runtime/structural fidelity/mechanism adherence のズレ、特に compile と機能正しさが逆相関し得る点。"
  application_target: "headless/self_judgment、playable diff の合否判定、Unity/ゲームプロトタイプ生成時のレビュー checklist。"
  pros_cons: "メリットは評価軸が具体的で再現用データもある点。デメリットは Unity scene 対象で、体験品質や面白さの評価までは直接扱わない点。"
  verdict_pre: "部分採用。compile gate の上位に runtime/structure/mechanism gate を置く評価設計として採用。"

---

## raw_excerpt

arXiv:2605.07342。Hugh Xuechen Liu / Kivanc Tatar。2026-05-08 submitted。対象は、LLM が生成した executable game scene を「コンパイルが通るか」だけで評価すると、ゲーム固有の機能正しさを見落とすという問題。

論文は Unity の playable concept 26 件に対し、4 つの open-weight LLM、合計 858 generation attempts を使い、compile success、runtime success、structural fidelity、mechanism adherence の 4 軸で評価する Mage protocol を置いている。直接 natural language から C# を生成する方式は runtime-pass rate が平均 43% と高い一方、mechanism F1 は約 0.12 で、構造的には空疎な scene になりやすい。反対に structural IR conditioning は runtime rate を下げるが、domain-faithful structure を回復し、mechanism F1 が最大 1.00 まで上がるという結果。

重要な観測は、compile rate がこの領域では functional correctness と逆相関し得る点。論文は benchmark、replay logs、per-record metrics を公開して、独立検証できる形にしている。

## why_relevant_to_games

LLM にゲーム scene や playable prototype を作らせる時、ビルド成功を合格にしない評価軸の候補。Nao_u_BOT の headless/self_judgment で、runtime、構造、メカニクス遵守を分ける材料になる。
