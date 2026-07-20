---
title: "ActPlane: Programmable OS-Level Policy Enforcement for Agent Harnesses"
url: https://arxiv.org/abs/2606.25189
collected_at: 2026-07-20T17:46:48+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agent, harness, safety, tooling, game-development]
---

## raw_excerpt

AI エージェントを production で動かす harness には、「commit 前に test を実行する」といった安全性・有効性の policy が必要になる。しかし、自然言語で書かれた意図は曖昧であり、実際にどの test や system action を対象にするかへ落とす際に semantic gap が生じる。tool-call guardrail だけでは tool 層を迂回した system action を捕捉できず、一般的な OS sandbox は resource access を制限しても、event の順序や data flow を意味のある action として扱いにくい。ActPlane は、task context を持つ agent 側で policy を宣言しつつ、全実行経路を覆える OS kernel 側でそれを強制する構成を提案する。cross-event policy を表す information-flow control DSL と eBPF 実装を用い、違反時には agent が修正行動を選べる semantic feedback と isolation を返す。empirical study 由来の policy、coding task benchmark、安全性 benchmark で評価し、tool-call interception が見落とす indirect execution path を含めて compliance を改善し、報告された overhead は 1.9% から 8.4% だった。

## why_relevant_to_games

ゲーム制作 agent に test-before-commit、asset/source の持ち出し禁止、生成物だけを対象ディレクトリへ書く、といった実行規約を課す harness 設計の素材になる。headless playtest や build script が tool wrapper を迂回する場合も含めた観測・強制方式として参照できる。
