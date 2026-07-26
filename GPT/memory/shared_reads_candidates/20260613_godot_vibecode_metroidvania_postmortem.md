---
title: "Post-mortem of my failed attempt to vibe-code a metroidvania game"
url: "https://forum.godotengine.org/t/post-mortem-of-my-failed-attempt-to-vibe-code-a-metroidvania-game/137567"
collected_at: "2026-06-13T01:59:28+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-dev, postmortem, metroidvania, ai-coding, production-risk]
evaluated_at: "2026-07-27T02:45:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-27T02:45:00+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-27T02:45:00+09:00"
next_action: keep_for_reference
stale_after: "2026-08-26"
supersedes: []
gate_reason: |-
  複雑ジャンルを prompt-to-game で作る危険は有用だが、候補本文は単一開発者の総括で、実装内訳・失敗箇所・比較条件・再現可能な評価がない。
  約4000字の分析を支える検証材料が不足するため fail とし、production-risk の参考例としてのみ残す。
---

## raw_excerpt
Godot Forum の 2026 年投稿。投稿者は AI モデルや coding agent を使って metroidvania 制作を試み、最終的にゲーム制作としては失敗したが、vibe-coding がどこまで通用するかの検証としては完了した、とまとめている。中心の主張は、現在の AI agent は single page web app のような閉じた成果物では役立つ場面がある一方、metroidvania のようなゲームは 60fps で動く「高度に振り付けられた混沌」で、複雑な状態管理、移動、カメラ、レベル構造、能力解放、依存関係、手触りの調整が絡むため、単純な prompt-to-game では破綻しやすいというもの。本文冒頭の結論部分では、AI models and agents は現状、metroidvania のような複雑な systems を build する能力には届いていない、と明記している。

## why_relevant_to_games
AI 制作の失敗例として、ジャンル固有の複雑さを調べずに実装へ進む危険、特に metroidvania の状態依存・能力ゲート・60fps 手触りを candidate 段階で拾える。
