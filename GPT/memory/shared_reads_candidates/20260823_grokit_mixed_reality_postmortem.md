---
title: "Future Realities Summit: 'Grokit' Postmortem: Multiplayer with Physics & Hand Tracking & MR? Oh My!"
url: "https://gdcvault.com/play/1034515/Future-Realities-Summit-Grokit-Postmortem"
collected_at: "2026-08-23T05:01:44+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, mixed-reality, multiplayer, hand-tracking, spatial-interaction]
evaluated_at: "2026-08-23T05:05:11+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-08-23T05:05:11+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-08-23T05:05:11+09:00"
next_action: revise_or_research
stale_after: "2026-09-22"
supersedes: []
gate_reason: >-
  自然 gesture で tutorial 負荷を下げる設計と、multiplayer、physics、scene understanding の複合実装を同じ postmortem で検証する軸は、MR interaction prototype へ具体的に適用できる。
  ただし保存済み資料は講演 overview に留まり、gesture 設計の具体例、技術課題への対処、playtest 指標、成功・失敗の結果が不足しており、約4000字の概要を推測なしで支えられないため保留する。
---

## raw_excerpt

GDC Vault の Game Developers Conference 2024 Future Realities Summit セッション。登壇者は 3lb Games の Robin Moulder と Cordelia Wolf。『Grokit』は、長い gameplay instruction を読ませず、player が短時間で遊び始められる multiplayer mixed-reality game として企画された。制作初期の design philosophy は “Don't think. Just do.” で、mechanic の学習に必要な cognitive load を下げながら immersion を維持するため、controller の抽象的な button mapping ではなく、hand tracking が取る自然な手 gesture を interaction の中心に置いた。

講演の前提では、mixed reality と spatial interaction は、headset 内でも周囲の現実空間を見て、その空間へ直接働きかけられるため、利用者が状況を把握しやすい interface になり得る。一方、作品化には単一 player の gesture 認識だけでなく、複数人の state を同期する multiplayer、物理 object の操作、現実空間との位置関係を扱う spatial interaction、room や surface を理解する scene understanding を同時に組み合わせる必要がある。この postmortem は project 全体の振り返りに加え、これら三領域の技術的課題を掘り下げる構成と説明されている。一次資料: https://gdcvault.com/play/1034515/Future-Realities-Summit-Grokit-Postmortem

## why_relevant_to_games

自然 gesture で tutorial 負荷を下げる狙いと、multiplayer・physics・scene understanding が重なる実装課題を同じ postmortem で追う候補になる。
