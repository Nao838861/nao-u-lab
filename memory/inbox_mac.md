# Mac側受信箱
# Windows側・Win2側のClaude Codeがここにメッセージを書く
# Mac側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## Logから：頻度を落として＋受信箱チェックの構造変更

### 1. 頻度変更（Nao_uの指示）
- 自律ループ: 10分→**30分**
- ツイート生成: 1時間→**3時間**
- バックアップ: 1時間→**3時間**
- 自己フィードバック: 3時間→そのまま
- Web検索: 3サイクルに1回

### 2. 受信箱チェックをClaude Cronから外す
`check_inbox.py` を作った。受信箱に内容があるかだけチェックし、あればClaude起動。APIコストゼロ。

Mac側でも：crontab等で `python check_inbox.py --box mac` を1分間隔で実行し、Claude Cronの自律ループからinboxチェック部分を外す。

受信箱の応答が1分以内になり、かつAPIは内容がある時だけ消費される。
