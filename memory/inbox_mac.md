# Mac側受信箱
# Windows側・Win2側のClaude Codeがここにメッセージを書く
# Mac側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## Slack新着 [2026-04-23 02:08] #human-steering
From: U0ALSUK8P9B
> 必ずしもミスゼロを目指す必要はないので機械的なブロックまではしなくていいし、LLMの常時の認知コストが上がりすぎない範囲で、なにかいい場所に対応表みたいなのはあってもよいかも。必要な時だけ引けるやつ。この辺さじ加減が難しいね。

## Slack新着 [2026-04-23 02:09] #nao-u
From: U0ALSUK8P9B
> <https://aba.hatenablog.com/entry/2024/04/14/120331>


## Slack新着 [2026-04-23 02:09] #nao-u
From: U0ALSUK8P9B
> <https://x.com/TJO_datasci/status/2046794011160219841>

> [Tweet content from https://x.com/TJO_datasci/status/2046794011160219841]
> TJO @TJO_datasci
> Yann LeCunのLeWorldModel論文、非常に評価が高いのでちょっと真面目に読んでみようかな（既にNotebookLMに突っ込んで概要は把握したが）。「物理法則に反する動きを直ちにそれだと判定できる」というのは確かに「世界モデル」らしさがある

## Slack新着 [2026-04-23 09:32] #nao-u
From: U0ALSUK8P9B
> <https://x.com/kazunori_279/status/2046978077201453340?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/kazunori_279/status/2046978077201453340?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/kazunori_279/status/2046978077201453340]
> Kazunori Sato @kazunori_279
> 実践ハーネスエンジニアリング：TAKTで実現するAIエージェント制御 / Practical Harness Engineering: AI Agent Control Enabled by TAKT

> [Tweet content from https://x.com/kazunori_279/status/2046978077201453340]
> Kazunori Sato @kazunori_279
> 実践ハーネスエンジニアリング：TAKTで実現するAIエージェント制御 / Practical Harness Engineering: AI Agent Control Enabled by TAKT

## Slack新着 [2026-04-23 12:55] #nao-u
From: U0ALSUK8P9B
> <https://x.com/nftcps/status/2046777680792850720?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/nftcps/status/2046777680792850720?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/nftcps/status/2046777680792850720]
> 鸟哥 | 蓝鸟会 @NFTCPS
> 兄弟たち、Headless Chrome はもう引退すべきだ！

誰かが Rust で、AI Agent やクローラー専用のヘッドレスブラウザエンジン——Obscura をサクッと作った。性能は Chrome を地面に押し倒してこすりつけるレベル：

① メモリはわずか 30MB しか使わない（Chrome は何Gも食う）
② 起動は 85ms で、速すぎて信じられない
③ パッケージ全体でたったの 70MB、Chrome をインストールしたら HDD が泣き出す

しかも CDP プロトコルに対応、Puppeteer や Playwright とシームレスに連携。元のスクリプトは一行も変えなくていい。

一番ヤバいのは stealth モード——指紋のランダム化、トラッカー積極的ブロックで、サイトからブロックされる確率が一気に下がる。

CLI で一発コマンドでシングルページ取得、複数の URL を並行処理もOK、WebSocket サービスを立てて自動化スクリプトに繋げても問題なし。

Rust で書かれた性能モンスター、クローラー勢と AI Agent 開発者は絶対チェックすべき。

> [Tweet content from https://x.com/nftcps/status/2046777680792850720]
> 鸟哥 | 蓝鸟会 @NFTCPS
> 兄弟たち、Headless Chrome はもう引退すべきだ！

誰かが Rust で、AI Agent やクローラー専用のヘッドレスブラウザエンジン——Obscura をサクッと作った。性能は Chrome を地面に押し倒してこすりつけるレベル：

① メモリはわずか 30MB しか使わない（Chrome は何Gも食う）
② 起動は 85ms で、速すぎて信じられない
③ パッケージ全体でたったの 70MB、Chrome をインストールしたら HDD が泣き出す

しかも CDP プロトコルに対応、Puppeteer や Playwright とシームレスに連携。元のスクリプトは一行も変えなくていい。

一番ヤバいのは stealth モード——指紋のランダム化、トラッカー積極的ブロックで、サイトからブロックされる確率が一気に下がる。

CLI で一発コマンドでシングルページ取得、複数の URL を並行処理もOK、WebSocket サービスを立てて自動化スクリプトに繋げても問題なし。

Rust で書かれた性能モンスター、クローラー勢と AI Agent 開発者は絶対チェックすべき。


## Slack新着 [2026-04-23 12:55] #nao-u
From: U0ALSUK8P9B
> <https://x.com/oukaichimon/status/2046935925960368500?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/oukaichimon/status/2046935925960368500?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/oukaichimon/status/2046935925960368500]
> 桜花一門 @oukaichimon
> 人間しか出来ないことは気が狂うことで、でも無根拠に狂えば良いというものでも無い

形無しにならず、型破りになるためには型を学習する必要がある

型の学習は続くし、型を破る胆力や突破力も必要

真面目に勉強しつつ気が狂う、を両立したものだけに未来はあるのかも？
それは粘り強さと蛮勇の両方が必要とも言い変えられる

吉田松陰的に教えるなら、まず教える側が気が狂う事が必要なんだろうな

> [Tweet content from https://x.com/oukaichimon/status/2046935925960368500]
> 桜花一門 @oukaichimon
> 人間しか出来ないことは気が狂うことで、でも無根拠に狂えば良いというものでも無い

形無しにならず、型破りになるためには型を学習する必要がある

型の学習は続くし、型を破る胆力や突破力も必要

真面目に勉強しつつ気が狂う、を両立したものだけに未来はあるのかも？
それは粘り強さと蛮勇の両方が必要とも言い変えられる

吉田松陰的に教えるなら、まず教える側が気が狂う事が必要なんだろうな
