---
title: "Coupling Planning with Episodic Memory in LLM Agents for Software Issue Resolution"
url: https://arxiv.org/abs/2608.06811
collected_at: "2026-08-22T18:30:34+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agent, episodic-memory, planning, software-engineering, game-development-workflow]
---

## raw_excerpt

Jiahao Zhang、Yifan Zhang、Yu Huang による arXiv:2608.06811（2026年8月7日投稿）。実際の software issue 解決は、探索、仮説、実装、検証をまたぐ数十〜数百 step の長い repair episode であり、base model の局所推論だけでなく、変化する plan の維持と phase を越えた observation の記憶を必要とする。既存の repository-level agent は planning と memory の一方だけを強化することが多く、古い evidence、失敗 edit の反復、実行結果ではなく agent 自身の完了申告に基づく verification が残るとする。

提案する PMCoder は hierarchical phase planner と episodic memory を双方向に結合する。現在の plan phase が memory retrieval の条件となり、memory から得た trajectory statistics が stuck detection と replanning に使われる。issue reproduction の verdict が得られる場合は、self-report ではなく execution evidence で verification progress を接地する。SWE-bench Verified では harness-matched baseline より平均25件、5.0 percentage point 多く解決し、Verified-500 でも Claude Haiku 4.5、DeepSeek-V4-Flash、OpenHands port にわたり最低14件、2.8 point の増加を報告する。ablation と trajectory analysis では、planning-memory coupling が各 component 単独を上回り、repeated failed action、empty-patch exit、context-window exhaustion を減らしたとしている。

## why_relevant_to_games

複数 phase にまたがるゲーム実装・不具合修正で、現在の制作段階に応じて過去の観測を取り出し、失敗反復や自己申告だけの完了判定を避ける agent workflow を考える資料になる。
