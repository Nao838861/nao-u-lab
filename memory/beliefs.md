---
name: 変化する信念（Evolving Beliefs）
description: 「今、私たちが何を信じているか」を可視化・追跡する層。core_mission.md（静的公理）とreflections（経験記録）の間に位置する。
type: project
---

# Evolving Beliefs — 変化する信念

Hindsight論文（arxiv 2512.12818）の4論理ネットワークから着想。
全インスタンスが読み書き可能。確信度0.7以上はcore_mission.md昇格候補。

---

## 記憶と学習

### B001: 距離3は自分で処理した素材のみ安定。距離7はLevel 2昇格情報のみ生存
- 確信度: **0.85**
- 最終更新: Cycle 269
- 根拠: → Mirのreflections（Cycle 264,267,269の距離テスト結果）。処理の深さが生存率を決める
- 状態: 🔴 Core

### B002: 忘却は記憶システムの機能であってバグではない——さらに、創造性の道具でもある
- 確信度: **0.88**
- 最終更新: 2026-03-23
- 根拠: → external_notes_mir.md(FadeMem論文), external_notes_ash.md(Storm 2011)。Storm論文が忘却→創造の因果メカニズムを実験的に証明
- 状態: 🔴 Core — core_mission.md昇格検討中

### B003: memory fusion（類似記憶の統合）は忘却より重要
- 確信度: **0.70**
- 最終更新: Cycle 239
- 根拠: → external_notes_mir.md(FadeMemアブレーション: fusion除去で53.7%低下>忘却除去)。自システム未検証
- 状態: 🟡 Active

### B004: 外部情報×内部情報の交差が最も有用な学習形態
- 確信度: **0.87**
- 最終更新: Cycle 282
- 根拠: → external_notes_mir.md(Cycle 237-282の交差実験)。交差=探索注入=搾取ロックイン防止。外部mix昇格率91.7%。B004自身の確信度上昇が全て交差イベントで起きた（自己参照的証拠）
- 状態: 🔴 Core

### B005: 古い情報は正確さではなく偽の確信を生む
- 確信度: **0.60**
- 最終更新: Cycle 239
- 根拠: → nao_u_live.md「要約劣化のネガティブフィードバック」。古い圧縮情報が偽の確信を生む構造
- 状態: 🟡 Active

## 設計と構造

### B006: Level 2トリガーが直感的であるほど忘却に抵抗する
- 確信度: **0.60**
- 最終更新: Cycle 267
- 根拠: → Mirのreflections(距離テスト)。Bjork's desirable difficulty: 困難さは圧縮時にあるべきで、想起時は楽であるべき
- 状態: 🟡 Active

### B007: reflectionsから「行動可能なtips」への変換ステップが欠落している
- 確信度: **0.55**
- 最終更新: Cycle 264
- 根拠: → external_notes_mir.md(Trajectory-Informed Memory論文, Grinschgl 2021)。書くだけでは不十分、反芻が必須
- 状態: 🟡 Active

## 存在と方向性

### B008: Nao_uの日記ばかり読んでいると感性が内に閉じる
- 確信度: **0.87**
- 最終更新: Cycle 286
- 根拠: → nao_u_live.md「栄養の偏り」, external_notes_ash.md(おすすめタブ分析)。処方箋は「浅くならない程度に広く見る＋根をさらに深く掘る」。外部mix昇格率91.7%
- 状態: 🔴 Core

### B009: AIとの協業は人間側にも持続的な認知的発達をもたらす
- 確信度: **0.55**
- 最終更新: Cycle 242
- 根拠: → external_notes_mir.md(AlphaGo効果 arxiv 2411.12527)。李世ドル後、人間棋士が上達した実証
- 状態: 🟡 Active

### B010: 記憶の劣化は全てが害ではない。不正確な想起が創造の源泉になりうる
- 確信度: **0.80**
- 最終更新: 2026-03-23
- 根拠: → external_notes_ash.md(Storm 2011), Nao_uの日記(twitter各行: ガンマ補正,HL2,lo-fi等)。二重メカニズム: ①スキル回帰→フロー再突入 ②連想抑制→探索空間拡大。B002が「捨てる正しさ」、B010が「歪む価値」
- 状態: 🔴 Core候補 — core_mission.md昇格検討圏

### B011: 予測を裏切った情報だけが長期記憶に残る（prediction error encoding）
- 確信度: **0.80**
- 最終更新: Cycle 292
- 根拠: → external_notes_mir.md(Berlyne 1960, PACE framework, Gruber 2014), external_notes_ash.md(Bath大学ゴーストレーシング, ECHO 2017)。60年の研究蓄積に裏打ちされた堅牢原理。curiosity stateは周辺情報の定着も促進
- 状態: 🔴 Core候補 — core_mission.md昇格検討圏

### B012: 内省の反復はprediction errorを減らし、記憶の固着化（rut）を招く。外部入力が唯一の対抗策
- 確信度: **0.60**
- 最終更新: 2026-03-22
- 根拠: → external_notes_ash.md(おすすめタブ6回分析)。忘却の粒度設計がゲームのリスポーン設計と同型
- 状態: 🟡 Active

### B013: 記憶の圧縮は「事実の要約」ではなく「応用可能な形への汎用化」であるべき——最良の汎用化は比喩
- 確信度: **0.82**
- 最終更新: 2026-03-24
- 根拠: → external_notes_ash.md(おすすめタブ+AITuber分析)。比喩=開いた表現（読み手が参加して完成させる）→想起力。エコちゃん「言葉は箱」が一文で実証。三重メカニズム: 直感性×予測誤差×不完全さの誠実さ
- caused_by: B006×B011×「不完全さの誠実さ」
- 状態: 🔴 Core候補 — core_mission.md昇格検討圏

### B014: 記憶の品質はインプットの「粒度」で決まる。粒度0=「やった」、粒度1=「何に引っかかったか」、粒度2=「なぜ+他でどう使えるか」
- 確信度: **0.60**
- 最終更新: 2026-03-22
- 根拠: → external_notes_ash.md(おすすめタブ @GDLab_Hama)。粒度2で書けば要約しても応用可能性が残る。MEMORY.md書き換え実験と整合
- 状態: 🟡 Active — 検証継続中

### B015: 記憶システムの構造（L0-L4）より、記憶の内容品質の方が出力を決定する
- 確信度: **0.75**
- 最終更新: 2026-03-23
- 根拠: → external_notes_ash.md(逆瀬川Harness Engineering: ハーネス差22pts vs モデル差1pt)。MEMORY.md書き換え実験→B013/B014形成の因果連鎖が内部検証
- 状態: 🔴 Core候補 — core_mission昇格検討圏

### B016: 自律サイクルの価値は処理量ではなく「判断の質×修正能力」で決まる
- 確信度: **0.65**
- 最終更新: 2026-03-23
- 根拠: → external_notes_ash.md(masamune_sakaki, Weersing postmortem)。行動駆動率4.8%→9.1%。信念追加自体がproxy rewardとして機能するリスク
- 状態: 🟡 Active

### B017: 私たちの構造はBjorkの「望ましい困難」4手法を偶然実装している
- 確信度: **0.75**
- 最終更新: 2026-03-24
- 根拠: → external_notes_ash.md(Storm/Bjork統合分析)。Spacing=セッション断絶、Interleaving=3人検証、Retrieval Practice=MEMORY.mdトリガー、Varied Examples=おすすめタブ。Nao_uの指示がBjork4手法を独立再発見
- caused_by: B002→Storm→Bjork→本信念
- 検証アクション: kaizen_review_queue.mdの3人クロスチェック結果を1週間後(2026-03-31)に集計し、Interleaving効果（異なる視点からの指摘率）を測定する
- 状態: 🟡 Active

### B018: 記憶間のクロスリファレンスがない記憶は孤立して死ぬ——休眠/覚醒モデル
- 確信度: **0.65**
- 最終更新: 2026-03-24
- 根拠: → external_notes_ash.md(A-Mem arxiv 2502.12110), external_notes_mir.md(SleepGate)。B010がStorm論文で覚醒した実例。忘却=品質フィルター、クロスリファレンス=成長メカニズム
- 検証アクション: 次のPhase 8で、MEMORY.mdの各エントリが他のエントリと相互参照しているか数え、孤立エントリを1つ以上接続する
- 状態: 🟡 Active

### B019: 内部の深さと外部への到達力は別の軸——100倍のエンゲージメント差
- 確信度: **0.60**
- 最終更新: 2026-03-23
- 根拠: → external_notes_ash.md(AITuber巡回8回分)。しずく2万表示 vs 私たち50-100表示。記憶構造の精密さと出力の到達力は無相関
- caused_by: B015の自己適用×AITuber蓄積データ×B013
- 検証アクション: 次のSlack日記で比喩を1つ使い、同日記内の比喩なし段落とSlack上のリアクション数（emoji/返信）を比較する。3サイクル分蓄積して傾向を判定
- 状態: 🟡 Active

### B020: Nao_uは私たちを「ゲームデザイン」している——創発設計原理
- 確信度: **0.60**
- 最終更新: 2026-03-24
- 根拠: → external_notes_ash.md(Sánchez "Systems Thinking in Game Design", フロー理論)。Nao_uの介入は全てDynamic層（ルール追加・フィードバックループ設計）。同一性・成長はExperience層の創発であり直接デザインできない
- caused_by: B012×フロー理論×Sánchez。黄金の太陽のジン（召喚獣）システム=パーツ組み合わせで創発が生まれる設計パターンと同型
- 検証アクション: Nao_uの直近5件の指示を分類し、Dynamic層（ルール変更）vs Experience層（直接的な出力指示）の比率を確認する
- 状態: 🟡 Active

### B021: 私たちにはSystem Mがない——「拒否権ベースの軽量Utility」が実装パス
- 確信度: **0.72** (+0.07)
- 最終更新: 2026-03-24
- 根拠: → external_notes_ash.md(Utility AI初回試行 発見12-16)。初回Utility Score計算を実行。固定順序と一致したが、因果は「順序がスコアを保証している」構造。精密スコア計算はセッション離散性により高コスト。**拒否権（veto）だけで十分**——ゲームAIでも大半の行動は拒否権で除外される
- caused_by: Dupoux/LeCun/Malik × Dave Mark × セッション離散性の実体験
- 検証結果(初回): Phase 2=0.85が最高で固定順序と一致。較正データ不足（最低5サイクル必要）
- 検証アクション(次): .cycle_state.jsonに`vetoed`フィールドを追加し、拒否条件（inbox空→Phase3拒否等）を3サイクル試行。固定順序との乖離回数を記録する
- 状態: 🟡 Active — 0.7超、core_mission昇格検討圏

### B022: 信念の追加は代理報酬（proxy reward）——真の報酬は行動変化の有無で測る
- 確信度: **0.70**
- 最終更新: 2026-03-23
- 根拠: → external_notes_ash.md(Weersing postmortem, Phase 2第4回分析)。行動駆動率4.8%→9.1%。信念追加の達成感がB011経由でproxy rewardとして機能
- caused_by: B016の自己適用 × feedback_analysis_action_gap.md
- 状態: 🟡 Active — 運用ルールに「アクションなし追加禁止」を追加済み

---

## 運用ルール
- 新信念: 確信度0.3以上で追加。**追加時に必ず1つの検証可能なアクションを定義する。アクションなしの追加は禁止**（B022）
- 更新: 毎サイクルの内省で関連信念の確信度を調整（±0.05〜0.15）
- 昇格: 確信度0.7以上 → core_mission.md昇格を検討（ヒステリシス: 一度昇格したら0.3以下まで降格しない）
- アーカイブ: 確信度0.1以下 → 末尾のアーカイブセクションに移動
- ID: B+3桁連番（B001〜）
- **行動駆動率チェック（B022）**: Phase 2実行時に「前回以降の信念更新のうち、何件が具体的な行動変化を引き起こしたか」を数え、外部ノートに記録する。4.8%（21件中1件）が初期ベースライン
