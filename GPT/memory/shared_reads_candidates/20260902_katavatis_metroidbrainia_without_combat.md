---
title: "Designing a Metroidbrainia Without Combat"
url: "https://saffroncr.itch.io/katavatis/devlog/1638428/designing-a-metroidbrainia-without-combat"
collected_at: "2026-09-02T11:04:44+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, metroidbrainia, exploration, puzzle-platformer, playdate, prototyping]
---

## raw_excerpt

本文を基にした日本語採取メモ。KATAVATIS は、戦闘ではなく探索・実験・知識獲得で進行する first-person underwater metroidbrainia として設計されている。作者は Metroid で惹かれたものを戦闘ではなく、迷うこと、深部へ進むこと、異質な環境を自分で解釈する感覚として捉え直し、進行 gate を鍵や power-up ではなく player knowledge に置いた。物理 index card には mechanic の模倣ではなく、他作品で得た感情と再現したい体験を書き、visual、control、mechanic ごとに prototype を作った。

Playdate は direct camera control を持たないため、32-bit console 世代の FPS と Metroid Prime の camera 技法を調べ、jump 軌道の途中で camera を下向きへ回す処理と edge assistance を組み合わせた。水中では歩行・jump controller と swim・dive controller を分け、切替時に方向感覚を失わず、説明なしで水から出られることを playtest した。level は横方向より縦方向を重視し、roadblock の解法を feedback 最小で発見させる案を反復している。

さらに Playdate の crank を必須 gimmick として後付けせず、物語と gameplay の核に接続するため 4D laboratory を導入した。crank で 4D world の 3D slice を操作し、4D object の回転・移動が現在の slice 内の形を変える。数学の授業にせず Portal のような直感的な physics puzzle にするため、単純な rule から complexity を積み上げ、どの概念が即座に理解され、どこで学習が止まるかを playtest で観察して progression を組み立てている。

## why_relevant_to_games

既存 genre から combat を外した時に、感情目標、知識 gate、制約のある入力 device、空間 puzzle を prototype と playtest でどう接続するかを追える。探索・puzzle game の core loop、camera assistance、未知概念の段階導入を設計する場面に参照できる。
