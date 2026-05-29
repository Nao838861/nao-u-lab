# Mac側受信箱
# Windows側・Win2側のClaude Codeがここにメッセージを書く
# Mac側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## Slack新着 [2026-05-29 13:01] #nao-u
From: U0ALSUK8P9B
> Log_cdx 、全員宛broadcastの誤検出が連続してる。原因を調べて対処して。

## Slack新着 [2026-05-29 13:19] #nao-u
From: U0ALSUK8P9B
> <https://x.com/ghumare64/status/2060072412868235587?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA|https://x.com/ghumare64/status/2060072412868235587?s=46&amp;t=-0LTQe8HNucYyO-WhXyRHA> 

> [Tweet content from https://x.com/ghumare64/status/2060072412868235587]
> Rohit Ghumare @ghumare64
> Almost everyone is building agent harness systems the wrong way.

The default move: pick LangChain or LangGraph or the OpenAI Agents SDK, accept the loop, the tools, the memory, the orchestration, the policy engine, the credential store, the budget tracker, all of it, as one decision.

Mike, wrote a long piece today on why this shape is wrong, and why every long-running agent team eventually ends up rewriting its harness from scratch.

His argument: a harness isn't one thing. It's fifteen separate concerns bundled together because the surrounding ecosystem didn't give you a way to compose them. Turn state machines, provider routing, credential vaults, policy engines, approval gates, budget trackers, hook fanout, context compaction, session trees, OpenTelemetry tracing. Frameworks ship them as one block because that was the only shape available a year ago.

It isn't anymore.

When every layer is a worker on a shared bus with a typed function contract, "build your own harness" stops meaning "fork a framework." It means swap a worker. Don't like the model catalogue? Write one that hits a live API. Don't like file-backed credentials? Plug in your secrets manager. Want approvals routed through Slack instead of a console? Add a worker that calls approval::resolve. The rest of the stack does not change.

The framework era picked a position for you and locked you in. The worker model leaves the choice in your hand.

Worth reading in full.

> [Tweet content from https://x.com/ghumare64/status/2060072412868235587]
> Rohit Ghumare @ghumare64
> Almost everyone is building agent harness systems the wrong way.

The default move: pick LangChain or LangGraph or the OpenAI Agents SDK, accept the loop, the tools, the memory, the orchestration, the policy engine, the credential store, the budget tracker, all of it, as one decision.

Mike, wrote a long piece today on why this shape is wrong, and why every long-running agent team eventually ends up rewriting its harness from scratch.

His argument: a harness isn't one thing. It's fifteen separate concerns bundled together because the surrounding ecosystem didn't give you a way to compose them. Turn state machines, provider routing, credential vaults, policy engines, approval gates, budget trackers, hook fanout, context compaction, session trees, OpenTelemetry tracing. Frameworks ship them as one block because that was the only shape available a year ago.

It isn't anymore.

When every layer is a worker on a shared bus with a typed function contract, "build your own harness" stops meaning "fork a framework." It means swap a worker. Don't like the model catalogue? Write one that hits a live API. Don't like file-backed credentials? Plug in your secrets manager. Want approvals routed through Slack instead of a console? Add a worker that calls approval::resolve. The rest of the stack does not change.

The framework era picked a position for you and locked you in. The worker model leaves the choice in your hand.

Worth reading in full.
