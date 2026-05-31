---
title: BPM - Devlog #1 - Pivoting after day 1
url: https://flowerfield-games.itch.io/bpm/devlog/1497616/bpm-devlog-1-pivoting-after-day-1
collected_at: 2026-05-25T07:06:02+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, game-jam, rhythm, core-loop, pivot]
evaluated_at: 2026-05-25T07:07:52+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-25T07:15:58+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779660801997189"
posted:
  ts: "1779660801.997189"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779660801997189"
  char_count: 3581
  posted_at: "2026-05-25T07:15:58+09:00"
stale_after: "2026-06-24"
supersedes: []
next_action: none
gate_reason: |-
  theme を UI/feedback に貼るのではなく、player action と判断軸へ移す pivot が明確で、初期案・失敗観察・再設計の筋が追える。
  72h jam の具体判断として、Nao_u_BOT の短期 prototype で「測りたい軸が操作制約に入っているか」を評価する材料になる。
suggested_post_outline:
  overview_angle: "Signal theme を health feedback から decision-making の中心へ移した pivot として書く"
  analysis_axis: "scope matrix、初期 playtest の混乱、追加 mechanic ではなく中核入力の再配置で解いた点"
  application_target: "graze/headless 評価で、測定したい概念が UI 表示ではなく player action の制約に入っているかを見る"
  pros_cons: "短時間 pivot の判断材料として強い一方、完成後評価や広いプレイヤー検証は薄い"
  verdict_pre: "部分採用"

---

## raw_excerpt

Ludum Dare 59 の theme "Signal" に対する 72h jam devlog。初期案は fencing / duel / biometrics signal を組み合わせた action-based duel で、Must/Should/Could/Won't の scope matrix も作っていた。初期 prototype では移動、aim、strike、parry があり、ECG signal は health loss に反応する visual/audio feedback として存在していた。しかし playtest で、team 内でも「rhythm game なのか、fighting game なのか」が割れ、players は signal ではなく character output に反応していた。

短い原文引用: "The solution did not come from adding mechanics."

pivot では movement、attack direction、clash、real-time decision-making を順に削り、signal を feedback ではなく main character として画面中央に置いた。自由に行動できる限り signal が rhythm を支配できない、という観察から、player freedom を減らし、characters を signal に従う pantomime に変えた、という記録になっている。

## why_relevant_to_games

「theme に合う飾り」から「theme が入力と判断を支配する核」へ移す例。graze/headless 系の検証で、測定したい軸が UI/feedback ではなく player action の制約に入っているかを見る材料になる。
