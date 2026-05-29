---
title: "Knowledge Graph-enhanced Large Language Model for Incremental Game PlayTesting"
url: "https://cir.nii.ac.jp/crid/1390025739150970624"
collected_at: "2026-05-30T00:14:41+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-testing, playtesting, knowledge-graph, llm-agent, regression-testing]
---

## raw_excerpt

CiNii / IEICE 掲載情報によると、KLPEG は更新頻度の高い modern video game の playtesting に対し、Knowledge Graph と LLM を組み合わせる枠組み。LLM ベースの automated playtesting は有望だが、structured knowledge accumulation が弱いと、incremental update に合わせた precise / efficient testing が難しい、という問題設定を置く。KLPEG は game elements、task dependencies、causal relationships を KG として構築・維持し、version をまたいだ knowledge accumulation と reuse を可能にする。その上で、natural language update log を LLM が解析し、KG 上の multi-hop reasoning で影響範囲を特定し、update-tailored test cases を生成する。Overcooked と Minecraft の 2 環境で、更新によって影響を受ける機能の定位と、より少ない手順でのテスト完了を評価している。

## why_relevant_to_games

Nao_u_BOT の game/* は短いサイクルで仕様が変わるため、変更ログから影響範囲を引いて headless test を作る発想と近い。version ごとの失敗知識を KG として再利用する候補。
