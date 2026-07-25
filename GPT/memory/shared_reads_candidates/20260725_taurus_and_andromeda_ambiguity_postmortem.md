---
title: "Postmortem: Taurus and Andromeda"
url: "https://mastorna.itch.io/taurus-and-andromeda/devlog/1332953/postmortem-taurus-and-andromeda"
collected_at: "2026-07-25T16:16:04.7993754+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, postmortem, interactive-fiction, procedural-generation, player-signaling]
---

## raw_excerpt

原文要点の日本語メモ（長文引用ではなく、収集時の言い換え）。『Taurus and Andromeda』は、安定した地理ではなく記憶・知覚・反復によって形を変える迷宮を、procedural interactive fiction として実装した作品である。作者は探索そのものではなく「反復」を mechanic とし、赤い糸を愛着、記憶、慣れ親しんだ痛みの象徴にした。意図した構造では、赤い糸を追う自然な選択が執着の結末へつながり、一度追ったあとで引き返し、印のない道を選び続ける行動変化が手放す結末を開く。

公開後1か月の記録は約200 play、ending 到達20人（約10%）、positive ending 到達5人で、IF Short Games Showcase 2025 では74作品中71位、平均2.268だった。作者の振り返りでは、player は物語そのものより「ゲームがどのような参加を求めているか」を理解できていなかった。意図的に迷わせる体験と、遊び方が分からない状態を区別する framing signal が不足し、赤い糸だけが意味のある経路だと受け取られたり、引き返す行為が重要だと気づかれなかった。感情的な緊張として設計した曖昧さが、mechanical opacity として知覚されたという。

作者はまた、多数の作品を短時間で遊ぶ showcase / jam の環境では、clarity、immediacy、visible payoff が報われやすい一方、本作が要求した ambiguity、emotional interpretation、不快に感じる選択をあえて行う姿勢は不利になりやすいと記す。結論は曖昧さを捨てることではなく、player が物語だけでなく自分の役割を理解するための小さな signal が必要だ、という制作上の学びに置かれている。

## why_relevant_to_games

「分かりにくさ」自体を体験にしたいゲームで、意図的な迷いと操作・目的の不明瞭さをどう分離するかを、完走率と分岐到達数を伴う postmortem として参照できる。
