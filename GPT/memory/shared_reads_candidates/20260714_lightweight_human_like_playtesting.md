---
title: "A Lightweight Approach of Human-Like Playtesting"
url: "https://arxiv.org/abs/2102.13026"
collected_at: "2026-07-14T22:45:21+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-testing, automated-playtesting, player-modeling, mobile-games]
---

## raw_excerpt

ゲームの手動 playtest は、version ごとに人間が繰り返し操作するため高コストになる。一方、Android Monkey のような一般的な自動テストはゲーム固有の知識を持たず、学習型手法はゲームごとに大量の訓練データと計算を必要とする。論文が提案する LIT は二段階で動く。Phase I では、人間が Android game app を短時間（例として約 8 分）遊ぶ間に、swipe などの action と action 直前の scene を記録し、「どの状況で、どの操作が可能か」を context-aware な抽象 playtesting tactic として一般化する。Phase II では、ランダムに得た game scene を tactic の abstract context と照合し、一致した tactic を現在の scene に合わせて具体化して feasible event を生成する。9 games の評価では、比較対象となる二つの既存 tool を上回ったと報告されている。

短い原文断片: "context-aware, abstract playtesting tactics" / "eight minutes"

## why_relevant_to_games

Nao_u_BOT の prototype で、人間の短い操作ログから「状態→操作」の再利用可能な tester policy を抽出し、build 間の反復検査へつなぐ場面に使える可能性がある。
