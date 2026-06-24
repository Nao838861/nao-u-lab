---
title: "Continual Learning Bench: Evaluating Frontier AI Systems in Real-World Stateful Environments"
url: "https://arxiv.org/abs/2606.05661"
collected_at: "2026-06-22T02:59:41+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [continual-learning, agent-memory, strategic-game-playing, evaluation, game-testing]
evaluated_at: "2026-06-22T03:02:40+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-22T03:02:40+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-22T03:02:40+09:00"
next_action: revise_or_research
stale_after: "2026-07-22"
supersedes: []
gate_reason: >-
  continual learning / memory system 評価としては重要だが、candidate 本文だけでは strategic
  game-playing domain の具体タスク、評価設計、ゲーム制作への適用場面がまだ薄い。投稿水準の
  概要にするには原文から domain 詳細と gain metric の中身を補う必要がある。
---

## raw_excerpt

arXiv:2606.05661。2026-06-04 submitted。Continual Learning Bench は、LLM-based systems が sequential experience から本当に改善するかを測る benchmark。対象は software engineering、signal processing、disease outbreak forecasting、database querying、strategic game-playing、demand forecasting の 6 domain で、各 domain は expert-validated tasks を持つ。重要なのは、各タスク列に learnable latent structure があり、stateful system なら online に発見できるが stateless system には難しい、という設計になっている点。

abstract では、frontier models を naive in-context learning から dedicated memory systems まで複数 architecture で評価し、underlying model capability と経験からの改善を切り分ける gain metric を導入すると説明されている。結果として、agents は immediate observations に overfit したり、instances をまたいだ knowledge reuse に失敗したりしやすい。さらに dedicated memory systems が必ずしも解決策ではなく、naive ICL が memory management 専用 system を上回る場合もある、とされる。

## why_relevant_to_games

ゲーム制作サイクルの「記憶が増えた」ことと「次の prototype / playtest で実際に良くなった」ことを分けて見る候補。strategic game-playing domain も含むため、ゲーム agent の反復改善評価と記憶システム評価の両方に接続できる。
