---
title: A Strategy-based Framework for Exploratory Playtesting in Open-World Games
url: https://conf.researchr.org/details/icse-2026/icse-2026-doctoral-symposium/34/A-Strategy-based-Framework-for-Exploratory-Playtesting-in-Open-World-Games
collected_at: "2026-08-20T03:03:34+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-testing, playtesting, open-world, exploratory-testing, ai-agent]
evaluated_at: "2026-08-20T03:09:10+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-20T03:09:10+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-08-20T03:09:10+09:00"
next_action: keep_for_reference
stale_after: "2026-09-19"
supersedes: []
gate_reason: >-
  人間の探索戦略と構造化プレイトレースを agentic playtesting へつなぐ問題設定と適用先は明確である。
  しかし doctoral symposium の研究構想で、実装された戦略表現、データ収集条件、比較実験、結果、限界をまだ示さない。
  手法の中核と評価の中身・結論を抽出できず、約4000字の「残すべき」分析には達しないため不採用とする。
---

## raw_excerpt

ICSE 2026 Doctoral Symposiumで発表された、オープンワールドゲーム向け探索的プレイテストの研究構想。ゲームは複雑で動的なため、一般ソフトウェアで進展した自動テストだけでは、プレイヤー体験や相互作用から現れる予期しない挙動を捉えにくく、依然として人手のプレイテストへの依存が大きいと問題設定する。提案するxPloiTは、ドメイン固有のテスト戦略を使って、プレイテスターによるセッションの計画・実行・記録を一貫した形に構造化するフレームワークである。戦略はテスト中の探索方針を与えるだけでなく、何を試し、どの順に実行し、何を観察したかを後から扱える記録へ変換する役割を持つ。その過程で得られる構造化プレイトレースを、探索的な振る舞いを模倣するagentic playtesting systemの学習・モデル化データとして利用する。最終目標は、実際のテスターに近い探索行動を再現するエージェントを作り、人間の知見を起点とした半自動テストへ接続することにある。掲載ページでは2026年4月14日・15日のポスター発表として案内され、発表者はFederal University of Sao CarlosのYohan Duarteと記載されている。

## why_relevant_to_games

自由度の高いゲームで、漫然とした自動操作ではなく「人間が何を狙って探索したか」を再利用可能な戦略とトレースにする設計例。Nao_u作品のプレイテスト記録を将来agent評価へ接続する際のデータ形式やセッション設計に活かせる。
