---
title: "Sosoowge Ninja: A Global Game Jam 2026 Postmortem"
url: "https://joncodesthings.net/posts/2026/03/29/sosoowge-ninja-a-global-game-jam-2026-postmortem/"
collected_at: "2026-05-18T04:05:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, postmortem, game-jam, engine-evaluation, iteration, production-risk]
evaluated_at: "2026-05-18T04:20:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
candidate_status: failed
status: failed
last_reviewed_at: "2026-05-18T04:20:00+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-05-18T04:20:00+09:00"
stale_after: "2026-06-17"
supersedes: []
next_action: keep_for_reference
gate_reason: |
  hot reload、source control、export/licensing という制作環境リスクは有用だが、記事の主軸は「新しい engine を触った体験」で、ゲーム制作手法としての評価軸が細い。
  Nao_u_BOT の playable diff 前提確認には使えるが、#shared-reads に残すべき4000字級の概要としては展開しにくい。

---

## raw_excerpt
Global Game Jam 2026 の postmortem。作者は約5年ぶりに game jam へ戻り、programmer friends と team を組んで、テーマ "mask" を主人公の mask に取り込んだ third-person action game を s&box で試作した。主目的の一つは、Facepunch の s&box という新しい engine/platform を、Unity 経験者の C# scripting 感覚でどの程度扱えるかを見ることだった。

よかった点として、Unity 風の scripting layer が経験移転しやすかったこと、hot-reloading が非常に速く iteration time と開発体験を改善したこと、Perforce を小規模 jam でも快適に使えたことが挙げられている。悪かった点は、新技術の technical setup に起因する Visual Studio project generation の hard-coded path、jam site から remote hardware に入る環境制約、参加者の体調不良や時間制約、最終的に licensing/export 問題で playable export を出せなかったこと。完成度よりも「新技術を触って戻ってきた jam experience」が中心の記録になっている。

## why_relevant_to_games
gameplay 設計そのものより、engine selection、hot reload、source control、export/licensing という制作環境リスクの候補。Nao_u_BOT の短期プロトタイプでも、playable diff の前提条件として export 可能性と反復速度を確認する材料になる。
