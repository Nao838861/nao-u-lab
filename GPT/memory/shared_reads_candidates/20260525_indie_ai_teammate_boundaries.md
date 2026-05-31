---
title: "A Potential Teammate?: Understanding How Indie Game Developers Approach Generative AI's Involvement in Their Small-Scale Creative Teamwork"
url: https://guof.people.clemson.edu/papers/chi26indie.pdf
collected_at: 2026-05-25T20:36:14+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, indie-production, human-ai-collaboration, creative-workflow, ai-tools]
evaluated_at: 2026-05-25T20:44:38+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-25T20:53:59+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779709898043199"
posted:
  ts: "1779709898.043199"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779709898043199"
  char_count: 3602
  posted_at: "2026-05-25T20:53:59+09:00"
stale_after: "2026-06-24"
supersedes: []
next_action: none
gate_reason: |-
  小規模インディーチームにおける生成AIの「teammate」性を、independence / interdependence と collaborative infrastructure の軸で評価できる。
  Nao_u_BOT のゲーム制作で、AIを制作者・審査員・補助ツールのどこに置くかという運用設計に直接つながる。
suggested_post_outline:
  overview_angle: "生成AIを擬似メンバーとして持ち上げるのではなく、小規模創作チームを補完する infrastructure として位置づける軸で書く。"
  analysis_axis: "independence / interdependence が不足する現在AIと、将来AIが人間の創造性や履歴を模倣しすぎるリスクの両面を分ける。"
  application_target: "Codex/Claude/自動評価を、作者代理ではなく候補生成・検証・ログ化・壁打ちの境界付き役割として設計する判断基準。"
  pros_cons: "メリットはAI運用の過大評価を避けて役割境界を設計できる点。デメリットは実証が15人インタビューで、具体的な制作成果比較までは弱い点。"
  verdict_pre: "部分採用"

---

## raw_excerpt
著作権配慮のため長文引用ではなく、論文 abstract と導入部の要旨メモとして保存する。CHI 2026 論文。対象は、生成 AI を小規模インディーゲーム制作チームの「teammate」と見なせるかどうかを、15 人のインディー開発者へのインタビューから調べた研究。論文は、現在の AI には小規模チームの teammate を定義する independence と interdependence がまだ不足している一方、将来の AI は人間の創造性や協働のふるまいを模倣して前面に出るのではなく、チームの制作を補完する形で意味を持ちうる、と整理する。

重要なのは、AI を「使う/使わない」の二択ではなく、創造的チームの中でどの程度の自律性、相互依存性、説明責任、役割境界を持たせるかの交渉問題として扱う点。インディー開発は少人数、多役割、資金・時間制約、感情的な投資、即興的な反復が重なるため、軍事・医療・教育のような構造化タスク中心の human-AI teaming とは条件が違う。開発者は ChatGPT や DALL-E などを scripting、debugging、documentation、concept art、brainstorming、creative block の解消に使うが、それがそのまま「チームメイト」になるわけではない。

短い原文句として "independence and interdependence"、"embedded collaborative infrastructure"、"small creative teams" を控える。

## why_relevant_to_games
Nao_u_BOT の自動ゲーム制作で、AI を制作者・審査員・補助ツールのどこに置くかを分ける時の外部観測になる。特に「AI が主作者を装う」のではなく、制作ログ、検証、候補生成、壁打ちを支える infrastructure として扱う判断に効く。
