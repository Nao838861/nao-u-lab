---
title: "Keling - Marketing and Playtesting at Comipara Offline Event"
url: "https://fractalistic-games.itch.io/keling-bengkel-keliling-g4c/devlog/1504526/keling-marketing-and-playtesting-at-comipara-offline-event"
collected_at: "2026-07-24T14:47:16.0977718+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [playtesting, mobile-game, pc-port, controls, ui-ux, monetization, postmortem]
evaluated_at: "2026-07-24T14:52:35+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-24T14:52:35+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-24T14:52:35+09:00"
next_action: revise_or_research
stale_after: "2026-08-23"
supersedes: []
gate_reason: |-
  mobile／PC移植でUI・操作・収益設計が同時に崩れる観察と、対面playtestの適用先は具体的である。
  ただし参加人数、session条件、操作案の比較手順、結果指標がなく、操作schemeとtutorial・習熟時間の影響も未分離なため、約4000字の概要を推測なしでは支えられない。
---

## raw_excerpt

開発者は、インドネシア・ジョグジャカルタの創作イベント Comipara に2日間参加し、モバイル／PC向けトップダウン車両ゲーム『Keling』を、オフライン市場調査・初期マーケティング・プレイテストの三目的で展示した。会場ではスマートフォン実機、PC版、alpha trailer を併用し、来場者だけでなくモバイルゲーム公開経験者からも意見を得た。広告だけに依存する収益化は、multiplayer 用 cloud service の費用を考えると弱く、upgrade と cosmetics をゲーム内動機へ接続する必要があるという指摘があった。

操作と表示では、同じUIを端末間で流用すると、モバイルでは詳細情報が小さすぎ、desktopでは要素が大きすぎて整理されて見えないことが判明した。運転操作も、WSをthrottle、ADをsteeringに割り当てる方式は駐車のような精密操作には合う一方、狭い空間を高速で走るarcade playには合わなかった。入力方向へ車体が向く方式へ変更すると、従来方式を好むplayerも現れ、問題が操作schemeそのものか、tutorial・慣れ・play time不足かは未確定のまま残った。原文の要点は “you can't simply port Mobile to PC directly without major changes” で、移植時の違和感がUI・操作・収益設計の三層に現れている。

## why_relevant_to_games

prototypeを開発者コミュニティ外の対面イベントへ持ち込み、端末差と操作習熟を同時に観察する収集事例。PC／mobile併用ゲームで、操作方式の好みとtutorial不足を切り分けるplaytest設計に使える。
