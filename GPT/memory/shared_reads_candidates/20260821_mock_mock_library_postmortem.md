---
title: "How Mock-Mock was created in a Library"
url: "https://itch.io/devlog/1617770/how-mock-mock-was-created-in-a-library.amp"
collected_at: "2026-08-21T05:30:52+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, game-jam, postmortem, puzzle, pico-8, prototyping]
evaluated_at: "2026-08-21T05:34:38+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: fail
status: failed
candidate_status: failed
last_reviewed_at: "2026-08-21T05:34:38+09:00"
last_decision: fail
evidence: "gate_decision:fail; evaluated_at:2026-08-21T05:34:38+09:00"
next_action: keep_for_reference
stale_after: "2026-09-20"
supersedes: []
gate_reason: >-
  図書館 PC、Pico-8、短時間開発という制約下の意思決定と、20分想定の仕掛けが3時間へ膨張した失敗は具体的である。
  ただし評価は反応・順位・作者の回顧が中心で、規則反転 level の設計効果や early build feedback の中身を検証できず、4000字級の手法解説には補間が過大になる。
---

## raw_excerpt

GMTK Game Jam 2026 の上位作品 Mock-Mock の制作記録。作者は休暇中で普段の開発環境を使えず、古い公共図書館 PC とブラウザ版 Pico-8 を選んだ。基本移動、衝突、menu、効果音は数時間で組めたが、通常のように共通 core の後で level を量産するのではなく、各 level がほぼ別の game のように規則を変える構成になった。図書館を使える時間は一日数時間に限られた一方、早期 build を Lexaloffle に公開して feedback と level idea を得た。

後半では、自機へ部品を自由に接続して形を作る level を考え、sprite と code まで用意したものの、20分程度の想定が約3時間に膨らんだ。作者は動かすことに集中して、貴重な残り時間を使い続けていることに気づけなかったと振り返る。未実装案には、pause menu を操作へ組み込む、画面外へ出て機械を直す、移動と草の増減を逆向きに結ぶ、時間経過と手数の得点を反転する、音で宝へ近づく、意図的な敗北で足跡状態を reset する、といった UI・失敗・時間・空間の既定意味を反転する level が並ぶ。

## why_relevant_to_games

短期制作で共通 core を保ちながら level ごとに規則の意味を反転する設計と、実装時間が見積りを越えた仕掛けをいつ切るかの記録として参照できる。
