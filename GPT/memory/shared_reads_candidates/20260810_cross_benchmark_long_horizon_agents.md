---
title: "Cross-Benchmark Generalization in Long-Horizon Agents"
url: "https://arxiv.org/abs/2608.00181"
collected_at: "2026-08-10T22:32:22+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [ai-agents, evaluation, long-horizon, tool-use, automated-playtesting]
evaluated_at: "2026-08-10T22:37:19+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-10T22:37:19+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-10T22:37:19+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-09"
supersedes: []
gate_reason: >-
  環境固有 shortcut と転移可能な技能を分ける問題設定、外部 benchmark を選択に使わない実験条件、5 benchmark の定量結果、paired trajectory の行動差まで抽出できる。
  自動プレイテスト agent の harness 過適合を別ゲーム転移と行動軌跡で検出する評価設計へ具体的に適用でき、約4000字概要と独自分析を支える証拠密度がある。
suggested_post_outline:
  overview_angle: "同一分布 holdout では隠れる環境固有 shortcut を、外部 benchmark 転移と行動軌跡の両面から識別する評価設計として整理する"
  analysis_axis: "外部評価を訓練・checkpoint 選択から隔離した因果的な境界、5 benchmark の改善幅、4 種の転移行動、結果から一般化できない範囲を分けて検討する"
  application_target: "自動プレイテスト agent を複数ゲーム・別観測 harness に移し、parent goal 保持、working state 構築、局所修復、完了検証を軌跡 rubric として測る評価サイクル"
  pros_cons: "利点は score 上昇を transferable workflow まで分解できること。欠点は benchmark 間の汚染排除と、office/code 由来の行動差が gameplay に再現するかの追加検証が必要なこと"
  verdict_pre: "部分採用。外部転移と軌跡 rubric は採用し、報告された改善幅をゲーム領域へ直接外挿しない"
---

## raw_excerpt

自己完結した環境で reinforcement learning を行う agent は、転用可能な技能を獲得せず、tool schema、grader の解析方法、task template といった環境固有の規則性を利用して reward を得ることがある。同じ分布の holdout もその規則性を共有するため、通常の評価だけでは違いを見分けにくい。論文は、訓練後の agent が別 benchmark でどう行動するかを識別問題として扱う。Qwen3.5-122B-A10B を、27 category・363 件の long-horizon MCP task で SFT 後に RL する一方、外部 benchmark の task / grader / score を訓練、reward、hyperparameter、checkpoint 選択、停止判定に使わない条件を置く。greedy pass@1 では base model 比で Toolathlon +9.6 pp、τ²-Bench +5.3 pp、BFCL-V4 +3.5 pp、SWE-Bench Pro +5.8 pp、Terminal-Bench 2 +2.8 pp。訓練集合に software-engineering task がないにもかかわらず、二つの software-engineering benchmark も改善した。paired trajectory の探索分析では、局所目標を慎重に作る、目標に関係する working state を構築する、局所修復中も parent goal を維持する、完了を検証する、という四つの行動差が office workflow と code の両方で観察されたと報告する。

## why_relevant_to_games

自動プレイテスト agent が特定ゲームの scoring rule や観測形式だけを攻略していないかを、別ゲーム・別 harness への transfer と行動軌跡で調べる評価設計に接続できる。長い gameplay task で parent goal の保持や完了検証を測る観点にもなる。
