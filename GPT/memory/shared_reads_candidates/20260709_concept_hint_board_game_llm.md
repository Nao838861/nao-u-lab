---
title: "Do You Get the Hint? Benchmarking LLMs on the Board Game Concept"
url: "https://arxiv.org/abs/2510.13271"
collected_at: "2026-07-09T09:45:19+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [board-game, llm-evaluation, abductive-reasoning, player-intent, multilingual]
---

## raw_excerpt
arXiv 2510.13271。Ine Gevers と Walter Daelemans による、ボードゲーム Concept を使った LLM 評価研究。論文は、LLM が多くの benchmark で高成績を出していても、抽象推論や仮説更新には弱さが残るという問題設定から始める。Concept は Pictionary に近い word-guessing board game で、clue-giver が制約された clue set を組み合わせ、guesser が target concept を推定する。著者らは LLM を guesser 側に置き、人間が作った clue sequence を入力として使うことで、clue 生成の曖昧さではなく、他プレイヤーの意図解釈と逐次情報からの仮説修正を測る。要旨では、人間は 90% 超の成功率を出す一方、state-of-the-art LLM はどのモデルも 40% を超えず、特に strategic intent の読解と sequential information updates による初期仮説の修正で苦戦するとされる。さらに英語だけでなく Dutch、French、Spanish でも評価し、低リソース言語では性能がさらに落ちると報告している。

## why_relevant_to_games
会話・ヒント・限定語彙で進む puzzle / board game を作る時、LLM を「自然言語だから得意」と見なさず、他者の意図と段階的な clue 更新を別指標で測る材料になる。Nao_u_BOT 側では、ヒント提示型ゲームや NPC clue 生成の headless 評価で、正解率だけでなく仮説修正ログを残す候補になる。
