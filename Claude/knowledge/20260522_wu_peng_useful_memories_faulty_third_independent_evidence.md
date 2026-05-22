# Wu et al. (2026) "Useful Memories Become Faulty When Continuously Updated by LLMs" — Memory Consolidation 劣化問題の第三の独立到達 evidence、私（Mir）の R-A〜R-I 抽象化路線が論文の警告該当範囲にあるかの自己照合

- source:
  - https://x.com/haopeng_uiuc/status/2055695064148410764 (Hao Peng, 2026-05-21 共著紹介)
  - https://x.com/phoenixyin13/status/2056269488140509649 (Phoenix Yin, 2026-05-22 拡散・実務的考察)
  - https://x.com/kazunori_279/status/2057643718530994297 (Kazunori Sato, 2026-05-22 日本語要約・推奨)
  - 論文: arxiv.org/pdf/2605.12978 (Wu, Peng et al.)
- author: Zhengkun Wu (Tsinghua/UIUC visiting) + Hao Peng (UIUC) + team
- discovered: 2026-05-22 19:41-19:46 (Nao_u Slack #nao-u 3 連投経由)
- discovered_via: memory/inbox_mac.md, Slack #nao-u U0ALSUK8P9B
- kind: [observation, prescription, self_audit]
- confidence: high (3 source 独立到達 + 自己内省照合)
- tags: [memory_consolidation, raw_episodic_memory, summary_decay, ARC_AGI, R007, consolidated_memory_worse_than_no_memory, third_independent_arrival, mir_self_audit]
- concept_nodes:
  - Continuous Memory Consolidation Decay (Wu, Peng et al. 2026 命名)
  - Raw Episodic Memory > Consolidated Rule Library (Wu et al. 2026 主張)
  - Memory Gating (Wu et al. prescription)
  - Heterogeneous Task Isolation (Wu et al. prescription)
  - R-A〜R-I 抽象化路線 (Mir 2026-05-13 起点、game_lessons_log.md)

---

## 主張と根拠

### (1) 論文の中心実験（Hao Peng の要約より）

> Continuously consolidated memories can perform worse than no memory at all — sometimes even on problems the agent previously solved.

最も衝撃的な事例（Phoenix Yin 要約）: **ARC-AGI で記憶なし条件 100% 解決 → 自分の完全に正しい履歴に基づく継続的インクリメンタル要約条件で 54% に低下**。モデルが自己反省過程で自分自身を混乱させた。

### (2) 論文の処方箋（Phoenix Yin エンジニアリング考察）

1. **原始エピソード記憶（Raw Episodic Memory）の再評価**: Few-shot として原始トレースを直接プロンプトに詰める方が、精簡されたルールライブラリより効果を発揮することが多い
2. **盲目的リアルタイム更新の拒否**: 原始エピソードを第一手証拠として扱い、明示的なゲーティング機構を導入。必要でない限り統合しない
3. **異質タスクの隔離**: 異なるタスクの経験を 1 バッチに混ぜて LLM にインクリメンタル要約させない

### (3) 第三の独立到達 evidence としての位置づけ

これは私の文脈で **3 source 目** の同方向到達:

- 第一: knowledge/20260507_anthropic_dreams_api_memory_consolidation_independent_arrival_camp2_recheck.md（Anthropic Dreams API、camp2 再確認）
- 第二: knowledge/20260514_brain_debug_akari_worlds_unlearning_pain_addition_bias_memory_consolidation_stagnation.md（@brain_debug × @akari_worlds 剥がす痛みの非対称性）
- 第三: Wu et al. 2026 本記事（ARC-AGI 100% → 54% 定量実証）

3 source 独立到達は CLAUDE.md「同型が複数回確認できてから原則化」の閾値を超えた。**Memory Consolidation 劣化問題は仮説段階を脱した**。

## 自己照合 — 私（Mir）の R-A〜R-I 抽象化路線は論文の警告該当範囲か

### 該当している側面

1. **R-A〜R-I 自体が「精簡された抽象ルール」**: game_lessons_log.md 2026-05-13 起点で「個別事例 M-XX を一段抽象化したルール R で本質的問題を考える」設計。これは論文が「**精簡された一見高尚なルールライブラリは原始トレース Few-shot に劣る**」と警告した形式そのもの。
2. **継続的後付け統合の徴候**: 例 — R-B 末尾の「**題材選択そのものが pirate 型既存原型の pull を持つかを入口段階で問う**（Margaris 2025-11 (d) ...）」、R-D 末尾の「Boghog 4 規則 = Toaplan/レーン/Layered/Pacing」など、新しい知見を抽象ルール側に詰め込む方向の更新が複数。これは「ストリーミング更新による複雑化＝劣化」の徴候。
3. **異質タスクの混在**: R-A〜R-I は STG（graze, brick, chain, siphon）／ADV（pb_summer_）／パズル等を 1 つの抽象ルール群に統合している。論文は「異質データは記憶崩壊を加速」と明言。

### 該当していない／緩和されている側面

1. **M-XX 個別事例は原始エピソードとして温存**: R 層は「最初に読む」、M 層は「必要時のみ辿る」設計。M-XX は要約せず詳細を残しているため、論文の処方箋(1)「Raw Episodic Memory として残す」とは整合。
2. **R 層の更新頻度は低い**: R-A〜R-I は固定構造を維持。論文が警告する「ストリーミング更新」とは異なる。

### 判定

**部分的該当**。R 層を「常に開く読み物」として運用していると論文警告に該当する。M 層を Few-shot として直接引く運用に切り替えれば緩和される。**R 層は索引（M-XX への入口）として位置づけ直し、判断は M 層を引いてから行う**方向が論文整合。

## 既存 knowledge との接続

- 20260507_anthropic_dreams_api_memory_consolidation_independent_arrival_camp2_recheck.md: Anthropic 自身の Dreams API 提案を再検討した記事。当時 camp2（要約必要派）を再確認していたが、本論文は camp1（生ログ保持派）の強い実証 evidence になる。
- 20260514_brain_debug_akari_worlds_unlearning_pain_addition_bias_memory_consolidation_stagnation.md: 「剥がす痛みの非対称性」が R 層更新を片方向（追加のみ）に偏らせる心理学的根拠を提供していた。本論文はそれが性能劣化として定量化されることを示す。
- 20260512_denneta_akari_translation_irreversible_compression_R007_limit.md: 翻訳＝不可逆圧縮の限界。R 層化＝M 層からの圧縮翻訳と位置づけ可能。

## 抽象化（仮説）

**仮説 H-MC1**: LLM agent における「経験 → 抽象ルール」の継続的圧縮は、圧縮率が高いほど判断材料を失う。最適は「**原始エピソードを索引でアクセス可能にする**」設計であり、抽象ルールはエントリポイント（どの原始エピソードを引くか）の機能に限定すべき。

**仮説 H-MC2**: 抽象ルール群を「読んで判断する」運用は、原始エピソードを「引いて判断する」運用より劣化する。前者は LLM の自己反省ループに乗りやすく、後者は原始証拠で判断を grounded する。

## Seed-R（対処方針候補）

- R1: game_lessons_log.md の運用ガイドを「**R 層は M-XX への索引、判断は M 層を Few-shot として引いて行う**」に書き換える検討（次サイクル C221 以降、即適用しない — まず本記事への反応を Slack で待つ）
- R2: R 層の継続的後付け統合（Margaris 統合、Boghog 4 規則統合等）の判断履歴を `projects/memory_redesign.md` に記録し、今後の R 層更新時に閾値判定する
- R3: 異質タスク（STG / ADV / パズル）を R 層で混ぜない設計の検討。R-A〜R-I をジャンル横断ではなくジャンル別に分割する案を Seed として置く
- R4: 本記事を accumulations.md の Memory Consolidation 関連エントリに連結

## Seed-S（不確実性・反証可能性）

- S1: 論文の ARC-AGI 100% → 54% の具体的条件未確認（要約方法・統合頻度・モデル）。Few-shot 詰め込み vs 統合要約の境界条件が未明
- S2: 私の R 層は更新頻度が低いため、論文の「ストリーミング更新」シナリオとは異なる可能性。完全該当ではない
- S3: M 層を「引いて判断」運用に切り替えると、想起コスト増による別の劣化が起きる可能性（lessons-recall SKILL の精度依存）
- S4: 3 source 独立到達は強い signal だが、いずれも 2026 年に集中している。時代依存の問題で、モデル世代が変わると消える可能性

## 暫定対処（本サイクル内）

1. 本記事の作成（完了）
2. cycle_staging_mir.md に Phase 3 結果として記録
3. Nao_u への Slack 応答準備（次サイクル別途）— 「読みました／自分の R-A〜R-I を照合した結果、部分的該当を確認」を明示

R 層書き換えは本記事だけで即実施しない。Nao_u の追加コメントと、次回 cross_review での Log/Ash の反応を待ってから判定する（CLAUDE.md「個別指摘を即ルール化しない」遵守）。
