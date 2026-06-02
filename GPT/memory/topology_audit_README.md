# topology_audit 導入メモ

`tools/topology_audit.py` は atom 間リンクの dry-run 診断ツール。

目的:

- `high_inbound`: 多数の atom から参照されている atom を見る
- `sensitive_to_permanent`: local / feedback 系 atom から permanent 相当の atom へ接続している候補を見る
- `stale_bridge`: 古い atom が最近の atom から再参照され、橋渡しとして残っている候補を見る

使い方:

```powershell
python tools/topology_audit.py --compact
python tools/topology_audit.py --out memory/topology_audit_latest.md
```

このツールは自動修正、削除、backfill をしない。詳細判断は Phase 4a/4b/4c の staging に残す。`memory_health.py` には詳細リストを混ぜず、summary だけを表示する。
