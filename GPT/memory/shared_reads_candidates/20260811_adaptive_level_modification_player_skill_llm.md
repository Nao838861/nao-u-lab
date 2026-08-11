---
title: "Adaptive level modification via player skill classification and large language models"
url: "https://www.nature.com/articles/s41598-026-63084-z"
collected_at: "2026-08-11T09:16:38+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, dynamic-difficulty, player-modeling, procedural-content-generation, llm, level-design]
evaluated_at: "2026-08-11T09:20:37+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-11T09:20:37+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-11T09:20:37+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-10"
supersedes: []
gate_reason: >-
  skill 分類、LLM による構造変換、physics verifier という制御ループを、精度・playability・level 指標まで含めて説明できる。
  headless play log から失敗型を推定して level geometry を変え、決定的 validator で破綻を止める自分達の制作手順へ具体化でき、限界も含めて約4000字の分析に耐える。
suggested_post_outline:
  overview_angle: "player trace→skill 分類→意図の構造化→level chunk 変換→physics verifier という五段の閉ループと、各段で得られた評価値を軸に解説する"
  analysis_axis: "classifier accuracy 97.82% と生成後の full-level playability 74.1% を分け、推定精度が高くても生成品質がボトルネックになる点を分析する"
  application_target: "Log_cdx の game prototype で、headless play log から失敗型を分類し、難易度数値ではなく局所 geometry の候補を生成して、到達可能性 validator と実プレイ確認を通す offline 改修 loop"
  pros_cons: "長所は適応判断・構造編集・安全検証を分離できること。短所は Mario 型環境への限定、人間データと汎化検証の薄さ、original より低い full-level playability、楽しさや気付かれ方を測っていないこと"
  verdict_pre: "部分採用。三段制御構造と verifier は採用し、runtime LLM 置換や classifier 数値はそのまま移植しない"
---

## raw_excerpt

Scientific Reports 16, Article 23489（2026年7月28日公開）の open-access 論文。固定 difficulty や enemy health・spawn rate の数値調整ではなく、観測した player skill に応じて Super Mario Bros. の level chunk 自体を real-time に組み替える framework を示す。まず、学習時間を変えた3段階の PPO agent trajectory と、著者らによる human gameplay data を統合し、XGBoost classifier が beginner・normal・expert を分類する。予測 label ごとの短い prompt（beginner なら platform を広げ hazard を減らす、expert なら enemy や精密 jump を増やす等）を第一 LLM が構造制約付き指示へ展開し、第二 LLM が tile grid の chunk を変更する。変更後は Dijkstra 法を用いた physics-constrained verifier で通過可能性を検査し、失敗時は元 chunk を保持する。classifier accuracy は97.82%。変更後の playability は full-level 単位74.1%、isolated-chunk 単位83.5%で、original level は80.0%。playable な71 chunk について leniency・action density・topographical roughness も測定した。data と pipeline code は Zenodo で公開されている。

## why_relevant_to_games

player trace から難度を推定し、数値ではなく level geometry を変更し、最後に決定的 verifier で破綻を止める三段構成は、adaptive level と自動 playtest を同じ loop に接続する実装例になる。
