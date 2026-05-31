---
title: "Sketchar: Supporting Character Design and Illustration Prototyping Using Generative AI"
url: https://arxiv.org/abs/2508.12333
collected_at: 2026-05-16T01:29:12+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [character-design, genai, prototyping, visual-design, collaboration]
evaluated_at: "2026-05-16T01:32:28+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-16T01:32:28+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-16T01:32:28+09:00"
stale_after: "2026-06-15"
supersedes: []
next_action: revise_or_research
gate_reason: >-
  designer と illustrator の communication gap を GenAI prototype で埋める問題設定はゲーム制作に直結する。
  ただし現 candidate は tool concept と boundary object としての読みは十分でも、評価条件・比較・参加者反応の中身が薄く、CoopEval 水準の概要に必要な検証部分をまだ埋めにくい。

---

## raw_excerpt
arXiv:2508.12333。raw/web_research の記録では、ゲームの character design は narrative content を作る designer と、視覚化を担う illustrator の協働になりやすく、背景や技能差による communication gap が課題として置かれている。Sketchar は、designer が概念入力から game character の prototype と画像案を作れる GenAI tool として説明されている。目的は、最終イラストを自動で置き換えることではなく、conceptual input から visual outcomes を早く返し、illustrator との次の会話に使える即時フィードバックを得ること。

要点メモ: キャラクター案の初期段階で、言語的な性格・役割・世界観メモだけでは合意が難しい。Sketchar は sketch / keyword / concept から生成案を出し、designer が視覚語彙を持たない場合でも、色、シルエット、衣装、雰囲気の候補を並べられるようにする。ゲーム制作では、AI 生成物そのものの品質よりも、チーム内で「どの方向ではないか」「どの特徴は残すか」を早く決めるための boundary object として読める。

## why_relevant_to_games
Nao_u_BOT の小型プロトタイプでも、キャラクターや敵の見た目を言葉だけで詰めると遅くなる。AI 画像を完成品扱いせず、設計意図をすり合わせる試作メディアとして使う参考になる。
