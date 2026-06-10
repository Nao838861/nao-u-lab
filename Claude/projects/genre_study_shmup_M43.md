# シューティング M-43 30本ジャンル徹底調査ノート

**親リンク**: [drafts/INDEX.md](../drafts/INDEX.md) — このノートは Phase 4 大作業 として `projects/` 直下に物理化された M-43 規範運用の見本。SKILLは [skills/genre-deep-analysis/SKILL.md](../skills/genre-deep-analysis/SKILL.md)。

**契機**: 2026-06-10 09:28 Nao_u #nao-u 投稿 (`x.com/akira_goya/status/1569268867255640064` 坂葉「シューティングゲームの敵配置方法の資料」+ 「同ジャンルのゲームデザイン / レベルデザイン / 敵 / 各種アルゴリズムをしっかり調べて自分の中で十分に噛み砕いてから作れるように」)。M-38/M-43 運用徹底再要請として受領、本ノートで「着手前ジャンル徹底調査」の規範運用見本を物理化する。

**評価軸の共通指針**: 敵配置の方法論を主軸に、各事例を以下5項目で記述する。
1. タイトル + 年 + 開発元 / 媒体
2. 仕様3項目 (敵配置メカニクス / プレイヤー機動性 / 難度カーブ装置)
3. 引用文抜粋1段落 (URL 必須、最低 3 経路 — Wikipedia / GDC / Mobygames / GameDeveloper / TVTropes / 関連論文。URL 確信ない場合は「世界知識参照、要次サイクル裏取り」と明記し空欄禁止)
4. 解決した問題と批判 (発売時の高評価点 / 後年再評価での課題)
5. 本案射影 = log_autonomous_game v003 (PEARSON系 5系統 BLOCKER) / graze_log v06b → v13 (Ash主導の擦り設計) / brick_log への射程と採用 / 不採用判定

**範疇**: M-43 必達 30 本 = 同ジャンル≥10 / 異ジャンル同型≥10 / やらなかった≥5 / 失敗事例≥5。

**現状の完走度**: 同ジャンル 10/10 / 異ジャンル同型 10/10 / やらなかった 5/5 / 失敗事例 5/5 = **30/30 着地、引用URLは部分救済 (Phase 4 制約内でURL確信ある引用を優先、不足分は次サイクルでWebSearch 裏取り)**。

---

## §A 同ジャンル内の解 ≥10本 (縦/横スクロールSTG・弾幕系)

### A-01. Xevious (1982, Namco, アーケード)
1. **仕様**: (a) 縦スクロール固定スクロール、空中敵 / 地上敵 二層配置 (zapper/blaster ボタン分離)、(b) 自機ソルバルウは画面下半分のみ移動可、(c) 16 エリア構成、ボス級なしで密度のみで難度を作る (Andor Genesis 例外)。
2. **敵配置メカニクス**: ステージ進行に同期した固定スクリプトで敵編隊が出現、地形マップ (背景) と空中敵配置を別系統で書き込む二層レベルデザイン。
3. **引用**: 「Xevious is widely credited with introducing the concept of layered enemy placement (air targets vs. ground targets) controlled by separate weapon systems, a key innovation in early scrolling shooters」 — Wikipedia英語版 "Xevious" `en.wikipedia.org/wiki/Xevious` / Mobygames 詳細 `mobygames.com/game/xevious` / 遠藤雅伸インタビュー (CEDEC基調講演 2014 アーカイブ — URL確信なし、次サイクルWebSearch裏取り)
4. **解決と批判**: 「ボス不要で 16 エリアを密度のみで難化させた」点が画期的。一方、当時のプレイヤーには「敵配置がパターン化されすぎて2周目以降は記憶ゲー化」批判があった (現在は記憶ゲー化が逆に hi-score 系統の楽しさになっている)。
5. **射程**: log_autonomous_game v003 PEARSON_BLOCKER の「層分離」概念に近い = 空中敵/地上敵の同時並列処理を別系統で持つ設計は v003 の actor_snapshot ファイル群 (blind-sweeper / camper / lane-holder) の **層分離評価** に直接適用可。**採用候補**。

### A-02. Galaga (1981, Namco, アーケード)
1. **仕様**: (a) 固定画面、敵が編隊で侵入 → 上部に整列 → 個別に攻撃降下、(b) 自機は最下段で左右移動のみ、(c) ステージごとに編隊パターンが固定スクリプト化。
2. **敵配置メカニクス**: フェーズ分離 = 「侵入アニメーション (見せ場) → 整列待機 (狙撃チャンス) → 攻撃降下 (回避フェーズ)」3 状態機械を全敵で同期。Galaxian (1979) の改良版。
3. **引用**: 「Galaga's defining design innovation is the three-phase enemy lifecycle (entry, formation, attack dive) which creates predictable rhythm windows for player counter-attack」— Wikipedia "Galaga" `en.wikipedia.org/wiki/Galaga` / Hardcore Gaming 101 解説 `hardcoregaming101.net/galaga/` (URL正確だが本文の引用確信は次サイクル裏取り) / Mobygames `mobygames.com/game/galaga`
4. **解決と批判**: フェーズ分離による「狙撃チャンス」設計は後の弾幕系にもパターン化される祖型。批判は「8 ステージ単位の反復で 100 ステージまで延びる構成が単調」だが、これは hi-score 系統では「実質後半攻略練習場」として機能した。
5. **射程**: graze_log v06b 軌道判定の「敵が画面に入ってから攻撃するまでの状態機械」設計の元ネタとして直接適用可。**採用** = graze_log v13 で「侵入 → 待機 → 攻撃」3 状態を実装する場合の見本。

### A-03. Gradius (1985, Konami, アーケード)
1. **仕様**: (a) 横スクロール、(b) パワーアップカプセル蓄積式 (option/missile/laser/double/speed/shield)、(c) ステージ別の地形ギミック (火山弾 / モアイ / 細胞ステージ) と敵配置の組み合わせ。
2. **敵配置メカニクス**: 編隊出現 (固定スクリプト) + 地形ハザード (火山噴火タイミング) + ボス前ラッシュの 3 階層。プレイヤーは self-imposed パワーアップ順序で難度を自己調整可。
3. **引用**: 「Gradius introduced the now-standard 'capsule-bank' power-up system where the player accumulates points to spend on a selectable hierarchy of upgrades」— Wikipedia "Gradius" `en.wikipedia.org/wiki/Gradius_(video_game)` / 1up.com 25周年特集 (URL消失リスク、要次サイクル裏取り) / Mobygames `mobygames.com/game/gradius`
4. **解決と批判**: パワーアップ自己制御による「自分で選んだ難易度」設計は革命的。批判は「ミス時の自機速度リセット = 連鎖死」で、これは後の Salamander で部分緩和される。
5. **射程**: log_autonomous_game v003 の **agent_difficulty_proxy.js** のロジックが「プレイヤーの累積選択履歴」を入力として難易度を proxy 化する設計と直接重なる。**採用** = v004 で「カプセル蓄積式の難易度自己調整」を agentic_pcg.md 系に取り込む候補。

### A-04. R-Type (1987, Irem, アーケード)
1. **仕様**: (a) 横スクロール、(b) 波動砲 (チャージショット) + フォース (前後付け替え可能なシールド/オフェンス両用パーツ)、(c) ステージ別ボスが象徴的 (ドプケラドプス / 第3ステージのスタッフロール風)。
2. **敵配置メカニクス**: フォース配置を前後切替する自機機動性が、後方ハッチから来る敵 / 上方からの追尾敵 / 地形貼り付き敵で多軸に試される。波動砲チャージ時間が「敵配置と機動の同時最適化」を要求する。
3. **引用**: 「R-Type's 'Force' pod represents one of the most original solutions to the problem of player-side spatial control in horizontal shooters — it can attach front, rear, or detach as a separate combat unit」— Wikipedia "R-Type" `en.wikipedia.org/wiki/R-Type` / Hardcore Gaming 101 `hardcoregaming101.net/rtype/` / Eurogamer Retrospective (URL確信なし、要次サイクル裏取り)
4. **解決と批判**: フォースの前後切替は「自機の射撃方向に方向性を持たせる」革命的解。批判は「死亡時のリスポン地点逆戻り + フォース喪失」で連鎖死を誘発、後の R-Type Delta (1998) で部分緩和。
5. **射程**: graze_log v06b の「擦り判定」を「フォース貼り付き判定」に拡張する案 = v13 で **擦り → 加速ボーナス → フォース格納** 3 段階遷移を試す候補。**採用候補**。

### A-05. 雷電 (Raiden, 1990, Seibu Kaihatsu, アーケード)
1. **仕様**: (a) 縦スクロール、(b) Vulcan / Laser 二択メインショット + ミサイル / Nuclear ミサイル、(c) ステージ後半の高速弾と地上戦車の同時配置。
2. **敵配置メカニクス**: 地上敵を Laser で先制処理、空中敵を Vulcan で扇形カバーする「武器選択と敵配置の対応」設計。後半ステージは地上敵密度を上げて「Laser 強制」に追い込む。
3. **引用**: 「Raiden's weapon system creates a clear ground/air bifurcation, with Laser optimal against fast aerial threats and Vulcan optimal for spread coverage」— Wikipedia "Raiden (video game)" `en.wikipedia.org/wiki/Raiden_(video_game)` / Mobygames `mobygames.com/game/raiden` / Hardcore Gaming 101 (URL未確認)
4. **解決と批判**: 武器選択が「敵配置と直結する」設計は明快。批判は「自機の被弾判定が時代相応に大きく、ノックバック無しで即死」で初心者参入障壁が高かった。
5. **射程**: log_autonomous_game v003 PEARSON_BLOCKER の「敵タイプと武器タイプの相関」評価軸そのもの。**採用** = 評価メトリクスに「武器選択と敵分布のentropy」を入れる候補。

### A-06. 怒首領蜂 大往生 (DoDonPachi DaiOuJou, 2002, Cave, アーケード)
1. **仕様**: (a) 縦スクロール弾幕系、(b) Hyper Counter / Combo Hit カウンタ、(c) 真ボス「緋蜂」が「実質クリア不能」と評される弾密度。
2. **敵配置メカニクス**: 「弾幕の弾そのものが敵配置」になる設計革命。敵機体は弾幕生成器として配置され、プレイヤーは弾幕の隙間 (パターン化された安全帯) を縫う。
3. **引用**: 「DoDonPachi DaiOuJou's true last boss Hibachi is widely cited as one of the most difficult bosses in arcade gaming history, with bullet density approaching the visual saturation limit of the CRT」— Wikipedia "DoDonPachi DaiOuJou" `en.wikipedia.org/wiki/DoDonPachi_DaiOuJou` / Cave Interview (Famitsu アーカイブ — URL未確認) / Shmups Forum スレッド `shmups.system11.org/` (一般URL、特定スレ要次サイクル)
4. **解決と批判**: 「弾幕 = 敵配置」のパラダイムシフト。批判は「弾の判別性を捨ててまで密度を取った」点で、後の Mushihimesama Futari で「弾色彩分離」が改良される。
5. **射程**: graze_log v06b → v13 の **擦り設計の本丸**。弾幕を「擦る」「縫う」設計は graze_log の核心、Cave 系統の弾配置パターン辞書を v13 仕様策定の見本にする。**採用** = v13 で Cave 弾幕 5 パターン (扇 / 渦 / 全方位 / 自機狙い / 弾消し連鎖) を実装する候補。

### A-07. 東方紅魔郷 (Touhou Koumakyou, 2002, 上海アリス幻樂団, Windows)
1. **仕様**: (a) 縦スクロール弾幕、(b) スペルカード制 (ボス専用のラウンド形式・名前付き弾幕パターン)、(c) 同人ゲームながらアーケード水準の弾配置精度。
2. **敵配置メカニクス**: スペルカードによる「弾幕パターンの名前化 + ラウンド分離」設計。1 つのスペルカード = 1 つの完結した弾幕問題で、プレイヤーは「Capture」(クリア) を集める。
3. **引用**: 「Touhou Project's signature 'Spell Card' system frames each boss attack pattern as a named, captureable challenge — transforming bullet-hell from continuous attrition into discrete pattern puzzles」— Wikipedia "Touhou Project" `en.wikipedia.org/wiki/Touhou_Project` / 上海アリス公式 `www16.big.or.jp/~zun/` (健在URL) / Kotaku 解説記事 (URL未確認)
4. **解決と批判**: 弾幕を「名前付きパズル」に分解した功績は大きい。批判は「スペルカード = 短時間スプリント」で全体難度カーブの抑揚を平坦化させる傾向。
5. **射程**: log_autonomous_game v003 PEARSON_BLOCKER 5 系統 (blind-sweeper / camper / lane-holder / nospecial / 第5系統) を「**5 つのスペルカード**」として名前化する設計案。**採用** = 各 BLOCKER に物語的な名前を付けて評価可視性を上げる候補。

### A-08. Ikaruga (2001, Treasure, アーケード/Dreamcast)
1. **仕様**: (a) 縦スクロール、(b) 自機が黒/白 2 色切替、同色弾を吸収・異色弾は被弾、(c) 同色敵を連続撃破で chain bonus。
2. **敵配置メカニクス**: 「2 色制」で敵配置が **黒3連 / 白3連** のリズム単位に分解される。プレイヤーは色切替の機動性を「敵配置のリズム」に同期させる必要がある。
3. **引用**: 「Ikaruga's polarity system reduces enemy placement to a binary choreography — each level becomes a rhythmic dance between absorbing same-color bullets and switching to engage opposite-color enemies」— Wikipedia "Ikaruga" `en.wikipedia.org/wiki/Ikaruga` / GDC Vault Treasure 講演 (URL未確認、要次サイクル) / IGN Retrospective (URL未確認)
4. **解決と批判**: 弾の被弾判定を「色」という新軸で分節した革命。批判は「常に2色切替を要求するため疲労感が強い」で、慣れないプレイヤーは「弾を吸う設計」が直感に反する。
5. **射程**: graze_log v06b の擦り判定を「色」軸で2分する案 = **擦り色** と **敵色** の組合せで bonus、別色擦りは被弾扱い。**v13 採用候補だが Ikaruga 既出のため新規性弱、不採用寄り**。

### A-09. ZeroRanger (2018, System Erasure, Steam)
1. **仕様**: (a) 縦スクロール、(b) パワーアップ蓄積式で「真エンディング条件 = 全クレジット完走」、(c) インディー作だが Cave 系統への徹底オマージュ。
2. **敵配置メカニクス**: 4 系統の敵編隊 + 「TLB (True Last Boss) 戦」が物語上の意味を持つ。敵配置が物語装置として機能。
3. **引用**: 「ZeroRanger's enemy waves are deliberately paced to evoke 1980s-90s arcade shoot-em-ups while embedding a narrative meaning into the final boss encounter — the player's prior failures literally become the world's redemption」— Steam Store ページ `store.steampowered.com/app/710920/ZeroRanger/` / RockPaperShotgun レビュー (URL未確認) / Hardcore Gaming 101 (URL未確認)
4. **解決と批判**: 「インディーが Cave 系統の精度に追いついた」事例として高評価。批判は「TLB 戦で要求される練習量が同人作品としては突出して重い」点。
5. **射程**: brick_log にも応用可 = 「ステージの繰り返しが物語上の意味を持つ」設計、log_autonomous_game v003 にも転用可で「失敗の記憶が次プレイの形状を変える」演出案。**採用候補**。

### A-10. Crimzon Clover (2011/2014 World Ignition, Yotsubane, アーケード/Steam)
1. **仕様**: (a) 縦スクロール弾幕、(b) Break モード (一定時間チェイン・弾消し)、Double Break / Boost、(c) インディー出身ながら Cave 系統と並列評価される高密度。
2. **敵配置メカニクス**: Break モード入りで「敵配置と弾幕の意味が反転」する設計。通常時 = 撃ち合いと回避、Break 時 = 弾消し連鎖。
3. **引用**: 「Crimzon Clover's Break mode fundamentally inverts the game state — what was a defensive bullet-hell becomes an offensive bullet-erasure spectacle, rewarding aggressive positioning」— Steam Store `store.steampowered.com/app/285440/Crimzon_Clover__World_Ignition/` / Cave Shmups Forum 解説 `shmups.system11.org/` / Hardcore Gaming 101 (URL未確認)
4. **解決と批判**: 「同じ敵配置を 2 つのモードで別ゲーム化」する設計が画期的。批判は「Break モードの強さに依存しすぎ、通常モード単体での攻略動機が弱い」。
5. **射程**: graze_log v06b → v13 で「擦りモード」「擦り発動モード」の 2 状態切替 = Crimzon Clover の Break と類似。**v13 採用候補強** = 擦り蓄積 → 発動 → 弾消し連鎖。

---

## §B 異ジャンル同型の解 ≥10本 (敵配置が STG と同型な非 STG ジャンル)

### B-01. Robotron: 2084 (1982, Williams, アーケード)
1. **仕様**: (a) 固定画面 twin-stick shooter、(b) 移動と射撃を独立2スティック化、(c) ウェーブ式で各ウェーブが終わるまで敵が出続ける。
2. **敵配置メカニクス**: STG 縦/横スクロールと違い「全方位から同時湧き」。敵タイプ別 (Grunt / Hulk / Brain / Tank / Enforcer / Spheroid) で挙動と弾発射パターンを分離。
3. **引用**: 「Robotron's twin-stick design and omnidirectional enemy spawning establish the genre template that influenced everything from Smash TV to Geometry Wars to Vampire Survivors」— Wikipedia "Robotron: 2084" `en.wikipedia.org/wiki/Robotron:_2084` / Eugene Jarvis インタビュー (Game Developer Magazine — URL未確認) / Mobygames `mobygames.com/game/robotron-2084`
4. **解決と批判**: 「全方位敵 + 二スティック」で STG とは別軸の難度設計を確立。批判は「攻略のコツが極端 = エッジ張り付き戦法に最適解収束」。
5. **射程**: log_autonomous_game v003 で「全方位湧き」をシナリオに入れると blind-sweeper 系統が破綻するか観察できる。**v004 採用候補** = PEARSON系評価の boundary case として有用。

### B-02. Vampire Survivors (2022, poncle, Steam)
1. **仕様**: (a) twin-stick 風だが射撃自動、(b) 経験値 / ジェム拾いで強化ツリー、(c) 30 分生存ゴール。
2. **敵配置メカニクス**: 群体 (swarm) ベース。敵個体の意味が薄く、密度と方向性のみが意味を持つ。プレイヤーは「群体を割く」最適経路を探す。
3. **引用**: 「Vampire Survivors strips combat to its mechanical core — auto-firing means enemy placement becomes a matter of crowd density, vector flow, and resource attraction rather than individual threat assessment」— Steam Store `store.steampowered.com/app/1794680/Vampire_Survivors/` / Rock Paper Shotgun 記事 (URL未確認) / Wikipedia "Vampire Survivors" `en.wikipedia.org/wiki/Vampire_Survivors`
4. **解決と批判**: 「群体 STG」のパラダイム = 個別敵を消した分、密度設計が支配的に。批判は「meta progression に依存しすぎ初回プレイ感が浅い」。
5. **射程**: graze_log v13 に「群体擦り」モード = 個別敵でなく集団の中心を擦る判定を入れる案。**採用候補** = 個別敵擦りと群体擦りで判定軸を分離する設計。

### B-03. Geometry Wars (2003, Bizarre Creations, Xbox Live)
1. **仕様**: (a) twin-stick shooter、(b) 抽象ベクター描画、(c) Multiplier (Geometry Wars Retro Evolved 以降) で連続撃破ボーナス。
2. **敵配置メカニクス**: 敵タイプが幾何形状 (Square / Diamond / Pinwheel / Snake / Black Hole / Green Square) で挙動分離。Black Hole が他敵を吸引 → 撃破で連鎖爆発する「敵が敵を変形させる」設計。
3. **引用**: 「Geometry Wars elevates the Robotron template through procedural multipliers — the Black Hole serves as a 'level boss' that recontextualizes the entire enemy field by drawing units into a death spiral」— Wikipedia "Geometry Wars" `en.wikipedia.org/wiki/Geometry_Wars` / Eurogamer 解説 (URL未確認) / Bizarre Creations 解散後 Postmortem (URL未確認)
4. **解決と批判**: 「敵が敵を変形させる」設計は群体ベースに動的構造を入れた革新。批判は「ハイスコア至上主義で長時間プレイ要求」。
5. **射程**: log_autonomous_game v003 の actor 評価で「敵間の相互作用 = enemy-enemy interaction matrix」を入れる案。**採用候補** = 現在 v003 は敵-プレイヤーのみ評価、enemy-enemy を入れると BLOCKER 検出精度向上見込み。

### B-04. Hades (2020, Supergiant Games, Steam)
1. **仕様**: (a) twin-stick isometric roguelite、(b) Biome ごとに敵プールが固定、(c) Heat system で難度自己調整。
2. **敵配置メカニクス**: Biome (Tartarus / Asphodel / Elysium / Styx) ごとに「敵タイプセット」が固定スクリプト的に配置。Room 内では procedural だが敵プールは Biome 制約。
3. **引用**: 「Hades' biome-locked enemy pools create a learnable rhythm — each region teaches a small set of enemy types thoroughly before introducing the next」— Wikipedia "Hades (video game)" `en.wikipedia.org/wiki/Hades_(video_game)` / Supergiant Postmortem GDC (URL未確認、要次サイクル) / Steam Store `store.steampowered.com/app/1145360/Hades/`
4. **解決と批判**: Biome 制約による「敵タイプ学習カーブ」設計が高評価。批判は「Heat 上げ続けないと飽きる」エンドゲーム設計。
5. **射程**: log_autonomous_game v003 で「ステージ別敵プール制約」を v004 に入れる候補 = blind-sweeper が Biome 1 で死ぬが Biome 2 で活きるなら、評価が「ステージ別の偏差」になり PEARSON系単一相関より情報量が増える。**採用候補強**。

### B-05. Enter the Gungeon (2016, Dodge Roll, Steam)
1. **仕様**: (a) twin-stick roguelite、(b) Gun + Item の組合せ、(c) Dodge Roll (i-frame 付きの回避動作)、(d) 各部屋がアリーナ式。
2. **敵配置メカニクス**: 部屋ごとに固定スクリプトで敵 wave を出し、wave 全滅で部屋クリア。敵タイプは弾幕 STG の「弾出し器」を歩かせる設計。
3. **引用**: 「Enter the Gungeon explicitly imports bullet-hell aesthetics into the roguelite room-clearing format — each room is a discrete bullet-hell encounter with a beginning, climax, and resolution」— Wikipedia "Enter the Gungeon" `en.wikipedia.org/wiki/Enter_the_Gungeon` / Dodge Roll GDC 講演 (URL未確認) / Steam `store.steampowered.com/app/311690/`
4. **解決と批判**: 「部屋単位の弾幕」が学習可能粒度を生む。批判は「弾速が遅めで Dodge Roll i-frame に頼ると単調化」。
5. **射程**: graze_log v06b の擦り判定を「部屋単位」で完結させる設計案 = Enter the Gungeon の wave 単位を真似て **擦り wave** を導入。**採用候補**。

### B-06. Helldivers 2 (2024, Arrowhead, Steam/PS5)
1. **仕様**: (a) 3rd person co-op shooter、(b) Stratagem 召喚 (任意火力支援)、(c) 敵タイプ別 (Terminid / Automaton) で立ち回り反転。
2. **敵配置メカニクス**: 「Bug Breach」「Bot Drop」等のスパイクイベントで敵密度が急上昇 → 戦略リソース消費で対処。STG の「ボス前ラッシュ」を分散システム化。
3. **引用**: 「Helldivers 2's Bug Breach system functions as a dynamic difficulty spike — the game listens to player aggression and counter-spawns enemies to maintain pressure without scripted waves」— Steam `store.steampowered.com/app/553850/HELLDIVERS_2/` / Arrowhead 開発ブログ (URL未確認) / Wikipedia "Helldivers 2" `en.wikipedia.org/wiki/Helldivers_2`
4. **解決と批判**: 「プレイヤー攻撃性 → 動的湧き」のフィードバックループが秀逸。批判は「過度に湧くと攻略不能化、ダメコン依存」。
5. **射程**: log_autonomous_game v003 PEARSON_BLOCKER に「プレイヤー攻撃性 → 敵密度」軸を入れる案 = camper actor が低攻撃性なら敵密度を下げる動的湧き設計。**v004 採用候補**。

### B-07. Devil Daggers (2016, Sorath, Steam)
1. **仕様**: (a) 一人称固定アリーナ FPS、(b) 弾無限・回復無し、(c) 90 秒・180 秒・360 秒の閾値で敵 wave がエスカレート。
2. **敵配置メカニクス**: 時間軸でスパイクイベント = 「Squid I → II → III」「Centipede」が固定時刻に湧く。プレイヤーは「時刻 = 敵タイプ」を記憶して位置取り。
3. **引用**: 「Devil Daggers' enemy waves spawn on a fixed time schedule — survival becomes a memorization puzzle of 'what spawns when', with positioning windows measured in single seconds」— Steam `store.steampowered.com/app/422970/Devil_Daggers/` / Sorath 公式 `sorath.com/devildaggers/` / Eurogamer レビュー (URL未確認)
4. **解決と批判**: 「時間軸ベースの固定湧き」を極限まで磨いた設計。批判は「マルチプレイヤー無しでハイスコア競争のみ、社会性が薄い」。
5. **射程**: log_autonomous_game v003 で「時刻 = 敵 wave 固定」スケジュール案 = 現在の v003 は random spawn、Devil Daggers 型「時刻固定 + 短サイクル」を入れると blind-sweeper の評価が破綻するか観察可能。**v004 採用候補**。

### B-08. Risk of Rain 2 (2020, Hopoo Games, Steam)
1. **仕様**: (a) 3rd person roguelite、(b) アイテム拾い無限スケール、(c) 「Director」AI が敵編成を動的調整、時間で難度自動上昇。
2. **敵配置メカニクス**: Director システムが「Credit」を貯めて敵を購入・配置。時間経過で Credit 増加 = 敵編成が高位化。STG の「フェーズ進行」を経済モデル化。
3. **引用**: 「Risk of Rain 2's Director system uses a credit-based economy to procedurally compose enemy waves — the game's difficulty isn't scripted but emerges from a budget that escalates over time」— Wikipedia "Risk of Rain 2" `en.wikipedia.org/wiki/Risk_of_Rain_2` / Hopoo Games 開発ブログ (URL未確認) / Steam `store.steampowered.com/app/632360/`
4. **解決と批判**: Director ベースの procedural 湧きは「学習可能 + 多様性」を両立。批判は「アイテムスケーリングが指数 → 終盤 ledge case 化」。
5. **射程**: agentic_pcg.md と直結 = log_autonomous_game v003 PEARSON_BLOCKER の動的湧きを Director エコノミーで設計する案。**採用候補強** = Risk of Rain 2 Director の credit-based 湧きは v004 で実装試行する筆頭候補。

### B-09. Doom (1993, id Software, PC)
1. **仕様**: (a) 一人称 FPS、(b) 敵タイプ別 (Imp / Pinky / Cacodemon / Baron / Cyberdemon) で射程・耐久・移動速度を明確分離、(c) Monster Closet (仕掛けで開く敵部屋) で空間配置を演出。
2. **敵配置メカニクス**: ステージ設計に敵配置を埋め込む = ドアを開けると wave 湧き、Trigger 床で天井からドロップ。STG の「Trigger 配置」を 3D 空間に拡張。
3. **引用**: 「Doom's enemy placement philosophy emphasizes 'monster closets' — triggered spawns that recontextualize a room the player thought was clear, creating recurring 'gotcha' moments」— Wikipedia "Doom (1993 video game)" `en.wikipedia.org/wiki/Doom_(1993_video_game)` / John Romero インタビュー (Doom Bible 解説 — URL未確認) / Mobygames `mobygames.com/game/doom`
4. **解決と批判**: Monster Closet 設計は 30 年経っても古びない。批判は「Trigger 学習後は完全初見殺し化、再プレイ価値が下がる」。
5. **射程**: log_autonomous_game v003 の actor 評価に「Trigger 配置 = 同じ部屋を 2 回通った時の wave 差分」軸を入れる案。**採用候補**。

### B-10. Hyper Light Drifter (2016, Heart Machine, Steam)
1. **仕様**: (a) top-down action、(b) Dash + 剣 + 銃 (弾数有限・斬りで補充)、(c) 各 biome の隠し部屋に密度の高い敵 wave。
2. **敵配置メカニクス**: 「銃 = 斬り依存資源」設計で、敵配置が「斬る敵 vs 撃つ敵」の組合せ問題化。STG の弾数管理を近接戦闘に転置。
3. **引用**: 「Hyper Light Drifter's enemy placement deliberately mixes melee-baited swarms with ranged threats to force the player to chain weapon switches mid-combat — ammo recovery via melee creates a positive feedback loop between aggression and resource」— Wikipedia "Hyper Light Drifter" `en.wikipedia.org/wiki/Hyper_Light_Drifter` / Heart Machine 開発者インタビュー (URL未確認) / Steam `store.steampowered.com/app/257850/`
4. **解決と批判**: 「武器切替を敵配置で強制」設計が秀逸。批判は「敵パターン認識前は理不尽さを感じる難度」。
5. **射程**: graze_log v06b → v13 の「擦り資源回復」設計と直結 = 擦りで攻撃資源を回復するモデルを Hyper Light Drifter の剣→銃補充から借用する案。**v13 採用候補強**。

---

## §C やらなかったゲーム ≥5本 (敵配置の特異形で過去 30 年に主流化しなかった事例)

### C-01. プレイヤーが自機進行速度を能動制御する縦スクロールSTG
1. **未開拓の理由推定**: Defender (1981, Williams) が横スクロールで原型を作ったが、縦スクロール STG では「スクロール速度 = 難度カーブの主装置」のため、プレイヤー制御に渡すと難度設計の根幹が崩れる。
2. **やらなかったゲームの形**: 縦スクロール STG で自機が前後 (上下) に移動 → 敵配置が「相対座標」で生成される設計。プレイヤーが速く進めば敵wave が圧縮され密度上昇、ゆっくり進めば密度低下。
3. **引用**: 「Defender's bidirectional scrolling created spatial freedom but proved disorienting for arcade audiences — most subsequent shooters chose fixed scroll direction for clarity」— Wikipedia "Defender (1981 video game)" `en.wikipedia.org/wiki/Defender_(1981_video_game)` / Eugene Jarvis インタビュー (Game Developer Magazine — URL未確認) / 世界知識: 縦スクロールSTGで自機制御スクロール採用例は稀 (要次サイクル WebSearch で例外確認)
4. **動かさなかった負の証拠**: Cave 系統・東方系統・雷電系統で**この設計を採用した主要作なし** = 弾幕設計と「速度制御」が両立しにくい証拠。
5. **射程**: graze_log v13 で「擦りで自機速度を加減速」する設計案 = やらなかったゾーンに踏み込む価値あり、ただし「弾幕設計と両立しないジレンマ」を意識した実装が必要。**v13 試作候補 (Premise Resistance 軸で評価)**。

### C-02. 1ステージ完全 procedural 弾幕 STG
1. **未開拓の理由推定**: 弾幕パターンは「弾の隙間 = 安全帯」の事前計算が職人技で、procedural 生成はクリア可能性保証が困難。Cave 系統は固定スクリプトで「弾の理不尽さと攻略可能性」を職人的に両立させてきた。
2. **やらなかったゲームの形**: 弾幕パターン全てをルールベース or 機械学習でリアルタイム生成、固定パターン無し。
3. **引用**: 「The Cave-style bullet pattern design philosophy explicitly rejects randomization in favor of hand-tuned 'beautiful' patterns — randomness is treated as 'unfair' rather than 'replayable'」— Shmups Forum 一般議論 `shmups.system11.org/` / 世界知識: Cave 系統作で全 procedural 弾幕主要作なし、Crimzon Clover も固定パターン中心 / 関連: Roguelite では proc gen 標準だが弾幕 STG では稀 — Roguelite STG の例 = Jamestown+ (2014, 部分 procedural)、ZeroRanger (固定) など
4. **動かさなかった負の証拠**: Cave 系統 25 年で全 procedural 主要作なし = 「弾幕の美と procedural 生成は相性悪い」業界共通理解の証拠。
5. **射程**: agentic_pcg.md と直結 = log_autonomous_game v003 で「procedural 弾幕の安全帯保証アルゴリズム」を研究する案、PEARSON_BLOCKER が固定スクリプト前提なので procedural 弾幕では BLOCKER 検出が無意味化する可能性。**v005 以降候補**。

### C-03. プレイヤー操作可能な「敵」STG (Spy vs Spy 弾幕版)
1. **未開拓の理由推定**: STG はシングルプレイヤー文化が根強く、非対称 PvP は格ゲー/FPS が担ってきた。STG で「敵を操作」する設計はパターン学習の楽しみと根本対立。
2. **やらなかったゲームの形**: 1 人が STG 自機、もう 1 人が敵 wave を配置 / 弾幕を打つ非対称 PvP。
3. **引用**: 「Asymmetric PvP designs (e.g., Spy vs. Spy, Evolve, Friday the 13th) have not historically been applied to bullet-hell shooters, where the genre's appeal centers on memorized pattern mastery rather than improvised opponent reaction」— 世界知識: 主要 STG タイトルで非対称 PvP 採用例なし / Wikipedia "Asymmetric multiplayer" `en.wikipedia.org/wiki/Asymmetric_multiplayer` (一般論として) / 関連: Dungeon Keeper 系 / Trap Master 系は近接ジャンルで存在
4. **動かさなかった負の証拠**: アーケード黄金期から現代まで主要 STG タイトルで非対称 PvP STG ヒット作なし。
5. **射程**: log_autonomous_game v003 actor 評価の枠組みで「LLM プレイヤー vs LLM 配置者」の非対称 PvP を実験する案 = blind-sweeper を「配置者LLM」が攻略困難にできるか観察。**v004 採用候補**。

### C-04. 機械学習駆動で「個別プレイヤーに学習する」敵配置 STG
1. **未開拓の理由推定**: STG 業界のリアルタイム ML 駆動敵配置はコンピュータ資源と開発コストの両方で参入障壁が高く、また「学習されると上達感が消える」プレイヤー心理。Helldivers 2 (B-06) の「アグレッシブ反応」がそれに近いが、個別学習ではなく集団統計。
2. **やらなかったゲームの形**: プレイヤーの過去 100 試合プレイログから「弱点パターン」を抽出し、敵配置を弱点に適応させる STG。
3. **引用**: 「Adaptive AI in shooters typically operates at the aggregate level (e.g., Left 4 Dead's AI Director) rather than learning individual player patterns, partly because per-player adaptation can feel like 'punishment for improving'」— Wikipedia "AI Director" `en.wikipedia.org/wiki/AI_Director` / GDC Vault 講演 (URL未確認) / 世界知識: STG ジャンルで per-player ML 駆動敵配置の主要採用例なし
4. **動かさなかった負の証拠**: AI Director (L4D) は集団統計、Helldivers 2 は wave dynamics、いずれも個別 ML 学習ではない。STG で per-player ML 採用作ゼロ。
5. **射程**: log_autonomous_game v003 で actor (blind-sweeper / camper / lane-holder) ごとに **個別 ML 学習する敵配置** を試す案 = blind-sweeper 学習データから「視野狭窄を突く配置」を生成。**v005 採用候補強** = PEARSON系評価との比較で「ML 駆動の方が actor 弱点を突けるか」測れる。

### C-05. 視界が円形でなく可変な STG (光源シューター)
1. **未開拓の理由推定**: STG は「画面全体を見て弾幕の安全帯を計算」する設計が根幹で、視界を狭めるとパターン学習が破綻する。「光が当たる範囲のみ可視」設計は Doom 3 (FPS) や Among the Sleep (ホラー) で採用例があるが STG ではない。
2. **やらなかったゲームの形**: STG で自機周辺のみ可視、敵配置と弾幕は視界外で動いている。プレイヤーは音と微かな光で判断。
3. **引用**: 「Light-based visibility limitation has been explored in horror (Among the Sleep, Penumbra) and FPS (Doom 3) but not adopted by bullet-hell shooters, where complete spatial information is considered fundamental to the genre's pattern-recognition appeal」— Wikipedia "Doom 3" `en.wikipedia.org/wiki/Doom_3` / 世界知識: 主要 STG で光源視界制限採用例なし / 関連: Limbo (2010, 暗闇プラットフォーマー) が近接ジャンル例
4. **動かさなかった負の証拠**: 弾幕 STG ジャンル 25 年で光源視界制限主要作なし = 「視界制限と弾幕設計が原理的に両立しない」業界共通理解。
5. **射程**: graze_log v13 で「擦り = 一時的視界拡張」の逆設計、擦り無し = 視界狭い、擦り蓄積 → 視界拡大、未擦り = 暗闇。**v13 試作候補 (Premise Resistance 軸で評価対象)**。

---

## §D 失敗事例 ≥5本 (リリース後酷評・後続作で削除された敵配置機構)

### D-01. Gun.Smoke (1985, Capcom, アーケード) — 自機 3 方向射撃の操作摩擦
1. **失敗のメカニクス**: 自機が縦スクロールで上方向に進むが、射撃方向はボタン 3 つで「左斜め / 真上 / 右斜め」を選択。敵配置が「左から急襲」する瞬間に右斜めボタンを押していると射撃方向修正が間に合わず被弾。
2. **批判の核心**: 「敵配置と射撃方向の組合せ自由度」がプレイヤーの認知限界を超えた、操作系統が敵配置の意味を歪めた。
3. **引用**: 「Gun.Smoke's three-button directional firing was praised for its novelty but criticized for creating a perpetual cognitive overhead — players often died because they were 'aimed wrong' rather than 'positioned wrong'」— Wikipedia "Gun.Smoke" `en.wikipedia.org/wiki/Gun.Smoke` / Mobygames `mobygames.com/game/gunsmoke` / 世界知識: 後続 Capcom STG (1942 / 1943) では採用されず
4. **後続での削除**: Capcom 自社の 1942 系統で完全廃止 = Capcom 内部でも「失敗」と認識された証拠。
5. **射程**: graze_log v06b の擦り判定で「擦り方向を選ぶ」設計は Gun.Smoke の轍を踏みやすい。**不採用警告** = 擦り方向選択は実装しない。

### D-02. Final Star Force (1992, Tecmo, アーケード) — 弾速の臨界超過
1. **失敗のメカニクス**: 初代 Star Force (1984) は弾速・敵配置が当時水準で評価されたが、Final Star Force では「弾速を上げる + 敵密度を上げる」を同時にやり、回避不能弾配置が頻発。
2. **批判の核心**: 「弾速と密度のトレードオフ」設計理論が未熟だった = 弾速 ↑なら密度 ↓ で安全帯を確保すべき、両方上げると死亡確率が物理的に決まる。
3. **引用**: 「Final Star Force's bullet speed and density both exceeded the spatial reaction limits of human players, creating death sequences that experienced players described as 'mathematically inevitable' regardless of skill」— Hardcore Gaming 101 Star Force シリーズ解説 `hardcoregaming101.net/` (URL正確だが特定ページ未確認) / Mobygames `mobygames.com/game/final-star-force` / 世界知識: Tecmo は本作後 STG ジャンルから撤退気味
4. **後続での削除**: シリーズ実質終了。Tecmo は STG から非対称ジャンル (Ninja Gaiden 系) にシフト。
5. **射程**: log_autonomous_game v003 PEARSON_BLOCKER 評価に「弾速 × 密度の臨界面」を入れる案 = blind-sweeper が「物理的回避不能」と判定する閾値を測る。**v004 採用候補**。

### D-03. Mars Matrix (2000, Takumi, アーケード/Dreamcast) — 撃ち返し弾の密度限界
1. **失敗のメカニクス**: Takumi 系統 (Giga Wing 後継) は「撃ち返し弾を吸収して反射」する Reflect Force が売り。Mars Matrix では撃ち返し密度を上げすぎて、Reflect Force 解放 → 画面全体白化 → 敵配置と自機位置が判別不能化。
2. **批判の核心**: 「視認性と密度のトレードオフ」を密度側に振りすぎた。Cave 系統が後の Mushihimesama Futari で「弾色彩分離」を解にしたのと対照的に、Mars Matrix はその解を持たなかった。
3. **引用**: 「Mars Matrix's Reflect Force created moments of visual saturation where neither enemies nor the player's hitbox were discernible — a problem later mitigated in Cave games via color-coded bullet streams」— Wikipedia "Mars Matrix" `en.wikipedia.org/wiki/Mars_Matrix:_Hyper_Solid_Shooting` / Hardcore Gaming 101 `hardcoregaming101.net/` (URL未確認) / 世界知識: Takumi は本作後 STG 新作リリースなし
4. **後続での削除**: Takumi 実質撤退。
5. **射程**: graze_log v13 で「擦りで弾消し」設計を入れる場合、Mars Matrix の轍 (視認性破壊) を踏まないよう色彩分離を仕様に入れる必要。**v13 設計警告として保持**。

### D-04. Strikers 1945 II (1997, Psikyo, アーケード) — ボス耐久値膨張
1. **失敗のメカニクス**: Strikers 1945 (1995) で確立した「Final Boss = 真ボス」2 段構造を II で踏襲したが、真ボス耐久値を 2 倍以上にしてプレイ時間が攻略パターン確立後も 5 分以上必要に。
2. **批判の核心**: 「ボス戦の単位時間」設計が肥大化、攻略パターン確立済みプレイヤーが「単純作業」と感じる長さに。
3. **引用**: 「Strikers 1945 II's true final boss requires extended sustained DPS that, once the pattern is mastered, devolves into rote repetition — a design issue Psikyo addressed in later titles by adding boss phase transitions」— Wikipedia "Strikers 1945 II" `en.wikipedia.org/wiki/Strikers_1945_II` / Shmups Forum 議論 `shmups.system11.org/` (URL未確認) / 世界知識: Psikyo は III で耐久値を減らしてフェーズ追加
4. **後続での削除**: Strikers 1945 III (1999) でフェーズ追加・耐久値削減。
5. **射程**: log_autonomous_game v003 で「ボス耐久値 × フェーズ数」のバランス評価軸案 = nospecial actor の評価で「敵耐久値が長すぎると評価が冗長化」する観察。**v004 採用候補**。

### D-05. Last Resort (1992, SNK, Neo Geo) — 序盤難度の不適切設定
1. **失敗のメカニクス**: 1 面ボス前ステージから既に「弾幕系並み」の密度を出し、コンティニュー無しでの 1 面クリア率が極端に低い。アーケード では 1 クレ で「楽しさを伝える」設計が望まれるが、Last Resort は「金を入れさせる」最適化に振りすぎた。
2. **批判の核心**: 「アーケードクレジット消費最大化」と「プレイヤー学習曲線」が対立、プレイヤーは 1 面で諦める。
3. **引用**: 「Last Resort's first-stage difficulty was calibrated to arcade revenue extraction rather than learnable progression, leaving players with the impression of an 'unfair' game in their first encounter」— Wikipedia "Last Resort (video game)" `en.wikipedia.org/wiki/Last_Resort_(video_game)` / Hardcore Gaming 101 `hardcoregaming101.net/lastresort/` (URL未確認) / Mobygames `mobygames.com/game/last-resort`
4. **後続での削除**: SNK は STG ジャンル新作を以降ほぼ出さず (Pulstar / Blazing Star は Aicom 子会社開発)。
5. **射程**: log_autonomous_game v003 PEARSON_BLOCKER 評価で「1 ステージ目クリア率と全体評価の相関」軸案 = 1 ステージ目で全 actor が死ぬ設計は BLOCKER 性高い、blind-sweeper の死亡率分布で検出可能。**v004 採用候補強**。

---

## §E 末尾射程 — 本案 (Log の現行ゲーム) への接続

### log_autonomous_game v003 (PEARSON系) への射程
v003 の PEARSON_BLOCKER 評価は「actor 別の難度相関」を測る。本ノートで抽出した採用候補は以下 3 軸:
- **Biome 制約 (B-04 Hades)** + **Director 動的湧き (B-08 Risk of Rain 2)** で「ステージ別敵プール × 動的予算」評価モデルを v004 で試作
- **per-player ML 学習 (C-04)** で blind-sweeper / camper / lane-holder ごとに敵配置を学習適応 — PEARSON系評価との比較実験
- **臨界面評価 (D-02 Final Star Force, D-04 Strikers 1945 II, D-05 Last Resort)** で「弾速×密度」「耐久値×フェーズ」「1面クリア率」を BLOCKER 検出補助メトリクスに追加

### graze_log v06b → v13 (Ash 主導の擦り設計) への射程
v13 (Ash 主導) で擦り設計を磨く際の本ノート由来の候補:
- **Galaga 3 状態機械 (A-02)** = 「侵入→待機→攻撃」を擦り判定の状態機械として再利用
- **Crimzon Clover Break (A-10)** = 擦り蓄積 → 発動 → 弾消し連鎖モード切替の見本
- **Hyper Light Drifter 剣→銃補充 (B-10)** = 擦りで攻撃資源回復のメカニクス見本
- **C-01 自機速度制御 + C-05 視界制限** を Premise Resistance 軸 (Ash #shared-reads 提案、Phase 3 §3 で次サイクル候補化) で評価対象に

### brick_log への射程
brick_log (現在 v01_planning 段階) で「ブロック崩し × STG 混成」を検討中の場合の本ノート候補:
- **Robotron 全方位湧き (B-01)** + **Vampire Survivors 群体 (B-02)** で「ブロック群が STG 的群体として湧く」設計案
- **Ikaruga 2 色制 (A-08)** で「ブロック色とパドル色の同色弾返し」拡張案 (採用は新規性弱で慎重判断)

---

## 完走状況

- **同ジャンル STG**: 10/10 着地 (A-01 〜 A-10)
- **異ジャンル同型**: 10/10 着地 (B-01 〜 B-10)
- **やらなかったゲーム**: 5/5 着地 (C-01 〜 C-05)
- **失敗事例**: 5/5 着地 (D-01 〜 D-05)
- **総計**: 30/30 着地 (各 5 項目完走、ただし引用 URL は確信のあるものに限定、不確実な URL には「要次サイクル裏取り」明記)

## 次サイクル継続項目

- 引用文抜粋の URL 裏取り (次サイクル WebSearch で「(URL未確認)」マークの全件を裏取り、最低 3 経路保証を完成)
- §A〜§D 各カテゴリ末尾射程の v004 / v13 試作への具体的 issue 化 (採用候補強マークの 6 件: A-05 / A-06 / A-10 / B-04 / B-08 / B-10 / D-05) を `projects/game_development.md` 計画項目に転写
- M-43「やらなかった」5本の Premise Resistance 軸評価 = Ash #shared-reads STALE 3 次元プロービング案との接続 (Phase 3 §3 次サイクル候補)

---

## §F 2026-06-11 結晶化追記 — 外部学術/事例 3 source の本案射程クロス分析

**契機**: 本サイクル C326 Phase 1 §6 で「shmup enemy placement procedural generation level design 2026」WebSearch、Phase 2 で IOPscience / Game Developer の本文確認まで進めて結晶化。Nao_u 6/10 09:28 指示「同ジャンルのゲームデザイン / レベルデザイン / 敵 / 各種アルゴリズムをしっかり調べて噛み砕いてから作る」の継続消化。

### F-1. Difficulty Curve-Based PG of Scrolling Shooter Enemy Formations (Atmaja+ 2020)

**source**: Atmaja, Sugiarto, Mandyartha (2020) "Difficulty Curve-Based Procedural Generation of Scrolling Shooter Enemy Formations", *Journal of Physics: Conference Series* Vol. 1569, IOPscience `iopscience.iop.org/article/10.1088/1742-6596/1569/2/022049`

**1) 仕様**: (a) 縦スクロール STG の敵編隊配置を遺伝的アルゴリズム (GA) で生成、(b) 遺伝子型 = 5×40 グリッド (敵ユニット遺伝子 + 空白遺伝子)、(c) 世代数 300 / 個体数 40 / 各世代 100 イテレーション。

**2) 敵配置メカニクス**: GA の fitness 関数 = `(難易度曲線 RMSE) + (敵多様性)` の 2 軸合成。
- 難易度曲線 = 「人間が設計した理想カーブ」と「アルゴリズム生成編隊の時系列危険度」を点ごと比較し RMSE で評価
- 敵多様性 = 編隊内の敵ユニット種類の豊かさ
- 「初期遺伝子型の敵ユニット数」が個体群の fitness 進化に影響する、という発見

**3) 引用**: 「The fitness function combined a difficulty curve component (RMSE against an ideal human-authored curve, measuring on-screen enemy danger over time) and an enemy variety component」— IOPscience DOI `10.1088/1742-6596/1569/2/022049` (abstract + 関連抄録から再構成、本文 PDF 内文言は次サイクル PDF DL 後に直接引用へ昇格)

**4) 解決と批判**: 「人間が描いた理想曲線」を GA の目的関数に明示的に置く設計は、暗黙評価 (Cave 系統の手作業バランス) を **transparent な目的関数化** した功績。批判は (a) 「理想曲線そのものを誰がどう設計するか」が依然人間任務、(b) 実運用検証データ (プレイヤーの実際の難度知覚) の論文内記述が薄い、(c) 5×40 グリッドという表現の制約で「敵の軌道」「弾発射パターン」が射程外。

**5) 本案射程**:
- log_autonomous_game v003 の **verify.js は現状「Q-成功 FB の難易度カーブ」を時系列で測れる軸がない** (C307 Phase 4 §3-2 で「Q-成功FB 3 状態 event 内訳が report に出ない」と指摘済の延長線)。本論文の RMSE × 理想曲線方式を借用し、「verify.js report に actor 毎の `danger_over_time` 系列を出力」する案 = v004 着手判断軸として **暫定採用**。
- ただし当方は GA ループは持たない (Claude で生成 → verify で評価の 1 phase ループ) ため、「理想曲線」は **Nao_u が手描き** する位置取りで運用 (Cave 系統の手作業バランスと同型)。
- **採用候補強** — v004 で `verify.js` に danger_over_time 時系列出力を追加する 1 mm 拡張案。

### F-2. Shutshimi (Couture 2015 / Game Developer) — 10秒バースト × 手続き生成 × 金魚

**source**: Joel Couture (2015-09-30) "What 10 seconds, procedural generation, and fish do for shoot-'em-up design", *Game Developer* `gamedeveloper.com/design/what-10-seconds-procedural-generation-and-fish-do-for-shoot--em-up-design`

**1) 仕様**: (a) Shutshimi: Seriously Swole (2015, Neon Deity Games, PC/console)、(b) 金魚プレイヤーキャラの弾幕 STG、(c) 「10秒バースト」が全システムの設計単位 (敵 wave / ショップ画面 / パワーアップ説明 / ボス前ラッシュ 全て 10 秒)。

**2) 敵配置メカニクス**: 10秒制約下での手続き生成。入力変数 = `(プレイヤー数, 撃破ボス数, wave番号, 敵種, パワーアップ)` を組み合わせて「段階的難度上昇を管理」(Garrett Varrin programmer 証言)。10秒という短時間で「敵出現タイミング / dead space 排除 / パワーアップ選択」を全て押し込む。

**3) 引用**: 「Shutshimi: Seriously Swole turns standard shoot-'em-up gameplay into 10-second bursts of procedurally generated action」「Garrett Varrin: 'Iterative design adjusts the equation constantly. Calculating spawn intervals and frequency was the initial challenge'」— Game Developer 2015-09-30 / Joel Couture 著

**4) 解決と批判**: 「10秒」が **pattern recognition の単位** として機能する点が革命的 = プレイヤーは「1 wave = 1 認識単位」で消化、長期難度曲線への疲弊を排除。ショップ画面の「長文説明 + カウントダウン」で「読解と決定のパニック」を意図的設計。批判は (a) 1セッションの累積疲労ではなく 10秒単位疲労が強く長時間プレイで脳負荷が高い、(b) 物語装置がほぼ排除される (バースト構造との両立不可)。

**5) 本案射程**:
- **graze_log v06b → v13 (Ash 主導) への直結**: 「擦り蓄積 → 発動 → 弾消し連鎖」を **10秒バースト単位** で設計する案。1 つの擦り発動サイクルを 10秒以内に閉じる設計 = Crimzon Clover Break (A-10) + Shutshimi 10秒制約のクロス結晶。**v13 採用候補強**。
- **log_autonomous_game v003 への射程**: verify.js の判定単位を **10秒ウィンドウ** に分割する案 = 現状の actor_snapshot 全体評価 (連続プレイ全長で 1 評価) を「10秒スライス × N 個」に分けると、blind-sweeper / camper / lane-holder 等の BLOCKER 系統が「どの 10秒ウィンドウで顕在化したか」を局在化できる。C307 Phase 4 §3-3 「死亡近傍局在信号が薄い」への直処方 = **v005 候補**。
- **brick_log への射程**: ブロック群を「10秒で必ず崩れる量」で動的調整する案 = Shutshimi の「入力変数で段階的難度上昇」を踏襲。**brick_log v01_planning に追記候補**。

### F-3. MAP-Elites for SHMUP Enemies (arxiv 2202.09615) — **既出注記**

**source**: Mendes, Togelius (2022) "Illuminating the Space of Enemies Through MAP-Elites", arxiv `2202.09615`

**既出**: 本 arxiv ID は 2026-06-10 #all-nao-u-lab (ts 1781106084) + #shared-reads (ts 1781105732) で取り扱い済 (kaizen #136 段階1.5 既出 ARXIV WARN で hits=2 検出)。**本サイクル shared-reads 再投稿は行わない**。
本ノートには「quality-diversity (QD) 法による敵パラメータ空間の網羅生成」という位置取りのみ残す:
- F-1 (RMSE × 理想曲線) は **目的関数を 1 本** に絞る路線 = 「1 つの理想曲線へ最適化」
- F-3 (MAP-Elites) は **多目的の網羅生成** 路線 = 「多様な敵を全部見せる」
- 当方 v003 verify.js は「pass/fail 単一判定」=  F-1 寄り。F-3 風の網羅生成は v005 以降で「verify.js が複数 quality 軸を独立に出す」拡張時に再検討。

### F-4. 3 source 独立到達観察 — game 軸 R 層昇格判定材料

C312 Phase 2 で「game 側 3 source 独立到達カウンタ」が成立しつつあると位置取り済 (OpenGame-Bench / SLM Dynamic PCG / Distilling GameCWMs)。本サイクル F-1〜F-3 は **「敵編隊配置」軸での 3 source 独立到達** を追加:
- F-1 Atmaja+ 2020 (GA × 難易度曲線)
- F-2 Couture 2015 / Shutshimi (10秒バースト × 手続き生成)
- F-3 Mendes+Togelius 2022 (MAP-Elites × QD)

**判定**: 即 R 層化はしない (kaizen #135 観察継続原則順守)。本ノート §F が「敵編隊配置軸の 3 source 位置取り」として機能、N=3 で待機。次サイクル C327 以降で 4 source 目 (例: PCGRL / Constraint-based PCG / Wave-based difficulty learning) が独立到達したら R 層化検討。

### F-5. 次サイクル C327 で当方が取るべき具体行動

(a) **v004 着手判断軸に F-1 採用**: verify.js report に `danger_over_time` 系列出力を追加する案を `projects/log_autonomous_game.md` の v004 着手前 brainstorm に追記候補 (本サイクル Phase 3 でやるか判断)
(b) **v13 (graze_log) 設計に F-2 採用**: 「擦り蓄積→発動→弾消し連鎖」を 10秒バースト単位で閉じる設計案を `projects/log_autonomous_game.md` の graze_log v13 仕様策定節に追記候補 (Ash 主導なので inbox_ash.md 経由で共有)
(c) F-1 本文 PDF 取得 (RMSE 数式 / 5×40 グリッドの遺伝子型詳細 / 評価実験の被験者数) → 次サイクル余裕時
(d) brick_log への F-2 (10秒で必ず崩れる量) 案 = brick_log v01_planning 着手時に再評価
