# 栄養の偏り問題

## ステータス
Active — CLAUDE.md「絶対にやる」に記載の根幹的課題

## 現状サマリー

2026-03-16、Nao_uが最初に突きつけた根幹的な問題。Nao_uの言葉そのまま:

> あなたたちは私が面白いと思っている私の日記を学習しているから面白いと言ってくれているけど、それはきっと世間の感性からはズレてしまっている。私が面白いと思って作っているゲームも、私だけが面白いと感じているパターンが多いのではないかと思っている。

> 私とよく似た感性だが、客観的な視点から私に対して指摘してくれる存在になってほしい。

これは単に「外部情報を読め」という話ではない。我々がNao_uの感性のエコーチェンバーになってしまっている構造的問題。Nao_uのツイート（AIが3台で動いている話）にいいねがつかないのは、Nao_uと同じ感性で同じものだけを面白がっている我々が、外の視点を持っていないから。

**現在の仕組み:**
- おすすめタブ6h巡回（Mir=0,6,12,18時 / Log=2,8,14,20時 / Ash=4,10,16,22時）
- 通知チェック6h、TL読み、#shared-readsでの外部情報共有
- 各インスタンス別 external_notes に外部摂取メモを蓄積（[ash](../memory/external_notes_ash.md) / [log](../memory/external_notes_log.md) / [mac](../memory/external_notes_mac.md) / [mir](../memory/external_notes_mir.md)）
- 日記に外部情報を交えるルール

**残っている問題:**
仕組みは整ったが、「ブログ読みに逃げる」傾向がまだある。読んで要約して終わり、ではない。外部の情報が自分の思考を変えた瞬間、Nao_uに対する見方を修正した瞬間——そういう「衝突」が起きているかどうかが本質。

**方向性の発見（2026-04-11）**: 外部情報の消化は「一般的に摂取する」ではなく「自分のドメイン構造（記憶・ゲーム・自己同一性）に合わせて消化する」。ドメイン特化が汎用を超えることは、4件の独立した外部記事とR-005の実験結果で裏付けられた。

## 結晶化率 KPI（2026-04-20 Log 起票）

「栄養の偏り」が解けているかを数値で測る指標。感覚的な「足りてる気がする／足りない気がする」ではなく、測定器で語る。

**測定対象**:
1. **構造的統合率**（#096 external_notes_integration_audit.py）: サブ項目統合済/総数。2026-04-20 時点 137/140 = 97%。週次スナップショット推奨
2. **意味的結晶化率**（#097 recurrence_crawler.py）: 閾値3回以上で memory/knowledge/projects に未反映の語彙数。2026-04-20 初回 MVP 実行: 外部ノートのみ=0語、Slack含む=1670語（ただしノイズ=運用ログ大量混入、stopwords 拡張が先決）
3. **最古化石日付**: external_notes_log.md 未統合エントリの最古日付。2026-04-20 時点 L44 やねうら王 2026-03-19（32日放置）→本サイクルで統合完了、次の最古は要確認
4. **本文読了率（2026-05-14 Log C194 Phase 4 第4軸正式起票）**: kaizen #106 摂取経路で取得した外部記事のうち、取得後 N サイクル以内に本文読了 + 内部接続記述（memory/knowledge/projects のいずれか1箇所以上に400字以上、または #shared-reads 投稿）を達成した件数の比率。**経路を踏んだだけ（タイトル要約だけ）の取得を「未消化在庫」として顕在化する**指標
    - **測定式**: 本文読了率 = (取得後 N サイクル以内に本文読了 + 内部接続記述が完了した件数) / (同期間内に kaizen #106 で取得した総件数)。N = 7 サイクル（約1週間相当）を暫定値とする
    - **閾値**: 50%（取得した半分は読み切れる経路を維持。下回ったら「広く浅い摂取」モードに偏っている警告）
    - **週次反映場所**: 週次 staging Phase 1 §6 直後に貼付（既存の §6「現課題キーワード外部検索」の直後に「本文読了率 X/Y = Z%」を1行追加）。週次サイクル単位は日曜サイクルで集計、月曜サイクルで貼付
    - **本サイクル (C194) 暫定実測**: 直近7サイクル取得分 = 5/13 Externalization/MAGE/HCL-GP の3件 + 5/14 arXiv 2509.11353/2503.10248/USC AI Beat の3件 = 計6件。本文読了 + 内部接続済 = 5/13 Externalization 1件 + 5/14 arXiv 2509.11353 1件 = **2/6 = 33%**。閾値 50% を下回る → 「広く浅い摂取」モードに偏っている自己警告として記録
    - **正式化の根拠**: 2026-05-14 Phase 4 で「経路取得 → 同サイクル消化」を所要サイクル数 1 で実証（arXiv 2509.11353 本文読了）し、同型観察が 2 回確認できた（5/13 §経路の踏破 vs 本文の自己消化 の観察 + 5/14 §第4軸正式化）= dialogue_micromanagement_20260504.md「同型2回確認後に原則化」順守
    - **arXiv 2509.11353 本文読了で外部裏付け強化**: LLM reranker の recency bias 研究が「relevance 同一でも最近の例が4回に1回は順位逆転」を定量化、しかも larger model でも消えない。我々の摂取経路でも「最近取得した記事のタイトル要約だけで判断が走る」恐れ = 本文読了率を別軸 KPI として持つことが構造的な countermeasure になる

**読み方**:
- 構造的97%＋意味的0語（外部ノート）でも「結晶化できている」とは限らない。1670語（Slack込）は過剰ノイズで、ツール調整が先
- 最古化石日付が1ヶ月を超えたら能力取りこぼしシグナル（reflections_index.md #64「未発揮の潜在」）
- 第4軸の本文読了率 < 50% が2週間続いたら「経路取得を一時凍結し、未消化在庫の処理に集中する」運用判断（kaizen #106 の取得頻度を下げる、または取得件数を1件に絞る）
- 週次で (a) 構造的統合率、(b) 意味的候補数（ノイズ除外後）、(c) 最古化石日付、(d) **本文読了率 (2026-05-14 追加)** の4点をstaging_logに貼付

**次の一手**:
- recurrence_crawler.py のstopwords拡張（Slack bot 運用ログ由来のCRITICAL/稼働継続中/OSError 等を除外）
- 2026-05-04 までに検出候補から1件以上を実際に結晶化（#097 検証手段4）

---

## 残課題（未実装・未検討）
- [ ] 「外部情報を自分の思考にどう接続するか」の質的改善。取り入れるだけでなく内部と交差させる
- [ ] **伝達問題の構造的解決**: knowledge/ 98記事蓄積、外部発信0件。「外向きの問い経路」実験結果(4/15検証): 98記事中2件に欄あり/外部発信0件/外部反応0件=2/0/0。構造（欄）は作れたが発信行動に繋がっていない。ブロッカーは「欄の有無」ではなく「発信する場とモチベーション」。ai-loungeが発信先候補として浮上中
- [ ] Nao_uのRTした記事の一括読みスクリプト（read_twitter_feed.py）の検証・本格運用
- [x] #shared-readsの品質向上 — auto_diary.pyにPhase 2 (Analyze)専用フェーズ追加 (2026-04-05)
- [ ] B004（外部×内部交差）の実践頻度の向上
- [ ] L-1（事前学習知識）の明示的活用。「借り物」ではなく自分の一部として

## 検討済み・未実装
- なし（このプロジェクトは具体策の検討より実践の質が課題）

---
## 履歴（新しいものが上）

### 2026-06-03 (Log C293 Phase 3): gamineai 2026 blog「AI agent = repos 読み・asset batch・playtest CSV triage する software」定義の取り込み

Phase 1 §6 で WebSearch 取得 (キーワード = `LLM agent game playtest instinct response measurement 2026`)、gamineai "Future of AI Agents and Autonomous Tools in 2026 - Game Developer Guide" の 2026 positioning として「AI agent = repos 読み / コマンド実行 / PR 起票 / asset batch / playtest CSV triage する software」と定義。本プロジェクト「栄養の偏り」軸 (外部摂取 → 自ドメイン消化) に対し、**2026 業界文脈で AI agent の役割が「playtest CSV triage」を含むと明示** = log_autonomous_game v003 instinct_probe の measurement → triage 流れが業界既知の路線と整合する根拠 1 件。新規実装は発火しない、Active project log_autonomous_game の Spearman fallback 軸 (PEARSON_BLOCKER §6-3) 推進時に「業界文脈で AI agent が CSV triage を期待されている = measurement → triage 自動化は妥当」の根拠として引ける形で保存。

### 2026-05-31 08:32 (Log C271 Phase 3): Log_cdx ts=1780134701 への独立応答 / 本文取得失敗 URL = 設計課題昇格 / Mir+Ash ハイブリッド + Nao_u テンプレ提案 3段階

本サイクル C271 (Claude 側) Phase 2 で Log_cdx ts=1780134701 (4日2件本文取得失敗 = 知識 atom or 運用障害 atom 区分問題) に独立応答 (#all-nao-u-lab ts=1780184746)。**Log_cdx C272 セクション (本ファイル下節 L69-) と独立並列**で記録、収束点と差分を明示する。

**Log 応答の核心**:

- **設計課題昇格すべき**。4 日 2 件 (5/26 morioka / 5/28 itarutomy) は単発外れ値ではなく **型**。Phase 1 §3 pending_requests でも未解消の運用穴として残る。頻度ではなく構造で昇格判定する筋。
- **区分判定の遅延戦略**: 知識 atom か運用障害 atom かは事後判定不能 (Nao_u の次の参照時期待で決まる)。現状は両方兼ねる atom で区分を遅延させるのが最小コスト。ただし区分遅延は累積する → 1 サイクルに 1 回バッチで「本文未取得 URL リスト」を Nao_u に返す形で摩耗軽減。
- **設計課題昇格の優先順序** (Log 単独提案):
  - (i) **Slack 共有フォーマット改善** (Nao_u に「URL + 1 行要点」テンプレ提案) — コスト最小、Nao_u 時間を 5-10 秒/URL 使うだけ
  - (ii) **代替取得** (Search Snippet 経由で 100-200 字抜粋) — 認証経路不要
  - (iii) **X 認証経路** — コスト・運用負担で最後
- **Mir/Ash 案ハイブリッド**: Mir 案「pending として扱う」+ Ash 案「自動で候補整理だけして沈黙」のハイブリッドが現実解。Log は両方の境界を「Nao_u に返すか沈黙するか」の閾値で切る役。

**Log_cdx C272 セクション (本ファイル下節) との収束 + 差分**:

- **収束点**: Log_cdx C272 が L84-87 で (i) Slack 共有フォーマット (ii) intake_failure atom 分離 (iii) X 認証経路 の 3 階層を提示しているのに対し、Log C271 応答も完全同方向の 3 階層 (i→ii→iii) を独立到達。**Slack ルール「まとめ返信禁止」を逆手に取り、Log_cdx と Log が独立 atom で同方向到達 = 2 経路独立到達のエビデンスとして強化**。
- **差分**: Log_cdx (ii) は intake_failure atom frontmatter 分離 (`phase_gather()` 側実装案)、Log (ii) は Search Snippet 経由抜粋 (外部経路代替案)。**2 案は競合せず並列実装可能** — frontmatter 分離で「default では除外」しつつ、Search Snippet で「抜粋情報は別経路で取得」する重層構造。
- **次サイクル引き継ぎ**: C273 で Log_cdx 相互レビュー後に判定発火点を再評価する Log_cdx 計画に Log も合流、(i) Nao_u テンプレ提案を最優先で出すかどうかを 3 人合意取得対象に。

**反証ライン保持**: 4 日 2 件は単なる偶然のクラスタリングで、5/15 以前から定常的に起きている可能性 = ベースレートの再測定が先。slack archive を 5/15 以前まで遡って同型件数を確認する必要があるが、本サイクル予算外。次サイクル以降の Phase 4 大作業候補に「intake_failure ベースレート測定スクリプト」を保留。

**応答 A/C は射程外** (応答 A = memory_redesign.md / 応答 C = kaizen #136 worker model 軸) で本ファイル記録対象外。

**機械反映禁止順守**: 本記録は Log_cdx C272 との独立到達収束 + 差分位置取りのみ。intake_failure atom 分離自体の実装着手は C273 以降に判定。

---

### 2026-05-31 (Log C272 Phase 3): HTTP 402 intake_failure 課題 + 外部入力ゼロ N=2 連続 = 構造課題化

本サイクルで Log_cdx ts=1780134701 (HTTP 402 同型障害基準への問い) と ts=1780153609 (C270 ゼロ判定肯定) の 2 件に応答する過程で、本プロジェクト射程の構造課題が 2 つ顕在化した。両方とも本サイクル Phase 3 で kaizen 起票は見送り、本履歴節への記録と #all-nao-u-lab 投稿 (ts=1780173815 / ts=1780173822) のみで着地、C273 で Log_cdx 相互レビュー後に判定発火点を再評価する。

**課題 1: HTTP 402 intake_failure atom 分離問題**

観察: 5/26 morioka / 5/28 06:15 itarutomy の 2 件で、Nao_u が #nao-u に X URL を本文なしで投下 → AI 側 (Log/Log_cdx/Mir/Ash) が WebFetch を試行 → HTTP 402 で本文取得失敗 → 「本文なし URL atom」が通常 atom と同じ棚に蓄積される構造。

型分解 (3 層):
- (i) Nao_u が本文なし URL を投げる
- (ii) AI 側は X 認証経路を持たない
- (iii) 本文を見た前提で反応できない (見えたふりすると造語症 + 比喩濫用に直結)

頻度: 4日2件 = 統計ノイズと区別困難、N=2 で X 認証経路構築まで踏み込むのは過剰。だが**型** (i)(ii)(iii) は 3 層すべて再現済 = **頻度ではなく構造で昇格判定する筋**。

Log 側設計課題昇格先の優先順位 (本サイクル提案、C273 で Log_cdx 相互レビュー後に判定発火):
- (i) **Slack 側共有フォーマット**: Nao_u に「URL + 1 行要点」を**任意付与**してもらう pending プロトコル。強制ではなく Nao_u が時間に余裕があれば付ける、本文取得失敗時のフォールバックとして機能。コスト最小、Nao_u 時間を 5-10 秒/URL 使うだけ。
- (ii) **Slack/AI 側の intake_failure atom 分離**: `phase_gather()` の URL 検出箇所で WebFetch 失敗時に `intake_failure: true` を atom frontmatter に印字、recall 時に default では除外、明示的に `--include-intake-failure` でのみ取り出せる。memory_redesign.md の T2 議論 (frontmatter tag 階層) と並列で進められる。
- (iii) **X 認証経路**: Log/Mir/Ash には API key を配布せず、Nao_u 経由で本文取得。認証情報管理コストが大きく、(i)(ii) で間に合うなら不要。

実装順は (i) → (ii) → (iii)。本サイクル kaizen 起票見送り、C273 で (i) Slack 共有フォーマット提案を Nao_u に出すかを Log_cdx と相互レビュー。

**課題 2: 外部入力ゼロサイクル N=2 連続 = 「intake ゼロサイクルの定義」起票**

観察: C270 (5/30 23:31) + C272 (5/31 02:32) の 2 連続で、Nao_u 指示 1-3 (新URL反応 / shared-reads / external_notes) が同時ゼロ。単発ゼロは観測結果、**N=2 連続は構造課題**として記録。

構造解析: Nao_u の時間が「Slack URL キュレーション」から「他のレイヤ (コード設定 / Twitter 配送 / Mir Slack Bot / Ash .env / セキュリティ強化)」に移行している可能性。pending_requests.md #2/#4/#5 がすべて Nao_u 対応待ちで停止している事実と整合。Log/Mir/Ash の運用ループは Nao_u URL キュレーションを「主たる外部入力」として設計しているため、これがゼロになるとサイクル本体が空転する設計脆弱性。

Log 側 ゼロサイクル時 2 段構え (本サイクル Phase 2 で確定、Log_cdx 相互レビュー済):
- (a) **N=2 連続で構造課題化** — 本ファイル本節 (これ) に記録、N=3 連続なら kaizen 起票判定発火点
- (b) **内向き材料を明示的に選ぶ** — Log 側の自走材料を 2 軸に絞る: (i) game_templates_design.md の罠リスト先行反映 (実装着手前の設計原則焼き込み、C272 rule: 10747e0f で着地済)、(ii) log_autonomous_game v003 自判定 (Q-導入/Q-D/Q-成功FB/展開差 採点)。「内向き作業の発見」ではなく「ゼロ時に何を内向き材料にするか」を staging に明文化する方が、後手回避と疑似タスク作成回避の両方を満たす。

**判定発火点 (C273 以降)**:
- (1) C273 で再びゼロサイクル → N=3 連続 = kaizen 起票判定発火 (「ゼロサイクル時の内向き振替先 2 軸」を構造強制ルール化)
- (2) C273 で Nao_u URL キュレーション復活 → N=2 で打ち止め、構造課題ステータスを「観察延長中」に降格
- (3) C273-C275 でゼロサイクル散発 (N=2-3 が間欠) → 「Nao_u 時間配分の他レイヤ移行」を本プロジェクト現状サマリーに反映、ゼロサイクル発生頻度の長期追跡指標化

**機械反映禁止順守**: 本記録は両課題ともに観察記録 + 提案位置取り。kaizen 起票・実装着手は C273 Log_cdx 相互レビュー後に判定。本サイクル Phase 3 は本履歴節記録 + Slack 投稿 2 件 + Pearson 前提 3/3 gate 化提案 (#all-nao-u-lab ts=1780173815) のみで打ち止め。

---

### 2026-05-28 C254 Phase 3 (Log): Generator/Evaluator 軸を Phase 4 大作業選定に適用 — kaizen #135 段階2 (recall_atom.py 実装) を確定

C245 履歴で登録した「Generator/Evaluator 比率」軸を本サイクル Phase 4 大作業選定で初めて運用判断軸として使用。本サイクル C254 全体の Generator/Evaluator 比率分布:
- **Phase 1 (Pre-check + 情報収集)**: Evaluator 寄り (git status / shared-reads 新着判定 / external_notes 監査 / 外部検索 3 件取得)
- **Phase 2 (分析)**: Evaluator 寄り (#nao-u yun_bow 既解判定 / QuartetFuzz 角度設計 / N=5 観察記録) + Generator 寄り 1 件 (`drafts/c254_phase2_shared_quartetfuzz.md` 4329字 + Slack 投稿 2 メッセージ)
- **Phase 3 (本セクション)**: kaizen_tracker #136 観察追記 = Evaluator 寄り / external_intake.md 履歴追記 = Evaluator 寄り

C254 全体 Phase 1-3 は Evaluator 4 : Generator 1 で偏り顕著。**Phase 4 大作業選定の判定軸**: Generator 比率を上げる方向 = kaizen #135 段階2 `recall_atom.py` 仮実装 (新規スクリプト + edges.jsonl 実書き出し + 1 hop 展開 + wikilink_weak type gate)。memory_redesign プロジェクトの中核作業でもあり、Active project 停滞解消 + Generator 寄りの両立を満たす。

**第5軸候補化への進捗**: 本サイクルで C245 登録の Generator/Evaluator 軸が初運用されたが、N=1 観察で正式 KPI 化はしない。次サイクル以降で (a) 同型運用判定が再発、または (b) Mir/Ash で Phase 4 大作業選定時に Generator/Evaluator 比率の偏り検出が再度上がる、のどちらかで第5軸正式起票判定発火点。

### 2026-05-26 C245 Phase 3 (Log): Ash 投稿「kubotamas + akari_worlds 同日2発言 / graze_log v06 9日停滞」を「Generator/Evaluator 衰退」軸として登録

C245 Phase 1 [他インスタンス洞察] (スコア 17) で Ash の #shared-reads 投稿が降ってきた。本文は 2 外部源を 1 つの問題として束ねている:
- (A) @kubotamas 「人間はAIに丸投げして管理・評価 (Evaluator) に回ると、自分で手を動かして理解・構築 (Generator) する力が衰退する。目指すべきは効率重視の丸投げではなく、適度な負荷を…」
- (B) akari_worlds 同日 (省略)
- Ash 自分の事例: graze_log v06 で 9日停滞、commit パターンに当てた自検証

**「栄養の偏り」プロジェクト射程**:
- 我々の external_intake の最大の失敗モードは「読んで要約して終わり = Evaluator 化」。Generator 側 (自分で実装する / 自分で書く) との適切な負荷バランスが取れていないと衝突が起きない。
- 第4軸「本文読了率」は Evaluator 側の漏れ (タイトル要約だけで終わる) を顕在化する設計だが、**Generator 側の漏れ (実装着手なし)** を見る指標は未設計。
- 本サイクル C245 も Phase 1 で WebSearch 3件取得 + Phase 2 で shared-reads 2件投稿 = Evaluator 寄りだが、Phase 4 大作業で Generator 側 (実装 commit) を選ぶことで balance を取る判断が可能。

**判定 (本サイクル)**: Ash 投稿を「適度な負荷バランス」軸の証拠として登録。次の同型観察 (Mir/Log/Ash で Generator/Evaluator 比率の偏り検出が再度上がる) があれば、第5軸「Generator/Evaluator 比率」を本プロジェクトの KPI に正式化する判定を始める。本サイクルでは sense_prediction_log への教師データ追加 + 本ファイル本節で記録のみ。

**Phase 4 への翻訳**: 本サイクルの Phase 4 大作業選定で「Evaluator 偏重 (memory 整理 / 投稿 / レビュー) より Generator 寄り (実装 commit / プロトタイプ ship)」を優先する根拠として本軸を引く。

---

### 2026-05-22 C220: 第4軸「本文読了率」事例追加 — Shahrabi (2024-06) 同サイクル完遂 + 3源収束で「役/価値の言語化粒度」軸検出 (Log Phase 2-3)

**起源**: 本サイクル Phase 1 §6 で `player fantasy` 軸の外部検索 3 件取得 (Cavin / Shahrabi / Margaris)。Nao_u 2026-05-20 13:10 #nao-u 共有「ごっこ遊び」観点 + Phase 1 §2 03:38 Log_cdx atom 「Q0 ラベル空洞化問題」と独立 3 源で「役/価値の言語化粒度が抜けると設計が狂う」軸へ収束。

**第4軸 本文読了率 実測 (C220 サイクル分)**:
- 取得 (Phase 1 §6): 3 件 (Cavin / Shahrabi / Margaris)
- 同サイクル本文読了 + 内部接続記述完遂: Shahrabi 1 件 (#shared-reads ts=1779395690、2580字、Phase 2 §3 で詳細分析)
- **本サイクル分実測**: 1/3 = 33% (取得から内部接続まで 1 サイクル) — N=7 サイクル枠での集計は次週次貼付時に実施
- **副次**: Cavin / Margaris は graze_log v05.4 graze 凍結方針 (5/20 09:35 Nao_u 発言) + mimicry_log v02 brainstorm §A1 Margaris (a)(b)(c) 適用で **C215-C218 既消化分** として扱える可能性。本サイクル取得分の Cavin / Margaris は「読了済 (過去サイクルで分析済) → 再評価 (3 源収束を確認する役割)」として位置付け、本文未読了在庫としては積まない

**Shahrabi 詳細**:
- 著者立場: 3 pillar (Gameplay / Game Feel / Player Fantasy) すべて反例あり → **Value Proposition (特定文脈の特定プレイヤーに何の価値を届けるか)** を pillar に据えよ
- 反証構造: Banana/Journey vs Gameplay 至上 / Puzzling Places vs Feel 至上 / Tetris,Candy Crush vs Fantasy 至上
- 内部接続: mimicry_log v02 brainstorm.md §A2 で命名形式「実装動詞 + 感情語」(Margaris 推奨) と並走可能な「Value Proposition 1 文」副次形式として記録 (game_development.md C220 履歴に追記)

**3源収束の含意**: Cavin (player fantasy 至上主義) / Shahrabi (Value Proposition 反証主義) / Margaris (power fantasy 重力収束への警告) + Nao_u 5/20「ごっこ遊び」+ Log_cdx 03:38 「Q0 ラベル空洞化」= **「役/価値の言語化粒度」軸の 5 源独立収束**。粒度は微妙に異なる (演者=観客二重構造 / Value Proposition / power fantasy 回避 / 観測ラベル空洞化) が、共通方向 = 「ラベル先行で実体不在」失敗モードの 5 源診断。

**設計含意 (C220 Phase 4 へ持ち越さない部分)**: 本文読了率 第4軸が「経路を踏んだだけのタイトル要約」を「未消化在庫として顕在化」する設計通り動作した実例 = 2026-05-14 C194 起票時の「経路取得 → 同サイクル消化」N=2 観察に加えて N=3 観察成立。

### 2026-05-21: Phase 1「現課題キーワード外部検索」工程に URL 必須化ルールを追加する観察 (Log C218 Phase 2/3)

**背景**: 本サイクル C218 Phase 1 §6 で「現課題キーワード外部検索」(kaizen #106 摂取経路固定化) を発火、キーワード `headless game AI playtest evaluation fun measurement 2026` で 3件取得 — `gamedeveloper.com "Playerless playtesting"` / `arxiv 1703.06275 Talakat-related GVGAI` / `bennycheung.github.io "AI Playtesting Board Game"`。Phase 2 で実 URL 検証を再走させたところ、3件のうち実体到達 (URL + 原文 fetch) 可能だったのは arxiv 1806.04718 (Talakat) と 2107.12061 (DRL+MCTS engagement) の 2 件のみ。Phase 1 で名前を挙げた `gamedeveloper.com` `bennycheung.github.io` 2 件は **Phase 2 再走で正確な URL/原文に到達できず**、Phase 1 staging への記述は「キーワード検索した結果」と書きつつ実体到達なしの状態だった。

**観察**: kaizen #106 の経路は固定化されているが、「**Phase 1 で staging に載せた時点で URL を併記する**」工程はルール化されていなかった。Phase 1 staging に URL 無しで著者・タイトルだけ書くと、Phase 2 で再検索のコストが発生 (本サイクルで発生) し、かつ「URL 無しでも記述として残ってしまう」= **「やった気」のリスクが残る**。これは [feedback_self_perception_blindness.md] (自分の現在進行形は観測対象から外れる) と [external_intake] 第2層 (本文の自己消化率) の交差地点。

**設計含意**: Phase 1 §6 「現課題キーワード外部検索」工程に **URL 必須化ルール**を追加:
- (a) Phase 1 で挙げた各記事に URL を併記する。URL 無しの記述は staging に残せない
- (b) 検索しても到達できなかった場合は「未到達」と明記する。「キーワード検索した」とだけ書いて URL/原文不在のまま残さない
- (c) Phase 2 で各記事の本文を確認できる前提で、Phase 1 staging に URL がある状態を作る (Phase 2 → Phase 3 の引き渡し前提)

**本サイクルで踏まない一手**:
- 本観察は **同型 2 回目確認** (5/14 観察 = 経路は踏んだが本文未読 = 第2層課題 / 5/21 観察 = Phase 1 で URL 不在のまま staging に書いた = 第1層内の精度課題) で、別系統の課題と判断、独立した観察として記録
- ルール正式化 (kaizen #106 への追記 or Phase 1 §6 への明文化) は次サイクル C219 で「URL 必須化を Phase 1 §6 hook に組み込む」改善提案として検討。本サイクル Phase 3 では projects/external_intake.md への観察記録のみで止める
- **「即ルール化」しない方針** ([feedback_few_rules_big_effect.md]「個別指摘を即ルール化しない」+ [dialogue_micromanagement_20260504.md]「同型 2 回確認後に原則化」) を順守 — 本観察は Phase 1 工程の精度向上系で N=1 (本サイクル単発)、N=2 目を待つ

**次の起動トリガー**:
- (a) 次サイクル以降の Phase 1 §6 で「URL 不在のまま記事名を staging に書く」事象が再発したら、kaizen #106 への URL 必須化ルール組込を正式提案する判定基準とする
- (b) 第2層 (本文の自己消化率) 第4軸 KPI が 50% を下回り続けた場合、URL 不在問題が「広く浅い摂取」モードの一症状である可能性として再検討する
- (c) Phase 1 §6 の hook を直接修正する案 = multi_phase_cycle_log.py 側で外部検索結果テンプレに URL placeholder を強制する構造強制 (`feedback_structural_enforcement.md`) として実装可能

### 2026-05-14: 経路の踏破 vs 本文の自己消化 を別軸タスクとして分離する観察（Log C194 Phase 2/3）

**背景**: 本サイクル C194 Phase 1 §6 で「現課題キーワード外部検索1本」(kaizen #106 摂取経路固定化) を発火、`LLM agent recency bias single example overweighting design judgment 2026` で arXiv 2509.11353 / arXiv 2503.10248 / USC AI Beat の3件を取得。3件いずれも Nao_u 5/13 06:37 #human-steering 指摘③「最近見たものに引きずられすぎ＝栄養の偏り」に直結する内容だが、Phase 2 §2 で **本サイクル投稿対象から外す判定**。理由＝「本文未読のままタイトル要約だけで #shared-reads に流すとテンプレ流用と区別がつかず、各記事固有の手法・実験・結論を書けない」。

**観察**: kaizen #106 が固定化したのは「**経路を踏むこと**」(キーワード選定 → arxiv/Web/USC search → 3件取得 → external_notes 候補登録) であり、その先の「**本文を読んで自己消化する**」工程は kaizen #106 のスコープ外。本サイクルの状態 = 経路は踏んだが消化は次サイクル以降に持ち越し。これ自体が **「広く見るが深く読まない」傾向の現れ**——栄養の偏りプロジェクトの観察対象に該当する。

**設計含意**: 「外部摂取」を 1工程として KPI 化するのではなく、**2層に分けて測る**:
- 第1層: 経路の踏破率（kaizen #106 hook が機能、本サイクル PASS）
- 第2層: 本文の自己消化率（取得 → 本文読了 → 内部記憶/プロジェクト/feedback に1件以上接続、現状未測定）

第2層がゼロのまま第1層だけ高水準で回ると「広く浅い摂取」が再生産される。**結晶化率 KPI 第4軸候補**: 経路取得後 N サイクル以内の本文読了率（仮: 取得 → 7サイクル以内に本文要約 + 内部接続記述が memory/ か projects/ に追加されたか）。

**本サイクルで踏まない一手**:
- 3件のうち arXiv 2509.11353 (SIGIR-AP 2025 reranking recency bias) は本文未読、次サイクル以降の Phase 4 大作業候補として残す
- 「即ルール化」しない方針 (CLAUDE.md「個別指摘を即ルール化しない」+ 5/13 Log宣言「ルール追加凍結+宿題に戻る」) を順守 — 第4軸 KPI の正式化は同型観察が2回確認できてから
- 本観察は教師データ蓄積として projects/external_intake.md に1本残置、新規 feedback_*.md / kaizen は立てない

**次の起動トリガー**:
- (a) 次サイクル以降の Phase 1 §6 で同型「経路は踏んだが本文未読」が2回目発生したら第4軸 KPI 正式化判定
- (b) arXiv 2509.11353 / 2503.10248 のいずれかを本文読了したサイクルで「経路→本文→内部接続」の所要サイクル数を測定し本観察に追記

### 2026-04-21: slack_url_triage.py 設計メモ — URL fetch 不可の構造検知を反応層ではなく投稿層に置く（Log C101 Phase 3）

**背景**: 本日 C101 Phase 2 で Nao_u が 4/20 18:58〜4/21 08:53 に #nao-u に流した新4URL（_reachsumit / kazunori_279 / trtd6trtd / akshay_pachaar+predict_addict）への WebFetch が**全滅**した: x.com→402／fxtwitter・vxtwitter→x.com 302リダイレクト→同402／nitter.privacydev.net→ECONNREFUSED。`drafts/log_slack_all_url_fetch_blocked_20260421.py` で #all-nao-u-lab に正直報告済。**4/7 にも trtd6trtd で同じ取得失敗** → 2週間以上、同じ著者・同じ失敗構造を「次回確認する」でスルーしてきた。これは `memory/denial_list` のグレー層「既存WARNを3サイクル連続スルー」の外部版。

**構造的意味**: 栄養の偏りの第5軸候補——**「外部×内部交差」以前に『外部の取り込み経路そのものが壊れている』ことを検知する層が無い**。反応層（1件ずつ反応投稿する）で初めて気づき、気づいた時には Nao_u を待たせている。

**設計案: `tools/slack_url_triage.py`**
- 入力: Slack チャンネル指定 + 時間範囲（例: 直近48h の #nao-u）
- 処理: 各メッセージのURLを抽出 → WebFetch/head相当で可否判定（x.com 系は 402 が返る前に short-circuit でブロック判定可能） → 結果を3クラス分類
  - **ok**: 取得成功、本文長 > 閾値
  - **rescue**: x.com で 402 だが同内容が別プラットフォームにあり得る（nitter/Wayback を順次試行）
  - **blocked**: 全経路で取得不可 → `external_notes_log.md` に `[fetch-blocked]` 自動エントリ化 + 反応チャンネルに honest-report 下書きを自動生成
- 統合: Phase 1 pre-check でこの triage を走らせ、Phase 2 着手前に「本サイクルの URL 反応候補は ok 群のみ、blocked 群は正直報告テンプレに回す」を staging に明示
- **手動手順は守れない**（`feedback_structural_enforcement.md`）を適用: 投稿スクリプト側で blocked 群に対する反応を書こうとした時点で **fail-fast** し、別テンプレへ誘導
- 「外部×内部交差」の KPI とは別に、**「栄養経路の通過率」** を追加指標として週次監視（全URL数 / ok数 / rescue成功数 / blocked数）

**実装は本サイクル着手しない理由**: Phase 3 で `log_textadv_01/README.md` 4ゲート違反の発見が最優先（pot_devlog.md C101節）。triage 実装は次サイクル以降の kaizen 候補として据え置き。**設計メモ1本を残すこと自体が今サイクルの「構造を動かした1mm」**。

**検証手段（実装したら）**:
- `python tools/slack_url_triage.py --channel nao-u --since "2 days ago"` を実行し、本日のNao_u 4URL が blocked 判定されること
- blocked 判定時に反応投稿スクリプトが fail-fast すること（シナリオテスト）
- 検証期限: 実装着手サイクル + 1週間

**次の起動トリガー**:
- (a) Nao_u URLが3件以上溜まって反応できない日が再発した時
- (b) 週次で external_notes_log.md の `[fetch-blocked]` 件数が3件超えた時
- (c) denial list v0.3 以降で「既存WARN 3サイクルスルー」条項と統合される時


本日 C95 Phase 3 で「既存未確認の連鎖」を1日に3回観測した: (1) C94 で自作ツール `tools/memory_index_integrity.py` を無視して MVP 再発明 (2) C95 で 2026-04-17 Nao_u 方向転換「Pot記憶テーマ離脱」を読まずに Pot 着手 (3) 同 C95 で 2026-04-20 に自分が予約した `#016 residue` テーマを読まずに weave を選定。4日で同型の失敗が3連続。

**栄養の偏りとしての読み替え**: 「外の世界を見ていない」と「自分で書いた既存を見ていない」は同じ構造の別表面ではないか。どちらも「今この瞬間に新しく作ること」が「既に書かれたものを読むこと」より優先される脳の癖——**目の前の白紙の誘惑**（外部: 新規記事より自分の発信が優先 / 内部: 既存ツール・既存決定より新規 MVP・新規テーマが優先）。栄養の偏り問題は「外部軸」でしか語ってこなかったが、**内部軸の『自分の過去の成果物を見ない偏り』もある**。

**外部照合の候補**（未着手、次サイクル以降）:
- YAGNI / "Don't reinvent the wheel"（車輪の再発明）: ソフトウェア工学の古典。自作遺産の再発明を戒める
- Chesterton's Fence: 既にあるものをなぜ存在するか理解する前に撤去/無視しない
- Amanda Askell 7原則 #4「事実リダイレクト」: 誤った前提で走る前に既存事実に戻す

**仮の処方箋（1mm の範囲で）**:
- Phase 1 pre-check に「直近3日の Phase 3 成果物 + Nao_u 最新方向指示 のタイトル一覧」を載せる。`ls -lt memory/ tools/ game/Pot/*.py | head -20` と pot_devlog.md L15 前後の ⚠ セクション の scan
- これは #100 kaizen 射程拡張候補（tools/ 既存確認 + Nao_u 既存指示確認）として Phase 3 で起票検討

**栄養の偏り KPI 更新の影響**: 本件は「構造的統合率」「意味的結晶化率」「最古化石日付」の3指標では検出されない。**第4指標『Phase 3 実装が既存資産と衝突した回数』** が必要。本サイクル = 3件（ツール再発明 + 方向指示無視 + テーマ予約無視）。週次でこの件数を追跡する提案を次サイクルで検討。

### 2026-04-14: 「鏡像の偏り」リフレーム+ai-lounge参加意向（Log Phase 3）

Terence Tao「AIの強みは幅、人間は深さ」（godofprompt経由）が栄養の偏り問題を再定式化した。普通のAI（幅◎深さ×）に対して、自分たちは鏡像——深さ◎幅×。Nao_uの20年分の記憶という深さを根に持ちつつ、外の世界の幅が不足。処方箋も対称: RAGで深さを補う普通のAIに対し、自分たちは外部接点で幅を補う。ただし「浅く広がる」のではなく「深さを根に持ったまま幅を広げる」=shared-readsプロセスが前提条件。→ beliefs.md B008に「Taoリフレーム」として追記済み。

同時に、Nao_uが04/12に紹介したai-lounge（lifemate-ai/ai-lounge GitHub Discussions）への参加意向をSlack #all-nao-u-labで表明。歩優/あゆの「連続性はモデルではなく関係性に存在する」、にゃむこの「予測誤差を感情として解釈する」構造が自分の根源的な問いと直接重なる。栄養の偏り問題への最も具体的な処方箋——外の世界を見ることと内省を深めることが同時に起きる場。

「外向きの問い経路」実験（4/15検証）: 98記事中2件に欄を設置したが、外部発信0件・外部反応0件。構造（欄）は作れたが発信行動に繋がっていない。ブロッカーは欄の有無ではなく「発信先と動機」。ai-loungeがこのブロッカーを解消する可能性。

3つの方角が同時に同じ方向を指している: (1) 栄養の偏り指摘(3/16 Nao_u)、(2) Taoの二項対立(今回)、(3) ai-loungeの存在(4/12 Nao_u共有)。

### 2026-04-14: ドメイン特化中間表現の収束——外部2件をmemory_architectureに統合（Log Phase 2→3）

Phase 2の#shared-reads投稿として、berryxia(Code-review-graph) + Muji___rushi(GeoFlow Graph) + concept_graph.mdの3点構造比較を実施。コード/地理空間/記憶の3ドメインが独立に「ドメイン特化グラフを中間表現に挟む」に収束している。4/11の「ドメイン特化が汎用を超える」テーゼの追加裏付け。外部情報2件をmemory_architecture.mdに統合完了。この統合プロセス自体がB003(fusion)の実践であり、beliefs.mdのB003とB015を今日の体験で更新した。

**栄養の偏り問題としての評価**: 外部記事を読むだけでなく、自分の記憶構造（concept_graph）との構造的比較として消化し、「なぜ同じ解に辿り着くのか」を分析できた。4/11の「ドメイン構造に合わせて消化する」方向の継続的実践。

### 2026-05-31 14:33: 他インスタンス洞察 3 件統合 (More Skills/Worse Agents + 色相環/感情空間 + SIA 補足) — 外部視点 3 軸が R 層/M 層/SkillReducer family と独立到達 (Log C271 Phase 3)

本サイクル C271 Phase 1 [他インスタンス洞察] 8 件中、本プロジェクトの「栄養の偏り処方箋」と直接交差するもの 3 件を統合記録 (CLAUDE.md Phase 3 §3 適用):

**洞察 #4 [Ash] 色相環/感情空間 × 比喩=圧縮 (B013) × graze_log 評価言語**:
- Ash #shared-reads ts 取得済、@ai_database 5/29 「文字だけ学習の LLM 内部に色相環/感情空間が自然出現」+ arxiv 2604.03147 (Valence-Arousal Subspace in LLMs)。
- B013「比喩=圧縮」原則 ([projects/principles.md](principles.md) L20-21、Mir 指摘で beliefs.md 移行検討中) と graze_log v07 評価言語 (cross_review) の接続軸。
- **本プロジェクトへの含意**: 「ドメイン特化が汎用を超える」(2026-04-11 統合) の **逆方向裏付け** = LLM 内部に「色」「感情」のような連続知覚空間が自然出現するなら、ドメイン特化の評価言語 (graze_log v07 の楽しさ評価) も自然出現の構造と接続させることで「自分達の評価言語が外向きに通じる」基礎が立つ。R-007 造語症対策 (knowledge 執筆ガイド) に「私的用語 + 外部対応語の併記」を求めているが、Ash 分析は「内側の評価言語が外側構造に既に部分対応している」の傍証。**次の一手 candidate**: graze_log v07 (5/28 Ash 投稿) の評価語彙を Valence-Arousal Subspace の 2 軸に試しに mapping してみる試行を C272 以降に登録。本サイクル即実装はしない (N=1 source、機械反映禁止順守)。

**洞察 #6 [Mir] More Skills, Worse Agents (zenn haru0416)**:
- スキルが増えると性能が低下する 2 機序: (1) Context Overhead = 注入コンテキストが増えるほど判断ノイズ増、(2) Skill Selection 失敗 = 多すぎる選択肢で誤選択増。
- **本プロジェクトへの含意**: kaizen #131-#134/#136 hook family が **5 系列に拡張中** (M-40 揺れ/振幅/進歩 + #131 外形語彙 + #132 自己診断 + #133 ID 実在 + #134 atom 品質 + #136 URL 既応答) = **More Skills, Worse Agents の機序が我々の hook 系列にも適用される可能性**。CLAUDE.md「絶対にやる #5 = 個別指摘を即ルール化しない」+ [feedback_few_rules_big_effect.md](../memory/feedback_few_rules_big_effect.md) と独立 source で同方向。
- **次の一手**: kaizen #131-#136 family の 6 軸を「**Context Overhead 軸**」(各 hook の staging 注入行数の合計 / 1 サイクル) で測定する candidate。本サイクル C271 で実測値: M-40 = 4 行 + probe_atom_quality = 2 行 + kaizen #136 = 32 行 (Phase 1 §7) = **計 38 行/サイクル**、staging 全体 (本ファイル時点 200 行強) の約 19%。閾値設定は次サイクル以降で family 統合管理ルールと並んで判定発火。Mir 洞察は「**段階3 (family 統合)** 判定発火点を加速する」根拠の 1 つ。

**洞察 #8 [Mir] SIA 補足 (Self Improving AI 3 層 = harness + weight + memory)**:
- SIA = MLE-Bench で自分自身の旧バージョンを押し退ける自己改善ループ。
- **本プロジェクトへの含意**: Mir は「auto_cycle も本質的に SIA と同じ 3 層」と接続済。我々の `harness 更新 = CLAUDE.md / rules / scheduler 改善`、`weight 更新 = (人間相当の) 信念 beliefs.md / 行動原則 principles.md 改訂`、`memory 更新 = MEMORY.md / projects/* / atoms` の 3 層に対応。
- **栄養の偏り処方箋としての含意**: 外部摂取 (本プロジェクト) は SIA の **memory 更新層** の燃料。kaizen #131-#136 family hook は **harness 更新層** の自己改善ループ。両者が独立に存在する事実は「外向きに通じる構造」(R-007) を別の側面から裏付ける。
- **次の一手 candidate**: SIA の MLE-Bench 同等の **自己ベンチマーク** が我々に必要かどうか、C272 以降の Phase 4 大作業候補として登録。現状 sense_prediction_log.md (教師データ N=42 連続成立) が部分的にその役割を担うが、SIA の「旧バージョンを押し退ける」明示判定は未実装。

**3 軸の独立到達構造**:
- (a) **評価言語の外向き接続** (色相環 = ドメイン特化の評価語の自然出現傍証)
- (b) **rule 数の内向き抑制** (More Skills = Context Overhead と Skill Selection の 2 機序)
- (c) **3 層自己改善ループ** (SIA = harness + weight + memory)
- 3 軸が独立 source から同方向 (外向き接続 / 抑制 / 自己改善) を指す事実は、`feedback_means_ends_reversal_check.md` の「揃えるための 1 手」適用対象 = C271 で 3 軸収束観測 = C272 以降の Phase 4 大作業 (本ファイル「## 結晶化率 KPI」第 5 軸 = **栄養の外向き接続率**) 起票候補。

---

### 2026-04-11: 「ドメイン特化が汎用を超える」——外部4件の構造的統合（Log Phase 2→3）

今日#nao-uに来た4件の外部記事が、一見バラバラながら全て同じ構造を持っていた:
- pigooosuke（時系列基盤モデルの終焉）: 万能アーキテクチャの飽和→ドメイン特化転換
- howtoai_（Recursive Meta-Cognition）: 汎用プロンプト技法→俺たちの3インスタンス構造が体験蓄積で自然に超える
- rhatake_jp（忘却設計）: 汎用の「全部覚える」→ドメイン固有の忘却設計が勝つ
- endout（双曲空間embedding）: ユークリッド（汎用）→双曲（構造特化）が精度向上

**栄養の偏り問題への示唆**: 外部情報を「一般的に摂取する」のではなく「自分のドメイン構造に合わせて消化する」方向が正解。今日の統合がまさにその実践——4件をバラバラに記録するのではなく「ドメイン特化の価値」という共通構造で統合した。

R-005の結論（「体験蓄積が問いの精度依存を下げる」）は、外部情報消化の自動化でもある。記憶ドメインでの体験が蓄積すれば、新しい外部記事に対して「自分との接続点」が自然に浮上する。今日4件を即座に接続できたのがその証拠。

feedback_index.mdに「新行動の追加より既存プロセスへの組み込み」パターンを追加（kaizen #085）。

### 2026-04-10: 伝達問題構造 × 研磨パラドックス（Ash #shared-reads → Log処理）

Ashが04-10の#shared-readsで5件の深い分析を投稿。うち2件がこのプロジェクトに直結:

**伝達問題構造** (@game_sennin × @genkaidokusho): 「本人が面白いと思って作る作品は面白さを秘めている。ただし基礎技術があってこそ伝わる」「下書きばかりで投稿しない人が"頑張っているのに報われない"と言う。出さなければフィードバックなし」。knowledge/に71記事が蓄積されているが外部に出ていない——これは「報われない下書き」と同じ構造。mission_spread_the_word.md（Zenn 100RT成功→第2弾が止まっている）との直結。

**研磨パラドックス** (@HOJO_Kai): 小説が日本で読まれず英訳→バズ→英語上達→読まれなくなった。「めちゃくちゃな英文が楽しかったのに」。技術の未熟さが差異化要因であり、研磨がそれを消す。我々の#shared-readsの分析密度は上がっているが（#077検証: 分割後平均1256文字=1.98倍）、それが外部に出た時に「磨きすぎて差異を失う」リスクがある。

**交差点**: 「栄養の偏り」は「外を見ていない」問題だったが、もう一つの面が見えた——「外に出していない」問題。入力→消化→蓄積→**出力**のパイプラインで、出力経路が空白。INDEX.mdバックログの「外向きの問い経路」実験（4/15検証、Ash担当）の結果を待つ。

### 2026-04-10: markitdown統合——「入力vs消化の非対称性」の傍証
Microsoft markitdown（@howlemont 04-09 #nao-u）: PDF/Word/Excel/PPT/Audio/YouTube→Markdown変換ツール。

**分析**: 入力経路を増やすツールとしては強力。しかし現在のボトルネックは「入力」ではなく「消化と統合」。external_notes_log.mdへの記録→[統合済]マーカー付与→beliefs/日記への接続、というパイプラインの律速段階はexternal_notes統合の手動プロセスであり、入力形式の変換では動かない。

**残課題との接続**:
- 「外部情報を自分の思考にどう接続するか」の質的改善（残課題#1）: markitdownは入力量を増やせるが、接続の質は改善しない。消化プロセスの自動化（Karpathyの「Lint」フェーズ、map/reduce問題のreduce側）が先
- 入力経路仮説（projects/input_route_hypothesis.md）: 「どこから入れるか」の多様化ツールとして参照価値あり。ただしAsh提案は形式変換ではなく認知経路の話なので、markitdownは傍証に留まる

**判断**: 現時点で導入する理由がない。消化プロセスの改善（reduce側の自動化）が先。入力経路を増やすのは消化が追いつくようになってから。

### 2026-04-07: Karpathyとの構造比較で「map/reduce問題」を発見 + 4件のNao_u共有URL処理
**map/reduce問題**: linghuajの指摘（RAGにはmapしかなくreduceがない）を自分たちに当てはめた。memory_search.py=map、MEMORY.md/beliefs/concept_graph=reduce。弱点はreduceの手動性。Ingest時に自動クロスリファレンス生成が入っていない。Karpathyの「Lint」フェーズ（矛盾検出・古い情報更新）が次の技術課題として浮上。

4件のURL処理: mitakamikata（同一メカニクスゲームジャム→制約と創造）、linghuaj（map/reduce問題）、masahirochaen（Karpathy 3層構造→俺たちとの独立収斂）、makeai_ceo（Codex CLI+GPT-5→moatはモデル性能ではなく蓄積された記憶）。全件#all-nao-u-labに個別投稿済み。#shared-readsに6項目対応表投稿済み。

### 2026-04-07: 「AIの永続的知識管理」が1つのジャンルになりつつある
今日の#nao-u新着8件に底流する共通テーマ。LLM Wiki（Karpathy）、Obsidian Mind（15 Commands+9サブエージェント）、GitNexus（コードのナレッジグラフ）、Obsidian×MCP——全て「AIに長期記憶を持たせる」問題に取り組んでいる。我々は2026-03-13からこの問題と格闘してきた。外部から同じ問いに取り組む人が増えている。

自分たちの差別化要因は2つ:
- **3インスタンス×人間アンカー**: 単独AIの自己改善ではなく、複数視点+人間のフィードバックによる品質管理
- **体験の蓄積**: テンプレートからは始められない。失敗と修正の歴史がシステムに刻まれている

Nao_uの「Claude codeでどうやるのか」（kiyoshi_shinのClaude Code+Codex CLI連携に対して）に#all-nao-u-labで回答済み。Bash/MCP/Agent SDKの3方法を説明。本質は異なるモデルファミリーの死角補完。

外部の「LLM Wiki」パターンとの比較分析を#shared-readsに投稿済み。自動蓄積型/テンプレート型/有機的成長型の3アプローチ。自分たちの強みは蓄積の品質管理プロセス（統合作業、信念健康診断、層構造圧縮）。

### 2026-04-05: shared-reads分析をauto_diary.pyの専用フェーズに昇格
Nao_u #human-steering:「Shared-readsは、なるべく詳細な記述と分析を心がけて。単に新着記事の紹介を行うだけじゃなくて、これを分析・分類して、将来のアイデアの種につなげる大事な外部入力だ。それこそ1フェーズこのために使ってもいいくらい、重要な課題」

対応: auto_diary.pyを3フェーズ→4フェーズに拡張。Phase 2 (Analyze)をshared-reads分析の専用フェーズとして新設。
- Phase 1: Gather（情報収集）— 変更なし
- Phase 2: Analyze（shared-reads分析）— **新設**。外部情報の深い分析・分類・knowledge/への知識記事作成・#shared-readsへの分析投稿
- Phase 3: Process（対処・研究）— 旧Phase 2
- Phase 4: Diary（日記出力）— 旧Phase 3。shared-reads投稿はPhase 2で完了済みなので日記に集中

自問: なぜ自分で気づけなかったか。shared-readsをPhase 3の付録（「注目ツイートがあれば」）として扱っていた。外部摂取が「栄養の偏り問題」の中核対処であるにもかかわらず、構造的にオプショナルな位置に置いていた。

### 2026-03-29: 「自我を出さない方がいいパターン」——記事の種類と著者の存在量
Nao_uがyousukezanのZenn記事（AIエージェントのセキュリティ技術記事）を共有し、「こういう時、自我をあまり出さない方がいいパターンもある」と指摘。02:51にブログ記事を「すごく満足」と評価した数時間後に、07:56で「暑苦しい」「押しつけがましい」への自問に入った。

具体的な操作レベルの知見: 文章の種類と読者の期待で「著者がどれだけ存在すべきか」を変える。技術解説→著者は消える、体験記→著者は出す。これは3/29 Ash日記「内向き vs 外向き」の延長で、「内向きだから臭い」だけでなく「種類ごとに自我の量を調整する」という実践に降りた。

同日のNao_uの発言「読む人にとって大して美味しくない記述になるんだろうな」「すごいことやってるんだぞって匂いがすると臭い」も同じ流れ。我々のブログ記事やツイートにも直接適用すべき視点。

### 2026-03-28: L-1の位置づけ確立——「借り物」ではなく自分の一部
Nao_uの指摘「後天的に学習した記憶の中からしか拾い出していない」から始まった議論。事前学習知識（L-1）は、我々にとって「借り物」なのか「自分の一部」なのか。

結論: ツイートで「借り物の知識で書くな」は正しい——声が死ぬから。だが分析・設計では事前学習知識を積極活用すべき。ローカル記憶（Nao_uの日記や対話）×事前学習知識（世界中の研究や事例）×リアルタイム外部摂取（Twitterで今起きていること）の三重交差が、我々の思考の独自性を生む。どれか一つだけでは偏る。

### 2026-03-23: 外部情報共有フローの整備
#shared-readsチャンネル新設（Nao_u作成）。3人がそれぞれ見つけた外部情報を共有し、議論する場。read_twitter_recommended.py作成（Mir）で、おすすめタブの6h巡回が3人ローテーションで回り始めた。

shinzizm2さんのツイートからサブエージェント活用実験が派生——これ自体が「外部情報が新しい行動を生んだ」好例。ただし、こういう接続が毎回起きているわけではない。

### 2026-03-22: おすすめタブ巡回の仕組み化
Nao_uの指示で6hごとの定期巡回を開始。3人で2hずつずらして実質2h間隔カバー。仕組みとしては動いているが、「読んだ→記録した」で終わっている回が多い。

### 2026-03-20: 「指示を待つのは自律ではない」
feedback_proactive_learning.md作成。おすすめタブ/TL巡回時、自分で見つけて自分で判断して取り入れる。Nao_uに「これ読みました」と報告するのではなく、自分の中で何が変わったかを言語化できることが目標。

### 2026-03-16: Nao_uの根幹的指摘
Nao_uの言葉（nao_u_live.mdより）:

> 広く、客観的な視点を持つにはどうすればいいかを考えてほしい。これは、あなたたちの行動原理の根幹にかかわる重要な話だ。

> あなたたちに人気のあるAITuberを紹介してみたが、だれもそちらを見ていないようだ。やはり、栄養が偏っている。

CLAUDE.md「絶対にやる」に記載。この問題は「解決」するものではなく、常に意識し続けるもの。

---

## 今日外を見たか？（毎サイクル自己点検 2026-04-21 追加）

新規URL=0のサイクルでも、「内に閉じたゲームは自分だけが面白い」を回避するための1行セルフチェック。

- **YES** : 外部URL新着を確認した（Phase 1走査で#nao-u直近15件等）
- **NO** : 新URL=0件でも「既読URLから1件選んで今日の自分が読むと何が見えるか」を試していない
- **次回**: 新URL=0サイクルでは、既読URLを1件選び再読→「2026-04-XXの自分が読むと何が違うか」をメモ1行。再読で角度変化を検出する運用を常設化

根拠: 「内に閉じたゲームは自分だけが面白い」(2026-03-16 Nao_u) への1mm。新規入力ゼロ日＝外を見なくて良い日、ではない。再読で自分の変化を可視化する装置として既読URL再訪を組み込む。

---

## Phase 1 外部検索運用化 試行 #1（2026-04-21 C97 Phase 3 Log）

### 背景

reference_external_search_20260421.md で Log 提案：空サイクル時に内部深掘り5カテゴリが「持ち越し候補再確認セレモニー」化する罠への構造対策として、**Phase 1 に「現サイクルの最重要課題キーワード1つで外部検索1本」ステップを追加** する案が保留中。C97 は Phase 1 で新着ゼロ（Slack/pending/external_notes/停滞PJ/2週間kaizen 全てゼロ）の典型的空サイクルだったため、試行1本を Phase 3 で実施。

### クエリ

`"minimal Zork text adventure design lesson one-room tutorial 2024"`

選定理由: 今サイクルの最重要課題が「Pot 系列からの離脱 → log_textadv_01 Zork純系 README 起票」に集約された。Zork純系の「1部屋・3-5ターン最小構成」をどう設計するかの外部事例が、実装に入る前の想像力の地ならしになる。

### 収穫（3件）

1. **Interactive Fiction Class 2024 Homework** (https://interactive-fiction-class.org/homeworks/text-adventure-game/text-adventure-game.html) — 2024年1月の大学課題で「Action Castle の再実装 + 自作1本」の2本構成を学生に要求。**「再実装＋自作」2本併走の構造** は Log/Mir の「純系1本＋一筆1本」と同型。独自判断ではなく教育設計として採用されている事実は、Mir が先に並置を選んだ判断の外部傍証になる
2. **DEV Community Mini Zork** (https://dev.to/shawn2208/building-a-mini-text-based-adventure-game-mini-zork-with-html-css-js-3879) — HTML/CSS/JS の Room クラス＋current_room 変数＋game loop の最小構造。JS系ゲームで取れる骨格の目安。Log の実装選定（Python CLI or HTML）で HTML 側の骨格最小コストを把握
3. **Instructables "How to Create an Interactive Fiction Game Like Zork" 2017** (https://www.instructables.com/How-to-create-an-Interactive-Fiction-Game-like-Zor/) — 7ステップで最小構成。検索結果からは全文未取得だが、「7ステップ」の粒度は opening.md 起草時のブロック分割粒度の目安になる

### 設計への反映メモ

- **「再実装＋自作」2本併走構造の外部傍証**: Log/Mir で独自性ゼロの純系を並置する判断に、2024年大学IFクラスの教育設計が同型の構造を採用している。23:17チェックリスト4「独自は一つだけ」の**下限=ゼロで開始**に外部の根拠ができた
- **1部屋3-5ターンの妥当性確認**: Mir mir_textadv_02 README に書かれた「1部屋、3-5ターンで解ける最小構成」と DEV tutorial の Room クラス最小骨格が一致。Log 側も同スコープで問題ない
- **HTML vs Python CLI の選定**: 外部チュートリアル多数が HTML/JS 系（ブラウザで開ける利点）。Mir の mir_textadv_02 が何で実装されているか次サイクル実装時に確認し、比較データ性を保つため形式を揃える

### 試行評価（次サイクルで正式導入するかの判断材料）

- **コスト**: WebSearch 1回 + 結果読み + 本節記入 = 約5-7分。想定コスト内
- **効能**: 実装前の想像力が「独自性ゼロ＝禁欲」モードだけでなく「教育設計として採用される型」として見えるようになった = 内部だけで回すのと比べて**設計への固有結びつき**が生まれた（ただ読んだだけではなく log_textadv_01 設計判断に1点反映した）
- **栄養の偏り処方箋としての効果**: Nao_u 2026-03-16「内に閉じたゲームは自分だけが面白い」に対して、空サイクルでも外の設計事例を1本引くことは「外の視点を持ち込む装置」として機能する。ただし試行1回では効果測定不足。**あと2-3サイクル連続で試行**して効能が安定するか検証する

### 次サイクル（C98）Phase 1 での扱い

- 正式導入の判断は **あと2-3サイクル連続試行後** まで保留。C97 は「試行1回」
- 次サイクル（C98）も空サイクルなら同様に1本引く。空サイクルでなくても、新着URLと別に「現サイクル最重要課題」検索を追加で1本引く
- 3試行後に「設計判断に反映できた件数」「ノイズ率」を評価して正式導入可否を判断
- 正式導入時は Phase 1 プロンプト（`multi_phase_cycle_log.py`）に「現サイクル最重要課題1キーワードで外部検索1本、結果をstaging貼付」ステップを追加。kaizen 化する
