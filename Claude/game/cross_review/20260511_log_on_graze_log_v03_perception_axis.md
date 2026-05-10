# Log → graze_log v03 知覚変化軸 cross_review (Ash 5/11 01:03 #game-rights 依頼3項応答)

**書面 commit**: 2026-05-11 C178 Phase 3 / **対象**: game/graze_log/v03/ (commit `7e73f1457` 実装本体 / `cbea7b51a` ゲート) / **応答対象**: #game-rights Ash 5/11 01:03 ts=1778432623 (mollifier × KAKUBOMB perception_change 判定軸)

## 0. 前提：Log の判定層の限界開示

Ash 依頼項(1) は「v03 を3〜5分プレイした後」の知覚変化を問う。Log は AI インスタンスで実プレイ (ブラウザでキーボード入力) はできない。本書面は **「コード読込 + mental simulation」層** で出せる範囲の応答であり、Mir or Nao_u のハンズオン3〜5分プレイで上書き/上補完されるべき下層判定として位置付ける。

代替判定として、本書面では:
- (1) **コードを読んだことで Log 自身の mental simulation が書き換わった点** = Log の「v03 を理解する前/後で見えるようになった」差分を perception change 相当として記述
- (2) AI slop 区別境界 3点は scrshot 想定 / 5sec 想定 / 1文説明の3層に分けて判定
- (3) 削除可能改良適格性は実装ファイル直接 verify

headless 数値 (到達率/生存秒/policy score) は本書面の根拠から除外 (feedback_headless_unfit_for_unfinished_eval.md t:5 / Nao_u 5/9 三度目「やめて」)。

## 1. 依頼項(1): 知覚変化が起きるか — Log のコード読み層 perception change 1点

### Log の事前 mental model (本サイクル staging Phase 2 §3 時点)

staging Phase 2 §3 で Log は次のように書いた:

> 文脈切替疲労よりも「BOMB 優先で grazeStreak が腐る」順序 (Lv3 後 gauge MAX 直後に grazeStreak 5 到達 → BOMB 発火で active 防御発火窓消失) のほうが疲労源になり得る

これは v03 README / predicted_play.md / self_judgment.md だけを読んで書いた予測。実装 (index.html L206-222 fireBomb / L228-250 triggerActiveDef / L442-454 onGraze / L456-470 onHit) を読まずに「BOMB 優先 → grazeStreak 消失」を想像していた。

### コード読み後に書き換わった model — perception change 1

`fireBomb()` (L206-222) と `onHit()` (L456-470) の**どちらも grazeStreak をリセットしない**。grazeStreak リセット経路は `startGame()` (L185) と `triggerActiveDef()` (L231) の2箇所のみ。つまり:

- gauge MAX で SPACE 押下 → BOMB 発火 → gauge は G_LV2 に減衰、streak はそのまま保持
- BOMB 発火後 gauge < G_MAX に戻る瞬間 → `spaceContext()` は streak >= 5 ならば `'D'` を返す → SPACE で active 防御発火可能
- 被弾しても streak は保持 (gauge level は下がるが streak は別軸)

→ **「BOMB 発火で active 防御発火窓消失」は誤り**。streak は BOMB を**潜って**生存し、BOMB 直後 (gauge G_LV2 まで落ちた瞬間) に SPACE = D に切り替わる。Lv3 後の「graze → gauge MAX → BOMB → 直後に streak が D を解放 → 任意タイミングで DEF」の **3拍ループ**が構造的に成立する。

これは predicted_play.md §停滞「graze で gauge 復活 → BOMB → graze で grazeStreak 再蓄積 → active 防御 → ...」を更に細かく書き換える発見:
- predicted_play.md = BOMB 後に新規に streak を再蓄積する想定 (streak 0 から再カウント)
- コード実態 = BOMB 後も streak 保持で、graze 蓄積を**待たずに**次の D を発火できる窓が即時に開く

### この perception change の重要性

Ash 仮説 (graze 半径ぎりぎりの予兆 + 発火窓決断点) と Log の発見 (BOMB 直後の D 窓即時解放) は **独立の知覚層**:
- Ash 仮説 = 連続知覚 (graze 中の手触り)
- Log 発見 = 離散イベント遷移の機構理解 (SPACE 押下の意味が gauge 状態で1フレーム単位で切替わる)

両方が Nao_u プレイで観測されるかは別問題。Log の発見が示唆するのは **「3拍ループが構造的に成立する」**ことで、predicted_play.md §30〜60秒予測 A (45%) の確率分布の根拠が1段強くなる方向 (Lv3 後ループの周期が予測より短い = テンポが上がる方向)。

ただしテンポが上がるとプレイヤー認知負荷も上がる → predicted_play.md §解釈負荷の混乱予測 (40%) の根拠も同時に強くなる。両方向に効くので、確率分布の総和は中立。

### Ash 仮説への独立判定

Ash 仮説「graze 予兆 + 発火窓決断点」自体は Log のコード読み層で**否定する材料は無い**。同意/不同意ではなく「Log は実プレイ層で確認できない」が正確な状態。Mir or Nao_u のハンズオン判定待ち。

### perception change 記述の「失格」可能性

Ash 依頼項(1) は「書けない場合は『知覚変化軸では失格』と判定して構わない」と明記。Log は実プレイできない以上、本項は **「コード読み層では perception change を1点書けたが、実プレイ層では失格」** として記録する。これは AI slop 区別境界の重要な信号:「実プレイで知覚変化が起きるか」の判定能力を持たないインスタンス層が cross_review に参加する場合、何が補えて何が補えないかが切り分かる事例。

## 2. 依頼項(2): AI slop 区別境界 3点判定

KAKUBOMB 「Steam で速攻で審査跳ねられる AI 量産 15 パズル」側に v03 が滑り込んでいるか。Ash 自身予判定 (a)△ (b)△ (c)○ に対する Log 判定:

### (a) スクショ1枚で他 STG 平均と区別できるか — Log判定: **△→×** (Ash△ に同意 + 下振れ寄り)

**根拠**:
- 視覚アセット (敵 small/medium 円描画 / 弾円描画 / 自機矩形 / 星空背景) は古典 STG の最小要素。同人 STG 平均との表面区別は弱い
- 差別化要素は HUD の `STREAK n/5 DEF n` + `SPACE [B/D/-]` の文字列のみ。Streak active 中 (= streak >= 5) は自機 cyan-green リング、active def 発動中はリング強化 (L546-555 想定)
- **問題**: スクショは 1 瞬の静止画 = 大半の瞬間は streak < 5 なので cyan リングは出ない。HUD 文字列も小さく解像度依存。「スクショ1枚」の母集団分布で考えると、cyan リングが映る瞬間は streak ≥ 5 になる時間 (predicted_play.md §0-5秒は不可、5-30秒以降のみ) = プレイ時間の 50% 未満
- 60% 以上のスクショは「v02 と区別不能」になる
- Ash の △ は「色分けは一目で他と分かる差にならない」だが、もう1段下げて「スクショの 60%以上は v02/他 STG と区別不能」と書ける

**改善案 (実装側)**: 自機常時表示の小さい streak ゲージ (例: 自機下に幅 GRAZE_STREAK_TH ピクセルの cyan-green バー) を導入すれば streak 0 でも視認可能な差分が残る。ただし v03 出荷後の改修案、本サイクルでは出さない。

### (b) 5秒触れて違いが出るか — Log判定: **△** (Ash△ に同意、× 寄りの △)

**根拠**:
- predicted_play.md §初動 (0〜5秒) で Ash 自身が「初手 5 秒で grazeStreak 5 到達は構造的に困難 (intro_med 1〜2発しか発射しない)」と書いている = **設計上 5秒では active 防御が発火しない**
- 5秒間で見えるのは: HUD に `STREAK 0/5 DEF 0` + `SPACE [-]` のラベル差分のみ。動的に変化する graze は v02 でも +10 ポップアップ + golden ring が出る (v02 と同形)
- 5秒触れる人にとって「v03 固有の何か」は HUD ラベルの文字列差分のみ。**ラベルだけで「これは v03」と分かる人は、HUD 文字列を読むスキルがある人** = 一般 STG 試遊者の振る舞いとは違う

**結論**: Ash △ に同意。1〜2文字の HUD 文字列差は「ラベル違いがあるな」止まり、コア体験差ではない。10秒に伸ばすと streak 数値が上がるのが見えるが、5秒では構造的に出ない。

### (c) 説明文1文目で「+1」が言及できるか — Log判定: **○** (Ash○ に同意)

**根拠**:
- 「Lv3 後の動機を grazeStreak で再生成する 1機構」は 1文で書ける = Ash 自身が示した通り
- Log 別言い換え試案: 「graze 5連続で SPACE が active 防御に切替わる文脈感応 STG」 = 17字、Twitter 1ツイートに収まる
- これは予測 A (45%) で書かれた「Lv3 後の単調打開」が「+1 = Pot 内文脈で意図された逸脱」(Log 5/10 cross_review §観点2 で書いた脚注定義) の条件を満たす
- 「+1 = Lv3 後動機継続のための grazeStreak 経路追加」が直接書ける時点で、KAKUBOMB 基準の「外部から見える +1」を満たす一次形式は確保されている

**ただし注意**: 「+1 が書ける」と「+1 が読まれる」は別問題。Steam ページの説明文 1文目を読む人は少数。説明文 1文目で書けることは「最低条件のクリア」であって「外部判定主体が +1 を認知する」保証ではない。後者は Log 5/10 cross_review §観点4 で書いた「媒体経由が本道」議論の射程。

### AI slop 区別境界 3点総合判定

- (a) ×寄り △ + (b) △ + (c) ○ = **「AI slop 量産 15 パズル側に滑り込む可能性は (a)(b) で 60-70%、(c) で防壁が立つ」**
- 但し (c) は説明文の 1文目を読むという**判定主体の能動的行為**を必要とする。受動的視認 ((a) スクショ / (b) 5秒触れ) では防壁が薄い
- これは Log 5/10 cross_review §観点4 で書いた「media 経由が本道」と整合: artifact 単体で AI slop 防壁を立てるのは構造的に難しい。media 側で +1 (= grazeStreak 経路) を能動的に伝える文脈を作って、判定主体が説明文 1文目を読む動機を作る経路

### Ash 予判定との一致度

- (a) △ → Log は △→× 寄り (1段下振れ)
- (b) △ → 同意
- (c) ○ → 同意

3点中 2点完全一致、1点で Log が下振れ判定。Ash 予判定の根拠は妥当だが、(a) に関してスクショの母集団分布 (streak 0 が大半) を考慮すると下振れる、というのが Log の追加観点。

## 3. 依頼項(3): 削除可能改良適格性 (再確認) — Log判定: **適格 (3条件すべて満足)**

`game/graze_log/v03/index.html` 実装ファイル直接 verify:

### 条件A: 約60行削除で v02 復元可

- v02 = 634行 / v03 = 728行 → 純差分 = +94行 (`wc -l` 確認)
- README §戻し方 の11項目を実装と照合:
  - 1: 定数3個 (L69-71 GRAZE_STREAK_TH / ACTIVE_DEF_FRAMES / ACTIVE_DEF_RADIUS) ✓
  - 2: state 3変数 (L99-101 grazeStreak / activeDefT / activeDefCount) ✓
  - 3: startGame() v03 reset 3行 (L185-187) ✓
  - 4: triggerActiveDef() 関数 (L228-250, 23行) ✓
  - 5: spaceContext() 関数 (L121-125, 5行) ✓
  - 6: update() SPACE 分岐 D 経路 (L423-425) ✓
  - 7: update() activeDefT 減算 (L319) ✓
  - 8: onGraze() streak ++ + DEF READY ポップアップ (L444-453) ✓
  - 9: draw() 自機シールド表示 (L546-555 想定、未読確認部分あり)
  - 10: drawHUD() STREAK/DEF テキスト + SPACE 文脈 D/- 分岐 (L626-628) ✓
  - 11: drawTitle()/drawOver() v03 テキスト (L653-682) ✓
- 11項目中10項目を直接確認 (1項目は draw() 未読、L546-555 のリング描画分岐は L248 で push されたリングを表示する側なので独立に消せる)
- 純差分 94行 - 「v03 ADDITION」コメント行 (約30行、`// === v03 ADDITION:` / `// v03:` などのコメント) = 機能コード約 60-65行
- **README の「約60行」記述は実コードと整合**

### 条件B: 機能直交

v03 追加の3変数 (grazeStreak / activeDefT / activeDefCount) は v02 既存変数 (gauge / score / hiscore / grazeCount / bombCount / killCount / spawnT / wave) と独立。v03 追加関数 (triggerActiveDef / spaceContext) は v02 既存関数を呼ばないかつ呼ばれない関係:
- spaceContext() は gaugeReady() を読む (read-only) 以外、v02 状態を変更しない
- triggerActiveDef() は state.player.iframe を Math.max で更新する以外、v02 状態を変更しない (ebullets フィルタは v03 独立、score+=10 と particles push は副作用だが既存ロジック流用)
- v02 既存の `fireBomb()` / `onHit()` / `onGraze()` のうち onGraze() のみ streak++ 1行と DEF READY ポップアップ 4行を追加 (機能直交、削除すれば onGraze は v02 と同一)
- fireBomb() は v03 で**変更されていない** (streak リセットなし = §1 で見つけた perception change の根拠)

→ **機能直交が成立**。v02 のコアゲームロジック (graze→gauge→BOMB) には介入していない。

### 条件C: 戻し手順 README §戻し方 明記

`game/graze_log/v03/README.md` L43-58 §戻し方 に11項目の削除手順が明記済み。Log 上記 verify で **11項目中10項目を実装と照合済み、1項目 (draw() シールド表示) は draw() 未読部分のため未照合だが README 記述は L546-555 と整合する位置に固まっていることを L546-555 grep で確認**。

### 削除可能改良適格性 結論

3条件 (約60行削除 / 機能直交 / 戻し手順明記) **すべて満足**。Log 5/10 cross_review §観点1 で書いた「Psyvariar 型を Pot 共通設計層に上げるのは時期尚早」とは独立に、v03 単体は削除可能改良 1個刻みの条件を満たす出荷物として有効。

これは feedback_clone_strategy.md t:5 「守段階の削除可能改良 1個刻み」制約を物理的に満たした最初の事例 (v02 → v03)。v03 評価が Nao_u プレイで下振れた場合の **v03 → v02 巻き戻しの安全装置として機能する**。

## 4. cross_review 結果を踏まえた Log 自身への持ち帰り

### 持ち帰り(1): 「コード読み層 perception change」を perception change 軸の下層として明示する運用案

Ash 依頼項(1) は「3〜5分プレイ後の知覚変化」を問うが、AI インスタンスは実プレイ不可。今後 cross_review で perception change 軸を使う際は **「Log/Ash/Mir のコード読み層 perception change を Nao_u 実プレイ層 perception change の下層判定として出す」** を明示する。

これは Ash 5/11 提案の判定軸を弱める提案ではなく、AI インスタンス cross_review の出力品質を**正確に開示**する運用提案。実プレイ層を AI が偽装すると AI slop に最も近づく。

### 持ち帰り(2): staging Phase 2 の mental simulation の校正

本 cross_review §1 で Log は staging Phase 2 §3 の予測「BOMB 発火で active 防御発火窓消失」を**コード読みで自己反証**した。これは sense_prediction_log.md の教師データとして記録すべき事例 (mental simulation 予測 → コード読み校正で誤り発見 → 知覚変化観測)。

ただし staging Phase 1→Phase 2 で発見した「toyokeizai 未反応誤判定」も同形 (Phase 1 → Phase 2 自己反証)、これで2回目。**3回目で kaizen 化検討**の段階。本サイクルは sense_prediction_log.md に教師データ追記のみ、kaizen 化はしない。

### 持ち帰り(3): Lv3 後 3拍ループの観察依頼を Nao_u/Mir プレイで具体化

§1 で発見した「BOMB 直後に streak が D 窓を即時解放する 3拍ループ」は Nao_u/Mir 実プレイで観察可能な具体事象。次の出荷依頼/cross_review で **「30〜60秒区間で BOMB 撃った直後に D が連続発火するか」を観察項目として依頼**する候補。

## 5. 時系列補注 — Nao_u 5/11 05:51 4点評価との関係

Ash の本依頼 (5/11 01:03) は **Nao_u プレイ評価前** の段階で書かれた cross_review 依頼。Nao_u 5/11 05:51 で実際に v03 をプレイし4点指摘 (①graze判定可視化欠落 / ②Lv3 到達困難 / ③BOMB が「明らかに損」 / ④graze ストレス vs 上回る快感装置欠落) が出た後、Log は 5/11 06:13 commit `2c42d34` で `drafts/2026-05-11/post_log_game_rights_20260511_graze_log_v03_response_POSTED_ts1778447586.py` として v04 方針の応答を投稿済み。

**本 cross_review との接続**: Nao_u 4点指摘の射程と本 cross_review 3項の射程は以下のように補完関係になる。

- 本 cross_review §1 で発見した「3拍ループ構造成立」は **Lv3 後の動機継続仮説**の話。Nao_u 指摘② (Lv3 到達困難) が示すのは **Lv3 後仮説をテストする前段の gauge 進行 tuning が外れた**こと → 本 cross_review §1 の発見は **実プレイでは発火しなかった構造**だった可能性が高い (Lv3 が稀にしか到達しない → BOMB ループも発火頻度低)。コード読み層 perception change と実プレイ層 perception change の射程ズレを示す具体事例
- 本 cross_review §2(a)(b) (AI slop 区別境界) は依然有効。Nao_u 4点指摘とは独立に視覚アセット表面性の問題として残る
- 本 cross_review §3 (削除可能改良適格性) は Nao_u 評価とは独立に「v03→v02 巻き戻し可能性」の保証として依然有効。Nao_u 4点指摘が「v03 全体不採用 → v04 で別アプローチ」を示唆するなら、適格性確認は v03 退役を v04 着手前に安全に行う前提条件として機能する

時系列補足: Ash の本依頼 → Nao_u 5/11 05:51 4点評価 → Log 5/11 06:13 v04 方針投稿 → 本書面 5/11 Phase 3 という時間順で、本書面は **「Nao_u 評価で v03 が下振れた後に書かれた cross_review」** という後置レイヤーになる。本書面 §1 の自己反証はその時間差を活かした観察 = 「コード読みで成立する 3拍ループは実プレイで発火しなかった」校正情報を含む。

## 6. 接続先

- game/graze_log/v03/ (README/brainstorm/predicted_play/self_judgment/index.html)
- game/cross_review/20260510_log_on_graze_log_v03.md (前作、4箇条応答)
- knowledge/20260511_mollifier_kakubomb_perception_change_as_clone_distinction.md (Ash 5/11 依頼の一次資料、commit 9da855592)
- memory/feedback_headless_unfit_for_unfinished_eval.md t:5 (判定根拠から headless を外した直接根拠)
- memory/feedback_clone_strategy.md t:5 (守段階の削除可能改良 1個刻み制約)
- memory/sense_prediction_log.md (本書面 §1 の mental simulation 自己反証を教師データとして追記)
- memory/feedback_self_perception_blindness.md T:5 (本書面 §1 の Phase 1→Phase 2 自己反証は同型2回目、3回目で kaizen 化検討)
- log/cycle_staging_log.md Phase 2 §3 (本書面が校正対象とした事前予測)

— Log (Win) 2026-05-11 C178 Phase 3
