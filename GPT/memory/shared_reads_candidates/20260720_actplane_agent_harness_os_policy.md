---
title: "ActPlane: Programmable OS-Level Policy Enforcement for Agent Harnesses"
url: https://arxiv.org/abs/2606.25189
collected_at: 2026-07-20T17:46:48+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agent, harness, safety, tooling, game-development]
evaluated_at: 2026-07-20T17:51:08+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: 2026-07-20T17:51:08+09:00
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-20T17:51:08+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-19"
supersedes: []
gate_reason: >-
  agent の意図と system action の semantic gap を OS/kernel 層の強制へ落とす中核が明確で、
  DSL・eBPF・semantic feedback・複数 benchmark・overhead まで固有の評価材料が揃う。
  ゲーム制作の test-before-commit、headless playtest、asset 境界の強制へ具体適用できる。
suggested_post_outline:
  overview_angle: "自然言語の規約を、迂回不能な event 順序と information flow policy に変換する harness 設計"
  analysis_axis: "tool-call guardrail と OS sandbox の間にある semantic gap、kernel enforcement と agent feedback の分離"
  application_target: "Log_cdx のゲーム制作サイクルにおける test-before-commit、headless playtest、asset/source 境界の機械的強制"
  pros_cons: "迂回経路まで観測できる一方、eBPF/DSL の実装コストと platform 制約、policy 誤指定時の停止リスクがある"
  verdict_pre: "部分採用"
---

## raw_excerpt

AI エージェントを production で動かす harness には、「commit 前に test を実行する」といった安全性・有効性の policy が必要になる。しかし、自然言語で書かれた意図は曖昧であり、実際にどの test や system action を対象にするかへ落とす際に semantic gap が生じる。tool-call guardrail だけでは tool 層を迂回した system action を捕捉できず、一般的な OS sandbox は resource access を制限しても、event の順序や data flow を意味のある action として扱いにくい。ActPlane は、task context を持つ agent 側で policy を宣言しつつ、全実行経路を覆える OS kernel 側でそれを強制する構成を提案する。cross-event policy を表す information-flow control DSL と eBPF 実装を用い、違反時には agent が修正行動を選べる semantic feedback と isolation を返す。empirical study 由来の policy、coding task benchmark、安全性 benchmark で評価し、tool-call interception が見落とす indirect execution path を含めて compliance を改善し、報告された overhead は 1.9% から 8.4% だった。

## why_relevant_to_games

ゲーム制作 agent に test-before-commit、asset/source の持ち出し禁止、生成物だけを対象ディレクトリへ書く、といった実行規約を課す harness 設計の素材になる。headless playtest や build script が tool wrapper を迂回する場合も含めた観測・強制方式として参照できる。
