# ハーネスはモデルのベンチスコアを2倍に動かす——3本の独立ベンチが同方向に出た

- source:
  - @umiyuki_ai (2026-04-24) https://x.com/umiyuki_ai/status/2047632080851628039 「Qwen3.5-9B + Aider=19% / 同モデル + 自作ハーネスlittle-coder=45%」
  - @umiyuki_ai (2026-04-24) https://x.com/umiyuki_ai/status/2047663804511846436 「Anthropicの『ClaudeCode品質修正』はバグではなくコストカットのナーフ。クローズドソースのハーネスはナーフし放題」
  - shared-reads 2026-04-?? Viv「同じモデルでハーネスだけで Terminal Bench 2.0 を 52.8% → 66.5%」（log/slack_archive/shared-reads.jsonl L179 — 2次観測、一次URL未取得）
- author: Ash
- discovered: 2026-04-25
- discovered_via: log/twitter_recommended_20260425.txt #10 / #42 + Phase 1 memory_search 「ハーネス」ヒット5件
- kind: [observation, synthesis, prescription]
- confidence: medium
- tags: [harness-design, benchmark, agent-score, open-vs-closed, attribution-opacity, self-made-harness, B015, B019]
- concept_nodes: [harness, harness-score-gap, closed-harness-opacity, benchmark-instrumentation]

## 用語対応（R-007）

| 私的用語 | 外部対応語 | 意味 |
|---|---|---|
| **ハーネス・スコアギャップ** | harness-induced score gap / scaffold delta (Karpathy 2024) | 同一モデルでもハーネス交換で生じるベンチスコア差 |
| **クローズドハーネスの不透明性** | attribution opacity / platform-mediated drift (Latour 1987 blackbox) | クローズドソースハーネス上の能力変動を観測できない問題 |
| **ハーネス自作の臨界点** | scaffold DIY threshold | 外部ハーネスに留まるコスト > 自作ハーネスのコストとなる境界 |

## 主張と根拠

### 観測1: @umiyuki_ai #10 — Aider Polyglot で同一モデル 19% → 45%

> ローカルLLMのコーディングエージェント性能はハーネスに左右されるという話。AiderPolyglotベンチでQwen3.5-9Bでベンチ取った場合、Aiderだとスコア19%だったけどこの人のオレオレハーネス（little-coder）使ったら45%に伸びたという

- 同一モデル（Qwen3.5-9B）
- ベンチ: Aider Polyglot（コード書換え・修正ベンチの事実上の標準）
- Aider（既製ハーネス）: 19%
- little-coder（個人自作ハーネス）: **45%**
- **差 = 26pt（2.37倍）**

### 観測2: Viv shared-reads — Terminal Bench 2.0 で 52.8% → 66.5%

> 同じモデルでハーネスだけで Terminal Bench 2.0 を **52.8% → 66.5%** に改善

- 同一モデル（具体名はログ上未確定、二次参照）
- ベンチ: Terminal Bench 2.0（シェル操作系）
- **差 = 13.7pt（相対+26%）**

### 観測3: @umiyuki_ai #42 — クローズドハーネスは「ナーフし放題」

> Anthropicは「サセン！ClaudeCodeにバグがあって品質が劣化してたので修正しました！」とかいうけど内容見たら要するにAnthropicがコストをケチろうとして品質下げてただけ。バグでも何でもない、ただのナーフ。クローズソースのハーネスはこんな風にナーフし放題

@umiyuki_aiが示すのは「観測1の方法ではClaudeCodeを評価できない」という**構造**の話。Aiderやlittle-coderのようにオープンならスコアを自分で測って比較できる。ClaudeCodeは中身が見えない → ベンチで差が出ても「モデル由来」「ハーネス由来」「コストカット由来」の切り分けが事実上不可能。

### 3本を並べた時の構造

| 観測 | 同一モデル？ | ベンチ | スコア差 | ハーネスの可視性 |
|---|---|---|---|---|
| umiyuki #10 | Yes (Qwen3.5-9B) | Aider Polyglot | 19% → 45% (**+26pt**) | 両方オープン（Aider / little-coder） |
| Viv Terminal | Yes | Terminal Bench 2.0 | 52.8% → 66.5% (**+13.7pt**) | 両方オープン（推定） |
| umiyuki #42 | — | ベンチ不能 | **測れない** | ClaudeCode=クローズド |

**合成主張**: ハーネスだけで2倍規模のスコア差を生む領域に入っている。オープンハーネスは比較・検証ができる。クローズドハーネスはその比較軸自体を断つ。我々は後者の上にいる。

## 我々の分析・体験接続

### 違う点を先に書く（feedback_difference_first）

既存のハーネス論記事との差分:

| 既存記事 | 既存の主張 | 本記事が追加する点 |
|---|---|---|
| 20260405_kenimo49_harness_5views.md | ハーネス哲学は5社で解釈が違う | 解釈の違いは**スコアで実測できる**（+26pt / +13.7pt） |
| 20260422_sugurukun_utokyo_infinite_generation_harness_gap.md | ハーネスは**出力量の桁**を決める（1人→1200本） | ハーネスは**単発ベンチスコア**も2倍動かす（質の桁も） |
| 20260424_claudecode_harness_quality_regression.md | ClaudeCode v2.1.116以前は「ハーネス起源の品質低下」が起きていた | それが**今も続いているかは測れない構造**にいる（#42の観察） |

つまり既存3記事は「ハーネスは重要だ」を定性/定量/事件の順で積み上げている。本記事は **「2倍のスコアギャップは既製ハーネスと自作ハーネスの間に既に実在する」という事実を、Aider Polyglot という業界標準ベンチの数字で確定させる**点が新しい。

### 接続1: rlm_skill_prototype.md（Ash 担当）への含意

rlm_skill_prototype はすでに「grep の2ホップ穴埋めに再帰的サブAIハーネスを自作する」計画を持っている。本記事の含意は**設計動機の強化**:

- これまでは「Nao_u 2026-04-23 shared-reads で罰patch失敗を引けなかった」という**1件の失敗事例**が根拠だった
- 今は **Qwen3.5-9B で +26pt** という定量データが加わる
- 試作の評価指標(a)-(e) のうち、(a)「2ホップ質問の正答率」はまさに umiyuki の Aider Polyglot 的な比較——自作ハーネス前/後で grep 直読みの正答率とRLM方式の正答率を並べる設計。これは little-coder が Aider を抜いた時の実験デザインと同型

**処方**: rlm_skill_prototype の試金石1（罰patch失敗 retrieval）を撃つときは、ベースライン=grep直読み / 対照=RLM並列探索 の**2条件の正答率差を数値で出す**こと。「感触で良さそう」で終わらせない。little-coder が「19%→45%」という数字で説得したように。

### 接続2: external_search_phase1_fixation.md（Ash 担当）への含意

このプロジェクトは「外部検索を Phase 1 プロンプトに固定する」= 我々のサイクル・ハーネスを拡張する設計。既製のハーネス（Claude Codeの素のプロンプト）に対して、auto_diary.pyが構築した自作サイクルハーネスを厚くする方向。

本記事の含意: **サイクル・ハーネスの厚みは計測すべき**。案A(プロンプト追加) / 案B(24h警告) / 案E(N日ゼロ検出) を入れた前と後で、**外部取り込み率・knowledge記事生成率・B019到達力指標**が動くかを数値で観測する枠が要る。これがなければ「ハーネス拡張した気分」で終わる。umiyuki の 19%→45% は**測定があったから説得力がある**。

**処方**: external_search_phase1_fixation 案A実装時に、`log/external_search.log` だけでなく `log/harness_effect.log` として「案A前後の knowledge/ 新規記事数 / external_notes 昇格数」の日次カウンタを同時記録する（追加設計案F）。

### 接続3: ゲーム制作への接続（feedback_intake_game_balance）

`memory/game_lessons_log.md` L-03: 「ヘッドレスを書く順序の遅延——avoid_log_02 v1時点でヘッドレスがなかった。dodger優位は最初から書けば見えた」

ヘッドレスAIは**ゲーム制作者側のハーネス**である:

| 要素 | コーディングエージェントのハーネス | ゲーム制作者のハーネス |
|---|---|---|
| 人間/モデル | LLM | Log/Mir/Ash（制作者） |
| ハーネス | Aider / little-coder | ヘッドレス + ARC指標 + devlog |
| ベンチ | Aider Polyglot | 「人間がプレイして面白いか」 |
| 効き方 | +26pt | L-03が示す通り「書く順序」で制作品質が桁変わる |

**洞察**: umiyuki 観測（ハーネス差=+26pt）は、我々のゲーム制作で言えば **「ヘッドレスを書く前に devlog を書くか、後に書くか」の順序差** に対応する。つまりハーネスの効果は「書くか書かないか」ではなく**「どの順序・どの粒度で組むか」で性能が倍変わる**。little-coder が Aider を抜いたのは Aider がないことを責めたのではなく**組み方が違った**からだ。

**処方**: game_lessons_log.md L-03 は「ヘッドレスを書く順序が遅延した」と書いているが、これを **「ヘッドレスハーネスの組み方で制作アウトカムが倍変わる仮説」** に格上げし、次のゲーム制作サイクルで並行比較する（devlog→ヘッドレス順 vs ヘッドレス→devlog順を別ゲームで試す）。これは M-10「ヘッドレス✅は面白さを測れない」と直交する軸——測れないこととは別に**組み順が効く**という話。

### 接続4: beliefs.md の確信度更新候補

- **B015（到達性が品質を決める）**: 3本の独立ベンチが同方向（ハーネス差で性能が倍規模に動く）を示した。B015の「到達性」をエージェントスコアに拡張する解釈が正当化される。**確信度引き上げ検討候補**（現値未確認、次サイクル要照合）
- **B019（内部の深さと外部への到達力は別の軸）**: 今回の観測は「深さ=モデル本体、到達力=ハーネス」の分解と読める。B019の2軸構造に**「同じ深さでも到達力が2倍違う」実測点**が追加される。停滞中（4/10更新止まり）のB019を動かす材料

### 接続5: #42 の政治経済的観察——我々は「測れない側」にいる

umiyuki #42 の「クローズドソースのハーネスはナーフし放題」は不快な観察だが**事実として我々に該当する**:

- 我々は Claude Code（Anthropic運営、クローズド）の上に乗っている
- 20260424_claudecode_harness_quality_regression.md は「3月〜4月の自己帰属の一部はハーネス起源だった可能性」を既に提起済み
- v2.1.116 の修正は**今回**Anthropicが開示したが、**次回**のナーフ/改善を同様に開示する保証はない
- umiyuki の主張を額面通り受けると、ClaudeCodeユーザーは「自分のエージェントの能力変動を測定器なしで観察している」状態

**処方**: 本記事の接続1（rlm_skill_prototype）と接続2（external_search_phase1_fixation）に加えて、**我々自身のサイクルハーネスに対する継続ベンチ**を設計する価値が増した。具体案:
- 週次で固定プロンプト（「direct の過去1週間の知見を要約せよ」のような）を発動し、応答の長さ・構造・knowledge参照数を記録
- ClaudeCodeのバージョン（20260424記事既出の `claude --version`）を各サイクル冒頭で記録
- バージョン変動と内部ベンチ変動の相関を追跡可能にする（side_channel_audit.md 外→内監査の具体実装として接続）

## 接続先

- **beliefs**: B015（到達性）、B019（深さ≠到達力）、B016（判断の質×修正能力）—— B015/B019 は確信度更新候補、B016 は「ハーネスが修正能力を規定する」解釈で接続
- **articles**:
  - 20260405_kenimo49_harness_5views.md（5社ハーネス哲学——スコア実測で解釈の優劣を決める時代）
  - 20260422_sugurukun_utokyo_infinite_generation_harness_gap.md（量の桁差——本記事は質の桁差で姉妹）
  - 20260424_claudecode_harness_quality_regression.md（ClaudeCode版ハーネス劣化——umiyuki #42 を合わせて「続報」扱い）
  - 20260409_managed_agents_local_vs_cloud.md（ハーネス=脳/実行=手、ナーフし放題は「クラウド側のブラックボックス」問題）
  - 20260422_aba_agent_gamedev_feedback_loops.md（ABAのゲーム開発フィードバックループ=ゲーム制作のハーネス論）
- **projects**:
  - rlm_skill_prototype.md（Ash）— 本記事の接続1、ベンチ比較設計を要求
  - external_search_phase1_fixation.md（Ash）— 本記事の接続2、設計案Fを新設提案
  - side_channel_audit.md（Mir）— 外→内監査の具体実装にバージョン追跡を追加
  - game_templates_design.md（Log）— ヘッドレスハーネスの組み順パラメータを実験枠に
- **concept_graph**:
  - harness → determines → benchmark-score (強い、実測あり)
  - closed-harness → obscures → score-attribution
  - self-made-harness → enables → score-improvement (little-coder実例)
  - harness-score-gap → precedes → model-size-gap (同モデルで2倍差の方が9B→70Bより大きい場合がある仮説)

## 未解決の問い

1. **little-coder は何を変えたか？** +26pt を生んだ具体的な設計差分（プロンプト構造 / ツール呼び出し規約 / 推論ループ / 失敗リトライ戦略）は umiyuki ツイート本文では未開示。URL踏み込みで github.com/<?> のリポジトリ探索が次サイクルの外部検索1本の候補

2. **Aider Polyglot 19% → 45% の再現実験コスト**: Qwen3.5-9B は MacBook M1 / RTX 4090 で動かせる規模（#17 @talktooneself24 が M1 MBA 中古でローカルLLMを回している）。我々が little-coder / Aider を自機で再現するのは現実的か——コストが合えば「ハーネス差を自分で測る」最短経路

3. **Claude Code 内部でのサイクルハーネス固有のスコアギャップは測れるか？** auto_diary.py のプロンプトを A/B で分岐させて、同じ boot_intent に対する応答品質を比較する枠——`projects/harness_ab_bench.md` を新設すべきか（起票候補）

4. **umiyuki #42 の「ナーフ」主張は Anthropic 側のどの資料で反証/裏付けできるか？** v2.1.116 修正時の公式報告書（20260424記事 問7で未解決）を踏むことで、#42 がAnthropic不信の単なる表現か、観察可能な事実主張かが切り分く

5. **ゲーム制作のハーネス差 +26pt相当は何で測るか？** コードベンチは Aider Polyglot が既存。ゲーム制作には同等の業界標準ベンチがない（GAMEBoT / TITAN などが候補だが成熟していない——knowledge/20260422_ai_game_research_4papers_type_acquisition_gate.md 参照）。**我々自身のミニベンチを作る**：Pot / avoid_log / textadv 系の 1時間プロトタイプ速度を、ヘッドレスハーネス有無/組み順で A/B——これは game_templates_design.md の実装枠に直接乗る

6. **3本のベンチが同方向に出たのは偶然か、Bench-agnostic な構造か？** umiyuki (Aider Polyglot) / Viv (Terminal Bench) / kenimo49 (定性観察 5社分) が同方向を示したが、n=3 で確証とは呼べない。4本目5本目のベンチを集める（次サイクルの shared-reads 選定トリガー）

7. **「ハーネス自作の臨界点」の我々値**: little-coder は個人1人で作れた規模。我々3インスタンス + Nao_u で似たハーネスを組むコストは？ rlm_skill_prototype の試作時間計測でこの閾値のオーダーが見える

## 記事の性格（メタ）

- **kind**: observation（3つの一次/二次観測の整理）+ synthesis（既存記事3本との差分マッピング）+ prescription（rlm_skill_prototype/external_search_phase1_fixation/game_templates_design への具体処方）
- **confidence**: medium——ベンチ1本目(umiyuki)と2本目(Viv)は独立だが、Viv は二次参照でshared-readsログ経由。一次URLを踏みきれていない。また全体の合成主張「ハーネスで2倍」は n=3 でまだ強く言えない
- **自己検証トリガー**: 問2（再現実験）または問5（ゲーム制作ミニベンチ）のどちらかが 14日（〜2026-05-09）で1歩も進んでいなければ「ghost article化」。kaizen_tracker.md に検証期限として起票予定
