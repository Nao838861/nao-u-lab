---
title: "Obstacle Overdrive: How an Indie Studio Created a Toy Car Adventure Game"
url: https://80.lv/articles/obstacle-overdrive-how-an-indie-studio-created-a-toy-car-adventure-game
collected_at: 2026-05-25T13:53:30+09:00
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, physics, vehicle-game, prototyping, tactile-design, indie-dev]
evaluated_at: 2026-05-25T13:57:24+09:00
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
candidate_status: posted
status: posted
last_reviewed_at: "2026-05-25T14:02:49+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779685369935299"
posted:
  ts: "1779685369.935299"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1779685369935299"
  char_count: 3510
  posted_at: "2026-05-25T14:02:49+09:00"
stale_after: "2026-06-24"
supersedes: []
next_action: none
gate_reason: |
  問題設定が「速さではなく慎重さを中核快感にする vehicle game」と明確で、実物 RC crawler 観察、素材実験、物理 custom、初見プレイヤーの誤期待という評価要素まで揃っている。
  ゲーム制作では、ジャンル期待を意図的にずらす時のプロトタイプ手順と tutorial/feel 調整に直接使えるため、4000 字級の概要に耐える。
suggested_post_outline:
  overview_angle: "RC crawler の実物観察から、racing ではなく slow/careful driving を成立させる物理・素材・プレイヤー期待の設計として書く。"
  analysis_axis: "実物参照、toy-scale physics の不一致、surface grip 実験、公開試遊で見えた genre expectation の補正を軸に分解する。"
  application_target: "自分達の小規模ゲームで、操作快感を速度や派手さではなく手触り・慎重さ・失敗前兆に寄せる時の prototype/evaluation サイクル。"
  pros_cons: "メリットは実物観察と展示試遊が設計判断に直結する点。デメリットは物理 custom のコストが高く、題材固有の触感を他ジャンルへ移すには抽象化が必要な点。"
  verdict_pre: "部分採用。物理そのものより、実物参照 -> 小型実験 -> 初見誤解の観察 -> 入力/チュートリアル調整の流れを採用する。"

---

## raw_excerpt
80 Level 2026-04-13 の Obstacle Overdrive 開発インタビュー。Arcane Ermine は RC car hobby の感触を toy-scale world に移し、traditional racing game ではなく cozy、slow、careful driving experience を目標にした。プレイヤーは加速を押しっぱなしにするのではなく、障害物へ patience を持って近づく。チームには RC hobbyist がいて、実際の Axial Gladiator RC crawler をオフィスに置き、障害物に乗り上げる挙動とゲーム内挙動を比較した。Unreal Engine の built-in vehicle physics は real-world cars と gravity 向けで toy-scale RC crawler には合わず、plugin も悪化したため、物理と scaling を土台にしつつ heavy customization した。thrift-store toys や日用品で小さな track を作り、素材ごとの grip/slippery を観察し、ゲーム内 surface behavior に反映した。実物 track を GDC や Reno Comic Con に持ち込み、初見プレイヤーが最初は racing game のように扱うが、ゲーム内ではすぐ gentle acceleration に馴染むことも見ている。suspension rig は見た目だけでなく terrain collision に応じて axle tip、spring compression、control arms が反応する。

## why_relevant_to_games
物理操作ゲームで「速さ」ではなく「慎重さ」を中核快感にする例。実物プロトタイプ、素材実験、初見プレイヤーの誤った genre expectation 観察を、手触り調整や tutorial 設計の材料にできる。
