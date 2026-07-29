---
title: "Knowledge-Centric Self-Improvement"
url: "https://arxiv.org/abs/2607.19592"
collected_at: "2026-07-30T06:01:20+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent, memory, knowledge-curation, evaluation, game-development]
evaluated_at: "2026-07-30T06:05:48+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-30T06:05:48+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-30T06:05:48+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-29"
supersedes: []
gate_reason: >-
  agent 自体を更新せず、試行証拠を task-level / cross-task forum で照合して型付き knowledge bundle へ蒸留する機構と、
  4 benchmark・10 generation・held-out zero-shot transfer・異種 LLM family transfer の評価が揃っている。
  ゲーム試作の生ログを fresh な制作 agent が使える再利用知識へ変える工程に直接対応し、約4000字で限界まで論じられる。
suggested_post_outline:
  overview_angle: "agent の永続化ではなく、証拠付き knowledge base を唯一の改善対象にする設計と transfer 評価を軸に解説する"
  analysis_axis: "task-level forum、cross-task forum、型付き distillation、task-conditioned adapter の分業が、単なるログ蓄積と何を変えるかを分析する"
  application_target: "ゲーム試作・headless 評価・自己判定の結果を claim / constraint / rejected hypothesis / check に分け、別作品へ渡す前に cross-task evidence で選別する工程"
  pros_cons: "利点は agent や model family をまたぐ再利用性と反証保持。欠点は蒸留器の誤り、知識量増大、客観 benchmark から主観的な面白さ評価への外挿限界"
  verdict_pre: "部分採用。forum の形をそのまま増設せず、既存 atom と game task lens に evidence 型・反例・転用テストを導入する"
---

## raw_excerpt

抄録・本文からの採取メモ（長い原文引用は避け、日本語で内容を保持）: 著者らは、prompt、workflow、harness、agent code を更新する agent-centric な自己改善では、改善が特定の agent 設計や task 分布へ結び付き、維持や他モデルへの移植が難しくなると置く。代わりに、agent は毎回 fresh context で起動する汎用・一時的な worker のまま固定し、改善対象を共有 knowledge base だけに限定する。各 agent は task を一度試行し、結果だけでなく、検証した仮説、確認した制約、有効だった check、失敗した戦略を task-level forum に evidence 付き claim として残す。次に cross-task forum で、複数 task に再出現する原則、反例、failure mode を支持・反対・統合の stance とともに照合する。最後に distillation が、生き残った claim を transferable insights / confirmed constraints / rejected hypotheses / pitfalls / checks / next steps の型付き bundle へ圧縮し、次世代の fresh agent が実行前に読む。

評価対象は ARC-AGI-1/2、Polyglot、SWE-bench Pro、Terminal-Bench 2。50 task を用いた10 generation の過程で、agent 側を変えずに knowledge base だけを更新し、agent-centric baseline や prompt optimization と比較している。さらに、元の task 群と分離した難しい held-out task 20件へ generation 10 の bundle を凍結して渡し、recipient 側では forum や再 distillation を行わない zero-shot transfer を測る。Polyglot と ARC-AGI-1 の全 donor–recipient 組合せで no-knowledge 条件より solve rate が上がり、異なる LLM family 間でも正の transfer が報告された。task-conditioned adapter は共有 bundle から現在 task に直接関係する項目だけを短い memo にし、関連が弱い場合は無理に知識を当てはめない。

## why_relevant_to_games

複数のゲーム試作・headless 評価・cross-review から得た経験を、特定の agent や一回の制作 run ではなく、次の fresh な制作 agent が再利用できる evidence 付き設計知識へ変換する工程の参考になる。
