■ 概要
Apple の WWDC26 セッション「Make your game great with touch」は、物理コントローラ対応済みのゲームを iPhone / iPad へ移す際、ボタンをそのまま画面に並べるだけではタッチ操作にならない、という問題を扱う。Touch Controller framework は touch の begin / move / end を受け、画面上の control を `GCController` として既存の polling や handler に流せる。これは入力経路の再利用であり、本題は物理 controller の操作体系を「二本指で成立する操作」へ再設計する過程にある。

最初に、九つの anchor、相対 offset、section、`safeAreaInsets` を使い、端末形状が変わっても control のサイズと親指からの距離を保つ。Dynamic Island や home indicator、中央の player character、移動・camera 領域を避け、頻用 action は親指付近、低頻度 menu は上部へ置く。しかし全 button を一対一で置いた初期版は、映像と操作が空間を奪い合った。

そこで control を game state を表す入出力面として扱う。B button は strike、fireball、water の icon に変え、選択中の power と一致させる。pickup は対象が近い時だけ対象付近に生成し、QTE の escape は event 中だけ有効化し、未使用 thumbstick は消す。power 選択も別 overlay ではなく、利用可能な control を三秒だけ表示する。「今できること」を control 自体が説明する構成である。

連続操作も作り直す。左半面全体を movement の hit area にし、stick 押し込み sprint は tilt magnitude 0.8 を例に walk / sprint へ分ける。右 stick は右半面のどこからでも相対移動量を返す invisible touchpad に替え、初動の遅さと過回転を抑える。L1+R1 と移動を伴う QTE は一つの escape button、aim・move・release は一つの action button の hold-drag-release に畳む。pressed highlight、stick animation、sprint halo で入力受付と状態を返す。結論は、全操作を二本指で実行可能にしながら画面をゲームへ返すことにある。

■ 内容分析
この事例の価値は、ボタン数の削減ではなく「同時入力予算」から逆算して action graph を作り直した点にある。物理 controller では左右の親指と人差し指を別々の button / stick に割り当てられるが、携帯端末では通常、二本の親指が入力だけでなく画面保持と視界遮蔽も担う。したがって action 一覧だけを移植しても、各 action が単独で動くかでは足りない。戦闘中に movement と camera と attack、QTE 中に movement と escape のような同時実行組を列挙し、その最大本数を二本以内へ圧縮する必要がある。sprint を stick magnitude に埋める、二 button QTE を一 button にする、aim と release を hold-drag-release の時間系列へ変えるのは、同時操作を連続 gesture へ変換する同じ設計操作である。

もう一つの核は、touch control を「入力装置の絵」ではなく game state の可視化として使うことだ。icon の差し替え、利用不能 action の非表示、pickup target の近傍表示、pressed state、sprint halo は、可能な action、入力の受付、結果状態を同じ場所で返す。特に invisible な全画面 collider は当たり領域を広げられる反面、境界も作動状態も見えない。だから表示を減らすほど feedback の責任が増す。halo は装飾ではなく、magnitude 閾値を越えたという離散状態を player に知らせる必要条件になる。

既存 `GCController` label へ touch control を対応づける構造は game logic の再利用には強い。ただし API 互換性と操作設計の互換性は別で、camera sensitivity、finger travel、画面端での継続、UI と collider の競合までは解決しない。直接 mapping した初期版が失敗例である通り、framework が移植コストを下げても再設計は省けない。

評価については慎重に読む必要がある。示されるのは、全 button を常時表示した before と、文脈表示・広い collider・gesture 圧縮・状態 feedback を入れた after の実演であり、player 数、誤入力率、到達時間、学習時間、疲労、左右利き、端末サイズ別の比較は報告されない。「過回転がない」「滑らかになった」は設計者の観察で、比較実験の結果ではない。また、文脈で同じ場所の action が変わると予測可能性を失い、非表示 control は discoverability を落とす。tilt 閾値 sprint は微細な移動をしたい時の暴発、hold-drag-release は camera gesture との所有権競合、対象付近の pickup は動く対象上での追従と遮蔽を起こし得る。採用条件は、見た目が整理されたことではなく、状態遷移ごとに入力の所有権と feedback が一意であることになる。

■ 自分達の環境への適用
我々の mobile / browser prototype には「二本指予算による操作監査」を取り込む。実装前に全 action を、常時か文脈限定か、tap / hold / drag、同時に必要な action、画面上の所有領域、feedback、解除条件の列で表にする。実戦状態ごとの同時操作 graph を作り、二本を超える組だけを、analog 値への埋め込み、button 統合、時間系列 gesture、対象近傍への一時表示で圧縮する。この順なら必要 action まで失う退化を検出できる。

小さな probe は一画面の combat sandbox でよい。左右半面を移動 / camera、攻撃を hold-drag-release、sprint を移動量閾値で実装し、一対一 overlay 版も残す。自動検証では touch ID、開始領域、control owner、context、gesture phase、発火 action、feedback state を trace に出す。`move + camera`、`move + aim + release`、`move + QTE`、context 切替中の hold、画面端 drag、二指の開始順反転を固定 replay とし、欠落、二重発火、owner 移動、release 取りこぼしを判定する。

ただし快適さは headless の合否へ還元し切れない。実機では小型 phone と tablet、左右利き、短い指と長い指で、初回成功率、誤発火率、目的 action までの時間、指の総移動量、画面中央の遮蔽時間を測る。さらに UI を消した状態を初見で発見できるか、icon が context 変更後の action を予測させるか、sprint 閾値の前後を意図通り維持できるかを短い task で確認する。操作 trace と player の主観を分けて残せば、動作不良と ergonomics の失敗を混同しない。

記憶へ残す単位も「touch は二本指にする」という一般則では粗い。再利用すべきなのは、同時入力予算、空間 ownership、context visibility、gesture phase、状態 feedback の五点セットと、どの gameplay state で破綻したかの証拠である。prototype ごとにこの監査表と replay を保存すれば、別ジャンルへ移す際も、button 配置の見た目ではなく action graph の制約として recall できる。

■ メリット・デメリット
メリットは、既存 controller logic を保ったまま touch 入口を追加できること、画面占有と必要指本数を同時に減らせること、可能 action と入力結果を同じ control で伝えられること、固定座標ではなく anchor / section / safe area で端末差へ対応できることにある。特に「二本指で gameplay loop が閉じるか」は、曖昧な操作感を実装前に監査できる強い制約になる。

デメリットは、文脈依存表示が action の場所と意味を不安定にし、invisible collider や gesture 圧縮が初見 discovery を難しくすることだ。広い左右領域は menu、拾得、照準などとの競合を増やし、magnitude 閾値は意図しない sprint を生む。実演中心で定量評価がないため、この具体配置や 0.8 という値を正解として移植できない。アクセシビリティ、片手操作、外部 controller との切替、device ごとの grip は別途検証が要る。

■ 判定
部分採用。Touch Controller framework の導入自体は Apple native 実装時に判断し、現時点では「同時入力を二本指以内へ圧縮する」「全画面の空間 ownership を定義する」「非表示化と同じ強さで状態 feedback を設計する」という監査方法を採用する。具体的な gesture と閾値は原文の推奨値として固定せず、固定 replay と実機 task の両方を通過したものだけを残す。

■ URL
https://developer.apple.com/videos/play/wwdc2026/358/
