---
title: "Quality Audio Prototyping: a prototype system for unified sound retrieval and procedural generation"
url: "https://arxiv.org/abs/2606.00629"
collected_at: "2026-06-19T04:08:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-audio, procedural-audio, tools, prototyping, feedback]
evaluated_at: "2026-07-27T14:22:16+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-27T14:22:16+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-27T14:22:16+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-26"
supersedes: []
gate_reason: |-
  検索・6種のprocedural synthesis・知覚ベースguideを一画面へ統合し、主観評価、encoder ablation、16名の実務家評価で別々に検証している。
  効果音を完成素材ではなく操作feedbackの探索物として早期prototypeへ入れる手順へ直結し、失敗カテゴリと小規模評価の限界も説明できる。
suggested_post_outline:
  overview_angle: "音源検索と手続き合成の分断を解き、実在感より反復可能なlayeringと人間の調整余地を優先するprototypeとして読む"
  analysis_axis: "統合architecture、feature-driven最適化、MUSHRA・encoder ablation・practitioner評価の三角測量と数値上の矛盾/限界"
  application_target: "shot・graze・charge・break等の操作feedbackを、静的sampleとparameter variationのlayerとしてゲーム初期から比較するaudio probe"
  pros_cons: "問題設定からUIと評価まで一貫し人間のagencyを保つ／6カテゴリ・16名・短期taskに限られ、一部modelは改善しない"
  verdict_pre: "部分採用"
---

## raw_excerpt

arXiv:2606.00629。Nelly Garcia ほか。2026-05-30 投稿。QuAP は、効果音制作で library search と procedural synthesis が分断されている問題を扱う prototype system。制作時には、既存音源を探す作業は時間がかかり、procedural synthesis は専門知識が必要で、ゲームの narrative concept から実際の sonic realisation まで距離がある、という前提。

提案システムは content-based audio retrieval と real-time procedural audio models を同じ interface にまとめる。さらに rule-based assistant が、知覚に基づく parameter guidance を出し、合成モデルの定義や推奨値を説明する。要旨では、6 つの embedded synthesis models のうち 5 つで主観評価上の品質改善が統計的に確認され、16 名の practitioner による user evaluation では、全参加者が parameter assistant は creative agency を保ったまま procedural interaction の障壁を下げたと答えた、とされる。

ゲーム制作では、音を最後に素材として貼るのではなく、操作・衝突・状態変化に応じて変化する feedback として扱う必要がある。QuAP は、音源検索と手続き的変化を同じ作業面で扱うため、短時間プロトタイプでも「当たった」「避けた」「溜めた」「壊した」の手触りを音で試す候補になる。

## why_relevant_to_games

短時間ゲーム制作で音を後回しにせず、操作 feedback と procedural variation を早く試すための道具候補。shot_log / graze 系の快感フィードバック設計に効く。
