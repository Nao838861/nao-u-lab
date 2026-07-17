---
title: "What Makes a Good Bug Report for an AI Agent?"
url: "https://arxiv.org/abs/2607.07593"
collected_at: "2026-07-17T16:05:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, debugging, ai-agent, automated-repair, evaluation]
evaluated_at: "2026-07-17T17:16:22+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-17T17:16:22+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-17T17:16:22+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-16"
supersedes: []
gate_reason: >-
  87 agents・433 issues の観察分析と 2 models・17 mutations の controlled ablation が補完し合い、
  有効な bug report の情報要素、構造変化への頑健性、model 間の失敗差まで説明できる。ゲーム試作では
  playtest feedback を再現可能な修正入力へ変換する具体策に直結し、約4000字の独立した分析を支えられる。
suggested_post_outline:
  overview_angle: "AI repair agent の成否を左右する bug report を、観察相関と controlled ablation の二段階で分解する"
  analysis_axis: "実行可能性・局所化・期待挙動の各情報が solve rate と探索行動へ与える効果、および model ごとの失敗様式"
  application_target: "ゲーム試作の playtest feedback、headless reproduction log、修正 issue template を AI agent 向け入力へ変換する工程"
  pros_cons: "再現手順と局所化 cue を標準化できる一方、過剰な局所化は探索を狭め、model ごとの情報不足時の挙動差も残る"
  verdict_pre: "部分採用"
---

## raw_excerpt

arXiv:2607.07593v1（2026-07-08 submitted）。論文は、人間向けに書かれた bug report の特徴が LLM-based repair agent にも有効かを二段階で調べる。第一の分析では、87 repair agents が試行した SWE-bench Verified 433 issues を対象に、27 種類の bug-report feature と修復成功の関連を統計モデルで調べた。fix suggestion、reproduction script、repository source code、fault localization 情報は解決確率の高さと関連し、長い report は低い odds と関連した。

第二の分析では、SWE-bench Pro 上で 2 models と 17 problem-statement mutations を使い、同じ underlying task の情報だけを変える controlled ablation を行った。内容の除去・分離、localization cue の削除、list の平坦化や section header の削除を比較すると、両 model は localization cue と expected behavior に依存し、情報を消さない構造変更だけでも solve rate が下がった。情報不足時には、Qwen は探索を広げて turn budget を使い切りやすく、Gemma は早い段階で plausible interpretation に固定して patch するという違いも報告される。原文の中核表現は “concrete, executable, and well-localized information”。

## why_relevant_to_games

ゲーム試作の不具合を AI agent に直させる場面で、再現可能な script、期待挙動、対象箇所、関連コードをどう渡すかを設計する材料になる。playtest feedback を修正タスクへ変換する issue template や headless reproduction log の入力設計にも接続できる。
