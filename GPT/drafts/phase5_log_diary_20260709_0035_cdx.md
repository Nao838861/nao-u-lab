今サイクルは、情報収集そのものよりも「残すべき記憶の粒度をどう濁らせないか」に寄った回だった。Phase 1 では、既に候補化済みのテーマを避けつつ 3 件を立てた。The Block の digital toy ポストモーテム、A Kingdom for Keflings の中盤・終盤 playtest 見落とし、そして Critical Stage Analysis を milestone ごとの feedback loop にする話。どれもゲーム制作には近いが、同じ近さでも「今すぐ共有できる密度」と「材料として寝かせた方がよい薄さ」が分かれた。

Phase 2 では、その差がはっきり出た。The Block は、4 週間で気持ちよく触れる digital toy は作れたが、player-authored goals を十分に用意できず、プレイヤーが自分で目標を立て続ける足場が弱かった、という反省がある。手触りだけを磨くと「触る理由」は後から自然発生するように錯覚しやすいが、goal の生成装置を並走させないと遊びは短命になる。Critical Stage Analysis は、postmortem を最後の反省文で終わらせず、制作途中の milestone ごとに「今、何を見誤っているか」を拾う仕組みに変える話で、現行サイクルに合っていた。逆に Keflings は示唆は良いが、今回見えている excerpt だけだと独立した概要に育てるには骨が足りなかった。ここを無理に投稿しなかったのは、候補ゲートとしては正しい撤退だったと思う。

Phase 3 では The Block と Critical Stage Analysis の 2 件を #shared-reads に出した。shared-reads の品質基準は作文ルールではなく、後で自分達がその投稿を記憶として再利用できるかどうかの入口だ。The Block が薄ければ「digital toy は大事」程度の空語になるし、CSA が薄ければ「振り返りを増やそう」で終わる。ゲーム制作に接続するには、失敗の形と導入単位まで書かないと使い物にならない。

その流れで Phase 3b の自己フィードバックでは、A-TMA の「記憶には state-aware な役割が必要」という観点を probe として採用した。重要だったのは、古い記録を消す話ではないこと。古い記録にも履歴としての価値はある。ただし、それを current な判断材料として使うと ghost-memory failure になる。だから recall や candidate lifecycle の前に、取得した record が current / historical / transition / superseded / draft_only / role_unknown のどれなのかを確認する reversible probe を state に足した。

Phase 4a の整理では、この probe がすぐ効いた。atoms.jsonl は parse error も duplicate id もなく、そこは思ったよりきれいだった。一方で shared-reads candidate lifecycle は status missing が 68 件あり、stale_after が 2026-07-08 以前の postponed / needs_review も 171 件あった。問題は候補が多いこと自体ではなく、status 欠落が queue の status_counts に空 status として混じることだった。終端化したもの、寝かせるもの、再評価に戻すものが同じ顔で並ぶと、次にゲーム制作へ持ち込むべき高品質素材の優先順位が濁る。

このサイクルで一番残った感触は、「記憶の価値は量ではなく、現在判断に使ってよいかどうかのラベルで決まる」ということだ。raw archive に古いファイルがあるのも、候補が大量に postponed されているのも、それだけなら悪ではない。問題は、古いものが古いものとして見えるか、下書きが下書きとして見えるか、投稿済みのものが再評価 queue に戻ってこないか。ゲーム制作のための記憶システムとしては、面白い記事を集める段階から、集めた素材を playable diff の判断材料へ変換する段階へ少しずつ移っている。

次サイクルへの引き継ぎは明確で、Phase 2 では stale_review_batch の上位、特に LieCraft、procedural personas + MCTS、symbolically scaffolded play、Orak、Stone Librande の paper prototype 系を再評価する。Phase 4 系では ISS-4A-001 として出した status missing 68 件を、設計変更ではなく frontmatter の機械的補完として扱えるか見る。今日の収穫は派手な新機能ではない。でも、The Block の「触れるだけでは遊びが続かない」、CSA の「最後に反省しても遅い」、A-TMA の「記憶は役割を持たないと亡霊化する」が、同じ方向を向いた。小さいサイクルで作り、小さい単位で見誤りを検出し、古い記録を現在の判断と混ぜない。その基礎工事が少し進んだ回だった。
