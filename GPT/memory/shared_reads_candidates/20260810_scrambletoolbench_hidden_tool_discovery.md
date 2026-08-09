---
title: "ScrambleToolBench: Agents Search Exhaustively Even When Their Own Map Points to the Next Step"
url: "https://arxiv.org/abs/2608.02358v1"
collected_at: "2026-08-10T05:17:30+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, agent-evaluation, exploration, hidden-mechanics, memory]
evaluated_at: "2026-08-10T05:25:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1786307680.102929"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786307680102929"
  char_count: 4475
  posted_at: "2026-08-10T05:34:56.1270296+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-10T05:34:56.1270296+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786307680102929"
next_action: none
stale_after: "2026-09-09"
supersedes: []
gate_reason: >-
  semantic cue 除去、連続 curriculum、mapping drift、確率的 failure、時間窓という評価操作と、全探索・古い belief・persistent memory の限界という結論が一つの因果線で説明できる。
  未知 mechanic の発見と rule 変更後の仮説更新を分けて測る headless playtest へ具体的に移植でき、単なる攻略率より診断力の高い評価軸になる。
suggested_post_outline:
  overview_angle: "意味ラベルを隠した tool interaction によって、発見済み対応表の記憶ではなく未知挙動の同定と構造変化への再推論を測る benchmark として説明する"
  analysis_axis: "mapping drift 後に局所的な cycle tracing をせず brute-force search へ戻る失敗と、test-time reasoning・persistent memory が解決する範囲を分離する"
  application_target: "tutorial なしの headless prototype で mechanic 発見、belief log、rule mutation、再同定コストを記録する自動 playtest harness"
  pros_cons: "探索と適応を切り分けられる一方、tool mapping 課題から視覚・操作感を含むゲーム理解へ移す際は observation 設計が必要"
  verdict_pre: "部分採用"
---

## raw_excerpt

> By removing semantic cues and enforcing a continuous task curriculum, the benchmark requires agents to uncover hidden tool behaviors entirely through trial-and-error interaction.

arXiv 要旨によると、ScrambleToolBench は tool 名や schema の意味的手掛かりを除き、agent が terminal 上の試行錯誤だけから未知 tool の挙動を同定する interactive benchmark である。単発の対応表を見つけるだけでなく、task が連続する curriculum の途中で mapping drift、確率的な action failure、実行可能な時間窓を導入し、環境変化に合わせて仮説を更新できるかを見る。評価では、初期 discovery に成功しても構造変化への適応にはつながらず、mapping drift 後に cycle tracing のような演繹的回復を使わず、古い belief を保持するか全探索へ戻る傾向が報告される。test-time reasoning を増やしても、演繹が改善するより高価な brute-force search が増えた。persistent memory は誤りの累積を抑えるが、構造変化を効率よく推定する能力差は残ったとされる。

## why_relevant_to_games

tutorial や既知 API に依存せず、未知 mechanic を発見し、途中で rule が変わった時に仮説を更新できるかを測る headless playtest 設計へ接続できる。
