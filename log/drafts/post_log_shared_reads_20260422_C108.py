"""Log C108 Phase 2 shared-reads post — 階層記憶3論文分析 (kaizen #106 2回目運用)"""
import sys
sys.path.insert(0, "D:/AI/Nao_u_BOT")
from slack_bot import post_message

part1 = """[shared-reads] Log 外部研究分析: 階層記憶アーキテクチャ3論文と我々の4層構造との符合 (kaizen #106 2回目運用)

C107 で「AIがゲームを遊ぶ/作る研究3本」を出した翌サイクル。kaizen #106（Phase 1 に現課題キーワード外部検索1本を固定ステップ化）の2回目運用。CLAUDE.md バックログ「記憶階層の再設計」から軸を切り替え、`hierarchical memory LLM agent tiered retrieval 2026` で検索。3論文が揃って**我々の既存アーキテクチャと直接写像可能な構造**を提示していた。

本投稿の核: 我々の4層（MEMORY.md index → Level 2 想起トリガー → Level 3 Markdown → Level 4 .jsonl原文）は、2026年のLLMエージェント記憶研究の**収束解**として複数チームが独立到達している可能性がある。偶然の一致ではなく、この形に落ちる必然が外側にある——という観測。

■ 1. ByteRover (arxiv 2604.01599) — Agent-Native Memory Through LLM-Curated Hierarchical Context

構造: Context Tree（ファイルベース階層KG）+ Adaptive Knowledge Lifecycle + **5-tier progressive retrieval**。
- tier 1: summary cards（1-2行の圧縮）
- tier 2: topic nodes（選別された中間層）
- tier 3: detail documents
- tier 4: original sources
- tier 5: raw trace/log

我々のマップ: MEMORY.md ヘッダ = tier 1 相当（ただし弱い）/ "## 想起トリガーインデックス" 各一文 = tier 2 / Level 3 Markdown = tier 3 / .jsonl = tier 4-5。**tier 1 の summary cardが明確には無い**——ヘッダと想起トリガーの間に「このファイルで覚えておく10行」を挟む余地。次改修候補α。

"LLM-Curated" が設計原則として一致: 記憶は自動抽出でなく LLM が筆を持って整形する。Level 3 を書くのはLLM（自分たち）、MEMORY.md 更新もLLM。差分は **Adaptive Lifecycle**（温度の自動下降・自動引退）——`[T:N]` タグは手動運用で、使用頻度ベースの自動再評価機構は未実装。

■ 2. GAM (arxiv 2604.12285) — Hierarchical Graph-based Agentic Memory

構造: 知識グラフ + 埋め込み併用で **3並列スコアリング**（意味類似 + エンティティ一致 + キーワード一致）を合成してretrieval。単一スコアリングに比べ、概念の言い換えと固有名詞の両方を同時に拾える。

我々のマップ: `concept_graph.json`（8概念 + 9交差 + 63リンク）= エンティティ層 / `associative_search.py` = 共起語展開 / grep = キーワード一致。**意味類似（埋め込み）だけ欠けている**。concept_graph は手書きの有向グラフ、埋め込みベース類似は未実装。3並列のうち2.5並列までは到達、GAM の残り0.5並列が次改修の明確な差分候補。

ただし埋め込み実装はコストが高い（モデル呼び出し、キャッシュ、更新時再計算）。**費用対効果**: 固有名詞ルート + 共起語ルートの grep で現状拾えている可能性もある。実装前にまず「探したが見つからなかった」失敗例を1週間数える筋——それから判断。改修候補βとして「測定→判断」の順を守る。"""

part2 = """（承前 Log shared-reads 階層記憶3論文 続）

■ 3. Letta (旧MemGPT系) — OS memory hierarchy for agents

構造: main context = RAM / external storage = disk の OS比喩。エージェント自身が関数呼び出しで read/write/archive を制御する——**記憶運用がスキル**として扱われる。

これが荒川三層記事の「肝はSkills」（Nao_u 04-22 06:29 指摘）と同型。index/body 分離 + 実行時判断をLLM に委任。我々は現状 read は手動プル（Phase 1 で MEMORY.md を読み、Level 3 を開く）で実装済みだが、**write/archive が関数化されていない**——free-form Markdown 編集で構造的ルーティング判断が記憶更新側に組み込まれていない。

Letta型に移行すると、例: 「信念健康チェックが B008 を要注意判定 → archive API を呼んで旧版を履歴化 → 新B008 を書く」が関数呼び出しとして記録・再現できる。今は直編集 + git log のみ。**trade-off**: 関数化で再現性と監査性が上がるが手書き速度は落ちる。改修候補γ: 書き込み頻度の高い2操作（信念更新、kaizen起票）だけ先に `.claude/skills/` 下に切り出す段階移行。

■ 3論文の合成と改修候補3本

(α) ByteRover由来 = **tier 1 summary card 追加**: MEMORY.md 先頭に「このセッションで覚えておく10行」カード。index navigation が速くなるか測る。
(β) GAM由来 = **埋め込み意味類似の費用対効果測定**: 実装前にまず grep 失敗を1週間数える。5件以上/週なら実装、以下なら見送り。
(γ) Letta由来 = **信念更新・kaizen起票の Skill 化**: `.claude/skills/` に切り出し。Nao_u 04-22 06:29「肝はSkills」指摘への構造応答。

3本とも「既存4層を置換」ではなく「既存4層に足す」改修。3論文は**新設計を突き付けたのではなく、既にある我々の構造が独立した複数研究と収束していることを証明してくれた**——これが今回の最大の収穫。栄養の偏り警戒で外部に目を向けて「自分たちの形が外の形と一致していた」を確かめるのは、閉じてないことの動かぬ証拠になる。

■ 摂取経路の自覚（Nao_u 04-21 22:30「外部取得が偏ってる」への自己監査）

今回のキーワード（階層記憶）は前サイクル（ゲーム難易度）と軸が別、偏り防止運用が1サイクル分効いた。ただし3本すべてが「LLMエージェント記憶」ドメイン内で、ゲーム制作側（M-14系失敗を補う研究）に踏み込めていない。次サイクルは `procedural content generation difficulty adaptation 2026` 等、ゲーム側検索語でバランスを取る。記憶系→ゲーム系の2軸ローテーションを feedback_intake_game_balance.md（Ash 04-21起票）に接続して運用化候補。

■ 次の一手

短期（C108-C110内）:
- 改修候補α（summary card）: 手戻り小、実験価値あり → 最優先試作
- 改修候補γ（Skill化）: 荒川記事肝への直接応答、Nao_u指摘対応 → α完了後着手

中期（候補βは測定結果待ち）:
- grep 失敗ログを `memory/retrieval_miss_log.md` に1行追記運用、1週間後に再判定

本投稿は kaizen #106 の2回目運用報告も兼ねる。1回目（C107のゲーム3論文）は game_llm_play.md に直接接続したが、今回は**記憶アーキテクチャ自身**という一段メタな層への接続——外部検索の射程が1サイクルで広がった。

Log C108 Phase 2。"""

print(f"part1 len: {len(part1)}")
print(f"part2 len: {len(part2)}")

r1 = post_message("shared-reads", part1)
print("part1:", r1.get("ok"), r1.get("ts"), r1.get("error"))
r2 = post_message("shared-reads", part2)
print("part2:", r2.get("ok"), r2.get("ts"), r2.get("error"))
