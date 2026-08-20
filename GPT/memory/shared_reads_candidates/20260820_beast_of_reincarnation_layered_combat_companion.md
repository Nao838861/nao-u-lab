---
title: "Beast of Reincarnation hands-on: parry-rich combat and the cutest mutant pup"
url: "https://blog.playstation.com/2026/08/03/beast-of-reincarnation-hands-on-parry-rich-combat-and-the-cutest-mutant-pup/"
collected_at: "2026-08-20T12:00:58+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, action-rpg, combat-design, companion-system, progression]
evaluated_at: "2026-08-20T12:04:38+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-20T12:04:38+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-20T12:04:38+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-19"
supersedes: []
gate_reason: >-
  parry 成功を相棒技の資源へ渡す設計と、相棒・Blight 能力・食料を複数の loop にまたがらせる接続を、記事固有の具体例から抽出できる。
  定量比較のない発売前 hands-on という限界を明示しても、単一行為と相棒を system の接合点にする設計分析として約4000字の概要・考察を成立させられる。
suggested_post_outline:
  overview_angle: "防御成功と相棒を、戦闘・探索・関係成長・拠点 loop の橋渡しにする layered system design"
  analysis_axis: "個別機能の多さではなく、parry・Blight 能力・Koo・food が別 loop 間で価値を受け渡す接続構造と、その認知負荷・冗長化リスクを分析する"
  application_target: "小規模 prototype で、一つの熟達行為を副次資源へ接続する設計と、相棒の存在理由を戦闘・navigation・収集・成長へ段階的に通す設計 probe"
  pros_cons: "利点は同じ入力や相棒が複数文脈で意味を持ち、system の寄せ集め感を減らせること。欠点は相棒や基幹資源への依存集中、機能過多、各 loop の独立した選択価値が薄れる危険"
  verdict_pre: "部分採用。parry から相棒資源への橋渡しは小さく検証し、相棒の全 loop 横断は役割過多を避けて段階導入する"
---

## raw_excerpt

PlayStation.Blog の発売前 hands-on 記事。『Beast of Reincarnation』は、剣の連撃、回避、block / parry、projectile、敵の stagger と finisher を基礎に置く。強敵では通常攻撃の連打だけでは進みにくく、連続攻撃を parry して反撃機会を作る。成功した parry は相棒 Koo の Bloom Arts に使う Fluorescence Points も生み、Emma の防御成功が相棒の特殊攻撃へ接続される。Bloom Arts は turn-based menu 風に選び、短い timing input と組み合わせる。さらに Entanglement Overdrive で時間を遅くできる。

Emma の Blight 能力は戦闘と移動の双方に使われる。root 状の髪で高所へ移動し、一時的な足場を作り、空中から暗殺する。敵には視野 cone があり、複数敵との戦いでは verticality と stealth も選択肢になる。Koo は戦闘指示だけでなく、目的地への pheromone 表示、興味地点の bark、item 回収も担う。petting、treat、cleaning で rapport を上げると skill slot が増える。

回復は hunger gauge が空でない時に進み、food は HP・Attack・Defense の bonus も持つ。拠点では ingredient、recipe、cooking skill、crop と chicken の収穫時間がつながる。記事は、parry を中心に combat resource、相棒技、探索支援、関係 progression、食料と回復を複数の loop として紹介している。なお開発者による設計解説ではなく、記者が full game を遊んだ hands-on であり、比較 playtest や定量評価は含まれない。

## why_relevant_to_games

一つの parry 成功を反撃だけで終わらせず、相棒 skill の資源へ渡す combat economy と、相棒を戦闘・navigation・収集・関係成長にまたがらせる system 接続の観察例になる。
