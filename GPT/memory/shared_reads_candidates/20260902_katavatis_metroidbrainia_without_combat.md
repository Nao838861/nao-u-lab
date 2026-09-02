---
title: "Designing a Metroidbrainia Without Combat"
url: "https://saffroncr.itch.io/katavatis/devlog/1638428/designing-a-metroidbrainia-without-combat"
collected_at: "2026-09-02T11:04:44+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, metroidbrainia, exploration, puzzle-platformer, playdate, prototyping]
evaluated_at: "2026-09-02T11:08:26+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-09-02T11:08:26+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-09-02T11:08:26+09:00"
next_action: post_to_shared_reads
stale_after: "2026-10-02"
supersedes: []
gate_reason: >-
  感情目標を起点に、知識 gate、入力制約、camera assistance、水中移動、4D slice puzzle を
  prototype と playtest で接続する設計過程が具体的で、問題設定・手法・評価・結論を十分に抽出できる。
  探索・puzzle game の制作サイクルへ直接転用でき、CoopEval 水準の長文分析を組み立てられる。
suggested_post_outline:
  overview_angle: "combat を外した Metroid 型探索を、感情目標・知識 gate・制約由来の mechanic で再構成する設計記録"
  analysis_axis: "感情から mechanic へ降ろす分解、platform 制約の設計資源化、未知概念を段階導入する playtest の三軸"
  application_target: "Log_cdx の探索・puzzle prototype で、core loop、camera assistance、知識 gate、tutorial progression を設計・検証する工程"
  pros_cons: "具体的な prototype と観察項目が強み。一方で単一作品の devlog であり、定量評価や失敗案の比較は限定的"
  verdict_pre: "部分採用。設計手順と playtest 観察軸を採用し、個別 mechanic は作品制約に合わせて再検証する"
---

## raw_excerpt

本文を基にした日本語採取メモ。KATAVATIS は、戦闘ではなく探索・実験・知識獲得で進行する first-person underwater metroidbrainia として設計されている。作者は Metroid で惹かれたものを戦闘ではなく、迷うこと、深部へ進むこと、異質な環境を自分で解釈する感覚として捉え直し、進行 gate を鍵や power-up ではなく player knowledge に置いた。物理 index card には mechanic の模倣ではなく、他作品で得た感情と再現したい体験を書き、visual、control、mechanic ごとに prototype を作った。

Playdate は direct camera control を持たないため、32-bit console 世代の FPS と Metroid Prime の camera 技法を調べ、jump 軌道の途中で camera を下向きへ回す処理と edge assistance を組み合わせた。水中では歩行・jump controller と swim・dive controller を分け、切替時に方向感覚を失わず、説明なしで水から出られることを playtest した。level は横方向より縦方向を重視し、roadblock の解法を feedback 最小で発見させる案を反復している。

さらに Playdate の crank を必須 gimmick として後付けせず、物語と gameplay の核に接続するため 4D laboratory を導入した。crank で 4D world の 3D slice を操作し、4D object の回転・移動が現在の slice 内の形を変える。数学の授業にせず Portal のような直感的な physics puzzle にするため、単純な rule から complexity を積み上げ、どの概念が即座に理解され、どこで学習が止まるかを playtest で観察して progression を組み立てている。

## why_relevant_to_games

既存 genre から combat を外した時に、感情目標、知識 gate、制約のある入力 device、空間 puzzle を prototype と playtest でどう接続するかを追える。探索・puzzle game の core loop、camera assistance、未知概念の段階導入を設計する場面に参照できる。
