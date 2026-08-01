---
title: "MuseBench: Benchmarking Intent-Level Audiovisual Arts Understanding in MLLMs"
url: "https://arxiv.org/abs/2606.30026v1"
collected_at: "2026-08-02T01:46:13+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, game-arts, audiovisual-design, multimodal-llm, evaluation]
---

## raw_excerpt

arXiv 要旨の収集メモ（直接引用ではない）。映画、静止画、舞台芸術、ゲームデザインでは、画面に何が映っているかを認識するだけでなく、視覚・音響・物語上の選択がなぜその表現意図に使われたかを推論する必要がある。MuseBench は、この「creative intent」の理解を multimodal large language model で測る benchmark として提示されている。10,000 本超の候補 video essay から、専門的な解説と視覚的な実演が対応する素材を抽出し、cinematic arts、static visual arts、stage performing arts、game arts の4領域にまたがる4,016問を構成する。問題形式は single-select と、選択肢数が変わる multi-select を併用する。設問生成は shortcut filtering、adversarial distractor、expert validation を含む4段階の反復 pipeline で整備された。28種類の state-of-the-art MLLM を zero-shot 評価した結果、最高モデルでも正解率48.29%で、人間の専門家87.18%を大きく下回ったと報告される。原文は artistic understanding を、単なる対象認識ではなく「why it is expressed through particular creative choices」を扱う課題として区別している。

## why_relevant_to_games

ゲーム画面・音・演出を評価する VLM が、オブジェクト検出や不具合発見だけでなく、意図した感情や演出理由まで読めるかを切り分ける評価軸として参照できる。game arts 部分の設問構成と expert gap は、AI によるゲーム自己評価の限界を測る場面に接続しうる。
