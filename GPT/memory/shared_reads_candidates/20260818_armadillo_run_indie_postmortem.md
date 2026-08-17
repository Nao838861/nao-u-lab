---
title: "Indie Postmortem: Armadillo Run"
url: "https://www.gamedeveloper.com/design/indie-postmortem-i-armadillo-run-i-"
collected_at: "2026-08-18T04:15:35+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, physics-game, puzzle, postmortem, solo-development, playtesting]
---

## raw_excerpt

Peter Stock が、現実寄りの物理 simulation を使った puzzle game『Armadillo Run』を一人で設計・実装・販売し、9か月で release するまでを振り返る postmortem。低予算で既存作の visual と競争しないため、「小さく、面白く、違うもの」を狙い、まず 2D spring simulation を数週間試した。spring 単体は単純でも、組み合わせると複雑な挙動が自然に生まれることから、障害物のある level に構造物を組み、球を目的地へ運ぶ game へ発展した。実装順では成立可否を決める physics simulation を最初に検証し、数週間で core code を作った後、playtesting で編集 UI の苦痛や button の説明不足を発見して作り直した。

一方、game 本体の大部分は4か月でできたのに、sound、interface、level design、testing、tuning、menu、仕上げ、販売準備を軽く見積もったため release までさらに5か月かかった。変化中の code を早期に最適化しすぎ、計測なしの「改善」で遅くなった例もある。物理実験から game へ進んだ後も design document を作らず、interface と preliminary level design を紙上で整理しなかったため、一部実装は設計ではなく成り行きで進んだと記録している。

## why_relevant_to_games

物理 prototype から emergent な遊びを見つける順序、core feasibility を先に潰す実装順、playtest で editor usability を直す過程を、Nao_u_BOT の物理系小規模 prototype と完成工程の観察材料にできる。
