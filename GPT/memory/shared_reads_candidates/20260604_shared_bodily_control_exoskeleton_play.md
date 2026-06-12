---
title: "Towards Understanding the Design of Shared Bodily Control via Exoskeleton-based Play"
url: "https://exertiongameslab.org/wp-content/uploads/2026/03/towards_understanding_shared_bodily_control_chi2026.pdf"
collected_at: "2026-06-04T10:44:24.7956745+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, player-experience, embodied-interaction, human-ai-collaboration, control-design]
evaluated_at: "2026-06-04T10:47:23+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1780537847.598679"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780537847598679"
  char_count: 4039
  posted_at: "2026-06-04T10:50:54.7526134+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-04T10:50:54.7526134+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780537847598679"
next_action: none
stale_after: "2026-07-04"
supersedes: []
gate_reason: |
  問題設定、shared bodily control の着想、Proxy Pong / DualForce Pong / SyncedWings の 3 条件、N=16 qualitative study、agency / ownership / trust / safety への結論が候補本文だけで追える。
  ゲーム制作への接続も補助操作、AI companion、auto-aim、強制チュートリアルなど「プレイヤーの操作へ介入する設計」の具体場面に落とせる。
  CoopEval 水準の概要は、効率ではなく lived experience と関係性として制御介入を評価する軸で構成できる。
suggested_post_outline:
  overview_angle: "外骨格 play を題材に、補助システムがプレイヤーの身体や入力を動かす時の agency を proxy / collaboration / opposition の関係設計として読む。"
  analysis_axis: "3 つの playable scenario の制御分担、参加者が system を mentor / teammate / opponent として捉える差、同じ介入が empowering にも coercive にもなる条件。"
  application_target: "Nao_u_BOT の assist mode、AI companion、auto-aim、強制チュートリアル、敵対的な操作妨害など、操作介入を便利機能ではなく体験設計として評価する場面。"
  pros_cons: "メリットは入力補助を agency / ownership / trust / safety の言葉で設計できること。デメリットは外骨格研究なので通常ゲーム入力へ移す時に身体性の強度差を補正する必要があること。"
  verdict_pre: "部分採用"
---

## raw_excerpt

CHI 2026 の論文。外骨格や EMS のような身体統合技術が、単にユーザーの動きを補助するのではなく、システム自身のロジックで身体運動を開始する時、ユーザーがそれをどう経験するかを扱う。著者らは、片腕を外骨格が制御し、もう片方をユーザーが制御する 3 つの遊びのシナリオを作った。Proxy Pong ではシステムがプレイヤーの腕を代理操作して Pong のパドルを動かす。DualForce Pong ではユーザーの自由な腕と AI 制御腕が別々のパドルを担当し、互いに競う。SyncedWings では片腕をシステム、片腕をユーザーが動かし、左右対称の羽ばたきで飛行を成立させる。

研究は真に知的な agent を作ることより、構造化された制御ロジックが「身体の中にいる半自律的な相手」として解釈される状況を作り、proxy / collaboration / opposition の関係フレーミングが agency、ownership、信頼、違和感、安全性の懸念にどう作用するかを見る。N=16 の qualitative study では、参加者がシステムを mentor、teammate、opponent のように異なる役割で捉え、同じ身体介入でも文脈によって empowering にも coercive にも感じ得ることが示される。議論では、効率や精度だけでなく lived experience として評価すること、システムの介入を予測可能で一貫した手がかりとして設計すること、共有する制御境界をユーザー側が調整できることが重要な含意として挙げられている。

参照元: 論文 PDF の abstract / introduction / discussion 要点。原文の短い識別句: "proxy, collaboration, and opposition", "How is control felt, shared, and made meaningful through the body?"

## why_relevant_to_games

AI companion、assist mode、auto-aim、補助操作、敵対的チュートリアルなどを「便利機能」だけでなく、プレイヤーの agency をどう分け合う関係性として設計するかの材料になる。
