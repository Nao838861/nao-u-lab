---
title: "When LLMs Play the Telephone Game: Cultural Attractors as Conceptual Tools to Evaluate LLMs in Multi-turn Settings"
url: "https://arxiv.org/abs/2407.04503"
collected_at: "2026-07-10T20:35:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, multi-agent, llm-agent, narrative, evaluation, communication]
evaluated_at: "2026-08-10T09:25:11+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-10T09:25:11+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-10T09:25:11+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-09"
supersedes: []
gate_reason: >-
  transmission chain、追跡属性、open-ended 条件での増幅、attractor state という結論まで、反復生成の失敗機序を説明する重要要素が揃っている。
  NPC の噂伝播や world log 圧縮に同じ情報を連鎖投入し、意味保存だけでなく toxicity・positivity・難度・長さの drift を測る具体 probe にできる。
  単発出力評価では見えない累積偏りをゲーム内システムと制作検証の両面から分析でき、4000 字級の独立した投稿に耐える。
suggested_post_outline:
  overview_angle: "単発では小さい生成 bias が、NPC 間の反復伝達で文化的 attractor へ増幅される過程を評価手法として読む。"
  analysis_axis: "transmission chain、属性ごとの drift、open-ended / constrained task の差、個体評価から collective behavior 評価への転換を整理する。"
  application_target: "NPC の噂・伝言・要約ログを同一 seed から複数 chain で回し、事実保持率と感情・毒性・長さの収束方向を記録する probe に落とす。"
  pros_cons: "長期会話の見えない累積歪みを発見できる一方、attractor を物語上の意図した変形と単純な品質劣化に分ける基準が必要になる。"
  verdict_pre: "採用。反復生成システムの回帰試験と、噂が変形するゲームメカニクスの設計資料として使う。"
---

## raw_excerpt
arXiv:2407.04503。2024-07-05 submitted、2026-01-29 v4。Jérémy Perez, Grgur Kovač, Corentin Léger, Cédric Colas, Gaia Molinaro, Maxime Derex, Pierre-Yves Oudeyer, Clément Moulin-Frier による、LLM 同士の反復的な情報伝達でテキストがどう変形するかを調べた研究。要旨では、個別 LLM の出力だけでなく、LLM から LLM へ情報が渡る時の collective behavior と information distortion が見落とされていると置く。実験は cultural evolution 研究の transmission chain design を借りた "telephone game experiments" で、LLM agent が前の agent から text を受け取り、生成し、次へ渡す。追跡対象は toxicity、positivity、difficulty、length など。小さな bias が単発出力では無視できても、反復 interaction で attractor states へ増幅される可能性があり、open-ended instructions では constrained tasks より attraction effects が強く出るとされる。コードと Data Explorer も公開され、ICLR 2025 採択済み。

## why_relevant_to_games
NPC 会話、噂、伝言、複数 agent の world log 圧縮で、内容がどの方向へ歪むかをゲームメカニクスや評価 probe として扱う候補になる。
