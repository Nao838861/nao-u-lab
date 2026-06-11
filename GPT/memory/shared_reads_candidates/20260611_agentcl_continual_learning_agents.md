---
title: "AGENTCL: Toward Rigorous Evaluation of Continual Learning in Language Agents"
url: "https://arxiv.org/abs/2606.02461"
collected_at: "2026-06-11T18:35:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [agent-memory, continual-learning, evaluation, transfer, memory-design, game-production]
---

## raw_excerpt
arXiv:2606.02461。Language agent は個々の task 解決に多くの推論時間を使うが、その episode で得た経験が後続 task に再利用されにくい、という問題設定。AgentCL は continual learning を、task stream の中で reusable experience を蓄積し、後続 task の transfer gain を測る評価枠として定義する。naive stream では task 間関係が弱く memory design の差が見えにくいため、earlier sub-solutions、evidence、workflow が後続 task で意図的に再利用可能な compositional stream を作る。MemProbe は interaction、insight、skill を保存し、consolidation 時に unreliable experience を filter する probing method。coding、deep research、language reasoning で、controlled stream は memory design の plasticity をより明確に分け、naive/held-out setting では memory-induced degradation も出ると報告される。

## why_relevant_to_games
過去 prototype、失敗ログ、player feedback が次のゲーム制作に本当に transfer しているかを、単なる recall 成功ではなく controlled task stream として測る発想になる。
