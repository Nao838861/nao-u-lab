---
title: "Deconstructing Open-World Game Mission Design Formula: A Thematic Analysis Using an Action-Block Framework"
url: https://arxiv.org/abs/2603.18398
collected_at: 2026-06-19T09:59:20+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, mission-design, action-blocks, open-world, pacing]
evaluated_at: 2026-06-19T10:02:07+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: duplicate_existing_post
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-20T04:05:30+09:00"
last_decision: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-9be2b185156f996b; terminal:memory/shared_reads_candidates/20260611_open_world_mission_action_block_framework.md: https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781148254466439; reason:posted-source index で同一 arXiv URL の既投稿を確認したため、open representative を再投稿対象外として閉じる"
next_action: none
stale_after: "2026-07-19"
supersedes: []
duplicate_of:
  candidate: "memory/shared_reads_candidates/20260611_open_world_mission_action_block_framework.md"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781148254466439"
duplicate_reason: "Phase 3 duplicate guard: same arXiv URL was already posted on 2026-06-11."
gate_reason: |-
  MAQV、action block grammar、2200 missions、dashboard / mixed-methods study まで揃い、open-world mission 分析の中核を抽出できる。
  そのまま AAA mission 研究としてではなく、短い playable prototype の action block sequence と peak/valley rhythm の観察単位へ翻訳できる。
suggested_post_outline:
  overview_angle: "open-world mission の formula を、action block と品質ベクトルで可視化する研究として整理する。"
  analysis_axis: "MAQV 6 次元、LLM-assisted parsing、dashboard、designer/player study が何を測れて何を測れないかで分析する。"
  application_target: "STG や短編 prototype のリプレイログを spawn warning、micro dodge、resource pickup、rest beat などの block sequence に分解する。"
  pros_cons: "利点は pacing / variation を感想ではなく観察単位にできる点。欠点は open-world mission 由来の語彙を小規模ゲームへ移す際に過剰分類しやすい点。"
  verdict_pre: "部分採用。MAQV 全体ではなく、action block sequence と rhythm 可視化を採用する。"
---

## raw_excerpt
arXiv abstract と 2026-06-11 #shared-reads raw からの抄訳メモ。open-world mission は反復的な formula に依存しやすいが、designers が large portfolio 全体で pacing、variation、experiential balance を点検する方法は不足している。論文は Mission Action Quality Vector (MAQV) を導入し、combat、exploration、narrative、emotion、problem-solving、uniqueness の 6 次元で mission action を表す。これを action block grammar と組み合わせ、mission を gameplay sequence として扱う。

データは 20 AAA titles から約 2200 missions。community walkthroughs を LLM-assisted parsing で structured action sequences に変換し、MAQV で scoring する。さらに interactive dashboard によって mission formula を可視化し、experienced players と professional designers を含む mixed-methods study で pipeline fidelity、tool usability、reflection probe、thematic analysis を行う。

Slack raw では、この考えを小規模プロトタイプにも移せる候補として、STG の spawn warning、micro dodge、aim/position、burst attack、resource pickup、risk reward choice、rest beat、boss phase shift のような action block vocabulary へ翻訳する案が出ていた。品質点そのものより、block sequence と peak/valley rhythm を見える形にする用途が近い。

## why_relevant_to_games
短い playable prototype のリプレイやログを action block sequence として切り出し、単なる感想ではなく pacing と variation の観察単位を作る候補になる。
