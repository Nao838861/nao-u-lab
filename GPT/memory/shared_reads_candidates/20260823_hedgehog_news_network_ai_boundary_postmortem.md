---
title: "Hedgehog News Network Developer Port Mortem (Mr.Game and Audio's Perspective)"
url: "https://itch.io/devlog/1634633/hedgehog-news-network-developer-port-mortem-mrgame-and-audios-perspective.amp"
collected_at: "2026-08-23T13:18:10+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, narrative-design, postmortem, twine, tool-integration, ai-assisted-development, game-jam]
evaluated_at: "2026-08-23T13:25:00+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-23T13:25:00+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-23T13:25:00+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-22"
supersedes: []
gate_reason: >-
  writer が Harlowe の記法を変えずに React animation を呼べる signal bridge、DOM 所有権の衝突、Tweego compile 後の抽出という実装境界が具体的である。
  2日間の crunch で AI 補助が理由確認・code 読解・採否判断を追い越した自己評価まで含み、authoring interface と実装所有権を同じ制作条件として約4000字で分析できる。
suggested_post_outline:
  overview_angle: "writer の既存記法を守る translation bridge と、締切下で開発者の理解を守れなかった AI 利用境界を一つの所有権問題として読む"
  analysis_axis: "Harlowe/React 間で誰が DOM と意味を所有するか、signal をどこで engine action に変換するか、AI 提案を理解して採用する loop がどこで崩れたか"
  application_target: "Log_cdx の narrative prototype で、content 側は小さな宣言記法、engine 側は検証可能な action mapping に分け、AI 生成 code は説明・読解・手動採否を通過条件にする"
  pros_cons: "writer の流れを壊さず UI を拡張できる一方、compile 後 DOM への依存は壊れやすく、crunch では bridge 自体と AI 生成 code の理解負債が同時に増える"
  verdict_pre: "部分採用"
---

## raw_excerpt

Narrative Game Jam 2026 で 3 人 team が、unreliable narrator と book を題材にした browser game を制作した記録。開発担当は、writer が扱いやすい Twine の Harlowe format に React UI を組み込み、dialogue window の分離、art 差替え、writer が既存の書き方を変えず animation を呼べる translation bridge を 2 日で用意しようとした。たとえば `|leads>[Eggs]` という signal を物語側へ書くと、book が開き lead を記録して閉じる animation へ変換される。Harlowe が DOM の大半を所有するため、Tweego で story を compile し、到達可能な text element を抽出して制御した。crunch では AI assistant と architecture を相談し code も得たが、作者は通常、提案理由を聞き、code を読み、自分で採否を決める使い方を好むと記す。期限優先で理解が追いつかないまま依存度が増えたことを境界侵犯として振り返り、次回は rubber duck の範囲へ戻すとしている。結語は “I want to be the designer, Not have AI do it for me.”。

## why_relevant_to_games

writer-facing DSL と engine-facing UI を bridge で分離した小規模制作例であると同時に、crunch 下で AI 補助が理解・所有権を侵食する条件を当事者が記録している。制作 harness の説明可能性と停止条件を考える材料になる。
