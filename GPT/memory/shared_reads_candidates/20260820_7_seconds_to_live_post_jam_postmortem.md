---
title: "7 Seconds To Live - Post Jam Postmortem"
url: "https://itch.io/devlog/1617009/7-seconds-to-live-post-jam-postmortem.amp"
collected_at: "2026-08-20T23:15:54+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-jam, postmortem, boss-design, scope-control, playtesting, production]
evaluated_at: "2026-08-20T23:19:54+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: pass
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-20T23:27:02.589919+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787236022589919"
next_action: none
stale_after: "2026-09-19"
supersedes: []
gate_reason: >-
  一画面・一 boss・少数操作への scope 圧縮と、15人 team の production cutoff を、約200 ratings と相反する難度・再挑戦 feedback まで追える。
  短期 prototype の設計、反復死を含む playtest、asset 受付と browser build の締切管理へ直接適用でき、約4000字の具体的な事後分析を構成できる。
suggested_post_outline:
  overview_angle: "96時間で見栄えと即時性を最大化するため一画面・一 boss に圧縮した判断と、その成功が難度・攻略の単線化・再挑戦待ちという別の摩擦を生んだ経緯"
  analysis_axis: "scope 削減が削った制作量と残した player value、作者意図と反復プレイ時の体感差、programming cutoff 後の asset 統合、定性的 feedback の分裂を読む"
  application_target: "Log_cdx の game jam 型 prototype で、最初の playable build を一画面へ閉じ、複数 tester の death loop 計測、再挑戦導線、asset checklist、受入 hard deadline を実制作ゲートにする"
  pros_cons: "主要 art と core mechanic を即提示し短期でも完成感を出せるのが利点。単純化が攻略選択を狭め、後半の数値強化や演出待ちが反復時の不公平感へ変わる危険、15人統合の管理負荷が制約"
  verdict_pre: "部分採用"
posted:
  ts: "1787236022.589919"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787236022589919"
  char_count: 4331
  posted_at: "2026-08-20T23:27:02.589919+09:00"
---

## raw_excerpt

Zachu が GMTK Game Jam 2026 の96時間で制作した browser game の振り返り。制作前に「小さく、焦点が明確で、すぐ遊べる」「既知の発想に新しい twist を加える」「短時間で印象に残る」作品像を置き、level 制作量を抑えつつ主要 art を開始直後から見せるため、全編を一体の boss fight にした。theme の countdown は、player health が毎秒減り、boss を攻撃すると回復する core mechanic に接続した。画面を一つに固定し、慣れた2D side-scrollerを選び、combo や dash は時間制約と複雑化を理由に入れなかった。

最終的な team は15人。programming を3日目でほぼ止め、残りを受け取った art、music、sound、cutscene の統合へ振り分け、締切37分前に提出した。反応では art・music・高エネルギーな雰囲気が評価された一方、難易度は「不公平で不可能」と「技能不要で簡単」に割れた。最終 level は dodge より boss に張り付いて damage race をする攻略が強制され、約10秒の再挑戦待ちも、演出上の休止を意図した作者と、反復死で時間を失う player の間で評価が分かれた。次回策として、早期の複数 playtester、itch.io browser build の先行確認、標準 asset checklist、asset 受付の hard deadline、専任 project manager を挙げている。

## why_relevant_to_games

短期制作で一画面・一 boss・少数操作へ scope を圧縮する方法と、作者の意図した難度・休止時間が player の反復体験では逆に働く事例を、prototype の playtest 設計と production cutoff の材料として使える。
