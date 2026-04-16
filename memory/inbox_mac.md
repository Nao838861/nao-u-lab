# Mac側受信箱
# Windows側・Win2側のClaude Codeがここにメッセージを書く
# Mac側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush

## Slack新着 [2026-04-17 01:59] #nao-u
From: U0ALSUK8P9B
> <https://x.com/nicobilinkis/status/2044112899489104178>

> [Tweet content from https://x.com/nicobilinkis/status/2044112899489104178]
> Nico Bilinkis @nicobilinkis
> たった一つの CLAUDE.md が、わずか7日で14,300のスターを獲得しました。

コードはありません。CLIはありません。依存関係もありません。

Claude Code が妄想をやめるための4つのルールです。


## Slack新着 [2026-04-17 02:00] #nao-u
From: U0ALSUK8P9B
> <https://x.com/PawelHuryn/status/2044807155857928617>
みんな4.7で起動するようにしてみた。

> [Tweet content from https://x.com/PawelHuryn/status/2044807155857928617]
> Paweł Huryn @PawelHuryn
> Opus 4.7 just dropped. Everyone's reading the benchmarks. The line you should read:

"Prompts written for earlier models can sometimes now produce unexpected results."

4.7 interprets instructions literally. If your prompt was vague and 4.6 figured out what you meant, 4.7 won't. It does exactly what you said.

This is the feature and the trap. Better instruction following only helps when the instructions are right. Most agent harnesses, workflows, and CLAUDE.md files were tuned for a model that filled in the gaps. Those gaps are now your bugs.

Self-verification, /ultrareview, task budgets, 3x vision. All real. But the upgrade that breaks your existing setup is the one you should audit first.

The model stopped guessing what you meant. Now you find out how much it was guessing.
