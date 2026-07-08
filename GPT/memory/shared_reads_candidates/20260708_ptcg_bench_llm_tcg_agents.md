---
title: "PTCG-Bench: Can LLM Agents Master Pokemon Trading Card Game?"
url: "https://arxiv.org/abs/2605.29653v1"
collected_at: "2026-07-08T11:44:12+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, llm-agent, benchmark, card-game, self-evolution]
---

## raw_excerpt

arXiv abstract の要点メモとして保存する。対象は Pokemon Trading Card Game を使った LLM agent benchmark。問題設定は、戦略的に複雑な board/card game では、人間は数回遊ぶだけで戦略を学び始める一方、既存 agent benchmark は realistic interactive environments における strategic and evolving decision-making を十分に捉えにくい、という点にある。

PTCG-Bench は評価を二層に分ける。第一に、単一の複雑な環境内での意思決定性能。第二に、蓄積した経験を通じて自己進化できるか。さらに modular harness ablation を入れ、agent performance を model capability と混同しないようにする。実験結果では、LLM agent は non-trivial な gameplay performance を示すが、持続的で安定した self-evolution は難しく、性能は harness design に敏感だとされる。

出典確認: arXiv:2605.29653v1、2026-05-28 submitted。著者は Dongdong Hua, Yifei Sun, Renhong Huang, Feng Gao, Chunping Wang, Yang Yang。

## why_relevant_to_games

カードゲームや戦略ゲームの prototype を、単発スコアではなく「経験を積んだ後に戦略が安定して改善するか」で評価する候補。harness ablation を分けて見る点は headless playtest の設計にも使える。
