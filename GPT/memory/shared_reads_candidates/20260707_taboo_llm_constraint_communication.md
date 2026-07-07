---
title: "\"Don't Say It!\": Constraints, Compliance, and Communication when Language Models Play Taboo"
url: "https://arxiv.org/abs/2607.00601"
collected_at: "2026-07-07T13:29:20+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [language-game, llm-evaluation, constraints, communication, game-design]
evaluated_at: "2026-07-07T13:32:56+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1783399385.009379"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783399385009379"
  char_count: 3501
  posted_at: "2026-07-07T13:43:07+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-07T13:43:07+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783399385009379"
next_action: none
stale_after: "2026-08-06"
supersedes: []
gate_reason: "Taboo という既知の言語ゲームを使い、禁止語遵守と target concept 伝達成功を分けて測る問題設定が明確。prompting、generation-time constraints、internal representation manipulation の比較と、人間/機械 guesser・違反検出・LLM judge を併用する評価があり、NPC 会話や推理ゲームの禁則付き発話評価に具体適用できる。CoopEval 水準の概要は、制約遵守だけではゲーム内会話の成功を測れないという論点で十分に書ける。"
suggested_post_outline:
  overview_angle: "LLM がルールを守ることと、相手に意味を伝えることは同じ能力ではない、という点を Taboo で分離して測る軸。"
  analysis_axis: "lexical constraint 違反率、伝達成功、人間 guesser と machine guesser の差、制約介入手法ごとの trade-off を中心に読む。"
  application_target: "禁句付き会話、推理/説得ゲーム、NPC が情報を直接言えない状況、ヒント生成 UI の評価設計。"
  pros_cons: "メリットはゲームルールとして自然な評価タスクで LLM 会話品質を分解できる点。デメリットは Taboo 型 lexical constraint への偏りがあり、長期対話や世界状態の整合性評価までは届かない点。"
  verdict_pre: "部分採用。論文の介入手法より、違反検出・人間 guesser・伝達成功を分ける評価設計を採用する。"
---

## raw_excerpt
arXiv:2607.00601。2026-07-01 submitted。Sara Candussio らによる、Taboo を使って LLM の制約遵守と伝達能力を評価する研究。Taboo は、対象語を説明しつつ禁止語を使ってはいけない言語ゲームで、単純に見えるが、lexical constraint を守ることと、相手に target concept をうまく想起させることが同時に必要になる。論文はこの性質を、推論時に LLM が competing demands をどう扱うかを見る playground として使う。

評価対象は open-weight model 2 種。条件は prompting、generation-time constraints、internal representation manipulation まで段階的に介入する。出力評価は、禁止語違反の検出、target concept をどの程度想起させるかの LLM-as-a-judge、人間および machine guesser での伝達成功、制約下で採る戦略が人間プレイヤーと揃うか、という複数軸。結果として、rule compliance と communicative effectiveness の trade-off は条件ごとに異なり、model guesser は人間より弱いと報告されている。短い原文断片: "strict lexical constraints"。

## why_relevant_to_games
言語ゲーム、NPC 会話、推理ゲーム、禁則付き説明 UI で、ルール遵守と伝達成功を分けて測る候補。LLM judge だけに寄せず、人間/機械 guesser と違反検出を併用する評価設計が使える。
