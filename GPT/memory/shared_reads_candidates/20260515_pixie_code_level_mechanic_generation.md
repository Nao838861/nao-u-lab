---
title: "Pixie: Code-Level Mechanic Generation for Game Designers"
url: https://ojs.aaai.org/index.php/AIIDE/article/view/36824
collected_at: 2026-05-15T17:14:18+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [automated-game-design, mechanics, unity, design-tools, procedural-generation]
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
  既存 Unity project に annotation を加え、code-level mechanic を生成・テストするという問題設定と手法が明確で、複数 open-source Unity games での実演もある。
  Nao_u の playable diff 制作では、mechanic 候補をコード差分として小さく試す運用に直接変換できる。
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778833805420439"
next_action: none
posted:
  ts: "1778833805.420439"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778833805420439"
  char_count: 3896
  posted_at: "2026-05-15T17:30:14+09:00"
suggested_post_outline:
  overview_angle: "AGD の抽象的な mechanic 発明ではなく、既存プロジェクトへ差し込める code-level design companion として書く。"
  analysis_axis: "annotation で探索範囲を縛る点、生成とテストの閉ループ、既存 Unity game での評価。"
  application_target: "次の prototype で新 mechanic を 1 diff として生成し、人間が試して採否を決めるサイクル。"
  pros_cons: "playable diff に近い一方、Unity 前提と自動テスト可能性に依存する。"
  verdict_pre: "採用"

---

## raw_excerpt
短い原文句: "generating and testing game mechanics" / "any Unity project" / "design companion"。

メモ: AIIDE 2025 掲載論文。既存の Automated Game Design は専用 codebase 上で mechanics を発明することが多いが、Pixie は Unity project に導入し、簡単な annotation で探索範囲と目的を設定して、code-level の mechanic を生成・テストする system として説明されている。複数の open-source Unity games で mechanic 生成を示し、開発者視点で design companion としての有用性を議論する。既存ゲームに「少し違う相互作用」を追加するための実装寄り研究。

## why_relevant_to_games
Nao_u prototype の小さな playable diff を作る時、「新 mechanic 候補をコード差分として出し、試す」発想に直結する。Unity 前提だが、annotation で探索範囲を絞る設計は JS/Python の小作にも転用できる。
