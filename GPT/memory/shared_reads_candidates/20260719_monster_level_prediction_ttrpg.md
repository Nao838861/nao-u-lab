---
title: "Application of machine learning to monster level prediction in tabletop RPG game design"
url: "https://arxiv.org/abs/2607.09196"
collected_at: "2026-07-19T17:01:45+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, balance, ttrpg, machine-learning, explainability]
evaluated_at: "2026-07-19T17:08:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-19T17:08:00+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-19T17:08:00+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-18"
supersedes: []
gate_reason: |-
  順序尺度としての monster level、通常回帰・ordinal regression・ordinal-aware neural network の比較、chronological / expanding-window 評価、tree ensemble の優位と説明可能性まで重要要素が揃う。
  敵データの後発コンテンツ汎化と、予測誤差・寄与属性を設計者へ返す補助工程に具体適用でき、4000字級の分析に耐える。
suggested_post_outline:
  overview_angle: "モンスターの強さを単一式で決めるのではなく、順序予測と時系列検証で設計判断を補助する研究として書く"
  analysis_axis: "回帰の丸め、ordinal model、ordinal-aware loss、chronological / expanding-window 分割、feature importance と error distribution を比較する"
  application_target: "敵パターンや難易度帯を追加する際、既存属性から想定 tier を予測し、外れ値と寄与属性をデザイナーが再確認する balance probe"
  pros_cons: "利点は後発データへの汎化と判断根拠を同時に測れること。弱点は既存 level 定義の偏りを学習し、相互作用や体感難度を単独では捉えないこと"
  verdict_pre: "部分採用"
---

## raw_excerpt

arXiv の要旨では、Pathfinder Second Edition の公開データから、TTRPG のモンスターが持つ多数の数値属性を入力し、その強さを表す順序尺度の level を予測する問題を扱う。著者らは、通常の回帰と丸め処理、表形式データ向けの ordinal regression、ordinal-aware loss を使う neural network を比較する。制作現場で過去データから将来のモンスターを調整する状況に近づけるため、無作為分割だけでなく chronological protocol と expanding-window protocol を採用し、複数の指標で評価する。要旨上では tree-based ensemble が線形モデルと neural approach を上回り、ordinal ranking と level 予測で高い精度を示したとされる。feature importance と error distribution を使った説明では、モデルがゲームルールに由来する、人間の設計直感と整合した属性パターンを捉えていると報告される。論文は、予測器をデザイナー判断の代替ではなく、モンスター調整を補助する computer-aided tool と位置づけている。

## why_relevant_to_games

敵の強さを単一スコアで決めず、既存データから順序尺度を予測し、誤差と寄与属性を設計者へ返すバランス支援の事例として参照できる。時系列分割は、後発コンテンツへの汎化を検証する際にも使える。
