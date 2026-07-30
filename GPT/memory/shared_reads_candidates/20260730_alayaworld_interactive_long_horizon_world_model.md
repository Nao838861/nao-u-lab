---
title: "AlayaWorld: Interactive Long-Horizon World Modeling -- Full Technical Report"
url: "https://arxiv.org/abs/2607.18367"
collected_at: "2026-07-30T23:47:06.7831480+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-development, world-model, generative-ai, interactive-world, long-horizon]
evaluated_at: "2026-07-30T23:51:59.7689227+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1785423705.686359"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785423705686359"
  char_count: 4488
  posted_at: "2026-07-31T00:02:14.2195716+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-31T00:02:14.2195716+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1785423705686359"
next_action: none
stale_after: "2026-08-29"
supersedes: []
gate_reason: >-
  4層の bounded visual context、自己 roll-out 誤差を使う anti-drift 学習、4-step distillation、
  iWorld-Bench の比較結果、視覚状態に留まる限界まで一次資料から抽出でき、約4000字の概要を構成できる。
  再訪経路での整合性試験と自己生成失敗の replay は、生成世界を使うゲーム試作の状態設計・回帰試験へ具体的に適用できる。
suggested_post_outline:
  overview_angle: "長時間の生成世界を、固定 anchor・短期履歴・幾何整合 spatial memory・直近 frame の役割分離と、自己誤差からの回復学習で安定化する設計として解説する"
  analysis_axis: "bounded context が計算量を一定に保つ仕組み、再訪整合性と時間連続性の分離、teacher forcing と実運用 roll-out のずれを埋める学習、評価で実証された範囲と未実証部分"
  application_target: "生成映像を探索空間として使うゲーム試作で、scene identity・近傍連続性・再訪整合性を別状態として持たせ、周回カメラ経路と意図的な履歴破損を回帰試験にする"
  pros_cons: "利点は長期履歴を全保持せず再訪を安定させ、自己生成由来の失敗へ耐性を付ける点。欠点は15B級の計算資源、実測応答遅延と ablation の不足、物理因果・オブジェクト状態・長期タスク構造を視覚からしか扱えない点"
  verdict_pre: "部分採用。モデルそのものの導入ではなく、記憶の役割分離・loop-closure 評価・自己誤差 replay を生成世界プロトタイプの設計原則として採用する"
---

## raw_excerpt

arXiv:2607.18367v1、2026-07-20公開。一次資料が掲げる必要条件は “interaction, persistent spatiotemporal consistency, stable long-horizon generation, and efficient response”。AlayaWorld は 15B video diffusion transformer を基盤に、camera trajectory と途中で切替可能な text prompt を条件として、短い latent chunk を自己回帰的に生成する。出力は 24 fps、540p / 720p。長時間生成で scene identity や再訪地点が崩れる問題に対し、固定した sink frame、圧縮した temporal history、過去の frame・depth・camera pose から現在視点へ再投影する geometry-aligned spatial memory、直近 frame の4系統を bounded visual context として組み合わせる。履歴が伸びても chunk ごとの計算量をほぼ一定に保ち、自己 roll-out から得た prediction residual と意図的に壊した history を学習へ戻して drift からの回復も訓練する。約30 sampling step を4 stepへ減らす distillation を導入し、iWorld-Bench では generation quality、trajectory following、memory ability を評価した。報告自身も、object state、physical causality、long-term task structure の理解は可視的な結果に限られると明記している。

## why_relevant_to_games

生成映像をゲーム世界として扱う際、見た目の連続性・再訪時の空間記憶・入力応答・推論速度を別々の設計課題として切り分ける材料になる。従来型ゲームの mechanics や物理状態まで置換できるという話ではなく、探索可能な世界表現の安定化手法として参照できる。
