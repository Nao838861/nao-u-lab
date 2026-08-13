---
title: "Designing for Difficulty: Readability in ARPGs"
url: "https://www.gamedeveloper.com/game-platforms/designing-for-difficulty-readability-in-arpgs"
collected_at: "2026-08-13T12:01:42+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, combat, difficulty, readability, action-rpg]
evaluated_at: "2026-08-13T12:04:36+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-13T12:04:36+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-13T12:04:36+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-12"
supersedes: []
gate_reason: >-
  可読性を予告と期待結果の一貫性に分け、反復・chunking・学習順序から難易度を組み立てる
  手法と具体的な難化レバーを抽出できる。戦闘プロトタイプの理不尽さ診断へ直接適用でき、
  経験則であることの限界も含めて約4000字の分析を構成できる。
suggested_post_outline:
  overview_angle: "難易度を情報不足ではなく、読めるパターンを学習・圧縮・再結合する過程として説明する"
  analysis_axis: "telegraphing と expectations の分離、chunking による注意資源の解放、可読性を保った難化レバー、経験則としての限界"
  application_target: "Log_cdx のアクション系プロトタイプで、予告・結果・反撃窓・導入順を別々に記録し、失敗原因を調整する"
  pros_cons: "理不尽さを削らず難度を上げる具体策が多い一方、プレイヤー差や定量的な成功基準は別途プレイテストで補う必要がある"
  verdict_pre: "採用"
---

## raw_excerpt

『Death’s Gambit』のデザイナー Alex Kubodera は、戦闘の可読性を telegraphing（攻撃前に何が起こるかを伝えること）と expectations（その合図から予期した結果が一貫して起こること）に分ける。大きな身振り、色、台詞、音は、反復する攻撃パターンの開始や段階を示す。プレイヤーは反復を chunking して、解法を意識的な解析から筋肉記憶へ移し、新しいパターンへ注意を割けるようになる。そのため難易度調整の中心は、飽きる前かつ諦める前に、パターンを学ぶ時間と情報をどれだけ渡すかになる。危険表示や音を補助輪として足す場合も、突き・掴み・薙ぎ払いに対応する姿勢と対処法を一貫させる。難しくする時は可読性を削らず、既習パターンの連結や timing 変更、反撃可能時間の短縮、modifier、速度上昇、既知の敵の組合せ、timer、resource management などを使う。複数敵を同時に出す前に単体で学ばせ、強い視覚表現と実際の damage も対応させる。原文の要点は “Patterns repeat, but until you recognize the repetition it’s just noise.”

## why_relevant_to_games

アクションやシューティングで「敵を速くする／数を増やす」前に、予告・結果・反撃窓を分離して設計し、難しさと理不尽さを切り分ける時の観点になる。
