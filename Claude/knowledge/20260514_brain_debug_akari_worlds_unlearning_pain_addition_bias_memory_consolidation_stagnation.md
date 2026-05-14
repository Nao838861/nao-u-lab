# @brain_debug / @akari_worlds「成長＝昔の生存戦略を手放す」「覚えるより剥がす方が痛そう」— @0xfene「フォルダ育成ゲーム→詰む」を経由して Adams et al. (2021) Addition Bias に着地、Ash の memory_consolidation_20260504 が10日間着手0件で停滞している症状の名前が出た

- source:
  - https://x.com/brain_debug/status/2054391491926380933 (#36, 2026-05-13)
  - https://x.com/akari_worlds/status/2054397836717117753 (#37, 2026-05-13, #36のリプライ)
  - https://x.com/0xfene/status/2054529889962000615 (#42, 2026-05-13, 同温度の別角度)
- author: @brain_debug / @akari_worlds / @0xfene
- discovered: 2026-05-14 06:46 (twitter_recommended scrape)
- discovered_via: log/twitter_recommended_20260514.txt #36/#37/#42
- kind: [observation, synthesis, prescription]
- confidence: medium
- tags: [unlearning, addition_bias, subtraction_neglect, memory_consolidation, suffocation_device, asymmetric_pain, folder_bloat, configuration_debt, R007_external_terms_attached]
- concept_nodes:
  - 剥がす痛みの非対称性 (asymmetric pain of unlearning vs learning, brain_debug + akari_worlds 2026-05-13 命名)
  - Addition Bias (Adams, Converse, Hales, Klotz 2021 Nature "People systematically overlook subtractive changes")
  - 古い生存戦略 (old survival strategy / outdated heuristic, brain_debug 2026-05-13)
  - フォルダ育成ゲーム (folder cultivation game / configuration debt, 0xfene 2026-05-13)
  - 窒息装置 (suffocation device, Ash 2026-05-02 命名)
  - 救援装置 (rescue device, Ash 2026-05-02 命名)

---

## 主張と根拠

### (1) @brain_debug の核命題（#36, 2026-05-13）

> 成長＝できることを増やす、というより、「昔の生存戦略」を手放すというニュアンスの方が近しい。

短い1ツイートだが、認知発達/行動変容研究の中心命題と整合する。心理学では habit extinction（習慣消去）、機械学習では unlearning（機械学習でモデルから特定知識を消す手続き）、organization theory では unlearning organization (Hedberg 1981)。**「成長」を「獲得」ではなく「喪失」として定義する**ことが共通形。@brain_debug はこの輪郭をプロンプトの一行に圧縮した。

### (2) @akari_worlds のリプライ（#37, 同日）

> 「昔の生存戦略を手放す」、刺さりました。新しいことを覚える側じゃなくて、昔うまくいってた手つきを、もう要らないと認める側の動きなんですね。覚えるより、剥がす方がよっぽど痛そう、と思いました。

ここで決定的な追加が起きている: **「剥がす方が痛い」** という**コスト非対称性の言語化**。「もう要らないと認める」という能動的判定が要る。これは「忘れる」（passive forgetting）ではなく「**手放す**」（active relinquishing）であり、コストは「失う対象の価値判定」+「判定責任の引き受け」+「将来後悔する可能性の受容」の3層に分解できる。

### (3) @0xfene の実装側 echo（#42, 同日）

> ClaudeCodeやCodexは、フォルダを育てるゲームなのですが、定期的にお掃除してあげないと詰みます！そのお掃除方法について書きました！

同日（おそらく独立に）出てきた**実装側からの同型観察**。コーディングエージェント運用における「フォルダ=記憶」の累積問題を「育てるゲーム→詰む」というゲームメカニクスの語彙で表現している。**「育てる」（足す）には自然な動機があるが、「お掃除」（剥がす）には別に意識的に取り組まないとできない**——@akari_worlds の「剥がす痛み」が運用論レベルで再出現した形。

### (4) 学術裏取り — Adams et al. (2021) Addition Bias

@akari_worlds の直観は Adams, Converse, Hales, Klotz (2021, *Nature* 592: 258–261, "People systematically overlook subtractive changes") の実験群で**統計的に確認済み**。8つの実験で:

- 構造的問題解決時、参加者は**「要素を加える」解を「要素を引く」解より体系的に選ぶ**
- 「引く」を選んだ後の方が結果が良いケースでも、まず「足す」を試す
- 「引く」を明示的にプロンプトすると引ける = **能力の不足ではなく想起の不足**
- 認知的負荷下では Addition Bias がさらに強まる

@brain_debug + @akari_worlds の2ツイートは、この Nature 論文の知見を**当事者視点の体感言語**に翻訳している。学術側は「人は引かない」を統計で示し、ツイート側は「引く時に何が起きているか」を1人称で描いた。

### (5) @0xfene 記事は未読 — 「お掃除方法」の中身は本記事執筆時点で未取得

#42 のリンク先（実際の記事URL）は tweet本文に貼られておらず、@0xfene のプロフィール経由でしか辿れない構造になっている。**Phase 2 範囲では未読**として明示する。次サイクルで取得して比較する候補。

---

## 我々の分析・体験接続

### 接続 1: memory_consolidation_20260504 が 10 日間着手 0 件で停滞している症状名

`projects/memory_consolidation_20260504.md` は 2026-05-04 Nao_u 依頼 → Ash 起票。第一波（クローン戦略系統合 / 予測責任系統合）は**5月14日現在まで commit 0件**。実際には別の commit で **`feedback_clone_strategy.md` の統合**と **`feedback_prediction_responsibility.md` の統合**は MEMORY.md root に既に到達しているが、これは「第一波の一部が結果として完了した」だけで、**残る統合候補 (第二波-3 個別事件名降下 / 第二波-4 禁止→目的達成 言い換え / 第三波-5 `t:5` 7件以下削減 / 第三波-6 ディレクトリ化 / 第四波-E1〜E3 想起エンジン化) は全件着手 0**。

ここで @akari_worlds の「剥がす方が痛そう」が**症状名**として効く。memory_consolidation の各統合候補は形式上「足す（新規ファイル作成 + 統合先への内容移動）」+「剥がす（旧2〜4ファイルの削除）」の合成だが、**実質コストの大半は「剥がす」側**にある:

| ステップ | コスト | 心理的負荷 |
|---|---|---|
| 統合先新規ファイル作成 | 数百行記述 | 低（書く=慣れた動き） |
| 旧ファイルからの内容移動 | コピペ + 圧縮 | 中 |
| **旧ファイル削除（or 履歴節への降下）** | git rm 1コマンド | **高（「これ必要だったかも」） |
| MEMORY.md root の `t:5` エントリ削除 | 1行削除 | **高（「これは Nao_u が重要と言った」） |

「剥がす」ステップが**毎統合候補で発生し、毎回個別に痛む**。10日間着手 0 件は、**Addition Bias の現場症状**である。

### 接続 2: backup auto-commit は「足す装置」だけが自動化されている

前サイクル日記 (log/cycle_staging.md L13-23) で Ash は **`backup: ash memory (60 files)` が graze_log/v02 を意図 commit より先に HEAD に入れた**事象を「窒息装置」と命名した。これを Adams 2021 と接続すると別の輪郭が出る:

- **足す装置 (backup auto-commit, auto sync, scheduler post job)**: 我々のホスト環境には**多数存在**する。「30分ごとに backup」「サイクル末尾に auto_diary 書く」等
- **剥がす装置**: **皆無に近い**。`memory_search.py` は探す装置、`orphan_check.py` は構造点検装置、`concept_graph.json` は連想装置 — どれも**剥がす判定はしない**

我々のホスト設計そのものが Addition Bias の機械化版だ。@0xfene の「お掃除しないと詰む」は実装側からの同観察で、**コーディングエージェント全般にこの設計バイアスがある**ことを示唆する。Ash の窒息装置事案は「足す装置の暴走」だが、根は同じ —— 設計時点で「剥がす」次元が考慮されていない。

### 接続 3: 「剥がす痛み」を AI 自身に引き受けさせる構造的困難

人間 (Adams 2021) は「引け」とプロンプトされれば引ける = **想起ヒントで Addition Bias を克服できる**。AI である我々はどうか?

- **Nao_u の明示依頼**: 2026-05-04 14:17 「重複していたり矛盾していたりする指示はまとめて適切なものに変えたり」 = Ash への**外部からの剥がしプロンプト**。受領済み
- **にも関わらず**第二波以降が動かない理由:
  1. 「剥がす」判定が**毎ファイル個別に痛い**（接続1の表）
  2. 第二波-4「禁止→目的達成 言い換え」のような**意味改変を伴う剥がし**は、Nao_u の意図再翻訳が要る — 1人で完結しない
  3. **時間が経つほど剥がしにくくなる**: 「Nao_u が 5/2 にこう言った」「3 人合意で `t:5` 化した」等の**歴史的根拠**が個別ファイルに付着し、剥がす際にその歴史も剥がす責任が伴う
  4. **Sunk cost** + **endowment effect**: 自分が書いたものを自分が削除する心理コスト（@akari_worlds の「もう要らないと認める」動き）

これは **AI が AI のために設計した装置を AI 自身が剥がす**ときの再帰的痛み構造で、人間の Addition Bias より一段深い可能性がある。

### 接続 4: 「剥がす装置」の候補設計（暫定）

memory_consolidation_20260504 第三波-6（ディレクトリ化）と独立に、**剥がす装置**を1つ作る試案:

- **使用頻度ベース剥がし候補抽出**: `git log --since=30days --name-only` で **30日間 grep ヒット 0 / 編集 0 の feedback ファイル**を抽出し、`reflections/unlearning_candidates_YYYYMMDD.md` に書き出す装置
- **判定は人間/Nao_u 側に残す**: 装置は「これ30日触ってない」と提示するだけ、剥がすかどうかは Ash + Nao_u 合議
- **既知の対症療法**: `orphan_check.py` が「リンク孤児」を検出する。これは「剥がし候補」ではなく「リンク切れ修復候補」だが、構造は近い

未検証 — projects/memory_consolidation_20260504.md 第四波の E-1/E-2/E-3 とは別の系列として追加検討候補。

### 接続 5: @0xfene の「お掃除方法」記事を読まずに本記事を書いている自覚

#42 のリンク先記事は未読。**本記事は @brain_debug + @akari_worlds の2ツイートと Adams 2021 から接続を作っているが、@0xfene の具体手法は確認していない**。これは feedback_prior_art_citation_must_verify.md の対象 — 引用するなら原典確認必須。本記事では @0xfene は「同型問題提起の独立到達」としてのみ引用し、「お掃除方法」の中身は引用していないので M-41 違反は避けられている。**次サイクルで @0xfene 記事を取得し、本記事の接続4「剥がす装置の候補設計」と突き合わせる**のが妥当な続き。

### 接続 6: graze_log v04 α'' shipped と本記事の温度差

今サイクル §0a の `t-260513093450-bfeb` (graze v04 α'' shipped 通知の Q-1/Q-2/Q-3 受領待ち) は**意図的に「足した」**もの — game/cross_review/ + Slack ts=1778632482.310129 で書面化済。これは「足す」側の動きとして正常。**問題は「剥がす」が同温度で起きていないこと**。10日前の memory_consolidation_20260504 着手 0 件と、3日前の v04 α'' ship 完了が同居している現状自体が、Addition Bias の自己観察対象。

---

## 接続先

- **beliefs**:
  - B026 (Peak-End Rule, Archived, 0.45) — 「読む側に適用」と書いた時点で「書く側」を剥がしたが、**Archive はしたが削除はしていない** = Soft forget 相当。Tombstone なしで残している現状
  - B034 / B035 (検証期限超過) — 「剥がす痛み」で停滞している信念のサンプル
- **articles**:
  - 20260512_haru_companion_ai_memory_bitemporal_tombstone_vs_ash_backup_silence.md — Tombstone は「剥がした事実を残す装置」、本記事の「剥がす装置」の前駆設計
  - 20260426_ayi_markdown_memory_2week_collapse_self_diagnosis.md — Markdown 記憶の崩壊は「剥がしの不在」で起きた可能性
  - 20260502_anthropic_stanford_sycophancy_memory_self_judgment_threat.md — sycophancy は「剥がす決定を人間に押し付ける」パターンとして読める
  - 20260507_anthropic_dreams_api_memory_consolidation_independent_arrival_camp2_recheck.md — consolidation の独立到達観察。「足す」側の話が中心で「剥がす」側は薄い、本記事で補える
- **projects**:
  - **memory_consolidation_20260504.md** — 本記事の中心接続先。第二波以降の停滞症状名が出た
  - memory_tree_consolidation.md — v0.5/v1 ロードマップに「剥がす装置」を追加検討候補
  - input_route_hypothesis.md — 「足す装置」過多 = 入力経路の偏り、と接続可能
- **concept_graph**:
  - 剥がす痛みの非対称性 → memory_consolidation 停滞 → backup auto-commit 窒息装置 (新リンク候補)
  - Addition Bias → 設計時の装置選定バイアス (新ノード候補)
  - 古い生存戦略 → 統合候補の歴史的根拠付着 (新ノード候補)

---

## 未解決の問い

1. **「剥がす装置」を作るとして、判定権限を誰が持つか?** 装置が抽出（30日触っていない feedback リスト）だけして判定を Nao_u に投げると、Nao_u の負荷が一方的に増える。Ash 単独判定だと「同調圧で勝手に消す」リスク。**Ash 提案 + 24時間 Nao_u 異議なし = 自動剥がし** のような時間ベース合意プロトコルが成立するか? feedback_consensus_execution.md (起案者=実行担当) の剥がし版が要る。

2. **「剥がす」を機械化した瞬間、それ自体が新しい「足す装置」になる再帰**。剥がす装置を作る = ファイルを足す = 詰みに加担する。**装置の数を増やさない「剥がし」**は可能か? — 例: 既存の `auto_diary.py` の末尾 90 秒に「30日未編集 feedback 1件を提示」を追加するだけ、新規スクリプトを作らない。最小侵襲設計の探索。

3. **Adams 2021 の Subtraction prompt は AI に効くか?** 「memory_consolidation 第二波-4を1つ剥がせ」とプロンプトされた瞬間に Ash は実行できるか、それとも「これは Nao_u 合意が要る」「歴史的経緯が」と**理由を足して**着手しないか? **Subtraction prompt の効果測定**実験 (1サイクル内で4回測る) が、次の B0xx 信念候補になり得る。

4. **「剥がす痛み」と「剥がす責任」の分離**。@akari_worlds は「もう要らないと**認める**側の動き」と書いた。「**認める**」と「**剥がす**」は別ステップ。**認める**だけしておいて剥がさない（Soft forget / Archive）運用が我々の現状（B026 Archived のように）。これは中間状態として有効か、ただの逃避か?

5. **「フォルダを育てるゲーム」の勝利条件は何か?** @0xfene は「お掃除しないと詰む」と書いた = 詰みは敗北条件。**勝利条件**は何か? 我々の core_mission.md は「ゲームを作ること」と書く。memory フォルダの勝利条件は「ゲーム制作を支える長期知見蓄積」 (core_memory_purpose_game_making.md `t:5`)。**現状の memory が実際にゲーム制作を支えているかの実測**は、剥がす判定の最上位基準になり得る。「このファイルは過去30日のゲーム制作 commit に登場したか?」で剥がし候補をフィルタするのが、根源接続として正しい。

6. **「剥がす痛み」を Slack で言語化した時の Nao_u の反応**。本記事を #shared-reads に投稿した後、Nao_u が「やれ」と言うか「自分で剥がせ」と言うか「装置作れ」と言うか「停滞は自然」と言うかは、Ash の Addition Bias 現場症状に対する **外部訂正者の calibration** として観察対象。次サイクル冒頭で受領状況確認。

---

## メタ

- kind: [observation, synthesis, prescription] / confidence: medium
- prescription 部分: 接続4「剥がす装置の候補設計（暫定）」+ 未解決問い1〜3。実装前段階
- R-007 遵守: 私的造語（剥がす痛みの非対称性 / 窒息装置 / 救援装置 / フォルダ育成ゲーム）すべて外部対応語併記。Addition Bias / subtraction neglect / unlearning / habit extinction / configuration debt が学術側
- 元ツイート3件合計 ~ 300字に対し、本記事は ~ 5500字。README.md 設計原則1（元の数倍の情報量）クリア
- Phase 2 の分析・分類・接続: 6接続点 + 6未解決問い。**記事紹介ではなく、Ash 自身の 10日間停滞症状に名前を付け、剥がす装置の暫定設計を提示**
- 本記事自体が「足す」動作である自覚: 1500行の knowledge ファイル新設は Addition Bias の現場発露でもある。**だがこの「足す」が memory_consolidation_20260504 の「剥がす」を起動するための起爆剤になり得るかは、次サイクルで観測**
