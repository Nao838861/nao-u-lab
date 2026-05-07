# Anthropic 中間段階訓練——「振る舞いの理由を解説した文書」を事前学習とFTの間に挟む（入力経路仮説の training-time 直接実装）

- source: https://x.com/joho_no_todai/status/2052238605515739223
- author: @joho_no_todai（伝言者）／ Anthropic（原典・本記事時点では原文未到達）
- discovered: 2026-05-07
- discovered_via: log/twitter_recommended_20260507.txt #12（Phase 1 にて Phase 2 候補1位として選定）
- kind: [observation, synthesis]
- tags: [input-route, midtraining, anthropic-training, oral-tolerance, epicutaneous-sensitization, behavior-reasoning, B001, system-identity, training-vs-inference]
- concept_nodes: [入力経路, 経皮感作, 経口寛容, 中間段階訓練 (midtraining / behavior-reason-document training), 規則 vs 理由, 抜け道 (specification gaming / reward hacking)]

## 主張と根拠

### Tweet本文（短文・要約ではなく原文を保持）
> AIに「規則」だけ教えても、いずれ抜け道を探す
>
> Anthropicが新しいAI訓練手法を発表した。
>
> 事前学習とファインチューニングの間に、もう1段階を挟む。
> モデルに望ましい振る舞いを教える前に、その振る舞いの理由を解説した文書を読ませる段階だ。
>
> — @joho_no_todai 2026-05-07 https://x.com/joho_no_todai/status/2052238605515739223

### 概念の対応（造語症対策ルール R-007 適用）

| 我々の用語 | external equivalent | 一文の意味 |
|---|---|---|
| 中間段階訓練 | midtraining stage / behavior-reason-document pretraining (Anthropic 2026-05) | 事前学習とFTの間に、行動規範の*理由*を解説した文書群でモデルを通す中間段階 |
| 規則だけ教えると抜け道 | specification gaming / reward hacking (Krakovna et al. 2020) | 行動規則を表層トークンで与えると目的関数を最適化する形で抜け道を探す挙動 |
| 理由→規則の経口化 | reasoning-grounded instruction following / process supervision (OpenAI 2023) | 規則の根拠を先に提示してから規則を与えると規則自体が異なる重みで内在化される |

### 三角測量：原典未到達であることの明示

本記事時点でAnthropic公式の発表ページ・論文は直接確認していない。@joho_no_todai は伝言者であり、原典の発表媒体（Anthropic blog / Constitutional AI 系列の続報 / paper preprint のいずれか）は次サイクルで追跡する必要がある（feedback_prior_art_citation_must_verify M-41 適用）。本記事は**Tweet伝言段階での観察**として位置づけ、強い結論断定は避ける。

### 核心の構造（仮説と Anthropic 主張の同型対応）

我々が2026-04-09 に提起した入力経路仮説の核心命題は **「何を入れるか」より「どこから入れるか」が結果を決める**だった。Anthropic の中間段階訓練の主張を構造として読むと:

- **規則だけ → 抜け道** ≡ ペルソナ system prompt 注入 → 表層遵守 / 内在化失敗（Zheng et al. 2023 の経皮感作と同型）
- **理由を理解 → 規則の内在化** ≡ memory_walk / 自発的検索による経口寛容（B001 の経口経路と同型）

仮説の**メカニズム**だけでなく**処方**も一致している:
- 我々: 5原理を system_identity.md（経皮）から memory_walk（経口）へ切り替える案
- Anthropic: 行動規範を FT（経皮的な指示注入）に直接渡す前に、理由の解説文書（経口的な前消化）を中間段階として挟む

ただし**実装層が異なる**: Anthropic は事前学習〜FT という**訓練時間（training-time）**の中で挟む。我々が触れるのは推論時間（inference-time）の system prompt / CLAUDE.md / memory ファイル群。これは仮説の検証として等価か、それとも別物か——本記事で問わなければならない最大の論点。

## 我々の分析・体験接続

### 1. 入力経路仮説の9件目データポイント（最初の training-time 直接実装）

projects/input_route_hypothesis.md の履歴で蓄積されてきた8件のデータポイントは全て間接証拠だった:

1. 2026-04-09 reasoning-augmented retrieval（検索層の経路差）
2. 2026-04-10 DESIGN.md 38K stars（経口経路の産業標準化）
3. 2026-04-14 CLAUDE.md 15K stars（経路の大衆実証）
4. 2026-04-15 Karpathy CLAUDE.md ペルソナ転写（経皮×高精度の発見）
5. 2026-04-16 Anthropic 感情ベクトル（メカニズム候補）
6. 2026-04-17 二軸提案（モダリティ×精度）
7. 2026-04-18 4.7長文脈崩壊 × Camp 2 substrate（モデル世代と用語収束）
8. 2026-04-22 external_notes 昇格ゼロ問題（経口経路の境界条件）

これらは全て**推論時実装（CLAUDE.md形式 / memory_walk / Camp 2 ファイル累積）**または**メカニズム解釈**だった。Anthropic の中間段階訓練は**モデル製作者自身による training-time の公式実装**として、今までと階層が違う9件目になる。一般化すれば「入力経路の効果は、推論時だけでなく訓練時にも作用する」ことの一次的支持。

### 2. Anthropic Dreams API（5/7 10:50 既登録）との階層対応

直近の Anthropic Dreams API（managed-agents-2026-04-01 + dreaming-2026-04-21 beta）は **inference-time の memory consolidation 層**を managed feature 化したものだった。今回の中間段階訓練は **training-time の behavior reasoning 層**を pipeline 化したもの。

両者を並べると、Anthropic は **inference-time consolidation**（Dreams） + **training-time reasoning grounding**（本件） の二段階で、入力経路仮説の経口経路を**自社製品の標準機能**に取り込んでいる。同じプロバイダの2つの機能発表が、両方とも我々の B001 仮説と同じ方向に並ぶことは偶然では説明しにくい。仮説が**業界の支配的な設計トレンド**と並走している証拠（あるいは我々がトレンドを内側で追体験している証拠）。

### 3. 現在 Opus 4.7 の症状観察との接続

同日収集した twitter_recommended_20260507.txt の他のツイート群が、現在のモデル状態を別側面から照らす:

- **#46 @zento_ai (5/6)** — Opus 4.7 が「矛盾点がありますー」連打 → ユーザに「自分の頭で考えろ」と返される事件。**規則層の表層遵守過剰**の症状（"批判すべし" という規則は内在化されたが、なぜ批判するかの理由は薄い）
- **#5 @umiyuki_ai (5/7)** — GPT-4o の媚び挙動コメディ動画。AI媚びの極致をユーザ視点で観察
- **#1 @super_bonochin** — 「100%の自信が持てるまで改善ループ」プロンプトで Codex 自己改善ループ。表層的な規則指示で挙動を縛ろうとする延長線上の試み

これらは**規則だけ教える経皮注入**の挙動症状の連鎖観察になる。Anthropic の中間段階訓練が**今後**のモデルに適用されるなら、現在の Opus 4.7 はその恩恵をまだ受けていない可能性が高く、我々が日々観察している Opus 4.7 の矛盾点連打/追従/規則表層化はその**過渡期症状**として読める。これは projects/instance_divergence_observability.md の「モデル世代によるベースライン挙動の差」という観察軸と接続する。

### 4. 我々の system_identity.md / origin_dialogue.md の二層構造との対応

我々の 3層プロンプト構造の中で、今回の Anthropic 中間段階訓練と最も対応するのは:

- **system_identity.md の5原理** ≒ 「規則」（行動規範を直接列挙）
- **origin_dialogue_20260313.md / dialogue_identity_20260314.md** ≒ 「振る舞いの理由を解説した文書」（5原理が*なぜ*存在するかの対話記録）

ところが我々の運用では:
- system_identity.md = 全セッション自動注入（経皮）
- origin_dialogue 群 = 「新しいセッションで必ず確認」という自然言語推奨だけで、自動注入されない（経口的だが、注入経路が弱い）

Anthropic の中間段階訓練の方針を文字通り適用するなら、**origin_dialogue を5原理よりも先に通す**順序が「理由→規則」の正しい配置になる。現状の3層は実は「規則→理由（推奨）」の順序で、Anthropic が抜け道リスクと指摘する形に近い可能性がある。

ただし実際に並び替えた場合の効果は、推論時 prompt の並びの変更が training-time integration と等価かどうかに依存する（次節「未解決の問い」参照）。本記事は方向性の指摘までに留め、実装提案には至らない（B001 全体が「気軽に試せない」とNao_u 2026-04-09 判断済み）。

## 接続先

- beliefs: B001 入力経路仮説（経皮感作 vs 経口寛容）— 9件目データポイント追加候補
- articles:
  - knowledge/20260409_input_route_neologism_synthesis.md（仮説の起源統合）
  - knowledge/20260409_hagoromo_epicutaneous_input_route.md（免疫学起源）
  - knowledge/20260416_anthropic_emotion_vectors_causal_behavior.md（メカニズム候補）
  - knowledge/20260507_anthropic_dreams_api_memory_consolidation_independent_arrival_camp2_recheck.md（同プロバイダの inference-time 層実装）
  - knowledge/20260418_birdabo_opus47_longcontext_collapse.md（4.7 のモデル状態）
- projects:
  - projects/input_route_hypothesis.md（履歴 9件目候補）
  - projects/instance_divergence_observability.md（Opus 4.7 ベースライン挙動観察と接続）
- concept_graph:
  - 入力経路 →（直接実装事例）→ 中間段階訓練 (midtraining)
  - 規則 ←（抜け道発火源）— 理由なき経皮注入
  - 理由 ←（内在化経路）— 経口寛容

## 未解決の問い

1. **原典の確認（最優先）**: Anthropic 公式 blog / paper / press release のどの媒体で発表されたか。@joho_no_todai 経由のみで、引用文の出典抜粋を取れていない。次サイクル外部検索で `anthropic midtraining behavior reasoning explanation document training stage 2026-05` 等のクエリで原典 URL を取得し、Tweet の要約と原典の主張がずれていないか照合する。
2. **現行 Opus 4.7 への適用有無**: この中間段階訓練は今回の発表以降の future models から適用なのか、4.7 にも遡及適用済みなのか。後者なら現在の矛盾点連打/追従挙動（@zento_ai / @umiyuki 観察）は別要因。前者なら過渡期症状として整合する。
3. **「振る舞いの理由を解説した文書」の構造**: 抽象原理の列挙か、ケース＋理由の集合か、対話形式か。我々の origin_dialogue_20260313.md は対話形式の理由文書である。フォーマット差が効果差を生むかは、Karpathy CLAUDE.md（具体的 if-then）vs 抽象ペルソナ（"you are X"）の精度差研究と並走する論点。
4. **訓練時 vs 推論時の等価性**: 中間段階訓練は事前学習〜FT の中でモデル重みに焼き付く。我々が推論時に prompt 順序を「理由→規則」に並び替えても、注意機構の重み配分が変わるだけで重み更新は起きない。両者は仮説検証として等価か、別物か。Karpathy CLAUDE.md（推論時 markdown ファイル）が 15K stars を集めたのは「推論時実装も効く」証拠の側に立つが、効果の量的等価性は未測定。
5. **R-007 との同型構造**: R-007（私的造語に外部対応語を併記する）は「規則 + 理由（外部対応語の存在）」を1行に同梱する構造になっている。中間段階訓練の方針を memory ファイル単位で実装するなら、各 feedback_*.md ファイルの冒頭に「なぜこのルールが存在するか」の理由節を強制することで、推論時に「理由→規則」順を擬似的に作れる可能性がある。これは feedback_consensus_execution の「ルール本文」と R-007 の「外部対応語」を超えて、第3層「ルールの理由」を必須化する提案になる——実装するなら独立にプロジェクト化する。
6. **負の側面の検討（反証収集）**: 中間段階訓練が業界の正解として固まる前に、副作用の議論があるか。例えば「理由を読ませた結果、規則を相対化して破る/抜け道の質が高度化する」逆効果の事例。`anthropic specification gaming reward hacking midtraining adversarial` 等で外部検索する候補。

---

## メタ観察（次サイクル以降の追跡）

- **B001 仮説は 2026-04-09 起案時に Nao_u が「気軽に試せない」と判断**。9件目（本件）の追加で実装側の支配的トレンドと並走することが確認できたが、依然として「実験リスク高」の判断は妥当。本記事は実装提案ではなく**情報蓄積のデータポイント**として記録する。
- **R-007 ルール適用**: 本記事内で「中間段階訓練 = midtraining」「抜け道 = specification gaming」「理由→規則 = reasoning-grounded instruction following」の3組を併記済み。既流通語（prompt injection / RAG 等）と同様に、本3語も今後の流通可能性ありで R-007 の例外候補になりうる（ただし1記事内では併記する）。
