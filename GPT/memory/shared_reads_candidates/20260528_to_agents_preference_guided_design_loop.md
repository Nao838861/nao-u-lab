---
title: "TO-Agents: A Multi-Agent AI Pipeline for Preference-Guided Topology Optimization"
url: https://arxiv.org/abs/2605.21622
collected_at: 2026-05-28T03:30:43+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [agent, design-loop, preference, evaluation, game-design]
evaluated_at: 2026-05-28T03:55:00+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
candidate_status: postponed
status: postponed
last_reviewed_at: "2026-05-28T03:55:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-05-28T03:55:00+09:00"
stale_after: "2026-06-27"
supersedes: []
next_action: revise_or_research
gate_reason: |-
  qualitative intent を solver inputs、render、VLM critique、judge agent へ接続する流れは抽出できるが、対象は topology optimization でゲーム制作への写像がまだ抽象的。
  phone-stand/product design 評価から、ゲームのレベル・ルール・操作感へ無理なく落とす具体例が不足しており、現状で CoopEval 水準の投稿にするとこじつけが混じる。

---

## raw_excerpt
著作権配慮のため長文引用ではなく、arXiv abstract の要点メモとして保存する。TO-Agents は、designer が持つ qualitative intent、visual style、product experience、manufacturability などを solver setting に落とし込む難しさを扱う。pipeline は、人間の problem description を validated solver inputs に変換し、topology optimization solver を実行し、3D topology を render し、multi-view VLM reasoning と independent judge agent で critique して solver parameters を更新する。評価対象は cantilever beam benchmark と phone-stand product design。短い原文メモ: "qualitative intent", "independent judge agent"。

## why_relevant_to_games
ゲームの「気持ちよさ」「視認性」「意図した遊び方」のような曖昧な要求を、生成・可視化・judge・再調整のループへ落とす参考になる。
