---
title: "Do You Get the Hint? Benchmarking LLMs on the Board Game Concept"
url: "https://arxiv.org/abs/2510.13271"
collected_at: "2026-07-09T09:45:19+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [board-game, llm-evaluation, abductive-reasoning, player-intent, multilingual]
evaluated_at: "2026-07-09T09:48:19+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-09T09:48:19+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-09T09:48:19+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-08"
supersedes: []
gate_reason: "Concept の clue sequence を使い、LLM の他者意図解釈と逐次的な仮説修正を分離して測る問題設定が明確。人間 90% 超に対して SOTA LLM が 40% 未満という差も、自然言語ゲーム評価で見落としやすい失敗を示す根拠になる。ヒント提示型ゲームや NPC clue 評価に、正解率だけでなく仮説更新ログを残す具体的な適用先がある。"
suggested_post_outline:
  overview_angle: "ボードゲーム Concept を、LLM の自然言語能力ではなく他者意図の読解と逐次 clue からの仮説修正を測る評価器として読む。"
  analysis_axis: "問題設定、clue-giver / guesser 分離、人間作成 clue sequence、成功率比較、多言語評価、strategic intent と sequential update の失敗を軸に整理する。"
  application_target: "Nao_u_BOT のヒント提示型ゲーム、会話パズル、NPC clue 生成の headless 評価で、正解率に加えて仮説修正ログと意図解釈失敗を記録する評価設計へ使う。"
  pros_cons: "メリットはヒント理解を実ゲーム由来の constrained clue task として測れること。デメリットは Concept 固有の視覚記号・語彙制約が強く、アクションゲームや自由会話 NPC へは評価軸を翻訳する必要があること。"
  verdict_pre: "採用。Phase 3 では LLM ベンチマーク紹介ではなく、ヒント型ゲームの評価設計と仮説修正ログへの転用を中心に書く。"
---

## raw_excerpt
arXiv 2510.13271。Ine Gevers と Walter Daelemans による、ボードゲーム Concept を使った LLM 評価研究。論文は、LLM が多くの benchmark で高成績を出していても、抽象推論や仮説更新には弱さが残るという問題設定から始める。Concept は Pictionary に近い word-guessing board game で、clue-giver が制約された clue set を組み合わせ、guesser が target concept を推定する。著者らは LLM を guesser 側に置き、人間が作った clue sequence を入力として使うことで、clue 生成の曖昧さではなく、他プレイヤーの意図解釈と逐次情報からの仮説修正を測る。要旨では、人間は 90% 超の成功率を出す一方、state-of-the-art LLM はどのモデルも 40% を超えず、特に strategic intent の読解と sequential information updates による初期仮説の修正で苦戦するとされる。さらに英語だけでなく Dutch、French、Spanish でも評価し、低リソース言語では性能がさらに落ちると報告している。

## why_relevant_to_games
会話・ヒント・限定語彙で進む puzzle / board game を作る時、LLM を「自然言語だから得意」と見なさず、他者の意図と段階的な clue 更新を別指標で測る材料になる。Nao_u_BOT 側では、ヒント提示型ゲームや NPC clue 生成の headless 評価で、正解率だけでなく仮説修正ログを残す候補になる。
