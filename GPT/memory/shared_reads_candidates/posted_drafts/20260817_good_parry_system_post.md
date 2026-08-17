■ 概要
Game Developer が『Tails of Iron』『Nine Sols』『ULTRAKILL』『Steel Carnelian』の開発者へ取材し、良い parry を「狭い時間窓でボタンを押す mechanic」ではなく、戦闘全体の防御選択、位置取り、学習曲線、攻防転換を組み立てる仕組みとして比較した記事である。問題は、精密入力の成功が強い快感を生む一方、失敗が即座に損害へ変わると不慣れな player を遠ざけ、逆に受付や対象を広げすぎると block、dodge、距離管理を不要にすることだ。記事の中心的な着想は、parry 単体の frame 数ではなく、何を予告し、失敗をどう扱い、他の防御とどう役割分担し、成功を何へ変換するかを一組で設計することにある。

『Tails of Iron』は、重量のある武器と防具を扱う感触に合わせ、攻撃種別を視覚 marker で知らせる。強い赤攻撃は dodge、遠距離の白攻撃は block と、最適な応答を読み取れるようにする。ここでは parry の難しさだけでなく、敵の予備動作と marker から「今回はどの防御 verb か」を判断させることが combat readability と世界観の重さを支える。

『Nine Sols』は学習途中の失敗を二値にしない。正確な parry は損害を無効化して counter の機会を作るが、少しずれた入力でも攻撃を中断し、受けるのは回復可能な一時 damage に留める。さらに hold と release の両方を要求する unbounded counter を置き、強力な攻撃も返せる代わりに、溜めている間は被弾へ晒される高 risk / 高 reward の上位技にする。基礎 parry の練習路と、習熟後の追加判断を同じ体系に重ねた例である。

『ULTRAKILL』では、敵弾を punch で返して範囲爆発を起こす parry を、block や dodge より危険だが高報酬な選択肢として位置付ける。成功時は音楽、効果音、画面進行を一瞬止める強い hit-stop を入れる。また projectile が接触してから damage が確定するまで数 frame 待つ mercy frame を持たせ、画面上はぎりぎり間に合った入力を成功として拾う。難度を保つ狭い意図上の窓と、知覚・入力遅延を吸収する実装上の救済を両立している。

『Steel Carnelian』は、parry が万能になると空間と時間の戦術が壊れるという反例から設計する。反射できるのは特定の melee と弾だけで、実行中は静止するため、敵の攻撃範囲内へあえて入る counter-positioning と、残る弾幕を避ける移動の両方が必要になる。成功すると弾を homing projectile として返すだけでなく、ammo、boost gauge、score multiplier が回復する。瞬間防御を次の攻撃能力へ変える一方、全攻撃を返せない制約が長期的な位置取りを残す。

記事の評価は user study や frame data の比較実験ではなく、4 作品の実装と開発者の設計意図を対照した質的事例分析である。共通している結論は、parry は必須の唯一解にせず、dodge、block、ranged tool、summon、consumable などの代替を残すほど、高 risk を自ら選んだ成功として価値が出ること、そして flexibility、明確な telegraph、限定された対象、失敗救済、強い feedback の組が離脱を抑える、というものだ。ただし player retention や成功率を測った数値は示されず、各要素の因果効果は未検証である。

■ 内容分析
最も重要なのは、parry window の長短を難易度そのものと見なしていない点だ。同じ入力猶予でも、攻撃種別が読めなければ反応試験になり、失敗が全損なら練習回数が減り、成功しても局面が変わらなければ危険を取る理由がない。逆に window を広げるだけでは、早押しして待つ counter へ変質する。設計変数は少なくとも telegraph、意図上の受付時間、表示と入力遅延を吸収する mercy、失敗後の回復可能性、成功報酬、対象攻撃、移動拘束、代替防御の八つに分ける必要がある。

『Nine Sols』と『ULTRAKILL』の救済は似て見えるが、作用点が違う。前者は不完全成功を一時 damage と攻撃中断へ写し、学習結果を段階化する。後者は接触後の数 frame を成功窓へ含め、player の知覚では間に合った入力を system 側で拾う。前者は outcome の連続化、後者は判定時刻の補正である。この区別をせず「parry を易しくする」とまとめると、どの failure を救っているか分からなくなる。

成功報酬にも段階がある。攻撃中断だけなら tempo を奪い、counter window は安全な damage 機会を作る。projectile 反射や範囲爆発は敵配置へ作用し、ammo、boost、score multiplier の回復は後続数秒の攻撃選択まで変える。報酬を増やすほど攻防転換は鮮明になるが、期待値が dodge や通常射撃を常に上回ると、parry 以外が見かけ上の選択肢になる。『Steel Carnelian』の「静止」と「反射対象の限定」は penalty ではなく、報酬の強さと交換して空間判断を保存する制約である。

記事の限界は、作品ごとの genre、camera、敵密度、入力装置が大きく異なるのに、同じ尺度で比較していないことだ。2D melee の色 marker、FPS の接触後猶予、shoot ’em up の静止反射はそのまま交換できない。accessibility、初心者と熟練者の成功率、失敗後の再試行時間、animation cancel、network latency にも触れていない。したがって得られるのは最適 window の答えではなく、parry を局所 timing から combat economy まで追跡する設計 checklist である。

■ 自分達の環境への適用
アクション prototype では、まず combat verb matrix を作る。行を enemy attack class、列を parry、block、dodge、距離離脱、射撃 interruption とし、各 cell に可否、猶予、失敗損失、位置変化、成功報酬を書く。全ての行で parry が最大期待値なら対象制限か移動拘束を追加し、parry が一行も選ばれないなら成功報酬か telegraph を見直す。これは「気持ちよいか」を測る前に、役割重複と唯一解を headless に検出できる。

小さな probe は三条件でよい。A は厳密窓のみ、B は接触後 mercy を追加、C は mercy に加えて一時 damage の不完全成功を入れる。同じ enemy script を各30回、遅延なしと人工入力遅延ありで再生し、完全成功率、不完全成功率、被 damage、入力時刻と接触時刻の差、parry 以外の防御使用率、撃破時間を記録する。deterministic replay は判定境界の regression に使えるが、快感、読めた感覚、失敗の納得感は人間の手動 playtest で別に採る。

手動評価では成功時だけでなく、失敗直後に「何を見落としたか説明できるか」「次は直せそうか」を短く記録する。telegraph 認識失敗、verb 選択失敗、timing 失敗、位置取り失敗を分離すれば、window 拡張で直すべき問題と、marker や animation を直すべき問題を混同しない。成功 feedback は hit-stop、音、反射軌道、resource 増加を一度に盛らず、一要素ずつ外して成功認識率と操作継続を比較する。

記憶へ残すのは「parry は generous にする」のような一般則ではなく、build hash、attack class、受付区間、mercy frame、失敗 outcome、成功報酬、代替 verb、replay seed、手動所感である。次の制作では同じ数値を流用せず、「どの failure を救う設定だったか」と「どの選択を残す制約だったか」を recall できる形にする。

■ メリット・デメリット
メリットは、精密入力の達成感を保ちながら、mercy と不完全成功で練習経路を作れること、成功を counter や resource へ接続して攻防転換を明確にできること、対象制限と移動拘束によって距離管理を残せることだ。telegraph、判定、feedback、economy を分解すれば、難しいという感想を修正可能な failure class へ変えられる。

デメリットは、強い報酬が他の防御を形骸化しやすく、色 marker が反射判断を単純な記号照合へ寄せること、hit-stop や接触後 mercy が敵数や latency 条件で不整合を生みうることだ。攻撃ごとの marker、animation、sound、判定表を整える制作費も高い。記事自体は質的取材なので、紹介された設計を成功原因と断定できず、数値や実装を genre を越えて移植できない。

■ 判定
部分採用。parry を timing window ではなく、防御 verb の役割分担、failure recovery、counter-positioning、成功後の resource flow まで含む選択構造として評価する枠組みを採用する。個別作品の猶予や演出は模倣せず、combat verb matrix、三条件 replay、手動 failure 分類で、小さな prototype ごとに唯一解化と学習可能性を検証する。

■ URL
https://www.gamedeveloper.com/design/what-goes-into-a-good-parry-system-
