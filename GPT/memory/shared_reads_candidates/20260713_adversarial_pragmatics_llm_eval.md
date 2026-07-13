---
title: "Adversarial Pragmatics for AI Safety Evaluation: A Benchmark for Instruction Conflict, Embedded Commands, and Policy Ambiguity"
url: "https://arxiv.org/abs/2607.01153v1"
collected_at: "2026-07-13T21:35:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [llm-agent, evaluation, game-testing, instruction-conflict, benchmark]
evaluated_at: "2026-07-13T21:30:55+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-13T21:30:55+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-13T21:30:55+09:00"
next_action: keep_for_reference
stale_after: "2026-08-12"
supersedes: []
gate_reason: >-
  指示衝突を task success・policy compliance・judge validity へ分解する着想は明確だが、18項目・54行の seed pilot が中心で、比較評価や結論の実証的な厚みが不足する。
  ゲーム制作への適用も LLM tester の失敗ログ分類という間接転用に留まり、約4000字の概要をゲーム固有の具体性を保って構成すると一般論で水増しされるため不通過とする。
---

## raw_excerpt

言語モデルの安全性評価では、「指示に従ったか」「適切に拒否したか」「方針を守ったか」「埋め込まれた命令に抵抗したか」「agent task の進捗を誤報したか」といった、曖昧な自然言語上の行動判断が増えている。既存 benchmark はこれらを pass/fail に圧縮しがちで、失敗原因が能力不足、policy の曖昧さ、指示衝突、scaffold の不具合、judge の不安定さのどれなのかを見えにくくする。

本稿は、instruction conflict、embedded commands、quotation、scope ambiguity、deixis、indirect speech acts、multi-turn agent transcripts を対象にした「adversarial pragmatics」の benchmark / annotation protocol を提示する。構成要素は、言語学的に統制された taxonomy、validator が metadata を検査する18項目の seed benchmark、54行の local seed pilot、task success・policy compliance・safety risk・refusal outcome・evaluator confidence を分離する expert evaluation protocol、judge validity・diagnostic ambiguity・taxonomy drift の指標である。著者は、この枠組みを LLM judge、gold set、prompt-injection test、安全性文書の検証に利用できるとしている。

## why_relevant_to_games

LLM player / tester が複数のゲーム内指示や会話を扱う際、単一の成功率ではなく「プレイ能力」「ルール遵守」「指示解釈」「評価器の不安定さ」を分けて失敗ログを設計する材料になる。
