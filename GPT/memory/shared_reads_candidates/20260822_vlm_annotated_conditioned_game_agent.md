---
title: "Training a Conditioned Video Game Agent on a VLM Annotated Dataset"
url: https://arxiv.org/abs/2608.05954
collected_at: "2026-08-22T00:32:38+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, automated-playtesting, vlm, offline-rl, reward-design]
---

## raw_excerpt

原文 abstract の要点を日本語で保持する。強化学習によるゲーム方策の学習は、報酬を取得するためにゲームエンジンへ接続できることを前提にしやすい。また、何を報酬とみなし、各報酬をどの重みで組み合わせるかには試行錯誤が必要で、疎な報酬が最終方策へどう影響したかも追跡しにくい。著者らはこの入口を変え、ゲームプレイ映像のデータセットを Vision Language Model に読ませ、人間が定義した報酬を抽出・注釈する方法を提案する。続いて、その注釈済みデータに offline reinforcement learning を適用し、指定した desired return に応じて振る舞いを変える conditioned agent を学習する。論文は完成済みの万能手法を主張するのでなく、初期実験で実際に現れた難しさと限界も報告対象に含めている。ゲーム内部の reward API がない映像ログから、複数の望ましい行動軸を条件として持つプレイヤー方策を作れるか、という問題設定である。

## why_relevant_to_games

既存ゲームの映像ログしか取れない場面で、VLM 注釈を reward proxy にし、望ましいプレイスタイル別の自動プレイヤーやテスト方策を作る工程へ接続できる。
