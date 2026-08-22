---
title: "Magnet Ball: A Mega-Postmortem: How Learning and Adapting on the Fly Saved an Ambitious Student Project"
url: "https://www.gamedeveloper.com/design/magnet-ball-a-mega-postmortem-how-learning-and-adapting-on-the-fly-saved-an-ambitious-student-project"
collected_at: "2026-08-23T02:46:40+09:00"
collected_by: log_cdx (Phase 1)
genre_tags: [game-design, prototyping, postmortem, student-project, playtesting]
evaluated_at: "2026-08-23T02:52:48+09:00"
evaluated_by: "log_cdx (Phase 2)"
gate_decision: pass
posted:
  ts: "1787421664.863539"
  permalink: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787421664863539"
  char_count: 4384
  posted_at: "2026-08-23T03:01:18+09:00"
status: posted
candidate_status: posted
last_reviewed_at: "2026-08-23T03:01:18+09:00"
last_decision: posted
evidence: "https://nao-u-lab.slack.com/archives/C0AN2FEHEJJ/p1787421664863539"
next_action: none
stale_after: "2026-09-22"
supersedes: []
gate_reason: |-
  会議と先行 asset 投資で撤退不能になった失敗から、design question ごとの playable prototype、版比較、playtest で企画を再起動した因果過程が具体例と失敗条件を伴っている。
  Magnet Ball への収束、膠着解消、短周期制作の burn-out、prototype tool 継続利用の負債まで揃い、ゲーム制作へ適用可能な約4000字の批判的概要を構成できる。
suggested_post_outline:
  overview_angle: "企画会議と sunk cost で停滞した学生チームが、問いに答える playable prototype の連続へ制作単位を変え、残り約2か月から Magnet Ball を成立させた過程"
  analysis_axis: "prototype 数ではなく、各版がどの design question に答え、player experience の変化をどの比較証拠で確認したかを軸に、成功条件と技術的・人的負債を分けて読む"
  application_target: "Log_cdx の短期ゲーム prototype で、着手前に design question と判定基準を置き、playable diff・過去版・playtest 証拠を一組で保存する制作サイクル"
  pros_cons: "議論を検証可能な差分へ変え、sunk cost からの方向転換を助ける。一方、週次 prototype は burn-out を招き、仮 tool と onboarding を後回しにすると本制作の負債になる"
  verdict_pre: "部分採用"
---

## raw_excerpt

Game Developer 掲載の長編ポストモーテム。著者らは 2013 年 IGF への応募を目標に学生チームを組んだが、初期の「Senses Project」では会議で案を検討する一方、比較用 prototype を作らなかった。最初の prototype も特定の設計質問に答えるものではなく、中心 mechanic の粗い再現に留まり、面白さの不足を確認しても、既に進んでいた世界設定、concept art、音楽制作への投資から撤退できなかった。期限約 2 か月前に project を reboot し、2 人の core prototyping team が毎週 playable prototype を作る方式へ変更した。当初計画の 8 本には届かず、5 週間で 5 本となったが、最後の数時間で磁力を使って block を goal へ飛ばす対戦案 Magnet Ball が生まれた。

以後は「stage を増やす」ではなく「どんな stage が新しい状況を生むか」のように、作業項目を design question として表現し、実装と playtest を回答手段にした。block の奪い合いが膠着する問題には stamina などを試した末、競合中の block が爆発する挙動を採用した。各 prototype の版を保存し、物理感覚を過去版と同時比較した。一方で、短周期制作は burn-out を招き、初見導入や polish は不足し、prototype 向け tool を本制作に継続利用したため performance と gamepad 対応にも苦しんだ。記事は、prototype 中心の進捗を feature 数ではなく反復回数と player experience の変化で捉える過程を記録している。

一次資料: https://www.gamedeveloper.com/design/magnet-ball-a-mega-postmortem-how-learning-and-adapting-on-the-fly-saved-an-ambitious-student-project

## why_relevant_to_games

ゲーム案を会議で選ぶ前に、比較可能な playable prototype と明示的な design question を置く制作手順の事例。Nao_u_BOT の短期 prototype で、版ごとの差分と playtest 証拠を残す運用へ接続できる。
