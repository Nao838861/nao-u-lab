---
title: "PsychoAgent: An Affect-Sensitive Cognitive Architecture for Conflict-Aware Memory in LLM Agents"
url: "https://arxiv.org/abs/2608.07438"
collected_at: "2026-08-11T11:34:17+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [llm-agent, memory, affect, npc, character-simulation, evaluation]
---

## raw_excerpt

収集時の抄録メモ（要約）。人間の想起は話題の近さだけで決まらず、感情的な重要度や未解決の葛藤も、どの経験が現在の判断へ現れるかを左右するという問題設定から出発する。PsychoAgent は、LLM agent の記憶を factual memory と affective memory に分け、conflict-aware executive controller で統合する。感情記憶はまず意味的関連性で絞り、その後 salience で並べ替えるため、話題との整合を保ちながら感情的に重要な痕跡をpromptへ入れられる。3つのcontrolled conflict scenarioでは、葛藤に重要な記憶の取得率がfull architectureで0.933、semantic-affective baselineで0.500、single-memory RAGで0.667だった。一方でsemantic similarityには小さな低下がある。27出力を5人のblinded raterが評価し、rater内標準化後の総合平均はfull architectureが最も高い（+0.22 SD）が、補正後のpairwise differenceは有意ではなかった。3日間のillustrative traceでは、感情状態の持続、offline memory recombination、選択的なmemory reweightingも示している。

## why_relevant_to_games

長期会話するNPCや仲間キャラクターで、単なる意味検索では落ちる「未解決の対立」や感情的出来事を、観察可能な別memory channelとして扱う設計例になる。
