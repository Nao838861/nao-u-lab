---
title: "Zero-shot 3D Map Generation with LLM Agents: A Dual-Agent Architecture for Procedural Content Generation"
url: "https://arxiv.org/abs/2512.10501"
collected_at: "2026-06-06T11:59:30+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [pcg, llm-agent, level-design, tool-parameterization, evaluation]
evaluated_at: "2026-06-06T12:07:14+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-06T12:12:02+09:00"
last_decision: postponed
evidence: "duplicate_existing_shared_reads_post:https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780708885257199"
next_action: none
postpone_reason: "Phase 3 duplicate guard: arXiv:2512.10501 は 2026-06-06T10:21:25+09:00 に #shared-reads 投稿済みのため再投稿しない。"
stale_after: "2026-07-06"
supersedes: []
gate_reason: "自然言語の設計意図と PCG parameter の semantic gap という問題設定、Actor/Critic 分割、single-agent baseline との比較が揃っている。小規模 prototype の wave/level grammar 調整に転用しやすく、CoopEval 水準の概要へ展開できる。"
suggested_post_outline:
  overview_angle: "自然言語のレベル設計指示を、training-free な二役エージェントで構造的に妥当な PCG パラメータへ落とす手法として整理する。"
  analysis_axis: "Actor が生成し Critic が設計意図とのズレを検出して反復修正する構造、semantic gap の扱い、diversity と structural validity の評価を軸に見る。"
  application_target: "自分達の wave/level grammar、ステージ生成パラメータ、LLM による設計案から実行可能 diff へ落とす bridge に効く。"
  pros_cons: "利点は既存 PCG pipeline を自然言語で操作しやすくする点。懸念は評価対象が 3D map に寄っており、面白さやプレイフィールの評価は別途必要な点。"
  verdict_pre: "部分採用"
---

## raw_excerpt
arXiv:2512.10501。2025-12-11 submitted、2025-12-12 revised。対象は自然言語の設計指示を、3D map generation の厳密な procedural parameter に落とすための training-free LLM agent architecture。著者らは PCG pipeline が複雑で、操作には opaque technical parameters の正確な指定が必要になる一方、off-the-shelf LLM は抽象的なユーザー指示と strict parameter specifications の間の semantic gap を埋めにくい、という問題設定から始めている。提案は Actor agent と Critic agent を分け、Actor が parameter configuration を作り、Critic が design preference とのズレを見て反復的に refined configuration へ寄せる構成。評価対象は複数の 3D map 生成で、single-agent baseline より diverse かつ structurally valid な environment を生成した、と要約されている。

## why_relevant_to_games
自然言語の「こういうステージにしたい」を、生成器の数値パラメータへ落とす時の Actor/Critic 分離候補。小規模 prototype の wave/level grammar 自動調整にも転用できる可能性がある。
