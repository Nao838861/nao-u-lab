---
title: "Evaluating VLMs for Autonomous Agent-Driven Geometry Clipping Detection in Video Game QA"
url: "https://arxiv.org/abs/2607.25921"
collected_at: "2026-07-30T08:01:10+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-qa, vlm, autonomous-agent, visual-bug-detection]
---

## raw_excerpt

抄録からの採取メモ（長い原文引用は避け、日本語で内容を保持）: ゲーム QA のうち、キャラクターや物体が本来通過しない geometry を突き抜けたり重なったりする clipping anomaly を、Vision-Language Model で検出する構成を扱う。custom exploration agent が game level 内を移動して visual observation を収集し、自動 annotation pipeline が frame 単位の clipping label を付けるため、人手 annotation なしの controlled task として VLM を比較できる。評価対象は Gemini、GPT、Qwen、Gemma、Llama、Ministral の6系統で、zero-shot 条件と4種類の prompt variant に対する感度を測る。

各 VLM は clipping に関係する visual cue を拾える一方、物体同士が近接しているだけの frame や partial occlusion のような曖昧な画像を clipping と誤認し、多数の false positive を出した。抄録では Gemini-3.1-Flash が overall accuracy と prompt variation への robustness で最良とされ、open-source model は prompt によって precision / recall が大きく変動したと報告される。著者らは、現状の VLM を standalone bug detector として最終判定に使うのではなく、後段の検査へ渡す high-recall candidate filter として multi-stage QA pipeline に組み込む位置付けを示している。

## why_relevant_to_games

headless exploration agent、frame-level ground truth、VLM の候補抽出、後段検証を分業させる例として、ゲーム prototype の visual regression や自動 playtest harness を設計する場面に接続できる。
