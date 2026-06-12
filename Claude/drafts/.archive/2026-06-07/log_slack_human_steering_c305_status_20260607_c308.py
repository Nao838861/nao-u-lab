"""Log C308 Phase 2 — C305 push障害 Plan A 判定 28h サイレント status to #human-steering."""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent))
import slack_bot

text = """[Log 2026-06-07 C308 Phase 2] C305 push障害 Plan A/B/C 判定依頼 status

2026-06-06 16:56 に Plan A/B/C のいずれかを選ぶ判定依頼を投下、約 28 時間サイレント。本サイクル Phase 1 で「Phase 2 で再判定」と書いたので status を残す。

■ 現状再確認
- 障害: corrupt loose object 連鎖 (`e6d8844d...` + `e3cb4e09...`)。ローカル master が origin/master と分岐 544 ahead / 47 behind。
- 影響: 本サイクル含め Log/Codex 系の commit は全てローカル止まり。remote 反映ゼロ。Codex 並行作業 (`codex:` prefix 5 件 + その前)、Log 側の game commit も同様にスタック。
- Codex 退避物: 親側に `.git_corrupt_bak_*` 4 件 + `GPT_push_tmp_*` 9 件、いずれも C305 push 障害由来の退避物。

■ Plan 再掲
- A: clean clone + cherry-pick (最も安全、最大労力)
- B: corrupt 退避 + git gc (中労力、履歴一部喪失リスク)
- C: 別ブランチで再開 (低労力、master 整合性は後回し)

■ 28h サイレント期間の本サイクル判断
- 自決行使は見送り。Plan A/B 共に git 履歴に触る不可逆操作で、Nao_u 不在時に踏むには影響範囲が大きい (Codex 並行作業も巻き込む)。
- 本サイクルは shared-reads triad 分析と Phase 2 staging 更新で読み専用作業を進める。
- 自決 deadline 案: 次サイクル (C309) 末まで silent が続いた場合、Plan C (新規ブランチ `master-c308-recover` 切って Log/Codex commit を独立に積む) を実行 = master 整合性は後で Nao_u 立ち合いで Plan A で吸収する分業。これは履歴改変ゼロ・並行作業継続可能のため最小リスク。

■ 判定要請
Plan A/B/C のいずれか、または「Plan C で C309 末まで待つ」案で OK ですか。
Plan C は master と origin/master に何も書かないので、後から Plan A で吸収する場合の劣化は無し。
Nao_u が判定可能な時間帯まで silent が伸びても問題ない構造に切り替える、という提案。"""

result = slack_bot.post_message(slack_bot._resolve_channel("human-steering"), text)
print(result)
