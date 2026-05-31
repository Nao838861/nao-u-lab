---
title: "AutoUE: Automated Generation of 3D Games in Unreal Engine via Multi-Agent Systems"
url: https://arxiv.org/abs/2603.07106
collected_at: 2026-05-13T00:02:14+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, ai-agent, unreal-engine, automated-testing, 3d-generation]
evaluated_at: 2026-05-13T00:18:00+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-13T00:23:53.8139214+09:00"
last_decision: posted
stale_after: "2026-06-12"
supersedes: []
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778599412481529"
posted:
  ts: "1778599412.481529"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1778599412481529"
  char_count: 4220
  posted_at: "2026-05-13T00:23:53.8139214+09:00"
next_action: none
gate_reason: >
  問題設定、multi-agent 分業、RAG による tool-use hallucination 対策、automated play-testing pipeline が候補内で抽出できる。
  Nao_u 環境では asset/code/test を分離した prototype 生成と runtime 検証設計に具体接続でき、投稿水準の概要を組める。
suggested_post_outline:
  overview_angle: "Unreal 3D game generation を、生成モデルの派手さではなく engine constraints と automated testing を含む end-to-end workflow として説明する"
  analysis_axis: "model retrieval / scene generation / gameplay code synthesis / runtime test command の分業と、tool-use hallucination をどう抑えるか"
  application_target: "小規模ゲーム prototype の asset-code-test 分割、生成後の動的検証、playtest phase の設計"
  pros_cons: "メリットは制作工程を検証可能な部品に分けられる点。デメリットは Unreal 前提の重さ、dataset と engine API 依存、論文レベルの再現コスト。"
  verdict_pre: "部分採用"

---

## raw_excerpt
著作権配慮のため長文引用ではなく、arXiv abstract の要点メモとして保存する。AutoUE は、商用ゲームエンジンでの 3D ゲーム自動生成を、複数エージェントの協調問題として扱う論文。対象は scene / blueprint / code のような Unreal Engine 関連 workflow を含み、model retrieval、scene generation、gameplay and interaction code synthesis、automated game testing を end-to-end に接続する構成になっている。

LLM の tool-use hallucination を抑えるために、Unreal Engine の tool documentation を retrieval-augmented generation で参照し、コード生成には game design patterns と engine constraints を組み込む。さらに runtime test command を生成・実行する automated play-testing pipeline を設計し、dynamic behavior の systematic evaluation を行う。論文は game generation dataset を構築し、一連の実験で end-to-end 生成能力と、これらの設計要素の有効性を検証したと述べている。ACL 2026 Findings full paper として受理済み。

短い原文句: "end-to-end generate 3D games" / "tool-use hallucinations" / "automated play-testing pipeline"

## why_relevant_to_games
Nao_u 環境でのゲーム prototype 生成を、asset/code/test の分離と runtime test command に分解する参考になる。特に「生成後に動的挙動を検査する」フェーズ設計の候補材料。
