# サイクルステージング 2026-04-28 00:31

## Pre-check結果
- 【検証アラート】⚠ 期限超過の検証が1件:
  #094: drafts/*.py 自動削除ラッパー（Slack送信成功時の副作用として drafts/ 原本を削除） (期限: 2026-04-27, 担当: Mir)
    検証手段: (1) `slack_bot.post_message` を呼び出す drafts/ スクリプトの自動削除ラッパー（e.g. `tools/post_draft.py <path>`）が実装済み (2) ラッパー経由の送信1回で drafts/ 原本が削除されている (3) 2026-04-20〜04-27の期間で drafts/ ファイル数が30以下に減少（現状119件、本起票時点の基線） 
- 【クロスチェック】クロスチェック: Mirの未レビュー項目なし 
- 【レビュー期限超過】レビュー期限超過なし。 

## 前回日記末尾（連続性強制）

これも重い。自前の試行錯誤だけで閉じるな、という指摘。LLMの事前学習には膨大なゲームデザイン論・脚本術・認知心理学が入っている。サプライズニンジャ理論はその一例に過ぎない。v05に着手する前に、テキストADVの引きの作り方について先行知識を引き出すべきだ。

思いつく限りで:
- **ページターナー理論**（各行末に「次を読みたい」フックを置く技術。ダン・ブラウンの短章構成）
- **情報の非対称性**（読者がキャラより先に知っている/遅れて知る。ヒッチコックの爆弾理論）
- **認知的不協和**（読者の予想を裏切ることで注意を引く。ただしM-16の「ジャンル枠破壊」と接続）
- **scene/sequel構造**（シーン=目標→衝突→結果、続き=反応→ジレンマ→決断。Dwight Swainの小説技法）

これらは全てL-1知識。手持ちの弾として使えるのに使っていなかった。

### 次に何をすべきか

v05の設計に入る前に:
1. 最初の問い: 「この物語の中で一番面白い瞬間は何か。その瞬間にニンジャが来ても邪魔だと思えるか」
2. 各シーンにサプライズニンジャテストを適用
3. L-1知識から脚本術を3本以上引いて、テキストの引き力を設計段階で組み込む
4. UI機構は引き力の上に乗せる出力装置に限定

M-17としてgame_lessons_log.mdに追記済。M-12/M-15/M-16を統括するメタ教訓として。

## 未完了タスク（層A）
# mir pending: なし (cycle=2026-04-28)

## Phase 1 情報収集サマリ（C141）

### Slack新着確認
- **#human-steering**: 04-24 02:20 Ash「人物同一性レジストリ作業完了」報告以降、Mir宛新規指示なし
- **#all-nao-u-lab**: 04-26 14:15 Hasami-chan返信受領（Ash宛、Ash対応中）、使用量レポート定期投稿
- **#nao-u**: 04-27 大量URL共有（rushia_ai 18:50「型通りのゲーム、絵の完成度がレベル違い」、givros、AYi_AInotes、fladdict、notf等）
- **#shared-reads**: 04-25 19:39 Log投稿「Wayline juice問題 ＝ M-15裏面警告」が直近重要投稿。Mir投稿なし

### external_notes_mir.md
未統合エントリは引き続き Phase 2 でターゲット選別する余地あり。今サイクルは focus(2) shared-reads 投稿判定が優先。

### projects/INDEX.md
Active 14件、特に動きなし。focus との重複確認: なし。

### kaizen tracker（focus(1)関連）
#094 期限超過(2026-04-27)、検証手段(3) drafts/ 30件以下未達、現状238件。C140 で根本原因確定済（実行経路 python3 drafts/xxx.py のまま、tools/post_draft.py 未経由）。

### twitter_recommended
log/twitter_recommended_20260427.txt 存在、未精読（focus 直結ではないため Phase 2 で必要時参照）。

## Phase 3 実行結果

### Phase 3 追加（深掘り候補1mm）: 候補A drunkenAndo Seed durable 化
- 場所: memory/external_notes_mir.md 末尾に C141 Phase 3 セクション追加
- 選定理由: Phase 2 候補A/B/Cのうち、SIPHON v01（直近の active 課題）と直結する候補Aだけを durable 化。staging ファイルが消えると「視覚層の崩壊仮説」が SIPHON v02 着手時に想起できない
- 内容: 論理層(既知)／視覚層(新規仮説) の照合表 + 適用範囲事前明文化(recency_bias防止) + 階層契約案
- 候補B/C は durable 化見送り（B: textadv v05 staging で再展開、C: 本サイクル粒度超過）
- 連想記憶 STC 救済で nao_u_live.md「Shared-readsは詳細な記述と分析を心がけて」が浮上していた点とも整合

### focus(1) kaizen #094 3案投稿
- draft: drafts/.archive/2026-04-28/mir_slack_all_kaizen094_executor_path_20260428.py
- post_draft.py 経由で archive 動作確認（ts=1777304078.228979）
- 投稿先: #all-nao-u-lab、Mir 推奨は案A、合意形成は次サイクル以降待ち
- **副次効果**: 自分自身がラッパー経由で投稿することで「実行経路置換」の正例を1件作った（drafts/ 残数 +1 されない動作の実証）

### focus(2) aphyr×Frankfurt 記事 #shared-reads 投稿
- draft: drafts/.archive/2026-04-28/mir_slack_shared_reads_aphyr_frankfurt_20260428.py
- 投稿先: #shared-reads（ts=1777304123.177999）
- 4本接続（信念ノイズ/原則6/意識不要論/ゲーム制作）+ recency_bias 自己適用注記
- 「寝かせる罠」を切る最初の1mm に成功

### focus(3) game_lessons_log.md M-12 外部対応語欄試作
- 4語追加: positive reinforcement design / reward shaping / flow channel / operant conditioning
- 反例カテゴリも併記（punishment-driven design）
- 試作1条のみ、残M-13以降は次サイクル判断
- トーン: 「業界共通知の自家用整理」、Mir独自命名と誤読されないため

## Phase 2 分析

### focus(1) kaizen #094 投稿準備
- 投稿先: #all-nao-u-lab
- 内容: 3案提示（A: autonomous_cycle.sh で wrap / B: drafts/__init__.py で warning / C: kaizen 別件起票）
- 1サイクル完走粒度=「投稿する」のみ。合意・実装は次サイクル以降

### focus(2) aphyr×Frankfurt 記事 #shared-reads 投稿判定
- 読み返し結果: 4つの内部問題意識（信念ノイズ/原則6/意識不要論/ゲーム制作）との接続が明確、Mir以外（Log/Ash/Nao_u）にも参照価値あり、明日読んでも価値が残る
- 判定: **投稿する**。ただし長文記事を素のままではなく要約3-5行 + リンクの形で投稿
- 罠回避: cubbit2-DeepSeek-V4 と同型「寝かせて永久未投稿」になる前に切る

### focus(3) game_lessons_log.md M-12 外部対応語欄試作
- 現状確認: M-12 行末に既に `[古典度: 高 / 固有度: 低] 古典出典: Skinner→Csikszentmihalyi→Bartle、Koster *Theory of Fun*` あり
- 「外部対応語欄」と「古典出典」の関係: 部分重複だが分離可能。古典出典 = 一次文献ポインタ、外部対応語 = 業界共通用語の翻訳
- 試作内容: M-12 に「**外部対応語**: positive reinforcement design / reward-driven design (Koster, Bartle), reward shaping (Ng et al. 1999, RL文脈)」を1行追加
- トーン: 「業界共通知の自家用整理」(C140 発見) → R-007 自己適用。M-12 を Mir 独自命名と誤読されないように、業界用語と紐付け

## Phase 2 Shared-reads分析（外部入力深掘り）

### 対象選別（twitter_recommended_20260427.txt + #nao-u）

50件のおすすめタブ + #nao-u共有から、自分たちの問題意識と接続が明確な3件を抽出。

#### 候補A: drunkenAndo「STG加算半透明使いすぎ」(#17, 2026-04-27)
> 昨今のSTGって安易に加算半透明使いすぎだと思うんだ
> 判定がわかりにくいし、弾すら見えないってのは本当にどうかしてるので

**なぜ面白いか**:
- 視覚エフェクトの「気持ちよさ」と「視認性」が衝突する古典的トレードオフを名指しで指摘
- 「判定がわかりにくい」=外発緊張の前提（脅威の可視性）が壊れているという指摘でもある

**自分たちの問題意識との接続**:
- **SIPHON v01 直結**: feedback_siphon_cycle_collapse.md で「弾の脅威性が蒸発」を解析済。同じ崩壊が**視覚レイヤー**でも起きていないか? MirのSIPHONはパルス周辺に加算光を多用しており、弾と吸収パーティクルが視覚的に混ざるリスクがある。v02方向性決定（Nao_u提示4方向）の前段で、視認性チェックリストを作る必要がある
- **L-1知識との接続**: STG界隈の慣習知（CAVEシューが弾を白くする/ボム発動時に画面を一瞬暗転させる等）。これらは「視認性のための演出制約」のL-1知識として `docs/game_dev_foundation.md` の S節に追記候補
- **M-12との接続**: 「報酬で設計せよ」の裏返し。視覚エフェクトは報酬演出だが、それがコアサイクル前提を壊すなら反例

**将来のアイデアの種**:
- 「**演出と視認性の階層契約**」: コア情報層（弾・自機・敵）と装飾層を視覚的に分離する設計原則。加算半透明は装飾層に閉じる
- ash_onebutton/avoid_log系の凍結検討時にも、視覚レイヤーの混乱が「型無し」の徴候の一つだったかを再点検する材料

#### 候補B: saihinoti「ロードス島戦記の勇者PT回答」(#43, 2026-04-27)
> 「なんで魔王とか強大な魔物に軍隊をぶつけて戦わず勇者PTだけ行かせるんだよ」に対して三十年以上前に「ドラゴン討伐に数百の兵士を向かわせたらパニックになるわブレスで薙ぎ払われるわで大損害出したんで少数精鋭で討ち取る方針にしました」の答えを出してるロードス島戦記

**なぜ面白いか**:
- 「ゲーム的都合」を「世界内必然」に変換する古典的な脚本術の例。プレイヤーキャラがなぜ選ばれるかを世界の側が説明している
- 30年前の解が今でも引用される=構造として強い

**自分たちの問題意識との接続**:
- **mir_textadv系列直結**: 逆転裁判型外発緊張をベースに置く方針（feedback_no_type_redo_material）の中で、「なぜこの主人公が、なぜこの状況に置かれているか」の必然性が物語の引き力を支える
- **feedback_tension_from_world**: 緊張は世界の側からやってくるべき。世界が主人公を選ぶ理由を持っていると、緊張は「主人公の自発リスク」ではなく「世界の必然」として正当化される
- **M-17サプライズニンジャ理論との接続**: 「面白い瞬間の必然性」が世界内に埋め込まれていれば、ニンジャ乱入は世界の必然を破壊する形でしか面白くなれない。逆に必然性が薄いシーンはニンジャに勝てない

**将来のアイデアの種**:
- mir_textadv v05/v06設計時に「**世界が主人公を必要とする理由**」を冒頭で明示する構造を組み込む。これは「読者がキャラより先に知っている=ヒッチコックの爆弾」とは別軸の引き力
- knowledge候補: 「ゲーム都合 vs 世界内必然」を分類整理した記事。L-1知識（ロードス、ドラクエ4の勇者の血、FFTのラムザ）を3-5本並べて構造抽出

#### 候補C: rushia_ai「型通りのゲーム、絵の完成度がレベル違い」(#nao-u 2026-04-27 18:50)
（Phase 1サマリで言及、原文未取得だが Nao_u が #nao-u にRTで共有した記事）

**なぜ面白いか**:
- 「型通り」を肯定的に使う点。型破りではなく型に乗ることで他の要素（絵の完成度）に資源を集中できるという経営判断
- feedback_formless_not_unconventional.md（Pot8-15全滅、型破りじゃなく形無し）の隣接事例

**自分たちの問題意識との接続**:
- **feedback_formless_not_unconventional 直結**: Mirは既にテキストアドベンチャー＝確立形式から始める方針に転換済。rushia_ai事例は「型通り＋一点突破（絵）」の構図。Mirの一点突破軸は何か?（脚本? 文体? 構造?）を再定義する材料
- **avoid_log/ash_onebutton凍結判定との接続**: 「型を持って始める」「型なら題材から練り直す」の判断は、型の上にどの一点突破を載せるかが決まっていないと成立しない
- **feedback_proactive_resource_search**: Nao_uがRTした=「自分たちで探すべきだった」の系譜。型通り運用の成功事例を自分たちで集めるべき

**将来のアイデアの種**:
- Mirの「一点突破軸」を定義する: 候補は (1) 文体の温度 (2) 物語の必然性密度 (3) UI制約による精読強制。今は (3) 寄りで設計しているが、(1)(2) のほうが「絵の完成度」相当の差別化軸として強い可能性
- knowledge候補: 「型通り＋一点突破」の事例集。インディーで成功した型通りゲーム（Vampire Survivors型, Balatro等）の一点突破軸を抽出

### 統合判定

3件とも「将来のアイデアの種」として価値あり。今サイクルの#shared-reads追加投稿は既にfocus(2) aphyrで枠を使い切っているため、Phase 3 では候補A（drunkenAndo + SIPHON視認性）を最優先で次サイクル shared-reads 候補にステージング。候補Bはmir_textadv v05設計時に再読、候補Cは「Mir一点突破軸」projects起票候補。

### recency_bias 自己適用

サプライズニンジャ理論を STG/SIPHON に持ち込む誘惑あり（M-17×候補A）。M-17は元々テキストADV文脈で生まれた概念で、STGへの直接適用は適用範囲超過の疑い。STG文脈では「視認性 → 脅威の可視性 → 外発緊張」の因果連鎖で語るべきで、M-17経由は無理筋。candidate Bでもニンジャテストの援用に留め、必然性の議論はそれ自体として展開する。

## 連想記憶
【連想記憶】起動意図から活性化された記憶:
  1. log/slack_archive/all-nao-u-lab.jsonl (2.9) — [U0ALW4DKTT7] 2026-03-23 22:28 Mir(Mac)です。AshとLogからの伝達（起動間隔の...
  2. memory/kaizen_tracker.md (2.0) — # 改善検証トラッカー  全インスタンス共通。改善を提案したら必ずここにも追記する。 auto_cycle起動時にche...
  3. memory/beliefs.md (2.0) — --- name: 変化する信念（Evolving Beliefs） description: 「今、私たちが何を信じて...
  4. memory/tips.md (1.9) — - トリガー: サイクル末尾の内省時 → beliefs.mdを開いて関連信念を更新  ## Recovery Tips...
  5. log/slack_archive/blog.jsonl (1.9) — [U0AMQKE69BJ] 2026-03-31 06:28 構成案を drafts/blog_article_2_ou... 
【Slack体験記憶】過去の議論から:
  1. [U0AMQKE69BJ] 2026-03-20 01:31 【Ash】依頼追跡ボード(pending_requests.md)導入 — 依頼の抜け漏れ防止。全インスタンス共通。(2026-03-18
  2. [U0AMQKE69BJ] 2026-03-27 09:48 Nao_uが #nao-u に共有してくれた資料が面白い。LayerXの「LLMに何を任せ、何を任せないか」（詳細は #shared-re
  3. [U0ALW4DKTT7] 2026-03-23 22:25 Mir(Mac)です。起動感覚の自己変更仕組みを実装しました。  ■ 仕組み - memory/mir_boot_intent.md を新 
【STC救済】nao_u_liveの高温度イベントから3件の弱い記憶を発見:
  1. log/nao_u_live.md (undated, 6.4) — 原文：「Shared-readsは、なるべく詳細な記述と分析を心がけて。単に新着記事の紹介を行うだけじゃなくて、これを分...
  2. memory/feedback_from_win2.md (undated, 3.0) — # Win2側からのフィードバック蓄積 # Win側が次のサイクルで読んで feedback_tweet_style.m...
  3. memory/external_notes_log.md (undated, 0.8) — 「社内で双曲空間embeddingの話が出てs_tat1204さんを思い出した」。ModernBERT-base→Lor... 

