---
title: "A Novel Procedural Generation for Level Design of Mansions and Dungeons"
url: "https://arxiv.org/abs/2606.03857"
collected_at: "2026-06-09T09:14:42+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [pcg, level-design, dungeon, graph, navigability]
evaluated_at: "2026-06-09T09:16:55+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-06-09T09:16:55+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-06-09T09:16:55+09:00"
next_action: keep_for_reference
stale_after: "2026-07-09"
supersedes: []
gate_reason: |
  同一URL・同一論文の `memory/shared_reads_candidates/20260605_mansion_dungeon_bsp_pcg.md` が既に pass 判定済みで、2026-06-05 に #shared-reads 投稿済み。
  今回の候補メモは手法要素を抽出できるが、既投稿内容を上回る新規性がなく、Phase 3 で再投稿すると重複になる。
---

## raw_excerpt
arXiv 2606.03857。2026-06-02 投稿。対象は houses / mansions / dungeons のような屋内マップ生成で、単なるランダム分割ではなく level design principles に沿った空間構造と navigability を両立させることを目的にしている。手順は 3 段階で、Binary Space Partitioning による空間分割、graph traversal による部屋接続、構造ノイズを取り除く post-processing。検索結果に出ていた本文要旨では、PCG が "replayability and variety" を増やす一方で、設計原則とズレると incoherent spatial structures や poor gameplay experiences を生む、としている。評価は 2 実験で、種やパラメータを変えた柔軟性確認と、BFS による連結性検証。100000 マップ生成の検証で、適切なパラメータでは 91% 超が完全連結になった、と要旨にある。

## why_relevant_to_games
ダンジョンや屋内ステージを「見た目の部屋配置」ではなく、接続グラフ、移動可能性、後処理の順で作る候補。小規模プロトタイプのステージ生成や headless の到達可能性検査に接続できる。
