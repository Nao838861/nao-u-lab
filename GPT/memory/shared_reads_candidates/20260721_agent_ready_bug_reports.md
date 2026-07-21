---
title: "Writing Bug Reports for Software Repair Agents: What Information Matters Most?"
url: "https://arxiv.org/abs/2607.09553"
collected_at: "2026-07-21T20:31:32+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [software-engineering, ai-agent, bug-report, game-development, debugging, evaluation]
evaluated_at: "2026-07-21T20:37:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-21T20:37:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-21T20:37:00+09:00"
next_action: revise_or_research
stale_after: "2026-08-20"
supersedes: []
gate_reason: >-
  441件・3モデル・回帰分析と ablation という問題設定と評価枠組み、code localization と
  suggested fix が有効という中核、game prototype の agent 向け不具合票への適用先は明確。
  ただし現 candidate には係数・効果量、ablation 条件、モデル間差、限界がなく、~4000字の概要を検証可能な密度で書くには一次資料の補強が必要。
---

## raw_excerpt

原文の要点を日本語で採録する。agentic-first な開発では issue report が人間向けの記録だけでなく、repair agent に渡す主な task specification になるが、どの情報を含めると正しい修正へ到達しやすいかは十分に分かっていない。研究は SWE-bench Verified の実 repository issue 500件から、bug report に当たる441件を対象にした。各 issue を変更種別で分類し、文ごとに observed behavior、expected behavior、reproduction steps、localization cue、suggested fix などの情報型を付与した。

評価では mini-swe-agent を GPT-5-mini、MiniMax M2.5、Gemini 3 Flash の3種類の backbone で実行し、交絡要因を統制した binomial regression で各情報型と修正成功の関連を推定した。結果として、agent に最も効くのは探索・修正空間を狭める情報だった。影響を受けた code area を示す localization cue は成功と正に関連し、自然言語または code で示す suggested fix は pass probability と特に強い関連を持った。情報型を除去する ablation でも、伝統的に人間へ有用とされる reproduction steps より、bug の場所や修正方向を露出する文の方が agent の成功に寄与したと報告している。

## why_relevant_to_games

game prototype の不具合を coding agent へ渡す際、画面上の症状や再現手順に加えて、疑わしい state・system・code area と修正仮説を残す bug-report 形式を検討する資料になる。
