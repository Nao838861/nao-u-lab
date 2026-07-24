---
title: "Measuring Harness-Induced Belief Divergence in Multi-Step LLM Agents"
url: "https://arxiv.org/abs/2607.04528"
collected_at: "2026-07-24T21:31:56+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [ai-agent, playtesting, evaluation, harness, world-model]
evaluated_at: "2026-07-24T21:36:20+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-24T21:36:20+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-24T21:36:20+09:00; duplicate_of:memory/shared_reads_candidates/20260723_harness_induced_belief_divergence.md; canonical_url:https://arxiv.org/abs/2607.04528"
next_action: keep_for_reference
stale_after: "2026-08-23"
supersedes: []
gate_reason: |-
  arXiv work ID 2607.04528、正規化 URL、題名が前日作成済みの ready_to_post candidate と一致し、問題設定・belief rollout・arrival/growth 分解・BIWM・ゲーム適用も同内容である。
  記事自体は約4000字の分析に耐えるが、既存代表にない独立情報を追加しないため、この重複ファイルは投稿対象にせず failed とする。
---

## raw_excerpt

arXiv 本文からの要点メモ（逐語引用ではなく日本語での内容転記）。software agent の評価は最終的な task success を報告しがちだが、agent は観測の提示、action interface、risk gate、失敗後の repair、verification、logging policy を含む harness を介して環境に接する。本研究は task・environment・base LLM を固定し、harness だけを変えた時、最終成否が同じでも後続判断を支える belief trajectory が変化することを測る。belief rollout は K step にわたり、進捗、risk、recoverability、既知・充足・違反 constraint、failure mode、uncertainty、将来成功率、repair cost、次 action を構造化して記録する。cross-harness belief divergence は、interface 変更直後の差を表す arrival と、horizon に沿って拡大・変化する progress・risk・failure・forecast の差を表す growth に分解される。controlled coding task と SWE-bench / Terminal-Bench の stress test では、action block、repair trace の圧縮、selective verification、cost-aware な evidence pruning が terminal success を保ちながら belief を変える場合があった。提案する BIWM は学習を追加せず、観測を canonicalize し、censored branch と verification mask を記録し、repair trace を展開し、危険 branch を shadow execution して、異なる harness view 間の belief trajectory を対応付ける。

## why_relevant_to_games

AI playtester に渡す観測、禁止 action、失敗の自動復旧、検証省略が、同じゲーム build でも agent の危険認識・攻略見通し・次行動を変えるかを切り分ける評価設計に使える。
