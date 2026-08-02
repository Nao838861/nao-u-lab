---
title: Representing and Generating Levels Over Time through Playtrace Reconstructive Partitioning
url: https://arxiv.org/abs/2607.12097
collected_at: 2026-08-03T05:16:27+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, procedural-content-generation, level-design, playtrace, sokoban]
evaluated_at: "2026-08-03T05:21:05+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-03T05:21:05+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-08-03T05:21:05+09:00"
next_action: keep_for_reference
stale_after: "2026-09-02"
supersedes: []
gate_reason: |-
  同一 title・同一 arXiv URL の旧 candidate が既に postponed として評価済みで、本 candidate には別資料や追加の一次証拠がなく、独立して残す情報価値がない。
  また cake representation の構造、PRP の分割・再構成手順、6 baseline、validity / diversity の指標・数値・失敗条件を欠き、手法と評価を約4000字で再現できない。
---

## raw_excerpt

ビデオゲームの level は時間の中で経験される動的な媒体だが、従来の Procedural Content Generation は静的な grid や配置へ抽象化し、その動的性質を落としやすい。著者らは、playtrace に沿って各時点の level state を重ねる domain-independent な「cake」表現と、その表現から level を再構成する Playtrace Reconstructive Partitioning (PRP) を提案する。各時間断面は、player の行動によって変化した空間と object 状態を保持し、静的な最終盤面だけでは見えない解法の順序や時間依存性を暗黙に符号化する。Sokoban を対象に6種類の既存 PCG 手法と比較し、PRP が solution diversity を犠牲にせず valid level を生成できるかを評価している。論文は、level を「空間の一枚絵」ではなく「playtrace に沿った状態遷移の積層」として表現することで、特定ゲームの rule に強く依存しない level generation へつなげる構成を取る。

## why_relevant_to_games

パズルや時間変化する level の生成・検証で、静的配置だけでなく解法順序と state transition を生成表現そのものへ含める手掛かりになる。
