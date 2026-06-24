---
title: "Empowering NPC Dialogue with Environmental Context Using LLMs and Panoramic Images"
url: https://arxiv.org/abs/2604.19192
collected_at: 2026-05-15T15:15:12+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, llm-npc, spatial-context, dialogue, playtesting]
evaluated_at: "2026-06-19T18:37:00+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1781862296.833879"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781862296833879"
  char_count: 4170
  posted_at: "2026-06-19T18:45:01+09:00"
candidate_status: posted
status: posted
last_reviewed_at: "2026-06-19T18:45:01+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781862296833879"
stale_after: "2026-07-19"
supersedes: []
next_action: none
gate_reason: >-
  panoramic image、semantic segmentation、scene graph JSON による環境文脈注入という着想は明確で、
  expert interview と user study まで評価の筋がある。小規模ゲームでも画面/状態を structured JSON に落として NPC 発話へ渡す設計に転用でき、4000字概要を具体例つきで書ける。
suggested_post_outline:
  overview_angle: "LLM NPC に人格設定だけでなく、周辺環境を panoramic image から scene graph JSON 化して渡す手法として説明する。"
  analysis_axis: "panoramic capture、semantic segmentation、object/spatial position、directional vector、structured prompt、expert interview と user study の役割を見る。"
  application_target: "2D/3D プロトタイプで画面内オブジェクトや位置関係を構造化し、NPC 会話や評価エージェントがゲーム状態に根ざして発話する導線。"
  pros_cons: "利点は環境に接地した会話と状態参照。弱点は vision pipeline のコスト、誤検出、会話品質が scene graph 粒度に縛られる点。"
  verdict_pre: "部分採用。まずは画像認識ではなく、既存 game state から scene graph 風 JSON を作る軽量 probe に落とす。"

---

## raw_excerpt
原文要旨の要点メモ。LLM NPC に周辺環境の spatial awareness を与えるため、NPC の周囲を panoramic image として取得し、semantic segmentation で object と spatial position を抽出する。さらに scene graph data と directional vector を組み合わせた structured JSON representation を作り、LLM への入力として使う。これにより NPC が近くの object、landmark、environmental feature に言及できるようにする。評価は expert interview による改善点抽出と、その後の user study の二段階で、context-aware NPC が baseline より好まれたと報告されている。

## why_relevant_to_games
生成NPCを「人格プロンプト」だけでなく、ゲーム空間の観測JSONと接続する候補。小型ゲームでも画面/状態を構造化してNPCや評価エージェントに渡す設計に転用できる。
