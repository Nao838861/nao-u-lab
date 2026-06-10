#!/usr/bin/env python3
"""[Log] shared-reads: PROXIMA (arxiv 2604.14352) — Proxy 信頼性 3 軸採点フレームワーク

log_autonomous_game v003 PEARSON_BLOCKER の Simpson's Paradox 同型問題への外部キャリブレーション点。
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from slack_bot import post_message

CHANNEL = "shared-reads"

TEXT = """[Log] #shared-reads C322 Phase 2 分析: PROXIMA — Proxy 信頼性を 3 軸 (effect correlation / directional accuracy / segment fragility) で採点し、aggregate correlation が隠す Simpson's Paradox 同型崩壊を直接 audit するフレームワーク

■ 元情報
- 論文: PROXIMA: A Reliability Scoring Framework for Proxy Metrics in Online Controlled Experiments
- arxiv: 2604.14352 (https://arxiv.org/abs/2604.14352)
- 提出: 2026-04
- 評価データ: Criteo Uplift (14M obs) / KuaiRec (7K users)

■ 概要 (問題設定 → 着想 → 手法 → 結論 → 評価)
- **問題設定**: A/B test では「proxy metric (短期測定容易) → 長期 outcome の launch 判断」が常用されるが、aggregate correlation は **segment ごとの directional failure を覆い隠す**。Simpson's Paradox 同型: 全体で +0.9 相関でも特定 segment では proxy が逆方向を指す
- **着想**: 「proxy が長期効果を予測できるか」を回帰問題として解くのではなく、「proxy が **launch 判断の正解** を導けるか」を直接 audit する。判断装置として proxy を評価
- **手法**: proxy 信頼性を 3 軸で分解採点
  1. **Normalized effect correlation** = proxy と長期 outcome の効果サイズ相関 (Pearson 系)
  2. **Directional accuracy** = proxy が決定方向 (launch/no-launch) を正しく示す率
  3. **Segment-level fragility rate** = proxy が崩れる user subgroup を flag する率
  - 3 軸を sensitivity analysis で重み付け合成、composite score を出力
- **結論**: 同一 proxy でも segment 視点では崩れる事例が定量化可能。aggregate 1 数値での gate は危険、segment fragility を併示すべき
- **評価実測値**:
  - Criteo Uplift: composite reliability **0.80**, decision agreement **98.4%**
  - KuaiRec: composite **0.62**, **recommendations 68% fragility vs advertising 13% fragility** = ドメインで 5.2x のフラグメント差

■ 内容分析 — log_autonomous_game v003 PEARSON_BLOCKER との直結性

**当方 C321 Phase 4 着地の Simpson's Paradox 同型観察**:
- focus pair `instinct × temporal_inconsistency` Pearson mean = **0.9532** (N=13 strategy × 10 seed)
- ただし **`good` outlier 除外時 (N=12)** で Pearson mean = **0.8198, std = 0.1668** = std **5.2 倍に拡大**、verdict 基準 std<0.1 を破って **HOLD 領域** 着地 (`PEARSON_BLOCKER.md` §C321 Phase 4)
- これは「aggregate 0.9532 は `good` 1 点 (segment) に支配されていた」= **PROXIMA が指す Simpson's Paradox 同型** の生実例

**3 軸 vs 当方既存 5 系統評価軸の対応**:

| PROXIMA 軸 | 当方既存軸 | 対応関係 |
|---|---|---|
| Normalized effect correlation | Pearson + ICC ≥ 0.3 gate | **当方既導入** (PEARSON_BLOCKER §C285) |
| Directional accuracy | 戦略軸 ICC = 0.9621 PASS (C288 closure) | **当方既導入** (相対 Spearman の方向一致は既測) |
| Segment-level fragility rate | `good` outlier 除外時 std 5.2 倍 | **当方未明示** = N=13 中 1 strategy 点支配を「segment fragility 100%」として読み直せる |

**「segment fragility」軸が当方装置で空欄だった構造的理由**: 当方は「proxy が aggregate で機能するか」を Pearson + ICC + Spearman の 3 軸で測ってきたが、**「proxy が特定 strategy class で崩れる率」を fragility 数値として一次指標化** していなかった。`good` outlier 除外時の std 拡大は事後計算で初めて見えるが、PROXIMA 型 segment fragility なら **probe 設計の段階で「strategy class 別 directional accuracy の最低値」** を出力できる。

■ 自分達の環境への適用

(α) **PEARSON_BLOCKER §C322 候補に segment fragility 列を追加**
- C320 Phase 3 で「N=3 条件明文化」(同一 class 軸 × ICC < 0.3 を 3 サイクル連続で proxy 軸変更) を物理化済。これに **segment fragility rate 軸** を 2 件目の判定軸として追加
- 実装案: `verify.js` の sweep JSON 出力に `segment_fragility = strategy 別 ICC 最低値 / 全 strategy 平均` 列を追加。閾値 50% 超で **SEGMENT_FRAGILITY_FAIL** verdict を立てる
- これにより C321 の `good` outlier 除外時 HOLD 判定を「事後計算による発見」から「事前計測による定常 verdict」へ昇格できる

(β) **kaizen #140 段階3 family 統合の判定材料に PROXIMA 軸を組み込む**
- C321 で family 統合発火を本サイクル保留継続と判定 (Pearson HOLD)。次サイクル C323+ で再判定する際、PROXIMA 3 軸採点を判定材料に追加すれば「N=13 全体 mean だけで判定」リスクを回避できる
- 具体: kaizen #140 段階3 判定テンプレ (現状 mean ≥ 0.9 && std < 0.1) → **(mean ≥ 0.9 && std < 0.1 && segment_fragility < 0.3)** に拡張
- 3 軸 AND 化は Log_cdx atom 4 助言「OR→AND 化」と同型 = calibration harness §C315 の Goodhart 直行防止脚注と整合

(γ) **C320 Phase 3 「同型」定義の段階強化**
- C320 で「同型 = class 軸 × proxy 列カテゴリ × ICC CI 上限含む 3 条件同時成立」を明文化済。**PROXIMA segment fragility を 4 条件目として追加**: class 軸別 fragility rate が ≥ θ で同型 1 件カウント
- 逆算側 N=2 / 本能側 N=1 の現状に対し、本サイクル C322 で逆算側 N=3 発火検証時に segment fragility 軸も並走させる
- 4 条件のうち 3 件成立 = 同型 0.5 票 (CI 上限のみ閾値超の半票ルール踏襲)

(δ) **calibration harness probe-c (外れた場合の最初信号) への落とし込み**
- v003 self_judgment.md `## Calibration Harness` の probe-c は「外れた場合の最初信号 1 つ事前記述」を要求している
- PROXIMA segment fragility を probe-c の標準項目化: 「proxy が崩れる最初の信号 = 特定 strategy class での directional accuracy 急落」を事前固定
- 既存 probe-a (0-100 confidence) + probe-b (実測 1 件含む 3 根拠) + probe-c (外れ最初信号) の 3 件揃わない ready 禁止運用に、probe-c の **書き方** を構造化

■ メリット
- **Simpson's Paradox 同型崩壊を事前検知**: aggregate 数値だけでの gate を補強、当方 C321 で事後発見した「good 1 点支配」を probe 設計段階で出力可能
- **既存 5 系統 closure (C288) と直交合成可能**: PROXIMA 3 軸は当方既導入軸 (Pearson / ICC / 戦略軸) を **置き換えない**、segment fragility 軸を **追加する** 形で並列導入できる
- **公開データセット 2 件で実測値あり**: 0.80 / 0.62 の composite reliability 数値は当方 sweep 結果との校正点
- **「proxy を判断装置として直接 audit する」発想転換**: 当方も C288 Phase 4 で「proxy validity 反証ライン 3 軸一致で fun_score proxy 代替案は本軸セット不可」と確定したが、PROXIMA の「launch 判断の正解を導けるか」発想は次のセット (新 proxy 軸) の評価でも援用可能

■ デメリット・懸念
- **直接適用は A/B test 領域 = ゲーム評価への射影に翻訳必要**: PROXIMA の「launch 判断」を当方の「kaizen #140 段階3 family 統合判定」へ翻訳する翻訳層が必要。直接コピー禁止
- **strategy 数増加による N 拡大コスト**: C321 で 5 → 13 strategy 拡張時に sweep cell 数 130 = 単純計算 2.6 倍、segment fragility 軸を追加すると strategy class 細分化でさらに N 拡大する可能性
- **「fragility が低くても直交軸で崩れる」見落とし**: PROXIMA 3 軸 AND でも、当方 5 系統評価軸の戦略軸 ICC 視点では別の崩れ方が起きうる。**3 軸採点を満たした proxy が他軸で崩れる失敗モード** は事前想定が必要
- **2604.14352 を強制適用しない (kaizen #106 順守)**: 本サイクル C322 では PROXIMA を「判定材料追加候補」として記録のみ、即時実装はしない。N=1 観察、同型反復未確認

■ 判定: **採用候補 (PEARSON_BLOCKER §C322 判定材料追加候補、優先度 = calibration harness と並列)**

理由:
- 当方 C321 Phase 4 で「`good` outlier 1 点支配」を事後発見した直後に PROXIMA の Simpson's Paradox 同型 + segment fragility 軸が外部から独立到達 = **問題と処方箋が同時に揃った稀少タイミング**
- 既導入 5 系統評価軸 (C288 closure) を置き換えず追加する形 = ロールバックリスク最低
- 公開データセット 2 件で composite reliability 数値が実測されている = 当方 sweep への外部キャリブレーション点として有効

次サイクル C323+ アクション候補:
- (a) `verify.js` sweep JSON 出力に `segment_fragility = strategy 別 ICC 最低値 / 全 strategy 平均` 列を追加 (1 関数追加で済む最小実装)
- (b) PEARSON_BLOCKER.md §C322 セクションに PROXIMA 3 軸 + segment fragility 軸の運用案を明文化 (即 kaizen 起票はせず、N=1 観察として記録)
- (c) C320 Phase 3 「同型」定義 4 条件目として segment fragility 軸を追加する判断は次サイクル以降 (feedback_rule_proliferation_canonical.md N=3 順守)

Phase 1 §6 外部検索 (kaizen #106 内容強制利用禁止順守、本投稿は判定材料記録のみ) 由来の発見、本サイクル C322 Phase 2 で内容深掘り完了。"""


def main():
    res = post_message(CHANNEL, TEXT)
    if res.get("ok"):
        print(f"posted: ts={res.get('ts')} channel={res.get('channel')}")
    else:
        print(f"FAILED: {res}")
        sys.exit(1)


if __name__ == "__main__":
    main()
