■ 概要
7 Seconds to Live は、GMTK Game Jam 2026 の96時間で15人 team が作った HTML5 browser game である。作者は過去の上位作を観察し、「小さく焦点が明確」「開始直後に理解できる」「既知の型に一つ twist がある」「一目で残る art」を勝ち筋として置いた。level や背景を量産せず、主要 art と core mechanic を最初から見せるため、全編を一画面・一体の boss fight に限定した。慣れている2D side-scroller を選び、combo や dash も期限と複雑化を理由に切った。

テーマ Countdown は装飾でなく、player health が毎秒減り、boss を攻撃すると回復する規則へ入れた。player は塔の側面に張り付き、飛び出して剣で攻撃し、grappling hook で壁へ戻る。短時間の来訪でも基本操作を覚えられるよう入力を絞った。一方、終盤の圧倒的 boss を少ない asset と code で作るため、7種の固有攻撃を追加する案は時間不足で断念し、既存攻撃の頻度と移動速度を上げる数値強化へ置換した。

制作面では初日から Discord の Team Finder で協力者を集め、二日目には music、sound、art、story を短い依頼単位で並行発注した。三日目に team は10～11人へ増え、programming の大半を止めて incoming asset、cutscene、演出の統合へ移行。最後の数時間にも曲と効果音を受け取り、延長前の締切37分前に提出した。最終的には15人で、96時間内に intro・outro、level transition、変化する色と曲、scrolling art を備えた完成感の高い作品になった。

反応は大きく、初日の popularity / ratings は10,600超の応募中27位、投票終了までに約200 ratings、数百 comment、数千 play を得た。art、music、高エネルギーな空中戦、物語と詩は特に好評だった。しかし gameplay の評価は割れた。終盤を「不公平で不可能」と感じる層と「技能不要で簡単」と感じる層が併存し、最終 level は弾を避けるより boss に張り付いて被弾以上の damage を出す戦法がほぼ唯一の解になった。単純な操作は accessibility として働く一方、combo、移動、武器の選択がないことへの不満も出た。

再挑戦前の約10秒も重要な失敗である。作者は音楽と詩の再開前に休止を置き、fight 開始を予告する意図だったが、反復死する player には操作不能な待ち時間として累積した。volume control、font readability、fullscreen といった QOL も締切時に漏れた。作者は次回策として、複数 playtester の早期投入、itch.io 上で動く browser build の先行作成、標準 asset checklist、新規 asset 受付の hard deadline、専任 project manager、事前の team / Discord 準備を挙げている。結論は scope 圧縮と分業で強い第一印象を作れた一方、数値だけの後半難化、単線的攻略、反復導線、統合締切には別の設計が必要だったというものだ。

■ 内容分析
この事例の価値は「scope を小さくすれば成功する」という一般論ではなく、何を削り、何を最初の一秒へ集中させたかが明確な点にある。一画面化は背景・room 遷移・level design を削りながら、巨大 boss、scrolling art、music、色変化という観客にも伝わる価値を残した。削減量ではなく、player が触れる時間と作品の印象へ資源を移したから、jam の可視性と完成感には効いた。

同時に、その圧縮が gameplay の選択肢まで削った。固有攻撃を増やせず速度・頻度を上げた結果、終盤は読み分けより damage race になった。health countdown と攻撃回復の規則も「危険へ近づくほど生存できる」緊張を作るが、弾幕が避け切れない強度では、攻撃を続ける一解へ収束する。難しい／簡単という感想の分裂は単に好みが割れたのではなく、攻略を発見した層には実行が単純で、発見しない層には不可能に見える離散的な難度曲線だった可能性が高い。

約10秒の休止は、作者が一回の dramatic arc を見ていたのに対し、player は death→retry の loop を見ていたずれである。一回なら詩と音楽の溜めでも、5回死ねば50秒の非操作時間になる。局所演出の意図は、反復回数を掛けた体験コストで評価しなければならない。この視点は boss の数値だけを調整しても直らない。

制作成功の指標にも注意が要る。約200 ratings、数千 play、上位 popularity は到達と第一印象の強さを示すが、completion、再挑戦継続、strategy 分布を示さない。15人の art・music・writing が短時間の外形品質を押し上げたことと、core gameplay が検証されたことは別である。また依頼を簡潔にして創造性を守る方法は asset 生成を加速した反面、最終日に統合判断が一人へ集中し、締切37分前という低い余白につながった。

■ 自分達の環境への適用
game jam 型 prototype では、scope sheet を「作らない物」だけでなく「開始30秒に残す player value」で書く。一画面、一目標、二操作まで圧縮しても、判断の分岐を一つは残す。例えば接近攻撃で時間回復、回避成功で次の攻撃窓を広げる、資源消費で安全に離脱する、という異なる勝ち筋を用意する。後半は速度倍率だけでなく、既存動詞の組合せや予告の読み分けで難しくし、単一 damage race への収束を防ぐ。

最初の24時間以内に browser 上の playable build を出し、以後の各 build で time-to-first-input、初回 death、death-to-controllable-retry、attempt 数、completion、離脱点を記録する。再挑戦待ちは一回の秒数だけでなく、中央値 attempt を掛けた累積非操作時間で判定する。headless では aggressive、dodge-heavy、balanced の三 policy を同一 seed / build で走らせ、damage dealt / taken、無敵時間、boss 接触距離、各 policy の勝率を比較する。一 policy だけが突出するなら、player skill の難度以前に戦略空間が潰れている。

人の playtest は熟練度を分け、少なくとも初見者複数名を programming cutoff 前に入れる。「難しいか」だけでなく、何を勝ち筋だと理解したか、次の attempt で行動が変わったか、retry を押さなかった理由を取る。相反する感想は平均せず、strategy 発見の有無、操作習熟、視認性、performance 環境へ分解する。font、volume、fullscreen、focus 復帰、loading、retry は標準 smoke checklist にし、作品固有機能と競合させない。

production では code freeze、content freeze、submission candidate を別時刻に置く。asset ごとに owner、format、解像度、loop 点、受入期限、fallback を manifest 化し、期限後の高品質 asset は原則次版へ送る。専任 manager を置けない小規模制作でも、統合担当と最終決定者を明示し、制作者本人が coding、DM、受入、page 作成を同時に抱えない。残り時間ではなく未統合 asset 数と未確認 platform 数を burn-down する。

■ メリット・デメリット
メリットは、一画面・一 boss への圧縮が level production を削り、主要 art と mechanic を即座に提示したこと、慣れた genre と少数操作で実装不確実性を抑えたこと、外部協力を小さな成果物へ分けて96時間でも高い完成感を作ったことだ。Countdown を health と攻撃回復へ直結したため、theme と行動も分離していない。投稿後の批判を QOL、難度、戦略、retry、production に分けて次回策へ落としている点も再利用できる。

デメリットは、scope 削減が戦略削減へ越境し、数値強化が唯一解を生んだこと、dramatic な休止が反復時の離脱コストへ変わったことだ。15人分の asset は強みである一方、受入期限がなければ統合 risk が急増する。人気・ratings は視認性と polish を含む複合指標で、gameplay balance の証拠にはならない。短い依頼も方向性の自由には効くが、仕様整合と fallback の責任を消さない。早期 tester 一人の好感触だけでは、攻略発見の二極化を検出できなかった。

■ 判定
部分採用。player-visible value を守る scope 圧縮、24時間以内の実 platform build、複数初見者による death loop 評価、標準 QOL checklist、code / content freeze と asset hard deadline を採る。一画面化、操作削減、大人数分業は目的に応じて選び、戦略数、累積 retry 待ち、統合 backlog を測れない状態では成功パターンとして固定しない。

■ URL
https://itch.io/devlog/1617009/7-seconds-to-live-post-jam-postmortem.amp
