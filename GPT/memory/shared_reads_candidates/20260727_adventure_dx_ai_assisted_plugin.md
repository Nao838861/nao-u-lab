---
title: "The Making of the Adventure Scene DX Plugin"
url: "https://gumpyfunction.itch.io/adventure-dx-plugin/devlog/1520917/the-making-of-the-adventure-scene-dx-plugin"
collected_at: "2026-07-27T18:46:13+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-development, ai-assisted-coding, gb-studio, plugin, playtesting, skills]
---

## raw_excerpt

記事内容の収集時要約。作者は GB Studio 4.2 の Adventure scene を拡張し、8方向移動、斜め向き animation、斜め projectile、isometric movement などを備える engine plugin を Claude と制作した。着手前に GB Studio docs、develop branch、GBDK 2020 docs、既存 plugin 二種を local の Resources folder へ集め、AI が推測ではなく実際の C source と schema を参照できるようにした。実装は v0.1 から一機能ずつ build・ROM test・debug を行った。Game Boy の integer pixel rendering では斜め速度の 0.75 倍正規化が 0/1 pixel の交互描画になり stutter を生むため、plugin は滑らかだが斜めが約41%速い設定、速度を揃える代わりに揺れる vanilla 設定、中間設定を利用者へ提示した。途中で 8×16 から 8×8 sprite mode へ移す手作業が発生し、作者は `.gbsres` を一括変換する Python tool を別途作成した。終盤には PROJECT.md と実 project file から、plugin creator、`.gbsres` editor、event reference の三つの SKILL を抽出し、既存 SKILL の昇格基準も実作業との不一致を受けて更新した。公開前には外部 tester が animation state、shooting、dialogue layer などを検証し、vanilla GB Studio 側の不具合報告にもつながった。

## why_relevant_to_games

制約の強い実機向け plugin を AI と作る際の、一次資料の固定、機能単位の ROM test、実装中の反復作業を補助 tool と SKILL へ戻す工程の事例として、ゲーム制作 workflow の検討に使える。
