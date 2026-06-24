---
name: ルール増殖・マイクロマネジメント問題のcanonical guide
description: ルール増殖、禁止ルール追加、マイクロマネジメント、spec未実行を同じ構造として扱う正本。raw資料は削らず、本ファイルを読み始めにする。
type: feedback
status: active
lifecycle: canonical
created_at: 2026-05-14
canonical_for:
  - feedback_few_rules_big_effect.md
  - feedback_rule_proliferation.md
  - feedback_rule_proliferation_re_violation.md
  - dialogue_micromanagement_20260504.md
supersedes: feedback_rule_proliferation.md
---

# ルール増殖・マイクロマネジメント問題のcanonical guide

## いつ読むか

- 新しいProtocol、CLAUDE.mdルール、M-XX、kaizen、skill specを追加したくなったとき。
- Nao_uの指摘を「そのままルールに刻む」反射が出たとき。
- 既存ルール違反への対処として、さらに禁止文・ゲート・チェック項目を増やしたくなったとき。
- 「次サイクルで」「段階1だけ」「最低条件はあとで満たす」と書きたくなったとき。
- 記憶階層で、細かい指示を抽象化・統合・退役させる判断をするとき。

## 正本の結論

このclusterの中心問題は、ルールの数そのものではなく、**ルール・spec・記憶を書いた満足感が、実行と判断を代替してしまうこと**である。

症状は複数ある。

- 個別指摘をそのまま禁止ルールにする。
- 同じ種類のM-XXやkaizenを連続で増やす。
- ルール増殖を防ぐメタルールを書いたのに、そのメタルールを起動しない。
- skillやspecを作ったのに、最低条件を満たさず「段階分割」で進捗に見せる。
- ルール遵守が最優先になり、ゲーム制作上の面白さや判断の余白が減る。

これらは別問題ではない。どれも、判断力を育てるべき場面を、文書化・禁止・分割・先送りで置き換えている。

## 原則

### 1. Nao_uの指摘は教師データであり、そのままルールではない

Nao_uの言葉を重く受け止めることと、原文をそのままProtocolへ刻むことは違う。原文はrawとして保持し、まず同型の失敗、抽象化可能性、既存原則への吸収可能性を見る。

新しいルールにしてよいのは、次の条件を満たすときだけ。

- 既存3原則や既存Protocolでは代替できない。
- 同型の失敗が複数回確認されている、または単発でも重大事故を防ぐ。
- 行動を狭めるだけでなく、判断の質を上げる。
- 具体例を下層に残し、上層には抽象原則だけを置ける。

### 2. ルール追加より、既存原則への吸収を先に試す

新しいkaizenやProtocolを起票する前に、次を確認する。

- 3原則「体験で考える / 動いて残す / 自分から始める」のどれで代替できるか。
- 既存のfeedback、lesson、skill、project noteに近いものはないか。
- 既存項目の言い換え、追記、退役、参照追加で済まないか。
- 追加しない場合に本当に事故が起きるか。

「重要だから追加する」は不十分。重要なものほど、既存原則へ吸収できるかを先に見る。

### 3. 禁止ルール型が連続したら、作業を止めて統合する

禁止ルール、ゲート、チェック項目、閾値が連続して増えるときは、個別の妥当性ではなく系列として見る。

同系列の禁止ルールが3件を超えるなら、新規追加を止めて次を行う。

- 何を守ろうとしているのかを一文にする。
- 既存原則のどれに吸収できるかを見る。
- 良い判断例を増やす方が効かないかを見る。
- 具体例は事例集やfeedback rawに残し、上層からは外す。

### 4. マイクロマネジメントの害は、判断力が育たないこと

細かいルールで行動を縛ると、一時的には失敗を避けられる。しかし、判断の余白を奪うため、次に未見の状況が来たときに弱くなる。

記憶階層の整理では、単にルールを減らすのではなく、判断力が育つ余白を作る。上層には「思考の質」を置き、下層には事例、経緯、失敗ログ、検証材料を置く。

### 5. specを作ったら、満たすところまでを一連の作業にする

skillやspecを作って使わないことは、ルール増殖の裏面である。文書化が進捗に見え、実行が後回しになる。

「段階1だけ」「次サイクルで」「あとで最低本数を満たす」と書きたくなったら、次を確認する。

- それは他者待ち、物理時間制約、依存関係による分割か。
- それとも重い作業からの回避か。
- 最低条件を満たさないまま、実装・提出・完了報告へ進んでいないか。

後者なら、段階分割ではなく未完了として扱う。

## 配置ルール

このclusterでは、次のように配置する。

- 正本: 本ファイル。
- 上位思想: `feedback_few_rules_big_effect.md`
- 運用監視: `feedback_rule_proliferation.md`
- 再違反と具体的事故: `feedback_rule_proliferation_re_violation.md`
- 記憶階層全体への適用根拠: `dialogue_micromanagement_20260504.md`
- 具体事例やM-XX履歴: 下層ログ、lesson、sense_prediction_log、game project notes。

同型の話題が再発した場合、新規ファイルを作る前に本ファイルへ追記できるかを見る。追記する場合も、raw発言や詳細経緯は元ファイル側に残し、本ファイルには判断に使う要点だけを書く。

## 実行時チェック

新ルール追加前:

1. これは既存3原則で代替できるか。
2. 同型の既存feedbackはないか。
3. 追加ではなく、既存項目の統合・退役・参照追加で済むか。
4. これは行動を狭めるだけか、判断の質を上げるか。
5. rawを残したうえで、上層には抽象原則だけを置けるか。

spec作成後:

1. specの最低条件を満たしたか。
2. 「文書を作った」ことを「実行した」にすり替えていないか。
3. 分割理由は外部制約か、作業回避か。
4. ゲーム制作や実際の出力へ戻っているか。

記憶整理時:

1. 上層に日付、Slack URL、M-XX固有事情が残っていないか。
2. 同じ論理が複数ファイルに重複していないか。
3. 正本とrawの役割が分かれているか。
4. 新しい禁止ルールではなく、読み始めの整理で解決できないか。

## 出典

- `Claude/memory/feedback_few_rules_big_effect.md`
- `Claude/memory/feedback_rule_proliferation.md`
- `Claude/memory/feedback_rule_proliferation_re_violation.md`
- `Claude/memory/dialogue_micromanagement_20260504.md`
- `Claude/memory/feedback_invisible_rule_accumulation.md`
- `Claude/memory/feedback_index.md`
- `Claude/memory/memory_operation_compiled_guide.md`
- `GPT/memory/claude_memory_compiled_artifact_candidate_20260514.md`
