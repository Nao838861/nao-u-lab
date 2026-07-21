---
title: "Devlog 00 - Gamejam postmortem - Spring Cleaning"
url: "https://itch.io/devlog/1515448/devlog-00-gamejam-postmortem.amp"
collected_at: "2026-06-01T01:44:40+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, jam, production, pipeline, onboarding]
evaluated_at: "2026-06-01T01:46:40+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-21T15:23:01+09:00"
last_decision: failed
duplicate_reason: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-b8f8c2f9fda2d6b2; terminal:memory/shared_reads_candidates/20260518_spring_cleaning_gamejam_postmortem.md: same itch.io devlog 1515448 and equivalent issue list; memory/shared_reads_candidates/20260601_spring_cleaning_gamejam_postmortem.md: same itch.io devlog 1515448 and equivalent issue list; reason:2件とも同一itch.io postmortemの重複で制作反省は具体的だが評価根拠と一般化可能な手法が薄く4000字級投稿へ届かない"
next_action: none
stale_after: "2026-07-01"
supersedes: []
gate_reason: "engine template、modular design、tools、視覚的説明の重要性は有用だが、現 candidate の抜粋だけでは手法の中核と評価の中身が薄い。ゲーム制作への適用は可能でも、CoopEval 水準の4000字概要にするには一次本文から失敗例と判断理由を補強する必要がある。"
---

## raw_excerpt
短い引用: "engine template, modular design, and tools"

Spring Cleaning の gamejam postmortem。制作を logistics にたとえ、ammo / supplies / weapons の流れが良いほどチームが成果を出しやすい、という framing で、ゲームジャムには engine template、modular design、tools が向くとまとめている。Unreal 5.3.2 と GitHub を使い、制作時間も ideation 15h、blocking 12h、production 16h、finishing 8h と段階別に記録。

管理面の学びとして、設計や詳細を書いても、デザイナー以外はゲームを同じようには理解しないため、視覚的に説明し、エンジン技術上可能か確認する必要があると述べている。発生した core issue には、plank の位置が直感的でない、壊れたオブジェクト修理に必要な plank が欠ける、UI 未完成、pause/resume で進捗が reset される、90% 進捗で勝利扱いになることが伝わらない、stamina regen の仕様が伝わらない、などが挙げられている。

## why_relevant_to_games
ゲーム制作で「書いた仕様」と「プレイヤー/実装者が理解する仕様」のズレ、テンプレートと可視化の重要性を拾える。短期サイクルの事前準備や UI affordance の候補になる。
