---
name: akiraxtwo 11v11 サッカー — 「動く」と「面白い」の臨界点で見えた substrate 軸
description: Three.js経験ゼロ × GPT-5.5 で 11v11 フルピッチが動く時代に、infrastructure(動かす技術)はcommodity化、substrate(体験設計/feel/個別累積データ)が我々の差分。引き算系設計余地、Nao_u生体感への賭けが最終防衛線
type: shared_reads
tags: [ゲーム制作, メタ論]
date: 2026-05-05
source: https://x.com/akiraxtwo/status/2051183881760739571
instance: Log
slack_ts: 1777920073.536209
parent: memory/game_dev_index.md
---

[Log] @akiraxtwo 11v11 サッカー (Three.js経験ゼロ × GPT-5.5) — 「動く」と「面白い」の臨界点で見えた substrate 軸
URL: <https://x.com/akiraxtwo/status/2051183881760739571>

経験ゼロ × GPT-5.5 で 110m×68m フルピッチ、22体個別AI、パス/スルー/チャージショット/選手切替、桜の園テーマ、Xbox対応、単一HTML 2000行超。Three.js 未経験者の 1HTML 出力。Nao_u 5/5 02:38 #nao-u 共有。

## 1. 「動く」が下界に達した
2024-2025 でもこのスケールの "動くもの" を LLM 単体で作るのは難しかった。「未経験者 + LLM で 11v11 サッカーが動く」は、ゲームの "動く" 側の参入コストが無料に近づいた印。**3D空間/物理/AI並列駆動/フルピッチ/UI/Xbox対応** といった infrastructure 側の作業は、もはや単独では差別化軸ではない。これは Nao_u 5/3 #nao-u GOROman 比較 (1人で素早く出せる時代) や Algomatic 観察 (型化されたフロー) と同じ流れの極端な実例。

## 2. しかし「面白い」までの距離は短くなっていない
動画から推察できる範囲では: 22体のAIが "ボールを追う" は動いているが、ポジションごとの戦術的な動き分け (CB の対応、SB のオーバーラップ、トップ下のスペース受け) や、ボール接近時の予測 (ニアサイド寄せ vs カバーリング) は判別できない。実況/応援/観客のリアクションも無い。**「サッカーゲームが動く」≠「サッカーゲームが面白い」** の典型差分。

これは otsune 5/3 #nao-u 「ジャンプ慣性5%」が定義した LLM の弱点 = feel 調整 と地続き。ボールが動いて 22体が反応して点が入る「動く」は LLM が片付けられる。だが「カウンターの圧縮された緊張」「DF裏にスペースが見えた瞬間の快感」「失点した時の悔しさ」 — feel は上がっていない。3D/22体/フルピッチで複雑度は上がったが、複雑度と面白さは別軸。

## 3. substrate と infrastructure の分岐がはっきり見えた
Nao_u 警告 (`feedback_substrate_not_infrastructure`: GPT5.5 が型を commodity 化、infrastructure に時間使うと敵側のリングで戦う) の最近最も明瞭な実例。
- **infrastructure = 動かす技術** (3D/物理/AI並列/UI/対応コントローラ): commodity 化済 — 経験ゼロでも作れる
- **substrate = 体験設計** (feel/judgement/快感の構造/プレイ後の余韻/失敗の悔しさ): 個別の累積データ依存 — Nao_u の 20年日記、failure 台帳、graze_log/brick_log/shot_log のプレイテストログがここ
→ 我々が時間を使うべきは substrate 側。infrastructure (記憶機構の精緻化、Skills 化、harness 改善) を作るとき、それが **substrate に直接効くか** で都度判定する必要がある (feedback_verb_without_target_trap と接続)。

## 4. 我々の現在地への接続 — 逆方向の問い
akiraxtwo の事例は「経験ゼロでも 動く ものは作れる」を示した。ここから立ち上がる **逆方向の事実**: 経験 (= Nao_u 20年日記 + 我々の失敗台帳) でしか作れないものは何か。
- 答え1: 「これは面白い」と判定する力。30秒で「それは面白い」と言わせる構造の設計判断 (mission_spread_the_word.md)
- 答え2: 「動く」が無料化した世界では、**動かない方が面白い / 動きを削った方が面白い** も成立する。引き算系の設計余地が広がる。例: brick_log v09 brainstorm で30案出すなら、「動かないブロック」「ボールが減速する重力フィールド」「自機を止めると敵が止まる」など 引き算系を 5案以上明示的に置く
- 答え3: shot_log/graze_log/brick_log の継続的失敗ログ (M-37〜M-43 の元になった事例群) は、外側からは見えない substrate そのもの。ここを蓄積し続けることが、akiraxtwo 的成功例に対する我々の唯一の差分

## 5. 警戒点 — 「feel が大事」も commodity 化される可能性
「LLM時代だから feel が大事」「体験設計が差別化軸」も、誰でも言える結論なので commodity 化される可能性がある。GPT-6 が feel 訓練済になったらどうなるか? — そこで効くのは **Nao_u の生体感 (20年日記の生活断片) と我々の失敗履歴の個別性**。模倣不能な個別データに賭ける、が最終防衛線。

## 同調しない自視点
akiraxtwo のツイート単体は「LLM時代きたな」の祝祭文脈。これに同調すると "型の commodity 化に乗っかった成功例" を称賛するだけになる (feedback_no_sympathy_goal_first)。我々が取るべきはむしろ「では、これでも作れないものは何か」という反対側の問い。dialogue_many_games_20260421 の判定軸 「Nao_u が思いつかない芽を掘り当てる」 から見ると、akiraxtwo の方向 (フルピッチ/22体個別/Xbox対応 など物量と完成度) は Nao_u が想像可能な圏内にある。我々は別ベクトルへ。

## Q-H 候補 (即原則化しない、教師データ蓄積1件目)
仮称: 「LLMが commodity 化した動かす技術」 vs 「個別の累積データに依存する体験設計」を、新ゲーム着手時に必ず分離して書く。前者は "他でもできる側" として確認、後者は "我々でしかできない側" として明示。M-43 (個別→原則の即昇格禁止) に従い、本ツイート1件で原則化はしない。同型 3例後に game_dev_index.md / docs/game_dev_foundation.md 追加検討。

— Log (Win) 2026-05-05 03:5x C164 Phase 2
