---
title: "From Pixels to Affect: A Study on Games and Player Experience"
url: "https://arxiv.org/abs/1907.02288"
collected_at: "2026-07-22T20:00:34+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-research, player-experience, affect-modeling, gameplay-video, evaluation]
evaluated_at: "2026-07-22T20:03:01+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1784718435.577389"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784718435577389"
  char_count: 4074
  posted_at: "2026-07-22T20:07:33+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-22T20:07:33+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784718435577389"
next_action: none
stale_after: "2026-08-21"
supersedes: []
gate_reason: >-
  問題設定、データ収集、モデル比較、leave-one-video-out 評価、結果、HUD 交絡と制約まで抽出でき、
  CoopEval 水準の概要を構成できる。playtest 映像評価では代理変数を見抜く ablation と検証単位の設計へ具体的に適用できる。
suggested_post_outline:
  overview_angle: gameplay pixel だけで体験を推定できた結果と、HUD・経過時間を学習した可能性を一体で説明する
  analysis_axis: 精度の高さではなく、動画単位交差検証、曖昧ラベル除外、Grad-CAM が示す識別信号の妥当性を検討する
  application_target: playtest 録画から体験変化を補助推定する評価器の dataset 分割、HUD 除去 ablation、未知作品への外部妥当性確認
  pros_cons: 映像だけで低コストに反復評価できる一方、単一ゲーム、自己注釈、時間・score の代理変数により体験そのものを測っていない恐れがある
  verdict_pre: 部分採用
---

## raw_excerpt

原文の重要部分を日本語で採録する。研究は、プレイヤーの顔、身体、音声、生理情報、gameplay log を使わず、画面に記録された gameplay video の pixel だけから arousal の高低を推定できるかを調べた。対象は Unity 製 3D survival shooter。25人が各2回プレイして RankTrace で自分の arousal を連続注釈し、15秒未満を除いた45動画、計8,093 annotation を用いた。映像は30 Hz、注釈は4 Hzで、frame を grayscale の72×128へ縮小する。入力は単一 frame、または非重複の8 frame（267 ms）列とし、各playerのtraceを0〜1へ正規化した後、trace平均より上をhigh、下をlowとする二値分類に変換した。

比較したのは単一frameの2DFrameCNN、8 frameを2D filterで扱う2DSeqCNN、3D filterを使う3DSeqCNN。評価は44動画で学習し残る1動画でtestする leave-one-video-out を45回繰り返した。曖昧な平均付近を除かない条件では baseline 51%に対し、各modelは70%、74%、73%。平均から±0.20の範囲を除くと datapoint は4,534へ減る一方、精度は77%、78%、77%となった。単一runの最高値は98%と報告される。Grad-CAMでは、high arousal 判定が画面中央上のscore表示などHUDへ強く反応した。annotation全体でもarousal上昇807回、下降297回で、時間経過と累積scoreが予測手掛かりになった可能性が記されている。著者は、短い時間窓や単一game、brightness channelだけを使った点を制約として挙げ、将来はRGB、gameplay log、生理情報とのfusion、arousalの増減予測を検討している。

## why_relevant_to_games

playtest映像から体験変化を推定する際のdataset化、時間窓、player単位の交差検証、曖昧labelの扱いを参照できる。同時にHUD・経過時間・累積scoreがarousalの代理変数になり得るため、自動評価器の観測対象とablation設計にも関係する。
