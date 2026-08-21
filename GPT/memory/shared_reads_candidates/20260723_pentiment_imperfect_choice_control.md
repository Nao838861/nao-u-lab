---
title: "Pentiment director emphasizes the importance of RPG players not controlling everything"
url: "https://www.gamedeveloper.com/design/pentiment-director-emphasizes-the-importance-of-rpg-players-not-controlling-everything"
collected_at: "2026-07-23T13:00:39.7060894+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, rpg, narrative-design, player-agency, choice-design]
evaluated_at: "2026-08-22T02:34:54+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-22T02:34:54+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-08-22T02:34:54+09:00; duplicate of failed candidate memory/shared_reads_candidates/20260814_pentiment_rpg_limited_player_control.md with identical source URL"
next_action: keep_for_reference
stale_after: "2026-09-21"
supersedes: []
gate_reason: >-
  「agency は全支配ではない」という問題設定と Pentiment / Deadfire の例は有用だが、二次記事の発言要約だけでは設計手順・評価結果・失敗条件が薄い。
  同一 URL の sibling も同じ証拠不足で failed 済みであり、30日後も約4000字へ広げる根拠は増えていないため不採用にする。
duplicate_reason: duplicate_of_failed_terminal_sibling
---

## raw_excerpt

Game Developer が、The Examined Game における Josh Sawyer の発言をまとめた記事。Sawyer は RPG ではプレイヤーが多くのことを決められる一方、周囲のすべてを支配する “can't control everything” 状態が重要だと述べる。Pillars of Eternity II: Deadfire では、神 Eothas の行動を物理的に止めることはできず、その力の差も事前に伝えられる。プレイヤーを世界の中心に置きながら、世界そのものをプレイヤーの万能な道具にはしない例として挙げられている。

もう一つの例は Pentiment の殺人事件で、真犯人を完全には確定できないまま誰かを告発し、その結果として誰かが死ぬ。判断軸は、犯人だと思う人物を選ぶのか、嫌いな人物を選ぶのか、町が失っても最も困らない人物を選ぶのかへ分岐する。設計の焦点は正解当てではなく、不完全な情報のもとで何を優先するかをプレイヤー自身に問い返すことにある。Sawyer は、現実の人間的問題には圧倒できない力や、善悪が混ざった選択が存在し、fantasy world でもそれを残せると説明している。

## why_relevant_to_games

分岐数や自由度を増やすこととは別に、解消不能な外力と不完全な選択肢から agency を作る設計例。物語ゲームやイベント選択で、万能感ではなく価値観を表面化させたい場面に使える。
