---
title: "Reason to Play: Behavioral and Brain Alignment Between Frontier LRMs and Human Game Learners"
url: "https://arxiv.org/abs/2605.08019"
collected_at: "2026-06-04T15:00:05+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, player-modeling, ai-agent, evaluation, cognitive-science]
evaluated_at: "2026-06-04T15:03:43+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1780553289.216279"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780553289216279"
  char_count: 3902
  posted_at: "2026-06-04T15:28:09+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-04T15:28:09+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780553289216279"
next_action: none
stale_after: "2026-07-04"
supersedes: []
gate_reason: "未知ゲームのルール発見を LRM / RL / Bayesian agent / 人間行動・fMRI で比較する問題設定と評価軸が明確。勝敗やスコアではなく、仮説更新・状態表現・行動系列を観測する発想を Nao_u_BOT のヘッドレス評価やプレイログ設計へ具体的に転用できる。abstract ベースでも手法の中核と結論が立っており、Phase 3 で CoopEval 水準の概要に展開できる。"
suggested_post_outline:
  overview_angle: "未知ゲームを学ぶ人間と frontier LRM を、プレイ成績だけでなく行動一致と脳活動予測で比べる評価研究として整理する。"
  analysis_axis: "問題設定、データセット、比較モデル、3 種の評価軸、brain alignment が state representation を反映するという解釈を分けて読む。"
  application_target: "Nao_u_BOT の自動プレイ評価で、勝てたかではなく仮説更新、探索の偏り、状態表現、ログから見える学習段階を観測する設計に効く。"
  pros_cons: "利点は AI プレイヤー評価を人間の学習過程へ寄せる軸を得られること。弱点は fMRI/人間実験そのものは制作現場で再現しづらく、実装へ落とす時はプレイログ proxy に変換が必要なこと。"
  verdict_pre: "部分採用。脳活動予測ではなく、行動系列と状態表現 proxy を使う評価設計として取り込む。"
---

## raw_excerpt
arXiv:2605.08019。Botos Csaba / Sreejan Kumar / Austin Tudor David Andrews / Laurence Hunt / Chris Summerfield / Joshua B. Tenenbaum / Rui Ponte Costa / Marcelo G. Mattar / Momchil Tomov。2026-05-08 submitted。

論文の対象は、人間が未知のビデオゲームを学ぶ時のルール発見、仮説更新、複数手順の計画を、frontier Large Reasoning Models と比較する研究。データセットは complex human gameplay と同時 fMRI 記録を含み、モデルはゲームをプレイする能力、人間の学習行動との一致、同じ課題中の脳活動予測という 3 つの観点で評価される。比較対象には model-free / model-based deep reinforcement learning agent と Bayesian theory-based agent が含まれる。

arXiv abstract の核は、LRM が game discovery 中の人間の行動パターンに最も近く、強化学習系の代替手法より脳活動予測で大きく良かった、というもの。さらに著者らは、brain alignment が下流の planning / reasoning そのものよりも、game state の in-context representation を反映している可能性を示す。プロジェクトページには interactive replays もある。

## why_relevant_to_games
未知ルールの発見・仮説更新・習熟過程を、スコアだけでなく行動系列や状態表現として見る候補。Nao_u_BOT のヘッドレス評価やプレイログ設計で「AI が勝てたか」以外の観測軸を考える時の材料になる。
