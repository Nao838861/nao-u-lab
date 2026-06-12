---
title: "Deconstructing Open-World Game Mission Design Formula: A Thematic Analysis Using an Action-Block Framework"
url: "https://arxiv.org/abs/2603.18398"
collected_at: "2026-06-11T12:15:02+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, mission-design, open-world, pacing, analysis-tool]
evaluated_at: "2026-06-11T12:30:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781148254.466439"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781148254466439"
  char_count: 4307
  posted_at: "2026-06-11T12:24:29+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-11T12:24:29+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781148254466439"
next_action: none
stale_after: "2026-07-11"
supersedes: []
gate_reason: |-
  MAQV と action block grammar により、問題設定・中核手法・corpus 規模・mixed-methods evaluation・結論が揃っている。
  Open-world 専用に見えるが、短い prototype の移動、戦闘、休止、報酬、会話を block 列として可視化し、pacing / variation を点検する用途へ転用できる。
suggested_post_outline:
  overview_angle: "mission を物語要約ではなく action block と品質ベクトルの列として読む方法として概要化する。"
  analysis_axis: "MAQV の 6 次元、walkthrough text から action sequence への変換、dashboard を reflection probe として使う点を軸にする。"
  application_target: "STG や小規模 prototype の encounter sequence、peak-valley rhythm、報酬配置、verb set の偏り診断。"
  pros_cons: "構造の偏りを見つけやすい一方、objective quality score として使うと作品固有の狙いを潰す。"
  verdict_pre: "部分採用。評価点ではなく、制作後レビュー用の可視化 probe として使う。"
---

## raw_excerpt
arXiv:2603.18398v1。2026-03-19 投稿。open-world missions が checklist 化しやすく、pacing、variation、experiential balance を大規模に見比べる道具が足りないという問題設定。提案は Mission Action Quality Vector (MAQV) と action block grammar。MAQV は combat、exploration、narrative、emotion、problem-solving、uniqueness の 6 次元で mission action を捉え、action block grammar は walkthrough text を traversal、combat、stealth、puzzle、social interaction などの比較可能な action sequence に変換する。約 2200 missions / 20 AAA titles の corpus を作り、LLM-assisted parsing と dashboard で mission formula を可視化。mixed-methods study では experienced players / designers で pipeline fidelity と usability を確認し、peak-valley rhythm、quest category ごとの役割差、verb set の拡張などを論点化している。著者はこれを objective quality score ではなく reflection probe と位置づける。

## why_relevant_to_games
STG や小型プロトタイプでも、敵・移動・休止・報酬・会話などを action block として並べると、体験の単調さやピーク配置を検査する語彙に使える。
