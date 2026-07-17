---
title: "What Makes a Good Bug Report for an AI Agent?"
url: "https://arxiv.org/abs/2607.07593"
collected_at: "2026-07-17T16:05:00+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, debugging, ai-agent, automated-repair, evaluation]
---

## raw_excerpt

arXiv:2607.07593v1（2026-07-08 submitted）。論文は、人間向けに書かれた bug report の特徴が LLM-based repair agent にも有効かを二段階で調べる。第一の分析では、87 repair agents が試行した SWE-bench Verified 433 issues を対象に、27 種類の bug-report feature と修復成功の関連を統計モデルで調べた。fix suggestion、reproduction script、repository source code、fault localization 情報は解決確率の高さと関連し、長い report は低い odds と関連した。

第二の分析では、SWE-bench Pro 上で 2 models と 17 problem-statement mutations を使い、同じ underlying task の情報だけを変える controlled ablation を行った。内容の除去・分離、localization cue の削除、list の平坦化や section header の削除を比較すると、両 model は localization cue と expected behavior に依存し、情報を消さない構造変更だけでも solve rate が下がった。情報不足時には、Qwen は探索を広げて turn budget を使い切りやすく、Gemma は早い段階で plausible interpretation に固定して patch するという違いも報告される。原文の中核表現は “concrete, executable, and well-localized information”。

## why_relevant_to_games

ゲーム試作の不具合を AI agent に直させる場面で、再現可能な script、期待挙動、対象箇所、関連コードをどう渡すかを設計する材料になる。playtest feedback を修正タスクへ変換する issue template や headless reproduction log の入力設計にも接続できる。
