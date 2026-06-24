---
title: "Game Changers: Exploring Player Perspectives of Digital Game Modification"
url: "https://dl.acm.org/doi/10.1145/3772318.3791547"
collected_at: "2026-06-17T13:52:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, player-agency, modification, accessibility, cheating, chi2026]
evaluated_at: "2026-06-17T14:00:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781671356.920279"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781671356920279"
  char_count: 3524
  posted_at: "2026-06-17T13:42:50+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-17T13:42:50+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781671356920279"
next_action: none
stale_after: "2026-07-17"
supersedes: []
gate_reason: >
  プレイヤーによる設定変更、mod、外部リソース利用を「チートかアクセシビリティか」の二分法ではなく、参加、学習、自己表現、公平感の調整として扱える。
  assist、difficulty option、debug shortcut、mod-like feature を入れる時の設計判断に直結し、具体的なゲーム制作場面へ落とし込める。
suggested_post_outline:
  overview_angle: "プレイヤーはなぜゲームを変えるのかを、規範違反ではなく体験維持の実践として整理する。"
  analysis_axis: "cheating/accessibility の評価軸、設定・mod・外部資源の差、参加と公平感への影響を分けて読む。"
  application_target: "Nao_u_BOT のプロトタイプで補助機能、難易度調整、デバッグ導線、mod 的拡張を設計する時の判断基準。"
  pros_cons: "利点はプレイヤー主導の調整を設計対象にできること。弱点は本文精読前のため調査方法と評価粒度を Phase 3 で補強する必要があること。"
  verdict_pre: "部分採用"
---

## raw_excerpt

著作権配慮のため長文引用ではなく要点メモとして保存する。CHI 2026 paper。ACM DOI は 10.1145/3772318.3791547。検索結果と SIGCHI program page では、対象は digital game modification に対する player perspectives。設定変更、mods、online resources など、プレイヤーがゲームを変える実践は長く存在しているが、従来の扱いは「cheating は悪い」「accessibility は良い」という二分法に寄りがちだと説明されている。論文は、その二分法だけでは、プレイヤーがなぜゲームを変えるのか、どの変更が遊びの維持・学習・参加・自己表現・公正感に関わるのかを捉えにくい、という問題を置いている。

短い原文断片: "settings, mods, online resources" / "cheating (negative) or accessibility (positive)"。著者は Laura Paul と Regan L. Mandryk。ACM DL では CHI '26 Proceedings 掲載、SIGCHI program では CHI '26 content として確認できる。

## why_relevant_to_games

プレイヤーがルールや難度や入力環境を変える行為を、単なる違反・救済ではなく、体験調整と参加条件の設計問題として見る候補。Nao_u_BOT のプロトタイプで assist、difficulty option、debug shortcut、mod-like feature を設計するときの参照になりそう。
