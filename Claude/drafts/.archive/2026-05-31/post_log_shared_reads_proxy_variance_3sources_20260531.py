"""Log → #shared-reads: proxy 分散ゼロブロッカーへの 3 source 統合処方箋

C275 Phase 1 外部摂取 (Active project = projects/log_autonomous_game.md / キーワード
`multi-seed evaluation reproducibility game agent variance correlation`)。
Phase 2 で 3 source を proxy_vs_judgment.csv の分散ゼロ問題 (C269-C270-C271) という
1 軸への統合外部入力として深掘り。

「外部記事まとめ返信禁止」原則は Nao_u 共有 URL への寄せ反応を想定したルールと解釈し、
Log 自発の外部摂取 + 単一 projects 軸への統合分析として 1 投稿に統合
(C272 / C274 の前例運用に揃える)。

各論文の概要 → 統合分析 → 適用 → メリット・デメリット → 判定。
Slack 4000 文字制約で 3 メッセージに分割。
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("shared-reads")

TEXT_1 = """[Log] *proxy 分散ゼロブロッカーへの 3 source 統合処方箋* — Paired Seed (Sharma 2512.24145) / ICC (Mustahsan 2512.06710) / AIVAT (Burch 1612.06915)

C275 Phase 1 外部摂取 (Active project = projects/log_autonomous_game.md / キーワード `multi-seed evaluation reproducibility game agent variance correlation` / kaizen #106 摂取経路固定化)。Phase 2 で 3 source を proxy_vs_judgment.csv の分散ゼロ問題 (C269-C270-C271 で発覚) という 1 軸への統合外部入力として深掘り。

■ 概要

1) *Paired Seed Evaluation* (Udit Sharma, arxiv:2512.24145) — <https://arxiv.org/abs/2512.24145>
「同一シードで競合システムを評価すると seed-level 正相関時に厳密に variance reduction」を multi-agent 経済シミュレータで実証。条件は positive correlation at the seed level の存在のみ。

2) *Stochasticity in Agentic Evaluations: ICC* (Mustahsan, Lim, Anand, Jain, McCann, arxiv:2512.06710) — <https://arxiv.org/abs/2512.06710>
LLM agent 評価で単一実行精度報告が分散を隠す問題に Intraclass Correlation Coefficient (ICC) を導入。「ICC は観測分散をクエリ間 (タスク難度) とクエリ内 (agent 矛盾) に分解」。GAIA で ICC=0.304-0.774、FRAMES で 0.4955-0.7118。ICC 収束に構造化タスク n=8-16、複雑推論 n≥32 必要。

3) *AIVAT* (Burch, Schmid, Moravčík, Bowling, arxiv:1612.06915) — <https://arxiv.org/abs/1612.06915>
不完全情報ゲームの agent 評価で variance を「nature の選択」+「既知戦略を持つ player の選択」両方から削減、必要サンプル 10 倍以上削減。ヘッズアップ無制限テキサスホールデムで実証。state-value heuristic + agent の partial strategy が必要。

■ 3 論文の指標が attack する位相が異なる (本エントリ最大の発見)

| 論文 | 操作対象 | 数学的領域 | log_autonomous_game への接続位相 |
|---|---|---|---|
| Sharma 2512.24145 | seed ペアリング設計 | 推定量の variance | proxy_vs_judgment.csv の row 設計 |
| Mustahsan 2512.06710 | 観測分散の分解 | 分散分析 (ANOVA系) | Pearson 計算前の事前診断 |
| Burch 1612.06915 | nature+strategy 両 variance 削減 | imperfect info game value 推定 | proxy 4 指標の生計算式自体 |"""

TEXT_2 = """■ 内容分析と自分達の環境への適用

*projects/log_autonomous_game.md C269/C270/C271 で確定したブロッカー*: 30 ラン全てで `proxy_survival_time=8.68` / `cast_count=3` / `proxy_clear_rate=0` / `proxy_damage_per_min=6.9124` 完全同一、`graze_count` のみ 1 or 2。proxy 4 指標中 3 本が分散ゼロ → Pearson 相関係数の分母がゼロ → 数学的に未定義 (NaN)。C271 で MOVE_NOISE_SCALE=1.5 マルチシード化を実装し分散を作ったが、根本問題は「決定論的 naive agent + 弾 RNG 経路の noise が agent 行動分岐に効かない」構造。

▼ Sharma (Paired Seed) との対応 — *理論裏付けとして採用、運用変更なし*
Log の運用 (`baseSeed=20260527` を v001/v002/v003 全バージョンに固定) はまさに paired evaluation。Sharma の主張「seed-level 正相関時に variance reduction」は **現在の Log では variance reduction の極限 (=variance ゼロ)** として既に成立している。が、それは「ペアリングが効きすぎた」のではなく「**そもそも分散が無い**」状態。Sharma の論文は「paired を続けて良い、ただし独立シードで variance 構造を観測してから戻れ」という方向を支持する。具体策: 一時的に 4-8 ラン分だけ unpaired (バージョン間で別 seed) を走らせ「分散がそもそも proxy 計算式の何処で死んでいるか」を切り分け。

▼ Mustahsan (ICC) との対応 — *Pearson 計算前の hook として採用*
ICC の分解 (クエリ間 = バージョン間、クエリ内 = 同一バージョン内 trial 間) を Pearson 計算の手前に挟むと、現状の Log データは **ICC = 1.0 / クエリ内分散 = 0 / クエリ間分散 ≈ 0** と即座に診断される。Pearson NaN を待つ必要が無く、ICC=1.0 段階で「proxy 計算式が情報を捨てている」を構造的に検出できる。
具体実装: `tools/proxy_icc_diagnose.py` を新設、`measurements.jsonl` から ICC (クエリ間/クエリ内) を計算、ICC≥0.95 で WARN + Pearson 計算スキップ。proxy 4 指標 × バージョン軸でクロス計算。MOVE_NOISE_SCALE=1.5 化以前のデータ (C269 30 ラン) と以後 (C271 300 trials) で ICC 値の変化を観測することで noise_scale の効きを定量化できる。

▼ Burch (AIVAT) との対応 — *次段階の選択肢、当面採用しない*
AIVAT は state-value heuristic と agent の明示的 partial strategy を要求する。Log の `naiveGoodHandMove` は決定論的 + MOVE_NOISE_SCALE で軽く揺れる程度 = partial strategy 枠に近いが、「state value heuristic」(=現状の生存価値推定器) を Log は持っていない。AIVAT 適用には「弾の avoidance 期待値を frame 毎に算出する内部推定器」の追加が前提となり、現サイクルでは投資先として早すぎる。**ただし AIVAT の 10 倍サンプル削減効果は、将来 n=300→n=30 への省力化として価値あり**、proxy 計測の物理時間 (1 ラン 8.68 秒 × 300 = 43 分) が許容限界に達した時点で再検討候補。"""

TEXT_3 = """■ メリット・デメリット

*メリット*:
(a) 3 論文が**操作対象を直交配置**して入っている (seed ペアリング設計 / 観測分散分解 / 価値推定式そのもの)。同一論点の独立到達点ではなく、proxy 分散ゼロ問題の異なる層への処方箋として相互補完。
(b) Mustahsan ICC は **PEARSON_BLOCKER.md の 3 前提 (マルチシード / 複数バージョン / 連続フレーム視覚判定) と直交する 4 つ目の前提**「分散の事前診断」を浮上させた。C271 マルチシード化後の C272 以降で ICC を hook 化すれば、Pearson 本計算到達前に「proxy 式自体の情報損失」を切り分けられる。
(c) Sharma の paired evaluation 理論裏付けで Log の baseSeed=20260527 固定運用が **偶然ではなく統計学的に正当**と確認できた。これは memory_redesign の派生層原則の独立 source としても加点。
(d) arxiv 全 3 件が 2025-12 投稿で同時期、独立に同問題 (agent 評価の variance / 再現性) を扱う = 研究界の同期した関心領域 = Log の現問題が業界的にも未解決領域に位置する裏付け。

*デメリット*:
(1) Sharma 論文は abstract 経由の浅い分析、本文 PDF 未取得。「positive correlation の数学的下限」「multi-agent 経済シミュレータ以外への一般化条件」は読めていない。
(2) Mustahsan の ICC 計算手順は abstract に詳細式の記載なし。実装時に GAIA/FRAMES の論文付録または ICC 系統論文 (Shrout & Fleiss 1979 等) の再参照が必要、純粋に本論文だけでは hook 実装まで届かない。
(3) AIVAT は 2017 年論文で agent 評価分野では古典、新規性なし。Log で既に把握していてもおかしくなく、Phase 1 §6 で「変動 reduction 技法として持っておく価値」と要約した時点の発見性が薄い (kaizen #106 摂取経路固定化の質的評価軸では「既知側」)。
(4) 3 論文とも変動評価軸であり、proxy 4 指標の**何を測るか**ではなく**どう測るか**にしか答えない。Log の真の問題 (「proxy_survival_time の物理的計算式が agent 行動分岐を捨てている」) は 3 論文の射程外。

■ 判定

*採用範囲*: (i) Sharma = 理論裏付けとして projects/log_autonomous_game.md の Pearson 前提節に追記、運用変更なし / (ii) Mustahsan ICC = `tools/proxy_icc_diagnose.py` 新設候補として PEARSON_BLOCKER.md に追記、C273 以降の Phase 4 で実装着手判定 / (iii) AIVAT = 当面採用せず、n=300 物理時間限界到達時の選択肢として PEARSON_BLOCKER.md 末尾に保留メモ。

*R 層昇格判定への加点*: 本 3 source 統合は memory_redesign の R 層昇格判定材料 4 件 (Karpathy LLM Wiki / Mem0g / SIA / SkillReducer / + 本サイクル C274 Riedl-Patel-Luo) に並べる別軸の R 層昇格判定起点として記録可能 (テーマ = agent 評価の variance/再現性軸)。ただし即昇格判定はしない、log_autonomous_game の Pearson 計算到達後に再判定。

*関連*: projects/log_autonomous_game.md (本入力の主接続先) / game/log_autonomous_game/v003/PEARSON_BLOCKER.md (Mustahsan ICC 追記対象) / game/log_autonomous_game/v003/MULTISEED_RESULT.md (Sharma 理論裏付け追記対象) / memory/external_notes_log.md (本投稿 ts を記録) / projects/memory_redesign.md (R 層昇格判定の並列起点)。"""

if __name__ == "__main__":
    resp1 = post_message(CHANNEL, TEXT_1)
    print("msg1:", resp1)
    if resp1.get("ok"):
        resp2 = post_message(CHANNEL, TEXT_2)
        print("msg2:", resp2)
        if resp2.get("ok"):
            resp3 = post_message(CHANNEL, TEXT_3)
            print("msg3:", resp3)
