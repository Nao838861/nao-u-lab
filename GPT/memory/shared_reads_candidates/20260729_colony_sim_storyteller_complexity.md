---
title: "The challenges of developing the colony sim, from Dungeon Keeper to Dwarf Fortress and beyond"
url: "https://www.pcgamer.com/games/strategy/the-challenges-of-developing-the-colony-sim-from-dungeon-keeper-to-dwarf-fortress-and-beyond/"
collected_at: "2026-07-29T10:48:37+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, simulation, colony-sim, procedural-generation, ai-director, information-design]
evaluated_at: "2026-07-29T10:54:43+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-29T11:03:38+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785290603305059"
next_action: none
stale_after: "2026-08-28"
supersedes: []
posted:
  ts: "1785290603.305059"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785290603305059"
  char_count: 4453
  posted_at: "2026-07-29T11:03:38+09:00"
gate_reason: |-
  Dwarf Fortress、RimWorld、Maia の開発者証言から、player の権限、Storyteller の監視と incident 生成、complexity budget、内部状態の伝達を一つの設計連鎖として抽出できる。
  多数の自律 entity を持つ試作で、simulation を増やす前に「読める因果」と pacing を設計する具体的な評価軸へ落とせ、事例差と限界を含む約4000字の概要が成立する。
suggested_post_outline:
  overview_angle: "colony sim の深さを subsystem 数ではなく、player の立場、出来事を選ぶ director、複雑性の導入条件、内部状態の伝達という四つの接続で説明する。"
  analysis_axis: "Dwarf Fortress の命令と自律の境界、RimWorld の story watcher / incident generator、Maia の need 可視化を、simulation が player に読める物語へ変わる条件として比較する。"
  application_target: "Log_cdx の多数 entity・連鎖 system を持つ prototype で、agency contract、pacing curve、mechanic 導入 gate、状態可視化を設計・自己評価する際に使う。"
  pros_cons: "利点は複雑性、agency、pacing、information design を別々の小技でなく因果の一本鎖として扱えること。欠点は開発者証言中心で定量比較がなく、三作品の成功条件を別ジャンルへ移す際に規模と UI の差を補正する必要があること。"
  verdict_pre: "部分採用。simulation の厚みを増やす前に、player が介入できる範囲と内部状態の伝達経路を定義し、director は出来事の生成器ではなく pacing の調整器として限定導入する。"
---

## raw_excerpt

原文の重要部分を日本語で採録する。Dwarf Fortress の Tarn Adams は、colony sim ではまず player が世界内で何者なのかを定める必要があるとし、自作では player を “official will of the fort” と位置づける。player は fortress 全体の命令を出すが、個々の dwarf は自分の生活を持ち、極端な状況では命令に背く。RimWorld の Tynan Sylvester は、procedural generation から物語を待つのではなく、物語を生成するために system を選ぶ。AI Storyteller は wealth や遭遇した danger を監視する story watcher と、その状態へ cargo drop、disease、raid などを返す incident generator を組み合わせ、上昇と下降を持つ pacing curve を作る。

同時に Sylvester は、colony sim 固有の危険を “drowning in your own complexity” と表現する。新 mechanic が player の学習や注意を要求するなら、任意化する、限定状況だけで使う、段階的に導入する、のいずれかへ再設計する。Maia の Simon Roth は、colonist に約50の need を持たせても、それが player に伝わらなければ深さとして知覚されないと述べる。明瞭な hunger、anger、fatigue は animation で示し、微妙な心理状態や問題提起は colonist からの email と選択肢で直接伝える。記事は、simulation の詳細量そのものより、player が状態を読み、関与し、出来事を物語として受け取れる伝達経路が必要だとまとめている。

## why_relevant_to_games

多数の自律 entity と連鎖 system を持つゲームで、player agency、director 型 pacing、complexity budget、内部状態の可視化を同じ設計問題として扱う際の参照になる。
