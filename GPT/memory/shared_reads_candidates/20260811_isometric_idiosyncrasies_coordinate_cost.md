---
title: "Postmortem - Isometric Idiosyncrasies"
url: "https://itch.io/devlog/1495125/postmortem-isometric-idiosyncrasies.amp"
collected_at: "2026-08-11T00:33:22+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-dev, postmortem, isometric, movement, rendering]
---

## raw_excerpt

isometric shooter『World War II Wings』で、perspective の選択が art 以外へ波及した postmortem。作者は top-down / side-view より少し難しい程度と想定したが、plane の shading と angle、進行方向ごとの banking sprite、enemy placement、group movement、spawn / despawn の全てで追加作業が生じたと記す。特に movement は X / Y と Xspeed / Yspeed の対称性が崩れると drift が発生し、編隊全体が同期していないように見えるため、enemy ごとの微調整と再確認が増えた。

画面外から enemy や長い cloud sprite を入れて消す処理も、一軸の threshold では足りない。diagonal plane の両側、sprite size、origin からの offset、負の座標を同時に見て、X が適切でも Y が不足すれば外側の play-space model 自体を広げ直す必要があった。modern hardware では coordinate check 一つの負荷は小さいが、作者は人間側の spatial reasoning と調整疲労が制作時間を押し上げる点を強調する。対策として movement、spawn in/out、速度、background を早期に固定し、小さな sprite を使い、screen と reference coordinate を紙に可視化する案を挙げている。

## why_relevant_to_games

視点表現の選択を art cost だけで見積もらず、移動、編隊、camera 外判定、調整時の認知負荷まで含む prototype risk として検証する材料になる。
