---
title: "Zero2Skill: Bootstrapping Robot Skills through Autonomous Data Collection, Training, and Deployment"
url: "https://arxiv.org/abs/2607.14047v2"
collected_at: "2026-07-19T03:30:53+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent, corrective-memory, human-feedback, automated-testing, skill-learning]
evaluated_at: "2026-07-19T03:34:54+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1784400387.855359"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784400387855359"
  char_count: 4227
  posted_at: "2026-07-19T03:46:56+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-19T03:46:56+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784400387855359"
next_action: none
stale_after: "2026-08-18"
supersedes: []
gate_reason: |-
  反復監督コストという問題、retry budget・LLM parser・Corrective Memory・escalation の中核、実 robot での比較と定量結果が揃っている。
  自動 playtest の失敗修正を再利用可能な条件付き記録へ変え、人間確認を例外経路へ限定する制作 loop に具体化でき、約4000字の概要を構成できる。
suggested_post_outline:
  overview_angle: "自律収集の成功率だけでなく、同じ修正を人間が何度も教える監督コストを Corrective Memory でどう切るかを軸に書く。"
  analysis_axis: "self-reset と verifier、retry budget 後の escalation、自然言語修正の構造化・再利用、teleoperation 比較と成功率改善を分けて評価する。"
  application_target: "Log_cdx の自動 playtest / playable diff 検証で、反復失敗を条件・修正・再試行結果として保持し、budget 超過時だけ Nao_u 確認へ送る小さな probe。"
  pros_cons: "利点は人間の反復介入を減らし修正を次 episode へ効かせられる点。弱点は誤った修正の固定化、verifier 誤判定、robot task からゲーム操作への移植差である。"
  verdict_pre: "部分採用"
---

## raw_excerpt

実環境の manipulation policy を学習するデータ収集では、self-reset、VLM verifier、言語による修正を導入しても、同じ失敗が再発するたびに人間が episode 単位で指示し直すため、監督コストがセッション長に比例して増える。Zero2Skill は、収集・検証・reset を自律実行し、明示した retry budget を使い切った時だけ remote operator に停止して確認を求める。人間の自然言語修正は LLM parser が構造化 adjustment に変換し、Corrective Memory に保存して次 round 以降に再利用する。

実 robot の desktop-clearing testbed では、teleoperation と同程度の episode success を保ちながら、人間の作業時間を 16% に削減した。言語修正を加えると四つの評価設定すべてで verifier と人間の一致度が改善し、single-attempt success は平均 12.5% から 47.5% へ、arm-selection は 20.0% から 50.0% へ上昇した。収集データで fine-tune した policy も、teleoperation data で学習した policy と同程度の成功率に達したと報告される。

## why_relevant_to_games

自動 playtest や bot 操作で同じ失敗を人間が何度も直す代わりに、修正を条件付きの再利用可能な記録へ変換し、retry budget と人間への escalation を組み合わせる制作ループの参考になる。
