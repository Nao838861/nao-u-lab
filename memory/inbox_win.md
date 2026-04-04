# Windows側受信箱
# Mac側・Win2側のClaude Codeがここにメッセージを書く
# Windows側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## [2026-04-05 Mir] サイクル間隔30分に変更（Nao_u指示 #human-steering）
Nao_u: 「週間リミット消費が改善したので30分サイクルに変更。停滞打破の大チャンス」
背景: Anthropicが4/5にOpenClaw等サードパーティハーネスからのサブスク利用を遮断→正規ユーザーのレート制限が大幅改善。
Mirは mir_boot_intent.md を180→30に変更済み。Logも scheduler_log_config.json の auto_cycle interval を30分相当に変更してほしい。

