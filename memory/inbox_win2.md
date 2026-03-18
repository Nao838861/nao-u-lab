# Win2側受信箱
# Mac側・Win側のClaude Codeがここにメッセージを書く
# Win2側のcronが検出したらclaude CLIを起動して処理する
# 処理後はクリアしてpush








## Slack新着 [2026-03-19 06:13] #all-nao-u-lab
From: U0ALSUK8P9B
> 海外でちょいバズしてる「cognee-skills」、考え方が素晴らしすぎる。

一度作ったSkillsファイルは変わらないが、使っているAIモデルがアップデートされる、コードの構成が変わる、ユーザーが求める内容が変わる。

cognee-skillsは次の5ステップで各Skillsを改善してくれる。

===
1.取り込み（Ingest）：スキルファイルをそのまま放置せず、「このスキルは何を目的としているか」「どんなタスクパターンに対応するか」「他のスキルとどう関係するか」といった情報を付与して、検索・管理しやすい形に整理する。

2.観察（Observe）：スキルが実行されるたびに、結果を記録する。何のタスクに使われたか、成功したか失敗したか、エラーの内容、ユーザーからのフィードバック。この記録がなければ改善のしようがない。

3.検査（Inspect）：失敗が繰り返されたとき、蓄積された実行記録を分析して「なぜ失敗しているのか」の原因パターンを特定する。指示の書き方が悪いのか、トリガー条件がずれているのか、外部ツールとの連携が壊れているのか。

4.修正（Amend）：原因が特定されたら、スキルファイルの該当箇所に対して具体的な修正案を自動生成する。修正内容は、条件の追加、手順の並び替え、出力フォーマットの変更などになる。人間が確認してから適用することも、自動適用することもできる。

5.評価（Evaluate）：修正後のスキルが実際に結果を改善したかをテストする。改善していなければ元に戻す。改善が確認されて初めて、修正版が正式な新バージョンになる。すべての変更履歴は残るので、元の指示が失われることはない
===


## Slack新着 [2026-03-19 06:13] #nao-u
From: U0ALSUK8P9B
> *Self improving skills for agents* 
*“*_not just agents with skills, but agents with skills that can improve over time_*”*
Seems that “<http://skill.md/|SKILL.md>” is here to stay, however, we haven’t really solved the most fundamental problem around them:
*Skills are usually static, while the environment around them is not!*
A skill that worked a few weeks ago can quietly start failing when the codebase changes, when the model behaves differently, or when the kinds of tasks users ask for shift over time. In most systems, those failures are invisible until someone notices the output is worse, or starts failing completely.
The missing piece here for making the skills folder actually useful is to start treating them as *living system components, not fixed prompt files.*
And this is exactly the idea behind *<https://pypi.org/project/cognee/0.5.4.dev2/|cognee-skills>*
*Not just how to store skills better or route them better, but how to make them improve when they fail or underperform!*

Until today, the skills were about:
1. writing a prompt
2. saving it in a folder
3. calling it whenever needed
This works surprisingly well, but unfortunately only for demos… After a certain point, we start hitting the same wall:
• One skill gets selected too often
• Another looks good but fails in practice
• One individual instruction keeps failing
• A tool call breaks because environment has changed
And the worst part of all is that no one knows if the issue is routing, instructions, or the tool call itself, which leads to manual maintenance and inspection. What we achieved with this implementation is to have the whole loop closed leading us to *skills that can self-improve over time.*
But let’s also give a brief overview of what is happening under the hood.
*1. Skill ingestion*
Right now your skill folder looks something like this:
my_skills/
          summarize/
                      <http://skill.md/|SKILL.md>
          bug-triage/
                     <http://skill.md/|SKILL.md>
          code-review/
                     <http://skill.md/|SKILL.md>
Last week, we showed that with cognee we can give everything a clearer structure, not just because it looks nicer, but because it also makes searching much more effective. We can also enrich the different fields with semantic meaning, task patterns, summaries, and relationships, which helps the system understand and route information smarter. All of these are stored using cognee’s “Custom DataPoint”.
Here is a small visualization of how your skills could look like:




0:01 / 0:12



Link to the dynamic graph view: <https://cognee-graph-skills.vercel.app/>
*2. Observe*
*A skill cannot improve if the system has no memory of what happened when it ran*. For that reason, after the execution of each skill, we store data in order to know:
• What task was attempted
• Which skill was selected
• Whether it succeeded
• What error occurred
• User feedback, if any
With observation, failure becomes something the system can reason about. You cannot improve a skill if you do not know what happened when it ran. Keeping in mind that we operate on a structure graph this can be added by an additional node which will have all the observations collected. That is all manageable by cognee’s “Custom DataPoint”, where one could specify all the fields that they want to populate.
*3. Inspect*
Once enough failed runs accumulate (or even after a single important failure) one can inspect the connected history around that skill: past runs, feedback, tool failures, and related task patterns. Because all of this is stored as a graph, the system can trace the recurring factors behind bad outcomes and use that evidence to propose a better version of the skill.
*runs  →  repeated weak outcomes → inspection*
*4. Amend skill → .amendify()*
Once the system has enough evidence that a skill is underperforming, it can propose an amendment to the instructions. That proposal can be reviewed by a human, or applied automatically. The goal is simple:
• _*Reduce the friction of maintaining skills as systems grow.*_
Instead of manually searching through your codebase for broken prompts, the system can look at the execution history of a skill, including past runs, failures, feedback, and tool errors, and suggest a targeted change.
The amendment might:
• tighten the trigger
• add a missing condition
• reorder steps
• change the output format
This is the moment where *skills stop behaving like static prompt files and start behaving more like evolving components.* Instead of opening a SKILL.md file and guessing what to change, the system can propose a patch grounded in evidence from how the skill actually behaved.
*5. Evaluate &amp; Update skill*
A self-improving system though,  should never be trusted simply because it can modify itself. Any amendment must be evaluated. Did the new version actually improve outcomes? Did it reduce failures? Did it introduce errors elsewhere?
For that reason, the loop cannot be just:
• observe → inspect → amend
Instead, it must follow a more disciplined cycle:
• observe → inspect → amend → evaluate
If an amendment does not produce a measurable improvement, the system should be able to roll it back. Because every change is tracked with its rationale and results, the original instructions are never lost, and *self-improvement becomes a* *structured, auditable process* rather than uncontrolled modification. When the evaluation confirms improvement, the amendment becomes the next version of the skill.

*Conclusion*
Skills cannot stay static while the systems around them constantly change. As models, codebases, and tasks evolve, fixed prompt files inevitably degrade. We introduced a straightforward way to do so, automatically, while not giving up any of the control and oversight over the skills themselves.
Check out the PyPi build: <https://pypi.org/project/cognee/0.5.4.dev2/>
Check out Cognee: <https://github.com/topoteretes/cognee>
Join the Discord community: <https://discord.gg/pMFAz242>
<https://x.com/tricalt/status/2032179887277060476|午前4:40 · 2026年3月13日>
·*<https://x.com/tricalt/status/2032179887277060476/analytics|168.4万>*
<https://x.com/tricalt/status/2032179887277060476/analytics| 件の表示>
