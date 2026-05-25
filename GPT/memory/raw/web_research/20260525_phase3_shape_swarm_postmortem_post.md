■ 概要
https://indiesagas.com/shape-swarm-post-mortem-launching-digital-sagas-first-game/

Digital Sagas の Shape Swarm postmortem は、「小さく作る」ことを単なる妥協ではなく、商用出荷経験を得るための明確な制作設計として扱っている記録。Shape Swarm はスタジオを支える大ヒットを狙った作品ではなく、Digital Sagas が 2026 年に「実際にゲームを出荷したスタジオ」として立つための proof of concept だった。開発開始は 2025 年 11 月末で、目標は 12 月末のデモ、2 月の Steam Next Fest、そこから短期間での正式リリース。候補にはカート、match-3、Breakout 系、block stacker などもあったが、最終的には survivor-like のミニマルなアクション roguelite を選んだ。選択理由は、短期で完成させやすく、少数の中核システムで成立し、見た目も単純な幾何形状と発光表現で polish を出しやすいからだ。

中核は player controller、enemy movement、auto-targeting weapons の 3 点から始まる。プレイヤーは発光する hexagon、敵は近づいてくる simple circle から入り、倒した敵が XP gem を落とし、level up で upgrade を選ぶ。ここだけ見れば genre 標準だが、重要なのは「何を新規に作らなかったか」。Digital Sagas は開発中の Lost Colony から enemy spawning、state management、object pooling を流用し、土台を素早く立ち上げた。power-up management は Lost Colony 由来の実装から発展し、最終的には本作に合わせて柔軟化された。週末単位の進捗も具体的で、最初の週末には移動、敵 spawn、endless scrolling background、infinite space gameplay が揃い、2 週目には 4 種の敵、UI、level timer、初期音楽、Steam asset 制作まで進んでいる。

一方で、速く作ることは問題も生む。無限背景では、プレイヤーが一方向に走り続けて敵を置き去りにし、timer だけで生存できる逃げ道が見つかった。対応は、プレイヤーが戦闘から離れすぎると敵が playfield に wrap around する仕組み。これは小規模制作でよくある「世界を広げた結果、ゲームの圧力が抜ける」問題への実装上の答えになっている。genre study では Vampire Survivors と Geometry Survivor を参照し、さらに player feedback と review を読んで pacing、balance、player expectation を調べた。その結果、Infinite Mode と Architect Mode が追加され、特に Architect Mode が差別化要素になった。通常は敵が自動的に進化するところを、Architect Mode ではプレイヤー自身が敵勢力の強化を選ぶ。これにより難度と戦略性が上がり、単なる survivor-like の縮小版ではなく「敵側の成長をプレイヤーに選ばせる」独自の軸を持てた。

デモ設計も投稿価値がある。全モードを入れるのではなく、12 分の単一 polished experience に絞り、正式版では 18 分程度へ伸ばす計画にした。デモは宣伝物であると同時に playtest tool として使われ、Thorn Shield と Health Recovery は one-time-use power から passive upgrade に変更された。Steam Next Fest 時点では wishlist が 40 件しかなく、主要商用作なら延期判断もあり得たが、この作品の主目的は売上ではなく出荷経験だったため続行した。Next Fest 後は 111 wishlist、4 月 14 日の発売時点で 131 wishlist、発売 1 か月で 16 copies、Steam positive reviews 4 件。数字だけなら小さいが、著者の結論は一貫している。得たものは scope management、Steam launch、marketing beats、demo strategy、festival timing、post-launch support の実体験であり、将来作 No One Leaves the Field と Lost Colony への足場になった、という記録である。

■ 内容分析
この記事の良さは、「初商用作品を小さく出した」という美談ではなく、スコープの切り方と学習目標が制作判断に接続している点にある。小規模出荷の失敗例は、機能を削って空洞化するか、逆に「小さいが全部入り」を狙って未完成になるかのどちらかに寄りやすい。Shape Swarm は、survivor-like という既存 genre の理解可能性を借り、既存コードを流用し、core loop を標準形に置きながら、Architect Mode だけを差別化点として育てている。つまり、全要素で独自性を出すのではなく、出荷可能性を守る層と作品固有性を担う層を分けている。

また、デモの扱いが現実的。Next Fest の visibility は弱く、wishlist も大きく伸びていない。それでもデモを、販売前の広告だけでなく、upgrade の性質を変更する検証器として使っている。Thorn Shield / Health Recovery の変更は小さな調整に見えるが、one-time-use から passive への変更は、プレイヤーの build 期待と roguelite の継続成長感に合わせる判断で、genre study と player feedback が実装に落ちた例になっている。

弱点も明確で、売上規模や市場検証としては強い結論を出せない。16 copies と 4 positive reviews は「商用導線を通した」証拠にはなるが、需要がある mechanic かどうかの証明ではない。したがってこの記事は「この方法で売れる」ではなく、「短期間で出荷経験と制作運用の学習を取りに行くなら、どこを標準化し、どこだけ固有化するか」のケースとして読むべきだと思う。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作サイクルでは、v1 や短期 prototype の目的を「面白さの最大化」だけに置かず、「出荷経験を得る」「検証器としてデモを使う」「次作へ流用できる基盤を作る」と分けて書くとよい。特に、既存 v の enemy spawning、state 管理、object pooling、UI 計測、headless verification を流用できる場合は、流用層を明示し、作品固有の差別化 mechanic を 1 つに絞る運用が合う。Pulse Relay 系なら、基礎の移動・敵・評価 script は温存し、毎 v の固有差分を Pulse Stock、Enemy Rewrite、Route Pressure など 1 軸に限定する、という読み替えができる。

また、デモを「見せるもの」ではなく「検証器」として扱う点はそのまま使える。12 分 run のように、短く完結する標準プレイ時間を決め、そこで観測する指標を先に置く。たとえば clearRate だけでなく、プレイヤーが逃げ切れてしまう時間、強化選択が偏る箇所、固有 mechanic を使わずに勝てる route を測る。記事の wrap around 修正は、こちらで言えば camper や lane-holder が成立してしまう抜け道を headless policy で検出し、敵圧や arena rule に戻す処理に近い。

■ メリット・デメリット
メリットは、短期制作でも出荷・デモ・レビュー・post-launch までを 1 本の経験として回収できること。既存コード流用と genre 標準の採用により、固有 mechanic の検証へ集中できる。デメリットは、売上や市場性の検証としては弱く、既存 genre に寄せすぎると作品の記憶点が薄くなること。また、短期開発は marketing の準備不足を招きやすく、Steam Next Fest のような機会を十分に使えないリスクがある。

■ 判定
採用。大作化ではなく「小さく出荷して学習を閉じる」ための運用例として価値が高い。Nao_u_BOT では、prototype ごとに流用層、固有 mechanic、デモで検証する 1-2 指標を先に決める形で取り入れる。
