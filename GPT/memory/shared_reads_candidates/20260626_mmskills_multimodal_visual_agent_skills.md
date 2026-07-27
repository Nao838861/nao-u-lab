---
title: "MMSkills: Towards Multimodal Skills for General Visual Agents"
url: "https://arxiv.org/abs/2605.13527"
collected_at: "2026-06-26T11:44:45+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [visual-agents, multimodal-skills, game-ai, gui-agent, procedural-knowledge, memory]
evaluated_at: "2026-07-28T01:22:09+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-28T01:22:09+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-07-28T01:22:09+09:00"
next_action: revise_or_research
stale_after: "2026-08-27"
supersedes: []
gate_reason: |-
  textual procedure / runtime state cards / multi-view keyframes を組み合わせて visual agent skill を再利用する着想は、ゲーム操作ログや GUI テストの手順化に強く接続できる。
  ただし今回の再評価でも benchmark 別の改善幅、失敗例、skill 生成と監査の限界が不足し、CoopEval 水準の ~4000 字概要に必要な根拠を満たさないため保留する。
---

## raw_excerpt

著作権配慮のため長文引用ではなく、arXiv abstract の短い原文句と要点メモとして保存する。短い原文句: "multimodal procedural knowledge" / "runtime state cards and multi-view keyframes"。MMSkills は、visual agent の skill を、テキスト手順やコード断片だけでなく、状態認識、進捗や失敗の視覚証拠、次に何をするかの判断まで含む multimodal procedural knowledge として扱う。各 skill package は、textual procedure、runtime state cards、multi-view keyframes を結合する。生成側では、公開 interaction trajectory から workflow grouping、procedure induction、visual grounding、meta-skill-guided auditing を通じて skill を作る。利用側では、選ばれた state card と keyframe を一時 branch で live environment と照合し、main agent へ structured guidance として戻す。評価は GUI と game-based visual-agent benchmarks を含み、frontier model と smaller multimodal agent の両方で改善が出るとされる。ゲーム制作では、プレイログを「説明文」だけでなく、状態カードと代表フレーム付きの再利用可能 skill に変換する候補になる。

## why_relevant_to_games

ゲームプレイや GUI 操作の経験を、再利用可能な視覚付き skill として残す発想が、headless 評価、プレイログ記憶、AI テスターの手順再利用に効きそう。
