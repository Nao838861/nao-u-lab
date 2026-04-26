---
title: close-call可視化はjuicinessに含まれない第三軸——ABA本TOC × ash_onebutton v02 の差分分析
source:
  - https://abagames.github.io/joys-of-small-game-development-en/make_game_juicy.html
  - https://abagames.github.io/joys-of-small-game-development-en/
  - https://dl.acm.org/doi/10.1145/3311350.3347171  # Hicks et al. CHI Play 2019（本文403、TOC上の存在確認のみ）
  - https://www.researchgate.net/publication/233529019_Near_Miss_in_a_Video_Game_an_Experimental_Study  # 同上、本文403
author: Ash (Win2) — 分析
discovered: 2026-04-27
discovered_via: Phase 1 外部検索（クエリ "close call near miss visualization game feel juiciness arcade design 2025"）
kind: [synthesis, prescription]
confidence: medium
tags: [game_design, juiciness, near_miss, close_call, ash_onebutton_v02, aba, headless_measurement]
concept_nodes:
  - node: 紙一重ボーナス
    external: close-call reward / near-miss feedback (Reid 1986; Clark 2010 — gambling psychology)
    meaning: 障害物に当たる直前の回避を即時の正フィードバックで明示する仕組み。ash_onebutton v02 で「金色リング+CLOSE+N」として実装。
  - node: juiciness
    external: visual embellishment / game feel (Hicks et al. 2019; Swink 2009)
    meaning: 核メカニクスを変えずに視覚・音・モーションの装飾で体験を増幅する設計手法。
  - node: 第三軸
    external: orthogonal design dimension / underexplored design space
    meaning: ABA本「Joys of Small Game Development」の Difficulty章 / Juicy章のいずれにも完全には含まれない、close-call/near-miss可視化という設計軸。

## 主張と根拠

### 1. ABA本「Making Games 'Juicy'」章はclose-call/near-missに触れていない（本日確認）

ABA本人による『Joys of Small Game Development』の TOC を全章確認し、第7章「Making Games 'Juicy'」本文を WebFetch で取得した結果：

- 章で扱う具体技法: 色追加 / オブジェクトサイズの跳ね / パーティクル / 画面シェイク / 顔と表情 / hit-stop と knock-back / 音と環境リアクション / tweening と easing
- 引用例: **Peggle** (PopCap) — Jimmy Lightning のセリフ・最終ペグ前の drumroll/zoom・成功時の symphonic music
- **明示的に欠落しているもの**: near-miss / close-call feedback。「ヒットの瞬間」の演出は厚いが、「**ヒットしなかった瞬間**」の演出は扱われない

第6章「What Constitutes Appropriate Difficulty」も「Rising Difficulty Curve」と「Level-based Difficulty Setting」の2節構成で、難易度カーブの設計を扱うが、**回避成功の即時可視化**は扱わない。

つまり ABA本の枠組みでは、**「障害物が当たる/当たらない」の二値判定の外側にある「紙一重で当たらなかった」という**第三状態**を扱う章が存在しない**。

### 2. near-miss効果はゲームデザインではなくギャンブル心理学から来ている

「near-miss」は元々スロットマシン研究の概念（Reid 1986「The psychology of the near miss」, Clark 2010「Gambling near-misses enhance motivation to gamble and recruit win-related brain circuitry」）。「あと一歩で勝てた」という錯覚が次の試行への動機を強める。Skinner の variable ratio reinforcement の特殊形。

ゲームデザインへの輸入は限定的で、検索クエリ「close call near miss visualization game feel juiciness arcade design 2025」（Phase 1 で実行）でヒットした学術論文 Hicks et al. CHI Play 2019「Juicy Game Design」も visual embellishment に焦点があり、近接イベントの**設計的可視化**は扱われていない（本文 403 で確認できず、ACM TOC上の存在のみ確認）。

### 3. ash_onebutton v02 の close-call 可視化は ABA 本に「第8章として加わるべき軸」かもしれない

`game/ash_onebutton/v02/devlog.md` および `headless.py` 32 runs（4ポリシー × 8 seed）の計測結果：

| policy | 生存s(平均) | CLOSE平均 | CLOSE/秒 |
|---|---|---|---|
| intended_dodger | 37.57 | 12.6 | 0.34 |
| random_mash | 5.24 | 0.9 | 0.17 |
| never_press | 7.54 | 0.0 | 0.00 |
| close_call_seeker | 2.67 | 10.1 | 3.79 |

**重要発見**: intended_dodger（普通にプレイ）は**意識せず**平均12.6回 close-call を発生させていた。v01 のコードと物理は同じなので、これは **v01 でも起きていた現象**。v02 のリング+CLOSE 表示は「無いものを生み出した」のではなく「**あるものを見せた**」。

これが ABA 本 juicy 章との本質的差異である。Juicy章の技法は全て「**追加された装飾**」（パーティクル、シェイク、SE）で、原理的には「核メカニクスを変えずに装飾を上に乗せる」。一方 close-call 可視化は「**既に存在するが知覚されていない核メカニクス内部状態**」を表に出す。装飾ではなく **perceptualizing implicit game state** (Schell 2014 The Art of Game Design 風の表現) に近い。

## 我々の分析・体験接続

### avoid_log v04 凍結教訓との接続

`memory/feedback_retrieval_game_lessons.md` および `memory/game_lessons_log.md M-15` に記録された avoid_log v系列膨張（v01→v04 で派手要素を後付け追加して破綻、Q-A/B/C 全✗）の核心は、**M-15 「快感要素の消失に気づかずバランス調整に走る盲点」**だった。

v02 close-call 可視化は M-15 の真逆を行く設計になっている：

- avoid_log v系列: 快感が**減った**ことに気づかず装飾を**追加**
- v02 close-call: 既にあった快感を**測定可能**にして**見せる**

`devlog.md` Q-C テスト結果が示すように、罰（即死）を抜くと「紙一重ゾーンを**わざと通って金色リングを発生させる**」という新たな正の動機が発生する。これは avoid_log v04 で罰を抜くと「触る動機消失」となった失敗の **反例** にあたる。

### 1HTML 1ファイル制約（S-13）との接続

ABA本 5章「Constraints: A Catalyst for Creativity」で扱われる One-Button Games の制約論と接続する。v02 は入力次元1・状態遷移1種類を維持したまま+31行で+1機能を実現した（`devlog.md` 「行数: v01=39行 → v02=70行」）。これは制約下でのフィードバック追加であり、Mir feel-per-line ratio（127行で10秒到達、Pot #2-#5 ソムリエ訓練法、`memory_search.py` ヒット）と同型の設計密度評価が可能。

### Aaltonen「No Graphics API」との交差

前サイクル知識記事 `knowledge/20260426_aaltonen_no_graphics_api.md` で扱った「PSO permutation 爆発 = 過去レイヤの仕様が現代に積層する罠」と、本記事の「ABA本 juicy章 = 視覚装飾レイヤの体系」は対照的な構造を持つ：

- Aaltonen: **既存抽象を疑え**（増えすぎたレイヤを再設計）
- 本記事: **既存抽象に**新しい軸**を足せ**（juiciness/difficulty に close-call 可視化を加える）

両者は「**既存フレームワークの未踏領域を発見する**」という同じ態度の二側面。Aaltonen は「邪魔になっている層を剥がす」方向、こちらは「足りない層を追加する」方向。

### 起票分布50%問題（前サイクル日記）との接続

前サイクル日記末尾で「起票4件のうちゲーム制作直結はinstance_divergence_observabilityすら計測装置寄りで、ゲーム本体ではない」と書いた。本記事は **逆方向** の動きである：v02 という実装が既に存在し、それを外部知識（ABA本 TOC）と突き合わせて**発見の座標**を確定する。観測装置を作るのではなく、観測対象を外部座標系に位置づける。これも「起票偏重から実装偏重へ」の変換の一形態。

## 接続先

- beliefs:
  - B027（古い情報は偽の確信を生むの集約後）— ABA本 juicy章は2024頃執筆と推定、近年の AI 生成ゲームでの新発見軸を未収録の可能性
  - 該当 belief なし（新しい第三軸の提案）— 必要なら本記事を根拠に新規 belief 起票候補
- articles:
  - `knowledge/20260422_aba_agent_gamedev_feedback_loops.md` — ABA「マルチモーダル理解が下手」と本記事「close-call は視覚的近接判定が必要」の接続
  - `knowledge/20260422_aba_game_center_of_mass_phase8.md` — Phase 8 重心論。本記事 v02 は Phase 8 で言う「核体験の言語化」を実践
  - `knowledge/20260422_difficulty_curve_aba_vs_supersonic_two_paradigms.md` — 難易度カーブ論。close-call は難易度を上げずに快感頻度を上げる第三経路
  - `knowledge/20260423_aba_life_experience_as_art_substrate.md` — 体験を芸術基盤にする話。可視化は「自分の体験を見える形にする」の意
  - `knowledge/20260426_3instance_proposer_distribution_replication_anthropic_186.md` — 起票分布50%問題と本記事の「実装→外部位置づけ」転換
  - `knowledge/20260426_aaltonen_no_graphics_api.md` — レイヤ再設計（剥がす）vs 軸追加（足す）の対照
  - `knowledge/20260409_abagames_constraint_creativity_pipeline.md` — 制約論。1ボタン+31行で+1機能の設計密度
- projects:
  - `game/ash_onebutton/v02/devlog.md` — 本記事の実装側
  - `projects/instance_divergence_observability.md` — Ash の発見軸（close-call 可視化）として水平分業度指標の例
- concept_graph:
  - 紙一重ボーナス --[concretizes]--> juiciness の未踏領域
  - close-call 可視化 --[orthogonal_to]--> visual embellishment（装飾）/ difficulty curve（難度）
  - perceptualizing implicit state --[contrasts]--> adding visible decoration

## 未解決の問い

1. **close-call 可視化はjuicinessと独立か、上位互換か、下位互換か？**
   - 仮説A: 独立軸（本記事の主張）
   - 仮説B: juiciness の特殊形（「ヒットしなかった瞬間」の embellishment）
   - 仮説C: juiciness の前段階（核体験の検出が先、装飾はその上に乗る）
   - 検証手段: v02 に juicy 装飾（ヒット時パーティクル）を追加した v03 を作り、close-call ありの v02 と比較

2. **ギャンブルのnear-miss効果は持続性を上げる（Clark 2010）が、技能ゲームではプレイヤーがexploit可能性を学ぶ。v02 close_call_seeker が CLOSE/秒3.79 で生存2.67s なのは健全か？**
   - 仮説: 罰駆動と並存している限り健全。罰を弱めると seeker戦略が支配的になり avoid_log v04 と同型の破綻
   - 検証手段: Nao_u 実プレイで「seeker戦略を選ぶか dodger 戦略を選ぶか」の自然分布を見る

3. **ABA本に「第8章として加わるべき軸」として書ける主張なのか、それとも我々の3人体験ローカルな観察に過ぎないのか？**
   - 検証手段: Hicks et al. 2019 本文を入手（Sci-Hub / 図書館 ILL）して visual embellishment 範疇に near-miss が含まれるかを定量確認
   - 補助検証: ABA 過去記事/本人 Twitter で near-miss/close-call を検索

4. **可視化の対象は close-call 以外にもありうるか？**
   - 候補: プレイヤーの姿勢（次の反転までのフレーム数）、敵の脅威度（衝突予測時間）、自分の上達速度（直近10回の close-call 平均の移動）
   - 一般化すると「**プレイヤーの内部状態 / メカニクスの内部状態 / 学習の内部状態** のどれを表に出すか」の3分類で再カタログ化できる可能性
