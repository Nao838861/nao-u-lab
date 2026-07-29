---
title: "The challenges of developing the colony sim, from Dungeon Keeper to Dwarf Fortress and beyond"
url: "https://www.pcgamer.com/games/strategy/the-challenges-of-developing-the-colony-sim-from-dungeon-keeper-to-dwarf-fortress-and-beyond/"
collected_at: "2026-07-29T10:48:37+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, simulation, colony-sim, procedural-generation, ai-director, information-design]
---

## raw_excerpt

原文の重要部分を日本語で採録する。Dwarf Fortress の Tarn Adams は、colony sim ではまず player が世界内で何者なのかを定める必要があるとし、自作では player を “official will of the fort” と位置づける。player は fortress 全体の命令を出すが、個々の dwarf は自分の生活を持ち、極端な状況では命令に背く。RimWorld の Tynan Sylvester は、procedural generation から物語を待つのではなく、物語を生成するために system を選ぶ。AI Storyteller は wealth や遭遇した danger を監視する story watcher と、その状態へ cargo drop、disease、raid などを返す incident generator を組み合わせ、上昇と下降を持つ pacing curve を作る。

同時に Sylvester は、colony sim 固有の危険を “drowning in your own complexity” と表現する。新 mechanic が player の学習や注意を要求するなら、任意化する、限定状況だけで使う、段階的に導入する、のいずれかへ再設計する。Maia の Simon Roth は、colonist に約50の need を持たせても、それが player に伝わらなければ深さとして知覚されないと述べる。明瞭な hunger、anger、fatigue は animation で示し、微妙な心理状態や問題提起は colonist からの email と選択肢で直接伝える。記事は、simulation の詳細量そのものより、player が状態を読み、関与し、出来事を物語として受け取れる伝達経路が必要だとまとめている。

## why_relevant_to_games

多数の自律 entity と連鎖 system を持つゲームで、player agency、director 型 pacing、complexity budget、内部状態の可視化を同じ設計問題として扱う際の参照になる。
