---
title: "Evolve Or Die: How LiveOps Scaled Our Indie Hit"
url: "https://media.gdcvault.com/gdc2026/Slides/Garrahan_Andrew_Evolve_Or_Die.pdf"
collected_at: "2026-08-20T14:04:07+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-production, liveops, progression, playtesting, indie-development]
evaluated_at: "2026-08-20T14:08:16+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1787203828.282949"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787203828282949"
  char_count: 4123
  posted_at: "2026-08-20T14:30:50+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-20T14:30:50+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787203828282949"
next_action: none
stale_after: "2026-09-19"
supersedes: []
gate_reason: |-
  大型 expansion の限界から9週間 mini game、週次 beta、feedback review、telemetry、meta progression 再構築へ移る因果と工程が具体的である。
  小規模チームの継続運営・短周期試作・観測設計へ直接適用でき、GDC スライドを基に CoopEval 水準の概要を構成できるため pass とする。
suggested_post_outline:
  overview_angle: "20人規模のチームが大型追加依存を脱し、短周期 LiveOps と progression 再構築で更新能力を作り直した過程"
  analysis_axis: "content heartbeat、9週間 production loop、定性 feedback と行動ログの接続、長期 economy debt を止めて直す判断"
  application_target: "Log_cdx のゲーム prototype で、週次 playable build・観測点・feedback review・長期 progression の再設計条件を定義する場面"
  pros_cons: "短い更新周期と観測ループは学習速度を上げる一方、イベント再利用への依存、運営負荷、基盤改修中の content 停止を伴う"
  verdict_pre: "部分採用"
---

## raw_excerpt

GDC 2026 で ComputerLunch の Kati Nawrocki と Andrew Garrahan が公開した、20人規模のスタジオによる『Cell to Singularity』運営資料。ゲームは、地球をタップして Entropy を得て、進化上の Trait を解放し、tech tree を伸ばしていく incremental game として Steam / iOS / Android に投入された。初期版は約2週間分の内容だったため、公開後の同時接続は自然減したが、恐竜進化を扱う Mesozoic Valley などの expansion で再上昇した。大規模 expansion は制作間隔とリスクが大きく、James Webb Event では既存システム上に短期イベントを試作し、9か月規模だった更新を9週間の mini game 制作へ縮めた。その工程は Pre、Kickoff、Rough、Iteration and Playtests、Pre-Release、Rollout の9週間で構成され、隔週 rerun、premiere、weekly event を組み合わせて content heartbeat を作っている。

運営側では毎日10〜20件の直接メールへ48時間以内に返信し、SNS、Reddit、Discord、store review を集め、月曜に30分の feedback review を行う。行動ログでは event mission の完遂率などを確認する。毎週金曜に Discord tester 向け beta を出し、専用 build machine で毎晩 build する。後期には旧 progression / economy が上限へ達し、新規・古参の双方へ適切な難度で content を追加できなくなったため、新規 content を9か月止め、studio 全体で meta progression を再構築した。再起動後は3週間ごとの release に移行したと説明されている。

## why_relevant_to_games

小規模チームが、単発の大型追加から短周期イベント、feedback loop、beta build、meta progression 改修へ移る実例として、継続運営ゲームの制作周期と観測点を検討する場面に使える。
