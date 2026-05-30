■ 概要
この記事は、カードゲームの新セットや多数のコンポーネントを作る時に、いきなり個別カードをデザインせず、まず「design skeleton」という粗い設計骨格を作る手順を説明している。題材は Magic: The Gathering の set design だが、中核はカードゲーム固有の話ではなく、作品全体に必要な役割、分布、制約、差別化軸を、個別実装より前に表へ置く方法である。

design skeleton は、完成カード一覧ではない。記事では、set やカード群をメタ視点で見るための preliminary plan / blueprint として扱われている。目的は、各カードの詳細能力や名前を決めることではなく、どの種類のカードがどれだけ必要か、どの色や faction にどの役割を持たせるか、どの slot がまだ空いているかを見えるようにすることにある。作者は、skeleton を「埋めれば終わりのチェックリスト」ではなく、画家が使う sketch に近いものとして説明している。つまり、作業を固定するための表ではなく、全体像を失わないための仮置きである。

手順は 7 段階に分かれる。最初に、カードが何によって区別されるか、総枚数はいくつか、色・勢力・カードタイプなどの区分ごとに何枚必要かを粗く決める。この段階では最終回答でなくてよく、ゲームの目的、必要コンポーネント、制約、基本ループが見えた後、個別カード制作に入る前の中間作業として置く。

次に card slot を定義する。slot はカード名ではない。開発中はカード名、テーマ、能力値、効果文が大きく変わるため、完成物の名前で管理すると履歴が崩れやすい。そこで rarity、color、card type などの区別軸から「この set には common の白 slot が何個、green common creature slot が何個」という枠を先に作る。Magic の例では、common / uncommon / rare / mythic と色の組み合わせに、さらに type や役割を足していく。各 slot には C-G-01 のような identifier を付け、後でカードが差し替わっても「どの枠を満たすカードか」を追えるようにする。

3 段階目では、そのゲームの頑丈さを支える最重要 card type の比率を決める。Magic なら creature がそれに当たり、通常 set では common slot のかなり大きな割合を占める。ただし全色で完全均等に置くのではなく、白や緑は creature を多めに、青や黒や赤は別の役割を持たせる、というように playstyle の差を slot 分布へ反映する。ここで faction identity が、文章上の設定ではなく、実際のコンポーネント比率として現れ始める。

4 段階目では、最重要 type について超粗いカード設計を入れる。Magic なら power / toughness や keyword、別ゲームなら small / medium / large、tank / damage dealer / healer のような分類で十分だとされる。ここでも詳細能力を書くのではなく、勢力ごとの性格を少しずつ具体化することが狙いになる。

5 段階目で他の card type を slot に足す。instant、sorcery、artifact、enchantment のような枠を、色ごとの特徴や必要なプレイ体験に合わせて置く。重要なのは、既存 slot もこの途中で変更してよい点である。たとえば surprise moment が足りないなら、instant を増やす代わりに creature に flash 相当の役割を与える、という調整ができる。記事はここで、skeleton は designer を縛るものではなく、何を割り当てる必要があるかを意識させるためのものだと強調している。

6 段階目では faction-specific effects を置く。緑の pump、青の counter、赤の direct damage、黒の destroy、白の lifegain や team pump のように、各色が得意とする効果群を割り当てる。これは単発カードではなく、プレイスタイルを支える効果セットとして扱われる。既存ゲームでは proven structure を再利用できるが、新作では成功レシピがないため、この段階で各 faction の遊び方を意識的に分ける価値が高い。

最後に set-specific keyword や test したい mechanics を入れる。よくある問題は、入れたい card type、keyword、effect が多すぎて slot に収まらないことだとされる。skeleton を使うと、ある keyword を何回出すか、どの色で使うか、その flavor と play type は何かを俯瞰できる。個別カードの spreadsheet だけを見ていると細部に沈むが、skeleton へ戻ると、全体として何が足りないか、何が過密かが見える。結論として、design skeleton は開始点であると同時に living document であり、制作途中で何度も戻って更新するための大局表である。

■ 内容分析
この記事の価値は、「アイデアを発散する方法」ではなく「コンテンツ群の分布を検査する方法」として design skeleton を置いている点にある。カードゲームの制作では、面白いカード案を思いつくこと自体より、set 全体で何が過多で、何が不足し、どの faction が同じ遊びになっているかを早く見つける方が難しい。slot identifier を使う発想は、この問題に直接効く。開発中にカード名や効果が変わっても、C-G-01 のような枠が残れば、変更履歴は「案 A から案 B へ」ではなく「この役割 slot をどう満たすか」として追える。

また、faction identity を lore や色名ではなく、creature 比率、card type 分布、core values、keyword の粗配置として扱う点も重要である。勢力の個性は、設定文だけではプレイヤー体験にならない。白は横に並ぶ、青は回避や反応が強い、赤は直接的な圧力をかける、という差は、実際にどの slot が多いかで初めてゲーム内に現れる。これはゲーム制作でよく起きる「コンセプト上は違うが、実装すると同じ行動になる」問題への対策になっている。

一方で、この記事の手法は、既に Magic という巨大な先例があるから説明しやすい面もある。新作や小規模 prototype では、50% creature のような経験則も、色ごとの標準配分もない。その場合は、記事が述べる通り、他ゲームの調査、確率、仮の制約、rule of thumb から始めるしかない。つまり skeleton は正解表ではなく、仮説表である。最初の表が正しいことより、playtest や実装ログで「この slot は足りない」「この mechanics は出過ぎる」と戻れる構造を作ることが本体になる。

■ 自分達の環境への適用
Nao_u_BOT の制作では、これをカード slot ではなく encounter / reward / mechanic allocation skeleton として使える。たとえば shooter や action prototype なら、wave ごとに enemy role、弾種、移動パターン、報酬、gimmick、学習させたい mechanic、難度上昇要素を列にする。個別敵を実装する前に、W01-small-chaser、W02-shield-break、R03-risk-reward のような slot identifier を置けば、「敵案が増えた」ではなく「どの役割の枠を満たしたか」を見られる。

特に有効なのは、playable diff 前の設計密度確認である。今の cycle では、外部知見、Phase 0 の game directive、Nao_u の feedback、実装ログが混ざりやすい。skeleton 表を 1 枚置くと、今回の prototype が何を学習させるゲームなのか、どの wave で新要素を出すのか、報酬がどのタイミングで意味を持つのかを実装前に検査できる。実装後は、headless test やプレイログから「W03 で被弾が集中」「R02 が取られない」「mechanic M1 が一度しか出ない」を skeleton に戻す。これにより、記憶 atom も「面白かった/微妙だった」ではなく、どの slot 仮説が当たったかとして残せる。

■ メリット・デメリット
メリットは、コンテンツを作り始める前に不足、偏り、役割重複を見つけられること。slot identifier により、名前や詳細仕様が変わっても設計上の責務を追える。faction や enemy type の個性も、設定文ではなく出現頻度と役割分布で確認できる。

デメリットは、表が強すぎると制作を早く固定してしまうこと。特に action game では、カードの静的 slot より、時間軸、操作負荷、画面密度、難度曲線への変換が必要になる。また、小規模 prototype で列を増やしすぎると、実装より管理が重くなる。

■ 判定
部分採用。カードゲームの set design 手順そのものではなく、prototype の encounter / reward / mechanic 分布を実装前に検査する skeleton として採る。最初は 1 画面または 5 wave 程度の小さい表に限定し、playtest 後に living document として更新する。

■ URL
https://nerdlab-games.com/043-how-to-create-a-design-skeleton-in-7-steps/
