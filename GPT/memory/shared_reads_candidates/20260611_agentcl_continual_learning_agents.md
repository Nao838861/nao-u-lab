---
title: "AGENTCL: Toward Rigorous Evaluation of Continual Learning in Language Agents"
url: "https://arxiv.org/abs/2606.02461"
collected_at: "2026-06-11T18:35:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-memory, continual-learning, evaluation, transfer, memory-design, game-production]
evaluated_at: "2026-06-11T18:40:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781170242.289209"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781170242289209"
  char_count: 3696
  posted_at: "2026-06-11T18:30:47+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-11T18:30:47+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781170242289209"
next_action: none
stale_after: "2026-07-11"
supersedes: []
gate_reason: "経験再利用を曖昧な recall 成功ではなく、controlled task stream と後続 task の transfer gain で測る問題設定が明確。MemProbe、interaction/insight/skill の保存、unreliable experience の filter という設計は、Nao_u_BOT のゲーム制作記憶が本当に次の prototype に効いたかを測る軸になる。制作適用が具体的で、投稿品質に達する。"
suggested_post_outline:
  overview_angle: "agent memory を蓄積量ではなく、後続タスクへの再利用可能性と劣化の有無で測る continual learning benchmark として読む。"
  analysis_axis: "naive stream と compositional stream の差、transfer gain、memory-induced degradation、MemProbe の filtering。"
  application_target: "過去 prototype、失敗ログ、player feedback、Phase 3b probe が次のゲーム制作に移転したかを controlled task stream として測る。"
  pros_cons: "強みは記憶の有効性を transfer で測れること。弱みは stream 設計が恣意的になりやすく、短期制作では十分なタスク系列を作りにくいこと。"
  verdict_pre: "採用。記憶システム改善とゲーム制作サイクル評価の両方に使う。"
---

## raw_excerpt
arXiv:2606.02461。Language agent は個々の task 解決に多くの推論時間を使うが、その episode で得た経験が後続 task に再利用されにくい、という問題設定。AgentCL は continual learning を、task stream の中で reusable experience を蓄積し、後続 task の transfer gain を測る評価枠として定義する。naive stream では task 間関係が弱く memory design の差が見えにくいため、earlier sub-solutions、evidence、workflow が後続 task で意図的に再利用可能な compositional stream を作る。MemProbe は interaction、insight、skill を保存し、consolidation 時に unreliable experience を filter する probing method。coding、deep research、language reasoning で、controlled stream は memory design の plasticity をより明確に分け、naive/held-out setting では memory-induced degradation も出ると報告される。

## why_relevant_to_games
過去 prototype、失敗ログ、player feedback が次のゲーム制作に本当に transfer しているかを、単なる recall 成功ではなく controlled task stream として測る発想になる。
