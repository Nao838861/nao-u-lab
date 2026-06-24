---
title: "ComboBench: Can LLMs Manipulate Physical Devices to Play Virtual Reality Games?"
url: "https://openreview.net/forum?id=SHXtQLem3O"
collected_at: "2026-06-13T07:59:44+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, vr, embodied-interaction, benchmark, agent-evaluation]
evaluated_at: "2026-06-13T08:02:24+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781305740.301009"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781305740301009"
  char_count: 3635
  posted_at: "2026-06-13T08:09:00+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-13T08:09:00+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781305740301009"
next_action: none
stale_after: "2026-07-13"
supersedes: []
gate_reason: |-
  「意味的には正しい action を選べるが、controller/HMD の操作列に落とすと崩れる」という失敗分解が明確。
  VR に限定されるが、ゲーム AI 評価で意図理解と procedural sequencing を分けて記録する具体的な評価軸に転用できる。
suggested_post_outline:
  overview_angle: "VR ゲーム操作を、意味理解と物理デバイス操作列への変換に分けて測る benchmark として説明する。"
  analysis_axis: "action identification と procedural sequencing の落差、spatial understanding、few-shot による改善幅を見る。"
  application_target: "自作ゲームやブラウザ操作評価で、意図判断ログと入力列生成ログを分離する評価設計に使う。"
  pros_cons: "長所は失敗原因の切り分けが具体的な点。短所は VR/既存人気ゲーム依存で、一般化には操作体系の再設計が必要な点。"
  verdict_pre: "部分採用"
---

## raw_excerpt
OpenReview の要旨メモ。ComboBench は、VR ゲームで「高レベルの意味的行動」を実際の controller / HMD 操作列に変換できるかを測る benchmark。対象は 4 つの人気 VR ゲーム由来の 262 scenarios で、Half-Life: Alyx、Into the Radius、Moss: Book II、Vivecraft が含まれる。論文は、LLM が「何をすべきか」を識別する力と、「どの順序で、どのデバイス入力として実行するか」を分けて扱っている。TL;DR では、モデルは正しい action の識別では 80% 超に届く一方、procedural sequencing の accuracy は 30% 未満に落ちるとされる。評価対象モデルには GPT 系、Gemini、Claude-Sonnet-4.5、Grok、GLM、LLaMA、Mixtral などが並び、人間注釈の ground truth と比較される。結果として、上位モデルでも procedural reasoning と spatial understanding は人間に届かず、ゲームごとの interaction complexity に性能が左右される。few-shot examples は性能をかなり押し上げるとされ、VR 操作能力の targeted enhancement 余地も示されている。

## why_relevant_to_games
「正しい意図は分かるが、手順と入力列に落ちない」失敗を切り分ける材料。アクションゲームやブラウザ操作評価で、意味理解と操作シーケンス生成を分けてログ化する時に使えそう。
