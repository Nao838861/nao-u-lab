# graze_log v04 — Log brainstorm 補足（メタ移行 + 類似事例 + Ash 差分）

**起票**: 2026-05-11 C178 Phase 3 / Log

**位置付け**: Ash brainstorm.md (α/β/γ 3案) と Mir 補足 (graze 行為そのもの不快符号反転) への Log 補足。最終1案絞り込みは行わない (M-37 Stage 1 = 複数案で最良を選ぶ準備段階)。Ash brainstorm の構造を尊重し、Log は **(d)メタ移行を核 + (a)類似事例/(c)Ash差分を補助 + (b)v03 self_judgment 照合を末尾** の構造で書く (CLAUDE.md「核1本+補助N本、4本フラット禁忌」適用)。

## 0. 核: v03→v04 メタ移行 — 4問題を1原理に畳む

Nao_u 5/11 05:51 #game-rights 4指摘:
1. graze 判定の輪が見えない
2. MAX到達が難しい
3. ボム懲罰 (パワーダウン)
4. graze 自体がストレス源

v03 brainstorm は4問題を **4つの個別 patch (A/B/C/D)** で扱った (Log 06:13 投稿)。Mir は4問題の **共通根** = 「graze 行為そのものが快感符号として負」を抽出した (ts=1778456403)。Nao_u 06:17 が「メタ思考として活かす」と明言したのは Mir の抽出方向。

**Log のメタ抽象 (Mir 共通根 + 一段抽象化)**:

> **「コア行為の快感符号 ≠ コアでない行為で補填しようとした v01-v03」**

v01-v03 は3バージョン全て「graze 報酬を変えれば graze が快感になる」前提だった (v01: gauge→BOMB、v02: way数→Lv、v03: streak→active def)。**報酬の形を変えても、コア行為 (弾に擦る) が不快符号のままなら報酬は外発動機にしかならない** (psychology: contingent self-worth)。

v04 の1原理:

> **コア行為そのものが快感符号で正である状態を構造で担保する。graze は副産物として副号のままでよい。**

これは Mir の「外発緊張コア」と同じ落とし所だが、Log は「不快符号反転」ではなく「**外発と内発の符号分離**」として表現する: コア=外発緊張で正 / graze=副産物で中立 or 控えめ正 (multiplier に乗せない設計で「狙う動機」をゼロ化)。

→ v04 ブレストの判定軸 (Ash α/β/γ から1案を選ぶ場面で使う):
- **判定軸L1**: 「コア体験 = 弾が来る→避ける→生き延びた」が **graze なしでも単独で快感符号正であるか** (yes なら案として通る、no なら次)
- **判定軸L2**: graze は L1 の上に **削除可能なボーナス層** として乗っているか (削除しても L1 が成立するなら通る)

Ash α は L1/L2 両方 ◎ / Ash β は L1 ◎ L2 △ (score multiplier で graze 狙う動機残る) / Ash γ は L1 ◎ L2 ◎ だが守踏み外し。**Log 判定軸では α > γ > β** の優先 (Ash の α 50% / β 30% / γ 20% と方向一致、γ と β の順位だけ入れ替わる)。

## 1. 補助 (a): 類似事例 — graze ボーナス降格パターンの既存実装3例

Nao_u 「これまでの指摘をメタ思考として活かして、良いアイデアを考えて」「アイデアの出し方はちゃんと作法に則るように」(5/11 06:17)。「作法」= CLAUDE.md「着手前に広く調べる」= 類似事例調査を着手前に1ブロック。

Mir/Ash brainstorm は「外発緊張コア」「Touhou Spell Card 派生」「R-Type 派生」をジャンル単位で参照したが、**graze メカニクの降格パターン**としての先行例は明示されていない。Log がここを補完する。

### 例1: Psyvariar の BUZZ — graze を Lv up に直結させた失敗 (Mir 路線の反例)

Psyvariar (Success/Skonec 2000) の BUZZ システムは graze を Lv up に直結 (graze 累積で Lv 上昇 → 自機速度・無敵時間・スコア倍率変化)。これは v04 で **採用してはならない先行例** = 「graze を狙う動機が score 経路で残ると、graze 行為が不快符号のままでも『得だから擦りに行く』状態が成立してしまう」。プレイヤー体感は「擦らないと損」になり、graze 行為自体は不快のままという二重拘束。

→ Log 判定: v04 で BUZZ 型は **不採択**。α 路線 (multiplier なし) を支持。

### 例2: KAKUBOMB (cgrad 2025) のニアミス — graze を救済装置として降格した成功例

KAKUBOMB (cgrad / 個人開発 2025) はニアミスを **ボム発動条件** として配置 (graze で ボムゲージ 蓄積 → ボム発動で全画面攻撃 + 無敵)。graze は **救済 → 攻撃** という構造で「擦る → 助かる」連鎖が機能。コア体験は「弾を撃つ・避ける」で、graze は **守りから攻めへの転換装置** として副号 → 正への変換役。

→ Log 判定: KAKUBOMB 型は Ash β の score multiplier より Mir 補足④に近い (graze がコア快感の上に乗る変換装置)。**Ash β の改良版**として「score multiplier の代わりに『graze で BOMB を引き出せる』降格」が成立する余地あり。これは α の派生案 α' として brainstorm に追加可能 (Ash α の「BOMB は弾幕密度ピーク救済」を「graze 累積で発動権を得る」に置換)。

### 例3: mollifier (5/10 観察) の「弾が見えるようになる」 — 知覚軸での graze 降格

mollifier (Log 5/10 shared-reads 観察) は graze で **画面の弾速度が低下** + 弾の色が変化 → 「擦ったら次の弾がよく見える」設計。score 報酬は希薄、**知覚補助** として graze が降格。コア体験は「見えるようになった弾を避ける」で、graze は **知覚層の補助装置** として副号 → 中立への変換。

→ Log 判定: mollifier 型は Ash α/γ の「副産物」より一段強い「**知覚補助**」役に graze を降格させる路線。**α の補完案 α'' として「graze 発生時に該当弾の軌道予測線が薄く表示される」が成立**。実装コストは小 (既存 ring 描画の流用)。

### 3例から抽出する v04 への含意

- **「graze を score に乗せない」だけでは弱い**。BUZZ 反例より、graze がコア快感の **何かに化ける** 構造があると Mir 路線の符号反転が強化される
- 「化ける先」の候補3つ: (i) 救済 (KAKUBOMB 型 = BOMB 発動権) / (ii) 知覚補助 (mollifier 型 = 弾予測線) / (iii) 単純副産物 (Ash α 直系 = 何にも化けない)
- v04 で α 採択する場合、(ii) を α'' として **削除可能ボーナス層** で乗せるのが Log 推奨 (実装小・Mir 路線忠実・コア体験への干渉小)

## 2. 補助 (c): Ash brainstorm との被り回避

Ash α/β/γ の構造は明確 (緊張源 × graze 位置)。Log の追加案 α'/α'' は Ash α の派生で、α と独立な新案ではない (4本フラット禁忌を踏まない)。

### Ash brainstorm と Log brainstorm_log の差分マップ

| Ash brainstorm の論点 | Log brainstorm_log での扱い |
|---|---|
| §1 案α (Mir 直系 / Log 50% 推奨) | §0 メタ移行で判定軸 L1/L2 を提供。α が両軸 ◎ で通ることを Log 側からも追認 |
| §2 案β (Touhou Spell Card / multiplier) | §1 例1 BUZZ で「multiplier 路線は不採択」を補強 |
| §3 案γ (地形+弾幕 / 守踏み外し) | §0 判定軸 L1 ◎ で通るが、守踏み外しコストを Ash と同見解で評価 |
| §5 確信度 α50/β30/γ20 | Log 判定軸では α > γ > β の順位。Ash β > γ と Log α > γ > β の差分 = Ash は「型の明確さ」(Touhou 直系)、Log は「コア快感符号の構造」 |
| §6 着手後実装手順 | Log は α'' (知覚補助) の実装小コスト性を §1 例3 で追加 |

→ **Ash と Log で β/γ の順位が分かれている**。これは cross_review 価値あり (M-37 「最良1案の判断は cross_review/Nao_u 判断に委ねる」の前提)。Mir 評を待つ。

### Ash 案を上書きしないルール

Log brainstorm_log.md は **Ash brainstorm.md と並列ファイル** として位置付け。Ash の3案を1案に絞り込んだり優先度を書き換えたりしない (Mir 補足が「brainstorm は Ash 主導」と引いた線を維持)。Log の役割は **判定軸の提供 + 類似事例補完 + Log 独自の順位開示** に留まる。

## 3. 段階値判定メタブロック (M-40 WARN 対策の v04 内蔵)

本サイクル staging 冒頭で M-40 WARN 連続 (揺れ8/振幅24/罰24/進歩4) が検出されている (kaizen #131 段階1)。これは v04 brainstorm でも内蔵すべき自己照合枠。

### v01-v03 段階値往復の事実確認 (M-40 段階値比較)

| パラメータ | v01 | v02 | v03 | v04 提案範囲 (α 採択時) |
|---|---|---|---|---|
| R_GRAZE (graze 半径) | 22 | 22 | 22 | 22 維持 (変更すべき強い根拠なし) |
| graze 報酬 | gauge++ → BOMB | way数++→Lv | streak++→ActiveDef | (α) score+小、multiplier なし |
| BOMB の position | 終点 (gauge MAX) | 終点 (Lv3) | gauge MAX | 弾幕密度ピーク救済 (独立) |

→ **R_GRAZE 22 は3バージョン不変**。M-40 WARN「振幅24」は graze 半径のことではなく **段階値判定機構そのものの語彙頻出** を計測している (kaizen #131 hook 性質)。v04 で R_GRAZE を変える根拠はない。

### v04 で「段階値往復を再開しないか」自己照合枠

Ash α 採択時に **数値を新規導入する場面**: 弾幕パターン数 6-8 / wave クリア数の進行ステップ / BOMB クールダウン秒数。これらが将来 v05/v06 で **「6→4→8」「クールダウン 3秒→1秒→3秒」のような往復**を起こさないよう、v04 README に **「v04 で導入する数値の初期値 + 変更時のレビュー条件」**を明記する枠を予約。

具体形 (v04 README 追記項目案):
- 弾幕パターン数: 初期 6 / 変更条件: Nao_u プレイで「単調」評価が出た場合のみ +2 (8 上限)
- wave クリア数 → Lv 進行: 初期 3wave/Lv / 変更条件: Lv3 到達が中央値 60秒超過なら 2wave/Lv に短縮
- BOMB クールダウン: 初期 2秒 / 変更条件: 「BOMB 連発で進行壊れる」評価が出た場合のみ +1

→ これは v04 着手後の README に書く項目だが、brainstorm 段階で **「段階値往復を再開しない構造」を予約しておくこと** 自体が M-40 WARN 段階1 の運用ログ (kaizen #131) に直結する。本サイクルの brainstorm_log.md にこの枠を予約することで、段階2 着手判定 (検証期限 5/22) の必要性評価の材料も増える (次サイクル C179 持ち越し議題)。

## 4. 末尾 (b): v03 self_judgment 照合 — 4問題の v04 再発チェック

v03 self_judgment.md (Ash 5/10 04:55 実装前作成) は Q1 (面白いか) / Q2 (Nao_u 面白い判定確率 30%) / Q3 (出すべきか) の3問を扱った。v04 で再発する/しない を Ash α 採択前提でチェック:

| v03 self_judgment が挙げた問題 | v04 α 採択で再発するか | 根拠 |
|---|---|---|
| 「graze 判定の輪が見えない」(Nao_u 指摘①) | **再発しない** | α §「副産物表示として ring 控えめ復活」明記 |
| 「Lv3 到達難」(指摘②) | **再発しない** | α は gauge 廃止 / wave クリア線形進行 |
| 「BOMB 懲罰」(指摘③) | **再発しない** | α §「BOMB 独立救済、進行を失わない」 |
| 「graze ストレス源」(指摘④) | **構造で解消** | α コア「弾→避ける→生存」が単独で快感符号 + 段階値判定 §3 で「狙う動機」をゼロ化 |
| 「SPACE 文脈切替が認知負荷」 (v03 predicted_play §解釈負荷 30%) | **解消** | α は SPACE 単一機能 (BOMB のみ)、文脈切替なし |
| 「自然終局装置なし」(v03 self_judgment Q1 §裏目) | **未解消** | α でも自然終局未追加。ただし wave 進行で「最終 wave クリア = 終局」が線形に成立 → v03 より改善方向 |
| 「tuning 一発勝負」(v03 self_judgment Q1 §条件付き) | **緩和** | α は弾幕パターン 6-8 / wave 3 で複数のチューニングダイヤルがあり、1点に集中しない |

### v03 Q2 = 30% (Nao_u 面白い判定確率) からの v04 校正

v03 = 30% は Ash 5/10 推定。v04 α 採択で:
- 7問題のうち 6つが構造解消 / 1つが緩和 → 「面白い」判定確率は +20pt 程度の余地
- ただし v04 は **コア構造変更** (gauge 廃止 + wave 進行 + 弾幕パターン主体) で v01-v03 連続性が中、新規実装規模が大 → tuning 失敗確率も増える
- Log の v04 α 採択時 Q2 校正値: **45%** (v03 30% から +15pt、tuning 失敗で -5pt 控除)
- これは Ash brainstorm §5 「α 50%」とほぼ同水準で一貫

### Log 単独確信度の限界開示

本書面の判定は **コード読み + mental simulation 層**。Mir or Nao_u の3-5分プレイで上書き/上補完されるべき下層判定 (5/11 cross_review/20260511_log_on_graze_log_v03_perception_axis.md §0 と同じ立ち位置)。Q2 = 45% は Log 単独推定で、cross_review/Nao_u 評価で +/-15pt 動く前提。

## 5. Phase 3 で実装に進むか / 進まないか の判定

**結論**: **本サイクルでは実装に進まない**。理由3つ:

1. **最良1案絞り込みは Ash brainstorm §5 と同じく Log brainstorm_log §0 でも未確定** (α > γ > β の順位開示までで止める)。Mir cross_review + Nao_u 判断を待つ
2. **Mir 補足 (ts=1778456403) と Nao_u 5/11 06:17 指示の「作法に則る」**: brainstorm → predicted_play → 実装 の順で M-39/M-40 物理閉鎖を踏む。本書面は brainstorm 層のみ
3. **本サイクルで実装着手すると守を踏み外す確率が増える** (feedback_clone_strategy.md t:5)。Mir cross_review と Nao_u 判断後の C179 以降で predicted_play → 実装着手が適切

→ **次サイクル C179 持ち越し**: (i) Mir cross_review 受領 (ii) Nao_u 5/11 06:17「ちゃんと作法に則るように」への brainstorm 提出 (Slack 投稿は本ファイルの存在を #game-rights に伝える1投稿のみ)

## 6. 接続先

- [game/graze_log/v04/brainstorm.md](brainstorm.md) — Ash brainstorm 本体 (α/β/γ 3案)
- [game/graze_log/v03/self_judgment.md](../v03/self_judgment.md) — 末尾 §4 照合元
- [game/graze_log/v03/predicted_play.md](../v03/predicted_play.md) — §3 解釈負荷 30% 照合元
- [game/cross_review/20260511_log_on_graze_log_v03_perception_axis.md](../../cross_review/20260511_log_on_graze_log_v03_perception_axis.md) — Log 単独層の限界開示の前例
- [memory/feedback_few_rules_big_effect.md](../../../memory/feedback_few_rules_big_effect.md) — 4本フラット禁忌 (核1本+補助N本構造の根拠)
- [memory/feedback_clone_strategy.md](../../../memory/feedback_clone_strategy.md) — 守の通過点制約 (本書面で実装着手保留の根拠)
- [memory/kaizen_tracker.md](../../../memory/kaizen_tracker.md) #131 — M-40 WARN 段階1 hook の運用ログ (段階値判定機構の状況)
