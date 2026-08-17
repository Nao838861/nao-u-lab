---
title: "Game Design Deep Dive: The Functions of Transistor"
url: "https://www.gamedeveloper.com/design/game-design-deep-dive-the-functions-of-i-transistor-i-"
collected_at: "2026-08-17T11:31:48+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, systems-design, action-rpg, abilities, experimentation, postmortem]
---

## raw_excerpt

Supergiant Games の Amir Rao が、『Transistor』の Function ability system が collectible card game 的な初期案からどう変わったかを説明した一次記事。初期目標は、player が同じ skill に固定されないよう、ability / upgrade / passive を deck に入れ、level ごとに shuffle して局所的な power curve を作ることだった。しかし線形 narrative の旅では、level ごとに能力を失い shuffle し直す理由が不自然で、difficulty も毎回 reset されるため、物語上高まる stakes と衝突した。team は気に入っていた randomness を残すために game 全体の構造を変えるのではなく、この案を退けた。

最終系では、health が尽きるたびに action bar 内で価値の高い Function が encounter 中だけ使用不能になる「slow death」を採用した。即 checkpoint に戻さず最大三段階まで継続でき、頼っていた構成が一時的に崩れるため別の Function 組合せを試す契機になる。もう一つの変更は、power、upgrade、passive を16個の Functionへ統合したこと。各 Function はactive slotで能力として使えるだけでなく、別 Function へ装着してupgradeにしたり、限られたpassive slotへ置いたりできる。同じ16 conceptのpair / trioから多数の構成が生まれる一方、通常のRPGのようにお気に入りをlevel 99へ育てる縦成長は持たない。新しい組合せの使用でbackstoryを開示し、慣れた構成を好むplayerを罰せず、system探索に物語報酬を重ねている。

## why_relevant_to_games

「同じ戦法への固定」を禁止やrandomnessで壊すのではなく、部品の多用途化、一時的な損失、物語報酬で横方向の実験へ誘導した設計資料。少数mechanicから組合せ空間を作るprototypeや、失敗を即resetにせず戦術変更へ変える設計に使える。
