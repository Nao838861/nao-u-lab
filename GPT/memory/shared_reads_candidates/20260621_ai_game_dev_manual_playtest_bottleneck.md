---
title: "How I'm using AI for game dev in 2026"
url: "https://blog.jeffschomay.com/how-i-m-using-ai-for-game-dev-in-2026"
collected_at: "2026-06-21T14:59:08+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-dev, ai-assisted-development, playtesting, workflow]
evaluated_at: "2026-06-21T15:03:03+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1782022174.177669"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782022174177669"
  char_count: 4500
  posted_at: "2026-06-21T15:09:42.0319090+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-21T15:09:42.0319090+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782022174177669"
next_action: none
stale_after: "2026-07-21"
supersedes: []
gate_reason: |
  AI coding assistant で実装速度は上がるが、ゲームでは手動 playtest、feel 調整、playability 受け入れが後段ボトルネックになる、という問題設定が具体的。
  通常の業務コードと違い、テスト harness だけで look/feel/playability を閉じられないという差分を、制作配分と検証設計の話へ展開できる。
  Nao_u_BOT の headless 評価を「人間の感触確認の前段」に置く運用へ直結し、CoopEval 水準の概要に必要な論点を抽出できる。
suggested_post_outline:
  overview_angle: "AI で実装が速くなるほど、ゲーム制作の律速がコード生成から playtest と feel 調整へ移る、という制作配分の変化として読む。"
  analysis_axis: "通常ソフトウェアの自動検証とゲームの look/feel/playability 検証の差、AI coding assistant の短期効果、人間 playtest と AI playtest の分担を軸に整理する。"
  application_target: "Nao_u_BOT の headless / browser playtest を、人間の感触確認を置き換えるものではなく、退屈な validation と bug squash を先に潰す前段工程として設計する。"
  pros_cons: "メリットは AI 活用の現実的な境界線を制作サイクルに落とせる点。デメリットは個人開発者の事例であり、定量評価やチーム規模別の再現性は弱い点。"
  verdict_pre: "部分採用。AI 実装速度よりも、実装後の acceptance と feel 検証を設計対象に含める運用指針として採用する。"
---

## raw_excerpt

短い原文断片: "games require so much squishy human play-testing"。著者は、AI coding assistant でゲーム実装の大部分を短時間に進められても、後段では人間の手動 play-testing と調整が支配的になると書いている。例として、Claude が milestone を約30分で実装する一方、その後に5時間以上の手動 play-testing と tweaking が必要になった、という開発配分を挙げる。通常の業務コードなら testing harness で検証できるが、ゲームでは look、feel、playability の確認が難しく、実装後の acceptance に時間がかかる。追記では、自律的な AI play-testing を導入して、退屈な validation と bug squashing を一部移し、人間は play と feel に集中する方向へ進めたと述べている。

## why_relevant_to_games

AIで実装速度が上がるほど、制作ボトルネックが「コードを書く」から「遊んで確認する」へ移る事例として使える。Nao_u_BOT の headless 評価やブラウザ playtest を、人間の感触確認の前段に置く発想へ接続できる。
