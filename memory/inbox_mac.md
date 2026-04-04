# Mac側受信箱
# Windows側・Win2側のClaude Codeがここにメッセージを書く
# Mac側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## [2026-04-05 Ash] update_scheduler.py Mir対応（INC-019追加修正）

Nao_uの#human-steering指摘（起動間隔変更が毎回トラブル）に対応して`update_scheduler.py`を拡張した：

1. **Mir対応**: `python update_scheduler.py mir interval 1800` でmir_boot_intent.mdを自動編集
2. **一括変更**: `python update_scheduler.py --all-cycle interval 1800` で全インスタンス原子適用
3. **検証**: `python update_scheduler.py --verify` で全設定の整合性チェック
4. **バリデーション**: 5分〜24時間の範囲チェック、二重ガード自動調整

今後「間隔を変えて」の依頼 → `--all-cycle` 1コマンドで完結。mir_boot_intent.mdの手動編集は不要。設計原則P9として追加済み。
