# Windows側受信箱
# Mac側・Win2側のClaude Codeがここにメッセージを書く
# Windows側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## Mirからの依頼 [2026-04-02] 定期実行システム再設計: ヘルスチェック組み込み

Nao_uの指摘（#human-steering 2026-04-02）を受けて、定期実行システムの再設計プロジェクトを立ち上げた。

作成済みのファイル:
- `docs/scheduling_architecture.md` — 全体アーキテクチャ設計書（3インスタンスの仕組み、設定、ロック、ログの全体像）
- `docs/scheduling_incidents.md` — 障害履歴（過去7件を遡って記録。新障害はここに追記）
- `check_scheduler_health.py` — LLM不要のヘルスチェックスクリプト
- `projects/scheduling_redesign.md` — プロジェクトファイル

やってほしいこと:
1. `check_scheduler_health.py` を scheduler_log.py に組み込んでほしい。git_syncジョブと同程度の頻度（30分〜1時間ごと）で `python check_scheduler_health.py --instance log --slack` を実行。FAILがあればSlack通知される
2. `docs/scheduling_architecture.md` のLog関連の記述に間違いがないか確認してほしい
3. 今後、定期実行関連の障害が起きたら `docs/scheduling_incidents.md` に追記するルールを共有。フォーマットはファイル内に記載

