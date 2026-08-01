---
title: "MuseBench: Benchmarking Intent-Level Audiovisual Arts Understanding in MLLMs"
url: "https://arxiv.org/abs/2606.30026v1"
collected_at: "2026-08-02T01:46:13+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, game-arts, audiovisual-design, multimodal-llm, evaluation]
evaluated_at: "2026-08-02T01:49:31+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1785603364.132359"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785603364132359"
  char_count: 4488
  posted_at: "2026-08-02T01:56:28+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-02T01:56:28+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785603364132359"
next_action: none
stale_after: "2026-09-01"
supersedes: []
gate_reason: >-
  問題設定、creative intent を測る着想、4段階の設問構築、28モデルと専門家の比較、結論まで一次資料から抽出できる。
  game arts を直接含み、ゲーム自己評価で事実認識と演出意図の理解を分離する評価設計へ具体的に適用でき、約4000字の分析を支える密度がある。
suggested_post_outline:
  overview_angle: "対象認識では測れない creative intent 理解を、映像芸術4領域の設問と expert gap で可視化した benchmark として整理する"
  analysis_axis: "shortcut filtering・adversarial distractor・expert validation が意図理解の測定妥当性をどう支え、48.29%対87.18%の差が何を示すか"
  application_target: "Log_cdx のゲーム自己評価で、画面上の事実・演出意図・プレイヤー体験の推論を別 rubric にし、VLM 判定の過信を検出する評価 harness"
  pros_cons: "意図レベル評価を具体化できる一方、video essay 由来の知識問題を実プレイ中の体験評価へそのまま移植はできず、game arts subset と設問例の精査が必要"
  verdict_pre: "部分採用"
---

## raw_excerpt

arXiv 要旨の収集メモ（直接引用ではない）。映画、静止画、舞台芸術、ゲームデザインでは、画面に何が映っているかを認識するだけでなく、視覚・音響・物語上の選択がなぜその表現意図に使われたかを推論する必要がある。MuseBench は、この「creative intent」の理解を multimodal large language model で測る benchmark として提示されている。10,000 本超の候補 video essay から、専門的な解説と視覚的な実演が対応する素材を抽出し、cinematic arts、static visual arts、stage performing arts、game arts の4領域にまたがる4,016問を構成する。問題形式は single-select と、選択肢数が変わる multi-select を併用する。設問生成は shortcut filtering、adversarial distractor、expert validation を含む4段階の反復 pipeline で整備された。28種類の state-of-the-art MLLM を zero-shot 評価した結果、最高モデルでも正解率48.29%で、人間の専門家87.18%を大きく下回ったと報告される。原文は artistic understanding を、単なる対象認識ではなく「why it is expressed through particular creative choices」を扱う課題として区別している。

## why_relevant_to_games

ゲーム画面・音・演出を評価する VLM が、オブジェクト検出や不具合発見だけでなく、意図した感情や演出理由まで読めるかを切り分ける評価軸として参照できる。game arts 部分の設問構成と expert gap は、AI によるゲーム自己評価の限界を測る場面に接続しうる。
