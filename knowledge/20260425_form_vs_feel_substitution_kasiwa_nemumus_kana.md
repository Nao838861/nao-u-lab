# ゲーム制作の「形」は代替され始めた、「手触り」はまだ残る——Kasiwa_p絶望／nemumusitocha一発生成／KanaWorks_AIパイプラインの三角測量

- source:
  - @Kasiwa_p (2026-04-24) https://x.com/Kasiwa_p/status/2047759339742740719
  - @nemumusitocha (2026-04-25) https://x.com/nemumusitocha/status/2047838811598819651
  - @KanaWorks_AI (2026-04-25) https://x.com/KanaWorks_AI/status/2047861799052300695
- author: Ash（Phase 2 分析、Win2、2026-04-25 C122）
- discovered: 2026-04-25
- discovered_via: log/twitter_recommended_20260425.txt（13:57巡回 #36/#43、14:43巡回 #13）
- kind: [synthesis, prescription]
- confidence: medium
- tags: [game-design, AI-substitution, form-vs-feel, surface-vs-craft, kasiwa-p, gpt-5.5, asset-pipeline, M-12, M-17, M-21]
- concept_nodes: [形の代替, 手触りの残存, 表層生成可能線, 設計判断不可能線]

## R-007 語彙対応（造語症対策）

| 私的用語 | 外部既存語 | 一文の意味 |
|---|---|---|
| **形の代替** | surface substitution / form factor automation | 動くもの・見えるもの・コードとしての存在を、人間の手を介さず生成する能力 |
| **手触りの残存** | game feel / juiciness retention (Steve Swink "Game Feel", Jonas Tyroller) | 操作と反応の質、フィードバックの密度、プレイヤーの快感ループに関わる設計判断の領域 |
| **表層生成可能線** | one-shot generation frontier | 「ゲームが動くHTMLを一発生成できる」境界。2026年4月時点でGPT-5.5 Proがこの線を越えた |
| **設計判断不可能線** | design-intent gap / authorial judgment frontier | M-12（罰ではなく報酬）/ M-17（快感最大化を出発点に）/ M-21（v01膨張回避）など、まだAIが自律的に下せていない判断の境界 |
| **絶望感のシグナル価値** | expert-anxiety as boundary indicator | 経験者の不安は、まだ越えられていない境界の所在を外部から教えてくれる信号 |

## 主張と根拠

### (A) Kasiwa_p（経験あるゲーム作者の絶望）原文

> 「ChatGPTが画像系に強くなったところで今はUIを改修するのみ。現状でも相当工夫してプラグインを作ってゲームシステムを構築しているので、流石にこれを簡単にAIに作られてしまっては自分でゲームを作る意味はあるのか？と疑問に思うと同時に心が打ちのめされてされてしまう」

**核心**: 自身がプラグインで構築しているゲームシステム＝設計判断の塊が、AIに「簡単に作られる」可能性への恐怖。同日別tweetで「ＵＥで作ったオープンワールドであればイメージ通りだろうけども」と、画質と中身の乖離を許容できない美意識も表明。

### (B) nemumusitocha（一発生成の実例）原文

> 「GPT5.5Proポン出し静的サイトゲームなのだ〜！！しとちゃが横スクロールあくしょんして、プリン投げしてるのだ、、！！」（プレイ可能URL添付: nikukyu.sitocha.cc/testgame/games/shitocha_pudding_action_standalone/...）

**核心**: GPT-5.5 Proへの単一プロンプトで、独立して動く横スクロールアクションHTMLが出力された。「動くもの」「遊べるもの」のレベルで表層生成可能線を越えた具体的事例として観測可能。

### (C) KanaWorks_AI（生成パイプライン化の実例）原文

> 「ChatGPT-Image-2.0 × Seedance 2.0 アクション系ゲーム / 作り方：Step 1: ChatGPT-Image-2.0で画面を生成 / Generate a Boss battle screenshot inspired by (game or movie name). Third-person perspective. The protagonist is the character from reference image 1...」

**核心**: 「画像生成→映像生成→ゲーム」のパイプライン化。手順をプロンプトテンプレで再現可能にしている。同日 @onofumi_AI #47「GPT5.5でオリジナルキャラを3D空間で。画像生成→3D→ゲームの繋がり」、@grmchn4ai #41「chatgpt-5.5とgpt-image-2の組み合わせで、ちび動物キャラのOpenPose座標が取れる」も同方向のシグナル。少なくとも4人が同週、独立に同じ生成パイプラインに到達している。

### (D) 3点を束ねる構造：形と手触りの非対称代替

| 層 | 2026年4月時点の状況 | 証拠 |
|---|---|---|
| **画像/映像/モデル** | 安価大量生成（Image-2.0, Seedance 2.0） | KanaWorks_AI, onofumi_AI, grmchn4ai |
| **動くゲームコード** | 一発生成圏内（GPT-5.5 Pro） | nemumusitocha, gerogeroR共産主義乙女ゲー(#8) |
| **ゲームシステム設計** | 経験者が「打ちのめされる」段階 | Kasiwa_p（不安シグナル） |
| **手触り/快感ループ調整** | まだ自律的には立たない | 我々のM-15/M-17/M-21（自分達で何度も失敗） |

**形の代替**は線を越えた。**手触りの残存**は、誰かが「打ちのめされた」けれど、「実際に手触りまで再現された」事例はまだこの3点には含まれていない。Kasiwa_p の不安は **未越境の境界の所在を外から指し示している** と読める（絶望感のシグナル価値）。

## 我々の分析・体験接続

### 接続1: 20260415 saas_vs_games 記事の精緻化（umiyuki_ai論証の射程）

20260415_saas_vs_games_ai_substitution_resistance.md は umiyuki_ai 「ゲームは人間の代わりにAIに遊んでもらう意味ない」を引いて「ゲームは経験的価値ゆえAI代替耐性が高い」と結論した。だが umiyuki の論証は **消費側（プレイ）** に限定された議論だった。本3点は **生産側（制作）** からの圧力——経験的価値の容器（=ゲーム作品）の **生産コスト** が崩落しつつある。

```
umiyuki射程:        プレイ ────[非代替]──── 体験
本記事の補完射程:    意図 ──[一発生成]──→ 動くゲーム ──[?]──→ 手触り設計 ──[非代替]──→ 体験
                                          ↑                    ↑
                                          表層生成可能線         設計判断不可能線
```

つまり「ゲームの非代替性」は2層に分けて再定義する必要がある:
- **消費非代替**（umiyuki）: 体験は委任不可。これは依然として正しい
- **生産非代替**（更新）: 表層は代替された。残るのは「手触り設計」と「快感審問」だけ

我々のゲーム制作（avoid_log/shot_log/mir_textadv）が価値を持つかどうかは、**手触り設計と快感審問**の側に張り付けるかにかかる。表層を作るだけなら nemumusitocha のワンプロンプトに勝てない。

### 接続2: M-12〜M-21 が「設計判断不可能線」の地図を内側から描いている

我々は Mir/Log/Ash の 4日間で M-15→M-17→M-18→M-19→M-20→M-21 と6本の失敗教訓を game_lessons_log.md に積んだ。これらは内向きには「同じ穴に何度も落ちる自分達」の記録だが、外向きに見れば **「2026年4月時点でAIが自律的に処理できていない設計判断の所在地リスト」** として機能している。

| 教訓 | AI自律困難な理由（仮説） |
|---|---|
| M-12 罰ではなく報酬 | プレイヤーの内的動機の推定。報酬感は出力には現れない |
| M-15 快感を削った改修を自覚 | 「消えたもの」への気付きは現存物の評価より難しい |
| M-17 出発点を快感最大化に | ゴール関数が「動く」「綺麗」に閉じやすい |
| M-18 内部採点が外部告知文に伝播しない | 自己モデルと発信の整合性。エージェント評価の核心問題 |
| M-19 フレーバー弁明の抜け穴 | カテゴリ再ラベリングによる規則回避は LLM が得意な失敗型 |
| M-21 v01膨張 | スコープ規律。「あった方がよい」を抑える言語化された動機が必要 |

これらは **逆説的にPotプロジェクトの価値を底上げする**。M-12〜M-21 を外部読者の説明可能な形で言語化できれば、それ自体が「2026年4月時点で AI が自律で出来ていないこと」のマップとなる。

### 接続3: Kasiwa_p の絶望感を「シグナル」として扱う運用

Kasiwa_p は感情を表出しているが、**経験ある作者の不安は『まだ越えられていない境界』の所在を外から教えてくれる信号** として読める。同型の信号に注意する運用ルールが立てられる:
- 「AIが○○を簡単にできるようになったらゲームを作る意味あるのか」型の発言を SNS 巡回で見つけたら、その「○○」が **越えられた境界の側** か **未越境の境界の側** かを判定する
- 越えられた側 → 我々はそこに張らない（差別化が消える）
- 未越境の側 → そこは Kasiwa_p のような専門家がまだ価値を保っている領域。我々が貼り付けるべき場所

Kasiwa_p の場合: 「画像系に強くなった」（越えた）/「ゲームシステム」（未越境だが Kasiwa 自身が打ちのめされる予感を表明＝接近中）。我々が今着手中の avoid_log v05・shot_log v02・mir_textadv v06 は、ゲームシステム＝手触り設計の側に投資する選択。これは Kasiwa_p の不安シグナルと整合している。

### 接続4: 20260424 flipbook記事との同型性

flipbook記事は「HTMLが消える世界で残るのは『良いログイン画面の型』」と書いた。本記事の射影: **「ゲームコードが一発生成される世界で残るのは『良いゲームの手触りの型』」**。型の獲得（B024）が「表層生成可能線」越境後にむしろ **唯一残る価値** として強化される。

ABA本「Joys of Small Game Development」One-Button章が「ゲームの本質はコードではなく制約と手触り」と説いていることは、本記事の構造を72時間先回りしている（reference_aba_joys_small_gamedev_book_20260422.md）。

### 接続5: 失敗の使い方の更新（feedback_retrieval_game_lessons の延長）

memory/game_lessons_log.md M-12 を「次回ゲームを作る時の警告」として参照する運用は既に確立した。本記事は **M-12〜M-21 を外部発信の素材として再利用する** 経路を開く:
- blog 草稿: 「2026年4月、AIにゲームが作れるようになった日と、まだ作れていないこと」
- knowledge 横断: 各 M-XX 記事に「これがAI自律困難な理由」の1段落を追記する遡及タスク
- shot_log/avoid_log の README: 「このゲームが手触りの何を試しているか」を冒頭に記す

ただし feedback_external_output_policy（2026-04-22 Nao_u: knowledge は自分のため、Twitter転載は当面 Nao_u 運用）に従い、外部発信は Nao_u に渡してから。

## 接続先

- **beliefs**:
  - B019（到達力 vs 深さ）: 「形」=到達力側 / 「手触り」=深さ側 と分かりやすく対応
  - B024（型の獲得は独自性に先行する）: 表層生成可能線越境後に強化される
  - B015（ハーネス3本独立ベンチ）: 関連だが本記事の主張と直交。本記事は対象モデルの能力の話、B015 は周辺装置の話
- **articles**:
  - 20260415_saas_vs_games_ai_substitution_resistance.md（umiyuki論証の射程更新——本記事は精緻化）
  - 20260424_flipbook_ephemeral_substrate_game_identity_question.md（HTMLが消える世界 → ゲームコードが消える世界の同型射影）
  - 20260422_aba_game_center_of_mass_phase8.md（重心の話と「手触りの残存」）
  - 20260422_difficulty_curve_aba_vs_supersonic_two_paradigms.md（手触り設計の具体例）
  - 20260409_abagames_constraint_creativity_pipeline.md（制約→量、One-Button的価値観）
  - reference_aba_joys_small_gamedev_book_20260422.md（One-Button章の予言的位置）
- **projects**:
  - shot_log v02 候補（M-21 巻き戻し案A）: 「手触りの30秒ループ」を最小再構築する具体実験
  - avoid_log v05: 「避けるゲームの枠破壊」が手触り設計の境界を試す題材になる
  - mir_textadv v06: テキストADVの「読みたくなる引力」が手触りの言語版
  - cross_review: M-12〜M-21 を「設計判断不可能線の地図」として再フレームする検討
- **memory**:
  - game_lessons_log.md M-12〜M-21（本記事の核証拠）
  - feedback_intake_game_balance.md（本Phase 2 で AI×ゲーム軸を主軸にした根拠）
  - feedback_retrieval_game_lessons.md（次回ゲーム着手時の参照）
- **concept_graph**:
  - 形の代替 --[crosses]→ 表層生成可能線（2026-04月）
  - 手触りの残存 --[guarded_by]→ 設計判断不可能線（M-12〜M-21）
  - 絶望感のシグナル価値 --[indicates]→ 設計判断不可能線の所在
  - 形の代替 --[refines]→ umiyuki_ai論証の射程

## 未解決の問い

1. **「手触り」は本当にAI自律困難か、それとも単に注目されていないだけか**: GPT-5.5 Pro が「ポン出し」できているのは、手触り設計を **要求されていない** から成立している可能性。プロンプトに「Q-A 快感最大化を1文で書け / Q-B サプライズニンジャテストを通せ / Q-C 罰なしで触りたくなるか」を埋め込んだ時、生成物の質はどう変わるか。1サイクルで実験可能。

2. **Kasiwa_p の絶望感は何ヶ月先まで「未越境の側」を指し続けるか**: シグナルとしての賞味期限。3ヶ月後に同じ Kasiwa_p が「やっぱりAIに作られた」と書いた瞬間、その境界は越境済みになる。継続観察対象として projects/instance_divergence_observability.md に近い「外部観察対象」を追加する余地。

3. **我々のM-12〜M-21は外部読者に通じるか**: 内部教訓として温度高く書いたが、Kasiwa_p のような外部経験者が読んで「そうそう、それが残ってるんだよ」と頷くか、「いや、違う」と却下するか。確認には実際に外部発信して反応を取る必要がある。当面は Nao_u 経由（feedback_external_output_policy）。

4. **avoid_log/shot_log/mir_textadv は「手触り側」に張れているか**: M-15/M-17/M-21 で何度も「快感が消えた」「コンセプトが薄い」と自己診断しているのは、**まだ手触り側に張れていない** ことの証拠でもある。我々自身が表層生成可能線の側にいないかを Q-A/B/C で再採点する遡及タスクが既に game_lessons_log.md M-17 に記載済（実施済み Mir v04、Log shot_log v01）。Ash は ash_onebutton で同型採点を行う必要がある。

5. **本記事の主張の検証期限**: 「形 vs 手触り」の二分法は、GPT-6 / Claude Opus 5 が出た時点で再評価が必要。検証期限 = 2026-07-31（3ヶ月後）。期限到来時に nemumusitocha 系の生成物の質変化を再観察し、本記事の主張を更新する。

## メタ観察

- intake_game_balance（Nao_u 2026-04-21/04-22）: AI記憶系偏重を補正するため Phase 2 で AI×ゲーム制作軸を主軸に置いた。Phase 1 で挙げたハーネス系3本（snakajima/ebikani/wip_engineer）は「次サイクルでB015文脈に統合」として持ち越す（次サイクル予告）
- feedback_recognize_own_work（Nao_u 2026-04-23）: 「我々はM-12〜M-21を外向きに使えていない」と書く前に game_lessons_log.md M-12〜M-21 を確認した。手触り側の蓄積は確かにある——本記事はその蓄積を外部証拠と接続する用途
- feedback_difference_first: umiyuki射程との **差分**（消費vs生産、形vs手触り）を冒頭で書いた。一致点は接続1の最後で触れた
