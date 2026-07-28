---
title: "Postmortem: Children of Morta"
url: "https://www.gamedeveloper.com/design/postmortem-children-of-morta"
collected_at: "2026-07-28T23:32:10+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, postmortem, roguelike, production, playtesting, ux]
evaluated_at: "2026-07-28T23:40:00+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-28T23:40:00+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-28T23:40:00+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-27"
supersedes: []
gate_reason: |-
  5年の開発を、制作 pillar、週次 playtest、UX debt、production 境界、後付け multiplayer、animation と localization の見積もりまで具体的な因果で振り返っている。
  成功と失敗の双方に十分な実例があり、小規模 prototype のスコープ管理と検証周期へ無理なく適用できるため、CoopEval 水準の約4000字概要を構成できる。
suggested_post_outline:
  overview_angle: "6か月想定が5年へ延びた過程を、守れた二本の pillar と、境界を曖昧にしたことで増幅した UX・機能・制作工数の対比で解説する"
  analysis_axis: "設計意図を守った feedback loop と、pre-production 終了条件・後付け機能・表現コストの見積もり不足が生んだ手戻りを因果で分解する"
  application_target: "Log_cdx の短期 playable diff で、pillar 固定、週次 playtest、UX の早期外部確認、production 移行ゲート、後付け機能の横断コスト見積もりに使う"
  pros_cons: "長期開発の成功・失敗を同一事例で比較できる一方、単一チームの回顧で定量評価が少なく、現代の小規模制作へ移す際は規模差の補正が要る"
  verdict_pre: "部分採用"
---

## raw_excerpt

記事内容の忠実な抄訳メモ（逐語引用ではない）。Dead Mage の Amir H. Fassihi は、家族を描く物語主導のアクション・ローグライク『Children of Morta』について、当初6か月の小規模作品として始まった企画が、Kickstarter とパブリッシャー参加を経て5年の開発になった過程を振り返る。うまくいった点として、5人から18人へ成長したチームの相互支援、物語上の「家族」と「ストーリーを持つローグライク」という二本の柱を他要素より優先したこと、Unity Editor 内の階層型有限状態機械や procedural level／asset 管理などの内製ツール、継続的な外部フィードバックを挙げる。

一方、初期には開発者自身が隣で説明できたため UI/UX の不足を見落とし、キャラクター、スキルツリー、アイテム、強化系が増えた後に外部プレイヤーが理解できない問題が表面化し、UI を少なくとも3回作り直した。pre-production と production の境界が曖昧なまま新機能を追加し続けたことで、使われない asset、見積もり困難、物語の大幅な手戻りが生じた。途中追加の online multiplayer は architecture、console 対応、testing を広く巻き込み、発売後へ延期された。さらに約6万語・11言語の localization と、高解像度・多 keyframe の手描き pixel animation の工数も過小評価していた。ただし開発2週目からの週次 playtest、Kickstarter backer、publisher の focus test という複数段階の feedback loop が、流動的な制作中の方向確認に使われた。

## why_relevant_to_games

小規模 roguelike が長期開発へ膨らむ際の pillar 保護、UX の後回し、production 境界、後付け multiplayer、手描き animation の見積もりを、実例ベースで制作計画と playtest 設計に参照できる。
