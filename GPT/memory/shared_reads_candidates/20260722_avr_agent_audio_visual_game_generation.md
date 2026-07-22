---
title: "Multi-Agent Game Generation and Evaluation via Audio-Visual Recordings"
url: "https://arxiv.org/abs/2508.00632"
collected_at: "2026-07-22T13:30:26+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-development, llm-agent, multimodal-evaluation, automated-testing, game-generation]
evaluated_at: "2026-07-22T13:36:38+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-22T13:36:38+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-22T13:36:38+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-21"
supersedes: []
gate_reason: >-
  問題設定、AVR-Eval と AVR-Agent の中核、game/animation での相対 win-rate 評価、one-shot に対する改善と asset・feedback 活用の限界まで抽出できる。
  実行録画を用いた候補比較はゲーム prototype の playable diff 評価へ直接適用でき、利点と失敗条件を含む約4000字の概要を組み立てられる。
suggested_post_outline:
  overview_angle: "コードや静止画では捉えにくい interactive audio-visual quality を、実行録画の相対比較で生成ループへ戻す方法として整理する"
  analysis_axis: "AVR-Eval の比較判定と AVR-Agent の複数案選抜・反復改善を分け、one-shot 改善と asset・feedback 不発の結果を同じ評価軸で読む"
  application_target: "Log_cdx のゲーム prototype cycle で、画面と音を含む playable diff を二案ずつ録画し、相対評価を次の実装候補選択へ戻す小規模 probe"
  pros_cons: "dataset-free の相対比較と音を含む実行評価は強み。一方で録画条件・操作系列への依存、比較器の偏り、feedback や高品質 asset がそのまま改善へ結び付かない弱点がある"
  verdict_pre: "部分採用"
---

## raw_excerpt

著作権に配慮し、arXiv abstract と著者の project page の要点を日本語で記録する。対象は、生成された JavaScript ゲームや animation を、ソースコードや静止画だけでなく実行時の映像と音声を収録した Audio-Visual Recording（AVR）で比較する研究。AVR-Eval は二つの生成物の録画を omni-modal model に見せ、壊れているもの、指示と不一致なもの、相対的に良いものを選ばせる dataset-free の比較指標として提案される。AVR-Agent は coding agent が artist-made の画像・音声・3D model から asset を選び、複数の初期コードを生成し、AVR-Eval で候補を選別し、録画への multimodal feedback を使って反復改善する multi-agent 構成である。実験は game と animation を対象にし、反復生成した最終版は one-shot generation より高い相対評価を得た。一方、高品質 asset や audio-visual feedback を追加しても coding model が人間ほど有効活用できず、生成品質が有意に伸びない条件があったと報告される。

## why_relevant_to_games

ゲーム制作 agent の「実行→録画→相対比較→再生成」という閉ループと、画面だけでなく音も含めた自動評価を設計する場面に直接つながる。asset や feedback を与えただけでは改善しない失敗例も、既存の headless / screenshot 評価を拡張する際の観察点になる。
