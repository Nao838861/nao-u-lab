---
title: "Knowledge Graph-enhanced Large Language Model for Incremental Game PlayTesting"
url: "https://cir.nii.ac.jp/crid/1390025739150970624"
collected_at: "2026-05-30T00:14:41+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-testing, playtesting, knowledge-graph, llm-agent, regression-testing]
evaluated_at: "2026-05-30T00:18:07+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-30T00:42:42+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780068162217169"
posted:
  ts: "1780068162.217169"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780068162217169"
  char_count: 3786
  posted_at: "2026-05-30T00:42:42+09:00"
stale_after: "2026-06-29"
supersedes: []
next_action: none
gate_reason: |
  update log 解析、KG による影響範囲推定、multi-hop reasoning、update-tailored test case 生成、Overcooked / Minecraft 評価まで重要要素が揃っている。
  Nao_u_BOT の短サイクル game/* 改修で、変更ログから headless test の重点を決める用途に直結する。
suggested_post_outline:
  overview_angle: "頻繁に変わるゲームで全回帰を回すのではなく、更新ログを KG 上の依存関係に接続して影響範囲別のテストを作る手法として書く。"
  analysis_axis: "自然言語 update log を LLM が読む部分と、game elements / task dependencies / causal relationships を KG として維持する部分の分担。"
  application_target: "game/* のコミット差分、修正ログ、headless failure atom を結び、次回テストで重点的に通す scene / mechanic / route を選ぶ仕組み。"
  pros_cons: "長所は履歴知識の再利用とテスト削減。弱点は KG 更新の手間、ログ粒度への依存、誤った causal edge がテスト漏れにつながる点。"
  verdict_pre: "採用候補。まず小規模な change-log-to-test-plan probe として部分採用する。"

---

## raw_excerpt

CiNii / IEICE 掲載情報によると、KLPEG は更新頻度の高い modern video game の playtesting に対し、Knowledge Graph と LLM を組み合わせる枠組み。LLM ベースの automated playtesting は有望だが、structured knowledge accumulation が弱いと、incremental update に合わせた precise / efficient testing が難しい、という問題設定を置く。KLPEG は game elements、task dependencies、causal relationships を KG として構築・維持し、version をまたいだ knowledge accumulation と reuse を可能にする。その上で、natural language update log を LLM が解析し、KG 上の multi-hop reasoning で影響範囲を特定し、update-tailored test cases を生成する。Overcooked と Minecraft の 2 環境で、更新によって影響を受ける機能の定位と、より少ない手順でのテスト完了を評価している。

## why_relevant_to_games

Nao_u_BOT の game/* は短いサイクルで仕様が変わるため、変更ログから影響範囲を引いて headless test を作る発想と近い。version ごとの失敗知識を KG として再利用する候補。
