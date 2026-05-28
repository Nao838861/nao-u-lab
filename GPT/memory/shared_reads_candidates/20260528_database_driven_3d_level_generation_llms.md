---
title: "A Database-Driven Framework for 3D Level Generation with LLMs"
url: "https://arxiv.org/abs/2508.18533"
collected_at: "2026-05-28T19:29:46+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, procedural-generation, llm, level-design, 3d]
evaluated_at: "2026-05-28T19:32:31+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
posted:
  ts: "1779964542.217749"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779964542217749"
  char_count: 4177
  posted_at: "2026-05-28T20:15:42+09:00"
stale_after: "2026-06-27"
supersedes: []
gate_reason: |
  問題設定、database-driven という中核発想、Room / Facility / Mechanics Database、constraint optimization、two-phase repair まで候補本文から抽出できる。
  LLM を runtime generator ではなく reusable design database 構築補助へ寄せる点が、Nao_u 側の level template / progression rule 分離に具体的に効く。
suggested_post_outline:
  overview_angle: "3D level を LLM に即興生成させるのではなく、再利用可能な room / facility / mechanics database と制約解決に分ける資料として書く。"
  analysis_axis: "3D level PCG の難所、offline database 構築、global structure / room layout / mechanic placement、repair による navigability 保証。"
  application_target: "小規模ゲームのステージ部品、敵配置、進行テンポを data layer と generation rule に分け、LLM は候補部品の増幅とタグ付けに使う。"
  pros_cons: "長所は制御性・再利用性・検証可能性、短所は database 品質依存、3D 論文から 2D/小規模プロトタイプへ落とす時の抽象化コスト。"
  verdict_pre: "部分採用。runtime 自動生成ではなく、制作前の部屋・ギミック・テンポ語彙の整備に使う。"
---

## raw_excerpt
arXiv:2508.18533。Kaijie Xu と Clark Verbrugge による 2025-08-25 submitted の論文。対象は 3D game level generation。要旨では、3D level PCG の難しさを spatial coherence、navigational functionality、adaptable gameplay progression の同時成立として置き、LLM を直接ランタイム生成器にするのではなく、offline で reusable databases を構築する補助に使う。

中心になる database は Room Database、Facility Database、Mechanics Database。pipeline は multi-floor global structure を room instance で作り、各 room 内の facility layout を constraint で最適化し、topological / spatial rules に沿って gameplay mechanic elements を置く。さらに two-phase repair system で navigability を確保する、と説明されている。

要旨上の主張は、modular database-driven design と constraint-based optimization を組み合わせることで、level structure と gameplay pacing を parameterization で制御できる、というもの。

## why_relevant_to_games
LLM を「その場で全部作る」役ではなく、部屋・施設・メカニクスの再利用可能 database を作る役に寄せる候補。3D でなくても、Nao_u 側の小規模ゲームで level template と progression rule を分ける設計材料になる。
