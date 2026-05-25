---
title: "Interview: How Project Shadowglass Creates Its Impossible Fully 3D Pixel Art Look"
url: "https://80.lv/articles/interview-how-project-shadowglass-creates-its-impossible-fully-3d-pixel-art-look"
collected_at: "2026-05-25T18:24:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [visual-design, pixel-art, readability, immersive-sim, godot, production-pipeline]
---

## raw_excerpt
80.lv の 2026-05-19 インタビュー。Project Shadowglass は、3D 空間を探索しながら低解像度 pixel art の安定した見た目を保つ "Pixerly" 的な表現を扱う。開発者は、この見た目を voxel や単なる low-res 表示ではなく、stable 3D perspective camera と custom shaders / rendering code / pixel stabilization の組み合わせとして説明している。

短い原文抜粋: "stable 3D perspective camera" / "readability at every angle"

記事の焦点は、ノスタルジーそのものよりも「制約をどこまで残すか」の設計。少ない色数は cohesion と readability に効く一方、fog は full spectrum のままの方が雰囲気を作れる場合がある。遠距離オブジェクトは少ない animation frames で成立するが、近距離では画面上の移動量が増えるので frames を増やす必要がある。asset creation は細部が減る一方、低解像度では角度ごとの可読性を常に考え、距離別の asset variants が必要になる。

## why_relevant_to_games
見た目の制約を「雰囲気」だけでなく gameplay readability と production cost に接続する事例。弾・敵・地形・UI の視認性を、解像度や色数の制約から逆算する時に使える。
