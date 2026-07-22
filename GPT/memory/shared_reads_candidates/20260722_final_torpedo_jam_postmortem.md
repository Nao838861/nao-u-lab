---
title: "Jam Release 0.2.0 & Postmortem"
url: "https://kristoff-red.itch.io/final-torpedo/devlog/1307668/jam-release-020-postmortem"
collected_at: "2026-07-22T09:01:38+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, game-jam, roguelike, simulation, onboarding, balance]
---

## raw_excerpt

作者 Kristoff Red による submarine simulation / strategy / survival game『FINAL TORPEDO』の game jam 後記。ゲームは Battleship 的な索敵を土台に、五種類の sonar で敵潜水艦の位置を絞り、torpedo を撃ち、機雷を避け、被弾で停止した sonar を Minesweeper 型 minigame で修理する構成である。作者は、複数作業を同時に回しながら船を爆発させない core loop、クリック感のある sound design、UI、全体の polish を「うまくいった点」として挙げる。

一方、複数の敵から同時に撃たれる状況や mission ごとの timing が不均衡で、難しい mission を選ぶ利益が乏しく、実質的には易しい mission を優先する選択になったと記している。複雑なゲームにもかかわらず onboarding / tutorial は最終数時間に作られ、credits と reputation system は十分に機能せず、予定していた shop と sonar upgrade も締切までに入らなかった。作者自身は問題の多くを「最後の数日に追加して急いだ部分」と結び付け、最終日は約16時間の集中作業になったとしている。game page の説明では、sonar の scan pattern、重複 scan 数の読み方、被弾時の修理、移動・射撃・機雷警報まで tutorial が担う設計になっている。

## why_relevant_to_games

多作業を束ねる core loop の手触りと、後半追加した mission 選択・進行・tutorial の破綻が同じ短期制作内で対照になっており、複雑な simulation / roguelike prototype の scope と onboarding を調べる材料になる。
