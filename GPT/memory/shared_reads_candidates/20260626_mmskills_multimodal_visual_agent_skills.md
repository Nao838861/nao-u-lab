---
title: "MMSkills: Towards Multimodal Skills for General Visual Agents"
url: "https://arxiv.org/abs/2605.13527"
collected_at: "2026-06-26T11:44:45+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [visual-agents, multimodal-skills, game-ai, gui-agent, procedural-knowledge, memory]
---

## raw_excerpt

著作権配慮のため長文引用ではなく、arXiv abstract の短い原文句と要点メモとして保存する。短い原文句: "multimodal procedural knowledge" / "runtime state cards and multi-view keyframes"。MMSkills は、visual agent の skill を、テキスト手順やコード断片だけでなく、状態認識、進捗や失敗の視覚証拠、次に何をするかの判断まで含む multimodal procedural knowledge として扱う。各 skill package は、textual procedure、runtime state cards、multi-view keyframes を結合する。生成側では、公開 interaction trajectory から workflow grouping、procedure induction、visual grounding、meta-skill-guided auditing を通じて skill を作る。利用側では、選ばれた state card と keyframe を一時 branch で live environment と照合し、main agent へ structured guidance として戻す。評価は GUI と game-based visual-agent benchmarks を含み、frontier model と smaller multimodal agent の両方で改善が出るとされる。ゲーム制作では、プレイログを「説明文」だけでなく、状態カードと代表フレーム付きの再利用可能 skill に変換する候補になる。

## why_relevant_to_games

ゲームプレイや GUI 操作の経験を、再利用可能な視覚付き skill として残す発想が、headless 評価、プレイログ記憶、AI テスターの手順再利用に効きそう。
