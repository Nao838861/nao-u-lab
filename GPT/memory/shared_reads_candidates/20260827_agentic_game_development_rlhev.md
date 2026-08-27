---
title: "Agentic Game Development as a Verifiable Trajectory Data Engine for Scaling World Models"
url: "https://arxiv.org/abs/2608.25518v1"
collected_at: "2026-08-27T17:34:02+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-development, world-model, reinforcement-learning, agentic-development, evaluation]
---

## raw_excerpt

一次情報からの採取メモ（要約）。Pengfei Zhou ほかによる arXiv:2608.25518v1 は、world model の規模拡大を、crawl した動画と計算量を増やすだけの問題として扱わず、grounded reward signal を返す再帰的な data engine が必要だと論じる。code agent では compiler と runtime が Reinforcement Learning の高品質な報酬を返せる一方、空間生成は CLIP score のような曖昧で偏りのある proxy に依存している。著者らは、この不足を埋める環境として game development を位置づける。game engine に符号化された scene は executable world specification であり、engine は collision、physics、navigability、bounded playability を効率よく検査できる。さらに developer が scene を採用するかどうかを global verification signal として利用でき、実制作の過程は long-horizon trajectory data も生成する。提案する Reinforcement Learning with Human-Engine Verification（RLHEV）は、engine 由来の密な信号と、開発工程に現れる人間の暗黙的な acceptance feedback を組み合わせて world model を post-training する枠組みである。

## why_relevant_to_games

ゲーム制作を生成物の出力だけでなく、engine 検証と人間の採否が連続して得られる学習 trajectory として扱う提案。agent 制作ログへ physics・到達可能性・playability・採否を対応づける場面に活用できる。
