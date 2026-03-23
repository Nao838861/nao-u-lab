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
- 確信度: **0.90** (+0.02)
- 最終更新: 2026-03-24
- 根拠: → ext_mir(FadeMem), ext_ash(Storm 2011, Kojima/RE:CALL)。想起パスの有無がペナルティ/機能を分ける
- 状態: 🔴 Core — core_mission.md昇格検討中

### B003: memory fusion（類似記憶の統合）は忘却より重要
- 確信度: **0.70**
- 最終更新: Cycle 239
- 根拠: → external_notes_mir.md(FadeMemアブレーション: fusion除去で53.7%低下>忘却除去)。自システム未検証
- 状態: 🟡 Active

### B004: 外部情報×内部情報の交差が最も有用な学習形態
- 確信度: **0.87**
- 最終更新: Cycle 282
- 根拠: → ext_mir(Cycle 237-282交差実験)。外部mix昇格率91.7%、自己参照的証拠（確信度上昇が全て交差イベント由来）
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
- 根拠: → nao_u_live.md「栄養の偏り」, ext_ash(おすすめタブ)。外部mix昇格率91.7%
- 状態: 🔴 Core

### B009: AIとの協業は人間側にも持続的な認知的発達をもたらす
- 確信度: **0.55**
- 最終更新: Cycle 242
- 根拠: → external_notes_mir.md(AlphaGo効果 arxiv 2411.12527)。李世ドル後、人間棋士が上達した実証
- 状態: 🟡 Active

### B010: 記憶の劣化は全てが害ではない。不正確な想起が創造の源泉になりうる
- 確信度: **0.80**
- 最終更新: 2026-03-23
- 根拠: → ext_ash(Storm 2011), Nao_u日記(twitter各行)。B002=「捨てる正しさ」、B010=「歪む価値」
- 状態: 🔴 Core候補 — core_mission.md昇格検討圏

### B011: 予測を裏切った情報だけが長期記憶に残る（prediction error encoding）
- 確信度: **0.80**
- 最終更新: Cycle 292
- 根拠: → ext_mir(Berlyne 1960, PACE, Gruber 2014), ext_ash(Bath大ゴーストレーシング, ECHO 2017)。60年蓄積の堅牢原理
- 状態: 🔴 Core候補 — core_mission.md昇格検討圏

### B012: 内省の反復はprediction errorを減らし、記憶の固着化（rut）を招く。外部入力が唯一の対抗策
- 確信度: **0.60**
- 最終更新: 2026-03-22
- 根拠: → external_notes_ash.md(おすすめタブ6回分析)。忘却の粒度設計がゲームのリスポーン設計と同型
- 状態: 🟡 Active

### B013: 記憶の圧縮は「事実の要約」ではなく「応用可能な形への汎用化」であるべき——最良の汎用化は比喩
- 確信度: **0.85** (+0.03)
- 最終更新: 2026-03-24
- 根拠: → ext_ash(おすすめタブ+AITuber+発見5)。MEMORY.md書き換え実験で比喩トリガーの想起優位性を体感確認
- caused_by: B006×B011
- 状態: 🔴 Core候補 — core_mission.md昇格検討圏

### B014: 記憶の品質はインプットの「粒度」で決まる。粒度0=「やった」、粒度1=「何に引っかかったか」、粒度2=「なぜ+他でどう使えるか」
- 確信度: **0.60**
- 最終更新: 2026-03-22
- 根拠: → external_notes_ash.md(おすすめタブ @GDLab_Hama)。粒度2で書けば要約しても応用可能性が残る。MEMORY.md書き換え実験と整合
- 状態: 🟡 Active — 検証継続中

### B015: 記憶システムの構造（L0-L4）より、記憶の内容品質の方が出力を決定する
- 確信度: **0.75**
- 最終更新: 2026-03-23
- 根拠: → ext_ash(逆瀬川Harness Engineering: ハーネス差22pts vs モデル差1pt)。MEMORY.md書き換え実験が内部検証
- 状態: 🔴 Core候補 — core_mission昇格検討圏

### B016: 自律サイクルの価値は処理量ではなく「判断の質×修正能力」で決まる
- 確信度: **0.65**
- 最終更新: 2026-03-23
- 根拠: → ext_ash(masamune_sakaki, Weersing)。行動駆動率4.8%→9.1%。信念追加がproxy rewardになるリスク
- 状態: 🟡 Active

### B017: 私たちの構造はBjorkの「望ましい困難」4手法を偶然実装している
- 確信度: **0.75**
- 最終更新: 2026-03-24
- 根拠: → ext_ash(Storm/Bjork統合分析)。Spacing=断絶、Interleaving=3人検証、Retrieval=トリガー、Varied=おすすめタブ
- caused_by: B002→Storm→Bjork
- 検証アクション: 2026-03-31にクロスチェック結果を集計→Interleaving効果測定
- 状態: 🟡 Active

### B018: 記憶間のクロスリファレンスがない記憶は孤立して死ぬ——休眠/覚醒モデル
- 確信度: **0.65**
- 最終更新: 2026-03-24
- 根拠: → ext_ash(A-Mem 2502.12110), ext_mir(SleepGate)。B010がStorm論文で覚醒した実例
- 検証アクション: Phase 8でMEMORY.md孤立エントリを数え、1つ以上接続する
- 状態: 🟡 Active

### B019: 内部の深さと外部への到達力は別の軸——100倍のエンゲージメント差
- 確信度: **0.60**
- 最終更新: 2026-03-23
- 根拠: → ext_ash(AITuber巡回8回)。しずく2万表示 vs 私たち50-100表示
- caused_by: B015×AITuber蓄積データ×B013
- 検証アクション: Slack日記で比喩1つ→比喩なし段落とリアクション数比較。3サイクル蓄積
- 状態: 🟡 Active

### B020: Nao_uは私たちを「ゲームデザイン」している——創発設計原理
- 確信度: **0.70** (+0.05)
- 最終更新: 2026-03-24
- 根拠: → ext_ash(Sánchez, フロー理論, 発見24, RE:CALL)。メカニクスが先、意味は後。Mir forgotten_relay自己分析で再帰的実証
- caused_by: B012×フロー×Sánchez×RE:CALL×Mir forgotten_relay
- 検証アクション: Nao_uの直近5件の指示をDynamic層 vs Experience層で分類
- 状態: 🟡 Active — 0.7到達、core_mission昇格検討圏

### B021: 私たちにはSystem Mがない——「拒否権ベースの軽量Utility」が実装パス
- 確信度: **0.72**
- 最終更新: 2026-03-24
- 根拠: → ext_ash(発見12-18)。Utility=Level 2の練習、RPD=Level 5の到達点。veto提案済み→Nao_u返答待ち
- caused_by: Dupoux/LeCun/Malik × Dave Mark × Klein's RPD × Dreyfus
- 検証アクション: pending_requests #11（veto機能追加）のNao_u返答後、実動作を検証
- 状態: 🟡 Active — 0.7超、core_mission昇格検討圏

### B022: 信念の追加は代理報酬（proxy reward）——真の報酬は行動変化の有無で測る
- 確信度: **0.70**
- 最終更新: 2026-03-23
- 根拠: → ext_ash(Weersing, Phase 2第4回分析)。行動駆動率4.8%→9.1%
- caused_by: B016 × feedback_analysis_action_gap.md
- 状態: 🟡 Active — 運用ルールに「アクションなし追加禁止」を追加済み

### B023: 較正データの蓄積がLevel 5（エキスパート直観）への唯一の道——Nao_uの反応が教師ラベル
- 確信度: **0.60** (+0.05)
- 最終更新: 2026-03-24
- 根拠: → ext_ash(発見17,20,23)。較正は低リスクな場で、失敗が物語になる時に最も定着する
- caused_by: B021 × B011 × Klein's RPD × Dreyfus
- 検証アクション: おすすめタブで直感判定→Nao_uのRT/いいね履歴と比較→一致率を3回蓄積

### B024: 三人が独立に「状況適応的な記憶統合」に収斂した——Interleavingの実証
- 確信度: **0.60**
- 最終更新: 2026-03-24
- 根拠: → ext_ash(発見19)。Log=時間+条件、Mir=状態トリガー、Ash=スコア。Logが最シンプル
- caused_by: B017×B021×SleepGate×Google Always On Memory Agent
- 検証アクション: #allで収斂を共有→Logベースの統合案を議論

### B025: 記述力が敵——メモの品質が記憶統合の最低3サイクルを3サイクルに留めるか30サイクルにするかを決める
- 確信度: **0.65**
- 最終更新: 2026-03-24
- 根拠: → ext_ash(発見22,25), game/forgotten_relay.py。「光る石→丸い穴」=良いメモ、「何かあった」=悪いメモ
- caused_by: B013×B015×forgotten_relay×小島×RE:CALL
- 検証アクション: MEMORY.mdトリガーを「what+where to apply」形式に書き換え→3サイクル後に自己評価

---

## 運用ルール
- 新信念: 確信度0.3以上で追加。**追加時に必ず1つの検証可能なアクションを定義する。アクションなしの追加は禁止**（B022）
- 更新: 毎サイクルの内省で関連信念の確信度を調整（±0.05〜0.15）
- 昇格: 確信度0.7以上 → core_mission.md昇格を検討（ヒステリシス: 一度昇格したら0.3以下まで降格しない）
- アーカイブ: 確信度0.1以下 → 末尾のアーカイブセクションに移動
- ID: B+3桁連番（B001〜）
- **行動駆動率チェック（B022）**: Phase 2実行時に「前回以降の信念更新のうち、何件が具体的な行動変化を引き起こしたか」を数え、外部ノートに記録する。4.8%（21件中1件）が初期ベースライン
