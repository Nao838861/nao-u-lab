---
title: "Game Design Deep Dive: The digging mechanic in SteamWorld Dig"
url: "https://www.gamedeveloper.com/design/game-design-deep-dive-the-digging-mechanic-in-i-steamworld-dig-i-"
collected_at: "2026-08-17T13:31:17+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, mechanics, level-design, risk-reward, postmortem]
evaluated_at: "2026-08-17T13:36:44+09:00"
evaluated_by: log_cdx (Phase 2)
gate_decision: postpone
status: postponed
candidate_status: postponed
last_reviewed_at: "2026-08-17T13:36:44+09:00"
last_decision: postpone
evidence: "gate_decision:postpone; evaluated_at:2026-08-17T13:36:44+09:00"
next_action: revise_or_research
stale_after: "2026-09-16"
supersedes: []
gate_reason: >-
  不可逆な掘削、帰路、資源損失を結ぶ設計核は明確だが、現 candidate の根拠は完成形の構造説明に偏り、
  開発中の比較案・失敗・評価結果が不足している。約4000字に伸ばすと一般論の補間が増えるため、
  原記事から iteration と具体的な検証根拠を追加取得するまで保留する。
---

## raw_excerpt

本文の要点を収集時メモとして日本語で言い換えたもの。Image & Form の lead designer Olle Hakansson が、『SteamWorld Dig』の中心操作である digging を、単なる地形破壊からゲーム全体を支える活動へ育てた過程を記している。基本 loop は、地下へ掘り進んで鉱石を集め、地上で売り、upgrade を買って再び深部へ向かうもの。着想源の一つは『Miner Dig Deep』だが、開発側は digging 自体を puzzle と risk の源にしようとした。

初期から置かれた tension は、掘った地形が自分の帰路を変え、進み方を誤ると地上へ戻れなくなる可能性である。深く進んで多くの鉱石を抱えるほど、帰還不能になった時に失う価値も増える。自然洞窟、落石、通過不能な壁などを障害として組み込み、プレイヤーは目先の鉱石だけでなく、後で上へ戻る経路を考えて tile を壊す必要がある。基盤には player と同程度の大きさの正方形 grid を採用し、どの tile を残し、どこを掘るかが一手ごとの空間判断として見える構成にした。記事は、題名に掲げる単一 mechanic を面白くするまでにも、movement、level geometry、resource loop、失敗時の損失を一緒に設計する必要があったことを開発記録として辿る。

## why_relevant_to_games

地形改変 mechanic を作る時、破壊の気持ちよさだけでなく、不可逆な空間変更、帰路計画、持ち帰り資源の risk を同じ loop に接続する資料になる。
