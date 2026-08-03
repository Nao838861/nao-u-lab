---
title: "Postmortem - Big Lizard"
url: "https://itch.io/devlog/1563201/postmortem"
collected_at: "2026-07-21T20:15:35+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, postmortem, ai-copilot, playtesting, pico-8, validation]
evaluated_at: "2026-08-03T22:51:02+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-03T22:51:02+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-03T22:51:02+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-02"
supersedes: []
gate_reason: >-
  人間が設計意図と feel の判定を持ち、AI 実装を propose→agree→build→validate で制御する責任分界が明確。
  160 build、trap-state soak test、誤実装の撤回例まであり、問題・手法・検証・限界を約4000字で具体化できる。
suggested_post_outline:
  overview_angle: "AI copilot との小刻みな合意形成と、playtest／大量検証を接続した小規模ゲーム制作 postmortem"
  analysis_axis: "人間の設計責任、変更 gate、外部 test harness、実装量を増やさない難度修正を一つの検証閉路として分析する"
  application_target: "Log_cdx の game prototype cycle で、一変更一合意・playable build・trap-state soak test を組にする"
  pros_cons: "反復の監査性と公平性検証は強い一方、PICO-8 規模の事例であり、大規模 project への拡張性は未検証"
  verdict_pre: "採用"
---

## raw_excerpt

原文の要点を日本語で採録する。『BIG LIZARD』は事前の design document を置かず、reverse engineering から始めて build と playtest の反復で設計を積み上げた小規模 arcade game。human designer は art、design intent、gameplay decision、最終的な feel の判定を持ち、AI copilot は Lua の実装を担当した。各変更は `propose → agree → build → validate` の四段階を固定し、合意を一件ずつ適用する design document として扱った。v1.0 までに約 160 build を重ねている。

公平性は目視だけで判断せず、PICO-8 外に game logic を再実装した test harness で数十万の randomized situation を soak し、player が公平に脱出できない trap state を探索した。cart の parse と変更ごとの相対 token cost は外部 parser で測ったが、絶対 token 数は系統的に過大報告されるため、ground truth は PICO-8 editor の値に限定した。制作中には、wave 単位の boss attack 再抽選を turn 単位へ下げて意図しない difficulty spike を除く、衝突処理を足す代わりに flame height を制限する、未確認の panic-roll 問題への punisher 実装を playtest 後に取り下げる、といった変更を行った。一方、合意前の実装、code を読まず記憶から sequence を答えること、token cost の楽観見積りは廃棄作業につながったと記録している。

## why_relevant_to_games

AI と小さな game prototype を反復する時の責任分界、変更 gate、trap-state soak test、実装を増やさず衝突条件を消す修正を一つの制作記録として参照できる。
