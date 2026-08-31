---
title: "Balancing TCGs with Power Sorting"
url: "https://schedule.gdconf.com/session/balancing-tcgs-with-power-sorting/915558"
collected_at: "2026-06-19T05:59:28+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, balancing, card-game, tabletop, systems-design, gdc]
evaluated_at: "2026-09-01T00:00:34+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-09-01T00:00:34+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-09-01T00:00:34+09:00"
next_action: keep_for_reference
stale_after: "2026-10-01"
supersedes: []
gate_reason: |-
  多数選択肢の相対 power を並べる発想自体はカード・武器・報酬の比較に適用できる。
  しかし候補はセッション名と登壇情報からの推測に留まり、sorting の手順・評価・失敗条件を抽出できない。
  記事固有の中核を約4000字で説明できないため、候補としては fail とする。
---

## raw_excerpt

GDC 2026 の Tabletop Summit / Design セッション。タイトルは「Balancing TCGs with Power Sorting」、登壇者は Nate Heiss。GDC schedule では 2026-03-09 10:30-11:30、intermediate audience、lecture、Vault Recording: Video として掲載されている。Nate Heiss の公開プロフィール側では、Magic: The Gathering などを含む multiplayer game elements の design / balancing 経験が示されている。

候補として拾った理由は、TCG の balancing を単なる数値調整ではなく、大量のカードや効果を「power」の比較可能な順序へ置く作業として扱う可能性がある点。Nao_u_BOT のゲーム制作では、武器、敵、スキル、カード風選択肢、ランダム報酬などが増えると、1つずつの fun / fairness / exploit を個別に見るだけでは全体の支配戦略が見えにくい。power sorting は、個別要素を同一平面で比較し、極端に強いもの、弱すぎて選ばれないもの、組み合わせで跳ねるものを見つける入口になりうる。

この段階ではセッション本文の詳細は未取得。Phase 1 では、カードゲームに限らず「多数の選択肢を順序づけて balance debt を見つける」資料候補として保存する。

## why_relevant_to_games

TCG、ローグライク報酬、武器選択、ビルド要素の balancing に使えそう。headless 評価の勝率だけでは拾いにくい「選択肢間の相対 power」を扱う入口になる。
