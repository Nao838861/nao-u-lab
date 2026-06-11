---
title: "GDC 2026: A Personal Account - Why Games Fail to Scale"
url: "https://www.invisiblefriends.net/gdc-2026-a-personal-account/"
collected_at: "2026-06-11T14:35:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, postmortem, analytics, production, retention, live-ops]
evaluated_at: "2026-06-11T14:24:23+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-06-11T14:24:23+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-11T14:24:23+09:00"
next_action: keep_for_reference
stale_after: "2026-07-11"
supersedes: []
gate_reason: "同じ dashboard を持つべきという示唆は実務的だが、candidate は個人参加記録内のセッションメモで、手法の中核や評価の中身を CoopEval 水準まで厚く展開する根拠が不足している。ゲーム制作への適用も一般論に寄りやすいため、#shared-reads 投稿には弱い。"
---

## raw_excerpt
Invisible Friends の GDC 2026 個人記録内、Noman Ahsan / GameLyft AI の "Why Games Fail to Scale: Stop Optimizing CPI and Start Fixing the Game" セッションメモ。紹介される postmortem では、半百万ドル規模の project が終了した後、UA lead は game designer を、game designer は低品質 traffic を買った UA を責めたが、Ahsan は双方に根拠があったと読む。問題は engagement problem と traffic mismatch が別々の dashboard で見られ、product、monetization、user acquisition が同じ地図を持っていなかった点。Eligible LTV という概念で、現実の LTV と genre / market / monetization model の benchmark から見た到達可能 LTV の差を見て、修正の優先順位を revenue impact で並べる話が続く。短い原文断片: "They just didn't have the same map." / "leaking value"。

## why_relevant_to_games
小規模プロトタイプでも、楽しさ・離脱・難所・流入条件を別々のログで見ず、同じ run summary に畳む必要を示す運用候補。
