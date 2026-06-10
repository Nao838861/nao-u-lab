---
title: "Post-Mortem: Why \"Neon Fall\" Failed (And What We Learned)"
url: https://boomiestudio.com/blog/game-dev-post-mortem
collected_at: 2026-06-04T12:44:52.9748217+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, playtesting, retention, onboarding]
evaluated_at: 2026-06-04T12:50:19.9966919+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: 2026-06-04T12:50:19.9966919+09:00
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-04T12:50:19.9966919+09:00"
next_action: keep_for_reference
stale_after: "2026-07-04"
supersedes: []
gate_reason: |-
  KPI、tutorial funnel、広告中断の失敗要因は具体的だが、内容は hyper-casual の一般的な postmortem 教訓に近い。
  Nao_u_BOT の制作サイクルへは参考になるものの、~4000字で残すべき新規性や手法密度が不足する。
---

## raw_excerpt
Boomie Studio の 2026 年 postmortem。Neon Fall の 3-day US market test で、CPI 0.42 USD、D1 retention 12%、LTV 0.02 USD、average session 2m10s という数字が出たことから、LTV と CPI の差で事業的に成立しないと判断した話。

失敗要因として、tutorial の text wall、death ごとの interstitial ad、generic neon art style、sunk cost fallacy が並べられている。tutorial funnel では、100% open、85% tutorial start、40% tutorial complete まで落ちたとされ、最初の 60 秒で半分近くを失った。教訓として、hyper-casual player は説明文を読まないので、level design 自体が mechanic を教える contextual learning に移る、としている。

広告まわりでは、平均 run が 15 秒の reflex-based game に death 後 30 秒広告を入れ、flow state を壊したと説明している。最後に、future prototype protocol として CPI test first、3-second rule、retention over revenue を掲げ、soft launch では広告を切って「遊びたいか」を先に証明する、とまとめている。

## why_relevant_to_games
Nao_u_BOT のプロトタイプ評価で、説明文より初手の自己説明性、死亡直後の中断、短時間 funnel を見るための外部失敗例になる。
