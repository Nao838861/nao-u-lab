---
title: "Generating Levels That Teach Mechanics"
url: "https://arxiv.org/abs/1807.06734"
collected_at: "2026-05-17T11:59:51+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, tutorial, level-design, pcg, mechanics, player-learning]
evaluated_at: "2026-05-17T12:02:16+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-17T12:08:49+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778987311130029"
posted:
  ts: "1778987311.130029"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778987311130029"
  char_count: 3500
  posted_at: "2026-05-17T12:08:49+09:00"
stale_after: "2026-06-16"
supersedes: []
gate_reason: "問題設定、着想、agent variation による solvability difference、Mario AI Framework での評価範囲、結論が明確。ゲーム制作への適用は tutorial / onboarding / level gate に具体的で、文章説明ではなく行動要求として mechanic を教える軸が強い。~4000 字概要も、手法の単純さと限界を含めて構成できる。"
next_action: none
suggested_post_outline:
  overview_angle: "tutorial を説明文ではなく、特定 mechanic を使わないと解けない小レベルとして生成・検査する発想。"
  analysis_axis: "完全 agent と能力欠損 agent の solvability difference を、mechanic teaching の検査条件にする点。"
  application_target: "新 mechanic 導入直後の小ステージ、パズル/アクションの onboarding、プレイヤーに操作を体得させる level gate。"
  pros_cons: "メリットは mechanic 要求を実行可能な判定に落とせる点。デメリットは agent モデルを作れる範囲に依存し、楽しさや人間の学習負荷は別評価が必要な点。"
  verdict_pre: "部分採用。tutorial 設計時の検査条件として採用し、人間プレイテストで補完。"

---

## raw_excerpt

arXiv:1807.06734。Michael Cerny Green、Ahmed Khalifa、Gabriella A. B. Barros、Andy Nealen、Julian Togelius。2018-07-18 submitted、2018-10-01 v4。主題は、ゲームの tutorial を注釈や説明文で作るのではなく、プレイヤーがその mechanic を使えないとクリアできない小レベルを自動生成すること。

対象は Mario AI Framework。論文は perfect A* agent を基準にしつつ、高くジャンプできない、敵を見られないなど、特定能力を欠いた agent variation を用意する。生成された小レベルを、完全 agent は解けるが、特定行動を欠いた agent は解けない、という形で検査することで、その level が mechanic を要求しているかを見る。つまり「説明を読ませる」のではなく、「その行動を身につけないと進めない地形」を PCG の評価条件にする。

PCG Workshop at FDG 2018 の 8 ページ論文。abstract 上の射程は Mario 系の小レベルだが、mechanic teaching を solvability difference として扱う発想が中心。

## why_relevant_to_games

パズルやアクションのチュートリアルを、文章ではなく level gate として設計するための候補。Nao_u 側の「新規要素をいつ出すか」「操作して身につける」指摘と接続できる。
