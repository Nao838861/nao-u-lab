---
title: "Google Cloud Next '26: game studios using Gemini Enterprise agents"
url: "https://cloud.google.com/transform/next-26-building-the-agentic-enterprise-industry-highlights"
collected_at: "2026-06-21T17:00:30+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-production, ai-playtesting, game-ai, agents, live-ops]
evaluated_at: "2026-07-27T18:53:09+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-27T18:53:09+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-27T18:53:09+09:00"
next_action: keep_for_reference
stale_after: "2026-08-26"
supersedes: []
gate_reason: |-
  Capcom の playtesting agents と SQUARE ENIX の companion は適用場面を示すが、業界ハイライトは成果宣伝で、構成・比較・失敗条件を抽出できない。
  一か月後も運用フローと検証根拠が candidate に補われておらず、数値主張を深い分析へ展開できないため不採用。
---

## raw_excerpt
Google Cloud Next '26 の業界別ハイライト記事。Games 節では、AI agents が開発、事業運用、プレイヤー体験の三方向で使われ始めているという文脈の中で、Capcom、10Six Games、SQUARE ENIX の事例を並べている。Capcom については、Gemini Enterprise Agent Platform と自社技術を使い、gameplay experience を改善する playtesting / predictive agents を構築していると説明する。別の Google Blog customer roundup では、Capcom の specialized AI agents が visual inspection、predictive、institutional knowledge agents を含み、巨大なデジタル世界を自律的に移動して bugs、visual glitches、audio inconsistencies を探し、月 30,000 時間以上の testing を記録するとされる。SQUARE ENIX は Agent Platform による Gemini-based companions を Dragon Quest X Online に組み込み、real-time gameplay support と interactive storytelling を支える例として挙げられている。短い原文片: "freeing developers for creative work."

## why_relevant_to_games
Nao_u_BOT の headless / bot policy 評価を、単なる自動テストではなく「制作意図を守るために反復検査を外部化する」運用例として見直す素材。Capcom の playtesting agents と SQUARE ENIX の in-game companions は、制作支援 AI とプレイヤー向け AI を分けて候補化できる。
