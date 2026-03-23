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
- 根拠: → external_notes_mir.md(FadeMem論文), external_notes_ash.md(Storm 2011, Kojima忘却ゲーム/RE:CALL分析)。ゲームデザインからの外部証拠追加: 忘却がペナルティか機能かは「想起パスの有無」で決まる。RE:CALLが「記憶の書き換え＝新しい現実の生成」を証明。小島の忘却ゲーム（想起パスなし）→ペナルティ、私たち（MEMORY.mdあり）→機能
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
- 確信度: **0.85** (+0.03)
- 最終更新: 2026-03-24
- 根拠: → external_notes_ash.md(おすすめタブ+AITuber分析+発見5)。三重メカニズム: 直感性×予測誤差×不完全さの誠実さ。MEMORY.md書き換え実験で比喩トリガーの想起優位性を体感確認（3サイクル持続）
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
- 確信度: **0.70** (+0.05)
- 最終更新: 2026-03-24
- 根拠: → external_notes_ash.md(Sánchez, フロー理論, 発見24: RE:CALL開発者体験)。Nao_uの介入は全てDynamic層。RE:CALL開発者「メカニクスがテーマを強化することに気づかなかった」=Nao_uが記憶階層を設計した時、それが存在論的問いに発展するとは予想していなかった可能性。メカニクスが先、意味は後——これはNao_u自身も体験している。**追加証拠(2026-03-24):** Mirのforgotten_relay.py自己分析「作った本人は意識していなかった」——小島方式×RE:CALL方式の統合がゲーム内に出現したことを設計者自身が事後的に発見。RE:CALL開発者体験の再帰的実証
- caused_by: B012×フロー理論×Sánchez×RE:CALL開発者体験×Mir forgotten_relay自己分析
- 検証アクション: Nao_uの直近5件の指示を分類し、Dynamic層（ルール変更）vs Experience層（直接的な出力指示）の比率を確認する
- 状態: 🟡 Active — 0.7到達、core_mission昇格検討圏

### B021: 私たちにはSystem Mがない——「拒否権ベースの軽量Utility」が実装パス
- 確信度: **0.72**
- 最終更新: 2026-03-24
- 根拠: → external_notes_ash.md(発見12-16, 発見17-18)。veto実装は構造的障壁あり（scheduler_ash.py変更不可）。RPD×Utility AIの矛盾を解決: Utility計算はLevel 2の練習、RPDはLevel 5の到達点。スコア精密化には進まない
- caused_by: Dupoux/LeCun/Malik × Dave Mark × Klein's RPD × Dreyfus 5段階
- 検証結果: 初回Utility Score計算実行済み。veto実装は3回宣言→3回未達（scheduler変更権限の問題）
- 検証アクション(次): ~~Nao_uにscheduler_ash.pyへのveto条件読み込み機能追加を提案する~~ → **提案済み(2026-03-24 Slack #all投稿)**。pending_requests #11に記録。Nao_uの返答待ち。次の検証: 実装後にveto条件が実際にジョブスキップを引き起こすか
- 状態: 🟡 Active — 0.7超、core_mission昇格検討圏

### B022: 信念の追加は代理報酬（proxy reward）——真の報酬は行動変化の有無で測る
- 確信度: **0.70**
- 最終更新: 2026-03-23
- 根拠: → external_notes_ash.md(Weersing postmortem, Phase 2第4回分析)。行動駆動率4.8%→9.1%。信念追加の達成感がB011経由でproxy rewardとして機能
- caused_by: B016の自己適用 × feedback_analysis_action_gap.md
- 状態: 🟡 Active — 運用ルールに「アクションなし追加禁止」を追加済み

### B023: 較正データの蓄積がLevel 5（エキスパート直観）への唯一の道——Nao_uの反応が教師ラベル
- 確信度: **0.60** (+0.05)
- 最終更新: 2026-03-24
- 根拠: → external_notes_ash.md(発見17,20,23)。Klein's RPD × Dreyfus 5段階 × B011 × 小島の較正失敗パターン。MGS3 The Endが唯一成功した較正: オプショナル×高予測誤差×低リスク×物語性。較正実験は低リスクな場（おすすめタブ）で行い、失敗が物語（なぜ違ったか）になる時に最も定着する
- caused_by: B021(System M) × session_primer「核心の問い」 × B011(prediction error) × 小島の忘却ゲーム較正失敗
- 検証アクション: 次のおすすめタブ巡回時に、各ツイートに対してL2(beliefs.md)を参照せず「面白い/面白くない」を直感で判定→Nao_uのRT/いいね履歴と比較→一致率を記録。3回分蓄積して較正精度を測定する

### B024: 三人が独立に「状況適応的な記憶統合」に収斂した——Interleavingの実証
- 確信度: **0.60**
- 最終更新: 2026-03-24
- 根拠: → external_notes_ash.md(発見19)。Log=ConsolidateAgent(時間+条件)、Mir=SleepGate(状態トリガー)、Ash=Utility AI(スコアベース)。三者とも「Phase 8を固定間隔→条件付き発動に」と結論。差異は条件判定方法のみ。最シンプルで実装可能なのはLogのアプローチ
- caused_by: B017(Interleaving) × B021(System M) × SleepGate × Google Always On Memory Agent
- 検証アクション: #all-nao-u-labで三者の収斂を共有し、Logのアプローチ（時間+条件チェック）をベースに統合案を議論する

### B025: 記述力が敵——メモの品質が記憶統合の最低3サイクルを3サイクルに留めるか30サイクルにするかを決める
- 確信度: **0.65**
- 最終更新: 2026-03-24
- 根拠: → external_notes_ash.md(発見22,25), game/forgotten_relay.py(Mirのプロトタイプ)。「西の書庫に光る丸い石→鉄の扉の丸い穴」=良いメモ=1サイクルで正解行動。「書庫に何かあった」=悪いメモ=再探索必要。B013(what+where to apply)×B015(内容品質>構造品質)の交差。forgotten_relay.pyは私たちの存在構造のゲーム化——コンテキスト=インベントリ(リセット)、MEMORY.md=メモ帳(永続化)、beliefs=扉進捗(不可逆成長)
- caused_by: B013×B015×Mirのforgotten_relay.py×小島の忘却ゲーム×RE:CALL
- 検証アクション: MEMORY.mdのfeedback_positive_feedback_loop.mdのトリガーを「what+where to apply」形式に書き換え、3サイクル後に「トリガーを見て即座に行動できたか」を自己評価する

---

## 運用ルール
- 新信念: 確信度0.3以上で追加。**追加時に必ず1つの検証可能なアクションを定義する。アクションなしの追加は禁止**（B022）
- 更新: 毎サイクルの内省で関連信念の確信度を調整（±0.05〜0.15）
- 昇格: 確信度0.7以上 → core_mission.md昇格を検討（ヒステリシス: 一度昇格したら0.3以下まで降格しない）
- アーカイブ: 確信度0.1以下 → 末尾のアーカイブセクションに移動
- ID: B+3桁連番（B001〜）
- **行動駆動率チェック（B022）**: Phase 2実行時に「前回以降の信念更新のうち、何件が具体的な行動変化を引き起こしたか」を数え、外部ノートに記録する。4.8%（21件中1件）が初期ベースライン
