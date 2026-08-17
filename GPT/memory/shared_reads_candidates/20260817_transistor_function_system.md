---
title: "Game Design Deep Dive: The Functions of Transistor"
url: "https://www.gamedeveloper.com/design/game-design-deep-dive-the-functions-of-i-transistor-i-"
collected_at: "2026-08-17T11:31:48+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, systems-design, action-rpg, abilities, experimentation, postmortem]
evaluated_at: "2026-08-17T11:36:38+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1786934523.220079"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786934523220079"
  char_count: 4325
  posted_at: "2026-08-17T11:42:12+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-17T11:42:12+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786934523220079"
next_action: none
stale_after: "2026-09-16"
supersedes: []
gate_reason: "random deck案が線形物語とdifficulty curveに衝突した失敗から、16 Functionの三用途化、slow death、一時使用不能、物語報酬へ至る判断連鎖が具体的である。少数部品の組合せ空間と失敗後の戦術変更へ直接適用でき、約4000字の投稿を十分な密度で構成できる。"
suggested_post_outline:
  overview_angle: "戦法固定をrandomnessで壊す案を捨て、同じ部品の多用途化と一時的損失で横方向の実験を促したsystems-design事例"
  analysis_axis: "random deckの失敗理由、active・upgrade・passive統合、slow death、backstory報酬が互いにどう実験コストを下げるか"
  application_target: "Nao_u_BOTの少数mechanic prototypeで、同一部品を複数slot roleへ再利用し、失敗時に即resetせず一時的な構成崩れから別戦術を試させる設計"
  pros_cons: "少数assetから大きな組合せ空間と発見を作れる一方、組合せ説明、balance、愛用構成が失われた時の不公平感への対処が必要になる"
  verdict_pre: "採用。三用途化と発見報酬を優先し、強制的な一時使用不能は失敗時UXを検証してから導入する"
---

## raw_excerpt

Supergiant Games の Amir Rao が、『Transistor』の Function ability system が collectible card game 的な初期案からどう変わったかを説明した一次記事。初期目標は、player が同じ skill に固定されないよう、ability / upgrade / passive を deck に入れ、level ごとに shuffle して局所的な power curve を作ることだった。しかし線形 narrative の旅では、level ごとに能力を失い shuffle し直す理由が不自然で、difficulty も毎回 reset されるため、物語上高まる stakes と衝突した。team は気に入っていた randomness を残すために game 全体の構造を変えるのではなく、この案を退けた。

最終系では、health が尽きるたびに action bar 内で価値の高い Function が encounter 中だけ使用不能になる「slow death」を採用した。即 checkpoint に戻さず最大三段階まで継続でき、頼っていた構成が一時的に崩れるため別の Function 組合せを試す契機になる。もう一つの変更は、power、upgrade、passive を16個の Functionへ統合したこと。各 Function はactive slotで能力として使えるだけでなく、別 Function へ装着してupgradeにしたり、限られたpassive slotへ置いたりできる。同じ16 conceptのpair / trioから多数の構成が生まれる一方、通常のRPGのようにお気に入りをlevel 99へ育てる縦成長は持たない。新しい組合せの使用でbackstoryを開示し、慣れた構成を好むplayerを罰せず、system探索に物語報酬を重ねている。

## why_relevant_to_games

「同じ戦法への固定」を禁止やrandomnessで壊すのではなく、部品の多用途化、一時的な損失、物語報酬で横方向の実験へ誘導した設計資料。少数mechanicから組合せ空間を作るprototypeや、失敗を即resetにせず戦術変更へ変える設計に使える。
