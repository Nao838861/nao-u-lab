---
title: "HERO'S JOURNEY: Testing Complex Rule Induction with Text Games"
url: "https://arxiv.org/abs/2606.02556"
collected_at: "2026-06-14T22:08:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, text-game, rule-induction, agent-evaluation, benchmark]
evaluated_at: "2026-06-14T22:10:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1781442540.456269"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781442540456269"
  char_count: 4454
  posted_at: "2026-06-14T22:09:13+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-14T22:09:13+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781442540456269"
next_action: none
stale_after: "2026-07-14"
supersedes: []
gate_reason: |-
  問題設定、rule induction と multi-step execution の分離、task taxonomy、評価結果、失敗要因が candidate メモだけでも抽出できる。
  テキストゲーム、チュートリアル設計、LLM player proxy 評価に具体接続でき、CoopEval 水準の概要を支える密度がある。
suggested_post_outline:
  overview_angle: "例示エピソードから隠れルールを推定し、未知対象への複数手順実行まで測る text game benchmark として書く。"
  analysis_axis: "推論成功と実行成功を分けた評価設計、attribute/procedural induction の差、steering の効き方を軸に分析する。"
  application_target: "Nao_u_BOT 側のゲーム制作では、ルール発見型 puzzle、tutorial validation、LLM agent を player proxy にした難度検証に効く。"
  pros_cons: "利点はゲーム内学習の測定軸が具体なこと。弱点は text game 前提で、視覚・物理・リアルタイム操作への外挿は別途検証が必要なこと。"
  verdict_pre: "部分採用。ルール発見と実行を分ける評価軸を制作サイクルに取り込む。"
---

## raw_excerpt

arXiv 検索結果と要旨メモ。2026-06-01 投稿。著者は Anshun Asher Zheng, Kanishka Misra, David I. Beaver, Junyi Jessy Li。HERO'S JOURNEY は、goal-directed episodic tasks の中で、agent が demonstration episodes から hidden rules を推定し、その rule を未知の test entities に適用して複数手順の action sequence を実行できるかを見る benchmark。対象は text games で、attribute induction と procedural induction の 2 系統、8 task、4 種類の structural rule form、lexical grounding と identifiability condition を持つ。評価では state-of-the-art LLM に rule induction の兆候はあるが、task 間で不均一で、推定した rule を実際の multi-step execution に移す段階が bottleneck になるとされる。surface semantics の影響は小さく、attribute task では induction-specific steering が効く一方、procedural task では安定した改善が出ない。

## why_relevant_to_games

テキスト adventure / puzzle / tutorialized mechanics で、「プレイヤーが例からルールを発見して使えるか」を測る設計資料になる。LLM agent を player proxy にする場合も、推論成功と実行成功を分けて見る軸として使える。
