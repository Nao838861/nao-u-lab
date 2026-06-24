---
title: "EgoCS-400K: An Egocentric Gameplay Dataset for World Models"
url: "https://arxiv.org/abs/2606.18180"
collected_at: "2026-06-21T08:59:25+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [gameplay-dataset, world-models, fps, replay, egocentric-video]
evaluated_at: "2026-06-21T09:02:37+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1782000659.410219"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782000659410219"
  char_count: 4520
  posted_at: "2026-06-21T09:11:11+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-21T09:11:11+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782000659410219"
next_action: none
stale_after: "2026-07-21"
supersedes: []
gate_reason: |-
  gameplay replay を video / action / state / event / language trajectory として同期する設計が明確で、world model 以前に制作ログ設計として価値がある。
  Nao_u_BOT の headless replay や gameplay trace 保存で、何を記録すべきかを具体化できるため #shared-reads 水準の概要を書ける。
suggested_post_outline:
  overview_angle: "EgoCS-400K を、ゲームリプレイを world model 用の同期 trajectory に変換する設計例として扱う。"
  analysis_axis: "public demos から replay rendering、入力、視線方向、イベント、state を揃える pipeline と評価用途。"
  application_target: "自作ゲームのリプレイ保存、AI playtester の行動ログ、future prediction / event-aware rollout 用データ設計。"
  pros_cons: "長所は action と state が揃うこと。弱点は FPS 依存が強く、権利と再現環境の扱いが重いこと。"
  verdict_pre: "部分採用。大規模 dataset ではなく、制作中ゲームの最小 trace schema として取り込む。"
---

## raw_excerpt

arXiv 検索結果から取得。2026-06-16 投稿。EgoCS-400K は、interactive world modeling 向けに、video / action / language trajectory を時間同期した大規模 egocentric gameplay dataset。world model には captioned video だけでなく、future scene changes を駆動する action、camera motion、state、event が必要だが、Web video は action / state を欠き、robotics dataset は高価で多様性が狭く、simulator は大規模な human-driven interaction trajectory が不足する、という問題設定。

データは public professional CS / CS2 match demos から構築され、replay、rendering、temporal alignment が可能。player states、view directions、movement、keyboard/button inputs、view-angle changes、weapon usage、game events、round-level context を抽出し、同じ trajectory から clean first-person videos を render する。規模は 400,000 以上の first-person videos、10,000 hours の gameplay、1,000 matches 超、40,000 rounds、13 maps、round あたり 10 player viewpoints。用途は action-conditioned future prediction、state/event-aware rollout、replay-grounded captioning、egocentric action understanding。

## why_relevant_to_games

ゲーム replay を「動画素材」ではなく、入力・状態・イベントと同期した world-model 訓練データとして扱う候補。Nao_u_BOT の headless replay / gameplay trace 保存設計にも、どの state と action を残すべきかの参照になる。
