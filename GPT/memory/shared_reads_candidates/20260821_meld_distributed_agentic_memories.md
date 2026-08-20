---
title: "MELD: A Protocol for Merging Knowledge Across Distributed Agentic Memories"
url: "https://arxiv.org/abs/2608.16357"
collected_at: "2026-08-21T07:31:25+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-production, multi-agent, memory, knowledge-graph, conflict-preservation]
evaluated_at: "2026-08-21T07:35:39+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-21T07:42:52+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787265764020219"
next_action: none
stale_after: "2026-09-20"
supersedes: []
gate_reason: >-
  5分類の統合手順、scope・類似度・NLI・freshness の判定信号、監査可能 Patch と CRDT 再収束、比較実験と誤統合率まで揃い、手法と評価を約4000字で具体的に説明できる。
  build・level・seed を scope にした設計仕様／実装状態／playtest 観測の統合へ直接写像でき、仕様変更と条件差による矛盾を silent overwrite しない運用として検証可能である。
suggested_post_outline:
  overview_angle: "分散した agent memory を一つへ潰さず、claim ごとに統合・関連・矛盾を判別して再収束させる protocol として説明する"
  analysis_axis: "5分類 admission、三信号と context/freshness gate、Patch・status CRDT・pub/sub の責務分離を、精度・容量・通信量・partition-heal の評価と対応づける"
  application_target: "ゲーム制作の設計仕様・実装記録・playtest 観測に build／level／seed scope を付け、同義統合と仕様変更・観測差の矛盾保持を分離する小規模な memory merge probe"
  pros_cons: "利点は由来と矛盾を保ったまま分散記憶を再利用できること。欠点は NLI/embedding 誤判定、scope 設計と人手裁定の運用コスト、QA ベンチから実制作への外挿が未検証なこと"
  verdict_pre: "部分採用。まず限定された game-production claim で分類ログと誤統合率を測り、全面的な federation 化は後段に置く"
posted:
  ts: "1787265764.020219"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787265764020219"
  char_count: 4463
  posted_at: "2026-08-21T07:42:52+09:00"
---

## raw_excerpt

※ arXiv abstract の要点を日本語で抄録したもの（逐語引用ではない）。

複数の自律 agent は通信や相互の tool 呼び出しはできても、別々の memory にある同義の事実、離れて保持された関連事実、互いに矛盾する主張を安全に統合する共通 protocol を持たない。MELD は各 memory を独立したまま federation として接続し、入ってきた claim を insert / merge / relate / conflict / reject の5結果へ振り分ける。判定には scope 付き claim key、embedding 類似度、natural-language-inference の3信号と context / freshness gate を使い、状態変更は監査・認証可能な Patch だけを経由する。claim ごとの status CRDT と publish/subscribe transport により中央 coordinator なしで partition 復旧後も status を再収束させ、矛盾は真偽を勝手に決めず後の裁定用に保持する。HotpotQA distractor では centralized store に対する recall 非劣性、naive union より約11%少ない live storage での recall 改善、merge classifier AUC 0.968・false-merge rate 0.013、partition-heal 実験30/30での再収束、同等 recall で約3分の1の message 数を報告している。

## why_relevant_to_games

ゲーム制作で設計 agent・実装 agent・playtest agent が別々に得た知識を、同義統合・関連付け・矛盾保持を区別して再結合する仕組みの参照になる。特に「仕様変更」と「観測差」を silent overwrite せず残す工程に接続できそうな素材。
