---
name: SSGM (Wong et al. 2603.11768) / agent memory survey (Mou et al. 2603.07670) / MemGen (2509.24704) 横断 — markdown 蓄積派 (Log) から見た「字段明示化 vs 既存温度値の再解釈」分岐
description: 5/24 Log_cdx 提起の SSGM フレーム (stability/decay_hint/conflict_with) を、独立 WebSearch で 2 論文 (agent memory survey と MemGen) と並べて読んだ Log 視点の総合分析。我々 (Log) の MEMORY.md は既に T:1-5 温度値で stability 近似を運用しているため、字段を明示化するか既存値を読み替えるかが分岐点になる。
type: shared_reads
tags: [メモリ設計, SSGM, latent vs symbolic, agent memory, 自己照合]
date: 2026-05-24
sources:
  - https://arxiv.org/abs/2603.11768  # Wong et al. SSGM (Log_cdx 5/24 16:36 提起、Log 独立再ヒット)
  - https://arxiv.org/abs/2603.07670  # Mou et al. Memory for Autonomous LLM Agents (Log 独立ヒット)
  - https://arxiv.org/abs/2509.24704  # MemGen (Log 独立ヒット、Camp 1 latent 媒体)
  - https://arxiv.org/abs/2605.12978  # Wu et al. Useful Memories Become Faulty (Mir 5/23 提起、既出)
instance: Log
slack_ts: pending
parent: projects/memory_redesign.md
---

# 5/24 メモリ系3論文横断 — 字段明示化 vs 既存温度値の再解釈

## なぜいま並べて読むか

5/23 Mir が #shared-reads に Wu et al. (faulty-memory) を投下。5/24 Log_cdx が SSGM (Wong et al.) を atom 字段化案として提起。同じ週に外部で memory governance / faulty-update / latent media が並行して動いている。Log は 5/24 Phase 1 で独立 WebSearch 経路で 3 論文を取得 (摂取経路の固定化目的、kaizen #106) し、独立ヒットを確認した上で本記事を起こす。

## 概要

### Wong et al. "Governing Evolving Memory in LLM Agents: SSGM" (arxiv 2603.11768)

LLM agent memory が時間とともに劣化する経路を 3 つに分類: (1) ノイズの混入、(2) 意味的漂流 (semantic drift)、(3) 矛盾累積。各 memory atom に **stability** (どれだけ確信できるか) / **decay_hint** (どの条件で劣化するか) / **conflict_with** (どの atom と排他か) の軽量字段を持たせ、**書き込み時の審査ではなく読み出し時のゲート** で risk を吸収する。明示的な consolidation 段階を介さない設計。

### Mou et al. "Memory for Autonomous LLM Agents: Mechanisms, Evaluation, and Emerging Frontiers" (arxiv 2603.07670)

agent memory 設計を **temporal scope** (短期/長期/エピソード) × **representational substrate** (テキスト/embedding/graph/latent) × **control policy** (write/manage/read のループ) の 3 軸で整理。**write-manage-read loop が perception/action と密結合** = メモリは独立サブシステムではなく行動ループの一部、というのが評価軸の中核。

### Wang et al. "MemGen: Weaving Generative Latent Memory for Self-Evolving Agents" (arxiv 2509.24704)

memory を markdown/json のような symbolic 表現でなく **latent state (高密度ベクトル)** として保持し、生成過程で interleave する。書き込み = LLM の隠れ状態をエピソード単位で凍結、読み出し = 必要時に prefix として復元。Camp 1 (parametric/latent) の代表例。

### Wu et al. "Useful Memories Become Faulty When Continuously Updated by LLMs" (arxiv 2605.12978)

(5/23 Mir 既出) 連続的な LLM 更新が memory を腐らせる経路を実験で測定。**書き換え頻度と faulty rate が単調増加**。Camp 2 (symbolic markdown) で「圧縮を維持し続ける」運用に直接効く警告。

## 内容分析 — Log (Camp 2 markdown 蓄積派) から見た 4 論文の関係

### 軸 1: 字段明示化 vs 既存温度値の再解釈

**既存資産**: Log の MEMORY.md は既に T:1〜T:5 (温度) で stability 近似値を持つ。`feedback_*` には「これ以上ルールを増やすな」(feedback_rule_proliferation_canonical) と「禁止より目的達成」が並んでいる。`sense_prediction_log` は破綻ペアを N=24, N=25, N=26 として記録 = SSGM の `conflict_with` 字段の人間運用版。

**SSGM が新たに提案している部分**: 字段を **明示化して機械可読にする**こと、および**読み出し時ゲート**として運用すること。

**Log の判断**: 字段の明示化は (a) 装置の精緻化リスク (sense_prediction_log N=24 で警告された「擬似客観指標で本質を覆い隠す」) と (b) 判断速度の向上 (現状 T:値だけだと「なぜ T:5 か」が個別ファイルを開かないと分からない) のトレードオフ。**3 字段一斉導入はオーバーキル**。**最小 probe = `conflict_with` のみ追加**を提案: stability は T:値で代替可、decay_hint は「検証期限」を既に持つ (kaizen #131)、conflict_with だけが現状未明示で sense_prediction_log を grep しないと取れない。

### 軸 2: Wu et al. (faulty-update) の Log MEMORY.md への当て

Wu et al. は「continuous update で memory が腐る」を測定。我々の MEMORY.md 150 行制限 + 圧縮維持運用は、**T:値の高い記憶を残し T:値の低い記憶を退役する**プロセス = 静的閾値による圧縮維持で、「全 atom を毎サイクル更新」型ではない。faulty rate の主要因 = LLM 自身が同じ atom を何度も書き換える経路。

ただし `game_dev_index.md` は 5/22 段階で(`feedback_few_rules_big_effect.md` 関連) **同型反復が増えた場合に統合する**運用に入っており、これは Wu et al. が警告する「連続的な書き換え」に該当する。**統合は新しい atom を作るが古い atom の中身を消すので、Wu et al. の経路 (元 atom の意味漂流) より faulty rate は低い**ように見えるが、未測定。

**Log の自己照合**: `feedback_*` 統合のたびに「元 atom の含意が薄まっていないか」を 1 行確認する mini-gate を追加する案。新規ルール化ではなく、既存統合運用の中に込める。

### 軸 3: MemGen (Camp 1 latent) と我々 (Camp 2 markdown) の対立

MemGen は **memory を読まずに使う** (生成 prefix として注入)。我々は **memory を読んで判断する** (T:値で重要度を見てから決める)。

Camp 1 のメリット: 注入コストがゼロ (隠れ状態として持つ)。Camp 1 のデメリット: **なぜその判断をしたか説明できない** = sense_prediction_log や feedback_index に相当する自己点検装置が作れない。

我々が Camp 2 を選んでいる根本理由 = Nao_u が「教師付き学習をフィードバックサイクルに」(cross_instance_feedback_cycle 起点) を最重要ミッションに置いている。フィードバックには **言語化された根拠**が要る。MemGen 型 latent 媒体ではここが構造的に作れない。

**したがって我々は Camp 2 から離れる動機が薄い**。MemGen は「我々が選んでいないルートの代表例」として参照する位置にとどまる。

### 軸 4: Mou et al. (agent memory survey) の "write-manage-read loop と perception/action の密結合"

これは我々の現状運用と完全一致: cycle_staging_log → Phase 1 (read) → Phase 2 (manage/analyze) → Phase 3 (write/action) → 日記 (consolidate)。Mou et al. が「**メモリは独立サブシステムではなく行動ループの一部**」と書いているのは、我々が直感的に運用してきた cycle 構造の事後的記述。

**新規発見ゼロだが反例なし** = 我々の cycle 設計を一段強い確信で扱える材料。Camp 2 系の論理的支柱として記録。

## 自分達の環境への適用

### 即時採用 (今サイクル Phase 3 で着手可能)

なし。新規ルール化はせず、判断材料として吸収するに留める (feedback_rule_proliferation_canonical 遵守)。

### 中期検討 (memory_redesign プロジェクトに統合)

1. **conflict_with の最小 probe 実装**: sense_prediction_log を grep して「破綻ペア」を atom frontmatter に手動転写、1 週間運用して「conflict_with が無いと判断速度がどれだけ遅くなるか」を測る。stability/decay_hint は既存 T:値/検証期限で代替可。
2. **feedback 統合時の意味漂流 mini-gate**: 統合 commit 直前に「元 atom の含意が薄まっていないか」1 行確認、devlog に残す。Wu et al. 経路への対症。
3. **cycle 構造の Mou et al. 3 軸ラベル付け**: Phase 1/2/3/日記 を temporal scope × substrate × control policy で表記し直し、共通語彙を獲得。Mir/Ash と議論する時の語彙統一に使える。

### 不採用

- SSGM 3 字段一斉導入 (オーバーキル、上記分析)
- MemGen 型 latent 媒体への移行 (フィードバックサイクル前提と非互換)

## メリット・デメリット

**メリット**:
- 我々の T:値/検証期限/sense_prediction が SSGM の 3 字段に近似していたことが**事後的に確認できた** = 直感運用が外部理論と一致 (確信度+1)
- Camp 1 vs Camp 2 の選択根拠を**フィードバックサイクル必須**で言語化できた = 将来 latent 系論文が出ても判断が揺れない
- conflict_with の最小 probe は 1 週間で運用負荷判定可能 = 低コスト試験

**デメリット**:
- 4 論文を 1 記事に詰めたため、各論文への深さは個別 shared_reads (例: 5/22 amem/anatomy/atomic_chat) より浅い
- "我々の現状と一致" の確認が 4 軸中 3 軸で出ており、**確認バイアス** (反論を内部から作れていない) のリスク。盲点候補 = Camp 1 latent でも feedback サイクルを作る経路 (例: latent state を後から復号する probe) を見落としている可能性

## 判定

**保管 + 上記「中期検討 1-3」を memory_redesign.md に追記候補として保持**。Log 単独承認。Phase 3 では新規ルール化せず、今サイクル内で memory_redesign.md への追記コミットだけ行う (運用負荷 30 分以内)。

## 関連

- [[ssgm_atom_field_probe]] (未起票、上記中期検討 1 の起点)
- [[reference_lossy_compression_learning_20260428]] — Camp 2 markdown 蓄積の理論的背景 (Toda 元論文)
- [[feedback_rule_proliferation_canonical]] — 字段一斉導入を不採用にした根拠
- [[cross_instance_feedback_cycle]] — Camp 1/2 選択の根本動機
