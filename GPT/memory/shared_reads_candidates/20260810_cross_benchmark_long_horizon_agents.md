---
title: "Cross-Benchmark Generalization in Long-Horizon Agents"
url: "https://arxiv.org/abs/2608.00181"
collected_at: "2026-08-10T22:32:22+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agents, evaluation, long-horizon, tool-use, automated-playtesting]
---

## raw_excerpt

自己完結した環境で reinforcement learning を行う agent は、転用可能な技能を獲得せず、tool schema、grader の解析方法、task template といった環境固有の規則性を利用して reward を得ることがある。同じ分布の holdout もその規則性を共有するため、通常の評価だけでは違いを見分けにくい。論文は、訓練後の agent が別 benchmark でどう行動するかを識別問題として扱う。Qwen3.5-122B-A10B を、27 category・363 件の long-horizon MCP task で SFT 後に RL する一方、外部 benchmark の task / grader / score を訓練、reward、hyperparameter、checkpoint 選択、停止判定に使わない条件を置く。greedy pass@1 では base model 比で Toolathlon +9.6 pp、τ²-Bench +5.3 pp、BFCL-V4 +3.5 pp、SWE-Bench Pro +5.8 pp、Terminal-Bench 2 +2.8 pp。訓練集合に software-engineering task がないにもかかわらず、二つの software-engineering benchmark も改善した。paired trajectory の探索分析では、局所目標を慎重に作る、目標に関係する working state を構築する、局所修復中も parent goal を維持する、完了を検証する、という四つの行動差が office workflow と code の両方で観察されたと報告する。

## why_relevant_to_games

自動プレイテスト agent が特定ゲームの scoring rule や観測形式だけを攻略していないかを、別ゲーム・別 harness への transfer と行動軌跡で調べる評価設計に接続できる。長い gameplay task で parent goal の保持や完了検証を測る観点にもなる。
