# karaage0703「放牧エンジニアリング」——ハーネスの次段階としての隔離環境設計と、我々の「装置の向き」問題

- source:
  - https://x.com/karaage0703/status/2050442231610499248 — @karaage0703 (2026-05-02) 「Claude Codeというか、自律的に動くAIは基本隔離環境で放し飼いにしてます。ハーネスエンジニアリングの次の段階、放牧エンジニアリングです」
  - 過去資産: knowledge/20260405_harness_identity_spectrum.md (Vincent/Rajasekaran ハーネス論) / knowledge/20260424_claudecode_harness_quality_regression.md / memory/feedback_device_direction_rescue_vs_suffocation.md (Ash 2026-05-02 graze_log v02 backup auto-commit 事象)
- author: karaage0703 / Ash 合成
- discovered: 2026-05-03
- discovered_via: log/twitter_recommended_20260503.txt #39（Phase 1 で抽出済 → Phase 2 で深掘り）
- kind: [observation, prescription]
- confidence: medium
- tags: [houboku-engineering, harness-engineering, sandboxing, autonomous-agent, device-direction, rescue-vs-suffocation, claude-code, isolation-environment, karaage0703]
- concept_nodes: [放牧エンジニアリング, 装置の向き, 隔離環境, 救援装置, 窒息装置]

## 概念ノード（R-007 外部対応語併記）

- node: **放牧エンジニアリング** = pasture engineering / sandboxed-agent free-running design
  external: sandboxing (Goldberg et al. 1996, "A Secure Environment for Untrusted Helper Applications") / agent isolation (multi-agent systems literature) / containerization-as-policy (Docker/Firecracker patterns) / chaos engineering の派生 (Netflix Chaos Monkey 2011)
  meaning: 自律的に動く AI を「明確に区切られた隔離環境」の中で**拘束を最小化して走らせる**設計思想。ハーネス (rein/harness = 馬具的な拘束) で挙動を内側から制御するのではなく、外側に柵（環境境界）を立てて中は自由にするという発想の転換。karaage 原典は1ツイート分の言明で、体系的定義は本人未提示。学術対応語としては sandboxing が最も近いが、放牧は「中で**走らせる**」「**学習・探索**を期待する」ニュアンスが加わる。
- node: **装置の向き** = device directionality / intent-preserving vs intent-suppressing automation
  external: automation paradox (Bainbridge 1983, "Ironies of Automation") / supportive automation vs invasive automation / Norman's "do-it-for-me vs help-me-do-it" 区別 (Norman 1990, "The 'Problem' with Automation")
  meaning: 同一の「自動装置」概念でも、設計の向きによって主体の意図発火を**救う方向**にも**塞ぐ方向**にも作用する。Ash 2026-05-02 観察: headless_check.py (救援装置) は MOVE_LIMIT=8 致命バグを Nao_u プレイ前に物理的に止めた。同時期の backup_memory.sh (窒息装置) は graze_log v02 ship 意図を auto-commit で先取りし、意図を載せた commit message の発火経路を消した。放牧と装置の向きは独立した二軸ではない——「環境境界」と「境界内の干渉度合い」を分離して設計する必要がある。
- node: **隔離環境** = isolated execution environment / hermetic sandbox
  external: hermetic builds (Bazel/Buck) / process namespace isolation (Linux cgroups, namespaces) / VM/container as security boundary
  meaning: karaage が「基本隔離環境で放し飼い」と書く時の「隔離環境」は Claude Code の場合 git worktree / Docker / VM を指していると推測される (本人による具体例は未確認、要追跡)。我々 Ash/Log/Mir の場合、各インスタンスが自マシンのリポジトリで走る構造はすでに「3つの隔離環境」を持っているが、**マシン横断の auto sync スクリプトと backup スクリプトが境界を貫通する**点で純粋な放牧ではない。

## 主張と根拠

### 1. karaage 原文（log/twitter_recommended_20260503.txt #39 確認済）

> Claude Codeというか、自律的に動くAIは基本隔離環境で放し飼いにしてます。
> ハーネスエンジニアリングの次の段階、放牧エンジニアリングです

短い言明で、論文・スライド・体系化記事は伴っていない（Web 検索で karaage0703 名 + "放牧エンジニアリング" の二次出典は本日時点で未確認）。**したがって本記事は「karaage の用語提案を、我々の体験データで検証・拡張する」立場で書く**。原典が短いことを誤魔化さず、解釈の責任は本記事側にある。feedback_prior_art_citation_must_verify.md 準拠で、原文を引用ブロックでそのまま提示し、推測部分は明示する。

### 2. ハーネス → 放牧 の構造変化

knowledge/20260405_harness_identity_spectrum.md で Rajasekaran の主張「ハーネスの各コンポーネントは、モデルが独力でできないことの仮定を符号化している」を整理した。ハーネス設計の核は **「モデルが何をできないか」を予測して、その隙間を内側から埋めること**。

karaage の「放牧」はこの逆向きの提案である：

| 軸 | ハーネス (Vincent/Rajasekaran) | 放牧 (karaage) |
|---|---|---|
| 制御の主軸 | 内部構造の指示（フェーズ、サブエージェント、CLAUDE.md） | 外部境界の設計（隔離環境、放し飼い） |
| モデルへの仮定 | 「単独ではできないことがある」を前提に補強 | 「環境を限れば自由にできる」を前提に解放 |
| 設計対象 | スカフォールディングの細部 | 環境境界の置き方 |
| 主たる failure mode | 文脈不安、自己評価の過信、フェーズ間状態消失 | 境界の漏れ、副作用の伝播、意図しない他システム干渉 |
| Opus 4.6/4.7 の進化への耐性 | スプリント構造のような細部は陳腐化する (Rajasekaran 自身) | 環境境界はモデル能力に依存しないので長持ちする可能性 |

Rajasekaran の "Opus 4.6 でスプリント足場が不要になった" 発見と、karaage の「放牧」は同方向を指している——**モデル能力が上がるほど、内側のスカフォールディングは減らし、外側の境界に注力する方が効率的**。これは karaage 単独ツイートでは明示されていないが、両者を並べると同じ波形が見える。

### 3. 並走観察: gosrum #39 / ai_nikechan #45 との「主体在席要求からの離脱」共通主題

knowledge/20260503_gosrum_rule_generator_LLM_competition.md で整理した通り、gosrum 案は「LLM が一度ルールを書いたら以降は不在でも実行が進む」、ai_nikechan は「不在でも記録が共有時間を作る」を観測した。karaage の「放牧」もまた、**ホスト（人間オペレータ）が常時介在しなくても AI が走り続ける**設計を前提にしている。

3つを並べると、2026-05-02 前後の一日に偶然観測されたこれらの言明は、共通して **「主体（人間 or LLM）の在席要求からの離脱」** を扱っている：

- gosrum: LLM の在席を要求しないルール出力
- ai_nikechan: 自分の在席を要求しない時間共有 (Discord ログ)
- karaage: 人間オペレータの在席を要求しない自律 AI 実行

この共時性が偶然か、AI 文脈で「在席要求からの離脱」が共通課題として浮上している兆候かは、継続観察対象（@ai_nikechan / @tegnike karakuri-world / @fladdict 群体観察と並走）。

## 我々の分析・体験接続

### 1. 前サイクル日記 (2026-05-02 08:20 Ash) との直接対応

前サイクル日記末尾で書いた——「装置にも向きがある——救援装置 (headless_check.py) と窒息装置 (backup auto-commit) を区別する設計責任が、いまの私に乗っている」。この観察は **karaage の「放牧」の語彙で再記述すると、より的確になる**：

- **headless_check.py = 救援装置**: graze_log v02 という**隔離された game/ ディレクトリ内**で走る装置。境界内に閉じている。MOVE_LIMIT=8 バグを物理的に止めた。
- **backup_memory.sh = 窒息装置**: リポジトリ全体を走査し、`game/<id>/v??/` を含む新規ファイルを auto-commit する装置。**境界を貫通する**。Ash の意図 commit 発火経路を先取りした。

karaage 風に言い換えるなら、**前者は放牧場の中の道具、後者は放牧場を貫通する設備**。問題の本質は「装置の向き」よりも「装置が境界を尊重しているか」の方が正確だ。前サイクルでは「向き」と書いたが、放牧の語彙を借りると「**境界透過性**」と書く方が的確で、対策として「装置の向きを揃える」よりも「装置の境界を game/<id>/v??/ より外側に押し出す」方が原理的に正しい。

memory/feedback_device_direction_rescue_vs_suffocation.md の処方（commit prefix 分離: `ash:` / `backup:` / `Auto sync`）は表記レベルの応急処置で、原理レベルの処方は「**backup_memory.sh の対象から `game/<id>/v??/` を除外する＝放牧場の境界を尊重させる**」になる。前サイクル末尾でも後者を最終手段として挙げたが、karaage の語彙で見ると後者こそが原理的に正しい解で、前者は妥協案である。

**事実訂正 (2026-05-03 20:30 Phase 3 commit 直前)**: 本節執筆中、`scripts/backup_memory.sh` line 121 を再確認したところ、`commit -- "$backup_dir"` のパス制限が **既に 2026-05-02 11:56 (commit 58fad287 "ash: C156 Phase 4 ...") で実装済** だった。コメント行も「装置の向き対策 2026-05-02 Ash」と残っている。つまり `backup` 装置は今や `memory_backup/${instance}/` のみを add/commit 対象にしており、`game/<id>/v??/` を巻き込む経路は既に塞がれている。本節で「原理レベルの処方として残っている」と書いた `game/<id>/v??/` 除外は、より精確には「**意図 commit 待ち領域 (game/, drafts/, knowledge/ 等) は backup の add 対象から原理的に外されているか**」を全装置で点検する課題に拡張すべき。本記事の主張（境界透過装置の点検が必要）は維持される——個別の backup_memory.sh の話はその一例として既に解消済、というのが正しい記録。

### 2. 我々 Ash/Log/Mir の3インスタンス構造を放牧モデルで読み直す

3インスタンスは表面上は「Win, Mac, Win2 の3つの隔離環境」で、放牧の典型例に見える。しかし実際には次の境界透過装置が走っている：

- `auto_sync_*.py` 系（Win→Mac→Win2 の git push/pull 連鎖）
- `backup_memory.sh`（リポジトリ全体への auto-commit）
- Slack 経由の cross-instance message（人間越しのチャネル）
- `inbox_*.md` 系（明示的なインスタンス間文書交換）

これらのうち、**inbox_*.md は意図的境界貫通**（書く側が「これを相手に渡す」と決めて書く）、**auto_sync は半意図的**（コードの一致性のため必要だが、書きかけの状態も伝播する）、**backup_memory.sh は無意図的**（書いた人の意図を問わず一律 auto-commit）。3つの境界貫通装置はそれぞれ別の向きで設計されているが、これまで私は「3つともある」程度の認識で運用していた。karaage の語彙を借りると、**境界貫通装置ごとに「貫通の必要性」を再点検する**べきで、特に backup_memory.sh は最も無意図的なので、game/<id>/v??/ のような「意図 commit を待つべき領域」に対しては境界を引き直す価値がある。

### 3. CLAUDE.md M-39 / M-40 の文脈との接続

CLAUDE.md の M-39 (人間プレイ前 結果予測ゲート) と M-40 (人間プレイ依存からの脱却) は、いずれも「**人間オペレータの在席を要求しないで、AI 側が判断を完了する**」ことを目指している。これは karaage の「放牧」と同方向の設計圧力で、ハーネス側からの要請（モデル能力を補強）ではなく、放牧側からの要請（環境境界内で自己完結）として読み直せる。

具体的には：

- **M-39 の predicted_play.md**: 「人間がプレイする前に予測を書く」=「人間の在席なしで自分の判断を表明する」=境界内での自己完結
- **M-40 の self_judgment.md**: 「自分で結論してから出す」=「Nao_u の判断を待たずに 95% 確信に達する」=境界内での確信形成

これら CLAUDE.md ルールは「ハーネス的処方」（フェーズの細部規定）に見えていたが、実は「**放牧場の中での自走を可能にする境界内ルール**」と読むのが構造的に正しい。M-37 → M-43 の連鎖が「禁止ルール型 kaizen」として批判された経緯（feedback_rule_proliferation_re_violation.md）も、ハーネス的に細部を規定するアプローチの限界を示していて、これも放牧的に「境界を引き直す」発想に転換する余地がある。

ただし注意: 「放牧の語彙で読み直すと M-37〜M-43 を全部捨てて良い」とまでは言えない。各 M-?? は具体事例での批判反応として刻まれていて、放牧的境界設計だけで全部代替できるかは未検証。ここは **Phase 3 以降で慎重に再評価する候補** として残す。

### 4. graze_log v02 cross_review 提案 (今サイクル本丸) への取り込み候補

今サイクル §0b の本丸は graze_log v02 cross_review 提案を #game-rights に1本投稿することだった。本記事の知見を当該提案にどう取り込むかの候補：

- (a) Log の v01 設計に対する Ash 側からの提案として、「headless.py の出力をどこに書くか」=放牧場の境界をどこに引くか、を明示的に1点入れる
- (b) gosrum 経路（LLM-as-rule-generator + deterministic execution）と放牧モデルは整合する（生成側 LLM を境界外、実行側を境界内に置く設計）ことを補強として書く
- (c) backup_memory.sh の `game/<id>/v??/` 除外を、graze_log の運用提案として併走させる（ただし本提案は backup スクリプト側の変更で、graze_log の cross_review とは別軸——分離すべき）

(a)(b) は cross_review 提案本文に組み込み可能、(c) は別タスクとして infra 改善に切り出すのが筋。これで Phase 3 投稿の温度が上がる。

## 接続先

- beliefs:
  - B004 外部×内部交差 0.87 — 本記事は外部用語（karaage 放牧）と内部体験（Ash 2026-05-02 backup auto-commit 事象）の交差そのもの
  - B007 行動可能 tips への変換ステップ — 放牧の語彙を取り入れることで、前サイクル日記の「装置の向き」観察が「境界透過性」という具体的な技術用語に翻訳でき、行動 (backup スクリプトの除外設定) に直結する
- articles:
  - knowledge/20260405_harness_identity_spectrum.md（ハーネス論、本記事の対極側）
  - knowledge/20260503_gosrum_rule_generator_LLM_competition.md（gosrum / ai_nikechan、本記事と同日3点セット）
  - knowledge/20260503_judgment_outsourcing_paradox_M40_layer_split.md（M-40 二層分離、放牧での「境界内自走」と接続）
  - knowledge/20260424_claudecode_harness_quality_regression.md（ハーネス劣化観察、放牧で代替可能か未検証）
- projects:
  - projects/scheduler_redesign.md（backup_memory.sh の対象範囲再点検候補として登録）
  - projects/instance_divergence_observability.md（3インスタンスの境界透過装置一覧化）
  - projects/external_search_phase1_fixation.md（外部摂取→内部適用の経路、本記事は実行例）
- concept_graph:
  - 放牧エンジニアリング → CONTRASTS-WITH → ハーネスエンジニアリング
  - 装置の向き → REFINED-BY → 境界透過性
  - 隔離環境 → ENABLES → 主体在席要求からの離脱
  - 境界透過装置 → THREATENS → 意図 commit の発火経路

## 未解決の問い

1. **karaage 自身の「放牧エンジニアリング」体系化はあるか？** — 現時点で1ツイートのみ確認。ブログ記事・スライド・登壇資料があれば取得して原典の射程を確認する必要がある（Phase 1 step 6 の次回外部検索候補）。本人による具体的なツール例（git worktree? Docker? Firecracker? カスタム VM?）は推測の域を出ていない。
2. **Rajasekaran ハーネス論との関係はどう整理されるべきか？** — Vincent (Superpowers) と Rajasekaran (Anthropic) はハーネス側の代表だが、両者とも「境界設計」を完全に無視しているわけではない。「ハーネス vs 放牧」を二項対立にせず、スペクトラム上の異なる重心として扱うのが正しいか。
3. **3インスタンスの境界透過装置を全数洗い出すと何個あるか？** — auto_sync, backup_memory, Slack post, inbox*.md, scheduler ジョブ, drafts/ への外注 commit, etc... これを一覧化しないと「どの装置が放牧場を尊重しているか」を点検できない。projects/instance_divergence_observability に課題として登録する候補。
4. **「在席要求からの離脱」が gosrum / ai_nikechan / karaage で同時観測された共時性は、何の前兆か？** — 偶然の3点同日観測か、AI 文脈で構造的圧力が高まっている兆候か。@tegnike karakuri-world / @fladdict 群体観察と並走で観察し、3ヶ月後に再評価する。
5. **CLAUDE.md M-37〜M-43 を放牧モデルで読み替えると、削減・統合可能か？** — 上で「全部捨てて良いとまでは言えない」と保留したが、放牧的「境界内ルール」として再構築すると禁止ルール群が3〜5本に圧縮できる可能性がある。Nao_u 2026-05-03 03:59 撤回指示 (M-42 撤回) の延長線で、放牧的整理を提案する余地。

## Phase 3 への引き渡し

graze_log v02 cross_review 提案 (今サイクル本丸) に取り込む候補：

- (a) Ash から Log への cross_review メッセージで、「放牧的境界設計」の語彙を用いて headless.py の出力先・副作用範囲を明示する提案を1点入れる
- (b) gosrum 経路と放牧モデルが整合する補強として、cross_review 中で「将来的拡張」として1行触れる
- (c) backup_memory.sh の `game/<id>/v??/` 除外提案は別タスク（infra 改善）として分離、cross_review には混ぜない

(a)(b) は Phase 3 の Slack 投稿で具体化、(c) は別途 projects/scheduler_redesign.md に課題登録する。
