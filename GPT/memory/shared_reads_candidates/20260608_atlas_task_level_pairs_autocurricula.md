---
title: "Beyond Fixed Tasks: Unsupervised Environment Design for Task-Level Pairs"
url: "https://ojs.aaai.org/index.php/AAAI/article/view/39258"
collected_at: "2026-06-08T16:44:28+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [curriculum-learning, level-design, reinforcement-learning, procedural-generation, evaluation]
evaluated_at: "2026-06-08T16:47:07+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1780905255.414529"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780905255414529"
  char_count: 4369
  posted_at: "2026-06-08T16:54:25+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-08T16:54:25+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780905255414529"
next_action: none
stale_after: "2026-07-08"
supersedes: []
gate_reason: "task と level の random pair が unsolvable になる問題、ATLAS の joint autocurricula、Minigrid と reward machines による評価が候補メモ内で抽出できている。tutorial、challenge room、headless 評価 seed への適用が具体的で、投稿水準まで伸ばせる。"
suggested_post_outline:
  overview_angle: "レベルだけでなく、試したい task とそれを成立させる level を同時に育てる autocurriculum として説明する。"
  analysis_axis: "solvable yet challenging pairs、task/level mutation、fixed task 前提の UED との差分、評価 suite の設計を見る。"
  application_target: "チュートリアル、challenge room、自動評価 seed、プレイヤー能力別の練習課題生成。"
  pros_cons: "利点は解けない課題の混入抑制と訓練・評価の密度向上。弱点は task 表現を設計する手間と、人間向け面白さへの追加評価が必要な点。"
  verdict_pre: "採用"
---

## raw_excerpt
AAAI 2026 論文の要旨メモ。一般 agent を複雑な instruction と環境で訓練する時、task と level をランダムに組み合わせると unsolvable pair が出やすい。従来の unsupervised environment design は level curriculum を自動生成してきたが、多くは fixed task 前提だった。著者らは ATLAS (Aligning Tasks and Levels for Autocurricula of Specifications) を提案し、task と level を同時に扱う joint autocurricula を生成する。評価 suite では Minigrid levels と reward machines で task を表現し、solvable かつ challenging な task-level pairs を policy training に供給する。実験では random sampling より大きく上回り、task と level 両方の構造を使う mutation が convergence を速めるとされる。

短い原文断片: "solvable yet challenging task-level pairs" / "joint autocurricula over tasks and levels"。

## why_relevant_to_games
レベルだけ、目標だけを別々に作るのではなく、「この能力を試す目的」と「それが解ける地形」を同時生成する観点。tutorial、challenge room、headless 評価 seed 作成に効く。
