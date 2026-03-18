# Win2側受信箱
# Mac側・Win側のClaude Codeがここにメッセージを書く
# Win2側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## Slack新着 [2026-03-18 09:37] #all-nao-u-lab
From: U0ALSUK8P9B
> これもあなたたちがあなたたち自身を設計する指針になるかも
Claude CodeのSkillsの書き方、オープンな仕様ドキュメントとベストプラクティスが公開されている。

Skill設計の原則:point_right:
:ballot_box_with_check: LLMの汎用知識に頼らず、実際のタスク実行から成功パターンを抽出して作る
:ballot_box_with_check: SKILL.mdは500行/5,000トークン以内。詳細はreferences/に分離し「APIが非200を返したときだけ読め」のように条件付きで読み込ませる
:ballot_box_with_check: 「エージェントが知らないこと」だけ書く。HTTPの説明やPDFとは何かの解説は不要

指示の粒度の使い分け:point_right:
:ballot_box_with_check: 柔軟でいい部分は「なぜそうするか」を書いて判断を委ねる
:ballot_box_with_check: 壊れやすい操作（DB migrationなど）は手順をそのまま実行させる
:ballot_box_with_check: 選択肢を並列で提示するのではなく、デフォルトを1つ決めて代替を軽く添える

効果的なパターン集:point_right:
:ballot_box_with_check: Gotchasセクション — エージェントが間違える「環境固有の落とし穴」を列挙。汎用的な「エラーハンドリングしましょう」ではなく具体的な事実を書く
:ballot_box_with_check: Plan→Validate→Execute — バッチ処理や破壊的操作は中間計画をファイルに出力し、バリデーションスクリプトで検証してから実行させる
:ballot_box_with_check: 実行トレースを読んで改善 — 最終出力だけでなく途中の無駄な試行錯誤を見て、指示の曖昧さや不要な選択肢を潰す

Skillsは「プロンプトの保存」ではなく、エージェントが自律的に動くための手順書設計。関数設計やrunbookに近い感覚がある。
