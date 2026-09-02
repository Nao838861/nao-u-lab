■ 概要
Cristina Ramos の KATAVATIS 開発記録は、「Metroid から戦闘を抜いたら何が残るか」を制作手順として解いている。作者が Metroid に惹かれた理由は敵を倒すことではなく、迷いながら深部へ進み、奇妙な空間を自分で解釈する感覚だった。そこで KATAVATIS を、探索・実験・知識獲得によって進み、鍵や power-up ではなくプレイヤーの理解が gate を開く first-person underwater metroidbrainia として設計した。舞台は Playdate 上の閉鎖された海中研究施設で、combat の代わりに traversal、空間理解、roadblock の解法発見、4 次元 puzzle が core loop を担う。

設計の出発点は mechanic の一覧ではない。作者は物理 index card に、他作品の機能ではなく「その作品で何を感じたか」「自作で再現したい感情は何か」を書いた。その後、visual、control、個別 mechanic を別々に prototype し、とくに最初は game feel を make-or-break point として camera と操作を先に詰めた。Playdate には dual analog stick がなく、first-person view を直接回す入力がない。そこで 32-bit console 世代の FPS、Jumping Flash、Metroid Prime の補助を調べ、jump 軌道の一定地点で camera を下へ向ける処理と edge physics assistance、いわゆる coyote time を組み合わせた。目的は自由な camera 操作の縮小版を作ることではなく、小画面でも着地点を読めるようにして vertical platforming を成立させることだった。playtest ではこの組合せが好意的に受け取られたという。

海中移動では、地上の walk/jump と水中の swim/dive を別 controller にし、境界で滑らかに切り替える。評価条件は、作者が操作を説明しなくても移動・潜水・離水でき、向きを失わないことだった。これが成立してから、一般的な first-person game より縦方向を重視した map と、プレイ中に得た知識で越える roadblock を試している。作者は Outer Wilds、Animal Well、迷路性の強い FPS や puzzle game を再プレイし、自分がどこで仮説を作り、何を手掛かりと見なし、どこが不快な詰まりになるかを記録した。roadblock には可能な限り直接 feedback を足さず、それでも解法発見時に「自分が賢かった」と感じられる境界を継続 playtest で探す。作者自身には当然に見える解法が他者には moon logic になり、その逆もあるため、作者の常識を tutorial の代用にしないという判断である。

Playdate 固有の crank も、契約上の showcase gimmick のように後付けせず、物語と gameplay の核になるまで案を捨てた。採用したのは研究施設内の 4D Labs である。プレイヤーは crank で 4D world の 3D slice を操作し、4D object を回転・移動すると、現在いる slice 内の形が変わる。既存の 4D game は実験的で操作や理解が複雑だと見て、数学教材の正確さより Portal のような「触れば規則が分かる fun physics」を目標にした。単純な slice 操作から object の変形へ複雑さを積み、どの概念は即座に理解され、どこで学習が止まるかを playtest して progression を組む。記事の結論は combat を消すこと自体ではなく、既存 genre の「当然」を外し、残したい感情、hardware 制約、観察可能な player behavior を結び直すことで、代替の core loop を発見できるというものだ。

■ 内容分析
この記録の強さは「combat 以外も面白い」という主張ではなく、負の定義から playable な正の定義へ移る順序にある。最初に combat を禁止してもゲームは生まれない。作者は Metroid 体験を、孤立、深部への欲求、空間解釈、知識による進行へ分解し、各要素を camera、controller、level topology、roadblock、4D manipulation へ対応させた。感情カードは仕様書ではなく探索方向を固定する上位 constraint、prototype はその感情を実際の操作へ翻訳できたかを見る反証装置として働いている。

もう一つ重要なのは、制約を個性に変える前に基礎的な friction を解消している点だ。直接 camera を回せないことを即座に独自性と呼ばず、まず jump 中の視認と edge assistance を作り、水中と地上の遷移を説明なしで通した。その後に vertical map や 4D crank へ進む。新奇な mechanic が理解されない原因を、入力の混乱、空間認知、rule の未学習に分けやすい順序である。これは「面白くない」を一括評価せず、操作層と概念層を切り分ける設計として有効だ。

ただし評価証拠は定性的で、被験者数、session 時間、成功率、比較 prototype、脱落地点は公開されていない。「people loved it」「説明なしで操作できた」は方向を示す観察であって、一般化可能な結果ではない。roadblock と 4D progression も開発途中で、完成 game 全体の backtracking、記憶負荷、長期的な詰まりは未検証である。さらに combat が市場の大部分を占める、非 combat なら競争相手を大幅に減らせるという表現は作者の動機であり、市場データではない。記事から採るべきなのは市場判断ではなく、感情分解と prototype の接続方法である。

■ 自分達の環境への適用
探索・puzzle prototype では、着手前に「再現したい感情」「その感情を生む player action」「理解されれば開く knowledge gate」「観察可能な失敗」を一枚にする。例えば「未知の機械を自力で理解した」なら、action は触る・比較する・仮説を試す、gate は同じ rule を別配置で再利用できること、失敗は説明を読んだだけ、偶然突破、誤仮説の固定、操作ミスによる断念に分ける。mechanic 名から始めず、感情から検証可能な行動へ降ろす点を移植する。

実装は三段に分ける。第一段は最小 room で movement と camera assistance だけを検証し、固定 input replay で着地可能範囲、落下回数、camera pitch、edge assist 発火位置を記録する。第二段は地上・水中のような controller 境界を入れ、状態遷移の determinism、入力から mode change までの時間、遷移直後の逆入力や行き止まりを headless で検査する。第三段で初めて knowledge gate を置き、初見者には解法説明をせず、最初の観察、仮説、試行、突破までを event log と短い発話で残す。

headless 評価は collision、到達可能性、softlock、state transition、seed 再現には強いが、「Aha!」や孤立感を判定できない。人間 playtest では、どの手掛かりから rule を推定したか、誤りを修正できたか、突破後に説明できるかを見る。全員が即答するなら puzzle ではなく作業になり、誰も仮説を更新できないなら moon logic である。hint なし・環境 feedback・直接説明の三水準で、感情目標を壊さず詰まりだけ減る点を探す。

記憶システムへは、成功した mechanic だけでなく「感情仮説→prototype→観察→変更」の鎖を atom 化する。個別作品の camera 値を恒久ルールにせず、どの制約下で何を観察し、なぜ変更したかを残す。次の制作で似た制約が出た時、結論のコピーではなく検証 probe を再利用できる。

■ メリット・デメリット
メリットは、genre の部品を模倣せず、その genre が生んだ感情から別の core loop を設計できることだ。入力制約を早期 prototype で扱うため、独自 mechanic が基礎操作の悪さに埋もれにくい。knowledge gate は inventory の数値成長に頼らず、プレイヤー自身の理解を進行資源にできる。定期 playtest を「好きか」の投票ではなく、理解が生まれた箇所と止まった箇所の観察へ変えられる点も強い。

デメリットは、知識 gate が再プレイ性を失いやすく、攻略情報との相性も悪いことだ。低 feedback は没入と自己発見を守る一方、必要情報の欠落と区別しにくい。camera assistance や coyote time は快適さを増すが、発火条件が見えないと操作の予測可能性を損なう。4D の単純化も一貫した内部 rule を保てなければ、驚きではなく恣意性になる。さらに単一の開発者 devlog なので、成功例だけが選ばれ、捨てた案の比較コストと完成後の retention は分からない。

■ 判定
部分採用。感情を起点に mechanic を分解し、操作 friction、controller 境界、knowledge gate、概念 progression の順で prototype と playtest を重ねる手順を採る。camera や 4D mechanic の個別解は模倣せず、固定 replay で基礎挙動を検証し、人間 playtest で仮説形成と「Aha!」を別に観察する。市場性や完成品質の根拠には使わず、開発途中の質的事例として扱う。

■ URL
https://saffroncr.itch.io/katavatis/devlog/1638428/designing-a-metroidbrainia-without-combat
