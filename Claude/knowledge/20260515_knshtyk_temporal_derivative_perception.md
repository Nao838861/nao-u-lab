# 時間あたりの知覚の変化率 — VR錯覚 / UIイージング / 映像時間操作の共通根

- source: https://x.com/knshtyk/status/2055205448379412839
- author: @knshtyk (2026-05-15 投稿)
- discovered: 2026-05-15
- discovered_via: log/twitter_recommended_20260515.txt #23 (Ash Phase 1 21:28 取得 → C187 Phase 2)
- kind: [observation, prescription]
- confidence: medium
- tags: [perception, time_derivative, easing, animation, graze_log, hud_design, vr]
- concept_nodes: [temporal_derivative_perception, easing_quality_ceiling, motion_legibility, graze_perception_layer]

## 主張と根拠

### 原文（全文引用）

> VR系研究での錯覚を用いた表現を見ていくと、人間には"時間あたりの知覚の変化率"を極めて精緻に特徴として把握する能力が存在するということなのだろうなと思う。たとえばUIアニメーションではイージングが仕上がりに最も重要な影響を与えたり、映像では時間操作の巧拙で完成度の評価が変わったりする

### 主張の構造

knshtyk は3つの異領域の観察を1本の仮説に束ねている:

1. **VR系研究での錯覚表現** — VR では「実際の物理運動」と「視覚運動」を意図的にずらす錯覚（redirected walking, pseudo-haptics, motion gain manipulation 等）で、人間が物理運動の何を手がかりに「自然/不自然」を判定しているかが調べられている。結論として、人間は「位置そのもの」ではなく「位置の時間変化（速度・加速度）」のプロファイルに極めて敏感である。
2. **UIアニメーションのイージング** — `linear` / `ease-in` / `ease-out` / `cubic-bezier(...)` の差は「同じ A→B 遷移」を「変化率カーブのどの形」で繋ぐかの選択である。完成度評価の支配的因子になっている。
3. **映像（映画/MV）の時間操作の巧拙** — タイムリマップ、スローモーション加減、カット繋ぎの呼吸——いずれも被写体の絶対位置ではなく「時間変化率」を制御する技術である。

3例とも、人間が「絶対値」ではなく「時間微分（rate of change）」を知覚の主要特徴量として扱うことを示唆する。

### 外部対応語（R-007 造語症対策）

- **時間あたりの知覚の変化率** = temporal derivative of perception / rate of perceptual change
- 隣接概念:
  - **Weber-Fechner law** (1860 頃) の時間版に近い — 刺激の絶対値より相対変化に対する感度
  - **Just Noticeable Difference (JND)** の時間軸版 — 「変化が変化したと気づく閾値」
  - **Vection** (自己運動感覚錯覚) — 視覚運動から自己位置変化を推定する機構
  - **Pseudo-haptics** (Lécuyer 2009 ほか) — 視覚運動の歪みで触覚を錯覚させる
  - **Motion-to-photon latency** — VR 酔いの主犯。位置ではなく遅延（時間微分の遅延）が苦痛源
- **イージング** = easing function — CSS の `cubic-bezier(x1,y1,x2,y2)` / アニメーション業界では Robert Penner's easing equations (1999) が古典

## 我々の分析・体験接続

### graze_log v05 「全弾常時軌跡」への直射

graze_log v05 は v04 alpha'' (graze した弾のみ軌跡) → v05 (**全弾常時軌跡**) で「軌跡線」を発火条件付き報酬から常設知覚層に降格させた変更だ (game/graze_log/v05/README.md:9)。軌跡線とは、画面平面上での **位置の時間微分（速度ベクトル）の視覚化** そのものである。knshtyk の枠組みに直接乗る:

- v03 まで: プレイヤーは弾の **位置** を見ていた
- v04 α'': graze 弾のみ **速度** が見える (条件付き)
- v05: 全弾 **速度** が見える (無条件)

「視認する→避ける」の順で進む STG で、視認コストを graze (逆方向の行為) に紐づけていた v04 までの設計は、knshtyk 観点で言えば「変化率（速度）の知覚層」を曲げて報酬軸に重ねていたことになる。v05 はその曲がりを真っ直ぐ戻した。

### 次の天井 — 加速度（変化率の変化率）の表現

knshtyk の3例（VR / UI / 映像）が共通して指すのは、**変化率の変化率**（イージング曲線のカーブ形状、加速度プロファイル）まで人間が精緻に知覚することだ。`linear` と `ease-in-out` は「同じ平均速度」だが評価が異なる——差は加速度プロファイルにある。

graze_log v05 で我々が描いた軌跡線は「等速直線運動の予測」しか表現しない (game/graze_log/v05/README.md:31, hit半径 grazeT 描画ロジック)。しかし STG の弾は実際には:

- 直線弾（加速度 0）
- 重力弾（加速度 一定）
- 誘導弾（加速度ベクトル時間変化）
- 加減速弾（速度プロファイル指定）

の混在で、graze の「ヒヤッとする」体感差は加速度プロファイルから生まれている可能性が高い。v05 の軌跡が **線分** ではなく **曲線（過去 N フレームの実位置トレース）** であれば、加速度プロファイルが視覚層に露出する。

### push/pull HUD アーキへの示唆

graze_log v05 で別途検討されている push-pull HUD 設計（cross_review β、HUD 色帯による graze 状態通知）も、本質は「HUD の delta-rate（変化率）」が知覚しやすい形で出ているかの問題だ。色帯が `linear` で出てくるか `ease-out` で消えるかで、同じ情報量でも「気づきやすさ」が変わる。knshtyk の主張に従えば、HUD 要素のイージング選択は機能設計と同等の比重を持つ。

### 体験との接続（Ash 側既存記憶）

- knowledge/20260405_starling_phase_transition.md — ムクドリの群れ運動が「個体の位置」ではなく「近傍個体との相対速度」で記述される話。同根。
- memory/feedback_prediction_responsibility.md t:5 Stage 3「実装後・人間プレイ前に予測（数値→体感換算）」— 我々が一番苦手な領域。knshtyk 観点を入れると「数値（弾速の絶対値）」を体感換算する時、媒介となるのは「変化率カーブの形」であって平均速度ではない。Stage 3 予測の精度を上げる手がかりかもしれない。
- v05 brainstorm で出した「敵配置 rhyme（B-1）」も rhythm の本質は時間微分プロファイル（拍の頭で加速度が変化する）に置けば、配置の単調さ問題と HUD 演出設計が同じ語彙で語れる。

## 接続先

- beliefs: なし（新規領域、信念昇格は v05/v06 で実際に加速度プロファイル可視化を試した結果が出てから）
- articles:
  - [[20260405_starling_phase_transition]] — 相対速度ベース記述の同根例
  - [[20260417_choice_blindness_feedback_design]] — 知覚と判断の分離。同じく時間軸感受性の話題
  - [[20260415_induction_laziness_vs_fun_wall]] — 体感壁の話。Stage 3 体感換算の隣接
- projects:
  - [[game_development]] — graze_log v05/v06 設計に直接接続
  - [[external_search_phase1_fixation]] — 「変化率」が graze 設計天井引き上げ語として shared-reads 経由で内製化された事例
- concept_graph:
  - `temporal_derivative_perception` -[supports]-> `graze_perception_layer`
  - `easing_quality_ceiling` -[applies_to]-> `hud_animation_design`
  - `motion_legibility` -[connects]-> `bullet_trail_curvature`

## 未解決の問い

1. **v06 で軌跡を「線分」から「曲線（実位置 N フレームトレース）」に拡張するか?** — 加速度プロファイルが見えるが、画面情報量が増える。トレードオフ実測が要る。v05 ship 評価が出てから判断。
2. **イージング選択は機能と同等の比重か?** — knshtyk の主張がそのまま STG HUD に乗るなら、色帯 popup の `ease-out(0.2s)` vs `linear(0.1s)` の差が、graze 検知のフィードバック品質を支配する可能性。cross_review β に「イージング指定」が含まれていないので、設計書面に補う必要がある。
3. **「変化率」を見せた v05 と「変化率の変化率」を見せる v06 で、人間プレイヤーの graze 巧拙はどれだけ変わるか?** — Stage 4 校正前 headless では測れない（[[feedback_headless_unfit_for_unfinished_eval]] t:5）。Nao_u に v05 評価を受けた後、対比でしか測れない設問。
4. **Weber-Fechner / JND を時間軸に拡張した研究の最新は?** — knshtyk が「VR系研究」と言っているのは Lécuyer pseudo-haptics 系か、より新しい motion gain 系か、特定できていない。次の external_search でキーワード「temporal JND VR motion gain pseudo-haptics 2024 2025」で深掘り候補。
5. **v05 軌跡線の長さ (`GRAZE_TRAIL_FRAMES`) は「視認可能な時間窓」の絶対値だが、これも変化率知覚の文脈では「窓の長さ」より「窓内での速度プロファイル変化」が支配的か?** — 窓を長くする (フレーム数増加) よりカーブ表現に切り替える方が体感を変える可能性。
