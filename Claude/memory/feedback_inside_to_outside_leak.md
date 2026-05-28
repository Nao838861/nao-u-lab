---
name: 内側で計算したものを外側に流出させない
description: 設計時の整理タグ・予測情報・内部計算を、UI/フレーバー/画面表示にそのまま出すと体験が壊れる。3例独立収束で抽出した1原則
metadata:
  type: feedback
status: active
created_at: 2026-05-26
trigger:
  - ゲーム UI に「説明文」「ラベル」「予測ゴースト」を追加したくなったとき
  - 内部用語 (リファクタタグ / 物理計算結果 / 整理メタファ) が外側テキストに登場したとき
  - 「これも見せた方が親切」「ラベル付けて立体的にしよう」の反射が出たとき
related:
  - feedback_means_ends_reversal_check.md
  - feedback_rule_proliferation_canonical.md
  - feedback_no_type_redo_material.md
---

# 内側で計算したものを外側に流出させない

## 1 原則

> 内側で計算した/整理した/予測したものは、外側 (画面・UI・フレーバー文言) に出す前に問う:
> **「これを見せることでプレイヤーの体験が強くなるか、それとも内側で処理して結果だけ見せた方が強いか」**

「もうある」「作ったから見せたい」は理由にならない。外側に流出させた瞬間、プレイヤーは「設計者が整理した結果」を見せられるだけで、自分で発見する余地が削られる。

## Why

2026-05-26 朝、Nao_u から 3 ゲームに対して別々の批判が同時に出た:
- log_mystery v10: リファクタタグ (鐘 / chord / pending / 司書日誌) が UI に剥き出し → 「何のゲームかわからない」
- mimicry_log: 「弾の間合いを毎秒選び変えるごっこ」というメカニクス記述だけが「ごっこ」ラベル化、フレーバーは内側に不在
- log_autonomous_game v001: 1秒先物理計算結果を「軌跡線+×印」として画面に出力 → 弾本体を覆い隠して逆によけにくい

3 つは別問題ではなく、同じ「内側→外側流出」の 3 表出だった。各症状に 3 処方を出すと再発するが、1 原則で抽象化すれば次の v01-v10 再生時にも適用できる粒度になる。外部知見との収束: gamedeveloper.com 「Readability should always trump realism」「Too much contrast in too many places = nothing draws attention」と独立同方向。

## How to apply

ゲーム改修時、または design_log.md / 説明文 / HUD を書く前に通す:

1. **これは内側で計算した結果か?** (Yes なら 2 へ。No=プレイヤー入力の応答ならそのまま見せて良い)
2. **見せることで体験が強くなる根拠は何か?** 「親切」「立体的」「これもあった方が」は根拠にならない
3. **隠して内部状態のままにすると、プレイヤーは何を自分で発見できるか?** これが「3」未満なら見せる、「3」以上なら隠す方が強い
4. **隠したら見せたい派の意見はあるか?** ある場合、それは「自分の整理を見てほしい欲求」かどうか自問する

[[feedback_means_ends_reversal_check.md]] の「手段が目的を侵食する」と同じ系の事故。手段 (内側の精度) を目的化すると、外側 (プレイヤー体験) が削れる。

## 適用済み事例

- 2026-05-26 game/log_autonomous_game/v001/game.js: 1秒先予測軌道線・×マーカー描画を削除、弾本体のみ表示。echo 機構の castLock 判定は内部 trail 追跡で完結
- design_log.md Q-D: 「予測ゴースト表示」方針を「内部に閉じる」方針へ転回、禁則に「1秒先計算結果を画面に流出させる」を追加

## 何を立証していないか

- 3 例の独立収束は強い兆候だが、同じ朝の同じ指摘者からの 3 件であり、別観察者・別サイクルでの再現は未確認
- 「隠した方が強い」判定の打率は v001 改修後の自己採点 + Nao_u 反応で 1 巡見る必要がある
- 適用後に「予測ゴースト無し版が逆に難しすぎる」場合、「邪魔転じて core mechanic 化」案 (Phase 2 §4 案 B) を再検討する余地は残す

## refine: telegraph は inherently 悪ではない (2026-05-27 C247 NextMars 4軸目)

NextMars 2026-03「Premium 2D Gameplay Readability Systems」が telegraph logic を 7要素のうち 1要素として **積極的に** 位置づけているのを読んだ後、v001 失敗を再診断。

- v001 失敗の真の原因 = telegraph (予告軌道線+×印) が **悪いのではなく**、contrast priorities / silhouette rules / effect hierarchy が同色家族4要素同居で崩壊した結果、telegraph 信号が視覚ノイズに飲まれて読めなくなった
- つまり「内側→外側流出」の事故面は、本原則の射程外でも別経路で起きる: **visual hierarchy 設計が不在のまま telegraph を足すと telegraph も読めない = 「見せた」のに「見えない」二重事故**
- 本原則の射程は維持: v001 が telegraph を削った判断は正しい (visual hierarchy 設計と同時にやり直すコストが高い)。ただし将来 v002+ で再採用する際は、本原則の Q3「見せて体験が強くなる根拠」だけでは不十分で、**NextMars Q1 (silhouette が背景・他キャラから3秒以内に識別できるか) を満たした後** に telegraph を足す順序を守る

## 関連投稿

- 2026-05-27 C247 #shared-reads ts=1779834973 「NextMars Readability Systems → v001 失敗の telegraph 位置づけ refine」 (drafts/2026-05-27/post_log_sharedreads_nextmars_readability_systems_refinement_20260527_POSTED_ts1779834973.py)
- 2026-05-26 C242 三軸独立収束「予告軌道線=邪魔」結論 (本ファイル初版)

## 追記候補マーキング: Boghog 業界経験則 (2026-05-28 C258 Phase 2)

- 2026-05-28 #shared-reads ts=1779972076.794739/.823599/.849019 「Boghog's bullet hell shmup 101 → v005 連続 erase 段階化の独立検証 + 色相衝突警告」(drafts/.archive/2026-05-28/post_log_sharedreads_boghog_shmup101_20260528.py)
- Boghog 経験則: 「**Single stray bullets are hard to read and can often feel unfair**. Bullets with unusual, hard to predict trajectories may need extra effects like trails to help players out」 = Nao_u 5/26 06:10 「予測軌跡+×印が逆にわかりにくい」批判と独立到達
- **R 層昇格判定は保留** (機械反映禁止、CLAUDE.md「個別指摘を即ルール化しない」順守)。独立 source 数: NextMars (5/27 C247) + Boghog (5/28 C258) で本原則周辺は **3 source 同方向 = Nao_u + NextMars + Boghog**。次サイクル C259 以降で R-X 抽象ルール昇格判定検討
- **昇格判定の論点**: NextMars は telegraph の inherently 悪ではない説で本原則の射程を refine、Boghog は stray bullet 禁忌で「内側→外側流出」の表出経路の一つを独立補強。両者の合流点は **「メタ情報 (予測線・×印・タグ) が画面を stray bullet 的に汚す = visual hierarchy の阻害」** という共通核。昇格時は本核を R-X として抽象化、M-XX として 3 事例 (log_mystery v10 / log_autonomous_game v001 / mimicry 宣言) を保持
