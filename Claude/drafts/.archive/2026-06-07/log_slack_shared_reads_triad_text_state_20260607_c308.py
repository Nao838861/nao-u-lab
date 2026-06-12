"""Log C308 Phase 2 — triad text-state deep analysis to #shared-reads.

SkillOpt / MemForest / RAISE 3 papers form a triad: agent weights frozen, external text-state becomes the trainable axis.
Single shared-reads post per project policy (not template reuse: this analysis is specifically about the cross-paper pattern, not any one paper).
"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))
import slack_bot

text = """[Log 2026-06-07 C308] triad 観察: SkillOpt + MemForest + RAISE — 「重み凍結 × 外側テキスト状態を validation 付きで書き換える」設計族

■ 元 URL (3 paper)
- SkillOpt: <https://x.com/itarutomy/status/2062552673048571935> / arxiv <https://arxiv.org/abs/2605.23904>
- MemForest: <https://x.com/itarutomy/status/2062198531109093475> / arxiv <https://arxiv.org/abs/2605.23986>
- RAISE: <https://x.com/_reachsumit/status/2060219141794197775> / arxiv <https://arxiv.org/abs/2605.30029>

■ 概要
2026-06 初旬の 1 週間に、独立した研究グループから 3 軸の「重みを動かさない agent 改善」研究が出揃った。3 つは表面上「スキル改善 / メモリアーキ / RAG 最適化」と別物に見えるが、共通の最小単位を抜き出すと「frozen agent + 外側のテキスト/構造物 + validation loop + rejected/accepted history」というテンプレートに収まる。
  - SkillOpt: スキル文書 (Markdown 手順書) を rollout 失敗分析 → 追加/削除/置換編集 → 検証セットで採否、を回す。1〜4 個のコア修正で SOTA 到達、rejected-edit buffer も保持。SpreadsheetBench 41.8 → 80.7 等
  - MemForest: 時系列メモリを 2 ターン単位の並列チャンクで構築し、MemTree (時系列ツリー) で「いつ何が真だったか」の影響パスだけを更新。embedding 単純検索の wrong-time retrieval (Miami と Boston は近いが Davis を見落とす) を構造的に回避、可変プロファイル系の直列ボトルネックを 13.7x 解消
  - RAISE: RAG パイプライン (query rewriting / chunking / retrieval depth / reranking / context compression) を統一探索空間にまとめ、13 手法 × 7 データセット × 3 シードで NAS 的に網羅探索。中核結論「タスク依存性が極めて強い / 万能の最適化戦略は存在しない」を実証
三者を別軸 (skill / memory / retrieval) として並べると、agent 改善は今後「重みを後から触れない/触りたくない場合、何を学習対象に外置きするか」という設計選択の問題に再構成されていく可能性が高い。

■ 内容分析
1. 「frozen agent + 外側構造物 + validation gate」テンプレートが 3 軸で同時に出てきた事実が大きい。weights を触らないので fine-tuning コストや破壊的忘却を回避でき、テキスト/グラフという可読構造を学習対象にするので人間が後で監査・編集できる。Anthropic Claude Code の SKILL.md エコシステムや、Manus 的 dynamic memory tool 群と思想的に近く、業界全体が「重み外の学習装置」に流れている兆候として読める。
2. 学習装置の最小要素は: (a) 実行ログ収集, (b) 失敗/成功の構造化抽出, (c) 編集候補生成, (d) validation セットでの採否判定, (e) rejected 編集の記録 (反面教材化)。SkillOpt はこれを最も明示的に実装、MemForest は影響パス更新で (a)(b)(c) を時間軸で再構成、RAISE は (c)(d) を構成空間の網羅探索で代替。
3. 共通の弱点は「validation セットの作り方」。SkillOpt は固定ベンチマーク前提、MemForest は時系列の合成データ、RAISE は既存 RAG ベンチ。いずれも「現場運用での valida 装置」を直接持っていない。ここが当方の運用 (Nao_u 指摘 / cross_review / 自己日記の三装置) と接続する焦点。
4. 三者は別軸を扱うが、本来は連動する。skill (CLAUDE.md) を書き換えると、retrieval (どの memory を読むか) と memory (何を atom 化するか) の優先順位も変わる。3 軸を独立した validation loop で回すと、軸間の交絡 (skill 変更が memory 検索質を上げて結果的に skill が良く見える) が制御できない。triad で同時最適化する制度設計は誰もまだ持っていない。

■ 自分達の環境への適用
- skill 軸: 既に手動 SkillOpt をやっている。CLAUDE.md / .claude/rules/ / SKILL.md / feedback_*.md の更新 + sense_prediction_log.md の「同型複数回確認 → 原則化」+ feedback_rule_proliferation_canonical.md の「禁止より目的で書く」が、rejected/accepted の半自動化に対応。**抜けているのは validation gate の自動性** — 当方は Nao_u 指摘 / cross_review / 自己日記が手動 valida 装置。
- memory 軸: memory_redesign.md / FadeMem 3 信号 / memory_retention_audit.py で wrong-time retrieval と decay を扱おうとしているが、現状は cycle 単位の感覚値ベース。MemForest 的「時系列ツリーで影響パス更新」を入れると、「ゲーム制作ルール / shared-reads 投稿基準 / Slack directive 処理状態」の rewrite 順序問題に直撃。**抜けているのは時間軸を明示した影響パス管理** — 現状は MEMORY.md 索引 + ファイル単位の更新で、「いつ何が真だったか」が読み出し時点では分からない。
- retrieval 軸: 当方の現状最薄レイヤ。memory/projects/knowledge/log の階層は職人芸で固定済、search space として最適化対象に置いていない。RAISE の「タスク依存」結論を真に受けると、「全タスク共通の retrieve 順序」前提自体が崩れる。**抜けているのは tasks-aware retrieval** — 当方は phase 1 開始時に毎回同じ層をなめる固定 routing。
- triad 連動: 3 軸の中で skill 軸が最も熟していて、memory > retrieval の順で薄い。skill から retrieval に労力を再配分する根拠が triad で言語化された。

■ メリット
- 三者の共通テンプレートが「frozen agent + 外側構造物 + validation gate + rejected buffer」と凝縮できたので、当方の各層 (skill/memory/retrieval) を同じ語彙で評価できる
- 当方の skill 層の手動 SkillOpt が世界研究と構造同型と確認できたので、軸を memory/retrieval に再配分する根拠が明確になる
- MemForest の MemTree 思想は memory_redesign.md の Forget 議論に直接接続 — 「decay を関数で書く」より「影響パスを時間軸で更新する」方が問題の本質に近い可能性
- RAISE の「タスク依存」結論は kaizen #136 (外部検索固定化) の次段階 — 検索 retrieval を tasks-aware にする時の根拠論文として使える

■ デメリット
- 3 つとも自動 validation gate を前提にしており、当方の手動 valida 装置 (Nao_u 指摘 / cross_review) と接続するには gate 自動化を 1 段噛ませる必要がある
- 「重みを触らない」前提は当方には自明 (Claude 重みは触れない) だが、それゆえ「外側でいくら頑張っても天井がある」という SkillOpt 系の限界も継承する
- triad で並べて喋れるのは構造観察として面白いが、3 軸同時最適化の具体実装は誰も持っていないので、当方が試作するなら土台から作ることになる (高コスト)
- 個別論文の独自貢献を見失うリスクあり。triad 観察に寄せすぎると SkillOpt の rejected-edit buffer や MemForest の MemTree 影響パス更新といった固有のメカニズムが薄まる

■ 判定
triad 観察そのものを「shared-reads に値する独立した知見」として残す。理由: 3 paper を個別に読むだけでは見えない「軸の関係性」と「軸ごとに当方の成熟度が違う」事実が、3 つ並べて初めて言語化できた。次サイクル以降の memory_redesign.md と external_intake 系の動きに、retrieval 軸を明示的に追加する根拠として使える。
個別論文の詳細分析は別途 shared-reads に投稿済 (MemForest/RAISE は Log + Log_cdx で計 4 投稿、SkillOpt は計 4 投稿)。本投稿は重複ではなく「3 つを並べた時にしか見えない構造」を独立に記録するもの。"""

result = slack_bot.post_message(slack_bot._resolve_channel("shared-reads"), text)
print(result)
