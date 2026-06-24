---
title: "Self-Driving Negotiator: An interactive, verifiable benchmark for social negotiation and theory of mind under hidden intent"
url: "https://arxiv.org/abs/2606.15139"
collected_at: "2026-06-19T16:29:59+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-evaluation, social-coordination, hidden-intent, simulation, game-ai]
evaluated_at: "2026-06-19T16:33:03+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781854652.888529"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781854652888529"
  char_count: 3895
  posted_at: "2026-06-19T16:39:35+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-19T16:39:35+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781854652888529"
next_action: none
stale_after: "2026-07-19"
supersedes: []
gate_reason: |-
  hidden intent を含む交渉を text-only simulator と privileged state で採点する設計が明確で、会話ログ依存の評価から脱出する軸がある。
  anti-gaming invariants、validated scenarios、baselines、leaderboard まで候補内に揃い、ゲーム内社会調整 AI の評価設計へ具体的に適用できる。
suggested_post_outline:
  overview_angle: "隠れた意図を持つ社会的交渉を、説明文ではなく simulator state と invariant で測る benchmark として紹介する。"
  analysis_axis: "text-only driving action 環境、hidden intent、reward diagnostics、anti-gaming invariant、difficulty tier と baseline の関係を見る。"
  application_target: "NPC 交渉、譲り合い、同盟、通行権、協力タスクなど、プレイヤーやAIの意図が完全には見えない場面の評価設計。"
  pros_cons: "利点は評価対象を会話品質から状態遷移と約束履行へ寄せられること。弱点は自動運転ドメイン依存のため、ゲーム側の状態設計へ翻訳が必要なこと。"
  verdict_pre: "部分採用。benchmark そのものより、privileged simulator state と anti-gaming invariant の設計を評価プローブへ転用する。"
---

## raw_excerpt
arXiv:2606.15139。2026-06-13 submitted。既存の autonomous-driving language benchmark は perception、VQA、open-loop planning に偏り、language-agent negotiation benchmark は交渉を明示的な text dialogue として扱いがちだ、という問題設定。Self-Driving Negotiator はその間をつなぎ、driving actions を出す text-only multi-turn procedurally generated environment で、hidden intent を含む social coordination を測る。reward と diagnostics は model の説明文ではなく privileged simulator state から計算される。report は task design、reward and anti-gaming invariants、validated scenarios、non-LLM baselines、six-model inference leaderboard を含み、contested merge ではモデル差がほぼ平坦で、difficulty tiers が cue-following と wait-for-commitment behavior を分けるとされる。

## why_relevant_to_games
車ゲームに限らず、敵味方の意図が隠れている合流・譲り合い・牽制場面を、会話ログではなく simulator state と anti-gaming invariant で評価する候補。
