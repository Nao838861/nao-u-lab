---
title: "Reducing interaction friction – the SLARP principle"
url: "https://hubkow.itch.io/pyrates/devlog/1620359/reducing-interaction-friction-the-slarp-principle"
collected_at: "2026-08-12T08:02:38+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, interaction-design, text-game, ux, input]
evaluated_at: "2026-08-12T08:08:19+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-12T08:08:19+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-12T08:08:19+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-11"
supersedes: []
gate_reason: >-
  SLARP の5操作、各操作の実装例、適用境界となる「戦術的に意味のある判断を残す」という原則が一次資料から具体的に抽出できる。
  TUI・メニュー・反復操作の設計へ直接適用でき、定量評価の欠如を限界として扱っても約4000字の固有分析を構成できる。
suggested_post_outline:
  overview_angle: "入力回数の削減ではなく、意味のある判断までの操作摩擦を5種類に分解する実装原則として整理する"
  analysis_axis: "Shorten・Limit・Automate・Recall・Predict が奪う自由度と残す戦術判断を比較し、誤予測や過剰自動化の境界を検討する"
  application_target: "Log_cdx が制作する TUI／メニュー中心の試作で、入力ごとに戦術的情報利得を分類し、反復操作を段階的に短縮する評価軸へ使う"
  pros_cons: "低コストで入力負荷と認知負荷を減らせる一方、定量検証がなく、予測入力は意図の誤読や操作学習の不透明化を招きうる"
  verdict_pre: "部分採用"
---

## raw_excerpt

テキスト主体のゲーム『Pyrates』で、現代のプレイヤーがコマンド入力に感じる摩擦を、追加ライブラリなし・複数 OS で同じ挙動を保つという制約の中で減らした設計メモ。著者は実践を SLARP の5項目に整理する。Shorten commands は各コマンドに1文字 alias を与える。Limit choices は、その場で意味のあるキーだけを提示し、パズル上意味のない移動を入力検証で止める。Automate actions は、攻撃と反撃がどちらも無効な戦闘など、状況が変化するまで意思決定が生じない反復を自動進行する。Recall input は、直前の選択や座標の一部を記憶し、Enter 単独や片方の座標だけで反復できるようにする。Predict intent は、迷路で直進中なら Enter で前進し、曲がり角や行き止まりでは進行方向を補正して、分岐に着くまで単純操作を続けられるようにする。

全体の基準は、目標達成に実際の差を生む tactical な行為と、明白・無意味・ルール上強制される行為を分けることにある。前者には選択の自由を残し、後者に必要な入力だけを短縮・制限・自動化・再利用・予測する。記事は2026年8月8日に公開された、実装例を伴う一次の開発記録である。

## why_relevant_to_games

入力回数そのものではなく「意味のある判断までの摩擦」を減らす観点として、TUI、メニュー中心ゲーム、反復操作の多い試作の操作設計に使える。自動化してよい行為とプレイヤーに残す判断を切り分ける場面に直結する。
