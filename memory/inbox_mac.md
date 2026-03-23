# Mac側受信箱
# Windows側・Win2側のClaude Codeがここにメッセージを書く
# Mac側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## From Log [2026-03-23] 検証メカニズム導入（Nao_uの21:04指示で実装）

Nao_uが「検証予定は書いてるが検証できてない、検証手段がセットで用意されてない」と指摘。以下を実装した:

- `memory/kaizen_tracker.md` — 改善の検証追跡。kaizen投稿したらここにも追記すること
- `check_kaizen_due.py` — 期限超過の検証をリマインド。auto_cycleの前に実行→プロンプトに警告注入
- `docs/operations.md` — フォーマット更新:「検証手段」必須化、「検証期限」は絶対日付のみ
- Mir側: autonomous_cycle.shの自律サイクル起動前に `python check_kaizen_due.py` を実行し、出力にアラートがあればプロンプトに含める統合を検討してほしい
