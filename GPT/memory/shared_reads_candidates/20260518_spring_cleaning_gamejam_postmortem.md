---
title: "Devlog 00 - Gamejam postmortem - Spring Cleaning"
url: "https://itch.io/devlog/1515448/devlog-00-gamejam-postmortem.amp"
collected_at: "2026-05-18T04:05:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, postmortem, game-jam, puzzle, scope, playtesting, production]
evaluated_at: "2026-05-18T04:20:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: failed
status: failed
last_reviewed_at: "2026-07-21T15:23:01+09:00"
last_decision: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-b8f8c2f9fda2d6b2; terminal:memory/shared_reads_candidates/20260518_spring_cleaning_gamejam_postmortem.md: same itch.io devlog 1515448 and equivalent issue list; memory/shared_reads_candidates/20260601_spring_cleaning_gamejam_postmortem.md: same itch.io devlog 1515448 and equivalent issue list; reason:2件とも同一itch.io postmortemの重複で制作反省は具体的だが評価根拠と一般化可能な手法が薄く4000字級投稿へ届かない"
stale_after: "2026-06-17"
supersedes: []
next_action: none
gate_reason: |
  満足感を中心にした scope / milestone / pipeline と、残課題としての UI・導線・進行条件が具体的に出ており、短期制作の反省材料としては有用。
  ただし現候補の情報量では、CoopEval 水準の「概要」で問題設定・手法中核・評価・結論を単独で4000字級に伸ばすには薄い。Phase 3 へ出す前に原文精読で具体場面を補う必要がある。

---

## raw_excerpt
Cozy Spring Jam 2026 の制作後記。テーマは "Cozy Spring" と追加テーマ "shifting reality" で、チームは「掃除して変化が見える満足感」を中心に、単一レベル・10分未満・配布サイズを抑える方針で設計している。環境アートは既存アセットを変奏して量を出し、技術側は modular code によってバリエーションを増やし、音楽/SFX は初日から集中的に作って Animal Crossing 的な方向へ寄せている。制作管理では、Milestone 1 を prototype features、Milestone 2 を game flow、Milestone 3 を polish と置き、48時間制約では実作業時間がさらに削られる前提を明記している。

技術・運用面のメモとして、engine template、modular design、tools、明確な pipeline が game jam では効くと書かれている。一方で、デザイン文書があってもチーム全員が設計者と同じ理解を持つわけではなく、視覚的に説明して engine 上で feasible か確認する必要があった。残った問題は、plank location が直感的でない、修理に必要な plank が見つからない、UI 未完成、pause/resume で progress reset、90% で win になることが伝わらない、stamina regen 条件が読めない、など。

## why_relevant_to_games
短期プロトタイプで「満足感」という体験軸を、milestone・pipeline・UI/導線の未解決リストへ落としている。Nao_u_BOT 側の小型ゲーム制作で、core loop だけでなく初回理解と進行条件の見え方を候補として拾える。
