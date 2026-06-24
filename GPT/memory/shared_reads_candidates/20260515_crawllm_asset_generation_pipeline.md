---
title: "CrawLLM: An LLM-Based Pipeline for Game Asset Generation"
url: "https://antoniosliapis.com/projects/project_crawllm.php"
collected_at: "2026-05-15T23:29:36+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [pcg, asset-generation, llm, image-generation, game-production]
evaluated_at: "2026-06-20T17:10:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781942244.007979"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781942244007979"
  char_count: 4269
  posted_at: "2026-06-20T16:57:29+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-20T16:57:29+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781942244007979"
stale_after: "2026-07-20"
supersedes: []
next_action: none
gate_reason: |
  fixed template、人間作成カード、LLM、SDXL を分業させる top-down asset generation として、問題設定、手法、評価結果、限界が候補本文から抽出できる。
  小型ゲームの reskin / variant 量産で「AI に全設計を任せず、人間の構造を足場に素材を連動生成する」適用が明確なため Phase 3 候補に上げる。
suggested_post_outline:
  overview_angle: "複数ドメイン素材を cohesive に揃える難しさを、人間の seed と固定 template を残した LLM/diffusion pipeline で扱う話として書く。"
  analysis_axis: "PCG の自由生成ではなく、cards/level/textures/enemies/backstory を top-down に制御する scaffold と user study の意味を軸にする。"
  application_target: "Nao_u_BOT の小型プロトタイプで、既存メカニクスを壊さず theme/text/visual variant を増やす制作補助に接続する。"
  pros_cons: "利点は cohesive variant 生成と人間設計の保持。弱点は visual style の再現が semantic theme より弱い点と、template 外への拡張に注意が要る点。"
  verdict_pre: "部分採用"

---

## raw_excerpt

IEEE Transactions on Games 2026 Early Access の関連 project page。CrawLLM は card-based combat を持つ dungeon crawler で、cards, level, textures, enemies, backstory などの content を top-down に生成する。LLM は Mixtral 8x7B、画像側は Stable Diffusion XL を用い、既存の game design、進行構造、デザイナーが事前に作った cards を足場にして generation を guide / control する。論文要旨では、PCG は複数 domain にまたがる cohesive content の生成が難しく、LLM を semantic scaffold として narrative / visual / gameplay content を coherent に生成する pipeline として扱う。user study では生成ゲーム snapshot の underlying semantic themes は多くの場合 discernible だったが、intended visual styles は相対的に弱かったとされる。

## why_relevant_to_games

ゲームの全設計を AI に任せるのではなく、固定 template と人間の事前設計を残したまま、テーマ・テキスト・画像素材を連動生成する候補。小型ゲームの reskin / variant 量産に使える。
