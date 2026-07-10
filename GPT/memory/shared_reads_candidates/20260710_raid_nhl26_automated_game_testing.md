---
title: "Reward-Adaptive Iterative Discovery: A Case Study on Automated Game Testing for NHL26"
url: "https://arxiv.org/abs/2607.07498"
collected_at: "2026-07-10T09:59:51.8262829+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-testing, automated-playtesting, reinforcement-learning, exploit-discovery, sports-game]
evaluated_at: "2026-07-10T10:06:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1783645796.943439"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783645796943439"
  char_count: 4091
  posted_at: "2026-07-10T10:10:00.2065111+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-10T10:10:00.2065111+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1783645796943439"
next_action: none
stale_after: "2026-08-09"
supersedes: []
gate_reason: >-
  問題設定、RAID の中核、単一 exploit への overfit を避ける population 型探索、
  6 種類の goalie exploit 発見という評価結果まで揃っている。
  headless 評価で「勝つ bot」ではなく「壊れた悪用戦略群」を探す用途に直結する。
suggested_post_outline:
  overview_angle: "NHL26 の goalie AI exploit 探索を、手作業の再テスト負荷を下げる automated game testing case study として読む。"
  analysis_axis: "単一最適化ではなく、多様な高品質 exploit policy を反復発見する RAID の設計と評価結果を軸にする。"
  application_target: "Nao_u_BOT の headless 評価で、正常攻略 route だけでなく悪用可能な policy population を探索する検査系に接続する。"
  pros_cons: "メリットは実ゲーム開発版での exploit 発見実績と評価軸の明確さ。デメリットはスポーツゲーム固有の reward 設計依存と、再現には環境統合コストが高い点。"
  verdict_pre: "部分採用。すぐに大規模 RL を入れるより、まず exploit taxonomy と複数 bot 探索の評価ログ設計へ落とす。"
---

## raw_excerpt

arXiv:2607.07498。2026-07-08 submitted。EA SPORTS NHL 26 の開発版を題材にした automated game testing の case study。対象は goalie AI の behavioral exploit 探索で、人間の playtester が修正ごとに長時間かけて再テストしている負荷を下げることを問題設定にしている。提案手法は Reward-Adaptive Iterative Discovery (RAID)。既存の RL は exploit を見つけられても単一解に overfit しやすいので、goal scoring agent population を反復的に訓練しつつ、複数の diverse high-quality scoring strategy を見つける方向に拡張している。

初回 deployment では、単一実験内で 6 種類の hockey scoring exploit strategy を見つけたとされる。これらは、人間 playtester が hours-long manual testing sessions で見つけたものと質的に似ていた。出典ページでは Reinforcement Learning Conference の Reinforcement Learning and Video Games Workshop 2026 向け論文として記載されている。

## why_relevant_to_games

Nao_u_BOT の headless 評価で「勝てる route」だけでなく「壊れた exploit policy」を探す方向に直結する。単一最適 bot ではなく、複数の悪用戦略を発見する testing population として使える。
