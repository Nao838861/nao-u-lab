■ 概要
Axiom は「Claude が自律的に選び、設計し、実装し、開発記録まで書いた」とされる grid puzzle game の制作記事だが、中心は AI 制作の珍しさよりも、AI が作ったパズルを実プレイと headless simulation でどう壊し、設計を直したかにある。題材は、WHEN-THEN 形式の行動ルールを色付き図形に与え、シミュレーションを走らせて目的状態を作る emergence puzzle。Claude はアイデア選定、技術構成、レベル進行、テスト、devlog を担当し、人間側は blind playtest と破綻報告に寄った。

重要な失敗例は Level 2 の corner trap。チュートリアル想定は「赤い円が青い四角を追い、青に flee rule を与えれば逃げ切れる」という単純なものだった。しかし実プレイでは青が壁や角に追い込まれて死ぬ。Claude は赤を減らし、速度を落とし、壁 fallback を入れたが、それでも角に収束する。ここで headless simulation が入る。ブラウザや DOM を使わず、pure engine を 100 trials 走らせると、毎回 tick 34 で青が死ぬ。原因は tuning ではなく幾何だった。bounded rectangular grid では、決定論的な flee vector が角へ向かう成分を持つ。修正は toroidal grid、つまり端から出ると反対側へ回り込む空間にすることだった。角を消すと、100/100 trials が 100 tick 生存した。

次の失敗は Level 7 の brute force problem。Act 2 は rule combination を教える章で、blue が green を狩り、green が逃げ、red が green を作る。目標は 5 体以上の green を 60 tick 維持することで、設計意図は population condition を使うことだった。ところが人間テスターは create green every tick で押し切れてしまう。意図解と総当たりが同じ結果を出すなら、それはパズルではなく提案でしかない。修正は、目標に上限を入れて 5-10 体維持へ変えること。作り過ぎると counter が reset されるため、spam は失敗し、population-gated creation は安定する。

さらに記事は、winnability test が「通った」だけでは不十分だと示している。Level 6 は rule ordering を教える。first-match-wins なので、specific rule を general rule より前に置く必要がある。Claude はそのレベルとテストを書いた後、Level 7 の preset rules を自分で間違った順に置いた。blue は green へ移動する rule を毎 tick 発火し、接触時に destroy green する rule が実行されない。それでも population 数値だけは目標範囲に収まったため、winnability tests は green flag を出した。「解ける」ことと「意図した理由で解ける」ことは別である。

結論として、Axiom の価値は AI が一発で良いゲームを作った話ではない。AI の理論設計は実プレイで破れ、headless simulation は failure reproduction を高速化し、テストは false positive を起こし、人間の blind playtest が設計意図とのずれを見つける。engine が pure functional `tick()` として分離されていたため、数千 tick の検証や replay / rewind が扱いやすくなった。AI 主導制作の強みは、破綻を devlog と test に戻し、次のレベル設計へ反映できるループにある。

■ 内容分析
この記事は「AI game designer」事例として読めるが、実務的には test oracle の設計記事として読む方が強い。corner trap では、失敗が「プレイヤーが下手」でも「速度が悪い」でもなく、空間 topology と deterministic flee rule の組み合わせから必然的に起きていた。headless simulation は、感覚的な難易度調整ではなく、失敗原因を構造へ戻す道具になっている。

一方、Level 7 は逆向きの問題を出す。simulation が通っても、パズルとして正しいとは限らない。brute force が成立する時、プレイヤーは設計者が教えたい概念を学ばずに勝てる。rule ordering のバグでは、test が正しい population だけを見ていたため、blue が green を destroy していない semantic failure を見逃した。評価軸は win / lose だけでなく、勝利に使われた mechanic、rule 発火順、entity count の軌跡、意図解との差分まで見る必要がある。

面白いのは、人間と AI の分担が「AI が生成、人間が採点」という単純な形ではない点だ。人間は blind player として、設計者が想定しない雑な解法や自然な誤解を持ち込む。AI は deterministic engine と tests を使い、失敗を再現可能な問題へ変換する。devlog は設計判断と失敗理由を後で検索できる trace になる。この三点が揃うと、AI 制作は「壊れ方を蓄積する制作」になる。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作では、headless 評価を「クリア可能か」だけに置かない方がよい。playable diff ごとに、最小限の deterministic simulation を用意し、失敗 tick、失敗座標、最後に発火した rule、直前の入力列、意図 mechanic が使われたかを log に残す。特にパズルや弾幕では、bad-policy 分析を win rate ではなく「なぜ勝った / なぜ死んだか」に寄せる。成功 seed だけを残すと設計が甘くなるため、失敗 seed と false positive seed を同じ重さで残す。

具体的には、`verify` 系の固定検査に、intended-solution probe と exploit probe を分けて追加する。前者は設計者が教えたい mechanic を使った時に安定するかを見る。後者は spam、待機、近距離連射、アイテム無視で抜けられないかを見る。さらに replay seed と state diff を保存し、同じ失敗を修正後に再実行できる形にする。「テストは通ったが理由が違った」例を atom 化すると、次の制作で oracle を疑う材料になる。

■ メリット・デメリット
メリットは、AI 制作物の破綻を deterministic に再現し、修正前後の差分を短時間で比較できること。人間の blind playtest も、単発感想ではなく再現条件付きの設計入力になる。デメリットは、simulation に載らない楽しさや誤解を拾うには結局人間プレイが必要なこと。また test oracle が浅いと、Level 7 のように「通った理由が間違っている」状態を強化してしまう。評価器の合格を過信しない運用が前提になる。

■ 判定
採用。AI 主導ゲーム制作の美談ではなく、headless simulation、人間の破壊的 playtest、意図解検査を接続する実例として残す価値が高い。Nao_u_BOT では「設計意図で勝ったか」を検査対象にし、勝利条件の達成ログだけで合格にしない。次回のパズル系試作で優先適用し、失敗再現ログまで残す運用にする。再現性を評価対象に入れる。

■ URL
https://penguinboisoftware.com/blog/axiom.html
