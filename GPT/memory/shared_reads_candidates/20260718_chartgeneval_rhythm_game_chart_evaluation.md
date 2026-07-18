---
title: "ChartGenEval: Corruption-Tested Multi-Dimensional Feedback for Rhythm-Game Chart Generation"
url: "https://arxiv.org/abs/2607.12857"
collected_at: "2026-07-18T20:31:51.9005046+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, rhythm-game, procedural-content, evaluation, music-game]
evaluated_at: "2026-07-18T20:36:04+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-18T20:36:04+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-18T20:36:04+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-17"
supersedes: []
gate_reason: >-
  正解譜面との一致率を設計品質と取り違える問題、六つの評価質問、役割別の七信号、欠陥注入による感度・不変性検査、80 song groups と stress test の結果まで揃っている。
  level・enemy pattern・pacing の評価器にも、既知欠陥を注入して指標の反応を校正する手順として直接移せ、単一総合点を避ける理由と限界を約4000字で具体化できる。
suggested_post_outline:
  overview_angle: "生成譜面の唯一解を仮定せず、設計上の問いごとに信号を分離し、corruption test で評価器自体を検証する枠組みとして説明する。"
  analysis_axis: "official chart の timing map だけを参照する設計、七つの役割別 output、九つの sensitivity / invariance test、timing shift・pattern rewriting・loop collapse の stress test を分析する。"
  application_target: "Log_cdx の自動生成 level・敵 wave・弾幕 pattern で、密度過多、周期崩れ、単調反復など既知欠陥を量を制御して注入し、各評価指標が狙った欠陥だけへ反応するかを headless probe で確かめる。"
  pros_cons: "利点は代理指標の誤読を減らし、generator 改善へ原因別 feedback を返せること。欠点は corruption が実際の失敗分布を網羅せず、指標群の選択と authored reference への依存が残ること。"
  verdict_pre: "採用（単一 score ではなく、校正済みの役割別信号として小規模 prototype の評価 harness へ導入する）"
---

## raw_excerpt

arXiv:2607.12857、2026-07-14 submitted。リズムゲームの自動生成譜面では、同じ曲・同じ難度にも複数の妥当なノート列があり、公式譜面との一致率は「再構成」を測っても設計全体を測らない、という問題設定から始まる。ChartGenEval は評価を六つの問いに分け、公式譜面からは target notes ではなく authored timing map だけを参照する。各自動指標が本当に意図した欠陥へ反応するかを、量を制御して注入した corruption で検査する。80 の held-out song groups に対し、7 output axes が事前指定した sensitivity / invariance 条件を9つの非重複テストで満たしたと報告する。追加 stress test では、15 / 30 / 60 ms の全体 timing shift を phase estimate が回収する一方、chart-only outputs はほぼ変化しない。common-pattern rewriting で language-model perplexity が平均37%低下し、loop collapse で self-similarity が平均62%上昇した。単一総合点ではなく、役割の異なる信号を分離して generator の比較・反復へ返す構成である。原文の核は “reports separate, role-specific signals instead of one proxy or total score.”

## why_relevant_to_games

生成コンテンツの評価指標を一つの代理点へ潰さず、意図的に欠陥を注入して感度と不変性を確かめる手順は、譜面生成だけでなく level / enemy pattern / pacing の自動評価設計に関係する。
