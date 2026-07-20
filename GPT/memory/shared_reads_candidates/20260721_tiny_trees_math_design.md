---
title: "Tiny Trees Post Mortem: How Math Helped Design A Game"
url: "https://www.gamedeveloper.com/design/tiny-trees-post-mortem-how-math-helped-design-a-game"
collected_at: "2026-07-21T08:46:42+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, board-game, postmortem, balancing, probability, physical-prototyping]
---

## raw_excerpt

『Tiny Trees』は、42枚の六角形 card を差し込み、得点を競いながら実物の立体樹を組み上げる board game。高品質 cardstock を手で切り、個別に描く prototype は反復コストが高いため、playtest だけに頼らず数学と統計で探索範囲を絞った。各辺に一つの切れ込みがある六角形は二値表現上63通りだが、回転や鏡像の重複を除くと固有形は12種になる。全辺に切れ込みがある初期版は自由度が高すぎて、player が慣れた同型の樹ばかり作った。逆に二つだけでは選択肢が不足するため、最終版は樹種ごとに「二つの切れ込み5枚、四つ4枚、六つ2枚」とし、平均3.29個へ配分した。

少ない切れ込みの card は成長と物理 balance の選択肢を減らすので、そのままでは選ばれにくい。そこで beetle・mushroom・bird の lifeform を得点源として追加し、各6個を三つの樹種へ均等に配置した。hypergeometric calculator を使い、全 card の約43%に lifeform があり、公開された選択肢上位3枚にちょうど一つ現れる確率を約45%、一つも現れない確率を約25%として把握した。lifeform は切れ込みの少ない card に寄せ、成長自由度を捨てる代わりの得点動機にした。同種収集の得点は1・1・2・2・3・3と段階的に増やし、偶然一つ取るだけでは大差にならず、集める方針には報酬が出る形にした。数値モデルは playtest を置換せず、曖昧な反応の背後にある配分問題を特定し、作り直す物理 prototype の数を減らすために使われた。

## why_relevant_to_games

prototype の作り直しや人力 test が高価な時、組合せ数・分布・出現確率を先に可視化し、player feedback の原因候補を狭める設計例として参照できる。
