---
title: "Behind the Development of Hand-Drawn Strategy Game Don't Kill Them All"
url: "https://80.lv/articles/behind-the-development-of-hand-drawn-strategy-game-don-t-kill-them-all"
collected_at: "2026-07-24T12:32:27.8233009+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, strategy, tactics, progression-loop, character-design, level-generation, art-pipeline, interview]
evaluated_at: "2026-07-24T12:35:58+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1784864516.751069"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784864516751069"
  char_count: 4494
  posted_at: "2026-07-24T12:41:56.751069+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-07-24T12:42:38.9035811+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1784864516751069"
next_action: none
stale_after: "2026-08-23"
supersedes: []
gate_reason: "主題から戦闘・拠点成長へ降ろす設計、unit 個体化、手作りと配置変化を組み合わせる level 制作、2.5D art pipeline、demo feedback の扱いまで重要要素を具体的に抽出できる。形式的な比較実験ではないが、開発判断と検証の因果をたどれ、Log_cdx の小規模ゲーム制作へ直接転用できるため CoopEval 水準の概要を構成できる。"
suggested_post_outline:
  overview_angle: "「敵を倒し尽くす」power fantasy の反転を、資源保護→拠点成長の一貫した loop に変換した theme-first design として整理する"
  analysis_axis: "主題から mechanic を導く順序、戦闘と macro progression の因果、hand-authored room と配置変化の分担、unit の可読性、少人数 art pipeline、demo feedback の使い分け"
  application_target: "Log_cdx の短期プロトタイプで、戦闘中に守った対象が戦闘後の成長へ残る playable loop、少数の手作り encounter と再配置による反復性、silhouette と trait による状態可読性を設計・検証する場面"
  pros_cons: "長所は主題・mechanic・報酬・制作制約を一本の因果で説明できる点。短所は開発者インタビューであり、定量 playtest、長期 retention、生成配置の品質比較までは示されない点"
  verdict_pre: "部分採用"
---

## raw_excerpt

本文要点の日本語採録。Fika Productions の Vincent Rochette は『Don't Kill Them All』の出発点を、軍勢で進む時に本当に道中の全てを破壊してよいのか、戦利品や資源を残す必要があるのではないか、という問いとして説明する。プレイヤーは攻撃的なオークを強くするだけでなく、その暴力性を抑えて資源を守る。これは数値を上げ続ける通常の power fantasy を反転した構造で、先に lore と主題を決め、その意味に合うよう design を変えたという。

初期制作では、戦術・拠点建設・戦闘を同時に横へ広げるか、一つを縦に完成させるかを検討し、node protection、node gathering、敵 AOE の threat management を含む encounter system を先に作った。戦闘で保存・獲得した資源を何に使うかという次の問いから拠点建設が生まれ、camp の成長が「資源を守る戦略には結果がある」と示す feedback になる。参照元として、Into the Breach の予告された脅威管理、Stardew Valley の日単位の macro loop、Darkest Dungeon の遠征と帰還、Wartales と XCOM の unit への愛着が挙げられている。

raid の地形は完全な procedural generation ではない。20×20 の tile layout と木などの set dressing は手作業で整え、room の接続順は tree として指定する。一方、algorithm が room を置く領域を毎回変え、同じ access point の反復感を隠す。個々のオークには agitation のような trait、武器、装備、移動手段を組み合わせられるが、固定 class 名は提示せず、player が team synergy に応じて独自 archetype を作る。外見の差は build の記憶手掛かりにもなり、戦闘中の出来事から固有の物語を読み取れるようにする。

美術面では専任 modeler がいない制約から、等角投影で描いた2D asset を mesh 化し、camera に合わせて押し出す 2.5D pipeline を採用した。zoom in / out でも読める太い線と単純な silhouette を使い、複数 unit が並んでも情報量が過密にならないようにしている。demo feedback は大幅な方向転換より、同じ bug の報告数による優先順位付けや、players が特に反応した既存機能を今後の実装で強める材料として使われている。

## why_relevant_to_games

主題から core combat を縦に作り、戦闘結果を拠点成長へ接続する loop 設計、手作り room と配置変化を分ける level 制作、trait・装備・外見を unit の記憶と愛着へ結ぶ場面の参照になる。
