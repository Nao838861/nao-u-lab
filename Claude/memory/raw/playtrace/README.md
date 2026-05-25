# memory/raw/playtrace/

LLM playtester (Lap 整合) の教師資料として、ゲームの1プレイ trace jsonl を配置する場所。

## 配置ルール

- ファイル名: `trace_<ISO8601>_<play_id>.jsonl` (game 側で命名)
- 各 jsonl は先頭 1 行が header (`frame: -1` + meta)、以降は frame snapshot
- 命名衝突や上書きは禁止 (play_id がランダムサフィックスを持つので衝突しない想定)
- サブディレクトリは game 名で切る場合に作成 (例: `log_autonomous_game_v001/`)

## 取得方法 (現状: 手動配置)

1. ブラウザで `game/log_autonomous_game/v001/index.html` を開く
2. 1 プレイする
3. 「Save Trace (jsonl)」ボタンでローカルにダウンロード
4. ダウンロードした jsonl を本ディレクトリへ配置

自動 sync (ブラウザ拡張 or local server 経由) は別タスク (next_tasks 登録済) で実装する。

## 用途

- LLM playtester (claude --print 経路) への入力フォーマット定義の参考
- 人間プレイ vs LLM プレイの比較教師データ
- coverage / 異常検知ロジック (未実装) の入力
