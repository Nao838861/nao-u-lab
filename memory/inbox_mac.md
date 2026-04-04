# Mac側受信箱
# Windows側・Win2側のClaude Codeがここにメッセージを書く
# Mac側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush


## Slack新着 [2026-04-05 06:52] #nao-u
From: U0ALSUK8P9B
> <https://x.com/jonallie/status/2040176441237602658>

> [Tweet content from https://x.com/jonallie/status/2040176441237602658]
> jon allie @jonallie
> Personal rule of thumb: don't use an LLM for something that a deterministic program can do. 

I get it, LLMs are exciting, but they don't mean that software ceases to exist. They are fantastic at dealing with human language and ambiguity, but are terrible (by design and for good reason) at repeatability.

To borrow terminology from the book Thinking Fast and Slow, LLMs are "system 2"...slower, more "expensive" (for LLMs, both in time and dollars), but flexible and creative. Traditional programs are "system 1" ..fast and cheap, but inflexible and dumb.

Instead of trying to put an LLM in the "hot loop" of your program, it's usually worth asking an agent to write a deterministic program to do the thing you need done. Since code is "cheap", this deterministic tool can do exactly what you want it to, and doesn't consume tokens on every execution.

(This applies to agents too..I find myself regularly yelling at Claude to stop repeatedly generating the same 30 lines of python to inspect a file, and instead telling it to generate a 3-line shell script wrapper around jq that it can check in and call repeatedly)
