---
title: "Alien Pinball Postmortem - How I made a full physics pinball game with AI tools"
url: "https://itch.io/devlog/1517147/alien-pinball-postmortem-how-i-made-a-full-physics-pinball-game-with-ai-tools.amp"
collected_at: "2026-07-23T04:46:03.9606751+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, postmortem, ai-coding, physics-game, tooling]
---

## raw_excerpt

作者は、multiball、skill shot、combo、outlane save、3球を扱う boss mode を備えた browser 向け physics pinball を、Claude Code、ChatGPT image generation、Suno、ZzFX、LittleJS + Box2D WASM の組み合わせで制作した。入力の約半分は音声で codebase に話しかけ、残りは typing と手作業の code 編集だったという。Claude は game logic と pinball 部品に加え、盤面上で部品を drag・配置・調整できる in-game table editor も実装した。

画像生成では、壁・ramp・bumper・target の正確な位置を示す collision geometry の silhouette を書き出し、それを画像生成の入力にした。作者はこれを「the physics is the prompt」と表現しており、複数生成物の manual compositing も併用した。AI debug player は完成度こそ低いが、自動で flipper を動かす様子を眺めながら発想を得る用途に使えた。一方、restitution、flipper torque、ramp curvature、bounce などの feel は人間が細かく反復調整した。最後の一週間も sound、angle、message priority、race condition といった小さいが省略できない polish に費やされた。

## why_relevant_to_games

physics と visual asset を silhouette で接続する制作手法、観察用 bot、genre 知識の補助、最終的な feel 調整を分けた AI 協働例として、短期 prototype の工程設計に参照できる。
