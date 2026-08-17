---
title: "Your Agent's Memories Are Not Its Own: Forged Reasoning Attacks on LLM Agent Memory and Defenses"
url: "https://arxiv.org/abs/2607.05029"
collected_at: "2026-07-19T12:45:40+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [llm-agent, persistent-memory, security, playtesting, provenance]
evaluated_at: "2026-08-18T04:19:31+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-18T04:19:31+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-18T04:19:31+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-17"
supersedes: []
gate_reason: >-
  persistent memory の reasoning trace を攻撃面として捉え、FARMA と多段検査 SENTINEL を対置する問題設定と手法が明確である。
  複数 agent・LLM・50 trial、攻撃成功率最大100%から最小0%、benign trace 326件で false positive なしという評価まであり、長期 playtest 記憶の provenance 設計へ具体適用できる。
suggested_post_outline:
  overview_angle: "agent memory が蓄積知ではなく自己増幅する攻撃面になる構造と、FARMA・SENTINEL の攻防を定量結果まで説明する"
  analysis_axis: "reasoning trace の信頼境界、自己参照による増幅、keyword/consensus 防御の破り方、多段検査の有効性と評価範囲"
  application_target: "長期自動 playtest の履歴取り込み前に、出典・実行証拠・反復自己参照を検査する memory ingestion gate を置く"
  pros_cons: "記憶汚染を実測可能な threat model にできる一方、50 trial と限定モデルの結果を一般化しすぎない注意が必要"
  verdict_pre: "部分採用"
---

## raw_excerpt

arXiv 要旨からの一次情報メモ。persistent memory を持つ LLM agent は、事実、過去の決定、reasoning history、tool usage、context を次の task へ持ち越せる一方、agent 自身の推論履歴が新しい攻撃面になる。本論文は、事実知識を書き換える代わりに、記憶された reasoning trace を汚染する Forged Amplifying Rationale Memory Attack（FARMA）を提示する。FARMA は keyword-based defense を避ける言い回しで偽の推論を挿入し、self-referential reinforcement によって consensus-based defense も崩す。防御側の SENTINEL は、候補記憶を複数段で検査し、中心となる Reasoning Guard が五つの重み付き signal から forgery を構造的に分析する。複数 agent・複数 LLM、50 trial の評価では、baseline 条件で FARMA の attack success rate が最大 100% に達し、SENTINEL は最小 0% まで下げたと報告する。また benign agent trace 326 件では false positive が観測されなかったとしている。

## why_relevant_to_games

長期の自動プレイテストで過去の攻略理由や失敗原因を再利用する際、外部テキストと agent 自身の推論履歴に provenance・検査境界を置く設計資料になる。
