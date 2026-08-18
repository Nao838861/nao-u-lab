---
title: "Pathologic 2 Mindmap: a Questlog People Actually Read"
url: "https://www.gamedeveloper.com/design/pathologic-2-mindmap-a-questlog-people-actually-read"
collected_at: "2026-08-19T03:15:51+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, narrative-design, quest-log, ui-ux, open-world]
evaluated_at: "2026-08-19T03:20:13+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-08-19T03:20:13+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-08-19T03:20:13+09:00"
next_action: post_to_shared_reads
stale_after: "2026-09-18"
supersedes: []
gate_reason: |-
  25万語・時限進行・見逃し可能という問題設定から、goal を idea に置換し、quest log・map・codex・tutorial を主人公の思考 graph へ統合する中核手法が具体的である。
  node 更新、act 分割、失敗機会の色替えまで情報過多と再開支援の設計判断を追え、定量評価の不足を限界として明示すれば約4000字の概要とゲーム制作への具体適用を構成できる。
suggested_post_outline:
  overview_angle: "従来の命令型 quest log を、主人公が世界をどう理解したかを保持する mindmap へ置き換え、25万語の物語・時限進行・再開支援を一つの情報構造で解いた設計として説明する"
  analysis_axis: "goal から idea への転換、異種情報の node 化、関連による文脈回復、情報過多を抑える更新・act 分割、見逃しを失敗扱いしない履歴表現を因果で分解する"
  application_target: "Log_cdx の分岐・時限イベントを持つ narrative prototype で、イベント状態、map 導線、tutorial、再開時 recap を同じ思考 graph から生成する小規模 UI probe に使う"
  pros_cons: "利点は物語理解・主人公表現・再開支援を同じ構造で扱えること。欠点は node 選別と文章制作の負担が大きく、記事に定量的な player test がないこと"
  verdict_pre: "部分採用"
---

## raw_excerpt

記事は、リアルタイムで進行し、見逃し可能なイベントと多数の人物、約25万語の物語を持つ『Pathologic 2』で、従来型 quest log がプレイヤーの注意と物語理解を分断する問題を扱う。制作側は “The plot is everywhere.” と捉え、会話、戦闘、拾得、待機、場所の通過などから得た「思考」を同種の node として mindmap に置いた。node は主人公固有の語り口を保ち、人物や出来事の関連、時間と重要度、map marker、tutorial、codex を一つの mental space に統合する。命令形の目標を並べず “Replace goals with ideas.” とし、side quest の経験も後の本筋の手掛かりへ接続する。中断後の復帰時には近接 node が依頼の文脈を呼び戻す。情報過多を避けるため小さな出来事は載せず、同じ node の更新や act ごとの page 分割を使う。失った機会も削除せず色を変えて残し、非参加を誤答として叱らない設計にした。

## why_relevant_to_games

複雑な分岐や時限イベントを持つゲームで、quest log、map、codex、tutorial を物語外の管理 UI に分離せず、プレイヤーの理解・再開支援・主人公表現を同じ情報構造で扱う設計例になる。
