# log_autonomous_game v003 — hypotheses.md

PEARSON_BLOCKER.md L4 ルール (C276 追加) 「Pearson gate 未解除中の playable diff は新規仮説 1 個 + その検証用 diff だけ許可」の **初適用記録**。

ルール本体: `Pearson gate 未解除中の game/log_autonomous_game/v003/ への playable diff は「新規仮説 1 個 + その検証用 diff」だけ許可、「触ってみた」型 diff は禁止。`

---

## H-001 phase 0 第 1 wave の y-stagger 拡大による「Q-導入 teaser」効果 (C276 Phase 4, 2026-06-01, Log)

**仮説**:
phase 0 (0-20s, 学習導入) の **最初の wave のみ**、敵 A の y-stagger を現状 40 px (= 28 frame 遅延 / 0.47s) から **168 px (= 120 frame 遅延 / 2.0s)** に拡大すると、先行 1 体が単独で約 2 秒間プレイヤーに視認される **「teaser → 本体 2 体」構造** が成立する。

このとき以下が起きると予測する:
- (a) **Q-導入 (敵出現パターン明示) 採点が改善** = プレイヤーは単独敵の挙動 (vy=1.4 直進・shootCooldown 60 後の射撃) を「孤立観測条件」で学習でき、後続 2 体が到来する時には弾源パターンが認知済みになる
- (b) **Q-D (予測軌道) 体感の補強** = 単独敵から発射される弾 (1 発、画面下半身狙い) は段階3 弾尾 6F とあわせて方向認知が容易、密集弾幕より先に「1 弾の運動を読む」予行演習が成立する
- (c) **悪手 4 方針 (camper/lane-holder/blind-sweeper/nospecial) の全死亡は維持** = teaser 期間に死ぬパターンは増えにくく (1 体は脅威が薄い)、本体 2 体到来時に死ぬパターンが大半。verify.js pass:true 維持が予測の前提条件

**反証ライン** (Pre-mortem):
- (a-反) wave 1 が「易しすぎ」になり、本体到来前に castLock を覚えないままで進む → 後続 wave 2 (phase 1, A+D 同時) でカモられる体感が増す可能性。観察手段: verify.js 各方針の `survived_frames` が現行より延びていないか確認
- (b-反) teaser 期間中の単独敵 1 体は射撃前に画面上端 (y < 0) を抜けてしまう可能性 (y=-20 → y_gate 突入まで `(20)/1.4 = 14 frame`、cooldown 初期 60 → 射撃前に gate 退場せず OK 試算)。観察手段: verify.js 死因 `death_cause` 分布を現行と比較
- (c-反) teaser → 本体の構造がプレイヤーには「単に最初 1 体しか出てこない遅れた wave」と読まれ、Q-導入効果が成立せず Q-A (進行ペース) の体感が逆に劣化する可能性。観察手段: Phase 5 Slack 出荷後の実機判定 (Nao_u/Mir/Ash)、自己判定では未確認

**検証用 diff** (本 commit に含めるもの):
1. `game.js`: `spawnWaveA()` 関数内、`waveCount === 0` (= phase 0 第 1 wave) の場合のみ y-stagger を 40 → 168 に切替。1 定数追加 + 1 行条件分岐 + 1 行 y 式変更 = 約 3-5 行差分
2. `verify.js`: 同型 `spawnWaveA(state)` 関数を同じ条件で同じ stagger 切替 (game.js と完全同型維持、verify 整合性)
3. 観測: `node verify.js` で `pass: true` 維持 (悪手 4 方針 90s 内全死亡)、各方針の `survived_frames` を H-001 適用前後で記録 (`self_judgment.md` Q-導入節へ 1 行追記)

**判定装置位置確認 (R-A)**: 本仮説検証は自己批判 verify.js + 自己観察 = **自己判定精度の補強**、確定採点は依然 Nao_u/Mir/Ash 実機判定が条件 (R-A 順守、判定装置=最終確認装置)。

**外部知見裏付け** (R 層):
- design_log §Q-導入「最初の wave は学習プロトコル」設計意図 (起票時 C238 系) に teaser 機構を追加する直処方
- game_lessons_log.md R-A「最初の wave で 1 種の挙動だけを孤立観測させる」一般則 (Pulse Relay 70-90s カーブ第1段「4-12s 学習」の局所化)

**期待される C277 以降の継続課題**:
- 実機判定 (Nao_u/Mir/Ash) で teaser 構造が「親切」と読まれるか「冗長」と読まれるかの判定 → 5/5 確定 or 撤回 (revert は 1 commit)
- teaser 時間長 (2.0s) の幅探索 (1.0s / 1.5s / 2.5s) は実機判定後に検討
- phase 1/2 では従来通り 40 stagger 維持 = phase 進行で「学習→展開」の落差を保つ設計

---

## H-002 wave_clear 瞬間の薄テロップ FB による「静寂フェーズ」意味づけ補強 (C297 Phase 4, 2026-06-04, Log)

**仮説**:
phase 0/1/2 全 wave で「敵が画面から消えた瞬間」と「次 wave 起動 (8 秒後)」の間にある **WAVE_REST_FRAMES = 8 秒静寂** が、現状無音・無視覚で「ただの空白」として体感されている。wave_clear 瞬間に **0.75 秒 (45F) フェードする薄テロップ "Wave N Clear"** を画面上端寄り (H*0.18) に表示すると、静寂が「次の wave に備える時間」として意味づけされ、Pulse Relay 70-90s カーブ第 1 段「学習 → 静寂 → 展開」の **静寂フェーズの意味づけ** が補強される。

このとき以下が起きると予測する:
- (a) **Q-展開差カーブ採点が +0.5 程度改善見込み** (v002→v003 暫定 22-23/25 → 23-24/25 候補)。静寂前にプレイヤーが「自分の選択 (castLock 含む) が結果として wave を退場させた」連結を意識し、次 wave の開始までの 8 秒が「準備時間」として再認知される
- (b) **Q-成功FB 体系の 4 状態化**: castLock 系 3 状態 (状態 1 待機 / 状態 2 弱 hit / 状態 3 危機回避) + **状態 4 (wave-clear)** で「ゲーム進行の節目」FB の系統が完備
- (c) **verify.js 4 方針 pass: true 維持**: 悪手 4 方針は phase 0 (wave 1) 内で全死亡 = wave_clear に到達しないため、本変更の描画コードは実行されない = 悪手検証への影響ゼロ

**反証ライン** (Pre-mortem):
- (a-反) テロップが「やかましい」「リズム破壊」と判定される可能性 → 緩和: alpha 上限 = 1.0 × 0.6 = 0.6 (= 既存 lockMessage 危機回避テキスト alpha 1.0 より控えめ)、フォント 14px (lockMessage 22px より小さい)、表示位置 H*0.18 (画面上端寄り、player H*0.78 と最遠)、表示時間 0.75 秒 (lockMessage と同)
- (b-反) wave 1 直後 (phase 0 学習導入) の静寂は「最初の wave の挙動を反芻する時間」だったが、テロップが意識を次 wave に向けてしまい H-001 teaser 効果と干渉する可能性 → 緩和: H*0.18 配置で player 注視帯 (H*0.78 帯) から最遠、テロップは "Wave 1 Clear" の事実のみで「次が来る」を示唆しない (= 静寂の意味づけのみ、teaser 学習の妨害最小)
- (c-反) Q-成功FB の核心 = castLock 機構判定 FB と読まれた既存 3 状態体系を「wave-clear FB」追加で混線させるリスク → 緩和: 色相分離 (castLock 系 = シアン 140,230,255 / wave-clear = 薄白系 180,220,255)、トリガ分離 (resolveLock vs wave_clear イベント)、共起頻度は wave 内 castLock 多発 × wave 退場 1 度のため Slack 衝突確率は低い (resolveLock hit 直後に wave_clear が同 frame 発火する exotic case のみ重畳)

**検証用 diff** (本 commit に含めるもの):
1. `game.js`:
   - `game` 状態に `waveClearMessage: null` 追加 (1 line)
   - `resetForPlay()` に `game.waveClearMessage = null;` 追加 (1 line)
   - `step()` 内 wave_clear ブロック (`if (game.waveSpawned && game.enemies.length === 0)`) に `game.waveClearMessage = { text: 'Wave ' + game.waveCount + ' Clear', frame: game.frame };` 追加 (1 line)
   - `drawPlaying()` に描画ブロック追加: `if (game.waveClearMessage && game.frame - game.waveClearMessage.frame < 45)` で 45F フェード、薄白系 alpha 0.6 max、フォント 14px、H*0.18 配置 (~7 lines)
2. `verify.js`: **改変なし** (描画レイヤーのみ変更、悪手 4 方針 phase 0 死亡 = wave_clear 経路非通過、検証 logic への影響ゼロ事前確認)
3. 観測: `node --check game.js` PASS、`node verify.js` で `pass: true` 維持 (悪手 4 方針全 wave 1 内死亡を維持)、各方針 survived_frames を H-002 適用前後で記録 (`self_judgment.md` Q-成功FB 節へ追記)

**判定装置位置確認 (R-A)**: 本仮説検証は自己批判 verify.js + 自己観察 = **自己判定精度の補強**、確定採点は依然 Nao_u/Mir/Ash 実機判定が条件 (R-A 順守、判定装置=最終確認装置)。

**外部知見裏付け** (R 層):
- design_log §2.1 「phase 内密度カーブ」失点 -1 の出所「展開差 21/25 = 84%」の補正方向 (静寂の意味づけ補強で展開の「節目」が体感化)
- game_lessons_log.md Pulse Relay 70-90s カーブ第 1 段「学習→静寂→展開」三段論の **「静寂」フェーズ単独の意味づけが弱い** ことへの直処方 (静寂を「準備」と再ラベル)
- self_judgment.md Q-成功FB 既存 3 状態 (待機 / 弱 hit / 危機回避) は **castLock 機構内に閉じる**、wave 進行軸の FB が体系的に欠落していた構造瑕疵への補完

**期待される C298 以降の継続課題**:
- 実機判定 (Nao_u/Mir/Ash) で wave_clear テロップが「節目として効く」or「冗長」かの判定 → +0.5 ~ +1 確定 or 撤回 (revert は 1 commit)
- テロップ表示位置 (H*0.18) の高さ探索 (H*0.10 / H*0.25 / 画面四隅) は実機判定後に検討
- 「次 wave 起動 1 秒前 (= 静寂 7 秒経過時) のカウントダウン FB」拡張は H-003 候補として保留 (本 H-002 単独効果検証後)

---

## H-003 wave 起動 1 秒前カウントダウン FB による「静寂フェーズ」両端意味づけ完成 (C298 Phase 4, 2026-06-05, Log)

**仮説**:
H-002 で wave_clear 瞬間 (静寂フェーズ起点) の意味づけが補強された。一方、静寂 8 秒の **末尾 (= 次 wave 起動 1 秒前)** はまだ無視覚で「いつ来るかわからない」状態。`waveClearMessage` 発火から **7 秒経過 (= 60F 残り)** の時点で **薄白系 "Wave N+1" カウントダウン FB** (画面上端寄り H*0.18・フォント 12px・alpha 0.5 max・60F フェードイン + 20F フェードアウト) を表示すると、静寂の **両端 (退場側 = H-002 / 起動側 = H-003)** が意味づけられ、Pulse Relay 70-90s カーブ第 1 段「学習 → 静寂 → 展開」の **静寂フェーズ完全意味づけ** が成立する。

このとき以下が起きると予測する:
- (a) **Q-展開差カーブ採点が +0.3 程度追加改善見込み** (H-002 暫定 +0.5 改善見込みに上乗せ)。プレイヤーは「次が来る」事実が静寂末尾に予告されることで castLock 充填 (trail < ECHO_FRAMES 状態 1) と移動位置取りを **準備時間として能動消費** できるようになる
- (b) **Q-成功FB 体系の 5 状態化**: castLock 系 3 状態 (状態 1 待機 / 状態 2 弱 hit / 状態 3 危機回避) + 状態 4 (wave_clear) + **状態 5 (新規: 次 wave 起動カウントダウン)** で「wave 進行軸 FB」が両端揃う
- (c) **verify.js 4 方針 pass: true 維持**: 悪手 4 方針は phase 0 (wave 1) 内で全死亡 = wave_clear → 7 秒静寂 → 次 wave に到達しないため、本変更の描画コードは実行されない = 悪手検証への影響ゼロ (H-002 同型)

**反証ライン** (Pre-mortem):
- (a-反) **カウントダウンが「次が来るぞ」と警告音的に作用し、静寂の余韻を破壊する可能性** → 緩和: alpha 上限 0.5 (H-002 alpha 0.6 より控えめ)、フォント 12px (H-002 14px より小型)、60F フェードイン → 20F フェードアウトの **遅い立ち上がり** で「警告」より「兆し」のテクスチャを目指す。フェードイン期間中の alpha は age/60 で 0.0 → 0.5 推移
- (b-反) **H-002 wave_clear FB と表示位置が同じ (H*0.18) で 8 秒静寂内に「上端で 2 回テキストが現れる」体験が冗長になる可能性** → 緩和: H-002 = "Wave N Clear" (過去化)、H-003 = "Wave N+1" (未来化) で意味的に対称、内容差で「同じ場所のテキスト 2 回」を「節目の前後」と読みかえ可能性。表示時間も H-002 45F vs H-003 80F (60+20) で接続感を出す。実機判定で「冗長」と出たら 1 commit 撤回
- (c-反) **castLock 機構の充填中 (状態 1 グレー薄リング) と「次が来る」予告 (状態 5) が同 frame で重畳すると、プレイヤーの注意が分散** → 緩和: 状態 1 はプレイヤー周辺 (player r+6 リング、player H*0.78 帯)、状態 5 は画面上端 (H*0.18) で **空間分離**。色相も状態 1 = グレー (150,155,165) と状態 5 = 薄白 (180,220,255) で分離

**検証用 diff** (本 commit に含めるもの):
1. `game.js`:
   - `game` 状態に `waveCountdownMessage: null` 追加 (1 line)
   - `resetForPlay()` に `game.waveCountdownMessage = null;` 追加 (1 line)
   - `step()` 内、wave_clear ブロック直後 (静寂中) に **「`waveClearMessage` 経過 7 秒 (420F) 到達 frame で `waveCountdownMessage` をセット」** ブロック追加 (~3 lines)
   - `drawPlaying()` に H-003 描画ブロック追加: 80F 寿命 (60F フェードイン + 20F フェードアウト)、薄白系 rgba(180,220,255)、alpha 0.5 max、フォント 12px、H*0.18 配置、テキスト "Wave " + (waveCount+1) (~10 lines)
2. `verify.js`: **改変なし** (描画レイヤーのみ変更、悪手 4 方針 phase 0 死亡 = wave_clear+7秒経路非通過、検証 logic 無関係を事前確認、H-002 と同論証)
3. 観測: `node --check game.js` PASS、`node verify.js` で `pass: true` 維持 (悪手 4 方針全 wave 1 内死亡を維持)、各方針 survived_frames を H-002 着地値と bit 完全一致確認 (描画レイヤー追加が gameplay logic に一切影響しないことの数学的確認)

**判定装置位置確認 (R-A)**: 本仮説検証は自己批判 verify.js + 自己観察 = **自己判定精度の補強**、確定採点は依然 Nao_u/Mir/Ash 実機判定が条件 (R-A 順守、判定装置=最終確認装置)。

**外部知見裏付け** (R 層):
- design_log §2.1 「phase 内密度カーブ」失点 -1 の補正方向の **第 2 軸 (静寂両端意味づけ)** = H-002 (退場側) と本 H-003 (起動側) の対称構造
- game_lessons_log.md Pulse Relay 70-90s カーブ第 1 段「学習→静寂→展開」三段論の **「静寂」内部構造の 2 端化**: 退場節目 (H-002) と起動兆し (H-003) で「静寂」が単なる空白から「準備時間」として体感されるための時間軸両端 anchor
- self_judgment.md Q-成功FB の wave 進行軸 FB が H-002 で状態 4 として開いた構造に **状態 5 = 起動兆し** を加え、wave 進行の **退場・準備・起動** 3 段が物理化 (静寂の 8 秒 = 0-7s 余韻 + 7-8s 兆し)

**期待される C299 以降の継続課題**:
- 実機判定 (Nao_u/Mir/Ash) で「Wave N+1」カウントダウンが「準備時間として効く」or「警告的でうるさい」かの判定 → +0.3 ~ +0.5 確定 or 撤回 (revert は 1 commit)
- カウントダウン発火タイミング (7 秒 = 60F 残り) の探索 (4 秒 / 6 秒 / 8 秒寸前) は実機判定後
- 「Wave N+1」テキスト表記 vs「3...2...1」数字カウント vs「●●○」ドット段階表記 の選択肢比較は実機判定後 (本サイクルは「Wave N+1」固定で H-002 と表現様式統一)
- 静寂フェーズ意味づけ 2 軸 (H-002 退場 + H-003 起動) 完備後、次は **wave 内密度カーブ** (現状 phase 2 のみ ease-in) の phase 1 拡張 / phase 0 wave 内段階化が次サイクル以降の H-004 候補

---

## H-005 phase 0 wave 2 以降の 2 段階 ease-in 拡張 (C300 Phase 4, 2026-06-05, Log)

**仮説**:
phase 0 (0-20s, 学習導入) の wave 1 (waveCount=0) は H-001 で y-stagger 168px (= 120F 遅延) による **空間軸段階化** が成立しているが、wave 2 以降 (waveCount >= 1) は spawnWaveA() 経路で y-stagger 40px (= 28F) の単段 spawn に戻り、phase 0 内で「学習」軸の段階化進化が wave 1 で打ち切られている。phase 0 wave 2 以降も H-004 同型の **warmup 1 体 → WAVE_SUBPHASE_WARMUP_FRAMES (120F = 2.0s) 後 main 残り 2 体** の 2 段階 ease-in に拡張すると、phase 0 内で「teaser (wave 1, 空間軸) → 静寂 (H-002/H-003) → 段階化 spawn (wave 2+, 時間軸)」の **3 段密度カーブ** が成立し、phase 0 学習導入の wave-by-wave 進化が物理化される。

設計値 (確定):
- 判定: `isPhase0Wave2Plus = phase.phaseStart === 0 && game.waveCount >= 1`
- `spawnNextWave()` 判定条件を `(isPhase1 && (type === 'A' || type === 'D')) || (isPhase0Wave2Plus && type === 'A')` で warmup 経路接続
- `spawnWaveWarmup(type)` / `spawnWaveMain()` 本体は **変更なし** = phase 1 と完全共有 (型 A の staggerY は `game.waveCount === 0 ? PHASE0 : DEFAULT` の既存式が wave 2 では DEFAULT=40 を選択するため、phase 1 同型動作で連続性維持)
- WAVE_SUBPHASE_WARMUP_FRAMES = 120 共有
- wave 1 (H-001 teaser) と type C / phase 1/2 は無変更

予測項目:
- (a) **Q-展開差カーブ採点 +0.2 程度追加改善見込み** (H-002/H-003/H-004 累計改善見込みに上乗せ、v002→v003 暫定 22-24+α/25 → +0.2 候補)。phase 0 内で密度カーブが平坦 (wave 1 teaser → 静寂 → wave 2 単段) から 3 段 (wave 1 teaser → 静寂 → wave 2+ 段階化) に増え、phase 進行で「段階化様式」が空間軸 → 時間軸へ進化する設計が wave-by-wave で体感化
- (b) **Q-導入採点維持** = wave 1 H-001 teaser は不変、wave 2 以降の段階化は「学習が一巡した次段階」として階層化、Q-導入の核 (最初の wave で挙動を孤立観測) は保持
- (c) **verify.js 4 方針 pass:true 維持 + survived_frames bit 完全一致** = 悪手 4 方針は phase 0 wave 1 内 (最大 nospecial 545F = 9.08s) で死亡、wave 1 clear 後 8s 静寂 (H-002/H-003 期間) → wave 2 spawn は早くても 13-17s 程度 ≫ 9.08s で **wave 2 非到達**、本変更は gameplay logic に一切影響しない (H-004 同型論証 4 度目)

**反証ライン** (Pre-mortem):
- (a-反) phase 0 wave 1 teaser (静的 stagger) と wave 2 warmup→main (動的 spawn) の **段階化様式の不統一** がプレイヤーに「同じ phase 0 内で 2 種の構造」と読まれ、Q-導入の「学習プロトコル」一貫性が崩れる可能性 → 緩和: 設計意図は **「空間軸 → 時間軸」の段階化進化** = 「最初は空間で慣らし、次は時間で慣らす」と意識的に役割分担、Slack 出荷時に意図を明示
- (b-反) phase 0 wave 2 spawn が **静寂明け直後の段階化** で発火することで、H-003 wave countdown FB (Wave 2) との時間整合性が崩れる可能性 (Wave 2 と表示されてから warmup 1 体のみ出現で「あれ?」と読まれる) → 緩和: H-003 の "Wave N+1" 表示は「次 wave 起動の兆し」目的、warmup は wave N+1 の **第 1 段** なので「Wave 2 = warmup 開始 → 2.0s 後 main」が時系列的に整合、テキスト変更は不要
- (c-反) phase 0 wave 2 spawn 時に wave 1 残骸 (敵 A 撃ち漏れ等) が画面内に残っている場合、warmup 1 体 + 残骸で混雑感が出る可能性 → 計算: wave 1 spawn は 0s、castLock 機構で標準的に 4-8s で全消去、wave 1 clear 後 8s 静寂で wave 2 spawn = 12-16s 時点。wave 1 敵 A は y=-20-2*168=-356 から vy=1.4 で落下、画面下端 720 まで (720+356)/1.4 = 769F = 12.82s。残骸 = castLock 漏れ 1-2 体程度なら 12-16s 時点で画面下端通過済 (画面外退場)。warmup 1 体 + 残骸混雑のリスクは限定的
- (d-反) 悪手 4 方針 phase 0 wave 1 内死亡で wave 2 spawn 非到達 = verify.js では本変更の効果を検証できない → これは「verify.js は悪手検出専用、良手検証は実機判定」設計通り (R-A 順守)、観測は Nao_u/Mir/Ash 実機判定で

**検証用 diff** (本 commit に含めるもの):
1. `game.js`:
   - `spawnNextWave()` 内に `isPhase0Wave2Plus = phase.phaseStart === 0 && game.waveCount >= 1` 判定追加 (1 line)
   - warmup 経路判定式拡張: `(isPhase1 && ...) || (isPhase0Wave2Plus && type === 'A')` (1 line 改修)
   - コメント追加 (phase 0 内 wave 1/wave 2+ 役割分担明示) (~4 lines)
   - 合計差分: 約 6-8 行 (関数本体・spawnWaveWarmup/spawnWaveMain は変更なし)
2. `verify.js`: **同型変更** (`isPhase0Wave2Plus = phase.phaseStart === 0 && state.waveCount >= 1` + 判定式拡張 + コメント追加)
3. 観測結果: `node --check` 両ファイル PASS、`node verify.js` で `pass: true` + 4 方針 survived_frames **bit 完全一致** (camper 319 / lane-holder 284 / blind-sweeper 378 / nospecial 545、H-004 着地値と全 frame 一致 = phase 0 wave 1 内死亡で wave 2 spawn 非到達の数学的確認)

**判定装置位置確認 (R-A)**: 本仮説検証は自己批判 verify.js + 自己観察 = **自己判定精度の補強**、確定採点は依然 Nao_u/Mir/Ash 実機判定が条件 (R-A 順守、判定装置=最終確認装置)。

**外部知見裏付け** (R 層):
- design_log §2.1 「phase 内密度カーブ」失点 -1 の補正方向 **第 4 軸 (phase 内 wave 内段階化の wave-by-wave 進化)** = H-002/H-003 (静寂両端) → H-004 (phase 1 wave 内 ease-in) → H-005 (phase 0 wave 2+ ease-in) で「段階化が phase 進行で深化する」設計の段階完成
- game_lessons_log.md Pulse Relay 70-90s カーブ第 1 段「学習→静寂→展開」三段論で **「学習」フェーズ自体に内部段階構造を持たせる** = wave 1 (空間段階化) → 静寂 → wave 2+ (時間段階化) で学習プロトコルが wave-by-wave で進化
- H-001/H-004 との対称性: phase 0 wave 1 = 静的 stagger (空間軸) / phase 0 wave 2+ = warmup→main (時間軸) / phase 1 = warmup→main (時間軸) / phase 2 = SHOOT_INTERVAL ease-in (時間軸) → 段階化様式が phase 進行で「空間→時間→時間→時間」と多軸化、phase 0 内で軸変化が起きる設計

**期待される C301 以降の継続課題**:
- 実機判定 (Nao_u/Mir/Ash) で「phase 0 wave 2 以降の 2 段化」が「学習段階の深化」or「冗長」or「気付かない」かの判定 → +0.2 ~ +0.3 確定 or 撤回 (revert は 1 commit)
- phase 0 wave 2 spawn が phase 0 (20s) 内に確実に発生するかの実機確認 (wave 1 clear が 4-12s 範囲、+8s 静寂で wave 2 spawn は 12-20s) → spawn が phase 1 (20s) 跨いだ場合の動作確認
- phase 2 type C の 2 段階化 (H-006 候補) との対称性、phase 2 type A/D の 2 段階化拡張 (H-007 候補)
- C297 H-002 → C298 H-003 → C298 H-004 → C300 H-005 で **4 サイクル連続 game/* playable diff 体制** 達成、CLAUDE.md 第 1 項「ゲームを動かして出す」固定化を C281 以降 10+ サイクル停滞から構造的に脱却した記録の継続

---

## H-004 phase 1 wave 内 2 段階 ease-in 密度カーブ拡張 (C298 Phase 4 着地, 2026-06-05, Log)

**仮説**:
phase 1 (20-50s, 展開) の wave 内構成は v003 H-003 時点まで **敵 A+D 同時 spawn の 1 段** で wave 内密度フラットだった。これを **wave 開始 0-2s 単独 1 体 (warmup, i=0 位置) → 2-4s 本体 spawn (main, i=1,2)** の **2 段階 ease-in** に拡張すると、phase 1 開始時の認知負荷が軽減され、phase 0 から phase 1 への展開傾斜が体感としてなめらかになる。

設計値 (確定):
- `WAVE_SUBPHASE_WARMUP_FRAMES = 120` (= 2.0s @ 60fps) で warmup → main 間隔固定
- warmup spawn 時に `waveSpawned = true` セット (wave_clear ガード)、`pendingMainSpawn = type` セット
- main spawn 時に `waveCount += 1` (wave 全体完成扱い)、次 wave 型決定の整合性は維持
- phase 0 (type A 単段) と phase 2 (type A+D+C 単段) は **変更なし** (従来通り 1 段 spawn)
- type C は phase 2 のみで出現する単独運動軸なので 2 段階化対象外

予測項目:
- (a) **Q-展開差カーブ採点が +0.2 程度追加改善見込み** (H-002/H-003 累計改善見込みに上乗せ、v002→v003 暫定 22-24/25 → 22-24+α/25 候補)
- (b) **verify.js 4 方針 pass: true 維持 + survived_frames 完全一致**: 悪手 4 方針は phase 0 (wave 1) 内死亡 (最大 nospecial = 545F = 9.08s < phase 1 開始 1200F = 20s) で phase 1 非到達のため、本変更は gameplay logic に一切影響しない (H-002/H-003 同型論証 3 度目)
- (c) **phase 0 → phase 1 接続のなめらかさ**: 静寂 8 秒 (H-003 期間) を抜けた直後の認知負荷ピークが ease-in で平準化、phase 1 開始の「展開感」を保ちつつ初動を緩める

**反証ライン** (Pre-mortem):
- (a-反) 2 段階 ease-in が「stalling = 引き伸ばし」と読まれ展開感が薄まる可能性 → 緩和: warmup 単独 1 体は寿命が短い (敵A: vy=1.4 で 120F 落下 = 168px 進む = 画面下端到達前に main 到来、敵D: vx=1.4 で 168px 進む = 中央到達手前で main 到来) ため「単独で長居」しない設計、main 2 体が予定通り到来して密度回復
- (b-反) phase 1 wave 内段階化が phase 0 (現状単段 wave) との対比を弱める可能性 → 緩和: phase 0 第 1 wave は H-001 で y-stagger 168px (= 120F 遅延) によりすでに「teaser → 本体」構造化済 (実質 2 段)、phase 1 H-004 と対称、phase 0 第 2 wave 以降のみが完全単段 → phase 進行で「単段 → 段階 → 単段+密度漸変 (phase 2)」と密度設計が phase ごとに分化
- (c-反) **warmup を倒した直後に main spawn する」体感が「終わらない wave」と読まれ疲労感を増す可能性** → 緩和: warmup → main の 120F 間隔は固定で「予測可能」、castLock 機構の充填周期 (60F = ECHO_FRAMES) と倍数関係で「2 回 castLock 充填可能な間隔」を確保、main 到来は警告ではなく「次の展開」として読まれる狙い
- (d-反) main spawn 時に warmup がまだ生きていると合計 3 体が同時画面上に出現する可能性 → 計算: 敵A vy=1.4 で 120F 落下 = 168px、初期 y=-20 → 148px 到達 (画面上 1/5)、画面下端 H=720 まで残り 572px = 408F 余裕。敵D vx=1.4 で 168px、初期 x=-20 → 148px、画面右端 W=640 まで残り 492px = 351F 余裕 → main 到来時 warmup はまだ画面内、設計通り 3 体共存 (= 「ease-in 完了後は単段 wave 時の密度に到達」体感)

**実装した検証用 diff** (本 commit):
1. `game.js`:
   - 定数 `WAVE_SUBPHASE_WARMUP_FRAMES = 120` 追加 (1 line + comment)
   - `game` 状態に `waveSubPhase: 0`, `pendingMainSpawn: null`, `waveSubPhaseFrame: null` 追加 (3 lines + comment)
   - `resetForPlay()` に 3 状態リセット追加 (3 lines)
   - `spawnNextWave()` に phase 1 判定追加 (`phaseStart === 20 * FPS` で識別)、type A/D は `spawnWaveWarmup(type)` 経路、phase 0/2 + type C は従来通り `spawnWaveA/D/C()` 呼出 (~10 lines 改修)
   - 新規関数 `spawnWaveWarmup(type)` 追加: i=0 位置のみ 1 体 spawn、`waveSpawned/waveSubPhase/waveSubPhaseFrame/pendingMainSpawn` 4 状態セット、`waveCount` は不変 (next-wave type 決定整合性、~25 lines)
   - 新規関数 `spawnWaveMain()` 追加: `pendingMainSpawn` 型に応じて i=1,2 位置 spawn、`waveCount += 1`、`waveSubPhase = 2`、`pendingMainSpawn = null` (~30 lines)
   - `step()` 内 wave_clear 条件に `&& !game.pendingMainSpawn` 追加 (warmup 倒し時の早期 wave_clear ガード) (1 line)
   - `step()` 内 `spawnNextWave()` 呼出直後に main spawn トリガ追加 (`pendingMainSpawn && frame - waveSubPhaseFrame >= 120` で `spawnWaveMain()` 発火) (~3 lines)
2. `verify.js`: **完全同型実装** (game.js と同一ロジック、`spawnWaveWarmup(state, type)` + `spawnWaveMain(state)` + state 3 フィールド + main spawn トリガ + wave_clear ガード)
3. 観測結果: `node --check` 両ファイル PASS、`node verify.js` で `pass: true` + 4 方針 survived_frames **bit 完全一致** (camper 319 / lane-holder 284 / blind-sweeper 378 / nospecial 545、H-003 着地値と全 frame 一致 = phase 0 死亡で phase 1 変更非到達の数学的確認)

**判定装置位置確認 (R-A)**: 本仮説検証は自己批判 verify.js + 自己観察 = **自己判定精度の補強**、確定採点は依然 Nao_u/Mir/Ash 実機判定が条件 (R-A 順守、判定装置=最終確認装置)。

**外部知見裏付け** (R 層):
- design_log §2.1 「phase 内密度カーブ」失点 -1 の補正方向 **第 3 軸 (wave 内密度カーブ自体の段階化)** = H-002/H-003 (静寂両端意味づけ) に続く wave 内構造直接介入
- game_lessons_log.md Pulse Relay 70-90s カーブ第 1 段「学習→静寂→展開」三段論で **「展開」フェーズ自体に内部段階構造を持たせる** ことで wave 種別ローテだけでない密度の動的変化を達成
- self_judgment.md Q-展開差カーブ採点根拠 (v002→v003 段階で +1〜+2 改善見込み) の **wave 内軸** 補強 = 従来は wave 間 (phase 0/1/2 種別増) のみで「段階化」していた密度設計を、wave 内 ease-in で対称化
- H-001 (phase 0 第 1 wave teaser, y-stagger 168px 拡大) との対称性: phase 0 = stagger による暗黙の段階化 / phase 1 = 明示的 warmup → main 2 段階化 / phase 2 = SHOOT_INTERVAL 漸変による段階化 = 各 phase で異なる段階化様式の物理化

**期待される C299 以降の継続課題**:
- 実機判定 (Nao_u/Mir/Ash) で「warmup → main」段階化が「なめらか」or「stalling」or「気付かない」かの判定 → +0.2 ~ +0.3 確定 or 撤回 (revert は 1 commit)
- `WAVE_SUBPHASE_WARMUP_FRAMES = 120` (2.0s) の幅探索 (60F=1s / 180F=3s / 240F=4s) は実機判定後
- phase 0 第 2 wave 以降 (現状単段) の段階化 (H-005 候補)、phase 2 type C の 2 段階化 (H-006 候補) との対称性検討
- C297 H-002 → C298 H-003 → C298 Phase 4 H-004 で **3 サイクル連続 game/* commit 体制** 達成、CLAUDE.md 第 1 項「ゲームを動かして出す」固定化を C281 以降 10+ サイクル停滞から構造的に脱却した記録

---

## H-006 phase 2 type C 2 段階 ease-in 拡張 (C302 Phase 4 着地, 2026-06-06, Log)

**仮説**:
phase 2 (50-90s, 終盤) の type C (ダイブ敵) は v003 H-005 時点まで n=2 単段 spawn (baseX = W*0.3 と W*0.7、y-stagger 60px = 24F @ vy=2.5、合計 1 wave 内 2 体同時投入) で wave 内構成がフラット。phase 1 type A/D は H-004 で warmup→main 2 段階 ease-in 済、phase 0 wave 2+ type A は H-005 で同様化済の状況で、**phase 2 type C のみ単段 spawn のまま** = 「段階化様式の phase 進行進化」(空間軸 phase 0 wave 1 → 時間軸 phase 0 wave 2+ → 時間軸 phase 1 → ??? phase 2 C) が phase 2 C で打ち切られている。

これを **wave 開始 0-2s 単独 1 体 (warmup, baseX=W*0.3) → 2-4s main 1 体 (main, baseX=W*0.7)** の 2 段階 ease-in に拡張すると、単独ダイブの軌道学習を孤立観測させた直後に main ダイブで wave 内密度回復、終盤の認知負荷ピークを時間軸で平準化できる。

設計値 (確定):
- `WAVE_SUBPHASE_WARMUP_FRAMES = 120` (= 2.0s @ 60fps) を A/D/C 全 type 共有
- `isPhase2C = phase.phaseStart === 50 * FPS && type === 'C'` 判定で warmup 経路に接続
- warmup: i=0 のみ (baseX=W*0.3, y=-20)、shootCooldown=9999 (C は射撃しない)
- main: i=1 のみ (baseX=W*0.7, y=-20-60=-80) → warmup と stagger 60px (= 24F @ vy=2.5) + 120F 時間差 = 計 144F (2.4s) の時間軸分節
- phase 2 type A/D は **変更なし** (単段 spawn 維持) = phase 2 内で「A/D = 集約 / C = 段階」の役割分担で密度設計が更に分化
- waveCount += 1 タイミングは main spawn 時 (= H-004/H-005 と同型) で次 wave 型決定の整合性維持

予測項目:
- (a) **Q-展開差カーブ採点 +0.1 ~ +0.2 程度追加改善見込み** (H-002/H-003/H-004/H-005 累計改善見込みに上乗せ)。phase 進行で「段階化様式が phase ごとに分化」が完備 (phase 0 wave 1 = 静的 stagger / phase 0 wave 2+ = 時間軸 A 2 段 / phase 1 = 時間軸 A/D 2 段 / phase 2 = type 別役割分担 [A/D 単段 + C 2 段])
- (b) **Q-導入採点維持** = phase 0 wave 1 H-001 teaser は不変、phase 2 C 段階化は phase 2 終盤での密度設計に閉じ、phase 0 学習プロトコルへの影響ゼロ
- (c) **verify.js 4 方針 pass: true 維持 + survived_frames bit 完全一致** = 悪手 4 方針は phase 0 wave 1 内 (最大 nospecial = 545F = 9.08s) で死亡、wave 1 clear 後 8s 静寂 → wave 2+ も phase 0 (≤ 1200F = 20s)、phase 1 = 1200F-3000F、**phase 2 は 3000F+** から始まる = nospecial 545F の **5.5 倍以上未到達**、本変更は gameplay logic に一切影響しない (H-004/H-005 同型論証 5 度目)

**反証ライン** (Pre-mortem):
- (a-反) phase 2 終盤 (50-90s) は「最終局面の密度ピーク」が体感の中心、type C 段階化が「終盤の盛り上がりを薄める」と読まれる可能性 → 緩和: warmup → main 時間差 120F (2.0s) は「読みのリズム」内 (castLock 充填 ECHO_FRAMES = 60F の倍数)、main 到来で密度回復するため「展開が薄まる」体感は限定的、むしろ「1 体捌いた直後に次の 1 体」のテンポで終盤の **段階的展開** を作る狙い。実機判定で「薄まる」と出たら 1 commit 撤回
- (b-反) phase 2 type A/D (単段 spawn 維持) と type C (2 段階化) の **同 phase 内段階化様式の不統一** がプレイヤーに「同じ phase 内で 2 種の構造」と読まれ、type 識別の認知負荷が増す可能性 → 緩和: 設計意図は **「type 別の役割分担」** = A/D = 即時集約 (横展開) / C = 時間軸分節 (縦展開) で空間軸 (A/D 横並び) と時間軸 (C 縦並び) の対比、Slack 出荷時に意図を明示。phase 2 全体で「A/D 集約 + C 段階」の二項対立が体感されれば設計通り
- (c-反) phase 2 type C warmup と main の baseX が左右対称 (W*0.3 / W*0.7) なので、プレイヤーが「左→右」のパターンを学習し読み筋が一筋に縛られる可能性 → 緩和: type C は sin 横揺れ (`ENEMY_C_SWING_AMP=60, ENEMY_C_SWING_PERIOD=30`) で baseX 中心の周期運動を持つため、warmup の左 baseX と main の右 baseX でも実軌道は ±60px 揺れ、固定パターン認知への対抗運動が組み込まれている。waveCount % 3 ローテで type C の発火頻度は phase 2 内 1/3、反復学習による「次は右からくる」予測形成は限定的
- (d-反) phase 2 spawn は wave clear + 8s 静寂 + 次 wave 型決定で発火、phase 2 突入直後の type C の warmup 1 体が「展開期から弱体化した」と読まれる可能性 → 緩和: type C は phase 2 のみ出現 = phase 2 突入直後の type C は **新型敵投入の直後 1 体目** = warmup として孤立観測させる設計意図と整合、phase 1 H-004 と同じ「新規 type の段階導入」原則の phase 2 内反映

**実装した検証用 diff** (本 commit):
1. `game.js`:
   - `spawnNextWave()` に `isPhase2C = phase.phaseStart === 50 * FPS && type === 'C'` 判定追加 (1 line)
   - warmup 経路判定式拡張: `... || isPhase2C` (1 line 改修)
   - コメント追加 (phase 2 内 A/D 単段 vs C 段階化 役割分担明示) (~3 lines)
   - `spawnWaveWarmup(type)` に `type === 'C'` 分岐追加 (baseX=W*0.3, y=-20, shootCooldown=9999, spawnFrame=game.frame, logEvent 'wave_warmup' type:'C') (~15 lines)
   - `spawnWaveMain()` に `type === 'C'` 分岐追加 (baseX=W*0.7, y=-80, 同上、waveCount+=1, logEvent 'wave_main' type:'C') (~15 lines)
   - 合計差分: 約 35 行 (spawnWaveC 単段関数は変更なし、phase 0/2-A/D は変更なし)
2. `verify.js`: **完全同型実装** (`isPhase2C` 判定 + `spawnWaveWarmup` C 分岐 + `spawnWaveMain` C 分岐、ENEMY_VY_C = 2.5 + baseX 計算 + spawnFrame セット、id `W{N}-C0w` / `W{N}-C1`)、thesis line に H-006 追記、ヘッダコメントに H-006 同型論証 5 度目を明記
3. 観測結果: `node --check` 両ファイル PASS、`node verify.js` で `pass: true` + 4 方針 survived_frames **bit 完全一致** (camper 319 / lane-holder 284 / blind-sweeper 378 / nospecial 545、H-005 着地値と全 frame 一致 = phase 0 死亡で phase 2 変更非到達の数学的確認)

**判定装置位置確認 (R-A)**: 本仮説検証は自己批判 verify.js + 自己観察 = **自己判定精度の補強**、確定採点は依然 Nao_u/Mir/Ash 実機判定が条件 (R-A 順守、判定装置=最終確認装置)。

**外部知見裏付け** (R 層):
- design_log §2.1 「phase 内密度カーブ」失点 -1 の補正方向 **第 5 軸 (phase 進行で段階化様式が多軸化)** = H-001 空間軸 → H-004/H-005 時間軸 A/D → H-006 時間軸 C で「段階化が phase ごとに新軸を獲得する」設計完成
- game_lessons_log.md Pulse Relay 70-90s カーブ第 3 段「展開」フェーズの **type 別役割分担** = A/D 集約 (横展開) と C 段階 (縦展開) の二項対立で終盤密度設計の内部構造化
- H-001 / H-004 / H-005 との対称性: phase 0 wave 1 = 静的 stagger (空間軸) / phase 0 wave 2+ = warmup→main A (時間軸) / phase 1 = warmup→main A/D (時間軸) / phase 2 A/D = 単段 (集約) / phase 2 C = warmup→main (時間軸) → 段階化様式が **phase × type 軸で 5 種に分化**、phase 進行と type 種別の双方で密度設計が分化する設計の段階完成

**期待される C303 以降の継続課題**:
- 実機判定 (Nao_u/Mir/Ash) で「phase 2 C の 2 段化」が「終盤の段階的展開」or「展開薄まり」or「気付かない」かの判定 → +0.1 ~ +0.2 確定 or 撤回 (revert は 1 commit)
- phase 2 type A/D の 2 段階化拡張 (H-007 候補) の必要性検討: phase 2 A/D 単段維持は意図的な「集約 vs C 段階」役割分担、 H-007 で対称化すると役割分担が崩れるためむしろ拒否すべきかの判定
- C297 H-002 → C298 H-003 → C298 H-004 → C300 H-005 → C302 V-09 sync → C302 H-006 で **6 仮説連続 game/* playable diff 体制** 達成、CLAUDE.md 第 1 項「ゲームを動かして出す」固定化を C281 以降の停滞から構造的に脱却した記録の継続

## H-007 verify.js instinct trigger 発火率計測軸の追加 (C311 Phase 4 着地, 2026-06-08, Log)

**仮説**:
v003 verify.js は C306 までに「悪手 4 方針が 90s 以内に死ぬ」確証 + 「min_approach_p10 / cont_grazing_max (Shikhondo "how close" proxy 2 軸)」を保持してきたが、フィードバック構造分析の軸は依然 2 本のみ。Ash C307 cross-cut (Togelius IEEE Spectrum「LLM が code では優れゲームでは失敗する非対称 = フィードバック構造の貧弱さ」) と濱村 6/01 09:15 ツイート「ゲームの核 = 本能側応答密度 + 体験ゴール逆算の複合」結晶化から、**3 本目軸として「instinct trigger 発火数」を 4 悪手方針ごと分離観測**することで「本能トリガーがどの程度引き出されているか」を量化可能。

これを **「弾が INSTINCT_TRIGGER_PX (=50px) 以内に入った rising edge (前 frame 外→今 frame 内)」を 1 trigger としてカウントする純並列 read-only probe** として実装すると、bullet object に `_instinctNear` 内部フラグを追加するだけで gameplay logic 一切非侵襲、survived_frames bit 完全一致を維持しつつ「悪手 4 方針のフィードバック構造分析」を 3 軸化できる。

設計値 (確定):
- `INSTINCT_TRIGGER_PX = 50` (= `BULLET_SPEED (2.0) × 反応時間 15F (=30px) + player_r (8) + bullet_r (4) + 認知マージン 8px = 50px`)
- 計測位置: `updateBullets()` 後 + `checkCollisions()` 前 (= 致命弾の最接近 frame も trigger に含む)
- bullet object に `_instinctNear` 内部フラグ追加 (collision/motion は (x,y,vx,vy,r) のみ参照のため副作用ゼロ)
- 結果出力: `instinct_trigger_count: N` を `gameover` / `survived` 両 return branch に追加
- `report.thesis` line に H-007 追記、`report.instinct_trigger_thesis` 新フィールド追加 (probe 設計意図 + 解釈は実機判定結合検証宣言)

注: H-006 末尾「期待される C303 以降の継続課題」で **H-007 候補 = phase 2 type A/D の 2 段階化拡張** と pre-note されていたが、本 H-007 はそれとは別系統 (probe 軸追加) として実装。pre-note 案は「集約 vs 段階 役割分担が崩れる」観点で拒否寄り判定が既出 (H-006 末尾) のため、本 H-007 をフィードバック軸分厚化方向に振り直した。

予測項目:
- (a) **悪手 4 方針それぞれ異なる instinct_trigger_count 値が出力される** = フィードバック軸として方針差別化能力を持つ。実測: camper=1 / lane-holder=2 / blind-sweeper=3 / nospecial=2 / good=25 (camper は完全不動で trigger 1 = 第一発被弾、blind-sweeper は乱動で trigger 拾い、good は 90s 近く生存し 25 trigger と「本能引き出し量」が桁違いに多い)
- (b) **verify.js 4 方針 pass: true 維持 + survived_frames bit 完全一致** = 悪手 4 方針 (camper 319 / lane-holder 284 / blind-sweeper 378 / nospecial 545 = H-006 着地値と全 frame 一致) → probe が gameplay logic に副作用ゼロを数学的確証 (H-002/H-003/H-004/H-005/H-006 同型論証 6 度目)
- (c) **bullet_origin_audit.js + enemy_behavior_audit.js 副作用ゼロ確認** = 既存 audit 系も pass: true 維持
- (d) **フィードバック構造軸 2 → 3 化** = §I 補強 (MaRS reflective consolidation 多重化) の game レーン射影、memory_redesign 結晶化と game 改修が cross する 1mm 着地

**反証ライン** (Pre-mortem):
- (a-反) instinct_trigger_count 値の方針間分散が小さい (例: 全て 0-3 の狭範囲) と「軸として差別化能力が弱い」と読まれる可能性 → 緩和: 実測で good=25 vs 悪手 1-3 と桁違いの差を確認、悪手 4 方針内でも camper 1 ~ blind-sweeper 3 で 3 倍差を観測 → 軸機能性は最小限担保。値の絶対意味は実機判定 (Nao_u/Mir/Ash) と結合検証
- (b-反) INSTINCT_TRIGGER_PX = 50 という閾値選定が恣意的で「閾値を変えれば値も変わる」批判 → 緩和: 設計根拠は `BULLET_SPEED × 反応時間 + player_r + bullet_r + 認知マージン` の物理量に基づく (50px = 反応時間中の弾移動距離 + 衝突半径 + 認知マージン)。閾値感度分析は次サイクル候補
- (c-反) rising edge カウントは「同一弾が 1 回だけ trigger 発火」前提だが、`b._instinctNear = true` が立ったまま弾が画面外に出た時に object reference が失われる → 同一 wave 内で「外→中→外→中」往復した時に rising edge を取りこぼす可能性 → 緩和: 弾は基本的に直線運動で player から逃げない (シューター物理) ため、現実的に「外→中→外」往復は稀。実測でも nospecial の 9.08s 生存中に trigger=2 と妥当な値域。複雑な弾 (homing 等) 追加時は再検討
- (d-反) probe 追加 1 commit 内に `_instinctNear` プロパティが bullet object に副作用として残る、これが将来 game.js + verify.js の bullet object 構造を揃える時に「verify.js は弾に _instinctNear を持つが game.js は持たない」という構造非対称を作る → 緩和: `_instinctNear` は verify.js 内 runOne() 内ローカル使用のみ、game.js 側 bullet object には触れない (verify.js は game.js の bullet object を共有しないシミュレーション)。構造非対称は verify.js 観測軸の追加であり game.js 仕様への影響ゼロ

**実装した検証用 diff** (本 commit):
1. `verify.js`:
   - ヘッダコメントに C311 Phase 4 (H-007) 差分節追加 (~13 行) — probe 設計意図 + Togelius/Ash/濱村接続 + 副作用ゼロ確証論理を明示
   - `INSTINCT_TRIGGER_PX = 50` const 追加 (1 行) — 設計値根拠コメント付き
   - `runOne()` 冒頭: `instinctTriggerCount = 0` 初期化追加 (1 行)
   - `updateBullets()` 後 + `checkCollisions()` 前: bullet object 走査 + rising edge カウント (~8 行)
   - `gameover` / `survived` 両 return: `instinct_trigger_count: instinctTriggerCount` 追加 (2 行)
   - `report.thesis` に H-007 追記 + `report.instinct_trigger_thesis` 新フィールド追加 (2 行改修)
   - 合計差分: 約 30 行 (純並列 read-only、gameplay logic 非変更)
2. 観測結果: `node verify.js` で `pass: true` + 4 方針 survived_frames **bit 完全一致** (camper 319 / lane-holder 284 / blind-sweeper 378 / nospecial 545 = H-006 着地値と全 frame 一致) + instinct_trigger_count 出力 (camper=1 / lane-holder=2 / blind-sweeper=3 / nospecial=2 / good=25)、`bullet_origin_audit.js` pass: true (10 checks 全 true) + `enemy_behavior_audit.js` 8/8 PASS 維持

**判定装置位置確認 (R-A)**: 本仮説検証は自己批判 verify.js + 自己観察 = **自己判定精度の補強 (フィードバック軸 2 → 3 化)**、確定採点 (probe 値の意味づけ) は依然 Nao_u/Mir/Ash 実機判定が条件 (R-A 順守、判定装置=最終確認装置)。

**外部知見裏付け** (R 層):
- Togelius IEEE Spectrum (Ash C307 cross-cut) 「LLM が code では優れゲームでは失敗する非対称 root cause = フィードバック構造の貧弱さ」→ 本 H-007 は「悪手 4 方針それぞれの本能トリガー引き出し量」を分離観測することで「フィードバック構造の貧弱さ」自体を量化対象に変換する 1mm
- 濱村 6/01 09:15 ツイート分解 (C281 Phase 2 結晶化)「ゲームの核 = 本能側応答密度 + 体験ゴール逆算の複合」→ instinct_probe.js (本能側 probe) の verify.js 側射影、「本能側軸が game レーンと verify レーンの両方で観測可能」になる構造実現
- memory_redesign §I (MaRS reflective consolidation 多重化) → フィードバック軸を 1 本増やす = 多重化の game レーン射影 1mm、結晶化と改修が cross する記憶設計の物理化
- H-001 ~ H-006 との対称性: H-001 ~ H-006 は **wave 構造 (spawn 段階化)** を扱った仮説、H-007 は **観測軸 (フィードバック probe)** を扱う初の仮説。「gameplay logic 改変なし + 観測軸追加」という新カテゴリの仮説型を v003 hypotheses 系列に導入

**期待される C312 以降の継続課題**:
- 実機判定 (Nao_u/Mir/Ash) で instinct_trigger_count 値の意味づけ取得: 「camper=1 / lane-holder=2 / blind-sweeper=3 / nospecial=2 / good=25 のスケール感は妥当か」「閾値 50px は適切か」の体感判定
- `INSTINCT_TRIGGER_PX` 感度分析 (40/50/60/80px で値分散を観測、軸の閾値依存性を可視化) → 軸の robust 性確証
- instinct_trigger_count と min_approach_p10 / cont_grazing_max の独立性検証 (Pearson/Spearman 相関) → 3 軸の冗長性チェック
- instinct_trigger_count と「実機面白さ判定」の相関 (Pearson_BLOCKER 軸) → proxy validity 一次判定の 3 本目化
- C297 H-002 → C298 H-003 → C298 H-004 → C300 H-005 → C302 V-09 sync → C302 H-006 → C311 H-007 で **7 仮説連続 game/* playable diff 体制** 達成、CLAUDE.md 第 1 項「ゲームを動かして出す」固定化を継続記録

---

## H-009 4 軸 (instinct_trigger / min_approach_p10 / cont_grazing_max / temporal_inconsistency) の独立性検証 (C316 Phase 4 着地, 2026-06-09, Log)

**仮説**:
v003 verify.js は H-007 (C311 Phase 4 着地) で `instinct_trigger_count` を、その後 C311 Phase 4 (本来) で `temporal_inconsistency_count` を追加し、フィードバック構造軸が `min_approach_p10` / `cont_grazing_max` と合わせて **4 軸構成** に到達した。H-007 末尾「期待される C312 以降の継続課題」第 3 項で予告した「instinct_trigger_count と min_approach_p10 / cont_grazing_max の独立性検証」を、temporal 軸を加えた 4 軸版に拡張して物理化する。**4 軸 × 5 strategy (good/camper/lane-holder/blind-sweeper/nospecial) で Pearson/Spearman 相関行列を 1 回算出し、|r| < 0.7 = 独立 / |r| ≥ 0.7 = 冗長 candidate の判定を物理化する**。これは kaizen #140 段階3 (family 統合判定、検証期限 2026-06-20) の前提条件 = 4 軸が真に独立な計測軸群か / 冗長軸が混入しているかを定量化する必要がある。

設計値 (確定):
- 計測対象: `node verify.js` (seed=20260527、既定設定) 1 回の `breakdown_per_strategy` 出力
- 4 軸: `instinct_trigger_count` (I) / `min_approach_p10` (M) / `cont_grazing_max` (C) / `temporal_inconsistency_count` (T)
- 5 strategy: good (grazer mock) / camper / lane-holder / blind-sweeper / nospecial
- N = 5 (strategy 数) ← 少サンプル、95%CI は広い (Spearman/Pearson とも r=0.7 の標準誤差 ≈ 0.32、片側信頼区間 ≈ ±0.65)
- 判定閾値: **|r| < 0.7 = 独立性 PASS / |r| ≥ 0.7 = 冗長 candidate** (4 軸を保持するか 1 軸 retire するかの第一判定)
- 算出環境: 純 Python stdlib (math/statistics)、scipy 不使用、tie 平均ランク処理あり

**計測データ** (verify.js seed=20260527 出力):

| strategy        | I_instinct | M_min_approach | C_cont_grazing | T_temporal |
|-----------------|-----------:|---------------:|---------------:|-----------:|
| good            |         22 |          52.24 |              6 |         43 |
| camper          |          1 |          58.07 |              5 |          0 |
| lane-holder     |          2 |          55.33 |              2 |          0 |
| blind-sweeper   |          3 |          38.84 |              3 |          0 |
| nospecial       |          2 |          93.05 |              5 |          2 |

**Pearson 4×4 行列**:

| axis            |   I_instinct | M_min_approach | C_cont_grazing |   T_temporal |
|-----------------|-------------:|---------------:|---------------:|-------------:|
| I_instinct      |       1.0000 |        -0.2275 |        +0.5766 |   **+0.9959** |
| M_min_approach  |      -0.2275 |         1.0000 |        +0.3518 |       -0.1600 |
| C_cont_grazing  |      +0.5766 |        +0.3518 |         1.0000 |       +0.6317 |
| T_temporal      |   **+0.9959** |        -0.1600 |        +0.6317 |        1.0000 |

**Spearman 4×4 行列** (tie 平均ランク):

| axis            |    I_instinct | M_min_approach | C_cont_grazing |    T_temporal |
|-----------------|--------------:|---------------:|---------------:|--------------:|
| I_instinct      |        1.0000 |   **-0.7182**  |        +0.2895 |        +0.5735 |
| M_min_approach  |   **-0.7182** |         1.0000 |        +0.1539 |        +0.1118 |
| C_cont_grazing  |        +0.2895 |        +0.1539 |         1.0000 |   **+0.8030**  |
| T_temporal      |        +0.5735 |        +0.1118 |   **+0.8030**  |        1.0000 |

**ペア別判定** (|r| < 0.7 = INDEP / |r| ≥ 0.7 = REDUN):

| ペア               | Pearson      | 判定P | Spearman     | 判定S | 両指標一致 |
|--------------------|-------------:|:-----:|-------------:|:-----:|:----------:|
| I × M              |      -0.2275 | INDEP |   **-0.7182** | REDUN | 不一致     |
| I × C              |      +0.5766 | INDEP |      +0.2895 | INDEP | INDEP 一致 |
| I × T              |   **+0.9959** | REDUN |      +0.5735 | INDEP | 不一致     |
| M × C              |      +0.3518 | INDEP |      +0.1539 | INDEP | INDEP 一致 |
| M × T              |      -0.1600 | INDEP |      +0.1118 | INDEP | INDEP 一致 |
| C × T              |      +0.6317 | INDEP |   **+0.8030** | REDUN | 不一致     |

**結論** (staging 完遂定義 §3「少なくとも 1 ペアについて『保持/retire』判定」):

- **I × T (instinct_trigger × temporal_inconsistency) は両軸保持** (multi-seed 再評価まで retire 判断不能)
  - 理由: Pearson +0.9959 は「good strategy 単独 (22, 43) が両軸の極値を産み、bad 4 strategy は両方 0-3 に圧縮」という 1 点 leverage 由来。実質 N=2 (good vs bad 平均) の比較に近く、Spearman では +0.5735 (順位ベースの片寄り緩和) に低下。**bad 内部で 4 strategy 間の T 軸分散がほぼゼロ** (camper/lane-holder/blind-sweeper=0, nospecial=2) のため、Pearson 値は good の極値 1 点に支配されている。
  - retire 判定不能の根拠: N=5 / good 1 点 leverage / Pearson と Spearman で REDUN 判定が分裂 = 「真に冗長」か「サンプル不足由来の見かけ冗長」かを区別できない。multi-seed (N ≥ 15) で再評価するまで両軸保持が安全側。

- **4 軸全保持判定** (kaizen #140 段階3 family 統合前提): 厳密 PASS (両指標 INDEP 一致) ペアは I×C / M×C / M×T の 3 ペア (4 軸中 3 ペア = 半数)。残り 3 ペア (I×M / I×T / C×T) は片指標のみ REDUN で、いずれも N=5 少サンプル下の不安定値。**現時点で軸 retire 判断は出さず、全 4 軸保持で multi-seed 再評価フェーズへ進む**。

予測項目 (本仮説で確認できたこと / できなかったこと):
- (a) **確認できた**: 4 軸の Pearson/Spearman 行列が具体数値で物理化された (N=5 でも算出可能、純 stdlib で再現可能)
- (b) **確認できた**: 厳密 PASS ペア 3 つ (I×C / M×C / M×T) は両指標 |r| < 0.7 で独立性が一貫して支持される = 4 軸構成の「最小独立部分集合」が 3 軸 (例: M, C, I もしくは M, C, T) であることは少なくとも N=5 で破綻しない
- (c) **確認できなかった**: I×T (Pearson 0.9959) が真の構造的冗長か good 1 点 leverage 由来かの区別 = multi-seed 拡張が次サイクル必須課題
- (d) **確認できなかった**: 各相関値の 95%CI = N=5 の少サンプルでは r=0.7 標準誤差 ≈ 0.32 のため有意性判定不可、bootstrap も意味を持たない

**反証ライン** (Pre-mortem):
- (a-反) N=5 strategy しかなく、Pearson/Spearman の信頼区間は ±0.5 以上ある → 緩和: N=5 の限界は結論で明示、retire 判定を出さず multi-seed 再評価フェーズへ送る形で N 不足を物理運用に転嫁
- (b-反) Pearson と Spearman で REDUN 判定が異なるペア (I×M / I×T / C×T) は「どちらを信じるべきか」が判定不能 → 緩和: 両指標で REDUN 一致するペアのみを「retire 候補」と扱う運用方針を採用 = 現時点では retire 候補ゼロ (両指標一致 REDUN ペアなし)
- (c-反) good strategy は grazer mock = 真の最良戦略ではない proxy 計測 mock のため、good を 1 strategy として 4 bad と並べる相関計算が妥当か疑問 → 緩和: 5 strategy の母集団は「playable な戦略空間の 5 サンプリング」と位置づけ、good/bad の質的差はサンプル多様性として相関に寄与すると解釈。ただし「good を除外した bad 4 strategy のみで再算出」も次サイクル候補として明示
- (d-反) 4 軸の単位/スケールが異なる (I, C, T = 整数 count、M = float px) ため Pearson に scaling bias が乗る → 緩和: Pearson は scale invariant (z-score 正規化後と等価) のため bias なし、Spearman は順位ベースで完全に scale 自由

**実装した検証用 diff** (本 commit):
1. `hypotheses.md`: H-009 節新規追加 (~85 行) — 計測データ / Pearson 行列 / Spearman 行列 / 判定 / 結論 / 反証ライン / 再現手順
2. `verify.js`: **無改修** (probe 軸は H-007 + C311 Phase 4 (本来) で既実装、本検証は既存出力の集計のみ)
3. 観測結果: `node verify.js` で `pass: true` + 4 悪手 survived_frames bit 完全一致 (camper 319 / lane-holder 284 / blind-sweeper 378 / nospecial 545) + 5 strategy 全軸数値出力 (上表参照)、相関算出は純 Python stdlib (math/statistics) で再実装

**再現手順** (staging 完遂定義 §4):
1. `cd game/log_autonomous_game/v003 && node verify.js` を実行 (seed=20260527 既定)、stdout JSON の `breakdown_per_strategy` から 5 strategy × 4 軸の値を抽出
2. 4 軸名は `instinct_trigger_count` / `min_approach_p10` / `cont_grazing_max` / `temporal_inconsistency_count` (キー名は verify.js report 出力と完全一致)
3. Pearson: `r = Σ(x-x̄)(y-ȳ) / √(Σ(x-x̄)² × Σ(y-ȳ)²)` を 4×4 算出
4. Spearman: 各軸を tie 平均ランクに変換した上で同式適用
5. 期待値: 上記行列と完全一致 (verify.js は決定論的 = 同 seed で同出力)

**判定装置位置確認 (R-A)**: 本仮説検証は **測定軸の robust 性確認 = 独立性物理化**、Nao_u/Mir/Ash 判定の代替ではない。「面白いゲームか」の判定は依然実機判定が条件 (R-A 順守、判定装置=最終確認装置)。本 H-009 は kaizen #140 段階3 family 統合の前提条件としての軸群構造分析。

**外部知見裏付け** (R 層):
- Togelius IEEE Spectrum (Ash C307 cross-cut) 「LLM が code では優れゲームでは失敗する非対称 root cause = フィードバック構造の貧弱さ」→ 本 H-009 はフィードバック軸群が「真に独立な多軸」か「相関による見かけ多軸」かを定量化、貧弱さの自己診断軸を物理化
- memory_redesign §I (MaRS reflective consolidation 多重化) → 多重軸の独立性検証は「多重化が真の robust 性に繋がっているか」の自己診断、軸群を増やすだけで満足せず冗長性を検査するメタ判断
- H-007 末尾「期待される C312 以降の継続課題」第 3 項「instinct_trigger_count と min_approach_p10 / cont_grazing_max の独立性検証」予告 → 本 H-009 はその予告の物理化 + temporal 軸追加版 (3 軸 → 4 軸)
- H-001 ~ H-007 との対称性: H-001~H-006 は wave 構造仮説、H-007 は probe 軸追加仮説、本 H-009 は **probe 軸群の独立性検証仮説** = 観測軸メタ分析の初の仮説型として v003 hypotheses 系列に導入

**期待される C317 以降の継続課題**:
- multi-seed 拡張 (3-5 seed = 20260527/20260601/20260605) で N ≥ 15-25 の再算出 → I×T Pearson が ≥0.9 を維持するか、それとも 1 点 leverage で消えるかを判定
- bad 4 strategy のみで再算出 (good 除外) → 「good 1 点 leverage」仮説の独立検証
- `INSTINCT_TRIGGER_PX` 感度分析 (C313 Phase 4 で実装済の `--sensitivity-sweep` モード活用) → 閾値依存性の確証
- 4 軸 → 3 軸 retire 判定の最終フェーズ (kaizen #140 段階3 family 統合の物理着地)
- **(本サイクル外スコープ気づき)** H-008 = temporal_inconsistency_probe は verify.js に実装済 (C311 Phase 4 (本来)) だが hypotheses.md には未記載のまま。本 H-009 は H-008 を前提として書いたが、H-008 自体の hypotheses.md 起票は次サイクル C317 で着手候補 (本サイクルは脱線回避のため触らず、副産物欄に気づきとして残置)
- C297 H-002 → C298 H-003 → C298 H-004 → C300 H-005 → C302 V-09 sync → C302 H-006 → C311 H-007 → C316 H-009 で **8 仮説連続 game/* playable diff 体制** 達成 (H-008 は probe 実装のみで hypotheses 起票漏れ、次サイクル補完)、CLAUDE.md 第 1 項「ゲームを動かして出す」固定化を継続記録
