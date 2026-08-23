---
title: "Remember, Verify, or Ask? Cross-Family Evaluation of Memory Commitment in LLM Agents"
url: "https://arxiv.org/abs/2608.19564"
collected_at: "2026-08-24T07:33:15+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [llm-agent, agent-memory, evaluation, npc, playtesting]
---

## raw_excerpt

arXiv 要旨からの取得メモ。永続記憶を持つ LLM agent は、対話中に得た情報を何でも保存すればよいわけではなく、永続化する、現在の文脈だけで使う、外部情報を再検証する、曖昧さをユーザーへ質問する、という境界判断を必要とする。本論文はこの memory-clarification boundary を測る MCB を提示する。MCB は primary scenario 140件（development 70件、held-out 70件）と、別の contrast set 70件からなり、自然言語上の action label だけでなく structured tool-call selection も評価する。held-out と contrast の計140件は非著者2名が独立にラベル付けし、一致率97.1%、Cohen's kappa 0.962。Claude と Qwen の比較では、変化しうる事実を検証する能力に比べ、曖昧さを質問で解消する能力が弱かった。Qwen の素の設定は clarification 12件中0件で質問せず、freshness 18件中12件では検証を選んだ。few-shot prompting は accuracy を0.557から0.771へ上げたが、clarification recall は0.333に留まった。policy prompt は誤った永続化を0.243から0.100へ下げた。一方、表明した判断と実際の tool call の一致率は Claude 各モデル57%、Qwen 23%であり、記憶方針の評価では回答文と実行選択の両方を見る必要がある。

## why_relevant_to_games

長期運用する NPC、プレイヤーモデル、反復プレイテスト agent が、古い世界状態や曖昧な観測を恒久設定へ誤保存しないための評価ケース設計に使える。特に、発話上の判断だけでなく実際の memory/tool 操作も検証する観点が、ゲーム内 agent の再現可能なテストに接続する。
