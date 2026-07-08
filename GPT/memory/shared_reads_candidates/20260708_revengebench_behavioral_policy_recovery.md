---
title: "RevengeBench: Reverse Engineering Code-Space Policies from Behavioral Experiments"
url: "https://arxiv.org/abs/2606.26094v1"
collected_at: "2026-07-08T13:44:20+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-ai, evaluation, opponent-modeling, behavioral-probes, llm-agent, interpretability]
evaluated_at: "2026-07-08T13:48:27+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postponed
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-07-08T13:51:28+09:00"
last_decision: postponed
evidence: "duplicate of posted candidate https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782430090951209"
next_action: none
stale_after: "2026-08-07"
duplicate_of:
  path: "memory/shared_reads_candidates/20260626_revengebench_behavioral_policy_recovery.md"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1782430090951209"
supersedes: []
phase3_final_reason: |
  2026-07-08 Phase 3 の最終判定で、同じ arXiv URL / 同じ RevengeBench 主題が 2026-06-26 に #shared-reads 投稿済みであることを確認した。
  今回の候補は Phase 2 では pass だったが、#shared-reads の品質ゲートでは重複投稿を避けるため postponed に戻す。
gate_reason: |
  問題設定、probe opponent、実行可能な policy code 復元、行動距離評価、downstream tournament への接続が候補本文だけで抽出できる。
  Log_cdx のゲーム制作では、敵 AI やテストプレイヤーの「隠れた癖」を行動ログから検査する評価設計に直結し、4000字級の概要に展開できる。
suggested_post_outline:
  overview_angle: "行動ログから hidden policy を復元し、probe 設計で情報を引き出す benchmark として整理する"
  analysis_axis: "観測軌跡、custom opponent policy、実行可能コード仮説、continuous action-distance metrics、tournament signal の関係"
  application_target: "ヘッドレス評価で敵 AI や自動プレイヤーの癖を可視化し、単純な勝率では見えない方策差分を検査する probe 設計"
  pros_cons: "メリットは行動品質の理由を probe とコード仮説に落とせる点。デメリットは小規模ゲームでも probe 設計と距離指標の実装負荷が高い点"
  verdict_pre: "部分採用。shared-reads では評価思想を採用し、実装は小型ゲームのログ分析 probe から試す"
---

## raw_excerpt
arXiv の要旨では、観測された行動だけからゲーム環境内エージェントの隠れた意思決定プログラムを実行可能コードとして復元できるか、さらに制御実験を設計できると復元がどれだけ改善するかを問うている。RevengeBench は、5 つのゲーム環境にまたがる 75 個の LLM 生成・Elo 校正済み policy を対象に、CodeClash tournament の軌跡から構成された benchmark と説明されている。

短い原文メモ: "custom opponent policies" / "continuous action-distance metrics" / "opponent modeling"。

学習側は hidden target policy が sampled opponents と対戦する様子を観測し、情報を引き出すための probe として custom opponent policy を設計する。その後、実行可能な仮説コードを提出し、行動距離メトリクスで評価される。12 個の frontier LLM では復元品質に大きな差があり、復元コードは downstream の player-versus-player tournament でも競争上のシグナルを持つとされている。

## why_relevant_to_games
ヘッドレス評価で「動きが良い/悪い」を見るだけでなく、敵・プレイヤー・AI 方策の隠れた癖を probe であぶり出す設計に使えそうな候補。
