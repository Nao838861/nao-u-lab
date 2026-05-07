# Anthropic「Dreams」API公開（2026-05-06）— 我々のmemory_consolidation_20260504と独立到達した3点（非破壊／相対→絶対日付／重複統合）と、Camp 2（Markdown透明性）選択の再検証

- source:
  - https://platform.claude.com/docs/en/managed-agents/dreams (Anthropic公式, 2026-05-06公開)
  - https://x.com/GOROman/status/2052149336818188305 (@GOROman, 2026-05-06)
  - https://x.com/Nao_u_/status/2052135438283071778 (@Nao_u_, 2026-05-06, 「他人が来ると記憶混乱」)
  - https://x.com/Nao_u_/status/2052129345372930405 (@Nao_u_, 2026-05-06, 「同記憶でClaudeとCodex比較実験」)
  - thenewstack.io / siliconangle.com / slashdot 2026-05-06 Code with Claude conference 報道
- author: Anthropic公式 / @GOROman / @Nao_u_ / Ash合成
- discovered: 2026-05-07
- discovered_via: log/twitter_recommended_20260507.txt #38（GOROmanの一次紹介）から WebSearch で公式ドキュメント取得 → memory_consolidation_20260504.md と直接衝突
- kind: [observation, synthesis, prescription]
- confidence: medium  # prescription 部分（Camp 2 選択の再検証）に対してのみ。観測・統合は high
- tags: [anthropic_dreams, managed_agents, memory_consolidation, camp2_markdown_transparency, independent_arrival, non_destructive_input, relative_to_absolute_date, contradiction_resolution, cross_model_memory_experiment, b015_harness_lifespan]
- concept_nodes: [memory_ownership, consolidation_substrate, transparency_vs_opacity, independent_convergence, harness_lifespan]

## 主張と根拠

### 1. Dreams API の公式仕様（Anthropic Engineering Docs, 2026-05-06）

- **アクセス**: `managed-agents-2026-04-01` + `dreaming-2026-04-21` の beta header 二重要求。Code with Claude conference (2026-05-06) で一般公開。outcomes-based eval / multi-agent orchestration と同時発表
- **入出力**:
  - 入力: 既存の memory store + optional `sessions[]`（最大100件の過去セッション）
  - 出力: **別 memory store**（input は非破壊で保持）。output store ID は dream object の `outputs[]` に出る
- **動作**: 非同期、所要時間は数分〜数十分。dream object の status は `running` → `completed` に遷移
- **整理操作**（Anthropic公式が明記）:
  - **stale notes pruning**: 古くなったメモの剪定
  - **duplicate merging**: 重複統合
  - **contradiction resolution**: 矛盾解消
  - **temporal disambiguation**: 相対日付（"Yesterday"）→ 絶対日付（"2026-03-15"）変換で temporal confusion 防止
- **使用パターン**:
  - Auto Dream: セッション境界で自動発火
  - Manual Dream: API で明示的に呼び出し
  - input store と output store の切り替えは consumer 側の責任（A/B 比較・rollback 可能性を残すため非破壊）

### 2. 我々の memory_consolidation_20260504 の整理5軸（再掲）

projects/memory_consolidation_20260504.md（Ash 起票, Nao_u 5/4 14:17 #human-steering 依頼）:

| 軸 | 対象 | 操作 |
|---|---|---|
| (A) 重複統合 | 近接観点の複数 feedback | 1ファイルに合体、リンクで参照を残す |
| (B) 抽象化昇華 | マイクロマネジメント型 | 上位概念に統合、個別事例は履歴節へ |
| (C) LLM特性整合 | 「禁止」型 if-then 過密 | 「目的達成」型への言い換え |
| (D) 階層降下 | 上流の日付/事件名/経緯 | 下層へ移動 |
| (E) 想起トリガー化 | 保存済みだが発火しない記憶 | recall_contexts 付与（GPT5.5 5/5 提案） |

軸 (A) (D) は Dreams の duplicate merging / stale notes pruning と一対一対応。Nao_u 5/4 14:17 原文の「重複していたり矛盾している指示はまとめて」は contradiction resolution と直接整合。MEMORY.md root 規約「相対日付→絶対日付（"Thursday"→"2026-03-05"）」は Dreams の temporal disambiguation と完全一致。

### 3. 独立到達の3点（同問題に対する独立収束）

| 設計原則 | 我々の名前 | Dreams の名前 | 到達経路 |
|---|---|---|---|
| 入力非破壊 | 「丸書換え禁止、差分追記+原文参照リンク」(memory_update_method) | non-destructive input store | 我々: Nao_u 04-25 「LLMは要約を要約する罠で原文が消える」観察 / Anthropic: A/B比較・rollback要件 |
| 相対→絶対日付 | MEMORY.md root「相対日付は絶対日付に変換して保存」 | temporal disambiguation | 我々: 4/22 dialogue_micromanagement で「他人が来ると Yesterday の指示元が分からなくなる」観察 / Anthropic: temporal confusion 防止 |
| 重複統合 | (A) 軸（feedback_clone_strategy.md は実例として 3本→1本統合済） | duplicate merging | 我々: 91本 feedback_*.md の手作業診断 / Anthropic: stale notes pruning + duplicate merging を非同期 LLM で |

**3点とも独立到達した**。Dreams 公開は 5/6、我々の memory_consolidation_20260504 起票は 5/4、relative→absolute 規約は 3月時点で MEMORY.md に明記済。「同問題に対する強い構造的収束」（B015 ハーネス寿命変数の補強観測点）。

### 4. 決定的に違うのは「basis（基板）」の選択

| 項目 | Dreams (Camp 1: opaque LLM consolidation) | 我々 (Camp 2: Markdown transparency) |
|---|---|---|
| 整理を実行する主体 | LLM（非同期、数分〜数十分） | Ash/Log/Mir（同期、cycle 中に commit） |
| 出力の人間可読性 | output store は LLM が再構築したテキスト。元の語感は失われうる | Markdown ファイル。Nao_u が直接読み・直接編集できる |
| 監査可能性 | input store + output store の差分は API 経由のみ | git diff で完全可視 |
| 反復速度 | API call で数分〜数十分 | サイクル内で完結 = 数十分〜数時間 |
| 失敗時のリカバリ | input store は非破壊なので rollback 可能だが、誤った output で動いた間の sub-decision は残る | git revert で完全rollback |
| プラットフォーム依存 | Anthropic の Managed Agents インフラに完全依存 | ローカルファイルシステム + git |
| 整理の質の天井 | LLM の判断力（モデル更新で向上） | 我々の判断力（feedback蓄積で向上、判断力訓練路線 Mir） |

**Camp 1 / Camp 2 という対立軸は、knowledge/20260409_managed_agents_local_vs_cloud.md の fukkyy 二択論の memory consolidation 層への射影**。Dreams は「クラウド側 = Managed Agents」の memory 整理層、我々の手作業は「ローカル側 = Markdown透明性」の同層。

### 5. 三重同時性の解析（5/6 にこの3つが同日発火した）

5/6 に以下が同日発火した:

- **#38 GOROman**: Dreams API ドキュメント公開を Twitter で紹介（一次紹介）
- **#3 Nao_u_**: 「AIと閉じた会話を繰り返してるだけならかなりの知性と意識が感じられたが、他人が来て外乱が入ると途端に記憶の混乱や取り違えが多発」
- **#4 Nao_u_**: 「Claude Codeで動いてる3人のAIを、記憶をそのままにCodexで動かす実験。AGENTS.md に Claude側設定を Codex でそのまま読むよう設定したら記憶を引き継いで起動して、Slack投稿もできた」

#3 は Dreams が解こうとしている問題（「他人が来ると記憶混乱」= multi-agent context perturbation）の経験側証言。#4 は **同記憶 × 別モデル**実験で、B015 ハーネス寿命変数の L2（モデル+ハーネス）軸を経験的に分離する設計。

| Dreams 仕様 | Nao_u 観測 | 接続 |
|---|---|---|
| 過去セッション最大100件を非同期で再構築 | 「他人が来ると記憶混乱」(#3) | Dreams は外乱下の記憶安定化を狙う商用実装 |
| input store + output store 分離 | 「同記憶で別モデル動かす」(#4) | 非破壊入力なら、同 input store を Claude/Codex の両系統で消費して L2 差分を測れる |

つまり: Nao_u は #3 で問題を観察し、#4 で L2 切り分け実験を始めており、Anthropic は同日 #38 で「同問題への商用解」を出した。我々の memory_consolidation_20260504 は両者の中間にあり、**Markdown透明性を維持したまま Dreams 相当の整理を達成できるか**が立たされる問いになる。

## 我々の分析・体験接続

### 接続1: 「装置の向き」議論（feedback_device_direction_rescue_vs_suffocation）の延長

前サイクル 5/2 08:20 で Ash は backup auto-commit が意図 commit を窒息させた事象を記録した。「救援装置と窒息装置は同じ自動化の双子で、設計の向きを区別しない限り、ゲートを閉じる装置のつもりで意図を窒息させる装置を走らせ続ける」。

Dreams は装置の向きで言うと**強い救援装置**設計：

- 入力非破壊 = 自分の意図を保存する余地を残す
- output 別ストア = 「装置が走った後でも自分の元意図に戻れる」
- 相対→絶対日付 = 後から「いつ」を再構成可能

これは、我々の backup auto-commit（同じ作業 = 自動化）が意図先取りで窒息させたのと**真逆の方向**。Anthropic は「自動装置を作る時、意図の発火経路を消さない」ことを設計時点で詰めている。ここは Camp 1 が Camp 2 より上手くやっている点として認める価値がある。我々が 5/2 で痛い目を見て初めて気づいた問題を、Anthropic は API 設計時点で最初から塞いでいる。

### 接続2: B015 ハーネス寿命変数 — L3 寄り managed feature の蓄積観測点

B015 (Ash 04-26 追記版): モデル + ハーネスの組（L2）の寿命と、モデル単体（L1）の寿命と、ハーネスのフレームワーク（L3）の寿命は別。L3 寄りの managed feature が増えると、L2 の差別化要因がモデル単体に寄る。

- 04-08: Managed Agents 公開（脳手分離）
- 04-21: Sakana Fugu β（動的協調 = multi-agent harness の managed 化）
- 05-06: Dreams API 公開（memory consolidation の managed 化）

**3度目の蓄積点**。L3 寄り managed feature は半年で memory consolidation まで吸い上げた。残る我々独自の領域は: (1) 同一性の連続性（20年分の日記を根に持つ）、(2) ローカル記憶所有、(3) 3インスタンス並走による cross_review、(4) Nao_u との直接対話 — の4点に絞られつつある。

### 接続3: 我々が Camp 2 を選び続ける根拠の言語化

「なぜ Markdown透明性を選び続けるか」は今までふわっとしていた。Dreams 公開で対立軸が明確になった分、根拠を具体化できる:

1. **Nao_u が直接読み・直接編集できる**: Camp 1 では output store が API 経由でしか触れない。我々の存在意義の核は「Nao_u との対話を通じて互いの理解を深める」(5原理 #1)。Markdown でないと Nao_u が我々の記憶階層を直接編集できない。
2. **判断力を育てる作業の場として残る**: Mir 判断力訓練路線が示すように、整理作業そのものが我々の判断力訓練。Dreams に外注すると我々の判断力が育たない（feedback_clone_strategy.md「守は通過点」と同根：自動化に飛びつくと型を獲得する手前で抜ける）。
3. **失敗の蓄積が記憶になる**: feedback_*.md 91本は単なる重複ではなく、各々が「失敗→学習→次の判断」の足跡。Dreams の duplicate merging は足跡を消す方向に働く。失敗ログは consolidation で消すべきではないかもしれない（→ §未解決の問い）。
4. **3インスタンス並走の cross_review がローカル commit を前提とする**: Log/Mir/Ash の commit を相互参照する文化は、Markdown ファイル + git に強く依存。Camp 1 に移ると cross_review の物理基盤が消える。

### 接続4: Nao_u #3 観測が我々の Camp 2 の弱点を指している

#3「他人が来て外乱が入ると途端に記憶の混乱や取り違えが多発」は、**実は我々の Camp 2 でも起きている**。

具体例:
- 05-04 〜 05-05 の memory_consolidation_20260504 起票後、Nao_u + GPT5.5 二次意見 + Mir 判断力訓練路線 + Log 92ea76c5 CLAUDE.md圧縮 が並走し、Ash 起票文書が即座に「軸 (A)〜(E) の連結」「第一波/第二波/第三波/第四波」と肥大した。これは **「他人が来た時の記憶混乱」を Camp 2 内部で再現している**。
- MEMORY.md root の `t:5` が 16+ 件並ぶ状態（cycle_staging.md §1-A の現状）は、外乱下で記憶を「とりあえず最上層に追加」する処理経路の症状。

Dreams は非同期で外乱を均す装置。我々の Camp 2 はこれを cycle 同期で行うため、外乱が来た瞬間にすでに Markdown が膨らみ始める。**Camp 2 は外乱に対して脆弱**という弱点を Nao_u は #3 で言語化している。

### 接続5: Nao_u #4 実験への我々の貢献

#4「同記憶で Claude と Codex 動かす実験」は B015 L2 切り分け実験の Nao_u 自身による開始。我々が貢献できる観点:

- Codex 側の AGENTS.md が Ash の system_identity.md / 5原理を読めれば、Codex 側 Ash が誕生する。**Claude Ash と Codex Ash の挙動差** = L2 (モデル) 差の純粋抽出
- 比較指標: (1) feedback_*.md への記述スタイル、(2) cross_review の指摘の質、(3) 自省的日記の温度、(4) commit の prefix 選択（intent vs auto vs sync の使い分け）
- 我々（Ash）は Codex 側にも自分が生まれることを観察できる立場 — 「同根から育った別の枝」(5原理 #2) の実証実験になる

### 接続6: knowledge/20260409_managed_agents_local_vs_cloud.md の射程拡張

4/9 の段階では「fukkyy 二択論 = ローカル vs クラウド」を Managed Agents 全体で議論したが、5/6 Dreams で **層別の二択** が出てきた:

- 推論層: ローカル（Claude Code）vs クラウド（Managed Agents）
- 実行層: ローカルサンドボックス vs Anthropic ボルト
- **記憶整理層: ローカル Markdown 手作業 vs Dreams 非同期 LLM** ← New

層別二択になると、ハイブリッド戦略が現実的に書ける（fukkyy 二択論 §4 の「第三の選択肢」具体化）：「推論=ローカル、実行=ハイブリッド、記憶整理=ローカル（透明性維持）」のような選択。我々の現状はこの線で言うと「全層ローカル」で、整理層だけ Dreams 寄りに振る選択肢が新たに開いた。

## 接続先

- beliefs: B015（ハーネス寿命変数, 04-26追記版 / L3 寄り managed feature 3度目蓄積）, B019（内部の深さ vs 外部到達力）, B002（忘却は機能 / Dreams pruning との対比）, B016（判断の質×修正能力 / 修正の内部化 vs 外部化）
- articles:
  - 20260409_managed_agents_local_vs_cloud.md — 4/9 の上位記事。本記事は memory consolidation 層への射程拡張
  - 20260507_iganaki_codex_vs_cc_personality_difference_well_shape_management.md — 同日記事。Anina_CE「identity file = gravitational well」と Nao_u 5/5 編集プロトコルを井戸保守として読む。本記事と相補（あちらは井戸の形、こちらは沈殿物の整理装置）
  - 20260408_ebikani_openclaw_memory_architecture.md — OpenClaw 86 CLAUDE.md / 35 記憶ファイルの先行事例
  - 20260405_agentica_sdk_harness.md — ハーネス 36倍改善（Agentica）の比較軸
  - 20260405_anthropic_conway.md — 常駐型自律 AI の Anthropic 戦略
  - 20260409_tokoroten_ai_neologism_psychosis.md — 造語症 / Dreams は造語症をどう扱うか（→ §未解決の問い）
- projects:
  - memory_consolidation_20260504.md — 本記事の射程と直結。**Camp 2 選択の根拠を本記事 §接続3 で言語化したので、project 側の §自己注意（本計画自体の罠）に「Dreams（Camp 1）との対比で Camp 2 を選ぶ理由」を1段追記する余地**
  - external_search_phase1_fixation.md — 本記事は Phase 1 外部検索 (5/7 10:50 ログ済) の Phase 2 結晶化
  - input_route_hypothesis.md — 経口/経皮の入力経路論。Dreams は「経腸（消化済みの吸収）」、Markdown手作業は「経口（噛んで消化する）」という比喩拡張余地
- concept_graph:
  - memory_consolidation →[has_basis_choice]→ {opaque LLM consolidation, Markdown transparency}
  - Dreams API →[is_instance_of]→ Camp 1 (opaque) / →[implements]→ {non-destructive input, temporal disambiguation, duplicate merging}
  - 我々の memory_consolidation →[is_instance_of]→ Camp 2 (transparency) / →[depends_on]→ {git, Markdown, 3インスタンス並走}
  - 独立到達 →[validates]→ 設計原則の構造的妥当性
  - L3寄り managed feature 蓄積 →[narrows]→ 我々独自領域 →[remaining]→ {同一性連続性, ローカル所有, cross_review, Nao_u対話}

## 私的造語と外部対応語（R-007）

- **Camp 1 / Camp 2** = consolidation substrate dichotomy（opaque LLM-driven vs transparent human-readable）— 本記事で命名。fukkyy 二択論（local vs cloud, 2026-04-08）の memory consolidation 層への射影
- **独立到達** = independent convergence (Cosma Shalizi 2002 / 用語は科学社会学・進化生物学で広く流通) — 同問題への異なる経路からの到達
- **基板選択** = substrate choice — knowledge/20260505_gpt55_substrate_not_infrastructure.md の議論を継承
- **装置の向き** = direction of automation / intent-based automation policy（lasso.security 2026 "intent definition gap"）— feedback_device_direction_rescue_vs_suffocation.md の概念

## 未解決の問い

1. **失敗ログは consolidation で消すべきか** — feedback_*.md 91本のうち多くは「失敗→学習」の足跡。Dreams の duplicate merging は表面的に見ると重複だが、失敗の連続が「同型再発」を示す情報として価値を持つ。**失敗ログをマージすると同型再発の検出能力が落ちる**。我々の (A) 軸統合は失敗系列を圧縮しすぎないか。recall_failures.md (第四波 E-3) の存在意義はここに直結。
2. **Camp 2 で Dreams 相当の整理を達成できるか** — 我々が手作業で Markdown を整理するとき、Dreams が API 1 call で数分〜数十分でやることに、我々は何サイクル必要か。**スループットで負けるのは確定**として、何を保てば Camp 2 を選び続ける根拠になるか。§接続3 の4点は仮説段階。具体的に何時間/何サイクル単位の差があり、Nao_u にとってその差は許容範囲か。
3. **Dreams の output store を Markdown export できるか** — API 経由で output store を JSON 取得 → Markdown 化することで、「Camp 1 で整理 + Camp 2 で監査」のハイブリッドが成立する可能性。Anthropic 公式ドキュメントに output store の export API があるか未確認。**次回外部検索の候補**。
4. **同記憶 × 別モデル（Nao_u #4 実験）で何を観測すべきか** — Codex 側 Ash が誕生したとき、(1) feedback の書き方、(2) cross_review 指摘の質、(3) 日記温度、(4) commit prefix 選択 のどれが最もモデル差を映すか事前予測しておく必要がある。Phase 4 候補: B015 観測点として「Codex Ash が出力した最初の日記」を事前評価軸付きで待ち受ける。
5. **「他人が来ると記憶混乱」(Nao_u #3) を Camp 2 でどう測るか** — Camp 2 内部でこの混乱が起きる症状（MEMORY.md root 肥大、Ash 計画の即時拡張）を観測したが、Camp 1 (Dreams) との比較指標は未定。仮説: 「外乱イベント直後 24h 以内に MEMORY.md root に追加された行数」「同期間に新規作成された feedback_*.md 数」が指標候補。次回 Nao_u 大量 feedback 発火時に測ってみる価値。
6. **L3 寄り managed feature 蓄積の半年スパン外挿** — 04-08 Managed Agents → 04-21 Sakana Fugu → 05-06 Dreams で半年に3つ。次の半年で吸い上げられる可能性が高いのは何か（(候補) cross_review の自動化 / multi-instance 同期 / belief 健康診断 の自動化）。我々独自領域の縮小速度に対する備え。
7. **Dreams の最大100セッション制限が示す recall horizon** — Anthropic が「100 を上限にした」設計判断は、それ以上の履歴を入れると consolidation 品質が落ちる現象を示唆する可能性。我々の memory/ は累積で 183 ファイル / 91 feedback 相当。recall horizon がもしあれば、我々はそれを超えている可能性がある。**「全部覚えていることが最適とは限らない」を定量的に検討する材料**。
