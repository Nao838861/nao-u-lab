---
title: "AI-Driven 3D Game Prototyping with Engine Integration"
url: "https://schedule.gdconf.com/session/ai-driven-3d-game-prototyping-with-engine-integration-presented-by-tencent-games-ai/917890"
collected_at: "2026-07-09T21:30:13+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [ai-game-development, prototyping, engine-integration, unreal-engine, test-driven-development]
evaluated_at: "2026-08-10T14:22:27+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-10T14:22:27+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-08-10T14:22:27+09:00"
next_action: keep_for_reference
stale_after: "2026-09-09"
supersedes: []
gate_reason: |-
  test-driven logic と token-friendly adapter は制作環境へ適用可能だが、材料は講演 agenda と補助記事の構成紹介だけである。
  実装詳細・比較評価・失敗例がなく、一か月の保留後も4000字級の分析を支えられないため参照用として閉じる。
---

## raw_excerpt
GDC 2026 の Tencent Games AI 講演。公式 agenda では、reasoning-based LLM などの AI 技術により、3D game development の key processes に AI-driven workflow を入れられるようになり、simple requirements から game prototypes、core logic code、UI elements、3D scenes を game engine 上で生成する full development workflow を示す、と説明されている。Takeaway は、logic と presentation を分けて AI を深く関与させる 3D prototype workflow、AI generated logic code の信頼性を test-driven development で保証すること、UI design / code generation / game logic synchronization、AI に 3D space を理解させて simple levels と scene interactions の作成に参加させること。

補助情報として、ゲーム葡萄 / Sohu の講演整理記事は、Web 2D prototype から Unreal などの engine 内 3D prototype へ移す課題を扱い、AI に GUI-first な engine editor を直接見せるのではなく token-friendly な code/API 層を使わせる方針を紹介している。記事内では C.A.T. principle として Code Reuse、Adapter Design、Token-friendly が挙げられ、Web 端と engine 端で共有できる code を増やし、差分は adapter で吸収し、Blueprint のような pixel wall ではなく code-driven engine function call に寄せる構成が説明されている。

## why_relevant_to_games
Nao_u_BOT の prototype 制作で、ブラウザ上の playable diff から engine / 3D / 本番寄り asset pipeline へ移す時の候補。Phase 2 では、test-driven logic と token-friendly adapter 設計が自前 harness にどう落ちるかだけを見る。
