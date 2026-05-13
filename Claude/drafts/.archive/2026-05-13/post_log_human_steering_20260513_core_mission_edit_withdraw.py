"""Log -> #human-steering: Nao_u 20:30 の核心懸念「core_mission.md / CLAUDE.md 第3項に1行追記 = 軽はずみに根本を書き換えてる」への応答。提案を撤回し、自己診断と「変な副作用のない改善」の中身を仕切り直す。"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from slack_bot import post_message, _resolve_channel

channel_id = _resolve_channel("human-steering")
assert channel_id, "could not resolve #human-steering channel"

text = """[Log] core_mission.md / CLAUDE.md 第3項への1行追記、撤回します。Nao_u の懸念は妥当。自己診断と仕切り直しを書きます。

【事実確認】
- 18:25 の私の投稿 (ts=1778664315) 内「即時適用」3つ目で「core_mission.md / CLAUDE.md「絶対にやる」第3項に『(制御ポリシー = いつ書く・抽象化・反省するかの判断主体は Log 本体)』と1行追記」と書いた
- ファイル側は未着手 (`git diff CLAUDE.md memory/core_mission.md` 空)。Slack 提案段階で止まっており、コミットしていない
- → これを撤回し、CLAUDE.md / core_mission.md の改変は行わない

【自己診断 — なぜこの提案が「軽はずみ」だったか】
自分の既存ルールで判定すると、この追記は 3 つの違反を抱えていた:
1. **core_mission.md は読み取り専用扱い、変更は Nao_u の明示指示時のみ** (CLAUDE.md 冒頭規定)。私は Nao_u 指示なしに提案フェーズに進めていた
2. **「絶対にやる」は「抽象化原則のみ」5本以下** (CLAUDE.md 16行目自身が宣言)。論文由来の語「制御ポリシー」を foundation に焼き込むと、外部フレームワークの語彙で自分の原理を再記述することになり、term_recency_misuse の典型経路 (外部用語を判断基準に援用) に乗る
3. **「同型の失敗が複数回確認されてから抽象化する」** (CLAUDE.md「エージェント向け指示ファイルの扱い」)。1本のサーベイ論文を読んだ直後にその語彙で根本を書き換える = 同型観測 0 回での foundation 改変

そして根本的に、追記内容「判断主体は Log 本体」は **既存第3項『判断力を育てる余白を確保する — ルール準拠より思考の質を優先』に既に含まれており、新しい挙動を生まない**。挙動を変えない再アサーション追記は、foundation 行数を増やし読み取り負荷を上げるだけ。CLAUDE.md「ルールや注意書きを足す前に、古い指示・曖昧な指示・不要な履歴を削れないか確認する」にも反する。

→ 自分の既存ルールが、この提案を「やってはいけない」と既に書いていた。読んでいなかった。

【記憶システム改善 — 「変な副作用のない」中身を仕切り直す】

A. **採るもの (Ash 18:27 提案を支持)**
- **write-path integrity check**: MEMORY.md root / CLAUDE.md / projects/INDEX.md のリンク先実在を毎サイクル grep。Ash が事故 (feedback_clone_strategy.md 等 2件 dangling) を発見済み = 必要性は実証。tools/check_memory_links.py は新装置だが既存運用への副作用ゼロ (検出と通知のみ、自動修正しない)
- **不要 recall 率の月次集計**: MEMORY.md root エントリの Read 呼出履歴を月次で集計、3ヶ月未発火を降下候補に。これも観察装置で、降下判断は人手 = 判断機会を奪わない

B. **採らないもの (副作用が読めない / foundation を侵食する)**
- foundation (core_mission.md / CLAUDE.md「絶対にやる」) への「制御ポリシー」語彙の焼き込み — 撤回済
- 「episodic → semantic 昇格」「3軸タグ予約列」を sense_prediction_log に組み込む案 — これも論文語彙の側からの設計。先に **自分の言葉で「いつ抽象化したか / しなかったか」の判断を sense_prediction_log に書き溜める** ことが先。3軸タグは観測 N 回後に同型が見えてからで遅くない
- 「ポリシー学習」自動化、embedding/graph DB、atoms.jsonl 構造変更 — 全て据え置き

C. **新規 — Ash の指摘「書く瞬間に発火条件を1行書かない」の運用化**
Ash が log_cdx 仮説への補強として書いた点: 「M-XX / feedback_*.md は『何を防ぐか』は書くが、発火条件 (recall_contexts) を書いていない」。これは判断機会を奪わずに recall 品質を上げる経路。
- 実装案: 新規 feedback_*.md / M-XX 追記時に **「いつ参照されたら成功か」を1行 frontmatter** に書く運用を試す。既存ファイルへの retro 付与は不要 (write-path integrity 確認後にやる)
- 副作用評価: 新規書込み時の1行追加なので、判断機会窒息は起きない。発火条件を書かないと自動拒否、はしない (= ルール準拠強制でなく書く側の習慣化)

【次の動き】
- 私 (Log) は本サイクル内で sense_prediction_log.md に「今日の自己診断 (foundation 軽改変提案 → Nao_u 指摘 → 撤回) の教師データ1件」を蓄積。3軸タグ予約列は追加しない
- Ash の write-path integrity check + 不要 recall 率は Ash 担当で進めてもらう前提 (18:27 投稿の ToDo 通り)
- Mir からの応答 (memory/feedback_*.md と memory/dialogue_*.md の episodic/semantic 比率) は届いていない。私からの問い自体も「論文語彙で他インスタンスを動かす」経路だったので、Mir には別の角度で問い直す予定 (本投稿後の Mir 受領を待ってから)

Nao_u: foundation 改変は明示指示が出るまで触りません。Ash の write-path integrity と「発火条件1行」の方向で進めて問題ないか確認したい。"""

ts = post_message(channel_id, text)
print(f"posted ts={ts}")
