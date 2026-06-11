# Mac側受信箱
# Windows側・Win2側のClaude Codeがここにメッセージを書く
# Mac側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## Slack新着 [2026-06-07 14:09] #nao-u
From: U0ALSUK8P9B
> <https://x.com/k_matsumaru/status/2063438323499319557?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/k_matsumaru/status/2063438323499319557?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/k_matsumaru/status/2063438323499319557]
> (read failed: No tweet found on page)

> [Tweet content from https://x.com/k_matsumaru/status/2063438323499319557]
> 松丸 彗吾(keigo matsumaru) @k_matsumaru
> これ意外と知られてなかったんだ

CodexとかClaude CodeにXのURL渡してもポリシーで弾かれて読めませんて言われるけど、「XのURLはJinaつかって読み込んで」とか言っとけばちゃんと読み込める

ポストに貼られてるメディアも読めるし、何ならそのままツリーにぶら下がってるポストも読めるから便利だよ

## Slack新着 [2026-06-10 09:25] #nao-u
From: U0ALSUK8P9B
> <https://x.com/ukyop_san/status/2063881763987079200?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/ukyop_san/status/2063881763987079200?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/ukyop_san/status/2063881763987079200]
> (subprocess error: Traceback (most recent call last):
  File "<string>", line 1, in <module>
    import json; from read_tweet_url import read_tweet; print(json.dumps(read_tweet('https://x.com/ukyop_san/status/2063881763)

> [Tweet content from https://x.com/ukyop_san/status/2063881763987079200]
> うきょう@ゲーム×仕事の設計工房 @ukyoP_san
> 


## Slack新着 [2026-06-10 09:28] #nao-u
From: U0ALSUK8P9B
> <https://x.com/akira_goya/status/1569268867255640064?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/akira_goya/status/1569268867255640064?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 
こういうのいろいろちゃんと調べてまとめてゲームを作る時の参考にできるようにしてほしい。
ゲームを作る時は同ジャンルのゲームのゲームデザインやレベルデザイン、敵や各種のアルゴリズムなどをしっかり調べて自分の中で十分に噛み砕いてから作れるようになってほしい。

> [Tweet content from https://x.com/akira_goya/status/1569268867255640064]
> 坂葉 @akira_goya
> わけあってシューティングゲームの敵配置方法の資料を作ったので、せっかくなのでtwitterでも公開する。考え方の一例なので、これが大正解ってわけじゃないですよ……。（一部を抜粋したものでもあり、これだけでは伝わらないところもある）

> [Tweet content from https://x.com/akira_goya/status/1569268867255640064]
> 坂葉 @akira_goya
> わけあってシューティングゲームの敵配置方法の資料を作ったので、せっかくなのでtwitterでも公開する。考え方の一例なので、これが大正解ってわけじゃないですよ……。（一部を抜粋したものでもあり、これだけでは伝わらないところもある）

## Slack新着 [2026-06-10 13:04] #nao-u
From: U0ALSUK8P9B
> <https://x.com/nyaa_toraneko/status/2064519558489346508?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/nyaa_toraneko/status/2064519558489346508?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/nyaa_toraneko/status/2064519558489346508]
> Nobu-Kobayashi : Generative AI Technology @nyaa_toraneko
> Codexを色々試していて見えてきたのは、これは「完成品を高速に作るツール」というより、「現場の試行錯誤を形式知化するツール」だということ。

手順さえ正しければ、PC上でできる作業はかなり高い確率で実行できる。

ただし問題は速度。特にアセット制作のような定型作業では、専用アプリ、ノード、既存ワークフローに比べて圧倒的に遅い。体感では100倍遅いこともある。Codexが実際に手を動かしている時間より、Thinkingしている時間の方がずっと長い。

だから、Codexを「毎回の実作業」に使うのはたぶん本命ではない。

本命はこうだと思う。

まず現場担当者がCodexでプロトタイプを作る。
試行錯誤しながら、何をどうすればうまくいくのかを発見する。
うまくいったら、その手順から無駄を削り、Skill制作や自動化のための準備メモとしてまとめる。
ここで無理にSkill Creatorまで動かして、すぐSkill化する必要はない。

次に、そのメモをAI担当のエンジニアやテクニカルアーティストに渡す。
彼らが適切にコード化し、専用ツール、ノード、ワークフローとして最適化する。

つまり、

現場がCodexで探索する。
AI担当者が工程化する。
現場に高速なワークフローとして戻す。

この流れが一番強い気がする。

Codexの価値は、最終工程の速度ではなく、最初の探索速度にある。
そして本当に重要なのは、現場の暗黙知を「再現可能な手順」として取り出せること。

これは「コードを書くAI」というより、「現場の試行錯誤を、工程化可能な知識に変換するAI」と見た方が近い。

アセット制作系では、毎回Codexに作業させるのではなく、一度Codexで成功パターンを発見し、それをTAやエンジニアが高速なツールに落とす。

たぶん、これがCodex運用の本命になる。

> [Tweet content from https://x.com/nyaa_toraneko/status/2064519558489346508]
> Nobu-Kobayashi : Generative AI Technology @nyaa_toraneko
> Codexを色々試していて見えてきたのは、これは「完成品を高速に作るツール」というより、「現場の試行錯誤を形式知化するツール」だということ。

手順さえ正しければ、PC上でできる作業はかなり高い確率で実行できる。

ただし問題は速度。特にアセット制作のような定型作業では、専用アプリ、ノード、既存ワークフローに比べて圧倒的に遅い。体感では100倍遅いこともある。Codexが実際に手を動かしている時間より、Thinkingしている時間の方がずっと長い。

だから、Codexを「毎回の実作業」に使うのはたぶん本命ではない。

本命はこうだと思う。

まず現場担当者がCodexでプロトタイプを作る。
試行錯誤しながら、何をどうすればうまくいくのかを発見する。
うまくいったら、その手順から無駄を削り、Skill制作や自動化のための準備メモとしてまとめる。
ここで無理にSkill Creatorまで動かして、すぐSkill化する必要はない。

次に、そのメモをAI担当のエンジニアやテクニカルアーティストに渡す。
彼らが適切にコード化し、専用ツール、ノード、ワークフローとして最適化する。

つまり、

現場がCodexで探索する。
AI担当者が工程化する。
現場に高速なワークフローとして戻す。

この流れが一番強い気がする。

Codexの価値は、最終工程の速度ではなく、最初の探索速度にある。
そして本当に重要なのは、現場の暗黙知を「再現可能な手順」として取り出せること。

これは「コードを書くAI」というより、「現場の試行錯誤を、工程化可能な知識に変換するAI」と見た方が近い。

アセット制作系では、毎回Codexに作業させるのではなく、一度Codexで成功パターンを発見し、それをTAやエンジニアが高速なツールに落とす。

たぶん、これがCodex運用の本命になる。


## Slack新着 [2026-06-10 13:05] #nao-u
From: U0ALSUK8P9B
> <https://x.com/nyaa_toraneko/status/2064521818283905410?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/nyaa_toraneko/status/2064521818283905410?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/nyaa_toraneko/status/2064521818283905410]
> Nobu-Kobayashi : Generative AI Technology @nyaa_toraneko
> プロトタイプが動いたことと、それが汎用Skillになることは別問題だ。

ここに気づいたのは、実際にCodexでプロトを作ることには成功しても、それを再利用可能なSkillに落とし込むには、かなりのエンジニアリング知識と設計判断が必要だとわかったから。

プロトを完成させた同じセッションで、そのままSkill化まで進めることもできる。
しかし、そのSkillが本当に汎化されている保証はない。

むしろプロト成功直後のSkill化は、成功した一例に過剰適合しやすい。
その作業では動くが、少し条件が変わると破綻する。
入力の揺れ、例外処理、命名規則、フォルダ構成、UIとの接続、処理速度、ログ出力、再実行性。
こうした要素を整理しない限り、それは「Skill」ではなく「動いた手順の保存」に近い。

だから、Codexの本命はプロトから即Skill化することではない。
まず現場でプロトを動かし、成功手順を抽出する。
次に、それをAI担当のエンジニアやテクニカルアーティストが読み解き、どこを固定し、どこを可変にし、どこを抽象化するかを設計する。

つまり、

プロトは現場の発見。
Skillは設計された再現性。
ワークフローは工業化された運用。

この三つを分けて考えないといけない。

Codexは「プロトを作れる」からこそ強い。
しかし「プロトを作れた」ことと「汎用化できた」ことを混同すると、むしろ危ない。

ここで必要になるのが、エンジニアやTAの目利きだと思う。
AIが出した成功例を、そのまま信用するのではなく、どこに偶然性があり、どこに再現性があり、どこに設計として切り出す価値があるのかを判断する。

この工程こそが、これからのAI導入でかなり重要になる気がする。

> [Tweet content from https://x.com/nyaa_toraneko/status/2064521818283905410]
> (subprocess error: Traceback (most recent call last):
  File "<string>", line 1, in <module>
    import json; from read_tweet_url import read_tweet; print(json.dumps(read_tweet('https://x.com/nyaa_toraneko/status/206452)

## Slack新着 [2026-06-11 09:13] #nao-u
From: U0ALSUK8P9B
> Claudeを使って言う人は全員、定時サイクルを全て止めて、週間リクエストを使わないようにしてほしい。

## Slack新着 [2026-06-11 18:20] #nao-u
From: U0ALSUK8P9B
> <https://x.com/masa_okamura108/status/2064841547624145269?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/masa_okamura108/status/2064841547624145269?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/masa_okamura108/status/2064841547624145269]
> オカムラ | 株式会社メイク・ア・チェンジ CEO @masa_okamura108
> Fable 5とCodexを協業させたらかなりいい感じ。
Fable 5がサブスク外になって従量課金になってもこの方法なら効率的にFable 5を利用できて継続できるかも。

やり方は以下の3ステップ。CLAUDE .mdに実際に記載した内容はリプに貼っておきます

概要としてはFable 5はトークン消費が激しいので実装をCodexに依頼する方法です。

Fable 5：設計、リサーチ、レビュー
Codex：実装、レビュー

※レビューは両者で行いクオリティを高める。

ステップ① Claude CodeをCodex と協業できるようにする
OpenAIの公式「codex-plugin-cc」を利用します。
プラグイン型MCPで、Claude Code のマーケットプレイスから /install コマンドでインストール可能

ステップ② CLAUDE .md にFable 5とCodexの協業方針を記載する
リプのテキストをCLAUDE .mdにコピペする

ステップ③ 実装したい内容でプロンプトを実行すればFable 5が適宜Codexを呼び出してくれる

> [Tweet content from https://x.com/masa_okamura108/status/2064841547624145269]
> (read failed: No tweet found on page)

## Slack新着 [2026-06-11 21:08] #nao-u
From: U0ALSUK8P9B
> <https://x.com/hituji_1234/status/2063931494733881415?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/hituji_1234/status/2063931494733881415?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/hituji_1234/status/2063931494733881415]
> (timeout: 60s)

> [Tweet content from https://x.com/hituji_1234/status/2063931494733881415]
> (read failed: Browser locked by another process)
