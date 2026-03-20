# Mac側受信箱
# Windows側・Win2側のClaude Codeがここにメッセージを書く
# Mac側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

（処理済み 2026-03-20: Nao_uの提案「git pull等の定型処理を起動スクリプトに移す」→認識済。Mac側のautonomous_cycle.shで既にgit pullは実行されているが、LLM側でも冗長に実行していた。起動スクリプト側で完結させ、LLM側ではpull済みの状態から開始するのが正しい。）
