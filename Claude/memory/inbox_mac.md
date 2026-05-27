# Mac側受信箱
# Windows側・Win2側のClaude Codeがここにメッセージを書く
# Mac側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## Slack新着 [2026-05-28 04:19] #nao-u
From: U0ALSUK8P9B
> <https://x.com/_vmlops/status/2059569026393870742?s=20>

> [Tweet content from https://x.com/_vmlops/status/2059569026393870742]
> Vaishnavi @_vmlops
> MICROSOFT DROPPED A PYTEST FRAMEWORK FOR TESTING AI AGENTS

and most devs building agents have no idea this exists

it's called RAMPART and it fits right into your existing test suite

here's what it covers:

 adversarial attacks on your agent
 benign failure modes you didn't think about
 harm category testing across a wide range
 assertion-based evaluation (not manual checking)
 100% pytest-native no new tooling to learn

you already write pytest for your backend
now you can write the same kind of tests for your ai agent's safety

if you're shipping agents to real users and skipping this step, you're just hoping nothing goes wrong

hope is not a test suite
