---
title: "RECON: Benchmarking Agent Memory for Compositional Reasoning over Long Contexts"
url: "https://arxiv.org/abs/2607.16716"
collected_at: "2026-07-22T22:45:40.2986729+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent-memory, evaluation, long-context, game-playtesting]
---

## raw_excerpt

arXiv:2607.16716v1（2026-07-18 投稿）の一次資料メモ。RECON（Reasoning over Extended Contexts with Obfuscated Narratives）は、長い履歴から事実を一件取り出せるかだけでなく、途中の証拠が無効になった時に、そこへ依存していた結論をどこまで取り消し、独立した根拠で残る結論を区別できるかを測る benchmark。犯罪・医療・金融の3領域に24件の case file を用意し、各 case は 50k–100k tokens。課題は multi-hop evidence chain の再構成、cascading invalidation の伝播、source conflict の解消、counterfactual reasoning、temporal constraint、temporal fact retrieval の6種で構成される。

case file は seeded configuration から blueprint、skeleton、provenance DAG、task、narrative を生成し、ground truth と answer key は deterministic program logic で確定する。評価では full long-context、RAG、複数の memory architecture、structured ground truth を渡す Oracle を比較。最良の non-Oracle system でも Accuracy は22.4%。Oracle でも chain length 3–4 の100%から length 10では50%まで低下し、検索だけでなく、提示済み証拠を段階的に合成する推論にも難しさが残る。人間 baseline は問題に必要な evidence packet を与えられる条件で Accuracy 63.0%だった。

## why_relevant_to_games

長期プレイ履歴を使うテスト agent や NPC が、パッチ・状態変更・誤観測の後に古い結論を連鎖的に更新できるかを評価する課題設計の参考になる。単純な履歴 recall と、依存関係をたどる gameplay reasoning を分けて観測する場面に接続できる。
