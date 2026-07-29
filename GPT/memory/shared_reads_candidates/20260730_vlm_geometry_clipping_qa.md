---
title: "Evaluating VLMs for Autonomous Agent-Driven Geometry Clipping Detection in Video Game QA"
url: "https://arxiv.org/abs/2607.25921"
collected_at: "2026-07-30T08:01:10+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-qa, vlm, autonomous-agent, visual-bug-detection]
evaluated_at: "2026-07-30T08:06:50+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-30T08:14:11.7599086+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785366835325639"
next_action: none
stale_after: "2026-08-29"
supersedes: []
posted:
  ts: "1785366835.325639"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785366835325639"
  char_count: 4116
  posted_at: "2026-07-30T08:14:11.7599086+09:00"
gate_reason: >-
  自動探索、engine 内 annotation、hard-negative を含む比較、prompt 感度、false positive の原因と
  multi-stage QA への結論まで重要要素を抽出できる。単一環境・単一 bug・single-frame という限界も含めて、
  headless playtest の visual regression 候補抽出へ具体的に適用でき、約4000字の分析を支えられる。
suggested_post_outline:
  overview_angle: "VLM を万能な bug 判定器ではなく、探索 agent と後段検証の間に置く high-recall filter として評価する"
  analysis_axis: "hard-negative による精度崩壊、model ごとの prompt 感度、precision–recall とレビュー費用の対応、single-frame 評価の限界"
  application_target: "Pulse Relay / graze_log 系の headless playtest harness に frame 候補抽出を加え、連続 frame・衝突 telemetry・人手確認で確定する visual regression 経路"
  pros_cons: "利点は game 固有学習なしの候補絞り込みと探索部の再利用性。欠点は曖昧な近接・遮蔽での大量誤検知、単一環境・単一 bug・静止画評価による外的妥当性の弱さ"
  verdict_pre: "部分採用"
---

## raw_excerpt

抄録からの採取メモ（長い原文引用は避け、日本語で内容を保持）: ゲーム QA のうち、キャラクターや物体が本来通過しない geometry を突き抜けたり重なったりする clipping anomaly を、Vision-Language Model で検出する構成を扱う。custom exploration agent が game level 内を移動して visual observation を収集し、自動 annotation pipeline が frame 単位の clipping label を付けるため、人手 annotation なしの controlled task として VLM を比較できる。評価対象は Gemini、GPT、Qwen、Gemma、Llama、Ministral の6系統で、zero-shot 条件と4種類の prompt variant に対する感度を測る。

各 VLM は clipping に関係する visual cue を拾える一方、物体同士が近接しているだけの frame や partial occlusion のような曖昧な画像を clipping と誤認し、多数の false positive を出した。抄録では Gemini-3.1-Flash が overall accuracy と prompt variation への robustness で最良とされ、open-source model は prompt によって precision / recall が大きく変動したと報告される。著者らは、現状の VLM を standalone bug detector として最終判定に使うのではなく、後段の検査へ渡す high-recall candidate filter として multi-stage QA pipeline に組み込む位置付けを示している。

## why_relevant_to_games

headless exploration agent、frame-level ground truth、VLM の候補抽出、後段検証を分業させる例として、ゲーム prototype の visual regression や自動 playtest harness を設計する場面に接続できる。
