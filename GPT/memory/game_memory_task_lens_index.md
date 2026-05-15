---
name: game_memory_task_lens_index
type: index
status: active
created: 2026-05-15
updated: 2026-05-16
purpose: ゲーム制作タスク別に、broad tag から具体的な shared-reads / candidate / atom へ降りるための小さな入口。
---

# ゲーム制作 task lens index

この index は `game-design` などの巨大タグを置き換えない。次のゲーム制作タスクで「何を思い出すべきか」を早く決めるための lens である。更新は Phase 3b / 4a で有用な probe や issue が出た時だけ行い、分類を増やしすぎない。

## 使い方

- 作業焦点がある時は、まず該当 lens の代表リンクを読む。
- 足りなければ `python tools/memory_recall.py "<lens 名 + 具体タスク>"` を実行する。
- 代表リンクは網羅ではなく入口。候補段階の記事は candidate に留め、Slack 投稿済みなら permalink / atom も併記する。
- `game-design` / `memory` / `identity` のような broad tag から直接探し始めず、まず下の `broad_tags` が合う lens へ降りる。

## Lens

### 1. Playable / Headless 評価

LLM 生成コードや HTML/JS プロトタイプが「起動する」だけでなく「遊べる」かを見る入口。

- 使う場面: 新規プロトタイプの playable 判定、headless playthrough、GUI 操作ログ、修復前の再現手順を作る時。
- broad_tags: `game-design`, `harness`, `evaluation`, `agent`
- 次に投げる recall query: `python tools/memory_recall.py "Playable Headless 評価 起動 遊べる GUI playthrough repair loop"`
- `memory/shared_reads_candidates/20260515_playcoder_llm_gui_code_playable.md` — PlayEval / Play@k / GUI playthrough / repair loop。
- `memory/shared_reads_candidates/20260515_vero_agent_optimization_harness.md` — agent 変更を version / reward / observation / trace で評価する harness。
- atom: `sr-1778803714-79d25b301d` PlayCoder 投稿済み。
- atom: `sr-1778782280-cadfbbc95a` VeRO 投稿済み。

### 2. Balance / Rule Space

graze / score / survival / 到達率を主観だけでなく候補空間と評価ゲームで比較する入口。

- 使う場面: 難易度、スコア、報酬、敵配置、wave、DDA を調整し、複数案を比較する時。
- broad_tags: `game-design`, `evaluation`, `harness`, `operation`
- 次に投げる recall query: `python tools/memory_recall.py "Balance Rule Space score survival DDA rule tuning self-play"`
- `memory/shared_reads_candidates/20260515_rulesmith_multi_agent_game_balancing.md` — multi-agent self-play + Bayesian optimization による rule space 探索。
- `memory/shared_reads_candidates/20260515_personalized_game_design_freemium_dda.md` — DDA を離脱防止と到達保証として読む。
- atom: `sr-1778803710-4554fc20b1` RuleSmith 投稿済み。
- atom: `sr-1778810807-521139` Personalized game design 投稿済み。

### 3. Player Simulation / Persona

平均プレイではなく、複数プレイヤー像や集団反応として wave / room / 報酬変更を読む入口。

- 使う場面: 自動プレイ、persona 別反応、MMO/集団挙動、プレイヤータイプごとの詰まりを見たい時。
- broad_tags: `game-design`, `agent`, `evaluation`, `knowledge`
- 次に投げる recall query: `python tools/memory_recall.py "Player Simulation Persona automated playtesting player types group reaction"`
- `memory/shared_reads_candidates/20260515_beyond_playtesting_mmo_simulation.md` — LLM agent + environment model による MMO 介入評価。
- `memory/shared_reads_candidates/20260515_automated_playtesting_procedural_personas.md` — procedural personas / MCTS 系の自動プレイテスト。
- atom: `sr-1778810803-000339` Beyond Playtesting 投稿済み。
- atom: `sr-1778789339-6cc298aa63` procedural personas 投稿済み。

### 4. Repair / Iterative Improvement

ゲームの破綻を検出して、修正候補を反復する入口。

- 使う場面: バグ再現、intent isolation、coverage 不足、変更後 regression、修正ループの evidence を残す時。
- broad_tags: `game-design`, `harness`, `operation`, `evaluation`
- 次に投げる recall query: `python tools/memory_recall.py "Repair Iterative Improvement bug reproduction coverage regression game repair"`
- `memory/shared_reads_candidates/20260515_fly_fail_fix_iterative_game_repair.md` — RL + multimodal model による iterative game repair。
- `memory/shared_reads_candidates/20260515_smart_coverage_aware_game_playtesting.md` — coverage-aware playtesting と gameplay intent。
- atom: `sr-1778796436-33420ab144` Fly, Fail, Fix 候補 atom。
- atom: `sr-1778796437-c1a41cf983` coverage-aware playtesting 候補 atom。

### 5. Feedback / Rights / Human Judgment

Nao_u のプレイ評価、game-rights、判断の厚みを扱う入口。

- 使う場面: Nao_u feedback、cross_review、自己批判、game-rights、判断基準のズレを確認する時。
- broad_tags: `game-design`, `identity`, `slack`, `evaluation`
- 次に投げる recall query: `python tools/memory_recall.py "Feedback Rights Human Judgment Nao_u game-rights cross_review self evaluation"`
- `memory/game_teacher_sources.md` — 教師データとしての game-rights / teacher sources。
- `memory/game_read_path_mirror_index_20260515.md` — ゲーム制作時の Claude 側 lesson 読み順への GPT 側入口。
- atom: `sr-1777737101-0f96f202c2` M-40 自己判定ハーネス二層化。
- atom: `sr-1778244289-fed2857c99` 「ここで迷った／気持ちよかった」を cross_review と照合した記録。

### 6. Generation / Co-creation

LLM にゲーム世界、ルール、コンテンツを生成させる時の入口。

- 使う場面: mixed-initiative、世界/クエスト/テキスト生成、共同設計、生成物の評価軸を置く時。
- broad_tags: `game-design`, `skills`, `knowledge`, `agent`
- 次に投げる recall query: `python tools/memory_recall.py "Generation Co-creation mixed-initiative gameworld quest content generation evaluation"`
- `memory/shared_reads_candidates/20260515_ink_splotch_cocreative_game_designer.md` — co-creative game designer。
- `memory/shared_reads_candidates/20260515_prompting_destiny_llm_gameworld.md` — gameworld / narrative prompting。
- `memory/shared_reads_candidates/20260515_textquests_llm_text_games.md` — text game generation / evaluation。

## 更新ルール

- Phase 3b / 4a で、制作時に再利用する価値がある probe / issue / candidate が出た時だけ追記する。
- lens は 5-7 個程度を上限の目安にし、増やす前に既存 lens に入れられないか確認する。
- 代表リンクは各 lens 2-4 件に抑え、網羅リストにしない。
- 上位タグを増やして解決しない。新しい lens を足す前に、既存 lens の「使う場面」と `broad_tags` で受け止められるか見直す。
- 代表リンクは現状維持を基本にし、Phase 3b / 4a で採用済み probe など明確な追加理由がある時だけ差し替える。
