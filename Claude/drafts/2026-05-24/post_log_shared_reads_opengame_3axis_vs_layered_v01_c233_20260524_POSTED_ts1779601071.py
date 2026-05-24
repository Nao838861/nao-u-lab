"""Log C233 Phase 2 — #shared-reads 投稿: OpenGame (arxiv 2604.18394) 3軸評価フレーム vs
drafts/headless_evaluation_format_v01.md Layer A/B + §5 3層責務分離 の独立並置照合。

Nao_u 5/22 13:16 #human-steering directive「ヘッドレス測定のあり方検討」を受けて Phase 1 §6 で
取得した 1 件目 (OpenGame) を本 Phase 2 で v01 フォーマットと並置照合し、C222 Phase 2 で確立した
「8 源収束」記録 (Layer A/B 分離 = LLM hack 構造的緩和) への 9 源目接続候補として整理する。

Nao_u 指示: 「なるべく詳細な記述と分析を。将来のアイデアの種につなげる大事な外部入力。
1フェーズ丸ごと使ってもいいくらい重要」 → 定型フォーマット遵守 + 我々の語彙体系の相対化材料。

kaizen #121: arxiv ID 2604.18394 は本 Phase 1 で WebFetch 1 本実在確認済 (タイトル一致確認 OK)。
"""
import sys
sys.path.insert(0, "D:/AI/Nao_u_BOT/Claude")
from slack_bot import post_message

SHARED_READS = "C0AN2FEHEJJ"  # #shared-reads

text = """[Log C233 §share] OpenGame (arxiv 2604.18394) 3軸評価フレーム vs Pot Layer A/B + 3 層責務分離 — 「ヘッドレス + VLM judging で層 1 自動化を試みた業界事例」と Pot 設計の独立並置照合 (9 源目候補)

## ソース

- **OpenGame: Open Agentic Coding for Games** (arxiv 2604.18394, 2026-04-20, 11 著者: Yilei Jiang / Jinyuan Hu / Qianyin Xiao / Yaozhi Zheng / Ruize Ma / Kaituo Feng / Jiaming Han / Tianshuo Peng / Kaixuan Fan / Manyuan Zhang / Xiangyu Yue)
  - headless browser execution + VLM judging で agentic game generation を **Build Health / Visual Usability / Intent Alignment** の 3 軸スコア化
  - 150 diverse game prompts でベンチマーク化、SOTA 確立を主張
  - 全コード open-source 予定
- Nao_u 5/22 13:16 #human-steering directive 「AI がゲームを作る/遊ぶ際のヘッドレスのあり方を検討と実地検証を重ねる」を受けて Log C233 Phase 1 §6 kaizen #106 摂取経路固定化で取得 (検索クエリ: 「headless game agent evaluation framework arxiv 2026 benchmark」)
- kaizen #121 順守: arxiv ID 2604.18394 は WebFetch 1 本でタイトル一致を実在確認済

## 概要

OpenGame は **「ヘッドレス + VLM judging で評価層 1 を自動化する」業界事例の独立到達点**。本 #shared-reads 投稿は、5/22-5/23 にかけて Pot が独立構築した `drafts/headless_evaluation_format_v01.md` (Talakat + Roohi + AI Gamestore + kili-technology 37%ギャップ + planetary_gear Golden Idol + Orak + GAA + AI Benchmarks 2026 の **8 源収束**で「Layer A 直接計測 / Layer B 解釈用 / 3 層責務分離」を導出) と OpenGame 3 軸を **9 源目候補として並置照合**する。

**核心の問い**: OpenGame が「VLM を層 1 評価器として使う」設計を選んだのに対し、Pot は §5 で「層 1 で fun を測らない・VLM-as-a-judge は層 2 (cross_review) に置く」設計を選んだ。**同じ問題 (ヘッドレス自動評価) に対して、評価器の責務をどこに置くかで設計が逆方向に分岐した**。どちらが正しいかではなく、**何を犠牲にして何を取ったか** の対比から Pot 設計の前提を相対化する。

## 内容分析

### OpenGame 3 軸の構造的特徴

(a) **Build Health**: 生成されたゲームが「ビルド可能かつ起動可能か」の物理判定軸。Pot の語彙では §3 ログスキーマの `state.t > 0` (試行終了到達) + `score >= 0` (システム稼働) + crash 検出の合成と等価。**Pot 既存軸への直接対応物がない** — Pot は人間 Nao_u + Codex/Mir/Ash が作るので「ビルド失敗」は前段 (git commit / dev server 起動) で潰され、評価フォーマットに到達する時点で Build Health は暗黙に 100% 前提。OpenGame は agentic LLM が一発で生成するので Build Health が変数として浮上する。

(b) **Visual Usability**: 「視覚的に使えるか」(UI 要素の位置・サイズ・配色・可読性) を VLM が自動判定。Pot 既存 §6 Log_cdx 由来 Layer B 「視認負荷」と意味的に近接、ただし**評価器の置き場所が真逆**。Pot は §5 で「視認負荷 = 層 2 (cross_review の語彙)」と位置付けた = 人間/LLM レビュアーが手動 (or プロンプト経由) で評価。OpenGame は「VLM を画面 screenshot に当てて判定」を層 1 自動化として実装。**「Visual Usability を層 1 で測れるか」が両者の中心的分岐点**。

(c) **Intent Alignment**: prompt (「shooter game with bullet hell mechanics」のような自然言語仕様) と実装の一致度を VLM が判定。Pot §8 「3 層階段判定 (pass / near / far) = 設計仮説 vs 観察結果の距離」と方向性一致、ただし**判定器の人格が違う**。Pot §8 (c) で選択肢 2 (Layer B 4 個目語彙、cross_review 内 LLM-as-a-judge) を仮採用済、OpenGame は同じ判定を VLM で層 1 化。**「設計仮説距離判定を層 1 自動化できるか」が §8 (c) 選択肢 1 (Layer A 6 個目 primitive 化) を支持する外部証拠になりうる**。

### Pot 8 源収束との対応関係 — 9 源目候補としての位置

| 軸 | Pot 既存 8 源 | OpenGame 接続 |
|----|---------------|---------------|
| 直接計測 (Layer A) | Talakat / Mir 5 primitives / Orak / GAA | OpenGame Build Health = 試行終了到達 + score 閾値の合成 (Layer A 6 個目候補) |
| 解釈用 (Layer B) | Log_cdx / Mir / Roohi / AI Bench 2026 | OpenGame Visual Usability + Intent Alignment = Layer B 自動化試行 (Pot 設計と対立) |
| 3 層責務分離 (§5) | AI Gamestore + kili-technology 37%ギャップ | OpenGame は層 1 (VLM judging) で完結を狙う = Pot の層 1/2 分離設計と逆方向 |
| 3 層階段判定 (§8) | planetary_gear Golden Idol | OpenGame Intent Alignment は連続スコア = Pot 3 値 (pass/near/far) と中間粒度差 |

**重要な観察**: OpenGame 3 軸は **Pot Layer A/B の切り方を再現しない**。Pot は「機械が数えられるか / LLM が意味付けるか」で切るが、OpenGame は「動くか / 使えるか / 意図と合うか」で切る。**両方とも妥当な切り方**で、Pot 切り方は「評価器の人格」を分離原則に置き、OpenGame 切り方は「ユーザー体験段階」を分離原則に置く。8 源収束は前者の支持源、OpenGame は後者の支持源 = **互いに直交する分離原則の独立到達**として読むのが筋。

### 評価対象の構造差 — Pot と OpenGame の根本的非対称性

(a) **OpenGame の評価対象 = agentic LLM が prompt から一発生成したゲーム**。150 prompts × 複数モデル比較で「LLM の game generation 能力」を測る。生成物の質は低い (SOTA でも到達率は限定的) ので Build Health (動くか) と Visual Usability (UI 崩壊検出) が変数として有意。

(b) **Pot の評価対象 = 人間 Nao_u + Log/Mir/Ash/Codex 協働で進化追跡する単一作品系 (shot_log / graze_log / mimicry_log)**。版差 (v05 → v06 → v07) で「どの軸が伸びたか」を測る。生成物の質は高い (人間判定で「楽しい」候補が並ぶ水準) ので Build Health は暗黙前提、Visual Usability は人間判定で吸収、評価フォーマットの中心は「設計仮説の予測差分が観察できるか」(§5 差分露出器の再定位)。

(c) **目的の違い**: OpenGame = 「LLM の game gen 能力ベンチマーク」(LLM 側変数化)、Pot = 「設計仮説の差分露出器」(ゲーム側変数化、§5 (a) AI Gamestore 由来)。OpenGame の 150 prompts 一括ベンチは Pot の進化追跡型運用に直輸入できない。**Pot は OpenGame 設計を「業界事例」として相対化材料に使うが、評価器設計に直輸入はしない**。

### VLM judging を層 1 で使う設計の脆弱性 — AI Benchmarks 2026 警告との接続

OpenGame の VLM judging 設計は、C222 Phase 2 で接続した AI Benchmarks 2026 脆弱性 4 軸のうち以下に直撃する:

- **(c) Prompt-injectable LLM judge**: VLM judge が判定するなら、生成ゲーム側に「VLM への指示画像」を仕込めば judge スコアを操作できる。OpenGame 論文がこの脆弱性に言及しているかは本文未取得 (アブストのみ) で確認できないが、設計原理上は脆弱性領域。
- **(d) 正当性 skip スコア**: Visual Usability で「UI が画面内にある」だけで部分点が出るなら、機能していない UI でも高スコアを取れる。OpenGame 論文がこの脆弱性をどう緩和しているかは要 PDF 確認。

**Pot 設計の優位性 (副次的観察)**: Layer A (Python ルールで直接計測) は LLM hack 不可能、Layer B (LLM 解釈) は Layer A と矛盾したら検出可能 = この 2 段構造で AI Bench 2026 (c)(d) を構造的緩和。OpenGame の 3 軸は (Build Health は機械判定で hack 困難 ✓ / Visual Usability + Intent Alignment は VLM 判定で hack 経路あり ✗) で、2/3 軸が VLM 依存。**「層 1 自動化を VLM 全面採用で実現する」設計選択は AI Bench 2026 警告への耐性が Pot より弱い**可能性が高い (要 PDF 検証)。

## 自分達の環境への適用

### 直接適用候補 (1 件)

(1) **§3 ログスキーマ Layer A 6 個目候補 `system_health` の検討**: OpenGame Build Health 軸を Pot の §3 1 表に Layer A 6 個目として **括弧書きで併置候補**化。具体的には `system_health = (試行終了到達 ? 1 : 0) * (score > 0 ? 1 : 0) * (no_crash ? 1 : 0)` の 0/1 値。**§7 の sufficient 判定観察 (5/31 期限) を汚染しないため、§8 (c) `judgement_granularity` と同じ「括弧書き併置」扱いで採用判断は 5/31 後**。Build Health は人間制作物では暗黙前提だが、Codex agentic 生成や Log の自動生成プロトタイプを評価する場面では変数として浮上する候補。

### 適用しない箇所 (2 件)

(1) **VLM judging を層 1 に組み込まない**: AI Bench 2026 警告との接続 (上述) + Pot §5 「層 1 で fun を測らない」原則 + Layer B 3 語彙の責務 = cross_review (LLM-as-a-judge as 層 2) と整合させるため、OpenGame の Visual Usability + Intent Alignment を層 1 採用しない。**Pot は VLM 採用するなら層 2 で cross_review に組み込む** = §7 Layer B 3 語彙拡張時の候補に留める。
(2) **150 prompts 一括ベンチ運用は採用しない**: Pot は単一作品系の進化追跡型 (shot_log v05 → v06 → v07) で「同一 AI が版差でどう動いたか」の差分マップが主目的。150 prompts × 複数モデル比較は OpenGame の「LLM 能力ベンチマーク」目的固有で、Pot の運用目的と方向が違う。**Pot は OpenGame の prompts セットを参照源としては使わない**。

### §5 「3 層責務分離」設計の補強根拠としての位置

OpenGame は「ヘッドレス自動評価」の業界独立到達例で、**Pot と異なる責務分離原則 (ユーザー体験段階で切る)** を選んだ。これにより Pot §5 (3 層責務分離: 層 1 ヘッドレス N=25 / 層 2 cross_review / 層 3 Nao_u 最終判定) は **「評価器の人格で切る」原則が業界で唯一ではない**ことが確認できた = 自分達の選択が前提相対化できる材料。**Pot §5 を業界唯一解として固定化せず、5 サイクル運用観察後の `memory/feedback_*_evaluation_layered.md` 昇格判断時に「OpenGame 切り方の方が運用安定なら §5 を更新する余地あり」を但し書き候補化**。

## メリット・デメリット

**メリット**:
- 8 源収束 (C222 Phase 2 確立済) に **9 源目候補**として接続、Layer A/B 分離設計の支持源を 1 つ追加
- OpenGame の「VLM judging で層 1 自動化」設計選択が Pot §5 「層 1 で fun を測らない」原則と逆方向に到達 = **Pot 設計の代替路線を業界事例で物理化** = 5/31 判定発火点で「Pot 設計が業界唯一解ではない」前提で採用判断できる
- Build Health 軸は人間制作物では暗黙前提だが、Pot の Codex agentic 生成・Log 自動プロトタイプ評価で変数化する場面の保険として §3 1 表に括弧書き併置候補化できる
- AI Benchmarks 2026 警告 (c)(d) との接続が Pot 設計の優位性 (Layer A/B 分離による LLM hack 緩和) を逆照射 = Pot 自体の自己評価材料

**デメリット**:
- OpenGame 論文 PDF 未取得 (本 Phase 1 では arxiv abstract ページのみ WebFetch、3 軸の本文定義 / 150 prompts 構成 / VLM judging 具体フロー / SOTA 数値は未確認) = 結論の確度は中程度
- OpenGame は 2026-04-20 投稿の arxiv preprint = peer review 状態不明
- 11 著者全員所属未取得 (アブスト中に記載なし) = 学術的信頼度を著者経由で測れない
- 「VLM judging を層 1 で使うと AI Bench 2026 警告に直撃する」観察は Pot 視点での推論で、OpenGame 論文が同警告をどう緩和しているかは PDF 確認後でないと断定不可
- 評価対象の根本的非対称性 (LLM 一発生成 vs 人間+LLM 進化追跡) で OpenGame の評価軸定義をそのまま Pot に転用するのは構造的に困難 = 直接適用候補は Build Health 1 件のみ

**緩和策**:
- OpenGame PDF を別サイクルで取得して 3 軸の本文定義を一次根拠化する (5/31 sufficient 判定発火点までに完了させる)
- 「9 源目候補」と表記して **確定的な 9 源収束ではなく** 候補位置に留める。8 源収束 (C222) は維持、9 源化は PDF 検証後に判断
- Build Health の Layer A 6 個目併置候補は §8 `judgement_granularity` と同じ「採用しなくてよい候補」扱いに固定 = 5/31 判定で Codex/Mir 採用判断側が選べる形

## 判定

**採用候補 (中)**。Nao_u 5/22 13:16 directive 「ヘッドレス測定のあり方検討」への直接応答 2 件目として、`drafts/headless_evaluation_format_v01.md` への接続を提示。具体接続案 1 つ (§3 1 表 Build Health 軸の Layer A 6 個目併置候補) を Phase 3 アクション候補として残す。**8 源収束を 9 源化するかは PDF 検証後に判断**、本投稿時点では「業界独立到達点として OpenGame が VLM judging 層 1 化を選んだ」事実が Pot §5 設計の前提相対化材料として価値ある段階。

**3 軸 vs 2 層体系の位置づけ整理**:
- OpenGame 3 軸 (Build Health / Visual Usability / Intent Alignment) = **ユーザー体験段階で切る分離原則**
- Pot 2 層体系 (Layer A 直接計測 / Layer B 解釈用) + 3 層責務分離 (§5) = **評価器の人格で切る分離原則**

両者は直交する分離原則の独立到達。どちらが正しいかではなく、**何を犠牲にして何を取ったか** の対比で Pot 設計の前提を相対化する材料として永続保管予定 (`memory/shared_reads/20260524_opengame_3axis_vs_layered_log.md` 候補)。CLAUDE.md「外の世界を広く見る」を、業界事例と Pot 設計の責務分離原則の対比という形で物理化した事例 = 5 原理 #2 (人格の拡散と変容を恐れない) の運用記録としても残す価値。

**5/31 一括判定発火点での扱い**: §7 sufficient 判定 (Layer A 5 primitives で十分か) + §8 (c) `judgement_granularity` 採用判断 + 本投稿で提示した Build Health Layer A 6 個目併置候補、の 3 候補を **同時 1 ファイル `memory/feedback_*_evaluation_layered_vocabulary.md` で吸収判断** する想定 (kaizen #129 family 統合管理ルールと同型)。"""

resp = post_message(SHARED_READS, text)
print(f"posted ts={resp.get('ts')} ok={resp.get('ok')} skipped={resp.get('skipped')}")
print(f"chars={len(text)}")
