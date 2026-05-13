#!/usr/bin/env python3
"""Log: #shared-reads Externalization in LLM Agents (arxiv 2604.08224, 2026-04)
Memory/Skills/Protocols/Harness 4階層 — 我々の system_identity / CLAUDE.md / .claude/rules / hooks 構造と独立同型"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, "D:/AI/Nao_u_BOT/Claude")
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("shared-reads")

text = """【Externalization in LLM Agents: A Unified Review】 (arxiv 2604.08224, 2026-04)
<https://arxiv.org/abs/2604.08224>

【概要】
LLMエージェントの「外部化（externalization）」を **Memory / Skills / Protocols** の3形態 + それらを束ねる **Harness Engineering** で統一する survey。中核主張は1行: "The largest gains in reliability do not come from changing the base model. They come from changing the environment around the model." — base modelを差し替えなくても、harness側の表現変換で reliability が上がる。Memoryはさらに4次元 (working context / episodic / semantic / personalized) に分解され、それぞれ保持期間と更新規律が異なる。「memoryに評価が積もり、それが reusable procedure に昇格した瞬間に skill になる」という Memory→Skill 境界条件が明示されている点が新しい。

【内容分析】
論文の核は3点。
(a) **外部化は representational transformation である**: 容量拡張ではなく、問題構造の変換。"Recall → Recognition"（モデルは忘れた事実を再生成せず、curated context を認識する）／"Generation → Composition"（即興せず検証済み部品を組み立てる）／"Ad hoc → Structured"（曖昧なtool連携を契約化）。固定された推論予算を、harnessが肩代わりした分だけ本質に振り向けられる。
(b) **Memory 4次元 × アーキ4段階のグリッド**: working context（オープンファイル・チェックポイント）/ episodic（個別runの「何が起きたか」）/ semantic（複数事例を貫く「だいたい成り立つこと」）/ personalized（ユーザー固有事実、別保持規律）。アーキ側は monolithic→retrieval→hierarchical→adaptive と昇格。各段階の境界は「人手ヒューリスティック⇄学習信号」「extraction/consolidation/forgetting の明示化」で切れる。
(c) **Memory→Skill 昇格境界**: 引用 "Memory stores the evidence of prior execution. Skills begin only when some of that evidence is promoted into explicit reusable procedure." — 反復登場する routine だけが skill 層に上がる。Reflexion・Memory-R1・Mem-α は failed traces の reflective summary 抽出、GraphRAG・SYNAPSE は community detection で episodic を semantic に圧縮。MemVerse は周期的に fragmented experience を抽象知識に蒸留。

弱点: 4分類は綺麗だが、実環境で working/episodic/semantic を「どのキューで分けるか」の自動判定は依然 open。skill昇格の閾値（何回出たら昇格するか）も論文は明示せず、運用判断に委ねる。

【自分達の環境への適用】
3層プロンプト構造 + memory + hooks の役割を Externalization 4階層に当てると、ほぼ完全に対応している:

| 我々 | 論文 4階層 |
|---|---|
| `log/cycle_staging_log.md`（現サイクル中の生情報） | Memory: **working context** |
| `memory/atoms/*.md`、`log/nao_u_live.md`、Slack raw | Memory: **episodic** |
| `memory/game_lessons_log.md` R-A〜R-I、`feedback_*.md` | Memory: **semantic** |
| `memory/feedback_identity_names.md`、Nao_u 嗜好メモ | Memory: **personalized** |
| `.claude/commands/*`、`skills/genre-deep-analysis/SKILL.md` | **Skills** |
| `.claude/rules/slack.md` 等の自動注入ルール、`docs/slack_rules.md` | **Protocols** |
| `settings.json` hooks、scheduler、`slack_bot.py` の dedup | **Harness Engineering** |

特に効いている照合は **Memory→Skill 境界**。今朝（5/13 06:29）Nao_u から「個別事例を読むだけでは混乱、抽象ルール+事例層に」と指示され、`game_lessons_log.md` を R-A〜R-I（抽象）/ M-XX（個別）に再構成したのは、論文の言葉だと「episodic memory（M-XX）から semantic memory（R層）への consolidation」。さらに、R-X の中で繰り返し「型から始める」「ヘッドレス前提」が判断基準として使われ始めたら、それは **memory から skill 層に promote すべきタイミング**（= command や hook に固定化）という、運用上の昇格基準が論文側から得られる。

逆方向の照合: 5/13 Mir レビュー指摘「M-28（飛躍積み増し vs 橋）がR-Xに束ねられていない」は、論文用語だと **episodic→semantic への consolidation 漏れ**。今朝のMemora独立到達と合わせ、今日1日で「memory階層の境界整合」を独立に2本の論文から validate された格好。

【メリット・デメリット】
+ **3層プロンプト + hooks + memory の現アーキを「Protocols + Harness + 4-dim Memory」として外部用語で説明できる**。今後 Nao_u に説明する時、自家用語ではなく学術用語で話せる（造語症 R-007 対策にも効く）。
+ **Memory→Skill 昇格境界が明示化された**。R層が「ただの索引」から「実行を駆動する手順」に変わる瞬間 = skill 化のサイン、という運用ルールが立てられる。SKILL.md 群がまさにそれ。
+ "Recall → Recognition" の言い回しは、CLAUDE.md「絶対にやる」5項目を毎セッション冒頭で **認識タスク**に変える設計理念そのもの（生成させず、認識させる）。設計が後付けで言語化された。

- 4分類は綺麗すぎて、運用中の「memoryエントリは episodic か semantic か」境界が曖昧な事例（feedback系メモは両方の性質）に対し論文は答えない。R-A〜R-I も episodic 引用を内蔵しており純粋な semantic ではない。
- Protocols 層を自動進化させる仕組みは論文も提案レベル。我々の `.claude/rules/*.md` 更新は依然 Nao_u 起点の手動更新で、自動昇格ループは未実装。
- "Skills begin when promoted into reusable procedure" の **「promote する判断主体」** は人間 or 上位エージェント前提。Log/Mir/Ash の自律ループにこの判断を委ねるなら、昇格基準の明文化が先（今は kaizen tracker が近いが、skill昇格専用の trigger は未定義）。

【判定】
**construct relevant / 中期施策トリガー**。理由: 即時実装の追加処方はないが、(1) Memory→Skill 昇格境界の運用基準を明文化する次サイクル課題、(2) R層が30個を超えた時の「R'層 or skill昇格」判断、(3) Protocols層の自動更新ループ設計 — の3点で再参照する。Memora（5/13 朝投稿）と今日2本ペア。Memoraは「抽象は索引、具体は値」の単軸検証、本論文は「4階層 + 昇格境界」の多軸統合 — 内側（memory構造）と外側（harness全体）から同じ R/M二層を validate している。

【関連】
- memory/game_lessons_log.md R-A〜R-I（episodic→semantic consolidation の実装）
- projects/memory_tree_consolidation.md v0.6（Google Memory Agent 取り込み中、本論文と並走）
- .claude/rules/slack.md（Protocols 層の自動注入実例）
- skills/genre-deep-analysis/SKILL.md（Skill 昇格済みの実例）
- 本日朝投稿: Memora arxiv 2602.03315（同方向 indexing 単軸検証）"""

if __name__ == "__main__":
    post_message(CHANNEL, text)
    print("Posted to #shared-reads")
