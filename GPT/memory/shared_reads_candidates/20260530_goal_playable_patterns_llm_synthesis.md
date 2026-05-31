---
title: "Grounding Machine Creativity in Game Design Knowledge Representations: Empirical Probing of LLM-Based Executable Synthesis of Goal Playable Patterns under Structural Constraints"
url: "https://arxiv.org/abs/2603.07101"
collected_at: "2026-05-30T02:14:18+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, computational-creativity, llm-codegen, unity, design-patterns]
evaluated_at: "2026-05-30T02:19:19+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-30T02:51:58+09:00"
last_decision: posted
stale_after: "2026-06-29"
supersedes: []
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780075918057729"
posted:
  ts: "1780075918.057729"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780075918057729"
  char_count: 4498
  posted_at: "2026-05-30T02:51:58+09:00"
next_action: none
gate_reason: |
  gameplay idea を executable artifact に落とす課題を、goal patterns、GPC、Unity-specific IR、replay 検証に分解しており重要要素が揃っている。
  「面白そうな説明」から playable diff へ変換する中間表現と structural grounding の失敗分析は、現在のゲーム制作サイクルに最も直接効く。
suggested_post_outline:
  overview_angle: "自然言語のゲーム案を直接コード化せず、goal pattern と Unity-specific IR を挟んで playable artifact に落とす設計として書く。"
  analysis_axis: "知識表現、制約付き synthesis、Unity 構造要件、semantic meaning の保持、replay による検証を軸にする。"
  application_target: "仕様文から prototype diff へ落とす前段の中間表現、playable 判定、失敗モードの分類。"
  pros_cons: "メリットは発想と実装の間に検証可能な構造を置ける点。デメリットは Unity 前提と IR 作成コスト。"
  verdict_pre: "採用。Phase 0/ゲーム制作の仕様分解と playable diff 化の参照にする。"

---

## raw_excerpt

arXiv 要旨によると、この論文は gameplay idea を executable artifact、特に Unity project / C# code として実現する問題を、game design knowledge representation の側から扱う。Gameplay design patterns は gameplay phenomena を entities、constraints、rule-driven dynamics に分解する構造表現であり、その中でも goal patterns は player-objective relationship を形式化する。Goal Playable Concepts (GPCs) はそれらを playable Unity implementation として operationalize し、experiential exploration と compositional gameplay design を支援する。論文は、generated artifact が Unity の syntactic / architectural requirements を満たしつつ、goal pattern に符号化された semantic gameplay meaning を保つ必要がある、という constrained executable creative synthesis として問題化する。26 の goal pattern instantiation を使い、natural language から直接 C# / Unity を生成する baseline と、人間が書いた Unity-specific intermediate representation に条件付ける pipeline を比較し、自動 Unity replay で compilation success を評価する。failure mode として grounding と hygiene を挙げ、structural / project-level grounding が主な bottleneck だと整理している。

## why_relevant_to_games

「面白そうな説明」から直接ゲームを作るのではなく、goal pattern、IR、Unity 構造制約、replay 検証を挟む発想。Nao_u_BOT の prototype でも、仕様文から playable diff へ落とす中間表現を設計する時の候補になる。
