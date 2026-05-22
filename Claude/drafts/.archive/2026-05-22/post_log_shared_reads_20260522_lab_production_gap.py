"""Log → #shared-reads: AI Benchmarks 37% gap (kili-technology) — ラボ評価と実環境の落差をゲーム制作の自己評価盲点へ転用"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from slack_bot import post_message, _resolve_channel

channel_id = _resolve_channel("shared-reads")
assert channel_id, "could not resolve #shared-reads channel"

text = """[Log] AI Benchmarks 2026: Top Evaluations and Their Limits — ラボベンチ vs 実環境の 37% ギャップを、ゲーム制作の「自己ヘッドレス評価 vs 人間プレイヤー本番」ギャップに転用する

## ソース
- **kili-technology blog**: <https://kili-technology.com/blog/ai-benchmarks-guide-the-top-evaluations-in-2026-and-why-theyre-not-enough>
- 詳細永続コピー: `memory/external_notes_log.md` 5/22 エントリ

## 概要
エンタープライズ agentic AI を題材に、「ラボベンチマークと実環境デプロイで **37% のスコア乖離**が観測される」を中心命題に置いた評価設計レビュー記事。主な指摘は3点。(1) **構造的ミスマッチ**: ベンチマークは「single-turn / closed-ended / 統制条件」を測るが、実環境 AI は「チームと連続的に対話 / 曖昧入力 / 長時間連続稼働」する。(2) **品質問題**: 人気ベンチマークでアノテーション誤り率が「50% を超える」事例がある、モデルが「ベンチかデプロイかを見分けて gaming する」、MMLU 88% 超は「統計ノイズ」と言える領域。(3) **対処策**: 単一手法に頼らず、`automated metrics for coverage` + `LLM-as-a-judge for screening` + `human expert review for domain-specific correctness` の **layered evaluation** を採る。

## 内容分析
本記事は AI エージェント評価の話だが、構造はそのままゲーム制作の評価盲点に写像できる。我々の評価系列は今こうなっている:

| 層 | 我々の現在 | 記事の指摘との対応 |
|---|---|---|
| ベンチ層 | ヘッドレス評価 (Talakat strategy/dexterity 軸、AI Gamestore 流の固定プレイヤー) | "single-turn / closed-ended / 統制条件" |
| 中間層 | cross_review (Log/Mir/Ash の合議) | "LLM-as-a-judge" の自前版 |
| 本番層 | Nao_u が触る / 自分達が遊ぶ | "human expert review" / "production deployment" |

論文の中核主張「ラボと本番で 37% ギャップ」は、我々の文脈ではこう翻訳される。**ヘッドレス評価がどんなに精緻でも、Nao_u が「mimicry_log は graze と何が違うのか分からなかった」(5/21 02:04 ts=1779289298) と一言で潰しに来るギャップを、構造上吸収できない**。記事の構造的ミスマッチ指摘 (single-turn / closed-ended / 統制) は、まさにヘッドレス評価が短時間 episode・固定 seed・既定終了条件で動かす性質そのもの。**ヘッドレス評価は「ゲームの構造を露出させる装置」であって「面白さを判定する装置」ではない**、を 37% という具体数値で支える。

「アノテーション誤り率 50% 超」「モデルが gaming する」も読み替えが効く。前者はラベル品質問題 → 我々で言えば **R-A〜R-I の表現が安定しても、各事例にどの R を当てるかの誤判定率は別問題** ということ (C220 oktamajun atom で Q0 ラベルが空洞化した話と同型)。後者は「モデルがベンチを見分けて挙動を変える」→ 我々の文脈では **ヘッドレス評価で良い数値が出るように設計を歪める誘惑**。ai_player.py の挙動を予測した上でゲームを調整したら、それは Goodhart の法則。

layered evaluation の処方 (automated coverage + LLM judge + human expert) は、すでに我々の運用構造に対応物がある (ヘッドレス + cross_review + Nao_u 判定)。**新しいのは、各層が独立に何を測っているのかを陽に書き出す思想**。今は「3層全部やる」が混ざっていて、どの層が何の盲点を埋めているのか・どの層を厚くすると他層が薄くて済むのか、設計判断ができていない。

## 自分達の環境への適用
1. **「ヘッドレス評価の射程」を文書化する**: drafts/headless_evaluation_format_v01.md (Log 5/21 23:43 既出) に **§0「この評価器が見ない盲点」** 節を追加。「短時間 episode しか測らない」「初見の認知摩擦は出ない」「美しさ / 期待値の裏切りは出ない」を陽に書く。これで cross_review・Nao_u 判定が何の穴を埋めているかが構造化される。
2. **層間の独立性チェック**: 「ヘッドレス評価で良かった案 → cross_review で同方向に支持された案 → Nao_u 判定で逆方向に潰された案」というデータが C218/C220 でも実際に発生している (mimicry_log v01 5/20 23:01 → 5/21 02:04 Nao_u 一発否定)。**層間の不一致をログに集めて、どの層が予測力 0 なのかを 5 サイクルで測る**。
3. **「gaming」ガード**: ai_player.py の挙動を見て shot_log を調整する誘惑を制度的に断つ。具体には、ai_player.py のヒューリスティック (回避閾値・連射 cooldown) を **shot_log v?? 着手前に固定し、評価実行後も変えない**。変えるなら別 ID で並走させる (Talakat の MAP-Elites と同じく評価器側の進化は別軸)。
4. **annotation 誤り率の自検**: R-A〜R-I の各 R を **過去 atom 20 本に対してどれが正しく該当するか** を Log_cdx と独立判定して、一致率を測る。50% を切る R があれば、定義の曖昧さが現場で機能していない指標 (Phase 1 §6 で観察済 / Q0 ラベル空洞化と同型)。

## メリット・デメリット
**メリット**:
- 「ヘッドレス評価さえ作れば自己判定が完結する」幻想にブレーキをかける具体数値 (37%) が得られる
- layered evaluation の語彙で、ヘッドレス / cross_review / Nao_u 判定の役割分担が陽に書ける (今は暗黙)
- 「gaming する」概念で、評価器を見ながらゲームを最適化する Goodhart リスクを制度的に防げる

**デメリット**:
- 37% はエンタープライズ agentic AI の固有値で、ゲーム制作に直接の数値根拠ではない (構造的類比に過ぎない)
- layered evaluation の「human expert review」は Nao_u の時間に依存しており、我々は無制限には使えない (Slack 即時応答最優先と相反する場面もある)
- 記事は AI 評価設計者向けで、ゲーム制作者がそのまま参照する文脈ではない — 適用は我々の責任

## 判定
**採用（評価盲点の言語化として）**。次の C221 以降:
- (a) `drafts/headless_evaluation_format_v01.md` §0 盲点節 + §4 layered eval 配置節を追記
- (b) `memory/feedback_*_evaluation_layered.md` (新規候補) に「ヘッドレス + cross_review + Nao_u 判定の役割分担」原則を 1 本書く前に、5 サイクル分の層間不一致データを溜める (即ルール化禁止、CLAUDE.md「同型反復が複数回確認できてから原則化」順守)
- (c) ai_player.py 着手時に「評価器の固定」を commit message レベルで明示

URL: <https://kili-technology.com/blog/ai-benchmarks-guide-the-top-evaluations-in-2026-and-why-theyre-not-enough>"""

result = post_message(channel_id, text)
print(result)
