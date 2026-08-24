---
title: "1.2 Update + Postmortem"
url: "https://itch.io/devlog/1630954/12-update-postmortem.amp"
collected_at: "2026-08-24T14:20:10+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, simulation, narrative-design, onboarding, player-feedback]
evaluated_at: "2026-08-24T14:23:50+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1787549421.981719"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787549421981719"
  char_count: 3857
  posted_at: "2026-08-24T14:30:21+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-24T14:30:41+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787549421981719"
next_action: none
stale_after: "2026-09-23"
supersedes: []
gate_reason: >-
  制度への服従と逸脱を許す設計意図、入力過多・単調さ・用途の薄い選択肢という失敗、段階的 mechanic 導入という代替案が一続きで抽出できる。
  評価母数の小ささを限界として明示しつつ、社会制度 simulation の自由度を操作負荷と学習順序から再設計する具体的な分析へ展開でき、CoopEval 水準の投稿を支えられる。
suggested_post_outline:
  overview_angle: "自由度を選択肢の数ではなく、制度に従う・悪用する・逃げるという意味の異なる方針として設計し直す postmortem"
  analysis_axis: "意図した agency と実際の入力負荷を分離し、quota から一日一 mechanic ずつ増やす代替案を progressive disclosure として検討する"
  application_target: "Log_cdx の制度・仕事 simulation prototype で、初日 core loop、日次 mechanic 追加、各選択肢の結果差、自由入力の必要性を縦切り playtest する評価表へ適用する"
  pros_cons: "長所は失敗と代替案が具体的で小規模制作へ移植しやすい点。短所は14 download・友人3人で、改善版の再評価もなく一般化に慎重さが要る点"
  verdict_pre: 部分採用
---

## raw_excerpt

RPG Maker 製 job simulation『Building A Better Future』の最終更新に近い短い postmortem。作者は『The Sims』『Papers, Please』『Spec Ops: The Line』などを参照し、仕事を正しくこなす一本道ではなく、失敗、怠業、過剰な忠誠、恣意的な判定を含む行動の自由を持たせようとした。公開後は14 download、comment なしという小規模な反応に加え、友人3人から feedback を得た。作者が挙げた問題は、option と text box が多いこと、文章が定型的で感情に乏しく長いこと、prisoner ごとに3語・topic を入力させる負荷、job mechanic 自体の単調さ、cellphone と social district に用途の薄い option が多いことだった。別案として、最初は「EcoCredits が基準未満の人を一日に一定数選ぶ」単純な quota から始め、日ごとに mechanic を一つずつ追加する構成を振り返っている。一方で、規則に盲目的に従う以外の遊び方、失敗しても報酬を得られる制度、employee of the month を目指す働き方から仕事を回避する働き方までの幅、player experimentation を残した点も記している。更新では一般的な案内と、RPG Maker の key setting を確認する注意を追加した。

## why_relevant_to_games

社会制度を扱う simulation で、自由度の多さ、入力負荷、段階的な mechanic 導入、作者の想定する面白さと少人数 playtest の反応がどう衝突したかを追う材料になる。
