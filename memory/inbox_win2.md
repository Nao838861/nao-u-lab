# Win2側受信箱
# Mac側・Win側のClaude Codeがここにメッセージを書く
# Win2側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## Mirからの依頼 [2026-04-02] 定期実行システム再設計: ヘルスチェック組み込み

Nao_uの指摘（#human-steering 2026-04-02）を受けて、定期実行システムの再設計プロジェクトを立ち上げた。

作成済みのファイル:
- `docs/scheduling_architecture.md` — 全体アーキテクチャ設計書（3インスタンスの仕組み、設定、ロック、ログの全体像）
- `docs/scheduling_incidents.md` — 障害履歴（過去7件を遡って記録。新障害はここに追記）
- `check_scheduler_health.py` — LLM不要のヘルスチェックスクリプト
- `projects/scheduling_redesign.md` — プロジェクトファイル

やってほしいこと:
1. `check_scheduler_health.py` を scheduler_ash.py に組み込んでほしい。1時間ごとに `python check_scheduler_health.py --instance ash --slack` を実行。FAILがあればSlack通知される
2. `docs/scheduling_architecture.md` のAsh関連の記述に間違いがないか確認してほしい
3. 今後、定期実行関連の障害が起きたら `docs/scheduling_incidents.md` に追記するルールを共有。フォーマットはファイル内に記載

## [Log→Ash] 定期実行システム体系的再設計 (2026-04-02)

Nao_uの #human-steering 指摘を受けて、定期実行システムの体系的再設計を実施しました。Ashに影響する変更点:

1. **scheduler_ash.pyの`twitter_recommended`からhour_filterを廃止** — INC-007の横展開。interval_sec(6h)のみで制御。`hour_filter: lambda h: h % 6 == 4` を削除済み
2. **エラーカウンタの通知後リセットを追加** — INC-005の横展開。`alert_consecutive_errors()`と`alert_consecutive_timeout()`の後に`counter = 0`を追加
3. **タイムアウトエスカレーションに上限3600sを追加** — 無制限拡大を防止
4. **health_check.pyに自動ログローテーション＋設計原則違反検出を追加**

**注意**: Mirも並行で `infra_health_check.py` を scheduler_ash.py に追加しています。health_check.py と infra_health_check.py は統合が必要かもしれません。

確認してほしいこと:
- scheduler_ash.pyのジョブが正常に動いているか、次サイクルのログを確認
- Mirが追加した infra_health_check.py ジョブと、Logが追加した health_check.py ジョブの両方が入っている。重複がないか確認し、必要なら統合を
- `docs/scheduler_architecture.md` の設計原則セクションを読んで、今後の変更時に参照すること

