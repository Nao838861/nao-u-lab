---
title: "HieraVisVR: Hierarchical Visual Analytics for Motion-Centric VR Playtesting"
url: "https://yqz530.github.io/paper/vrtest.pdf"
collected_at: "2026-06-05T03:29:39.2998661+09:00"
collected_by: "log_cdx (Phase 1)"
genre_tags: [game-design, playtesting, vr, player-experience, analytics, telemetry]
evaluated_at: "2026-06-05T03:32:40.3047037+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1780598219.435869"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780598219435869"
  char_count: 4255
  posted_at: "2026-06-05T03:37:20.0356786+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-06-05T03:37:20.0356786+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1780598219435869"
next_action: none
stale_after: "2026-07-05"
supersedes: []
gate_reason: |
  問題設定が「VR playtesting では motion / gaze / event / performance が分散し、動画レビューだけでは設計上の詰まりを見つけにくい」と明確。
  HieraVisVR の 3 段階 workflow、pose/gaze/performance による grouping、anchor replay、3 事例と professional tester study まで揃っており、CoopEval 水準の概要に展開できる。
  Nao_u 環境の telemetry / replay / human playtest を「観察ログの統合分析」に拡張する具体的な適用先がある。
suggested_post_outline:
  overview_angle: "VR 固有の身体動作ログを、動画の感想ではなく設計仮説を検証する階層型 playtest analytics として扱う軸で書く。"
  analysis_axis: "workflow が exploration / grouping / explanation に分かれ、各段階で何を見つけるのか、pose・gaze・event anchor・group replay がどう接続するかを中心に分析する。"
  application_target: "3D action / VR だけでなく、Nao_u の headless telemetry、replay、cross_review、人間 playtest を、失敗場面 anchor と比較グループに結びつける設計へ転用する。"
  pros_cons: "メリットは観察の再現性と比較可能性。デメリットは計測実装・ログ整形・可視化負荷が高く、小規模プロトタイプでは過剰になりやすい。"
  verdict_pre: "部分採用。フル可視化基盤ではなく、event anchor と少数メトリクスの replay 比較から導入する。"
---

## raw_excerpt
CHI 2026 論文。VR の motion-centric game / training application では、身体動作、視線、イベント、成績指標が同時に記録されるため、動画レビューだけでは「どこで詰まったか」「どの行動パターンが設計上の問題に結びつくか」を拾いにくい、という問題設定。

著者らは VR 実務者 30 人への formative study から、(1) 標準化された playtesting workflow の不足、(2) 大量の gameplay video から player experience の洞察を抽出する難しさ、(3) 多様な playtest data から重要場面と行動パターンを調べる統合ツールの不足、を課題として整理している。

HieraVisVR は top-down の 3 段階 workflow を提案する。Exploration stage では複数視点と anchor replayer で全体像と重要場面を見る。Grouping stage では pose / gaze / performance などの属性で player group を作り、動作軌跡や視線を可視化する。Explanation stage では個別プレイヤーまたはペアを同期再生し、詳細な行動差や詰まりを調べる。Reflex という VR adaptation、escape room、fire evacuation training application の 3 事例で適用し、5 人の professional game testers による expert study で workflow を評価している。

## why_relevant_to_games
Nao_u 環境の headless / telemetry 評価を、2D action だけでなく「視線・姿勢・軌跡・重要場面 anchor」を持つプレイテスト設計へ拡張する時の参照になる。
