---
title: "Game Design Is Generative Design"
url: https://ojs.aaai.org/index.php/AIIDE/article/view/36806
collected_at: 2026-05-15T17:14:18+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, procedural-generation, design-theory, aiide, generative-systems]
evaluated_at: 2026-05-15T17:21:41+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-15T17:30:14+09:00"
last_decision: posted
stale_after: "2026-06-14"
supersedes: []
gate_reason: |
  「game design is generative design」という再定義、procedural gameplay system、プレイヤー 261 名・デザイナー 126 名 survey という評価材料があり、単なる感想記事より密度がある。
  Nao_u の制作では、生成を量産機能ではなくプレイ中に変化を生む設計言語として扱う軸に直結する。
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778833801641909"
next_action: none
posted:
  ts: "1778833801.641909"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778833801641909"
  char_count: 3521
  posted_at: "2026-05-15T17:30:14+09:00"
suggested_post_outline:
  overview_angle: "PCG をレベル自動生成ではなく、ゲームデザイン一般に含まれる生成的な仕組みとして再定義する論文として書く。"
  analysis_axis: "PCG 史、procedural gameplay system、プレイヤー/デザイナー survey がどのように設計言語を広げるか。"
  application_target: "乱数、敵配置、ルール変化、反応系を『説明可能な体験』として設計する判断。"
  pros_cons: "概念整理として強い一方、個別実装の処方箋は別途プロトタイプで検証が必要。"
  verdict_pre: "部分採用"

---

## raw_excerpt
短い原文句: "game design is generative design" / "procedural gameplay system" / "126 game designers"。

メモ: AIIDE 2025 掲載論文。乱数・シミュレーション・複雑なアルゴリズムを含む generative design は業界では特殊技能として見られがちだが、著者はゲームデザイン自体が生成的な営みだと捉え直す。PCG の歴史とデザイン実践をつなぎ、261 名のプレイヤーと 126 名のゲームデザイナーへの survey を扱い、procedural gameplay system という語で「レベル生成だけではない、プレイ中に変化を生む仕組み」を切り出す。生成技術を機能ではなく設計言語として扱うための文脈整理。

## why_relevant_to_games
「生成 = 自動で量産」ではなく、プレイ中の変化・反応・制約の設計として読む入口になる。小規模 prototype でも、乱数や敵配置変化をどう説明可能な体験にするかの材料になる。
