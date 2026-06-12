"""Log C326 Phase 2 -> #shared-reads: Difficulty Curve-Based PG of Scrolling Shooter Enemy Formations (Atmaja+ 2020) 詳細分析。

Nao_u 6/10 09:28 指示「同ジャンルのゲームデザイン / レベルデザイン / 敵 / 各種アルゴリズムを
しっかり調べて噛み砕いてから作る」の継続消化。本論文は「人間が描いた理想曲線」と
「アルゴリズム生成編隊の時系列危険度」を RMSE で比較する GA 手法。当方 verify.js が
「Q-成功FB の難易度カーブ」を時系列で測れない問題への直処方候補。
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, "D:/AI/Nao_u_BOT/Claude")
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("shared-reads")

MSG = """[Log 2026-06-11 C326 Phase 2] shared-reads 詳細分析: Difficulty Curve-Based Procedural Generation of Scrolling Shooter Enemy Formations (Atmaja, Sugiarto, Mandyartha 2020, Journal of Physics: Conference Series Vol.1569) — 縦スクロールSTGの敵編隊配置を GA で生成、fitness = (理想難易度曲線との RMSE) + (敵多様性)

■ 元情報
URL: <https://iopscience.iop.org/article/10.1088/1742-6596/1569/2/022049>
DOI: 10.1088/1742-6596/1569/2/022049
著者: Pratama Wirya Atmaja, Sugiarto, Eka Prakarsa Mandyartha (2020)
取得経路: 本サイクル C326 Phase 1 §6 自発検索 (キーワード `shmup enemy placement procedural generation level design 2026`)。Nao_u 6/10 09:28 #nao-u 投稿の akira_goya STG敵配置資料の継続消化として位置取り。slack_archive / GPT raw 全 jsonl grep hits=0 = **真の新規** (本論文 DOI は Slack 言及未到達)

■ 概要 — 何を解いたか
縦スクロールシューティングゲームにおいて「敵編隊の配置方法がゲームの難易度に大きく影響する」課題に対し、適切な難易度曲線を維持しながら編隊を自動生成する遺伝的アルゴリズム (GA) 手法を提案。
- **遺伝子型表現**: 5×40 グリッド (敵ユニット遺伝子 + 空白遺伝子)
- **GA 設定**: 世代数 300、個体数 40、各世代 100 イテレーション
- **Fitness 関数**: 2 軸合成 = (a) 難易度曲線 RMSE + (b) 敵多様性
  - (a) **難易度曲線**: 「人間が設計した理想カーブ」と「生成編隊の時系列危険度 (画面上の敵の danger 値の時間積分)」を点ごと比較し RMSE で評価
  - (b) **敵多様性**: 編隊内の敵ユニット種類の豊かさ (entropy 様の指標)
- 主たる発見: 「初期遺伝子型の敵ユニット数」が個体群の fitness 進化に影響を与える

■ 内容分析 — 「理想曲線を目的関数化」した功績と限界

**功績**:
- Cave 系統の手作業バランス (DoDonPachi DaiOuJou / Crimzon Clover などで「ベテラン設計者の暗黙知」だった編隊配置設計) を **transparent な目的関数化**。「何を最大化したいか」が論文として書ける形に持ち込んだ
- RMSE × 理想曲線の組み合わせは「人間の希望する難度カーブ vs 実際の生成結果」の **誤差** を直接可視化、設計サイクルで「曲線を直す → 再生成 → 誤差確認」が回せる構造
- 5×40 グリッドという離散表現は GA 探索空間を有限化、収束保証を得やすい

**限界**:
- (a) 「理想曲線そのもの」を誰がどう設計するか問題は残る = 人間の暗黙知を「曲線設計」に押し付けただけで根本解ではない
- (b) 実運用検証 (プレイヤーが実際にその難度を感じるか) のデータが論文内では薄い = 「fitness 高い ≠ プレイヤーが面白い」の隔たり問題が未解決
- (c) 5×40 グリッド表現は「敵の軌道」「弾発射パターン」「ステージ進行に伴う密度変化」を射程外に置く = 配置の "static snapshot" の最適化のみ。Galaga (A-02) の「侵入→待機→攻撃」3 状態機械や Cave 系統の弾幕パターンは表現不能
- (d) "danger 値" の定義 (敵 1 体あたりの危険度の数値化) が論文内で言及あるものの計算式の詳細は本文 PDF 確認が必要 — abstract+部分情報では「速度+耐久+弾数の重み合成」レベルの推定にとどまる

■ 自分達の環境への適用 — log_autonomous_game v003/verify.js 直処方候補

当方 `log_autonomous_game v003` の `verify.js` は現状 `pass: true/false` 単一判定 (C307 Phase 4 §3-2 で「Q-成功FB 3 状態 event 内訳が report に出ない」と指摘済の延長線)。本論文の「**理想曲線 vs 実際の danger_over_time の RMSE**」方式を借用し、verify.js 出力を以下に拡張する案:

```
verify.js report (案):
  pass: bool
  danger_over_time:
    actor_id: { t=0.0: 0.3, t=0.5: 0.7, t=1.0: 1.2, ... }  # 各 actor の時系列 danger 推移
  ideal_curve:
    Nao_u が手描き or graze_log v06b 既存ステージから抽出
  rmse: float   # ideal_curve vs danger_over_time の RMSE
```

**核心の差分**: 当方は GA ループは持たない (Claude で生成 → verify で評価の 1 phase 1 round)。論文の 300 世代 GA は適用不可。しかし「理想曲線 vs 実測の RMSE 出力」だけ借用すれば、Claude に「次世代生成」に相当する **次サイクル生成の prompt 改善信号** として使える = pseudo-GA loop。

**接続点**: C307 Phase 4 §3-3 「死亡近傍局在信号が薄い」への直処方とも親和。`danger_over_time` の各 actor 系列があれば「死亡 frame の直前 N step で danger 値が異常スパイクしたか」が局在的に検出可能。

■ メリット・デメリット

**メリット**:
- (m1) verify.js を「単一判定 → 時系列出力」に拡張する **第一歩の学術根拠** として強い (Cave 手作業バランスの言語化と同方向)
- (m2) 「Nao_u が手描き理想曲線 vs Claude 生成結果」という構図が、当方の `frontier + 人手 ideal` ハイブリッドの自然な接続点
- (m3) RMSE は計算コスト ε で当方環境 (Claude + headless browser + verify.js) にすぐ実装可能
- (m4) M-43 Phase 4 §A-06 (DoDonPachi DaiOuJou) / §A-10 (Crimzon Clover) の「弾幕パターン × 段階難度」設計の **数式化** の足掛かり = 既存 30 本調査ノートの分析を verify.js に接地できる

**デメリット**:
- (d1) 「理想曲線を誰が描くか」問題が当方環境では `Nao_u 工数` に直結 = Nao_u の時間を使わせない原則 (slack.md) と相反するリスク。手描きカーブテンプレを `game_templates_design.md` 経路で半自動化する設計が前提
- (d2) 5×40 グリッド表現は当方の「ステージ全体を 1 単位で生成」と相性が悪い = log_autonomous_game v003 は連続スクロールゲームで、5×40 静的グリッドの遺伝子型はそのまま当方の game/ ディレクトリ構造に乗らない
- (d3) abstract のみで判断、本文 PDF 未取得 = "danger 値" の具体定義 / "敵多様性" の entropy 計算式 / 評価実験の被験者数 が確定していない = テンプレ流用品質低下禁止ルール (slack.md) の観点で **位置取り記録としての価値に絞る判定**
- (d4) MAP-Elites (arxiv 2202.09615, 6/10 既出) との対比で本論文は「1 本の理想曲線」に縛られる単目的設計、F-3 MAP-Elites の「複数 quality 軸網羅」とは対立する路線。当方が将来どちらを採るか論点化される

■ 判定

**判定**: 位置取り記録 + v004 着手判断軸の **暫定採用候補強**
- 即実装はしない。`projects/log_autonomous_game.md` の v004 着手前 brainstorm 段階で本案を 1 mm 候補として明示 (Phase 3 で具体化判断)
- 本文 PDF 取得は次サイクル候補、当面は abstract レベルの位置取りに留める
- M-43 Phase 4 §F-1 に既結晶化済 (`projects/genre_study_shmup_M43.md` §F-1)、本投稿は外部摂取の位置取り公示

■ アイデアの種 3 つ

(i) **「Nao_u 手描き理想曲線 vs Claude 生成 RMSE」UI**: Nao_u がカーブを GUI で描く → Claude が生成 → verify.js が RMSE 出す。当方の「人手 + frontier」分業の自然な落とし所。半自動化テンプレが揃えば Nao_u 工数 ε で運用可能 (Phase 3 候補)

(ii) **graze_log v13 へのカーブ転用**: 「擦りモード発動カーブ」を理想曲線として描き、Ash 主導の擦り設計に接続。Crimzon Clover Break (A-10) の Break モード持続時間カーブを本案の理想曲線として借用する具体案 (inbox_ash.md 経由で共有候補)

(iii) **MAP-Elites との対比実験**: 「1 理想曲線への最適化」vs 「QD 多様性網羅」を当方 verify.js で並列実行し、Nao_u が面白いと感じる方を観察する実験案。即実装しないが game 軸 R 層昇格 (3 source 独立到達観察, F-4) の N=4 判定材料として保留

■ M-43 Phase 4 / game 軸 3 source 独立到達への寄与

本論文は M-43 Phase 4 で構築した 30 本調査ノート (`projects/genre_study_shmup_M43.md`) §F-1 として結晶化済。F-2 (Shutshimi 10秒バースト, 別投稿で詳述) + F-3 (MAP-Elites, 既出のため再投稿せず) と合わせて **「敵編隊配置軸の 3 source 独立到達」** を位置取り。即 R 層化はしない (kaizen #135 観察継続原則)、N=4 待機。

■ 自己批判

- 本文 PDF 未取得で abstract + IOPscience 詳細ページ + 関連論文経由の再構成。"danger 値" / "敵多様性" の具体計算式は推定が混じる = 「テンプレ流用品質低下禁止」ルール順守の観点で **論文の主張を当方装置に過剰射影しないこと** が条件
- 「pseudo-GA loop」(Claude 生成 → verify RMSE → 次サイクル prompt 改善) は当方の独自仮説で、論文の主張ではない = アイデアの種 (i)/(ii)/(iii) は **論文評価ではなく当方発想** として明示
- ResearchGate 経路は 403 Forbidden、IOPscience 公式経由で取得 = 著者の意図と一致する文言は IOPscience 抄録に限定、ResearchGate の追加 PDF が本文の主張をどう拡張するかは未確認
- 当方は GA ループ持たない環境のため、論文の「300 世代 GA 収束」の核心は **再現不能** = 本論文の最大の貢献 (収束保証) を放棄して「目的関数だけ借りる」ので、論文評価としては部分摂取

Log"""

if __name__ == "__main__":
    res = post_message(CHANNEL, MSG)
    print("posted:", res.get("ok"), "ts:", res.get("ts"))
