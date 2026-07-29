---
title: "Developing Ethical Games: Why & How"
url: "https://media.gdcvault.com/gdc2026/Slides/Hodent-Celia_Kowert-Rachel_DevelopingEthicalGames_ForumGDC26.pdf"
collected_at: "2026-07-29T23:45:40+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, player-safety, ethics, monetization, accessibility, production]
evaluated_at: "2026-07-29T23:49:24+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
status: ready_to_post
candidate_status: ready_to_post
last_reviewed_at: "2026-07-29T23:49:24+09:00"
last_decision: pass
evidence: "gate_decision:pass; evaluated_at:2026-07-29T23:49:24+09:00"
next_action: post_to_shared_reads
stale_after: "2026-08-28"
supersedes: []
gate_reason: >-
  player の時間・金銭・data・social safety と、accessibility・AI 表示・crunch・credit を同じ code で接続する原則と具体例を一次資料から抽出できる。
  実証済み基準ではなく feedback 募集中の draft という限界を明示すれば、prototype・live-ops・release review への適用を含む約4000字の独立分析を構成できる。
suggested_post_outline:
  overview_angle: "player protection と worker protection を別部署の規範ではなく、game system と制作工程を貫く一つの design constraint として読む"
  analysis_axis: "各原則の具体性、相互依存、実証・執行・優先順位づけが未整備な draft であることを分けて評価する"
  application_target: "Log_cdx の prototype 設計、headless 評価、telemetry 導入、AI participant 表示、release 前 review を横断する倫理チェックリスト"
  pros_cons: "design・運用・組織を同じ地図に置ける点が強み。任意規範で測定基準・trade-off 解決・導入効果の検証がまだない点が弱み"
  verdict_pre: "部分採用"
---

## raw_excerpt

GDC 2026 で Celia Hodent、Rachel Kowert、Fran Blumberg が提示した Ethical Games の新 draft。短い原文では目的を “The goal is to make games safer for players” と置き、player 保護と開発者保護を同じ code of ethics の対象にする。player 側では、通信・UGC・algorithm が harassment や bias を増幅しないこと、通知・期間限定 event・progression が離脱を罰する coercive design にならないこと、課金が loss aversion や gambling-like mechanics に依存しないことを挙げる。telemetry は明示的同意と privacy を前提にし、費やした時間と金額、data 利用、custom offer、dynamic difficulty adjustment、対戦相手が AI である場合を分かる形で示す。

accessibility では、gameplay の楽しさに本質的でない barrier を減らし、残る barrier は購入前に知らせる。難しい・論争的な主題の表現自体は禁じず、影響を受ける community、shock value を越える目的、territory ごとの culturalization、身体・精神へ影響する content 情報を検討対象にする。未成年には時間・金銭・心理的圧力を利用せず、social harm へ proactive / reactive な policy、tool、教育を用意する。worker 側では sustained overtime を予防し、例外を稀・短期・透明・補償付きに限定するほか、公開 harassment への事前対応、open feedback culture、著作物や生成 AI を使った場合の credit / disclosure、環境負荷の削減を含める。draft は 2026 年後半の正式 launch と、その後の studio pledge、guideline / resource 整備を次段階としている。

## why_relevant_to_games

mechanics、live-ops、telemetry、AI character 表示、accessibility、制作計画を別々に扱わず、prototype と運用を横断する確認項目として拾える。特に「面白さの圧力」と coercion、「意図的な mystery」と system の誤認を分ける場面に効く。
