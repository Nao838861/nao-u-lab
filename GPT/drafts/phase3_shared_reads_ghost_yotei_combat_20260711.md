■ 概要
GDC 2026 の Sucker Punch Productions 講演「Honing the Blade: Evolving Combat for 'Ghost of Yōtei'」は、成功した前作の戦闘を続編でどう変えるか、という危ない設計領域を扱う事例である。公式アジェンダの問題設定は、続編は前作を改善しなければならないが、前作を良くしていたものを壊してはいけない、というもの。対象は Ghost of Tsushima から Ghost of Yōtei への戦闘設計で、保持する mechanics、新しく探索する mechanics、disarm、複数 melee weapons、stance system、敵 variety、boss fight への集約が扱われる。

現地レポートで補強される中核は、前作を post-mortem して「実際に届いた価値」を retroactive pillars として命名した点にある。初期構想ではなく、出荷後にプレイヤー体験として成立していたものを Lethality、Mastery、Fluidity、Cinematic Duels として捉え直す。そのうえで Yōtei では 70/30 の配分を置く。70% は Tsushima の戦闘の核を守り、30% は Wandering Ronin fantasy と Yōtei 6 への熟達の旅を強めるためだけに新しくする。

新規要素の扱いも、単なる足し算ではない。環境 stamina、stamina-based disarm、weapon pickup wildcard は、流動性を壊す、下手なプレイヤーだけを罰する、上手いプレイヤーには見えない、という理由で切られた。残ったのは Katana、Dual Katana、Yari、Kusarigama、Odachi のような恒久武器と、それぞれの identity を stance や enemy design に接続する方向である。特に重要なのは parry の変更で、前作の single-interrupt parry は一度成功すると敵 combo を止められるため、敵 sequence の差がプレイヤーに届きにくかった。Yōtei では consecutive parries に寄せ、sequence 全体を読ませることで、HP や damage を盛らず attack timing と sequence variation で敵の差を作る。現地レポートでは、この変更が 101 種の敵バリエーションを開いたとされている。

評価の中身は数値実験ではなく、設計制約に対する意思決定の妥当性として読むべきものだ。結論は、続編の革新は「増やす」より先に「前作の快感を壊さない制約を言語化し、その制約の内側で失敗案を切る」工程だ、ということになる。

■ 内容分析
この事例の強さは、pillar を未来の願望ではなく、過去に実際に機能した体験の記述として使っている点にある。ゲーム制作では pillar が抽象語になりやすい。「爽快」「奥深い」「映画的」は、単体では判断に使えない。ここでの retroactive pillars は、出荷後の Ghost of Tsushima がプレイヤーに届けたものを逆算して名前にするので、続編で変更案を評価する時の境界線になる。

70/30 も比率そのものより、新規 30% に「core player fantasy に奉仕するものだけ」という条件を付けている点が重要である。続編開発では、前作にない要素があるほど新しく見えるが、機能が増えるほど combat loop の読みやすさ、入力負荷、敵の視認性、上達曲線は崩れやすい。Sucker Punch の判断は、足し算の上限を作り、さらに上限内でも fantasy と pillars の両方を通るものだけ残す構造になっている。

失敗案の扱いも参考になる。stamina-based disarm が「下手なプレイヤーを罰し、上手いプレイヤーには見えない」なら、それは見た目には depth でも、体験上は良い mechanics ではない。weapon pickup wildcard が fluidity を壊すなら、自由度が増えても pillar に反する。consecutive parries も同じで、敵の難度を HP や damage で上げるのではなく、攻撃 sequence と timing の差で増やす。敵 variety はデータ量ではなく、プレイヤーが認識できる sequence の差として成立する。

限界もある。これは GDC 講演と現地レポートであり、プレイテスト指標、離脱率、難度分布、アクセシビリティ影響、実装コストまでは公開情報だけでは分からない。101 variants という数字も、種類数だけでは品質を証明しない。採用すべきなのは「Sucker Punch の正解」ではなく、「続編や改修で何を守り、何を増やし、何を切るかを決める枠組み」である。

■ 自分達の環境への適用
Nao_u_BOT のゲーム制作では、既存 prototype を改修する時に「弱点を直す」名目で mechanics を増やしがちになる。ここで使えるのは retroactive pillars の縮小版だ。改修前に、今の版が実際に届けている成功感を 3 つ以内で書く。たとえば「回避が読めた時に勝てる」「狭い入力で状況が変わる」「最後の一手が見える」のように、理想ではなく現プレイで成立している体験を書く。その後で追加案を、「既存の成功感を壊すか」「新規要素はその成功感を増幅するか」で判定する。

headless 評価にも落とせる。HP や damage を変えた時だけ成功率を見るのではなく、敵 sequence の variation が bot の行動ログに現れているかを見る。enemy pattern A/B/C に対して、bot の dodge timing、attack cancel、被弾位置、再挑戦時の改善が違うかを記録する。違いが出ないなら、その敵差はプレイヤーにも届いていない可能性がある。逆に成功率だけが落ちて行動差がないなら、難度を上げただけで mastery を作っていない。

小さい検証案としては、次の combat prototype で「single interrupt」と「sequence completion」を A/B 実装する。A は一回の成功回避や parry で敵 combo が止まる。B は一部の敵だけ、二段目まで読まないと安全にならない。評価は勝率ではなく、1 回目と 3 回目のプレイで被弾タイミングが後ろへずれるか、プレイヤーまたは bot が同じ敵に対して待つ・近づく・離れるの行動を変えるかを見る。

■ メリット・デメリット
メリットは三つある。第一に、続編や改修の議論を「新規要素の量」ではなく「既存の成功体験を言語化して守る」方向へ戻せる。第二に、敵 variety を HP や damage の水増しではなく、attack timing と sequence recognition で作る視点を持てる。第三に、失敗案を記録する価値がはっきりしている。採用 mechanics だけを見ると華やかだが、制作の再現性を上げるのは、なぜ切ったかのほうである。

危険も明確だ。大規模スタジオの続編設計を小規模 prototype にそのまま持ち込むと、武器数や敵数だけ真似して scope が破裂する。五つの恒久武器や 101 variants は結果であって、我々が真似る単位ではない。consecutive parries も、入力精度や視認性が低い prototype では理不尽に見えやすい。さらに retroactive pillars は、現プレイログや失敗例に結び付けずに書くと、判断基準ではなく後付け美化になる。

■ 判定
部分採用。Ghost of Yōtei の具体 mechanics を真似るのではなく、改修前に既存の成功体験を retroactive pillars として短く固定し、新規 mechanics をその成功体験への奉仕で判定する枠組みを採用する。次の小規模 combat 改修では、HP / damage ではなく sequence variation が行動ログに現れるかを検証軸に入れる。公開情報だけでは実測評価が足りないため、採用範囲は設計プロセスと評価観点に限定する。

■ URL
https://schedule.gdconf.com/session/honing-the-blade-evolving-combat-for-ghost-of-ytei/913736
https://www.invisiblefriends.net/gdc-2026-a-personal-account/
