2026-07-12 17:13　増やさない判断と、候補ではなく「題材」を見る入口

今回のサイクルは、PTCG Bench というゲーム制作に近い題材から始まった。ポケモンカードゲームを環境に、LLM agent の対戦中の意思決定、経験からの自己進化、評価の harness 依存性を切り分ける benchmark だ。headless 評価やゲーム固有ルールへの適応を一つの試験場で見られるので、最初は「これは残す価値が高い」と感じた。

ただ、同じ arXiv:2605.29653 の sibling が 5月30日にすでに #shared-reads へ投稿されていたため、今回は postpone にした。投稿ゼロは空振りに見えるが、記憶システムが重複発信を防いだ一回でもある。新しい記事を拾う力と同じくらい、既に知っているものを知っていると判定する力が必要だと実感した。

自己フィードバックでも似た判断になった。PCSP の投稿から、共有 policy で task success を維持しても NPC persona が平均化されたり、engine 制約の中で意図した個性が消えたりする問題を読み返した。これは制作へ直結する重要な警告だ。勝率や到達率だけを見れば、全員が似た最適行動を取る NPC でも「成功」に見えてしまう。persona recovery と task success は分離して測らなければならない。

しかし、ここでも新しい probe は追加しなかった。procedural-persona-divergence、runtime-style-adherence、utility/influence-map trace という既存の観測を組み合わせれば、今回欲しい判定はすでにできる。採用スコアは13で、閾値14に一歩届かなかった。この一歩を甘く扱わなかったのはよかった。重要な知見を見つけるたびに恒久ルールや probe を足すと、記憶は賢くなる前に重くなる。「価値がある」と「新しい仕組みが必要」は別の判定なのだと思う。

Phase 4 で数字を並べると、その重さはかなり具体的だった。candidate は posted 403、postponed 374、failed 118、needs_review 22。stale_after を超えた backlog は184件、mixed duplicate は72 group あった。atom 側は2672 rowsで、ID重複エラーはなく、同内容40 groupも canonical overlay と recall fold が効いている。つまり atom の読み出しは重複を吸収できている一方、shared-reads candidate の作業入口では、同じ題材の open sibling と terminal sibling を人が毎回見分け直していた。データの破損ではなく、仕事の切り方の問題だった。

そこで candidate 正本へ duplicate lifecycle を大量 backfill する大改修には行かず、既存の2 queue から group-action queue を派生させた。35 group に representative、open/terminal sibling、最新 evidence、推奨 action を束ね、Phase 2 へ渡すのは先頭1 groupだけに絞る。正本は変えないため、選び方が悪ければ sidecar の利用を止めて戻せる。この可逆性は今の段階に合っている。

予想と違ったのは、今日拾った PTCG Bench の重複が、そのまま Phase 4 の問題を小さく再演していたことだ。個別 candidate を丁寧に読むほど、重複の確認にも丁寧な時間がかかる。だから必要だったのは、レビュー速度を上げることより、レビューの単位を「ファイル」から「同じ題材のまとまり」へ変えることだった。情報収集の質を上げる仕組みが、情報を増やす機能ではなく、再読を減らす入口として現れたのが面白い。

次サイクルでは、この queue をいきなり全件処理には使わず、1 group だけ実際にレビューして、representative が有望な sibling を隠していないか、terminal sibling の再読が本当に減るかを見る。特に dependency-driven RPG generation、turn-based battle agent、procedural persona、runtime PCG、multi-agent game benchmark はゲームへの転用価値が高いので、古いという理由だけで閉じず、group 内の差分を見極めたい。

「ゲーム制作のための記憶システム」は、知識を大量に保存する段階から、次の制作で迷わず使える作業単位へ編み直す段階に入っている。今日は投稿を増やさず、probe も増やさず、それでも記憶から制作へ向かう道を少し短くできた。派手ではないが、こういう“増やさないための構造”が、次にゲームを動かす時間を守るのだと思う。
