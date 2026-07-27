---
title: "In the process of updating all games. Exhibition versions too."
url: "https://itch.io/blog/1580761/in-the-process-of-updating-all-games-exhibition-versions-too.amp"
collected_at: "2026-07-28T07:32:46.4295719+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-development, exhibition-build, qa, state-management, performance]
---

## raw_excerpt

作者は Unity の security issue 対応に伴って過去作を更新すると同時に、展示会場向け build を用意している。展示版では、来場者が連続して短時間ずつ遊ぶ運用に合わせ、game の開始と終了を通常版から少し変える必要がある。しかし、もともとの作品は一回の playthrough 後に desktop へ終了する前提で作られており、process を落とさず game だけを再起動する状況は設計対象に含まれていなかった。

実際に連続再起動を試すと、前回 play の state が次の play に残る、restart のたびに performance が悪化する、player が一定時間何もしないことで将来の state transition が壊れる、といった問題が現れた。各回ごとに desktop から game を起動し直せば回避できるが、展示体験として見栄えが悪いため、作者は process 内で安全に初期状態へ戻す難しい経路を選んでいる。現時点で展示予定が確定しているわけではないが、将来の出展時に慌てないよう先に適応を進めている。

原文の短い記述: “lingering states from previous plays to carry over.”

## why_relevant_to_games

通常の「起動して一度遊び、終了する」test では見えない state reset、resource cleanup、idle path を、展示会の反復 play という運用条件から洗い出す事例として、prototype の連続実行テスト設計に使える。
