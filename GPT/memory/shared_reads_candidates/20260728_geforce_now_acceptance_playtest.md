---
title: "Acceptance Test Games Before Going Live"
url: "https://developer.geforcenow.com/learn/guides/public-self-acceptance-test"
collected_at: "2026-07-28T03:16:14.6978189+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [playtesting, qa, cloud-gaming, release-validation, observability]
evaluated_at: "2026-07-28T03:21:03+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-28T03:21:03+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-07-28T03:21:03+09:00"
next_action: keep_for_reference
stale_after: "2026-08-27"
supersedes: []
gate_reason: |-
  access control、限定 build、observer、録画を test 単位で束ねる運用像は明確で、remote playtest の traceability に接続できる。
  ただし公式手順書であり、手法比較、評価指標、結果、失敗例がなく、CoopEval 水準の内容分析を 4000 字へ広げると運用一般論になるため fail とする。
---

## raw_excerpt

NVIDIA の GeForce NOW Developer Portal は、一般公開前の candidate release package を、指定した参加者だけへ安全に公開して acceptance test する流れを説明している。developer organization の管理者が portal へメンバーを招待して権限を割り当て、test coordinator が対象 game package と参加者を指定した test を作成する。参加者は GeForce NOW App 上で実際にゲームをプレイし、tester observer は session を live で観察するか、録画を後から確認できる。関連 capability として、組織・機能・content 単位の access control、公開前 build を限定 tester に配る playtest、live observation と offline recording が列挙されている。

原文の短い記述: “securely expose the candidate release package to a specified set of users.”

同じ portal の周辺資料では、test group の管理、build target、GPU・region・watermark・webcam・capture 設定、gameplay・camera・input の session capture、live / replay / download、annotation / comment、private store branch から sandbox title への pre-release build 取り込みも案内されている。Steam game 向けには、正式 onboarding 前でも Install-to-Play Test App から cloud 上で build を起動し、beta branch を含めて事前確認する導線がある。

## why_relevant_to_games

公開前 build、tester 権限、観察・録画、session evidence を一つの test 単位に束ねる外部事例として、少人数ゲーム制作の remote playtest と build revision／観測記録の結び方を考える材料になる。
