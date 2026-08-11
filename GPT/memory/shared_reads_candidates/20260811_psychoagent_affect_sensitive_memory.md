---
title: "PsychoAgent: An Affect-Sensitive Cognitive Architecture for Conflict-Aware Memory in LLM Agents"
url: "https://arxiv.org/abs/2608.07438"
collected_at: "2026-08-11T11:34:17+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [llm-agent, memory, affect, npc, character-simulation, evaluation]
evaluated_at: "2026-08-11T11:37:34+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-11T11:48:42+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786416498654479"
next_action: none
stale_after: "2026-09-10"
supersedes: []
posted:
  ts: "1786416498.654479"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1786416498654479"
  char_count: 3541
  posted_at: "2026-08-11T11:48:42+09:00"
gate_reason: >-
  factual / affective memory の分離、二段階検索、conflict-aware controller、比較実験と
  非有意だった人手評価まで重要要素を抽出でき、長期 NPC の未解決葛藤を扱う設計へ具体的に適用できる。
  効果と限界を併記すれば、CoopEval 水準の概要と批判的分析を構成できる。
suggested_post_outline:
  overview_angle: "意味的に近い記憶ではなく、現在の葛藤に効く記憶をどう想起させるかという設計問題"
  analysis_axis: "二系統記憶と二段階検索の寄与を、取得率の改善と人手評価の非有意差の両面から検討する"
  application_target: "長期会話 NPC・仲間キャラクターの未解決対立、感情的出来事、関係変化を会話と行動選択へ再浮上させる記憶層"
  pros_cons: "葛藤に重要な記憶を拾いやすく内部状態も観察可能になる一方、意味的一致の低下、評価規模の小ささ、感情 salience の固定化リスクがある"
  verdict_pre: "部分採用。まず既存 NPC 記憶へ affective channel と検索ログを可逆に追加し、応答一貫性と反復・執着の増加を対照評価する"
---

## raw_excerpt

収集時の抄録メモ（要約）。人間の想起は話題の近さだけで決まらず、感情的な重要度や未解決の葛藤も、どの経験が現在の判断へ現れるかを左右するという問題設定から出発する。PsychoAgent は、LLM agent の記憶を factual memory と affective memory に分け、conflict-aware executive controller で統合する。感情記憶はまず意味的関連性で絞り、その後 salience で並べ替えるため、話題との整合を保ちながら感情的に重要な痕跡をpromptへ入れられる。3つのcontrolled conflict scenarioでは、葛藤に重要な記憶の取得率がfull architectureで0.933、semantic-affective baselineで0.500、single-memory RAGで0.667だった。一方でsemantic similarityには小さな低下がある。27出力を5人のblinded raterが評価し、rater内標準化後の総合平均はfull architectureが最も高い（+0.22 SD）が、補正後のpairwise differenceは有意ではなかった。3日間のillustrative traceでは、感情状態の持続、offline memory recombination、選択的なmemory reweightingも示している。

## why_relevant_to_games

長期会話するNPCや仲間キャラクターで、単なる意味検索では落ちる「未解決の対立」や感情的出来事を、観察可能な別memory channelとして扱う設計例になる。
