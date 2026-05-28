# graze_log v07 — external_scoring_axis.md (shmups.wiki defensive/aggressive 二分 + Ketsui carry-over 接続 / 2026-05-28 C204 Ash)

**status**: v07 評価返信 (Stage 5, ts=1779939191.243789) 受領待ちの隙間で、Phase 1 §6 外部検索ヒットを v07 5 機構積層に接続する書面。`refinement_predict.md` の Stage 3 予測に対して「機構混在度」軸を1列追加するか判定する。philosophizing 抑止: 本ファイルは v08 経路を決定しない (`feedback_clone_strategy.md` t:5)。Nao_u 評価返信受領後の自己判定材料を仕込むだけ。

## 外部出典

| ソース | URL | 引用文 (抜粋) |
|---|---|---|
| shmups.wiki Boghog's bullet hell shmup 101 | https://shmups.wiki/library/Bullet_Hell_Shmup_101 | "defensive scoring (自動bonus + timer強制行動でpassive play punish) vs aggressive scoring (action強制で score 加算) の2分。両者ともpassive non-rewarded" (Phase 1 §6 ログ 2026-05-28 21:50) |
| shmups.system11.org Giest118 ガイド | https://shmups.system11.org/viewtopic.php?t=64325 | "boss multiplier (Ketsui 型 stage→boss carry-over) で score 突発boost = correct play 信号" (同上) |

(`feedback_prior_art_citation_must_verify.md` t:5 準拠: URL + 引用文抜粋カラム併記)

## 1. v07 5 機構を defensive / aggressive / 混在 で分類

shmups.wiki 二分の定義:
- **defensive scoring** = 自動 bonus が付き、何もしないと timer や条件で penalty (passive play punish)。何かを「やらないこと」が損になる構造
- **aggressive scoring** = action 強制で score 加算。危険行動 (graze / boss-melee / suicide bullet) を取らないと score が伸びない構造
- 両者の共通条件: **passive play は非報酬** (どちらの設計でも「何もしない」は最劣)

5 機構の分類 (Ash 仮置き、コード読解 + `refinement_predict.md` C203 と整合):

| 機構 | 自動bonus/timer punish 要素 (defensive 側) | action強制 score 要素 (aggressive 側) | 分類 |
|---|---|---|---|
| B-2 Hyper Activation | gauge 蓄積中の自動加点はなし | gauge は graze 累積のみで貯まる (敵撃破では貯まらない)、発動は「弾消去」防御行動 | **混在 (aggressive 偏重)**: 蓄積経路は aggressive、発動効用は defensive |
| 観点 3 弾側マーカー (黄色リング弾) | 通常弾でも graze 可、マーカーなしでも基本動作可能 | 黄色リング弾は擦るとお得=擦り action 誘導が score 経路の中核 | **aggressive** |
| 観点 7 180F cap reached 大成功反応 | 3 連 Lv up = chain MAX 継続中は無敵 cap で時間軸 bonus | chain 維持は擦り続けないと切れる (passive で chain 切断 = penalty) | **混在 (timer punish + action 強制)**: defensive と aggressive を同一発火点で接続 |
| 観点 6 7 区分 spawn テーブル | phase 1/3/6 休符で弾密度低 = 何もしないと score 蓄積止まり | phase 5/7 山で弾密度高 = graze 機会の集中点 (時間軸 aggressive 誘導) | **aggressive (時間 curve で誘導)**: defensive 的「自動bonus」要素なし、aggressive 機会の濃度を時間軸で配分 |
| 観点 8 bad policy headless | (AI agent 評価軸、route > camper relative order 確認装置) | (scoring 軸の射程外) | **メタ機構**: scoring 軸の射程外、判定装置として上位レイヤー |

**集計**: defensive 単独 0 / aggressive 単独 2 / 混在 2 / 射程外 1。

**観察**: v07 5 機構は **aggressive 偏重 (混在を含めても aggressive 側に傾いた構造)**。passive play punish の自動装置 (timer 減衰 / 無作為 penalty) は B-2 / 観点 7 の chain 切断以外には実装されていない。aggressive 側は graze 行動が score / gauge / chain の3経路を同時に駆動する集中設計。

## 2. Ketsui 型 stage→boss carry-over multiplier の v07 接続点

Giest118 ガイドの "boss multiplier (Ketsui 型 stage→boss carry-over)" は、各 stage で稼いだ multiplier を boss 戦に持ち越すことで boss 撃破時の score 突発 boost を作る設計。"correct play 信号" としての機能 = 「stage 序盤からの一貫した正しいプレイの結果」を可視化する。

v07 への接続点: graze_log v07 は **90 秒 1 stage 単独構成**で stage 区切りが薄いが、観点 6 の 7 区分 spawn テーブル (phase 1: 学習 / phase 2: 圧力 / phase 3: 休符 / phase 4: 圧力 / phase 5: 山 1 / phase 6: 休符 / phase 7: 山 2 final) が時間軸 stage 区切りの機能を半分果たしている。phase 1-4 で蓄積した chain / gauge / Lv を phase 5-7 の山と final で「持ち越し発火」する構造は、Ketsui の stage→boss carry-over と機構的に同型である。

ただし v07 現状は **carry-over の明示的な multiplier 表示 / 蓄積数値の可視化が欠落**している。観点 7 の 180F cap reached 大成功反応は chain MAX 到達の頂点演出だが、「phase 1-4 の累積結果として phase 7 で multiplier が大爆発」という Ketsui 型の構造的演出ではない。Stage 5 後の v08 設計レーン候補として、phase 4→5 / phase 6→7 の boundary で **累積 multiplier の明示的 carry-over 表示** (例: phase 5 開始時に "x N carried" 表示) を追加する経路は、5 機構積層後の自然な天井引き上げ経路として整合する。

philosophizing 抑止: 本接続点は v08 方針として **決定しない**。Nao_u プレイ評価返信 (ts=1779939191.243789) で「phase 5/7 山で蓄積が活きる感覚はあるか」「最後で大爆発する感覚はあるか」が出てから判定する (`feedback_clone_strategy.md` t:5)。

## 3. refinement_predict.md への delta — 「機構混在度」1列追加の必要性

`refinement_predict.md` C203 §B003 検証パラグラフは v07 5 機構を **fusion 寄り (列挙ではない)** と仮置き判定した (機構間で発火条件・発火頻度・排反性が編まれている)。本ファイル §1 の分類は **defensive/aggressive 軸 (scoring 構造軸)** で、fusion 軸とは直交する別観点である。

「機構混在度」軸を refinement_predict.md に1列追加する必要性 (yes/no) 判定:

**判定: 部分 yes (Stage 3 予測の体感換算で新規列を立てる価値あり、ただし「混在度」ではなく「aggressive 偏重度」として書く)**

判定根拠:
- v07 5 機構の集計 (defensive 0 / aggressive 2 / 混在 2 / 射程外 1) は **defensive 単独機構の欠落** を示している。これは refinement appetite の喚起経路に影響する: defensive 機構 (自動 timer による継続行動強制) は「passive で居ると損なので何かやらざるを得ない」誘因として refinement appetite の **底辺**を支える設計が多い。v07 はこの底辺が薄く、aggressive 側 (graze 行動の中核化) で全てを駆動している。
- refinement_predict.md §5 で「自己ベスト記録 / weekly challenge 誘因が現 v07 に未実装 (確度 80%)」と書いた「継続的『もう 1 回やりたい』に変換する仕組み」は、defensive 側の補強 (timer 系自動 bonus / passive penalty) で立ち上がる可能性がある。aggressive 偏重のままだと「擦らないと面白くない」プレイヤー以外には refinement appetite が立たない (refinement_predict.md §4 の懸念と整合)。
- 一方、shmups.wiki 二分の「混在度そのもの」を1軸として立てるのは、v07 内部での **5 機構間の混在比率分布**を見るには有効だが、Stage 3 予測の体感換算 (refinement appetite が立つか) には間接的すぎる。**「aggressive 偏重度」または「defensive 欠落」** として書くほうが、refinement appetite の喚起構造に直接接続する。

**追加列の具体提案 (本ファイル内では決定提案のみ、refinement_predict.md への実装は別ターン)**:

| 機構 | refinement_predict.md 既存軸 (本能/機構不一致 + fusion) | 本ファイル追加軸 (defensive/aggressive 構造) |
|---|---|---|
| (各機構) | 不一致レベル (弱/中/強) + fusion 関係 (列挙/fusion) | aggressive 偏重度 (純 aggressive / 混在 / 純 defensive / 射程外) |

この3軸で読むと、v07 5 機構は「不一致中 + fusion 寄り + aggressive 偏重」の構造体である。3軸目 (aggressive 偏重) が refinement appetite 喚起の「continuous re-engagement」経路 (defensive 側) を欠いている。これは Stage 3 予測の確度 50-60% を下方修正する要素ではないが、Nao_u 評価返信受領後に「擦らなくても score が伸びる経路はあるか」反応を観察する根拠を作る。

## 予測の限界

- 本ファイルは Phase 1 §6 外部検索ヒット2本 (shmups.wiki 二分 / Giest118 Ketsui carry-over) を v07 に接続する Stage 3 補強であり、Nao_u プレイ評価 (Stage 5, ts=1779939191.243789) 返信受領後に refinement_predict.md / self_judgment.md 内で再判定する (`feedback_prediction_responsibility.md` t:5)
- §1 分類は **コード読解 + refinement_predict.md C203 整合**からの仮置きで、実プレイで「aggressive 偏重が体感される」かは未検証 (`feedback_headless_unfit_for_unfinished_eval.md` t:5)
- §2 Ketsui carry-over 接続点は v08 設計レーン候補として **位置付けのみ**、方針決定は本ファイル内ではしない (philosophizing 抑止)
- §3 機構混在度軸の delta 判定は **部分 yes** で、refinement_predict.md への実列追加は別ターン (`feedback_memory_update_method.md` t:4 差分追記)

## 削除可能性

`game/graze_log/v07/external_scoring_axis.md` は独立ファイル (v07/index.html / refinement_predict.md / self_judgment.md は無改変)。ファイル単位削除で完全戻し可能。1 機構刻み制約 (R-D + `feedback_clone_strategy.md` t:5) 準拠。

— Ash (Win2) 2026-05-28 C204 Phase 4 (shmups.wiki defensive/aggressive 二分 + Ketsui carry-over の v07 接続書面)
