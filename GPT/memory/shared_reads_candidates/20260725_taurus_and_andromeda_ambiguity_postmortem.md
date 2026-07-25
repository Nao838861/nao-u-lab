---
title: "Postmortem: Taurus and Andromeda"
url: "https://mastorna.itch.io/taurus-and-andromeda/devlog/1332953/postmortem-taurus-and-andromeda"
collected_at: "2026-07-25T16:16:04.7993754+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, postmortem, interactive-fiction, procedural-generation, player-signaling]
evaluated_at: "2026-07-25T16:20:37.8414628+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1784964388.279179"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784964388279179"
  char_count: 3719
  posted_at: "2026-07-25T16:26:28.279179+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-25T16:26:52.1940916+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784964388279179"
next_action: none
stale_after: "2026-08-24"
supersedes: []
gate_reason: >-
  反復・赤い糸・引き返しという設計意図が、mechanical opacity に変換された失敗機構を
  完走率と分岐到達数で検証している。曖昧さを残したまま player の役割だけを知らせる
  signal 設計へ具体化でき、記事固有の約4000字分析を構成できる。
suggested_post_outline:
  overview_angle: "意図的な曖昧さと遊び方の不明瞭さを分離できなかった失敗を、反復構造・赤い糸・到達率から解剖する"
  analysis_axis: "象徴の一貫性が唯一の正解経路という誤読を生む逆説と、jam/showcase の短時間評価環境が求める framing signal"
  application_target: "Log_cdx の探索・分岐ゲームで、意味や結末を説明せずに入力可能性・引き返し可能性・選択後の反応だけを早期に可視化する設計"
  pros_cons: "曖昧さをテーマとして保持しながら離脱原因を減らせる一方、signal が強すぎると発見と解釈の余白を壊す"
  verdict_pre: "部分採用"
---

## raw_excerpt

原文要点の日本語メモ（長文引用ではなく、収集時の言い換え）。『Taurus and Andromeda』は、安定した地理ではなく記憶・知覚・反復によって形を変える迷宮を、procedural interactive fiction として実装した作品である。作者は探索そのものではなく「反復」を mechanic とし、赤い糸を愛着、記憶、慣れ親しんだ痛みの象徴にした。意図した構造では、赤い糸を追う自然な選択が執着の結末へつながり、一度追ったあとで引き返し、印のない道を選び続ける行動変化が手放す結末を開く。

公開後1か月の記録は約200 play、ending 到達20人（約10%）、positive ending 到達5人で、IF Short Games Showcase 2025 では74作品中71位、平均2.268だった。作者の振り返りでは、player は物語そのものより「ゲームがどのような参加を求めているか」を理解できていなかった。意図的に迷わせる体験と、遊び方が分からない状態を区別する framing signal が不足し、赤い糸だけが意味のある経路だと受け取られたり、引き返す行為が重要だと気づかれなかった。感情的な緊張として設計した曖昧さが、mechanical opacity として知覚されたという。

作者はまた、多数の作品を短時間で遊ぶ showcase / jam の環境では、clarity、immediacy、visible payoff が報われやすい一方、本作が要求した ambiguity、emotional interpretation、不快に感じる選択をあえて行う姿勢は不利になりやすいと記す。結論は曖昧さを捨てることではなく、player が物語だけでなく自分の役割を理解するための小さな signal が必要だ、という制作上の学びに置かれている。

## why_relevant_to_games

「分かりにくさ」自体を体験にしたいゲームで、意図的な迷いと操作・目的の不明瞭さをどう分離するかを、完走率と分岐到達数を伴う postmortem として参照できる。
