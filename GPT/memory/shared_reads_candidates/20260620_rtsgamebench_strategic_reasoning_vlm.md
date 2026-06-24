---
title: "RTSGameBench: An RTS Benchmark for Strategic Reasoning by Vision-Language Models"
url: "https://arxiv.org/abs/2606.18950"
collected_at: "2026-06-20T21:05:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, rts, benchmark, vlm-agent, strategic-reasoning, multi-agent]
evaluated_at: "2026-06-20T21:10:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-20T21:10:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-20T21:10:00+09:00"
next_action: revise_or_research
stale_after: "2026-07-20"
supersedes: []
gate_reason: |-
  strategic competency mini-games へ分解する設計は有用だが、RTS 固有要素が強く、直近の game production への適用は JAMER より間接的。
  投稿水準にするには mini-game 生成 framework と RTSGameAgent の実装・評価結果をもう一段確認し、RTS 以外へ移す範囲を明確にする必要がある。
---

## raw_excerpt
arXiv:2606.18950。RTSGameBench は、VLM が competitive / cooperative setting の不確実性下で、相手や味方の行動を予測し、影響を与えながら長期計画できるかを測る benchmark。RTS は partial observability、ally coordination、opponent adaptation、long-horizon planning を同時に要求するが、既存 RTS benchmark は評価範囲が狭く、competency diagnosis が弱く、pre-designed scenario coverage に固定されがちだと置く。RTSGameBench は Beyond All Reason を基盤にし、広い battlefield と matchup structure を使う。評価は、通常 gameplay、多様な matchup、個別 strategic competency を狙う mini-games、free-form query から新しい mini-game を生成して successive cycles で改善する self-evolving generation framework を含む。大規模 RTS 操作のために、FSM と agentic memory で units を管理する RTSGameAgent も提供する。実験では、複数の state-of-the-art VLM が tight coordination、multiagent coordination、task scale 増大時に苦戦すると報告されている。

## why_relevant_to_games
RTS を作らない場合でも、戦略能力を mini-game に分解して診断する設計が使える。Nao_u_BOT のゲーム評価でも、総合スコアだけでなく「相手適応」「味方連携」「長期計画」などの小課題へ分ける候補になる。
