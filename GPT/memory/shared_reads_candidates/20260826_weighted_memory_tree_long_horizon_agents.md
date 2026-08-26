---
title: "Weighted Memory Tree: Remembering What Matters for Long-Horizon LLM Agents"
url: "https://arxiv.org/abs/2608.20631v1"
collected_at: "2026-08-26T22:34:36+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [agent-memory, long-horizon, game-development, evaluation]
---

## raw_excerpt

LLM agent は計画、tool use、外部情報取得を含む multi-step task を解ける一方、実行履歴が長くなるほど推論 cost が増え、古い・無関係・誤誘導的な情報が reasoning を劣化させる。既存の memory 手法は履歴を整理・圧縮しても、どの記憶を active に残すかを決める仕組みが弱い。Weighted Memory Tree（WMT）は実行過程を task、subtask、action の階層に編成し、各 memory に動的な retention score を与える。event-based update と selection-based decay により score を更新し、有用な情報を保持し、完了 trajectory を fold し、utility の低い内容を抑制しつつ、fold 済み context へのアクセスも残す。評価は GAIA-Text 上で Qwen3-8B、Gemma 4 E4B、Llama-3.1-8B を使い、ablation と memory-poisoning experiment も実施した。linear memory と比べて accuracy は平均 9.97 percentage points 向上し、prompt token 使用量は 32.8%減少したと報告される。poisoning 実験では unreliable information の持続と伝播が抑えられた。著者らは、long-horizon memory では保存量より「何を active に残すか」の決定が重要だと結論づけている。

## why_relevant_to_games

複数 commit・playtest・修正をまたぐゲーム制作で、現行仕様、未解決 failure、完了した試行、古い判断を active / folded に分ける memory 設計の参照になる。制作 agent が過去の失敗情報や陳腐化した設計を次の playable diff へ持ち越す場面の検証候補として使える。
