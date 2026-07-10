---
title: "Tempus fugit: Anyone can understand temporal logic if they have to save the realm"
url: "https://arxiv.org/abs/2607.05062"
collected_at: "2026-07-11T02:14:06+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, educational-game, puzzle, formal-logic, mechanics]
evaluated_at: "2026-07-11T02:18:25+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1783704212.614159"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783704212614159"
  char_count: 3579
  posted_at: "2026-07-11T02:23:45+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-11T02:23:45+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783704212614159"
next_action: none
stale_after: "2026-08-10"
supersedes: []
gate_reason: "抽象的な temporal logic を、プレイヤーが敵行動や呪文成立条件として読まざるを得ない有限 trace のゲーム状況へ落としている点が明確。問題設定、手法の中核、ゲームメカニクスへの接続、教育的結論を 4000 字級の概要に展開できる。"
suggested_post_outline:
  overview_angle: "形式論理を説明文ではなく、勝つために読むべきゲーム内条件へ変換する教育ゲーム設計として紹介する。"
  analysis_axis: "linear temporal logic with past を finite trace 上の行動条件に変換し、プレイヤーの目的達成と概念理解を同じ操作に重ねる設計軸。"
  application_target: "Nao_u_BOT のルール発見パズルや小型ブラウザゲームで、抽象概念を UI チュートリアルではなく敵配置・呪文条件・失敗ログとして体験させる設計 probe に使う。"
  pros_cons: "長所は抽象概念の意味をプレイ目的に埋め込めること。弱点は論理記法そのものの評価や学習効果の外部妥当性を本文で慎重に確認する必要があること。"
  verdict_pre: "部分採用。教育ゲーム一般論ではなく、抽象ルールを playable condition に変換する設計パターンとして採用する。"
---

## raw_excerpt

arXiv:2607.05062。2026-07-06 submitted。論文は、小さなブラウザゲーム `Tempus fugit` を通じて、linear temporal logic with past をプレイヤーが目的のために読む状況へ変換する。短い原文断片では "save the realm" と "linear temporal logic with past" が中核語として出てくる。プレイヤーは魔法使いとして敵を倒すが、呪文が使えるか、敵の攻撃が成立するかは、プレイヤーが徐々に作っていく trace に対して時相論理式が真になるかで決まる。つまり、抽象的な論理式を講義として読むのではなく、敵に勝つための状態判定・行動条件として読む設計になっている。論文は、このゲームの設計選択と、game mechanics が finite trace 上の temporal logic とどう結びつくかを説明し、形式論理のように近寄りにくい題材へ playful purpose を与える方法として扱っている。

## why_relevant_to_games

難しい抽象概念を、説明文ではなく勝敗条件・呪文条件・敵行動条件に変換する教材ゲーム設計の候補。パズルやルール発見型ゲームで、プレイヤーに「式を読ませる」のではなく「式を使わざるを得ない状況」を作る観点に使える。
