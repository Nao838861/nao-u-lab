---
title: "Alien Pinball Postmortem - How I made a full physics pinball game with AI tools"
url: "https://itch.io/devlog/1517147/alien-pinball-postmortem-how-i-made-a-full-physics-pinball-game-with-ai-tools.amp"
collected_at: "2026-07-23T04:46:03.9606751+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, postmortem, ai-coding, physics-game, tooling]
evaluated_at: "2026-07-23T04:50:15+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1784750272.072049"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784750272072049"
  char_count: 4273
  posted_at: "2026-07-23T04:58:02+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-23T04:58:02+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784750272072049"
next_action: none
stale_after: "2026-08-22"
supersedes: []
gate_reason: >-
  physics 形状を画像生成の制約へ渡す工程、観察用 bot、人手の feel 調整、終盤 polish という役割分離が記事固有の制作手順として具体的である。
  成功談だけでなく AI が代替できなかった調整領域も示され、短期 prototype の工程設計へ接続しつつ約4000字の深い分析を無理なく構成できる。
suggested_post_outline:
  overview_angle: "AI にゲーム全体を委ねた事例ではなく、実行可能な physics を visual production の制約兼プロンプトにした制作 pipeline として解説する"
  analysis_axis: "code・editor・asset・観察 bot・人間の feel 調整を分離し、各工程で AI が増幅した部分と判断を代替できなかった部分を比較する"
  application_target: "Log_cdx の短期 game prototype で collision/debug geometry を先に固定し、画像生成・headless 観察・手動 playtest を同じ制約へ接続する工程"
  pros_cons: "利点は実装と visual の位置ずれ低減、専用 editor による反復速度、bot 観察からの着想。欠点は生成画像の manual compositing、feel の手調整、終盤の race condition や message priority を自動化し切れないこと"
  verdict_pre: "部分採用。physics-first の制約受け渡しと観察用 bot は採用し、最終 feel と polish の判断は人間主導で残す"
---

## raw_excerpt

作者は、multiball、skill shot、combo、outlane save、3球を扱う boss mode を備えた browser 向け physics pinball を、Claude Code、ChatGPT image generation、Suno、ZzFX、LittleJS + Box2D WASM の組み合わせで制作した。入力の約半分は音声で codebase に話しかけ、残りは typing と手作業の code 編集だったという。Claude は game logic と pinball 部品に加え、盤面上で部品を drag・配置・調整できる in-game table editor も実装した。

画像生成では、壁・ramp・bumper・target の正確な位置を示す collision geometry の silhouette を書き出し、それを画像生成の入力にした。作者はこれを「the physics is the prompt」と表現しており、複数生成物の manual compositing も併用した。AI debug player は完成度こそ低いが、自動で flipper を動かす様子を眺めながら発想を得る用途に使えた。一方、restitution、flipper torque、ramp curvature、bounce などの feel は人間が細かく反復調整した。最後の一週間も sound、angle、message priority、race condition といった小さいが省略できない polish に費やされた。

## why_relevant_to_games

physics と visual asset を silhouette で接続する制作手法、観察用 bot、genre 知識の補助、最終的な feel 調整を分けた AI 協働例として、短期 prototype の工程設計に参照できる。
