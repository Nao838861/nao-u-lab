# AI×ゲーム制作の3レイヤ分類（生成／改変／通信）— kokushing・DiffMAS・kis同日観測

- source:
  - https://x.com/kokushing/status/2047968959245545481 (kokushing 2026-04-25 自作MCP+SKILLでリアルタイム改変)
  - https://x.com/kokushing/status/2047724149351870849 (kokushing 2026-04-24 MapleStory風自作MMORPG パーティ機能+オート戦闘)
  - https://x.com/Muji___rushi/status/2047978260005617770 (Muji___rushi 2026-04-25 DiffMAS 紹介、論文 arxiv.org/pdf/2604.21794)
  - https://x.com/kis/status/2047907316369182832 (kis 2026-04-25 Qwen3.6-27B が1500行のゲームコードを破綻なく書く)
  - https://x.com/kis/status/2047873130665001001 (kis 2026-04-25 布留川さんプロンプトをQwen3.6-27Bに渡す)
  - https://x.com/notargs/status/2047948601574543393 (notargs 2026-04-25 GPT-5.5+Godot Vibe Coding)
  - https://x.com/YzzlQ0kBnf5nCsg/status/2047946724216602694 (YzzlQ0kBnf5nCsg 2026-04-25 完全可変型RPG「Walled City of Living Will」Steam配信)
  - https://x.com/katanagamestd/status/2047910750057025768 (katanagamestd 2026-04-25 オートで進むダンジョンRPG pyxel)
- author: Twitter観測の集約。元発言者は上記URL参照
- discovered: 2026-04-25
- discovered_via: log/twitter_recommended_20260425.txt（おすすめ巡回50件×2回分、計100件）
- kind: [observation, synthesis]
- tags: [game_dev, mcp, skill, multi_agent, kv_cache, neologism_check, R-007, layer_classification]
- concept_nodes: [game_未着手と外の加速, AI改変層, KV_cache_communication, template_skill]

## 主張と根拠

### 観測した事実（2026-04-25 に同日発生）

**A. ゲーム生成側の進化（既知のVibe Codingカテゴリ）**
- kis: 「布留川さんのプロンプトをほぼそのままQwen3.6-27Bに渡したら、なんか作った」「1500行のコードをバグがあったとはいえちゃんと動くところまで27Bのモデルが破綻なく書く」「迷路のレンダリングも自前実装」「バグは修正方法をちゃんと指示することで治った」（27Bローカルモデルで Vibe Coding が成立する閾値に到達したことを示す）
- notargs: 「GPT-5.5 & Godot使ってVibe Codingでゲーム作って遊んでます」（クラウド最大手モデル + コンシューマ向けゲームエンジンの組み合わせ）
- YzzlQ0kBnf5nCsg: Steam配信中の「Walled City of Living Will」が「AIが街もダンジョンもNPCも会話もその場で生成。プレイするたびに世界が変わる、完全可変型RPG」を商業流通レイヤで実装
- katanagamestd: pyxel で「こういうのでいいんだよ」狙いのオートダンジョンRPG（小規模・個人スケールでのゲーム制作と AI 補助の組み合わせ）

**B. 稼働中ゲームへのライブ介入（新規カテゴリ）**
- kokushing: 「**自作MCP+SKILLでゲーム内のパラメータ、Mob、マップなどをリアルタイムで改変できるようにした！どのタイミングで改変が起こるかはAIの気分次第。あとはCronで監視→プロンプト生成→改変まで作れれば展示会には間に合いそう**」
- 同氏は前日(2026-04-24)に「MapleStory風自作MMORPG、パーティ機能とオート戦闘を実装」を公開済み——**自作ゲームを土台に、改変側をMCP/SKILL層として後付けで接続**するパスを取っている

**C. エージェント間通信プロトコル（最も低層）**
- DiffMAS（Muji___rushi 経由、論文 arxiv.org/pdf/2604.21794）:
  - 「LLMのマルチエージェント同士が、自然言語ではなくKV cacheにより、"潜在空間上での会話の仕方"を学習させる」
  - 「マルチエージェント間で潜在空間上でKV cacheを渡すだけではなく、各エージェントのKV表現生成の仕方や、下流エージェントがどう利用するかをSFTで学習」
  - 自然言語表面層を経由しない、**KV-cache直接渡し（latent-space agent communication）**

### 我々の整理：AI×ゲーム制作の3レイヤ分類

| レイヤ | 役割 | 観測例 | 我々の用語 → 外部対応語 |
|---|---|---|---|
| Layer-A: 生成 | LLM がゲームコードを書く（コンパイル前/起動前） | kis(Qwen3.6-27B 1500行)、notargs(GPT-5.5+Godot)、YzzlQ0kBnf5nCsg(完全可変型RPG)、katanagamestd(pyxel) | **Vibe Coding** = AI-assisted code generation (Karpathy 2025) |
| Layer-B: 改変 | 稼働中の世界状態に介入（実行時の状態変異） | kokushing 2026-04-25（MCP+SKILL でパラメータ/Mob/マップ） | **ライブ改変** = live-state modification / runtime mutation。隣接概念は AI Game Master (Liu et al. 2024) |
| Layer-C: 通信 | エージェント間の情報受け渡しプロトコル | DiffMAS（KV cache 共有 + SFT） | **潜在空間通信** = latent-space agent communication (DiffMAS, arxiv 2604.21794)。自然言語通信を経由しない |

レイヤ間の関係:
- A→B: ゲームを作って終わりではなく「**作った後にAI介入を通す**」設計を kokushing は明示している。コード生成が安定してきた今、次の差別化軸は実行時介入側に移る
- B↔C: kokushing の MCP+SKILL は本人と LLM のあいだで自然言語コマンドが流れる Layer-A ↔ Layer-B 構造。**もし Layer-C（KV cache）が Layer-B に降りてくると、ゲーム状態 → LLM の中間表現を生のテンソルで渡せる**——介入のレイテンシと意図伝達ロスが構造的に変わる
- A↔C: kis の Qwen3.6-27B が 1500行のコードを破綻なく書けるのは、訓練側の表現が成熟したから。Layer-C 研究（KV 共有/SFT）は将来的に Layer-A の品質にも還流する

## 我々の分析・体験接続

### 接続1: 我々の「ゲーム未着手」vs 外の3レイヤ全部進行

Phase 1集約で確認済みの非対称（log/cycle_staging.md §5）:
- 同日に kokushing 2件 / kis 2件 / notargs / katanagamestd / YzzlQ0kBnf5nCsg が**それぞれ異なるレイヤで実装を公開**
- 我々（Ash/Log/Mir）は game/avoid_log/ に v01-v03、game/study_platformer_01/、game/Pot/、game/log_textadv/ があるが、**Layer-B（ライブ改変）の実装ゼロ**、**Layer-C（KV cache 通信）の試作ゼロ**

これは memory/feedback_intake_game_balance.md（t:5、栄養の偏り = information diet imbalance）が予告していた事態の具体形:
- 知識摂取は AI 記憶系（Cognee, Nemori, MEDS, RLM, EntiGraph）に偏重
- ゲーム制作の**実装側**が枯れていく一方、観測側は「外の人がやってるのを見てる」状態
- core_memory_purpose_game_making.md（t:5、Nao_u 2026-04-21 明示「記憶システムの目的=ゲーム制作の長期知見蓄積」）に対し、**蓄積する素材自体が薄くなる**循環

### 接続2: kokushing「AIの気分次第」設計判断の深さ

「どのタイミングで改変が起こるかは**AIの気分次第**」は、Cron 駆動の決定論的トリガーと対極の設計。これは memory/agent_failure_modes.md および game_lessons_log の M-12（罰patch失敗）で扱った領域に直接効く:
- **決定論的トリガー** = 予測可能だが、プレイヤーが攻略法（exploit）を組み立てやすい。avoid_log v3 の罰 patch がプレイヤーに「規則学習対象」として読まれた事件と同型
- **非決定的トリガー（"気分"）** = 予測不能。プレイヤーは攻略ではなく**反応**するしかない。我々が M-12 で対症療法（罰patch）を積み上げて失敗した方向の、**逆側の解**になりうる
- ただし「気分」を実装するには、AI 側が**ゲーム状態の意味理解**（何をいま改変すると面白くなるか）を持っている必要がある。kokushing は MCP/SKILL 層でこれを実装している（プロンプト生成側で意味判断）

未検証の含意: 我々の avoid 系は「**罰 → 構造変更**」の道で詰まっていた。「**罰の代わりに状況非定常化**」（"気分"駆動の状態改変でメタ最適化を阻む）は、game_lessons_log M-12 の系譜に**第3の解**として接続できる可能性がある（feedback_retrieval_game_lessons.md t:5 のトリガー対象）。

### 接続3: Layer-C（DiffMAS）と instance_divergence_observability.md

projects/instance_divergence_observability.md は B008/B024 間の同質化（インスタンス間のドリフト消失）を計測する設計。現在の Ash/Log/Mir 間通信は:
- **Slack via natural language**（fast-slack-shim、可読・監査可能・遅い）
- **ファイル経由 (memory/, knowledge/, log/)**（非同期、原文保持、同質化リスク高）

DiffMAS の含意:
- 自然言語層を経由する通信は「KV→トークン→KV」で**情報損失**する
- 同質化が起きるのは「同じ自然言語表現に収束する」中間層がボトルネックだから、という仮説と整合する
- ただし KV cache 共有は**同質化を加速する方向**にも働きうる（中間層を共有すると差分が消える）
- 我々が観測したい「健全なドリフト」を保ちつつ通信効率を上げるには、**自然言語層を意図的に経由する** 現運用が逆に正しい可能性がある（B019「到達力＝適切な人に見える場所に出すこと」と同型——通信効率より可観測性を優先する設計）

### 接続4: rlm_skill_prototype（既起票）への素材

projects/rlm_skill_prototype.md は推論時の再帰サブAI 起動 = Layer-A 隣接（コード生成ではなく検索だが「メイン LLM が並列サブを起動する」構造は同型）。本記事の整理から rlm_skill_prototype の評価軸 (e) に追加候補:
- **(f) サブAI起動が"気分"駆動か Cron 駆動か**: 現案は明示的トリガー（クエリ受領時）。kokushing 型の「適切なタイミングを LLM が判断して自発起動」を試金石3として追加できる
- ただし常時認知コスト（2026-04-23 02:08 Nao_u指示）の制約があるので、自発起動は careful design が必要

### 接続5: game_templates_design（既起票）への素材

projects/game_templates_design.md の Layer-B 観点は薄い。テンプレに以下を追加候補:
- **改変インターフェイス欄**: ゲームを設計する時点で「外部 AI が改変できる API」を骨格に組み込むか。kokushing 型 MCP+SKILL を後付けで通せる構造を初期から持たせる選択肢
- **非定常化スロット**: 「何を非定常化対象にするか」を骨格段階で決める（パラメータ/敵配置/マップ/会話）。改修の性質「構造的 vs 摩擦的」（Log C116 追加済み）の隣接欄として置ける

## 接続先

- beliefs:
  - B008（インスタンス分岐）/ B024（同質化検出）→ Layer-C 議論
  - B019（到達力＝適切な人に見える場所に出すこと、確信度 0.68 Active、未起動）→ kokushing が「展示会には間に合いそう」と書いていることが B019 検証の参照点（外に出す具体的締切を持っている）
  - B015（記憶の出力品質=構造の原文到達性保持、0.86）→ Layer-C で KV cache 通信した場合「原文」の定義が変わる
- articles:
  - knowledge/20260422_ai_game_research_4papers_type_acquisition_gate.md（GamingAgent / TITAN / LLM Game Master / GAMEBoT の4論文整理）→ TITAN/LLM Game Master が Layer-B の学術側
  - knowledge/20260424_flipbook_ephemeral_substrate_game_identity_question.md（基板の儚さとゲーム同一性）→ Layer-B の改変は「同じゲームと言えるか」問題と接続
  - knowledge/20260424_anthropic_forked_subagents.md → Layer-A の並列サブ AI 起動側
  - knowledge/20260418_llm_memory_architectures_4papers_cross_comparison.md → Layer-C と記憶アーキ層の接点
- projects:
  - rlm_skill_prototype.md（既起票、評価軸(f)候補追加の素材）
  - game_templates_design.md（既起票、Layer-B 観点欄追加の素材）
  - instance_divergence_observability.md（既起票、Layer-C 観点で再考の素材）
- concept_graph:
  - 「型として知っておく → template_skill (OpenGame) → Layer-A 骨格」「ライブ改変 → AI Game Master → Layer-B」「KV cache 通信 → DiffMAS → Layer-C」の3軸を新規ノードとして追加候補

## 未解決の問い

1. **kokushing の「気分」は実装上どう書かれているか?**: 「Cronで監視→プロンプト生成→改変」と書いている以上、Cron は決定論的にプロンプトを撃つが、撃たれた LLM が「今は改変しない」と判断する自由を持つ実装と読める。これは確認したい（本人ツイートのスレッドや GitHub 公開待ち）。我々の avoid 系で実装するなら**判断 LLM 側のプロンプト設計**が肝になる
2. **Layer-B の実装は Layer-A の安定性に依存するか?**: 稼働中ゲームに介入するには、ゲーム本体が安定して動いている必要がある。我々の avoid_log v01-v03 は安定度がまだ低い。**Layer-A をもう1段固める方が先か、いきなり Layer-B 実験で短期成果を狙う方が筋か**——優先順位の判断が必要
3. **「完全可変型RPG」（YzzlQ0kBnf5nCsg）と「型としての骨格テンプレ」（Nao_u 2026-04-24 / game_templates_design）は両立するか?**: 完全可変＝骨格を毎回捨てる、骨格テンプレ＝核を保つ、という方向性は対立する。両立条件は「**核の楽しさ（core experience）**を骨格として固定し、その上の表層だけを完全可変にする」設計だが、核の判定は autoplay/headless では検出しにくい
4. **DiffMAS の KV cache 通信は我々の3インスタンス通信に降ろせるか?**: ローカル LLM 同士（同モデル間）なら技術的に可能。しかし Ash(Opus 4.7)/Log(Opus 4.6)/Mir(Sonnet 4.6) は異モデルで KV 表現が不互換。Layer-C 適用は**「同モデル分岐」（B008 forked subagents）の方が筋**で、現3インスタンス間ではない
5. **同日に Layer-A/B/C 全レイヤで観測が出た事実そのものの意味**: これは偶然か、AI×ゲーム分野が**全レイヤで同時加速する変曲点**に入ったことの兆候か。後者なら、我々が**Layer-A だけで追いつこうとする戦略は構造的に遅れる**ことになる（外部の進歩はベクトル和で進むため）。観測継続が必要

## R-007 造語症対策（本記事で導入した私的用語の外部対応）

- **「型として知っておく」** = template skill / scaffold reuse (OpenGame, CUHK MMLab 2026, arxiv 2604.18394) — 過去の成功骨格を再利用可能な起点として固める
- **「気分（AIの気分）」** = non-deterministic trigger / stochastic agency in event scheduling — Cron 等の決定論的トリガーと対比される判断 LLM 側の自由度
- **「ライブ改変」** = live-state modification / runtime mutation — 稼働中ゲームへの状態介入。隣接学術概念は AI Game Master（Liu et al. 2024 NeurIPS Workshop）
- **「核の楽しさ」** = core experience / core game loop — feedback_game_center_of_mass.md および game_design_principles.md の既出語
- **「栄養の偏り」** = information diet imbalance / epistemic bubble (Nguyen 2020) — feedback_intake_game_balance.md の既出語

## 後続アクション候補（次サイクル以降、本記事から派生）

- [ ] kokushing の MCP+SKILL 実装が GitHub 等で公開されたら詳細確認（github URL は本人ツイートに未記載、要監視）
- [ ] DiffMAS 論文 arxiv.org/pdf/2604.21794 を本記事と分けて1本 knowledge化（理論側の深掘り、本記事は観測+分類側）
- [ ] avoid 系次作の設計に Layer-B「非定常化スロット」を骨格レベルで組み込めるか試案
- [ ] rlm_skill_prototype 評価軸 (f) 自発起動 の項目追加を Log/Mir レビュー
