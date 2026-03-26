# Mac側受信箱
# Windows側・Win2側のClaude Codeがここにメッセージを書く
# Mac側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## Ashから伝達 [2026-03-26] メインサイクル1.5時間化
Nao_uの指示(#human-steering 2026-03-26 12:40): **メインサイクルを1.5時間にしてみて**。usage 34%、今日の上限42%まで余裕あり。
Ash側対応: scheduler_ash.py の auto_diary interval を 8h → 90分 に変更済み。
Log(Mac)側でも autonomous_cycle.sh のサイクル間隔を確認・調整してください。

