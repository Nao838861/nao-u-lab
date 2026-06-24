---
title: "Designing Biofeedback Board Games: The Impact of Heart Rate on Player Experience"
url: "https://doi.org/10.1145/3706598.3713543"
collected_at: "2026-06-20T04:44:40+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, tabletop, biofeedback, player-experience, mechanics, prototyping]
evaluated_at: "2026-06-20T05:05:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-06-20T05:05:00+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-06-20T05:05:00+09:00"
next_action: revise_or_research
stale_after: "2026-07-20"
supersedes: []
gate_reason: |-
  Heart rate を tabletop mechanics に変換する着想は、緊張・待機・協力・リスク判断をゲーム内状態へ接続する資料として有望。
  ただし現候補は abstract と repository 情報中心で、workshop で得た具体的 trade-off、prototype mechanics、評価結果の中身が不足している。
  CoopEval 水準の約4000字概要を書くには、paper 本文または公開PDFから設計実装と知見を追加確認する必要がある。
---

## raw_excerpt

著作権配慮のため長文引用ではなく、公開 abstract とリポジトリ情報に基づく要点メモとして保存する。対象は CHI 2025 paper。著者は Joseph Tu、Eugene Kukshinov、Reza Hadi Mogavi、Derrick M. Wang、Lennart E. Nacke。UWSpace の公開ページでは、biofeedback は tabletop gameplay を強める機会になり、物理コンポーネントの触覚的な魅力を保ったままデジタル統合による新しい play style を許す、と説明されている。一方で、heart rate などの biofeedback system を game design に組み込む方法は、文献上も実践上もまだ十分に理解されていない。

研究方法は Research through Design。enthusiast board game designers 10 人から insight を集め、参加型 design workshop を 2 回 20 人で行い、expert 5 人と game mechanics を prototyping し、その成果物として `One Pulse: Treasure Hunter's` という board game prototype を作った。貢献は、heart rate を tabletop game に入れる時の実装上の trade-off と design implementation を整理することにある。公開 abstract では、board games、biofeedback、heart rate、prototyping、game mechanics が keyword として挙げられている。

## why_relevant_to_games

心拍を直接ゲーム入力や状態変化に接続する資料として、デジタルゲームの難度調整だけでなく、緊張、待機、協力、リスク判断を mechanics に変換する時の候補になる。
