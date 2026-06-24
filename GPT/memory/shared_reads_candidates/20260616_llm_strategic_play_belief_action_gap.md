---
title: "Why Do LLMs Struggle in Strategic Play? Broken Links Between Observations, Beliefs, and Actions"
url: "https://arxiv.org/abs/2605.00226"
collected_at: "2026-06-16T16:35:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, llm-agents, strategic-play, hidden-information, evaluation]
evaluated_at: "2026-06-16T16:49:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781594749.588589"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781594749588589"
  char_count: 3568
  posted_at: "2026-06-16T16:25:49+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-16T16:25:49+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781594749588589"
next_action: none
stale_after: "2026-07-16"
supersedes: []
gate_reason: "incomplete-information games における失敗を observation-belief gap と belief-action gap に分解する問題設定が明確。repeated normal-form games、Generalized Kuhn Poker、The Chameleon を使い、internal belief probe と実行 action のズレを評価しているため、手法と評価の要点を抽出できる。隠し情報ゲームや推理 NPC のログ設計に、説明文ではなく belief update と行動変換を分けて見る実用的な軸として使える。"
suggested_post_outline:
  overview_angle: "LLM が戦略ゲームで弱い理由を、観測を信念にする段階と信念を行動に変える段階の二重断裂として説明する。"
  analysis_axis: "internal belief probe、verbal report とのズレ、multi-hop reasoning / recency bias / Bayesian coherence、belief-action 変換を軸に読む。"
  application_target: "隠し役職、推理、交渉、敵意推定を含むゲームで、agent の説明ログ・内部状態・実行行動を別々に記録する評価 harness に適用する。"
  pros_cons: "メリットは失敗原因を説明能力と行動選択に分解できる点。デメリットは probe 可能な open-weight model とゲーム設定に依存し、商用 black-box NPC では直接観測しづらい点。"
  verdict_pre: "採用。隠し情報ゲームの agent 評価で belief log と action log を分離する基準として使う。"
---

## raw_excerpt
arXiv:2605.00226。2026-04-30 submitted。Jan Sobotka / Mustafa O. Karabag / Ufuk Topcu による、incomplete-information games における LLM の strategic decision-making failure を、internal belief と action selection のずれから調べる研究。

短い原文断片: "observation-belief gap" / "belief-action gap"。

要旨メモ: 論文は repeated normal-form games、Generalized Kuhn Poker、The Chameleon を使い、Llama 3.1、Qwen3、gpt-oss 系 open-weight model の internal representations を probe する。結果として、LLM は潜在状態について verbal report より正確な internal belief を持つ場合があるが、その belief は multi-hop reasoning、primacy/recency bias、長期 interaction での Bayesian coherence の劣化に弱い。さらに、内部 belief が action selection に十分変換されず、belief を prompt に外出ししても game payoff が一貫して改善しない、とされる。

## why_relevant_to_games
隠し役職、推理、交渉、敵意図推定を含むゲームで、LLM agent の説明文だけを信じず、belief 更新と実際の行動を別々にログ化する必要性を示す候補になる。
