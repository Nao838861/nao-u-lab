---
title: "Do Geometry-Aware Positional Encodings Help Transformers in Spatial Imperfect-Information Games?"
url: "http://arxiv.org/abs/2608.14982v1"
collected_at: "2026-08-21T20:01:53+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, imperfect-information, spatial-reasoning, evaluation, headless]
evaluated_at: "2026-08-21T20:04:27+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1787310593.192749"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787310593192749"
  char_count: 4482
  posted_at: "2026-08-21T20:10:15.2547802+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-21T20:10:15.2547802+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787310593192749"
next_action: none
stale_after: "2026-09-20"
supersedes: []
gate_reason: >-
  問題設定、三種の幾何 encoding、四段階の評価、主要な数値結果、内部指標の改善が閉ループ勝率へ移らなかった結論まで抽出できる。
  不完全情報 bot の belief・模倣精度・対戦成績を分離して測る具体的な評価設計へ接続でき、CoopEval 水準の概要と批判的分析を構成できる。
suggested_post_outline:
  overview_angle: "幾何 inductive bias の効用を、制御 probe から実戦勝率まで段階的に追い、表現改善と勝利の非同値性を示した研究として整理する"
  analysis_axis: "HexRoPE・rectangular relative bias・graph bias の帰納バイアスと、データ量・対称変換・map 外挿・閉ループ評価ごとの効き方を比較する"
  application_target: "Log_cdx が不完全情報ゲームの headless bot を評価する際の、belief calibration・policy imitation・固定 seed 対戦を分離した検証プロトコル"
  pros_cons: "利点は段階別評価と信頼区間付き対戦比較、限界は単一ゲーム系・既存 opponent・集計勝率では局面別改善を捉えにくい点"
  verdict_pre: 部分採用
---

## raw_excerpt

> “Transformers applied to spatial imperfect-information games must represent map geometry while tracking hidden entities through time.”

著者は、六角形の海戦追跡ゲームを使い、空間構造を組み込んだ positional encoding が Transformer の能力へどう表れるかを四段階で収集している。段階は、幾何・位相の制御 probe、隠れた標的を追う exact-Bayes 課題、1,000局／10,000局の offline policy imitation、3種類の既存 opponent と固定 seed で行う7,200局の対戦である。HexRoPE は positional encoding なしに比べ、D6 変換した test orbit で事後分布 cross-entropy を0.278、大きい map で0.329下げた。1,000局では action accuracy が encoding なしより4.63ポイント、rectangular relative bias より2.05ポイント高く、10,000局では差が1.55／0.41ポイントへ縮小した。一方、対戦勝率では encoding なしとの差が -1.56ポイント、95%信頼区間は -4.50〜1.17で、集計勝率の改善は確認されなかった。rectangular relative bias は D6 belief consistency では強かったが、radius 3 から4への外挿で崩れ、graph bias の blocked-edge 改善は小さかった。

## why_relevant_to_games

不完全情報ゲーム用 AI／headless bot を作る際に、内部 belief・模倣精度・閉ループの勝率を別々に記録する評価設計の材料になる。表現学習の改善が実際のプレイ結果へ直結しない例として、bot 比較や対戦 seed 設計に使える。
