---
title: "'Human Fall Flat 2 is cancelled. We are making Human Fall Flat 3:' No Brakes Games founder looks back on a defining decade"
url: https://www.gamedeveloper.com/production/-human-fall-flat-2-is-cancelled-we-are-making-human-fall-flat-3-no-brakes-games-founder-looks-back-on-a-defining-decade
collected_at: 2026-07-25T08:00:19.8792778+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-production, postmortem, physics-game, iteration, scaling]
evaluated_at: 2026-07-25T08:04:43.4506306+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: 2026-07-25T08:04:43.4506306+09:00
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-25T08:04:43.4506306+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-24"
supersedes: []
gate_reason: >-
  成功後の規模拡大で review が遅れ、物理挙動の「不器用さ」を polish が消し、
  数年分をほぼ作り直した因果が具体的である。system-first 設計、iteration latency、
  作品 identity の評価を Log_cdx の prototype 制作へ直接接続でき、約4000字の分析に耐える。
suggested_post_outline:
  overview_angle: "10年の成長を、solo 制作から組織化した時の feedback loop 断絶と、続編で失った物理的個性の再獲得として解説する"
  analysis_axis: "物理ゲームでは操作の不器用さも設計資産であり、一般的な polish と制作規模拡大が identity を損なう条件を分析する"
  application_target: "Log_cdx のゲーム prototype で、早期 playable review、物理・操作の不変条件、変更可能な level pipeline を明示して評価する"
  pros_cons: "system-first と短い review loop は創発性と手触りを守る一方、品質基準の言語化不足や作り直し判断の遅れには弱い"
  verdict_pre: "部分採用。物理挙動そのものを目的化する作品では強く採用し、ジャンル横断の一般則にはしない"
---

## raw_excerpt

Game Developer が No Brakes Games 創業者 Tomas Sakalauskas に、Human: Fall Flat の試作公開から10年、世界累計6000万人規模への成長、続編開発を聞いた記事。初期は solo developer として制作し、成功後は外注や別 studio の設立で規模を拡大したが、工程が硬直し、level が変更しにくい段階になってから review に届く問題が生じたという。本人は作品を physics と engineering を核にした technology project と捉え、「You make systems, and from those systems, nice behaviors emerge.」と説明している。

続編は数年制作したのち、physics の方向を誤って原作の不器用さを失い、「It was too stiff. Too polished.」という状態になったため、ほぼ作り直す判断をした。一部の design beat は再利用しつつ、team が作品固有の tool と mindset を揃え、immersion と physical reactivity を優先する方針へ移行した。運営面では publisher が marketing、platform 展開、commercialization を担い、開発者は game direction と physics programming に集中する分担も語られている。

## why_relevant_to_games

物理挙動そのものが作品 identity の場合、完成度を上げることが固有の「不器用さ」を消す事例として、prototype review と sequel の作り直し判断を考える材料になる。少人数制作を拡大する際の iteration latency、役割分担、system-first な設計維持にも接続できる。
