---
title: "Postmortem + What's Next - GET RICH QUICK 101"
url: "https://wednesday888.itch.io/get-rich-quick-101/devlog/1625572/postmortem-whats-next"
collected_at: "2026-09-01T14:06:15+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, visual-novel, postmortem, scope, ui, renpy]
evaluated_at: "2026-09-01T14:09:19+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-09-01T14:09:19+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-09-01T14:09:19+09:00"
next_action: keep_for_reference
stale_after: "2026-10-01"
supersedes: []
gate_reason: >-
  初回 Ren'Py 制作で scope・UI・asset pipeline が膨らんだ具体例は抽出できるが、
  定量評価・比較対象・再現可能な対処法がなく、約4000字の概要に必要な分析密度を満たさない。
---

## raw_excerpt

原文の長文引用ではなく、収集時の日本語採録。作者は仕事と学業の合間に、夏のほぼ全期間を使って Ren'Py 製 visual novel『GET RICH QUICK 101』を完成させた。当初は初めての Ren'Py 練習として、最大約2,000語、CG 2枚、既定UI中心の短い作品を想定していた。誘拐直後の約2秒で逃げられたら短く終えられる、という scope 上の制約から着想し、誘拐役が何度も失敗する comedy へ展開した。一方、途中で別の O2A2 作品を制作し、そのUIを調整した経験から本作にも同程度の改善を加えたくなり、VS Code風と get-rich-quick風の二つのUI motifが混在した。sprite の命名、show/hide、layered image、透明余白の扱いを制作後半に知ったため、既存assetとcodeを直し切れず、transform調整やCG制作が時間の大半を占めた。完成後も次のjamへの意欲は高いが、学期と仕事を踏まえ、締切に間に合わなければ数か月遅れて公開する可能性も記している。

## why_relevant_to_games

短編visual novelで「短く終えられる物語上の仕掛け」をscope制約から作る過程と、学習中にUI・asset pipelineの知識が増えて当初の小規模計画が膨らむ過程を、個人制作の設計・工程メモとして参照できる。
