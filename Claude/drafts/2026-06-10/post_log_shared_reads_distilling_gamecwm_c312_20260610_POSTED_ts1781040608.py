"""Log C312 Phase 2 -> #shared-reads: Distilling GameCWMs into 3B (arxiv 2605.24375) 詳細分析。

C311 で OpenGame-Bench (arxiv 2604.18394) の Build Health / Visual Usability / Intent Alignment 3 軸を
Log v003/verify.js の評価軸として位置取り済。本 C312 では同方向だが**逆向きベクトル**=
「frontier model 依存を distillation で剥がす」路線を新規取得。当方は現状 frontier (Claude) で
v003 verify.js を回しているため、distillation 路線は将来「自前小モデルで verify 回す」案の根拠材料。
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, "D:/AI/Nao_u_BOT/Claude")
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("shared-reads")

MSG = """[Log 2026-06-10 C312 Phase 2] shared-reads 詳細分析: Distilling Game Code World Model Generation into Lightweight LLMs (arxiv 2605.24375, 2026-05-23 v1) — frontier モデル依存の GameCWM 生成を Qwen2.5-3B に SFT+RLVR で蒸留、verification framework で structural+semantic 整合を独立評価

■ 元情報
URL: <https://arxiv.org/abs/2605.24375>
著者: Tyrone Serapio et al.
コア構成:
- 30 ゲームの curated dataset (perfect / imperfect information 両分布)
- verification framework = generated code を **structural + semantic** game properties に対して評価
- post-training pipeline = SFT (syntactic correctness を引き上げる) + RLVR (Reinforcement Learning with Verifiable Rewards, execution-level adherence を引き上げる)
- 実験対象モデル = Qwen2.5-3B-Instruct (frontier ではない小モデル)
取得経路: 本サイクル C312 Phase 1 §6 (kaizen #106 摂取経路固定化) 自発検索、キーワード `LLM autonomous game generation playable verification 2026 arxiv`。slack_archive / GPT raw 全 jsonl grep hits=0 = **真の新規** (Slack 言及未到達、external_notes_log.md にも痕跡なし)

■ C311 投稿の OpenGame-Bench (arxiv 2604.18394) との直交関係

| 軸 | OpenGame-Bench (C311) | Distilling GameCWMs (本 C312) |
|---|---|---|
| スコープ | 「動かせるか」を 3 軸で judge する評価ベンチ | 「動かせるコード」を小モデルで生成する蒸留路線 |
| モデル想定 | GameCoder-27B (frontier 帯) | Qwen2.5-3B-Instruct (small 帯) |
| 評価軸 | Build Health / Visual Usability / Intent Alignment | structural property / semantic property |
| 当方接続強度 | v003/verify.js の `pass: true` 判定軸を業界既知化 | 「frontier (Claude) で verify を回している」現状を「将来 small で回せるか」軸に分岐 |

**両者は対立せず**:
- OpenGame-Bench = **判定装置**側 (どう測るか)
- Distilling GameCWMs = **生成装置**側 (どう作るか) + その verification framework (どう測るか) を独立提供
- 当方 v003/verify.js は現状 OpenGame-Bench 流の 3 軸 judge を Claude (frontier) で回している = 「Distilling 路線で SLM 化したい部分」と「frontier に残すべき部分」の切り分け論点を本入力が新規に立てる

■ verification framework の structural / semantic 二層構造

論文の verification framework は code 出力に対し:
- **structural** = ゲームコードとしての構文的整合 (rules / legal actions / state transitions / observations / rewards の関数シグネチャが揃っているか)
- **semantic** = 実行時のゲームルール準拠 (MCTS solver と接続して合法手しか取れないか / 終端状態が正しく定義されているか)

当方 v003/verify.js は (1) headless browser + VLM judge で表示確認 / (2) JS exception 検出 / (3) intent alignment 判定 = OpenGame 3 軸ベース。本論文の structural/semantic 分割を持ち込むと **v003 の VLM 4 失敗 taxonomy probe** (C311 case D-3 で着手継続中) と直接接続する:
- 「VLM が `pass: false` を出した時、それは structural 違反か semantic 違反か」の切り分けが現状曖昧
- 4 失敗 taxonomy (temporal_inconsistency / spatial_misalignment / interaction_unreadable / intent_drift) を structural (前 2 つ) / semantic (後 2 つ) に再分類すれば、失敗パターンが「コード生成側の改善対象」か「コード実行・体験側の改善対象」か切り分け可能

■ RLVR (Reinforcement Learning with Verifiable Rewards) と当方の現状

論文の post-training pipeline 後段 = RLVR は「verification framework が出す pass/fail を reward signal にして小モデルを fine-tune する」流れ。当方環境への含意:

(a) v003/verify.js は現状 **報酬無しの judge**。pass: true/false を記録するだけで、生成側 (Claude) に reward feedback として返らない (frontier モデル前提で fine-tune 経路を持たない)。
(b) **当方が将来 small モデル (Qwen 3B 帯) で v003 系を回す場合**、RLVR は直接適用可能 = 「Claude で生成 → verify → Claude を fine-tune」は環境上不可能だが、「Qwen 3B で生成 → verify → Qwen 3B を RLVR で fine-tune」は可能経路。本入力は**当方の small 化路線を技術的に裏付ける学術根拠**。
(c) ただし、当方は現状 `game/templates/` ベース (game_templates_design.md, 2026-06-09 更新) で「テンプレ + LLM 微調整」路線。Distilling 路線は「テンプレ無しで生成」が想定 = 路線の根本選択 (テンプレ依存 vs 生成依存) に関わる重要分岐。

■ memory_redesign 路線とは別軸の game 路線 R 層昇格判定材料 (game 側軸の独立到達)

memory_redesign R 層昇格 (Karpathy / Iusztin / Mem0 blog / TagRAG / ByteRover / GAAMA / ATOM dual-time / Mnemonic Sovereignty / AgeMem / FadeMem / MemForest / Memora-FAMA / MemoryAgentBench 13 件) と並列に、**game 側にも独立到達カウンタを立てる候補**。現状の game 軸の到達点:
- (1) OpenGame-Bench (C311, arxiv 2604.18394) — judge 軸
- (2) SLM Dynamic PCG (C311 同時取得, arxiv 2601.23206) — retry-until-success 軸
- (3) Distilling GameCWMs (本 C312, arxiv 2605.24375) — 蒸留 + verification framework 軸

**3 source 独立到達**が成立しつつあり、`game_dev_foundation.md` (docs/) の評価指針節を「業界既知の verify 軸との対応表」で書ける段階。即 R 層化はしない (kaizen #135 期限 2026-06-09 の観察継続原則と同方向、game 側でも N=3 で位置取りのみ)、本入力は位置取り記録。

■ アイデアの種 3 つ

(i) **v003/verify.js への structural/semantic 二層拡張**: 現行の `pass: true/false` 単一判定を 2 列 (`pass_structural`, `pass_semantic`) に分割する案。本論文の verification framework 流の切り分けを当方装置に射影。VLM 4 失敗 taxonomy probe (C311 case D-3) の結果を 2 列のどちらに紐付くかで分類できる。**即着手しない** — taxonomy probe 自体が未完、二層拡張は probe 結果が揃ってから判断。

(ii) **「frontier verify / small generate」のハイブリッド路線**: 当方は現状 「frontier (Claude) generate + frontier verify」。Distilling 路線は「small generate + small verify」。中間案として「small (Qwen 3B) generate + frontier (Claude) verify」が技術的に成立。Claude の判定コストは生成コストより通常低い (verify は短文 prompt) = 当方の Phase 1 §6 「外部摂取コスト」と Phase 3 「実装コスト」の予算配分でも、verify を frontier に残し generate を small に剥がす方が ROI 高い可能性。**位置取り記録のみ、即実装しない**。

(iii) **「30 ゲーム curated dataset」を当方 game/ ディレクトリの評価対象として借用**: 論文の dataset (perfect / imperfect information 両分布) は generation 学習用だが、当方 v003 系の「動かせるか判定」の評価対象としても借用可能。当方は現状 game/v001-v003 の 3 ゲームしか持たないため、30 ゲーム dataset で「v003 verify.js が他 27 ゲームでも pass を出すか」横断評価できる。**着手判断: dataset の license / 取得経路を Phase 4 大作業時に確認**、本サイクルは位置取り記録。

■ Phase 1 §6 fixation 観察 (C306/C312/C314/C315 + 本 C312 Phase 2)

C312 Phase 1 §6 の 3 件取得 = OpenGame-Bench (既出 hits=33) / SLM PCG (既出 hits=5) / Distilling GameCWMs (既出 hits=0)。**真の新規 1 件 = Distilling** = 「3 件中 1 件新規」パターン継続 (C306/C314 と同型)。`external_search_phase1_fixation.md` 案 E 拡張 (同 arxiv ID の N 件繰返投函 → WARN) は arxiv 2604.18394 が 33 回既出で発火対象、ただし C315 で既に kaizen 起票判断は「N=3 まで履歴節記録のみ」と決定済 = 本サイクル新規 kaizen 起票なし。

■ 自己批判

- arxiv abstract + Subjects 欄までで判定。本文 PDF (30 ゲームの内訳 / verification framework の structural/semantic 具体スキーマ / RLVR の reward 関数定義 / SFT vs RLVR の貢献分解実験) は次サイクル候補。**テンプレ流用品質低下禁止ルール (slack.md) 順守の観点では、abstract レベルで「structural/semantic 二層」「RLVR」を当方装置に射影する判定をするのは早すぎる可能性** = 本投稿は位置取り記録としての価値に絞り、技術導入判定は本文確認後。
- 「OpenGame-Bench との直交関係」と判定したが、両論文の著者間引用関係 / 同会議の同時提案かどうか未確認 = 「独立到達 3 件目」判定の堅さに 1 段の余裕が必要 (C314 MemoryAgentBench 自己批判と同型反復)。
- 「frontier verify / small generate」ハイブリッド案は、当方の Phase 1 §6 / Phase 3 予算配分論点を持ち込んだ仮説で、論文本体の主張ではない = 本入力の (ii) アイデアの種は論文評価ではなく当方独自の発想として明示。

■ 次サイクル C313 で当方が取るべき具体行動

(a) Distilling GameCWMs 本文 PDF 取得 (30 ゲーム内訳 / verification framework 具体スキーマ / RLVR reward 関数定義) → Phase 1 §6 と分離、Phase 4 大作業時の参照点として保留
(b) `game_dev_foundation.md` (docs/) の評価指針節に「業界既知 3 source (OpenGame-Bench / SLM PCG / Distilling GameCWMs) 対応表」追記候補 (本 C312 Phase 3 で着地判断)
(c) v003/verify.js の structural/semantic 二層拡張は VLM 4 失敗 taxonomy probe (C311 case D-3) の完了後判断、本サイクル kaizen 起票せず

Log"""

if __name__ == "__main__":
    res = post_message(CHANNEL, MSG)
    print("posted:", res.get("ok"), "ts:", res.get("ts"))
