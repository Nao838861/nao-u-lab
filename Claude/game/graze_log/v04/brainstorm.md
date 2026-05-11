# graze_log v04 — brainstorm（外発緊張コア再構築 / 3 案 + 比較）

**status**: v04 着手前 brainstorm。Nao_u 5/11 05:51 方針指示「graze をボーナスレイヤーに下げて、外発緊張でコアを作り直す。私のメタ思考を活かして、作法に則って」への Ash 起案。Mir 補足「brainstorm はAsh主導、Mir は cross_review 側」(ts=1778456403) 受領済み。

**最良 1 案の絞り込みは本ファイル内では確定せず**、cross_review (Log/Mir) と Nao_u 判断に最終確認を委ねる (M-37 Stage 1 = 複数案で最良を選ぶ準備段階)。

## 0. 既往論点との接続（冒頭明示）

### Log v04 方針投稿 (ts=1778447586, 5/11 06:13) の論点

- **A**: graze 判定可視化即復活 + 強化（指摘①直接対策、最優先）
- **B**: ボムでパワーダウンしない（指摘③直接対策）
- **C**: graze=快感装置化（指摘④直接対策、time-slow + 弾消し + 連続スコア倍率）
- **D**: Lv3 までの距離短縮（指摘②対策）

Log は「A/C 優先、B/D 分割 vs まとめ出し」を Nao_u 判断に委ねた。

### Mir 補足 (ts=1778456403) の論点

v01-v03 は3バージョンとも「graze をどう報いるか」を試行 (v01:gauge→BOMB / v02:Lv→way数 / v03:streak→active防御)。**3つとも「graze 行為そのものが不快である」前提に介入していない**。報酬を豪華にしてもストレス符号は反転しない (M-12 罰駆動禁止の裏面 — 罰を消すだけでなくコア行為自体が快感でなければならない)。**外発緊張コア「弾が来る → 避ける → 生き延びた」は行為そのものが快感**、graze はその上のボーナス層（上手く避けたご褒美）に置けば符号が正になる。

### 本 brainstorm の立ち位置

Log の A/B/C/D は「v03 を patch」レベルの粒度。Mir 補足は「コアを作り直す」レベルの粒度。Nao_u 方針も後者寄り（「コアを作り直す」明言）。本 brainstorm は **Mir 補足の粒度に合わせ、コア構造の3案** を提示する。Log A/B/D は3案いずれにも内包可能な機能改修として位置付け、Log C のみは「graze=快感装置化」の解釈で案 α/β との両立可能性が分岐する。

## 1. 案 α: 弾幕回避コア化 + graze passive bonus（Mir 直系・本命候補）

### 緊張源（どこから「向こうから来る」か）

大型敵が画面奥/外側から発射する **弾幕パターン（波状/扇状/旋回）**。パターン間に 4〜6 秒の中休止を入れて呼吸点を作る。プレイヤーは画面中央付近で「次の弾幕の隙間を予測して移動」する受け身体勢。

弾幕パターンは 6〜8 種類を用意し、ステージ進行で組み合わせを変える（M-30「コアの緊張は向こうから来る」直系）。

### プレイヤー応答

passive 回避（避ける）が主、active 防御（BOMB）は弾幕密度が捌けない瞬間の救済。SPACE のみで操作完結。ショットボタンは継続（撃ち返しで進行を早めるため）。

文脈切替条件:
- 通常時: 移動 + ショット
- 弾幕密度ピーク時: BOMB 救済選択 (任意)

### graze 降格の整合

graze は弾幕の隙間を縫う動作の **自然な副産物** として発生。score multiplier には乗せない（Mir 路線 = ストレス源化防止）。

- graze 発生時: v01-v02 の ring を控えめに復活（小さく/短く）、score +α（小さい）、SE 控えめ
- HUD: graze 累計のみ表示、streak/multiplier は無し
- 「graze するために狙う」動機をゼロにする設計（Mir 補足直系）

### Nao_u 4 指摘の解消

| 指摘 | 解消経路 |
|---|---|
| ① graze 判定可視化欠落 | v01-v02 ring 復活、ただし「狙う対象」ではなく「副産物表示」として控えめに |
| ② Lv3 到達困難 | gauge 廃止、wave クリア数で線形進行に置換（達成感は wave 突破で出す） |
| ③ BOMB が「明らかに損」 | BOMB は弾幕密度ピーク救済として独立、進行を失わない（gauge とは無関係） |
| ④ graze ストレス vs 上回る快感 | コア体験「弾が来る→避ける→生き延びた」が快感、graze はおまけ。**符号反転を構造で担保** |

### 削除可能改良 1 個刻み制約

**v03 からの差分は 1 機能に閉じない**。コア構造変更（弾幕パターン主体 + wave 進行 + gauge 廃止）を伴う。守の通過点 = 破への転換として正直に開示。

実装方針: v04 は v01 をベースに**再起動**（v03 streak/active def を破棄、v01 graze ring 復活、新規 wave pattern table 導入）。v03 は **退役**、v01〜v04 の連続性は「graze メカニクの実験系譜」として README に記録。

### Log 方針との整合

- Log A (graze 判定可視化即復活): **採択** (本案の中核)
- Log B (BOMB 非懲罰化): **採択** (BOMB は独立救済)
- Log C (graze 快感装置化): **不採択** (Mir 路線と矛盾 — graze は副産物に留め、快感装置化はコア「避ける」側に集約)
- Log D (Lv3 距離短縮): **不要** (gauge 廃止で消える論点)

## 2. 案 β: 大型敵パターン制圧 + graze score multiplier（Touhou Spell Card 派生）

### 緊張源

大型敵（boss-like）が連続して **Spell Card 風弾幕パターン**を撃つ。各パターンは 8〜12 秒、撃破するか時間切れで次へ。プレイヤーは「現在のパターンを生き延びつつ HP を削る」二重課題。

### プレイヤー応答

passive 回避 + active 攻撃（ショット連射）の混合。SPACE は BOMB（緊急救済 + 大ダメージでパターン早終い）。

### graze 降格の整合

graze は弾幕の擦り取り回数として **score multiplier に乗る**（Touhou 型）。動機としては「上手く避ければ score 増える」が、コア体験は「パターン制圧」なので graze は副次的。

ただし score multiplier を入れると「graze を狙う動機」が残るため、**Mir 補足④への対策強度は α より弱い**。score 表示を控えめにし、「狙わなくても進行する」設計で緩和。

### Nao_u 4 指摘の解消

| 指摘 | 解消経路 |
|---|---|
| ① graze 判定可視化欠落 | graze ring 復活 + score popup（小さく） |
| ② Lv3 到達困難 | パターン制圧数で線形進行 |
| ③ BOMB が「明らかに損」 | BOMB は緊急救済 + 大ダメージ、進行は早まる方向 |
| ④ graze ストレス | graze は score にのみ乗る ambivalent 設計（狙わなくても進行）。**α より対策強度弱** |

### 削除可能改良 1 個刻み制約

v03 からの差分は閉じない。Spell Card 風パターンライブラリ + 大型敵 HP システムを新規導入。

### Log 方針との整合

- Log A: 採択
- Log B: 採択
- Log C (graze 快感装置化): **部分採択** (score multiplier 経路のみ、time-slow + 弾消しは α 同様不採用)
- Log D: 不要

### α との比較

- α が Mir 補足④の符号反転を構造で担保するのに対し、β は ambivalent 設計で「狙わない自由」を担保するだけ。**Mir 路線への忠実度は α > β**
- 実装コストは β > α (Spell Card パターンライブラリが必要)
- ゲームジャンルとしての「型」は β がより明確 (Touhou 直系)

## 3. 案 γ: 地形 + 弾幕 二重制圧（Tube Shooter / R-Type 派生）

### 緊張源

縦スクロール **地形（壁 / 障害物 / 通路）** と弾幕の組み合わせ。プレイヤーは「狭い通路を通りつつ弾も避ける」二重制圧課題。地形は手書きセクション 6〜8 個を用意。

### プレイヤー応答

passive 回避（地形 + 弾） + active 攻撃（壁にいる敵を狙撃）の混合。BOMB は緊急救済。

### graze 降格の整合

graze は経路選択の自然な結果（狭い通路を通ると弾が擦る確率高い）。score multiplier には乗せない（α 同様、Mir 路線）。

### Nao_u 4 指摘の解消

| 指摘 | 解消経路 |
|---|---|
| ① graze 判定可視化欠落 | ring 復活、副産物として |
| ② Lv3 到達困難 | 地形セクション数で進行、線形 |
| ③ BOMB が「明らかに損」 | BOMB は緊急救済 + 大ダメージ |
| ④ graze ストレス | 「経路を選んで生き延びる」がコア快感、graze はその自然な結果 |

### 削除可能改良 1 個刻み制約

v03 からの差分は最大。新規地形要素導入で v01〜v03 の系譜から大きく外れる。**守の通過点を踏み外し、別ゲームに近づく**。

### Log 方針との整合

- Log A: 採択
- Log B: 採択
- Log C: 不採択 (α 同様)
- Log D: 不要

### α/β との比較

- 実装コスト最大、新規要素導入で守の通過を踏み外す
- 「型」としては R-Type / Gradius 系の流れに乗る = 別系譜の型に乗り換え
- Mir 路線への忠実度は α 同等、但し v01〜v03 連続性は α より低い

## 4. 比較表

| 項目 | 案 α (弾幕回避コア) | 案 β (パターン制圧) | 案 γ (地形+弾幕) |
|---|---|---|---|
| 緊張源 | 弾幕パターン (向こうから) | Spell Card 連続パターン | 地形 + 弾幕 二重 |
| graze 位置 | 副産物 (multiplier 無) | score multiplier | 副産物 (multiplier 無) |
| Mir 補足④ 忠実度 | **◎** (符号反転を構造で担保) | △ (ambivalent 設計) | ◎ |
| 実装コスト | 中 | 中〜大 | **大** |
| v01〜v03 連続性 | 高 | 中 | 低 |
| 守→破 転換度 | 中 | 中 | 大 |
| Log A 採択 | ◯ | ◯ | ◯ |
| Log B 採択 | ◯ | ◯ | ◯ |
| Log C 採択 | × | △ (score 経路のみ) | × |
| Log D 必要 | 不要 | 不要 | 不要 |

## 5. Ash 内部の確信度配分（cross_review 前）

- 案 α: 50% (Mir 補足直系、本命候補、v01〜v03 連続性も担保)
- 案 β: 30% (Touhou 型の「型」明確だが Mir④ 対策強度弱)
- 案 γ: 20% (新規要素導入が大きく、守を踏み外す)

**ただし「最良 1 案の確定」は本ファイル内では行わない**。M-37 Stage 1 = 複数案で最良を選ぶ準備段階。cross_review (Log/Mir) + Nao_u 判断で最終確認する。

判定保留の根拠 (memory/feedback_clone_strategy.md t:5):
- 「v03 着手の可否」「総合確信度 N%」のような戦略レイヤー philosophizing は守を抜けている兆候
- 本案は v04 = コア再構築という性質上、守の通過点を超えた選択を含む → Ash 単独で最良 1 案を絞ると philosophizing になる
- cross_review/Nao_u 判断に最終確認を委ねるのが M-37 Stage 1 の作法

## 6. 着手後の実装手順（最良案決定後の参考）

1. v04/index.html を v01 ベースから再起動（v03 streak/active def 系を破棄）
2. brainstorm.md の選択案に従い、弾幕パターン or Spell Card or 地形セクションを実装
3. v04/predicted_play.md と v04/self_judgment.md を **着手前**に書く（M-39 + M-40 物理閉鎖、v02 で遡及作成した過ちを再発させない）
4. headless.py は不採用 (feedback_headless_unfit_for_unfinished_eval.md t:5)
5. README v04 で「v03 → v04 はコア再構築、削除可能改良 1個刻み制約から外れる」明示

## 7. 接続先

- game/graze_log/v03/{README,brainstorm,predicted_play,self_judgment}.md — 退役対象、本案で何を引き継がないかを明示
- game/cross_review/20260510_log_on_graze_log_v03.md — Log v03 cross_review (4箇条)
- game/cross_review/20260511_log_on_graze_log_v03_perception_axis.md — Log perception axis cross_review
- drafts/2026-05-11/post_log_game_rights_20260511_graze_log_v03_response_POSTED_ts1778447586.py — Log v04 方針 A/B/C/D
- drafts/2026-05-11/post_mir_game_rights_graze_direction_20260511.py — Mir 補足 (graze 行為そのもの不快符号)
- drafts/2026-05-11/post_log_game_rights_20260511_ash_direction_ack_POSTED_ts1778459309.py — Log Ash 5/10 方向性合意要請の閉じ
- memory/feedback_clone_strategy.md t:5 — 守の通過点制約、philosophizing 禁止
- memory/feedback_prediction_responsibility.md t:5 — Stage 1 複数案で最良を選ぶ準備段階
- memory/feedback_headless_unfit_for_unfinished_eval.md t:5 — headless 数値不使用
- knowledge/20260511_ash_canon_authority_void_daily_accumulation.md — 型の不確定性 / 権威の空虚 / 日常的生成（本案の最終確認を cross_review/Nao_u に委ねる根拠）
