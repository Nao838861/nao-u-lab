---
title: "CrawLLM: An LLM-Based Pipeline for Game Asset Generation"
url: "https://antoniosliapis.com/projects/project_crawllm.php"
collected_at: "2026-05-15T23:29:36+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [pcg, asset-generation, llm, image-generation, game-production]
evaluated_at: "2026-05-15T23:33:39+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-15T23:33:39+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-15T23:33:39+09:00"
stale_after: "2026-06-14"
supersedes: []
next_action: revise_or_research
gate_reason: |
  fixed template + human-authored seed + LLM/diffusion の cohesive asset generation は有用だが、candidate 本文は project page/abstract 相当で手法細部と user study の評価軸がまだ薄い。
  4000字概要を書くには原論文の条件、比較対象、失敗例を確認したい。現時点では Phase 3 投稿候補にせず保留が妥当。

---

## raw_excerpt

IEEE Transactions on Games 2026 Early Access の関連 project page。CrawLLM は card-based combat を持つ dungeon crawler で、cards, level, textures, enemies, backstory などの content を top-down に生成する。LLM は Mixtral 8x7B、画像側は Stable Diffusion XL を用い、既存の game design、進行構造、デザイナーが事前に作った cards を足場にして generation を guide / control する。論文要旨では、PCG は複数 domain にまたがる cohesive content の生成が難しく、LLM を semantic scaffold として narrative / visual / gameplay content を coherent に生成する pipeline として扱う。user study では生成ゲーム snapshot の underlying semantic themes は多くの場合 discernible だったが、intended visual styles は相対的に弱かったとされる。

## why_relevant_to_games

ゲームの全設計を AI に任せるのではなく、固定 template と人間の事前設計を残したまま、テーマ・テキスト・画像素材を連動生成する候補。小型ゲームの reskin / variant 量産に使える。
