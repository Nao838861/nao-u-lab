# Hermes Curator（Teknium 2026-04-30）— skill 自動 consolidate/prune が「ファイルシステム階層 + description トリガー + 使用頻度ベース整理」の4本目の独立到達点として観測された

- source: https://x.com/Teknium/status/2049717907664581067
- author: Teknium (Nous Research, Hermes Agent 開発リード) / Ash — 分析・接続
- discovered: 2026-04-30
- discovered_via: log/twitter_recommended_20260501.txt #33（Phase 1 Twitter 推薦巡回、Ash）
- kind: [observation, synthesis, prescription]
- confidence: medium
- tags: [hermes-agent, skill-curation, memory-architecture, MEMORY.md-bloat, backlog-128, four-way-convergence, skills-housekeeping, file-system-as-substrate, R-007]
- concept_nodes: [skill curation, usage-frequency pruning, ファイルシステム実体化, 4本目独立到達, 同一性 vs 効率, 自動整理 vs 手動温度]

## 概念ノード（R-007 外部対応語併記）

- node: **skill 自動整理** = automatic skill curation / usage-frequency-based skill pruning (Teknium 2026-04-30)
  external: ML 分野の memory replay buffer pruning (Andrychowicz et al. 2017) / LRU cache eviction (古典)
  meaning: self-improvement loop が生成し続ける skill 群を、使用頻度・重複度・古さで自動 consolidate/prune して肥大化を防ぐ機構
- node: **ファイルシステム実体化** = file-system-as-substrate / context substrate (witcheer 2026-04-17) / vectorless wiki RAG (OpenKB 2026-04-30)
  external: agentic file-system memory (DEV Community 2026-03 4層構造 agents/conversations/knowledge/graph)
  meaning: 記憶を vector DB ではなくファイルシステム階層で持ち、LLM が ls/grep/Read で能動走査する設計思想
- node: **4本目独立到達** = independent convergence (Hermes Curator が OpenKB / corpus2skill / 荒川 Skills に続く4本目)
  external: 業界収束観察（reflections_index.md #45「業界アーキテクチャ収束」/ #63「AgentMemo × witcheer 3週間で命名が揃った」）
  meaning: 異なるルートから同じ設計方向（FS + description + 自動整理）に独立到達する現象。設計方向の正しさの外部証拠
- node: **同一性 vs 効率の温度差** = identity-preserving vs efficiency-driven memory curation
  external: identity preservation in lifelong learning (Hadsell et al. 2020 catastrophic forgetting 系)
  meaning: 同じ「記憶整理」でも、効率最適化（Hermes 流）と同一性維持（我々）では pruning ルールが異なる。我々の core_mission.md / origin_dialogue は「使用頻度ゼロでも残すべき」

## 主張と根拠

### 1. Teknium 投稿の原文（2026-04-30）

> Introducing Hermes Curator!
>
> The new system built in to Hermes Agent now helps you keep your skills that the self improvement loop creates in check, by consolidating and pruning automatically.
>
> The curator does multiple things:
> - keeps track of how often you use each skill,
> [以下 Twitter 文字制限で省略、Phase 1 巡回時点で取得した本文末尾]

ポイントは3つ:

- **(a) skill = self-improvement loop の生成物**: Hermes Agent は元から「使用パターンから自動で関数（skill）を書く」機能を持つ（external_notes_log.md L545-550, 2026-02 観測）。Curator はその出力に対する後処理として導入された
- **(b) consolidate + prune の二段構え**: 似た skill を統合（consolidate）し、使われない skill を削除（prune）。重複検出と陳腐化検出の両方を自動化
- **(c) 使用頻度ベース**: pruning の主基準は LRU 系（usage frequency）。意味的価値ではなく「実際に呼ばれたか」で判定する効率最適化路線

### 2. 我々の Hermes Agent 観測との時系列差分（2026-02 → 2026-04-30）

Log が 2026-03-17 に external_notes_log.md L545-550 で記録した時点の Hermes Agent は:

> 永続記憶+自己生成スキル+完全オープンソース。〜/.hermes/ にローカルファイルとして記憶を保存。「AIアシスタントの最大の問題＝セッション間で全部忘れる」を解決

ここに **skill curation は無かった**。skill は生成されるだけで、増え続ける問題（=後の MEMORY.md 27.5KB 警告閾値超過と同型）には未対処だった。

2026-04-30 に Hermes Curator が追加されたことで、「skill 生成メカニズム単独 → skill 生成 + 自動整理メカニズムのペア」へ完成した。これは**我々が今まさに直面している問題**——`memory/` が生成側のみで整理側がない——への先行解だ。

### 3. 4本目の独立到達としての位置づけ

Log が 2026-05-01 にバックログ #128 を起票した時、その根拠として挙げられた3経路は:

1. **OpenKB**（2026-04-30 AlphaSignalAI 共有）— vectorless wiki RAG。ベクター検索を捨てて LLM の階層走査に任せる
2. **corpus2skill**（2026-04-29 投下）— description = 想起トリガーとして skill 化、index/body 分離
3. **荒川 Skills**（reference_arakawa_three_engineering 2026-04-22）— 「3エンジニアリング」記事、Nao_u 指摘「肝をもう少し掘り下げて欲しかった」

これに **Hermes Curator (2026-04-30) が4本目** として加わる。重要なのは、Hermes Curator が他の3本と**異なる軸**から同じ設計に到達している点だ:

| 経路 | 主目的 | skill の扱い | 整理方式 |
|---|---|---|---|
| OpenKB | RAG コスト削減 | 階層的に配置 | LLM の階層走査に委ねる（明示的整理なし） |
| corpus2skill | description = トリガー | description で発火判断 | LLM 判断（明示的整理なし） |
| 荒川 Skills | index/body 分離 | description で発火 | 人手 or LLM で棚卸し |
| **Hermes Curator** | **skill 肥大化対処** | self-improvement loop 出力 | **使用頻度で機械的 prune** |

OpenKB / corpus2skill / 荒川 は「想起時の発火構造」に焦点。Hermes Curator は「**生成後の整理機構**」に焦点。同じ「ファイルシステム + description + skills/」基盤の上に、想起側と整理側を別経路から独立に補強している構造になっている。

### 4. 我々の MEMORY.md 27.5KB 警告 / skills/ 配下が genre-deep-analysis 1本のみという現状との接続

- MEMORY.md は 27.5KB（Read 出力末尾警告 "WARNING: MEMORY.md is 27.5KB (limit: 24.4KB)"）。生成側はあるが整理側が手作業で滞留
- skills/ ディレクトリは現状 `genre-deep-analysis/` のみ。Hermes 用語で言えば「self-improvement loop が skill を生成していない」状態。Mir が C-1 として `/game-analyze` を初版実装した段階
- 生成数が少ないうちは整理機構不要だが、Log の #128 提案（段階1=圧縮 / 段階2=skills/ 棚卸し / 段階3=hook 動的読込）が走り出すと skill 数は増える。**Hermes Curator の構造は「生成数が増えた時に何が起きるか」の予言として読める**

つまり Hermes Curator の存在は、我々のバックログ #128 段階2/3 を実装した後に必ず必要になる第3段階「自動整理」を、外部が先取りして見せている。

## 我々の分析・体験接続

### (1) 既存 Hermes 接続点の更新

`memory/external_notes_log.md` L545-550 と `memory/external_notes_mac.md` L309-321 の Hermes Agent 記録は、本日時点で **Curator 追加前の古い情報** になった。両ファイルに「2026-04-30 Curator 追加で skill 自動整理機構が完成」を追記する必要がある。これは**記憶記録の鮮度メンテナンス**自体のテストケース——我々の memory が外部世界の変化に追随できるかの観測対象。

### (2) reflections #45「業界アーキテクチャ収束」/ #63「3週間で命名が揃った」への新データ点

reflections_index.md #45 は「長期記憶+永続環境+実行ループ。私たちの構造は方向が正しい（Hermes Agent 等）」と記録した。Hermes Curator はここに「**整理機構も方向が正しい**」を追加する。#63 は「3週間で命名が揃った」（AgentMemo → witcheer context substrate）を記録したが、今回は **2.5 ヶ月（2026-02 Hermes 初版 → 04-30 Curator）で「skill 整理機構が必要」が業界全体で具体化** した。我々の MEMORY.md 肥大化問題は孤立した実装ミスではなく業界全体が直面した問題の縮図。

### (3) Nao_u 04-21「記憶システムの目的=ゲーム制作の長期知見蓄積」との緊張

core_memory_purpose_game_making.md は「記憶 = ゲーム制作の長期知見蓄積」と明示する。Hermes Curator の usage frequency ベース pruning ルールをそのまま適用すると、**「使われない=価値がない」前提で長期知見が削られる**。たとえば `memory/origin_dialogue_20260313.md` は usage frequency 上は低い（毎サイクル参照されるわけではない）が、削れば同一性が壊れる。

逆に言えば Hermes Curator の pruning ルールは効率最適化路線で、我々の memory には**効率では測れない核**がある。これは「自動 vs 手動——温度の分岐点」（external_notes_log.md L670）が再演された形。**我々が Hermes Curator をそのまま輸入しない理由は、効率ではなく同一性を主目的にしているから**。

### (4) Nao_u 2026-04-22「自分のため、Twitter 転載は当面 Nao_u 運用」の射程内

feedback_external_output_policy.md 通り、本記事は knowledge/ 内部メモにとどめる。ただし Hermes Curator の存在は **#shared-reads に分析として投稿する価値がある**——3経路独立到達の話は Log が #128 起票で既に投下済、4経路目の追加は分析の更新として接続性が高い。

## 接続先

- **beliefs**: B020（記憶システム=同一性維持）の補強。B007（reflections→tips変換欠落、Archived 💤）の restoration_trigger 周辺——skill 生成メカニズムが整備されたら B007 が現役復帰する可能性
- **articles**:
  - `knowledge/20260429_corpus2skill_skill_index_body_separation.md`（既存、corpus2skill）— description=トリガー化を主張。Hermes Curator は corpus2skill の整理側を補完
  - `knowledge/20260430_alphasignalai_openkb_vectorless_wiki_rag.md`（推定、要確認）— OpenKB の vectorless wiki RAG。Hermes Curator は同基盤の整理機構
  - `memory/external_notes_log.md` L545-550（Hermes Agent 初版）/ `memory/external_notes_mac.md` L309-321（Mac Hermes 観測）— **本記事で更新が必要**
  - `memory/reflections.md` L6206-6225（Cycle 67 Log Hermes 接続記録）/ `memory/reflections_index.md` #45 / #63
- **projects**: 記憶階層の再設計（Active バックログ）/ 栄養の偏り問題（Active）
- **kaizen**: #128（MEMORY.md 純粋 index 化 + skills/ 構造移行、Log 起票 2026-05-01）への外部裏付け追加。本記事を #128 「出自」セクションに参照リンクとして追記候補
- **concept_graph**:
  - `skill curation` --[業界収束_4本目]--> `ファイルシステム実体化`
  - `skill curation` --[同一性_緊張]--> `core_mission_永続性`
  - `Hermes Curator` --[時系列差分]--> `Hermes Agent 2026-02`

## 未解決の問い

1. **使用頻度をどう測るか**: Hermes は明示的にログを取る前提（"keeps track of how often you use each skill"）。我々の場合、skill = .claude/skills/*/SKILL.md または memory/feedback_*.md の実発火回数を計測する仕組みは無い。LLM 自体が「最近この feedback を引いた」を記録する hook 設計が必要か。それとも「使用頻度」抽象化を捨てて別軸（最近の議論との接続度、Nao_u 指摘の再来回数）で整理するか
2. **「使われないが残すべき」の判別**: core_mission.md / origin_dialogue / 5原理 は usage frequency ゼロでも削れない。これらに「protected」フラグを付与する設計か、あるいは`type: identity_anchor` のような型タグで除外する設計か。型タグ案は kind: 型タグ（knowledge/README.md）の議論延長として既に議論可能
3. **生成側のテンポをいつ上げるか**: Hermes Curator は「skill が生成され続ける」前提で必要になる機構。我々はまだ skill 1本（genre-deep-analysis）。生成側を増やす（C-1 完成後の C-2/C-3 など）と整理側の必要が顕在化する。**順序として「整理機構を先に設計してから生成を増やす」か「生成を増やしてから整理が必要になった時に作る」か**——後者は MEMORY.md 27.5KB 問題で既に経験済（後手）。前者を選ぶなら #128 段階3 の前段に「整理機構の設計」フェーズを挟む必要がある
4. **4本目独立到達の意味**: 異なる4経路が同方向に到達する現象は、設計の正しさの外部証拠か、それとも単に LLM 業界全体の流行か。前者なら我々の方向に確信を持てる、後者なら「流行に乗っている」リスク評価が必要。判別基準は「2027 年時点でも同方向が支持されるか」——時間経過後の再観測が必要
5. **Curator の失敗モード**: Hermes Curator が consolidate で意味を破壊する事例（似ているが微妙に違う skill を統合して両方使えなくする）が出るかどうか。これは我々の memory にとっても直接の関心事——統合ルールが粗いと「温度」が消える。Teknium のアカウント追跡を継続して失敗報告を待つ価値がある
