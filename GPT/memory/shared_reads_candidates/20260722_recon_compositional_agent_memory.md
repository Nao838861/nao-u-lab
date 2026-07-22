---
title: "RECON: Benchmarking Agent Memory for Compositional Reasoning over Long Contexts"
url: "https://arxiv.org/abs/2607.16716"
collected_at: "2026-07-22T22:45:40.2986729+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent-memory, evaluation, long-context, game-playtesting]
evaluated_at: "2026-07-22T22:48:43.4333168+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
posted:
  ts: "1784728589.321079"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784728589321079"
  char_count: 4453
  posted_at: "2026-07-22T22:56:56.6400627+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-22T22:56:56.6400627+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784728589321079"
next_action: none
stale_after: "2026-08-21"
supersedes: []
gate_reason: >-
  問題設定、6種の課題、deterministic な生成・正解系、比較条件、non-Oracle 22.4%・human 63.0%・chain length 別 Oracle 低下まで抽出でき、4000字級の概要を支える材料がある。
  長期プレイ履歴を使う test agent / NPC について、単純 recall と証拠依存の更新・無効化伝播を分離して測る具体的な評価設計へ適用できる。
suggested_post_outline:
  overview_angle: "長期記憶を『覚えているか』ではなく、証拠を合成し、前提崩壊を結論へ伝播できるかで測る benchmark として整理する"
  analysis_axis: "6課題の分解、provenance DAG と deterministic ground truth、full-context・RAG・memory architecture・Oracle の比較から、検索失敗と推論失敗を切り分ける"
  application_target: "長期プレイ履歴を参照する test agent / NPC の回帰評価で、パッチ・状態変更・誤観測後の依存結論更新を測る synthetic case と採点器に転用する"
  pros_cons: "長い履歴上の依存推論を再現可能に測れる一方、犯罪・医療・金融の合成 narrative から gameplay state への移植と、50k–100k token 評価コストが必要"
  verdict_pre: "部分採用"
---

## raw_excerpt

arXiv:2607.16716v1（2026-07-18 投稿）の一次資料メモ。RECON（Reasoning over Extended Contexts with Obfuscated Narratives）は、長い履歴から事実を一件取り出せるかだけでなく、途中の証拠が無効になった時に、そこへ依存していた結論をどこまで取り消し、独立した根拠で残る結論を区別できるかを測る benchmark。犯罪・医療・金融の3領域に24件の case file を用意し、各 case は 50k–100k tokens。課題は multi-hop evidence chain の再構成、cascading invalidation の伝播、source conflict の解消、counterfactual reasoning、temporal constraint、temporal fact retrieval の6種で構成される。

case file は seeded configuration から blueprint、skeleton、provenance DAG、task、narrative を生成し、ground truth と answer key は deterministic program logic で確定する。評価では full long-context、RAG、複数の memory architecture、structured ground truth を渡す Oracle を比較。最良の non-Oracle system でも Accuracy は22.4%。Oracle でも chain length 3–4 の100%から length 10では50%まで低下し、検索だけでなく、提示済み証拠を段階的に合成する推論にも難しさが残る。人間 baseline は問題に必要な evidence packet を与えられる条件で Accuracy 63.0%だった。

## why_relevant_to_games

長期プレイ履歴を使うテスト agent や NPC が、パッチ・状態変更・誤観測の後に古い結論を連鎖的に更新できるかを評価する課題設計の参考になる。単純な履歴 recall と、依存関係をたどる gameplay reasoning を分けて観測する場面に接続できる。
