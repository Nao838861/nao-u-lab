---
title: "Author's notes - rpg sketch 24"
url: "https://tunditur-unda.itch.io/rpg24/devlog/1564293/authors-notes"
collected_at: "2026-07-27T18:47:02+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, rpg, combat-design, companion-ai, rapid-prototyping, postmortem]
evaluated_at: "2026-07-27T18:53:09+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-27T19:04:46+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785146658398509"
next_action: none
stale_after: "2026-08-26"
supersedes: []
posted:
  ts: "1785146658.398509"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785146658398509"
  char_count: 4447
  posted_at: "2026-07-27T19:04:46+09:00"
gate_reason: |-
  防御だけを操作する player と自律攻撃役を組み合わせる着想、AIの判断基準、予測が戦術へ変換されない turn-order 上の失敗が具体的に揃う。
  成功談だけでなく playtest の反証と未解決 trade-off があり、味方AIを読む combat prototype へ直接移せる4000字級の分析が可能。
suggested_post_outline:
  overview_angle: "味方AIを人格として読むための非対称役割分担と、その予測を意思決定価値へ変える条件を成功・失敗の両面から解説する"
  analysis_axis: "AIの不完全最適化、行動速度、敵 threat、player の防御 toolset が予測可能性と戦術性をどう結ぶか"
  application_target: "Nao_u_BOT の短時間 combat prototype で、味方AIの癖を観察して間接操作する設計と、予測が次の一手を変えたかを測る playtest に適用する"
  pros_cons: "少ない操作で協調感と人格を生みやすい一方、速度順や敵構成を誤ると予測が結果へ間に合わず、単なる被害受容になる"
  verdict_pre: "採用"
---

## raw_excerpt

記事内容の収集時要約。`rpg sketch 24` は約6時間で作られた小型 dungeon crawler で、戦闘の役割を「player が操作する防御役」と「自律行動する攻撃役」に分けている。主人公 Marie-Louise は火力が低い一方、status ailment を用いた防御 skill が豊富で、player は敵がどう攻撃するかを読み、適切な shutdown 手段を選ぶ。護衛対象 Jusztina は脆いが高火力で、攻撃は AI に任される。AI は弱点、kill 数、残 HP、MP 節約をある程度考慮し、必ずしも最適でない選択もするため、行動予測に suspense や安堵が生まれる。作者は、自律 character を token ではなく人格として感じさせ、player が習慣を学び協調する体験を狙った。ただし現版では、Jusztina が多くの敵より遅く、彼女の攻撃を予測できてもその round の被害を防げないため、予測が戦略計算へ十分つながらない。多くの戦闘で「理想手」がなく、どの防御を選んでも大きな損害を受けるという playtest 指摘もあった。作者は完全に解ける戦闘へ寄せることには慎重で、被弾を残しつつ判断の厚みを増やすため、toolset、character 数、敵 threat の多様性、行動速度の関係を問いとして挙げている。また短時間で dungeon crawler を作れる工程が確立した一方、制作が formulaic になっている感覚も記録している。

## why_relevant_to_games

player が味方 AI の癖を読み、防御で間接的に協調する combat prototype と、その予測を turn order や enemy composition が実利へ変換できない失敗条件を同時に確認できる。
