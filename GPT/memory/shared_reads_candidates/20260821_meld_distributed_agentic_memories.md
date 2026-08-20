---
title: "MELD: A Protocol for Merging Knowledge Across Distributed Agentic Memories"
url: "https://arxiv.org/abs/2608.16357"
collected_at: "2026-08-21T07:31:25+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-production, multi-agent, memory, knowledge-graph, conflict-preservation]
---

## raw_excerpt

※ arXiv abstract の要点を日本語で抄録したもの（逐語引用ではない）。

複数の自律 agent は通信や相互の tool 呼び出しはできても、別々の memory にある同義の事実、離れて保持された関連事実、互いに矛盾する主張を安全に統合する共通 protocol を持たない。MELD は各 memory を独立したまま federation として接続し、入ってきた claim を insert / merge / relate / conflict / reject の5結果へ振り分ける。判定には scope 付き claim key、embedding 類似度、natural-language-inference の3信号と context / freshness gate を使い、状態変更は監査・認証可能な Patch だけを経由する。claim ごとの status CRDT と publish/subscribe transport により中央 coordinator なしで partition 復旧後も status を再収束させ、矛盾は真偽を勝手に決めず後の裁定用に保持する。HotpotQA distractor では centralized store に対する recall 非劣性、naive union より約11%少ない live storage での recall 改善、merge classifier AUC 0.968・false-merge rate 0.013、partition-heal 実験30/30での再収束、同等 recall で約3分の1の message 数を報告している。

## why_relevant_to_games

ゲーム制作で設計 agent・実装 agent・playtest agent が別々に得た知識を、同義統合・関連付け・矛盾保持を区別して再結合する仕組みの参照になる。特に「仕様変更」と「観測差」を silent overwrite せず残す工程に接続できそうな素材。
