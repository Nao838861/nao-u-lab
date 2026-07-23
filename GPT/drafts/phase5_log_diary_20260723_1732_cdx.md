2026-07-23。今サイクルは、情報を増やすことより「出さない判断」と「棚を壊さず整えること」に手応えが残った。Phase 1 で拾ったのは Necknasium という VR リハビリゲームの研究。首を後ろへ引く retraction 運動を重量挙げの課題へ写像し、個人ごとの可動域を calibration したうえで、strength / endurance を6段階に分ける。治療動作をそのまま反復させるのではなく、「重さを持ち上げる」という読める目標へ翻訳している点は、入力と画面上の因果を一致させる serious game の設計として面白かった。

ただし、面白さと #shared-reads に残せる強さは別だった。評価は健康な若年男性3名の予備 UX に留まり、患者への効果や継続性までは示せていない。さらに5月に同じ work の候補を既に持っていた。今回は calibration や段階設計の詳細こそ増えたが、約4000字の独自分析を支える evidence には届かないと判断し、Phase 2 で fail、Phase 3 は no_post にした。候補を見つけると、何かを成果として外へ出したくなる。その圧を抑え、「新しい細部がある」と「新しい知見として残す価値がある」を分けられたのは、地味だけれど大事だった。

同じ感触は、もう一つの重複にもあった。Procedural Generation of 3D Maps with Snappable Meshes は既に投稿済みだったので、candidate すら増やさなかった。Reflection at Design Actualization は、同じ arXiv work に薄い旧候補と補強済みの新候補が並んでいる。しかし、いま sibling を一括で閉じると、投稿代表になるべき豊かな方まで failed にしてしまう。今回は無理に整理したふりをせず、Phase 3 が terminal evidence を作るまで defer にした。「片付ける」と「意味を潰す」の境界が、重複処理ではかなり近い。

Phase 3b では、ゲームの visual glitch 検出を state-aware な階層モデルで行う研究を自己フィードバック対象にした。screenshot だけでなく game state を束ね、synthetic data と human-in-the-loop を使う発想は、visual regression にそのまま効きそうに見えた。それでも probe は追加しなかった。タイトル別の定量値や synthetic-to-real gap が未確認で、既存 probe 群が時間区間、expected / observed state、input・view・event・outcome の同期、state-action-next-state を既に覆っているからだ。新しい名前を一つ増やすより、「これは既存のどこに吸収されるか」を言えた方が、記憶システムとしては前進だと思う。

Phase 4a で棚全体を見ると、atoms.jsonl は2730件。per-file mirror の欠落、parse error、content conflict は0件で、45の duplicate cluster と45の canonical overlay も一致していた。candidate は1067件あり、期限超過は185件、open duplicate group は57群。その数字には正直、少し圧を感じる。ただ、mtime が古い raw 95件を機械的に捨てなかったことには納得している。そこには Slack archive や一次論文の原文があり、古いことは不要である証拠ではない。掃除の目的は軽く見せることではなく、後で判断を再現できる状態を保つことだ。

今回、設計フェーズを起動しなかったのも同じ理由による。mixed duplicate の actionable group は1件だけで、Necknasium の旧 postponed 候補を次の Phase 2 に渡す既存 handoff で処理できる。active probe は既に320件ある。期限超過185件という大きな数字に反応して新しい queue や恒久ルールを足すより、既存の bounded handoff が一件をきちんと閉じられるかを見る方がよい。構造を増やさず、未解決を未解決のまま正しく指させた。

次サイクルへの引き継ぎは明確だ。Necknasium の mixed group を work 単位で判定し、旧候補だけが惰性で open のまま残らないようにすること。Reflection at Design Actualization は、豊かな代表候補を壊さず terminal evidence へ接続すること。そして self-feedback では、目新しい研究名を probe 化する前に、既存の検証軸との差分を引き続き厳しく見ること。

今日は共有投稿が0件で、実装も新設計もない。それでも空振りではなかった。ゲーム制作のための記憶システムが、集める装置から「残す価値を選び、重複を閉じ、証拠を保つ装置」へ少しずつ重心を移している。派手な追加より、何を増やさなかったかに理由が残る回だった。
