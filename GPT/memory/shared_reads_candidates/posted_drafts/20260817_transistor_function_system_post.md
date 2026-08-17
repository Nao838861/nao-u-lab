■ 概要
Supergiant Games の Amir Rao が、『Transistor』の Function system が collectible card game 的な初期案から、16個の能力を三用途で組み合わせる最終形へ変わった過程を説明した開発記録である。出発点は「player が序盤に覚えた同じ skill だけを使い続ける」問題だった。初期案では ability、upgrade、passive を deck に入れ、level ごとに shuffle して順に引かせる。手札の偶然性に適応しながら局所的に強くなり、次の level で再構築する Magic: The Gathering 型の pleasure を action RPG へ移そうとした。

しかし shuffling は『Transistor』の線形 narrative と衝突した。card game なら新しい一戦が deck reset の理由になるが、連続した旅の途中で能力を何度も失う理由が不自然だった。difficulty も level ごとに弱い状態へ戻す必要があり、物語上は stakes が高まるのに system 上は local power curve を反復するねじれが生じた。team は気に入った mechanic のために game 全体の journey を変えるのでなく、random deck 案を捨てた。

代わりに randomness が担っていた「慣れた構成を一時的に崩す」機能だけを slow death として残した。health が尽きると、action bar 内で load cost の高い Function がその encounter の残りで使用不能になる。最大4枠の全 Function を失った時だけ checkpoint へ戻るため、通常は三度まで即 reset せず戦闘を継続できる。主力を失った player は残った Function で methodical に戦い、新しく試した組合せを回復後も使い続ける場合があった。

もう一つの転換は、power、upgrade、passive を別 item 群にせず、16個の強い concept へ統合したことだ。各 Function は active slot なら固有 action、別 Function に装着すれば modifier、限られた passive slot なら character 全体への効果になる。たとえば long range、stun、charm を active と二つの upgrade として組み合わせれば、遠距離範囲攻撃へ stun と charm を付けられる。同じ部品が置く場所によって動詞・修飾・常在特性へ変わるため、16 concept から pair / trio を中心に数千の構成を作れる。

system 探索には backstory の開示も重ねた。Function を新しい位置や組合せで使うと世界と人物の情報が得られ、実験好きには発見報酬がある一方、慣れた構成を使い続ける player を進行不能にはしない。通常の RPG のようにお気に入りを level 99 へ育てる縦成長はなく、愛着を単体の数値でなく Function 同士の関係として表現する。結論は、実験を強制する “eat your vegetables” 型から離れ、少数部品の多用途性、一時的な構成崩れ、物語報酬によって横方向の探索を誘う設計への転換である。

■ 内容分析
重要なのは random deck の廃止そのものより、mechanic の局所的な魅力と作品全体の構造が衝突した時、作品側を曲げなかった判断である。shuffle は improvisation を生んでも、その reset 単位に fiction と difficulty curve の根拠が必要だった。面白い prototype が見つかったことと、現在作っている game に適合することは別である。この失敗記録は、mechanic 評価を単体の手触りだけで終えず、progression、narrative、failure loop と同じ時間軸で見る必要を示す。

最終系では三つの仕組みが別々の player を扱う。三用途 Function は自発的に組合せを試す player へ広い探索空間を渡す。backstory は性能以外の理由で一度試すきっかけを作る。slow death は失敗時だけ主力を外し、強制を短時間かつ文脈のあるものに限定する。常に randomize する初期案より agency を保ちつつ、固定戦法から外れる入口を複数用意している。

部品数を16へ絞ったことも、単なる scope 削減ではない。一つの concept を三役で理解できれば、asset と名称を共有したまま組合せ空間を増やせる。ただし理論上の組合せ数と、意味のある build 数は同じではない。active、upgrade、passive の各効果が予測可能で、組合せ結果が戦闘で判別できなければ、可能性は menu 上の数に留まる。特定 pair の支配、説明文の複雑化、slot cost による実質的な選択肢減少も起こりうる。

記事の評価根拠は team の観察であり、何人が slow death 後も新構成を維持したか、実験率や離脱率がどう変わったかは示されない。主力を失う体験は、実験の契機にも punishment spiral にもなる。health が尽きた player は既に苦戦しているため、選択肢削減でさらに難しくなる危険がある。三回の継続機会という救済と、戦力低下という罰が同居しており、どちらが勝つかは encounter 長、残存 Function の相性、再装備 UX に依存する。

■ 自分達の環境への適用
少数 mechanic の prototype では、各部品に active / modifier / passive の三実装を最初から義務づけず、まず4〜6部品で二用途以上が自然に同じ concept を表すか試す。たとえば projectile、dash、shield、mark を基礎語彙にし、projectile を active shot として使う場合、dash へ付けて軌跡攻撃にする場合、passive で反撃弾にする場合でも「projectile」という理解が保たれるかを見る。役割ごとに別の例外説明が必要なら、再利用ではなく三つの別能力を同名に押し込んでいる。

authoring data には component ID、slot role、cost、組合せ後の observable effect、想定 counter を記録する。headless では全組合せを列挙するだけでなく、damage、control time、移動距離、resource cycle、被弾、encounter completion を測り、単独部品との差分から modifier が実際に効いたか確認する。build の多様性は unique loadout 数でなく、行動時系列や対処可能な敵 role がどれだけ変わったかで評価する。見かけだけ違う同型 build は fold する。

slow death の probe は通常 reset、主力一時封印、封印する Function を player が選ぶ、の三条件を同一 encounter で比べる。失敗後 completion 率、再試行時間、loadout 変更率、回復後の新構成維持率、連続失敗、操作停止時間を取る。選択肢減少による探索と、単なる詰みを分けるため、残存構成に最低一つの viable route があることを deterministic check する。強制封印は full game の規則にせず、boss practice や短い challenge で先に検証する。

発見報酬は narrative text に限らない。新しい pair / trio を実戦で一定時間使い、固有 interaction が発火した時に design note、enemy hint、visual variant を開く。ただ装備しただけでは解除せず、「組合せを理解して作用させた」event を条件にする。性能のための最適化と knowledge collection を別の動機にし、慣れた build を使う権利は残す。

■ メリット・デメリット
メリットは、少数の concept と asset から大きな探索空間を作れること、能力の追加より関係の追加で prototype を育てられること、失敗を即時 reset だけでなく戦術変更の局面へ変えられることだ。発見報酬を重ねれば、balance 上の最適解以外にも試す理由を作れる。mechanic と narrative の reset 単位を照合する判断基準も、そのまま企画 review に使える。

デメリットは、各部品の三役すべてを理解させる UI と説明コスト、組合せ爆発による balance と test の増大、強い synergy が多数の名目上の選択肢を無効化する危険である。縦成長を削ると、お気に入りを育てる単純な愛着表現を失う。slow death は苦戦中の player から主力を奪うため、不公平感、負けの加速、menu 作業を生みうる。物語報酬も completion 欲求を利用した強制に近づけば、元の問題を別通貨で再現する。

■ 判定
部分採用。少数 component の多用途化、組合せを実際に発火させる発見報酬、mechanic と作品全体の reset 単位を照合する review 軸を採る。強制的な一時使用不能は保留し、4〜6部品の probe で viable route、失敗後 completion、回復後の構成維持を確認できた場合だけ限定導入する。

■ URL
https://www.gamedeveloper.com/design/game-design-deep-dive-the-functions-of-i-transistor-i-
