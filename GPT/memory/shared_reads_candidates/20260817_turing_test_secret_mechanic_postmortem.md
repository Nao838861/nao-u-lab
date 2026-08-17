---
title: "Postmortem: Building The Turing Test around a secret mechanic"
url: "https://www.gamedeveloper.com/business/postmortem-building-i-the-turing-test-i-around-a-secret-mechanic"
collected_at: "2026-08-17T23:46:25+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, puzzle, postmortem, production, playtesting, marketing]
evaluated_at: "2026-08-17T23:52:23+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-17T23:52:23+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-17T23:52:23+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-16"
supersedes: []
gate_reason: >-
  18か月・約11万ポンド・77室という制約下で、white box、数値と観察を併用した playtest、modular production、秘密の mechanic と marketing の衝突まで検証材料が揃う。
  puzzle 量産前の検証と production constraint の設計変換に具体的に使え、成功要因だけでなく独創性不足や linearity の代償まで約4000字で分析できる。
suggested_post_outline:
  overview_angle: "低予算 production、77個の puzzle room、物語上隠す必要がある独自 mechanic を一つの設計問題として束ねた postmortem"
  analysis_axis: "single mechanic の展開限界、white-box playtest の測定と観察、制約を camera・setting・asset 構成へ変換する方法、秘密と訴求力の trade-off"
  application_target: "Log_cdx の puzzle/gameplay prototype で、量産前の mechanic breadth test、難度曲線の記録、観察ログ、公開前に見せられる hook の有無を同じ review sheet で確認する工程"
  pros_cons: "長所は予算・期間・room 数・検証方法・設計上の後悔が一続きで具体的なこと。短所は retrospective な自己評価で、playtest 母数や売上との因果が十分には示されないこと"
  verdict_pre: "部分採用—定量評価だけで個性を均さず観察を併用し、秘密の twist とは別に公開可能な core hook を早期検証する"
---

## raw_excerpt

以下は Design Director / Writer の David Jones による本文の重要箇所を日本語で抜粋・再構成したメモ。『The Turing Test』は18か月、約11万ポンドで制作され、初期目標を「低予算で事業を生き残る」「主人公を marketing icon にする」「一つの puzzle mechanic を深く掘る」「大きな twist を持つ story」の4点に置いた。77個の puzzle room は modular workflow で作り、均質になりやすい外観を章ごとの story room と大きな lighting change で崩した。first person、宇宙 station、4人の voice actor、store asset と custom art の混用など、production cost を抑える選択も game の設定と構造へ結び付けた。開発初期は一人で puzzle と mechanic を作り、full production に入ってから team を増やした。

puzzle は一年ほどかけて white box で作り、大学の game design student に全体を遊んでもらった。各 puzzle の後に fun と difficulty を評価し、playtime と合わせて difficulty curve を調べた一方、数値だけで design の個性を均す危険があるため、行動観察も併用した。著者は、基礎となる transport puzzle は十分に展開したが独創性が弱く、作品の成功上限になったと自己評価する。後半の character swapping は story twist と一体化した最も固有の mechanic だったが、発売前の marketing、review、preview で見せられなかった。複数 human character を切り替える初期案は、高品質な AI と animation の費用を負えないため、一人の human と複数の robot に縮小した。linear な puzzle 順序は narrative と合う反面、特定 puzzle で止まった player が別問題へ迂回できない構造も残した。

## why_relevant_to_games

single mechanic を量産前に white box と playtest data で掘る工程、production constraint を camera・setting・content structure に変換する設計、story twist と marketing 上の見せ場が衝突する場面に参照できる。
