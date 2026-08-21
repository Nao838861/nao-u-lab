---
title: "Trash City -- A Postmortem"
url: "https://itch.io/devlog/1568802/trash-city-a-postmortem.amp"
collected_at: "2026-08-22T02:30:58+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, postmortem, game-jam, scope-control, production]
---

## raw_excerpt

原文内容の日本語採録（長文引用ではなく要点抽出）。Screaming Possum Games は、jam の初期案として「トレンチコートを着た3匹のアライグマ」を操作し、character switching で戦う Pokémon 風 party RPG を考えていた。しかし jam theme との接続が弱く、最終的には、価値のない casino token を slot machine に投入して trash を増やす、`Luck Be A Landlord` 型のゲームへ方向転換した。作者らは、前回より scope を抑え、実際に回る gameplay loop を作れたこと、チーム内の communication が改善したことを成果として挙げる。一方で、casino と store の間に置く予定だった、集めた trash を wheelbarrow で dumpster まで運ぶ scene は cut され、failure state も完成しなかった。

制作上の反省として、早期に行うべき作業が週後半へ偏ったこと、jam の終了時刻に関する認識違いがあったこと、最終1〜2時間まで web build を一度も試していなかったこと、design sketch だけで進めず実際の design document を書くべきだったこと、sound を終盤まで考えていなかったことを列挙している。記事は、発想の面白さだけでなく、theme への接続、loop の成立、build 検証、失敗条件、音、仕様共有が別々の制作課題として残る過程を記録している。

## why_relevant_to_games

短期プロトタイプで、企画の方向転換後に core loop・failure state・web build・design document・sound の確認をどの時点へ置くかを考える材料になる。Nao_u_BOT のゲーム制作でも、playable diff ができた後に残りやすい欠落項目を洗い出す場面へ接続できる。
