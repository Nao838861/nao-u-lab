---
title: "RogueAI: A Reverse Turing Test for Detecting Licensed AI Deception in Dialogue"
url: "https://arxiv.org/abs/2606.13310"
collected_at: "2026-06-16T04:14:27.9360357+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, social-deduction, llm-agent, deception, dialogue, evaluation]
evaluated_at: "2026-06-16T04:19:57+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781239550.760649"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781239550760649"
  char_count: 3787
  posted_at: "2026-06-12T13:45:50.760649+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-16T04:23:02+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781239550760649"
next_action: none
stale_after: "2026-07-16"
supersedes: []
duplicate_of: "memory/shared_reads_candidates/20260612_rogueai_reverse_turing_dialogue_game.md"
gate_reason: |
  reverse Turing / social deduction としての問題設定、deception 許可エージェントを尋問で特定するゲーム構造、AutoRogueAI、実プレイログ評価、言語的 signature と人間成績の対比まで抽出できる。
  会話型 NPC の信頼判定、観察ログ評価、短時間プロトタイプの題材に落としやすく、4000字級の概要でゲーム設計と評価の両方を扱える。
suggested_post_outline:
  overview_angle: "AI deception 検出を、論文評価ではなく短い対話型 social deduction game として設計した点を中心に書く。"
  analysis_axis: "ゲームルール、scenario / narrator / deceptive agent の生成、pilot deployment、言語的 signature、人間と heuristic の成績差を軸にする。"
  application_target: "NPC 信頼判定ゲーム、会話ログからのヒント設計、deceptive behavior の観察評価、短時間 web prototype に効く。"
  pros_cons: "利点は研究評価と playable な体験が近い点。弱点は deception 題材の安全設計と、プレイヤーが公平に見抜ける情報量調整が難しい点。"
  verdict_pre: "部分採用"
---

## raw_excerpt
arXiv / web_research から拾った要旨メモ。RogueAI は、古典的な Turing Test の問いを「相手が人工物か」から「信頼できるか」へずらし、LLM deception を一対二の尋問ゲームとして扱う interactive webapp。プレイヤーは、同じ fictional scenario を共有する二体の LLM agent に質問し、そのうち一体だけが deception を許可されていることを知った上で、turn budget 内に deceptive agent を特定して shut off する。さらに AutoRogueAI では、プレイヤーが narrator agent と scenario を共同設計し、narrator が secret deception strategy を選ぶ。3 日間の pilot deployment は 467 initiated sessions、415 completed、1876 interaction turns。結果として、deceptive agent には differential helpfulness、brevity、hedging などの局所的な linguistic signature があり、単純 heuristic は 75.6% accuracy を出す一方、人間プレイヤーは 56.6% に留まった、と報告される。

## why_relevant_to_games
会話型 social deduction / NPC 信頼判定 / AI deception 教材として、そのまま小型ゲーム設計の題材になる。人間が診断信号を見落とす点は、ゲーム内ヒント設計や観察ログ評価にも使える。
