---
title: "Procedural Generation of 3D Maps with Snappable Meshes"
url: "https://arxiv.org/abs/2108.00056"
collected_at: "2026-06-05T01:35:00+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [pcg, level-design, 3d-map, unity, designer-control]
evaluated_at: "2026-06-05T01:45:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: postpone
status: failed
candidate_status: failed
last_reviewed_at: "2026-07-19T14:50:31+09:00"
last_decision: failed_duplicate_of_terminal_sibling
evidence: "group_handoff:gha-18aea31729c5baa5; terminal:memory/shared_reads_candidates/20260515_snappable_meshes_3d_map_pcg.md: posted; https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1781751066262309; posted_source_url_match; reason:posted-source index が arXiv:2108.00056 の実 Slack 投稿を exact URL/work 一致で確認したため open siblings は再投稿候補として閉じる"
next_action: none
stale_after: "2026-07-05"
supersedes: []
postpone_reason: "Phase 3 duplicate check: same paper was already posted as memory/shared_reads_candidates/20260515_snappable_meshes_3d_map_pcg.md at p1778826283429469."
gate_reason: "premade meshes、designer constraints、snapping、navigability feedback という中核が明瞭で、完全自動生成ではなく制作補助 PCG としてゲーム制作への適用が具体的。3D/疑似3Dレベル制作の部品設計・接続制約・通行可能性検査へ直接つなげられる。"
suggested_post_outline:
  overview_angle: "3D map PCG を『完全自動生成』ではなく、手作り部品と接続制約でデザイナーの意図を保つ制作補助として紹介する。"
  analysis_axis: "premade mesh の表現力、snapping constraints、piece selection、navigability feedback、Unity prototype の実用性を見る。"
  application_target: "小規模 3D/疑似3Dゲームで、部屋・通路・段差・視線抜けを部品化し、生成直後に通行可能性を返すレベル制作ワークフローへ適用する。"
  pros_cons: "メリットは見た目の制御と高速な反復。デメリットは部品ライブラリ作成コストと、制約が弱いと既視感の強い地形になりやすい点。"
  verdict_pre: "採用。PCG を生成魔法ではなく、部品設計と検査ループとして導入する。"
---

## raw_excerpt

arXiv abstract は、premade meshes を designer-specified visual constraints に基づいて snap させる 3D map procedural generation technique を提示している。提案手法は size / layout limitations を避けつつ、designer が map の look and feel を制御でき、navigability への immediate feedback も得られるとする。prototype implementation は Unity engine で実装され、multiplayer game での利用例と、parameterization や piece selection method を示す複数の illustrative examples が分析されている。論文は、この technique を designer-centric map composition method としても、3D level design の prototyping system としても使えると位置づける。完全自動生成だけでなく、あらかじめ作られた部品と制約を組み合わせて、制作者が見た目と通行可能性を保ちながら短時間で map / level を作る方向の PCG である。

## why_relevant_to_games

3D や疑似 3D のレベルを作る時、完全生成ではなく「手で作った部品 + 接続制約 + navigability feedback」に寄せる設計の候補になる。
