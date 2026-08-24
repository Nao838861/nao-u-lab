---
title: "Augmentations for Robust and Efficient Imitation Learning in Streamed Video Games"
url: "https://arxiv.org/abs/2607.14200"
collected_at: "2026-08-24T20:20:51+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-ai, imitation-learning, automated-playtesting, streaming, robustness]
---

## raw_excerpt

arXiv 本文からの採取メモ（日本語パラフレーズ）: 複雑な 3D ゲームを操作する agent を、人間の demonstration から画面入力と action の対応として学習させる offline imitation learning を扱う。実運用では、熟練者の demonstration が少数しか集められず、さらに remote streaming の遅延・帯域変動・圧縮によって、学習時にはない時間相関を持つ映像ノイズが生じる。提案手法は、縦方向の scrub、局所的な macroblock pixelation、画面全体の fuzziness、前 frame の残像を混ぜる ghosting の4種類を、各 frame へ独立に加えるのではなく、50〜100 frame の連続 chunk 内で位置や強度が滑らかに変わる perturbation として生成する。predictive inverse dynamics model を基盤に、2本の modern 3D game にある3 task、各 task 30本の人間 demonstration で学習し、agent は 30 Hz の streaming 環境で操作する。評価は navigation、jump、crouch、object interaction、attack などの milestone 完了率を、人手で匿名化動画へ注釈して測る。安定した streaming 条件でも augmentation なしより最大41%高い評価値を報告し、network lag を加えた条件では通常データのみの agent が元性能から49.82%低下したのに対し、提案 augmentation ありでは7.45%の低下だった。

## why_relevant_to_games

画面だけを入力にする自動テストプレイヤーや remote game 操作 agent を作る際、単発の画像ノイズではなく連続 frame に残る観測経路の乱れまで学習データへ入れる具体例として参照できる。
