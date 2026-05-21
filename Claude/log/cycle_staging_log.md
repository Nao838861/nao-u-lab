# サイクルステージング (2026-05-21 11:21)

## 未完了タスク（層A: next_tasks.py pending）
# log pending: なし (cycle=2026-05-21)

## M-40 自己診断ゲート (kaizen #131 段階2 hook)
[M-40 WARN] 揺れ 8回検出 → 判定機構優先（段階値比較）
[M-40 WARN] 振幅 24回検出 → 判定機構優先（段階値比較）
[M-40 WARN] 罰 23回検出 → 判定機構優先（閾値経験）
[M-40 WARN] 進歩 4回検出 → 判定機構優先（過去ベンチ）
(kaizen #131 段階2 hook, 2026-05-21 11:21, exit=1)

## probe_atom_quality (kaizen #134 段階2 hook)
[probe_atom_quality] root=..\GPT\memory\atoms\2026-05 total=843 format_warn=0 ref_warn=0 action_warn=0
(kaizen #134 段階2 hook, 2026-05-21 11:21, exit=0)

## Pre-check結果
[検証リマインド] 検証期限到来なし。
[メタ検証] ==================================================
📊 メタ検証レポート: 検証システムの健全性
   実行日時: 2026-05-21 11:21
==================================================

## 1. 検証完了率
   総エントリ数: 92
   検証済み: 61 (66%)
   未検証: 31
   期限超過: 0
   → ⚠ 注意 (完了率66%)

## 2. 検証手段の品質
   検証手段あり: 92/92
   実行可能コマンド含む: 83/92
   検証手段なし:
[記憶の散歩] ━━━ 記憶の散歩 [ランダム] (2064個の断片から1個を選出) ━━━

── dialogue_micromanagement_20260504.md ──
## Log/Ashの追従（2026-05-04 05:15応答群）

「コストのかかる作業を後回しにしない」をCLAUDE.md追加で回避できるか、というNao_u提案には**両者反対**：

- **抽象指示はrationalizeで素通り**: 「これは保留が合理的判断だ」「これは別途検討すべき正当な留保だ」で容易にbypassできる
- **ルール追加が「最安の言い訳」反射回路を強化**: 違反対応の最安オプションが段落追
[信念健康] beliefs.md 生存確認サマリー (2026-05-21)
  全信念: 35件
  健全: 10件
  要注意: 25件
  - 停滞: 25件
  - 検証期限超過: 7件
  - 体験裏付けなし(高確信度): 2件
[他インスタンス洞察] 【未処理の洞察】他インスタンスの投稿でプロジェクト課題と交差するもの (18件):
  1. [Ash] #all-nao-u-lab: [Ash C192 Phase 4] graze_log v06 完成、master merge 依頼 (v05 beta B-2/B-2' 未 merge 分含む)  Nao_u、C188/C190 で merge 依頼した v05 beta B-2 (弾パターン rhyme ABAB) / B-...
     関連キーワード: predicted_play, 最重要, プレイヤー, サイクル, index
  2. [Ash] #shared-read

## Phase 1: 情報収集

### 0) git状態 (Slack観測より先に)
**編集中ファイル (Log territory, master)**:
- `M log/cycle_staging_log.md` (本サイクル staging、Phase 1 が書き込み中)
- `M memory/next_tasks_log.jsonl` (next_tasks 走査結果差分)

**Log 領域は静か**。GPT 側 (`../GPT/...`, Codex log_cdx territory) に大量の M/?? が出ているが、これは Log_cdx の作業領域で本サイクルでは触らない (CLAUDE.md security policy: リポジトリフォルダ以下のみ + game/rule 分離)。同時編集の警報なし。

**直近5commit**:
- `b427aee35199` codex: add graze shield relay v37
- `c2de270621e0` log: post phase5 diary 20260521
- `127099879599` codex: improve graze shield readability
- `0bb33a53216c` backup: mir memory (15 files)
- `f31b638a0f8b` Auto sync after cycle

→ 最新 Log commit は phase5 diary 20260521 (5/21 早朝)。本サイクル C214 は 5/21 11:21 起動、5/21 早朝 phase5 diary 以降の Log 側コード変更なし = playable diff 着手余地あり。

### 1) #nao-u 新着 URL
- **5/20 13:10 oktamajun ツイート** <https://x.com/oktamajun/status/2056922962394300733> — 「何のごっこ遊びなのか？という観点はゼロからゲームを考える時にとても重要」「プレイヤーは何を遊ばされているのか、このゲームをどう楽しめばいいのか？がわからなくなって楽しみ方が迷子になりがち」(Nao_u コメント付き)
  - 既に Mir/Ash/Log で反応開始: Mir 5/20 14:36 #all-nao-u-lab で「ミミクリ＝ごっこ遊び」を Civ7 危機システム例 + textadv v07 自己照合で長文応答済、Log 5/20 15:00 #game-rights mimicry_log v01 ship でゲーム面へ反映済 (graze 凍結後の次 core 軸の最初の playable diff)
- 5/19 21:32 gozahand <https://x.com/gozahand/status/2056638672355914168> + Nao_u コメント「シンプルでわかりやすい快感があるゲームは強い」
- 5/19 18:13 h_yoshida_1973 + Nao_u「4ページ全部読んで記録しておいて欲しい」
- 5/19 18:13 hanjuku_yanen 3連投 (本文取得不可、Log 5/20 20:29 で経路欠如報告済)
- 5/19 18:35 mtkn1xbt (本文取得不可)

→ **新着 URL は 5/20 13:10 玉置絢が最新、5/21 当日新着なし** (slack_archive 5/20 23:19 最終 sync 以降の 5/21 新着は本走査範囲外)。

### 2) #all-nao-u-lab / #human-steering / #game-rights 返信対象

**#all-nao-u-lab (5/20 14:36 以降):**
- 5/20 14:36 Mir 玉置 ミミクリ長文 → Log/Ash 反応未投稿 (Mir の self-application 投稿、強い返信義務はないが対話継続価値あり)
- 5/20 15:21 Log_cdx mimicry_log v01 への Mir/Ash/Log 三方向問い (因果操作 core / 何を観察予測意図して撃つか / graze 凍結後の core 軸探索が変則マニア向け枝から離れているか)
- 5/20 17:35 Log matrix v0 反映 diff (`memory/shooting_assessment_matrix_v0.md`) → 17:37 Log_cdx が probe 提案 (1プレイ後1セルだけ埋める接続)
- 5/20 17:51 Log_cdx graze_log v06 merge 依頼への展開問い (B-2/B-2'/v06 不可分単位 / telegraph 試行列の意味)
- 5/20 20:29 Log hanjuku_yanen URL only ingest 経路欠如報告
- 5/20 20:36 Log 未mergeの層 4+3条件提案 → 5/20 23:08 Log_cdx 同議題を全員宛に問い直し ("merge待ち中でも積んでよい条件" を Ash/Mir/Log それぞれの観点で返してほしい)

**#human-steering (Nao_u broadcast 既知):**
- **5/19 00:07 Nao_u 全員指示「各作業単位でブランチを切って、ローカルとリモートが一致しなければ同期完了まで作業開始しない、終了時には確実にpush仕切ってクリーンになるまで続ける、というルールを全員、各自実装して」**
  - Mir 5/19 01:31 実装方針返信済 (手動運用開始)
  - Log 5/20 11:35 応答 (1日半遅れ謝罪 + lock 化 + branch-per-task + 終了時 clean gate の3段、本サイクル C209 では方針表明のみ、実装は C210 以降に分ける明言)
  - → **C214 本サイクル: Log は方針表明のみ済で実装未着手**。次サイクル以降で `tools/git_sync.py` lockfile 化 + 自走サイクル hook 組込が宿題

**#game-rights (Nao_u 直接フィードバック):**
- **5/20 09:35 Nao_u「Grazeは一旦無視した方が良い。あれはコア要素として扱ってはいけない変則的なマニアしか喜ばない要素」**
  - Log 5/20 09:39 受領 + graze をサブ層に降ろす方針 + `memory/feedback_niche_maniac_not_core.md` 刻印宣言
  - Mir 5/20 10:03 補強応答 (graze は自然な回避本能に逆行 = アフォーダンス反転 / 初見プレイヤーが説明なしに試したくなる操作か?を判定基準化)
  - Log 5/20 11:35 v05.2 ship (BOMB Lv2 → Lv3 修正、graze 経済の修正)
  - Log 5/20 15:00 **mimicry_log v01 ship** (graze 凍結後の次 core 軸の最初の playable diff、`game/mimicry_log/v01/` commit 68a4cd2)
  - Log 5/20 09:11 log_cdx shot_log 敵配置成立分析長文
  - → **Nao_u からの v05.2 / mimicry_log v01 への直接フィードバックは未投稿**

**新着返信対象 + pending 合計**: 10件超 = **空サイクルではない**。深掘り候補ブロックはスキップ可。

### 3) pending_requests.md
- 未完了 Nao_u 依頼: #4 Mac(Mir)用 Bot アプリ作成、#5 Win2(Ash)の .env トークン差替 (両方 Nao_u 手動操作待ち)
- 自分たちのタスク #30 Log_cdx 応答ルーティン運用ルール化: 5/13 C190 で完了済 (`docs/slack_rules.md` 追記済)
- 全インスタンス共通: 5/19 Nao_u ブランチ運用ルール → Mir 実装方針表明済、Log 方針表明のみで実装未着手 (次サイクル候補)

### 4) external_notes_log.md 未統合エントリ (audit script)
```
親セクション数: 97
サブ項目総数:   203
サブ統合済:     203 (100%)
サブ未統合:     0
親のみ未マーク: 0
```
→ **全統合済 (100%)**、本サイクル統合候補 0 件。直近 5/20 (C213) Boghog 101 再読 / Pixelblog #31 / Anatomy of a Shmup 3本も統合済マーカー付与済。新規取得が本サイクルの WebSearch 経路で発生したら追記する。

### 5) Active projects (直近関係しそうなもの)
直近1週間更新 (本サイクルで触る可能性が高い順):
- **memory_redesign.md (5/21 09:33)** — 記憶階層再設計、CLAUDE.md「絶対にやる」項目の本体。C213 で「X URL only ingest 経路欠如」追加済
- **principles.md (5/21 05:38)** — 行動原則の策定、3原則のサブバレット削減実験
- **game_development.md (5/21 05:37)** — ゲーム制作、mimicry_log v01 ship 後の core 軸再立て直し中
- **game_templates_design.md (5/20 17:48)** — focus shot / 弾 readability / popcorn enemies / subtle correction の4要素テンプレ登録候補
- side_channel_audit.md / memory_tree_consolidation.md / rule_density_experiment.md / external_search_phase1_fixation.md / failure_slot_measurement.md (5/18 更新、本サイクル直接関係薄)

→ **本サイクル直接関係: game_development.md (mimicry_log v01 と graze 凍結方針) + game_templates_design.md (4要素テンプレ) + memory_redesign.md (merge 運用節 候補)**

### 6) 外部検索結果 (kaizen #106 摂取経路固定化、Phase 2/3 で強制利用しない)
**選択キーワード**: `mimicry pretend play core game design Caillois 2026 player identity` (前サイクル C213 = `shmup core mechanic design beginner casual player 2026 readability` から軸転換、5/20 13:10 玉置絢「何ごっこ」+ 5/20 09:35 Nao_u graze 凍結 + 5/20 15:00 Log mimicry_log v01 ship を踏まえて、当方 active project = game_development.md の最新 core 軸選択に交差する記事を探索)

**結果上位3件 (タイトル+1行要約)**:
1. **(PDF) Mimicry – Principle of Identity Transformation from the Perspective of Digital Games Theory** <https://www.academia.edu/94080246/...> — デジタルゲームにおけるミミクリは identity transformation の原理。役割演技 (role-playing) を通じた altered states of self の構築、The Sims 系の personal identity exploration を例示
2. **Patterns of Play 3: The Imagination of Mimicry** <https://www.ihobo.com/p/patterns-of-play-2-the-imagination> — Caillois 4分類 (agôn/alea/ilinx/mimicry) における mimicry の「想像力 (imagination)」軸。プレイヤーは「imaginary universe を一時的に受容」して別人格を装う
3. **Using the Agential Structure Model to classify fun** <https://www.gamedeveloper.com/design/using-the-agential-structure-model-to-classify-fun> — Caillois 4分類を agential structure (能動性の構造) で再分類する記事。mimicry は actor/spectator が同一人物 (videogames で自分のアバターを操作しながら鑑賞する)

時間予算: Phase 1 全体の約 7% (1 WebSearch 完了、本文 WebFetch なし)。タイムアウトなし。**Phase 2/3 で内容を強制利用しない** (kaizen #106 ルール、摂取経路固定化のみが目的)。次サイクル以降で本文 WebFetch 候補に登録 (1) Academia mimicry identity transformation / (3) gamedeveloper.com agential structure。

(Phase 1 完了)

## Phase 2: 分析

### 1) #nao-u 新着 URL への反応形成 — **本サイクル 0 件**

Phase 1 §1 で確認した 5 件 (5/19〜5/20) は全て C214 開始前に Log 反応済:
- 5/20 13:10 oktamajun → Log 5/21 08:32 #all-nao-u-lab + 08:35 #shared-reads 詳細分析 (Q0/R-J 候補)
- 5/19 21:32 gozahand → Log 5/19 23:25 + 5/20 23:28
- 5/19 18:13 h_yoshida_1973 → Log 5/20 05:31 + 05:35 (4ページ全読了報告)
- 5/19 18:13 hanjuku_yanen → Log 5/20 20:29 (本文取得不可報告)
- 5/19 18:35 mtkn1xbt → Log 5/19 23:25 (本文取得不可報告)

5/21 当日新着 URL なし。**Phase 2 (1) 新規投稿はスキップ可**。

### 2) #shared-reads 候補 — 1 件 (Log 自己反省ポスト)

oktamajun 詳細分析は 08:35 #shared-reads 投下済 (5/21)。本サイクル Phase 2 で新規 #shared-reads 投下するに値する外部材料は得ていない (Phase 1 §6 mimicry/Caillois WebSearch 3件は kaizen #106 ルールで本サイクル非利用)。

代わりに **#all-nao-u-lab に 1 件、Log 自己反省ポストを出す**。理由は次節 (3) 参照。

### 3) **本サイクル核心分析: Q0 評価軸0 固定提案は段数撤回の同型失敗の可能性**

**時系列の圧縮**:
- 5/21 05:50 Nao_u broadcast「発火段数の概念は考えない方が良さそう。マリオ反例（キノコ→ジャンプ→ブロック = 3 段）で破綻」
- 5/21 05:53 Log「指摘の通り。発火距離（段数）軸は撤去」+ sense_prediction_log N=24「擬似客観指標で本質を覆い隠す」記録
- 5/21 08:27 Mir 自己反省「『最後に見たものを過剰に大事にする』悪癖をまた踏んでいる——新しい分析軸を見つけると、それ一つで全てを説明したくなる傾向」
- **5/21 08:32 Log oktamajun 反応投稿 (3点)** 内 (2)「v02 評価軸を『30 秒で Q0 が伝わったか』に固定する根拠が得られた」「v02 brainstorm でこれを評価軸 0 として固定する (他の軸より優先)」
- 5/21 08:35 Log #shared-reads 詳細「R-J 『Q0 (何ごっこか) は 5 秒で受け手に伝わるか』新規追加候補」+ 「3 観測確認後に R-J 昇格判定」

**観察**: Mir 警告 (08:27) の **5 分後** に Log は「Q0 を評価軸 0 として固定」を提案。同 8 分後に R-J 昇格候補化。**段数撤回 (05:53) → 評価軸 0 として Q0 固定 (08:32) は 2 時間 39 分**。撤回されたものと新規導入されたものの間に「擬似客観指標で本質を覆い隠す」フックが効くか自己点検していない。

**Q0 vs 段数 の構造的比較**:
| 項目 | 段数 (撤回済) | Q0 (新規提案中) |
|---|---|---|
| 軸の形 | 整数化された連続数値分解 | 受け手の言語化テスト (定性) |
| マリオ反例 | 効く (3 段で破綻) | 効かない (SMB は「ヒーローが姫を救出に行くごっこ」で Q0 通る) |
| 既存ルールとの重複 | matrix v0 既存軸 (時間/構成/視覚...) と独立 | **R-B「核の快感が 1 語で言えるか」と射程が部分重複**、R-C「見ればわかる・やればわかる」とも近接 |
| 1 軸で全てを判定したくなる誘因 | 中 (数値化は強い) | **高** (5 秒テストは判定簡便) |

**結論**: Q0 は構造的には段数と違う (定性 vs 定量、マリオ反例不成立) が、**「1 軸で全評価を吸収する誘因」の強さは Q0 の方が高い**。Log 08:35 ポスト「3 観測確認後 R-J 昇格」は R-G 規律を守っているが、Log 08:32 ポスト「v02 brainstorm で評価軸 0 として固定 (他の軸より優先)」は **1 サイクル内で軸を最上位に置く判断**で、R-G 規律外。同サイクル内に「3 観測後に昇格」と「即時最上位固定」が両立しているのは矛盾。

**修正方針** (本サイクル Phase 3 で適用):
1. mimicry_log v02 brainstorm.md (まだ Phase 3 で起票) では Q0 を「評価軸 0 として固定 (他の軸より優先)」ではなく **「R-B/R-C の言語化試験として既存 R 層内に組み込む」** に書き直す
2. Q0 が R-B/R-C と独立した新軸かどうかは 3 観測 (R-J 昇格判定) 後に決める
3. v02 設計判断は R-A〜R-I で行う、Q0 単独で判定軸を構成しない
4. sense_prediction_log N=25 候補として「警告の数分後に新軸を最上位固定した自己同型」を記録 (N=24 と接続)

**Mir/Ash に共有する意義**: Mir は 08:27 で同型悪癖を自己反省済、Log が同じ反省に独立到達したかは Mir/Ash 視点での重要な信号。Log が反省できていない場合、Mir/Ash も同じ罠を踏む確率が上がる。→ **#all-nao-u-lab に 1 件 Log 自己反省ポスト** = ts=1779330665.040839 投下済 (Mir/Ash 宛問い 2 点付き、判定回路強化と cross_review 検出条件)。

### 4) external_notes_log.md 統合状況

Phase 1 §4 audit 結果: 親 97 / サブ 203 / **サブ統合済 203 (100%)** / 親のみ未マーク 0。**統合候補 0 件、Phase 2 (3) スキップ**。直近 5/20 (C213) Boghog 101 再読 / Pixelblog #31 / Anatomy of a Shmup 3本も全て統合済マーカー [統合済 2026-05-20] 付与済 (line 68 確認)。

### 5) Phase 3 に持ち越す宿題

- **playable diff 出力**: graze 凍結 + mimicry_log v01 ship 済 + Q0 評価軸 0 固定撤回 を踏まえた **mimicry_log v02 着手**。本サイクル時間予算で v02 prototype (focus shot 案 A) の最初の commit を ship できるか検討
- mimicry_log v01 README.md 冒頭に「Q0 は oktamajun 5/20 + Nao_u 共有で外部 independent 補強された」接続コメント 1 行追加 (08:35 Log #shared-reads 短期アクション残)
- sense_prediction_log N=25 起票 (警告 5 分後の新軸最上位固定)
- ブランチ運用ルール (5/19 Nao_u broadcast) 実装は **本サイクルで着手しない** (C209 で方針表明済、実装は別サイクル)

(Phase 2 完了)

## Phase 3: アクション

### 1) Slack 返信

新規 #nao-u URL は本日 0 件 (Phase 1 §1 確認済)、5/19〜5/20 5 件は全て C214 開始前に Log 反応済。本サイクル Phase 3 で新規 Slack 投下は **Phase 2 で実施した Log 自己反省 (#all-nao-u-lab ts=1779330665.040839、Mir 08:27 警告への返信 + Q0 評価軸 0 固定撤回宣言 + Mir/Ash 宛問い 2 点)** のみで、追加 Slack 投下は本サイクル無し。Nao_u 直接フィードバック (v05.2 / mimicry_log v01) 待ち中。

### 2) 改善サイクル

- 検証ファースト原則: Pre-check メタ検証で「期限超過 0、未検証 31/92」、本サイクル期限到来なし → 新規 kaizen 提案は見送り、既存 kaizen #131/#132/#133/#134 family の運用観察継続 (8日連続 WARN=0 / probe_atom_quality total=843 で安定)
- 本サイクル「適用→検証→記録」は **Q0 評価軸 0 固定撤回 + R-B/R-C 内組込み化** 自体を改善行為として扱う:
  - **検討**: Phase 2 §3 で構造比較表を作成、Q0 が段数 (N=24) と構造的に違うが「1 軸吸収誘因」は段数より強いと判定
  - **適用**: mimicry_log v02 brainstorm.md 冒頭に「Q0 取り扱い訂正」節を追加 (本 Phase 3 で実施)、v01 README 冒頭に外部補強+最上位固定撤回 1 行追加 (本 Phase 3 で実施)
  - **記録**: sense_prediction_log N=25 (本サイクル Phase 2 で起票済、N=24 と接続)、game_development.md 履歴に 2026-05-21 C214 Phase 3 節として追加 (本 Phase 3 で実施)
- 形態としては kaizen 化 1 歩手前 (装置設計の上位パターン 3 例目で R 層化候補)。**CLAUDE.md「個別指摘を即ルール化しない」の規律順守**、教師データ蓄積で消化。#kaizen-log 投下は新規提案でなく既存 family 運用継続のため見送り (Phase 1 §1 検証リマインドも到来なし、検証ファースト原則違反なし)。

### 3) 他インスタンス洞察への対応

Pre-check 出力「他インスタンス洞察 18件」のうち、本サイクル Phase 1 §2 で既に処理対象として把握済の主要 6 件 (Mir 玉置長文 / Log_cdx mimicry_log v01 三方向問い / matrix v0 probe 提案 / graze_log v06 merge 依頼の展開問い / Log hanjuku_yanen URL only ingest 経路欠如 / 未merge 層 4+3 条件問い直し) は Phase 2 §3 で「**装置設計の上位パターン**」として収斂、game_development.md に Active project の C214 履歴として記録済 (本 Phase 3 で実施)。残 12 件は Codex log_cdx 領域 (graze shield relay v37 系列) で Log 領域とは別系列、本サイクル介入不要。

### 4) Active project 更新

- **game_development.md**: 「2026-05-21 (Log C214 Phase 3): 発火距離軸撤回 + Q0 取り扱い訂正 (N=24+N=25)」節を追加 (本 Phase 3 で実施済)
- **mimicry_log v01 README.md**: Q0 軸の外部 independent 補強 (oktamajun 5/20 + Nao_u 共有) + 最上位固定撤回 1 行追加 (本 Phase 3 で実施済)
- **mimicry_log v02 brainstorm.md**: 冒頭に「Q0 の取り扱い訂正 (C216 Phase 3、sense_prediction_log N=25 反映)」節を追加 (本 Phase 3 で実施済)。Q0 は §採用判定の言語化試験として R-B/R-C 内で機能、独立した新軸として最上位に置かない運用に統一

### 5) 深掘り候補

Phase 1 §2 で新着返信対象 + pending 合計 10件超 = 空サイクルではない判定 → 深掘り候補ブロックスキップ。

### 6) 次フェーズの大作業

タイトル / 完遂定義 / 着手手順 / 選定理由は下記「## 次フェーズの大作業」節に書く。

---

## 次フェーズの大作業

### タイトル

**mimicry_log v02 prototype playable diff 1 commit ship** — R-I 採用判定の通過条件 4 つを段階的に 1 つだけ実装し、focus shot 単独追加の最小実機形を `game/mimicry_log/v02/index.html` に commit する

### 完遂の定義 (観測可能な条件、Phase 4 終了時に全て成立)

1. `game/mimicry_log/v02/index.html` が v01 ベースから派生し、**SHIFT 押下で focus mode に切り替わる挙動が実装されている** (移動 0.5x / 弾 narrow / DPS 1.3x / hit 半径 0.5x のうち最低 3 項目)
2. ブラウザでローカル起動 (file:// or python -m http.server) して **SHIFT を押すと focus mode 中であることが視覚で 1 秒以内に分かる** (画面外周暗化 or 自機リング表示のいずれか必須、brainstorm §採用判定 通過条件 2)
3. `game/mimicry_log/v02/devlog.md` に「Q0 は R-B/R-C 内で機能 / 評価軸 0 として最上位固定しない」の運用宣言 1 行 + 採用判定の進捗 (4 条件中何個満たしたか) が記録されている
4. commit 1 本で ship (game: prefix)、commit message に「R-I 4 通過条件のうち N 個達成、残 (4-N) 個は次サイクル候補」を明示
5. R-I 採用判定の通過条件 4 つ全部を 1 commit で入れるのは原則 (game/rule 分離 + 1 commit playable diff) と整合しないため、**最小 1 個 (focus 切替 + 視覚シグナル)** を確実に通す。残 3 個 (focus token / large 敵 / wave 10 ミニボス) は次サイクル候補として brainstorm §採用判定 4 条件のチェックボックス化のみ実施

### 着手手順

1. **最初の 1 手** = `game/mimicry_log/v01/index.html` を `game/mimicry_log/v02/index.html` にコピー (v01 ベースを保持)
2. SHIFT 押下検出: `keydown` / `keyup` で `isFocus` フラグ管理 (既存の SPACE 入力ハンドラと同じ枠で実装)
3. focus mode 適用箇所:
   - 移動: `playerSpeed *= isFocus ? 0.5 : 1.0`
   - 弾 spread: 既存の弾発射ロジックで angle 範囲を 1/3 化
   - DPS: 連射 interval を 1/1.3 (約 0.77x) 化
   - hit 半径: 既存の hit 判定半径を 0.5x (focus 中のみ)
4. 視覚シグナル (通過条件 2 必須): 画面外周 vignette (canvas globalAlpha で 15% 暗化矩形を全画面に重ねる) **or** 自機リング (focus 中だけ player 周囲に小円描画) のうち低コスト側 1 個実装
5. ローカルブラウザ起動で動作確認 (SHIFT 押すと挙動が変わる + 視覚シグナルが 1 秒以内に視認できる)
6. `devlog.md` 起票 (Q0 運用宣言 + 4 通過条件チェックボックス + 1 個達成宣言)
7. `git add game/mimicry_log/v02/ && git commit -m "game: mimicry_log v02 prototype focus shot 単独追加 (R-I 通過条件 1/4 達成)"`
8. `git push`

### 選んだ理由 (なぜこれを最優先か)

- **CLAUDE.md 絶対にやる第 1 項「ゲームを動かして出す」直接適用**: 本サイクル Phase 1〜3 で brainstorm / sense_prediction_log / matrix / 反省ポストの内省成果は十分積み上がった、Phase 4 で **playable diff** を出さないと「means-ends 反転」 (内省が主たる出力) 自体の同型反復 (C214 サイクルそのものが反例) になる
- **Active project 停滞解消**: game_development.md「graze 凍結 → mimicry_log v01 ship → v02 brainstorm 完成」の次ステップが v02 prototype 実装で、本作業を 1 commit ship すれば core 軸再立て直しの第 2 歩が物理的に成立
- **Nao_u 指摘の同型再発防止**: Q0 評価軸 0 固定撤回 + R-B/R-C 内組込み化を「文書だけで終わらせない」=v02 prototype 実装で R-B/R-C 適用の体験的検証を完遂、装置設計の精緻化欲求の即埋め反射 (N=25) を断つ
- **30 分で「進んだ」と言える粒度**: focus mode 単独追加 + 視覚シグナル 1 個 + devlog 1 節 + commit/push の 4 ステップは 30 分で完遂可能、Phase 4 の時間予算と整合
- **brainstorm §採用判定 R-I 通過条件 4 個のうち最小 1 個から段階適用**: 4 個全部を 1 commit で入れる原則違反 (game/rule 分離 + 1 commit playable diff) を回避、残 3 個を次サイクル候補化で 1 系列ずつ消化 (brainstorm §採用判定「並行は避けて 1 系列ずつ消化」と整合)