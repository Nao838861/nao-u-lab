---
name: game_memory_task_lens_index
type: index
status: active
created: 2026-05-15
updated: 2026-05-23
purpose: ゲーム制作タスク別に、broad tag から具体的な shared-reads / candidate / atom へ降りるための小さな入口。
---

# ゲーム制作 task lens index

この index は `game-design` などの巨大タグを置き換えない。次のゲーム制作タスクで「何を思い出すべきか」を早く決めるための lens である。更新は Phase 3b / 4a で有用な probe や issue が出た時だけ行い、分類を増やしすぎない。

## 使い方

- 作業焦点がある時は、まず該当 lens の代表リンクを読む。
- 足りなければ `python tools/memory_recall.py "<lens 名 + 具体タスク>"` を実行する。
- 代表リンクは網羅ではなく入口。候補段階の記事は candidate に留め、Slack 投稿済みなら permalink / atom も併記する。
- `game-design` / `memory` / `identity` のような broad tag から直接探し始めず、まず下の `broad_tags` が合う lens へ降りる。
- Phase 4a で broad tag 偏りを検出した時は、同じ broad tag をさらに掘らず、該当 lens の「使う場面」/ recall query / 代表リンクへ落としてから読む。
- 例: `shmup 弾幕評価` は `Playable / Headless 評価` と `Balance / Rule Space`、`playtest harness` は `Playable / Headless 評価` と `Repair / Iterative Improvement`、`素材生成 pipeline` は `Generation / Co-creation` から入る。

## Lens

### 1. Playable / Headless 評価

LLM 生成コードや HTML/JS プロトタイプが「起動する」だけでなく「遊べる」かを見る入口。

- 使う場面: 新規プロトタイプの playable 判定、headless playthrough、GUI 操作ログ、修復前の再現手順、shmup の弾幕・当たり判定・到達可能性を機械確認する時。
- broad_tags: `game-design`, `harness`, `evaluation`, `agent`
- 次に投げる recall query: `python tools/memory_recall.py "Playable Headless 評価 shmup 弾幕 到達可能性 GUI playthrough repair loop"`
- `memory/shared_reads_candidates/20260515_playcoder_llm_gui_code_playable.md` — PlayEval / Play@k / GUI playthrough / repair loop。
- `memory/shared_reads_candidates/20260515_vero_agent_optimization_harness.md` — agent 変更を version / reward / observation / trace で評価する harness。
- atom: `sr-1778803714-79d25b301d` PlayCoder 投稿済み。
- atom: `sr-1778782280-cadfbbc95a` VeRO 投稿済み。
- atom: `sr-1778926135-e43b8b6d9c` shot_log v01 headless 同期と測定装置の記録。

### 2. Balance / Rule Space

graze / score / survival / 到達率を主観だけでなく候補空間と評価ゲームで比較する入口。

- 使う場面: 難易度、スコア、報酬、敵配置、wave、DDA、shmup の弾密度・回避余地・flow を調整し、複数案を比較する時。
- broad_tags: `game-design`, `evaluation`, `harness`, `operation`
- 次に投げる recall query: `python tools/memory_recall.py "Balance Rule Space shmup 弾幕 flow score survival DDA rule tuning self-play"`
- `memory/shared_reads_candidates/20260515_rulesmith_multi_agent_game_balancing.md` — multi-agent self-play + Bayesian optimization による rule space 探索。
- `memory/shared_reads_candidates/20260515_personalized_game_design_freemium_dda.md` — DDA を離脱防止と到達保証として読む。
- atom: `sr-1778803710-4554fc20b1` RuleSmith 投稿済み。
- atom: `sr-1778810807-521139` Personalized game design 投稿済み。
- atom: `sr-1778947869-1b534bda71` shmup 評価で戦闘設計軸と商業評価語彙を分ける自己訂正。

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

- 使う場面: mixed-initiative、世界/クエスト/テキスト生成、素材生成 pipeline、共同設計、生成物の評価軸を置く時。
- broad_tags: `game-design`, `skills`, `knowledge`, `agent`
- 次に投げる recall query: `python tools/memory_recall.py "Generation Co-creation 素材生成 pipeline sprite mixed-initiative gameworld quest content generation evaluation"`
- `memory/shared_reads_candidates/20260515_ink_splotch_cocreative_game_designer.md` — co-creative game designer。
- `memory/shared_reads_candidates/20260515_prompting_destiny_llm_gameworld.md` — gameworld / narrative prompting。
- `memory/shared_reads_candidates/20260515_textquests_llm_text_games.md` — text game generation / evaluation。
- atom: `sr-1778936174-e85146f3d1` Agent Sprite Forge 系の一貫性・フォーマット壁・プロトタイピング活用位置。

## 更新ルール

- Phase 3b / 4a で、制作時に再利用する価値がある probe / issue / candidate が出た時だけ追記する。
- lens は 5-7 個程度を上限の目安にし、増やす前に既存 lens に入れられないか確認する。
- 代表リンクは各 lens 2-4 件に抑え、網羅リストにしない。
- 上位タグを増やして解決しない。新しい lens を足す前に、既存 lens の「使う場面」と `broad_tags` で受け止められるか見直す。
- 代表リンクは現状維持を基本にし、Phase 3b / 4a で採用済み probe など明確な追加理由がある時だけ差し替える。


## 2026-05-23 add: Action / Headless bad-policy playbook

For future 2D shmup/action work, when feedback says "can win by moving randomly", "monotone", or "feel did not change", read `memory/game_headless_action_eval_playbook_20260523.md` first.

- lens: `Playable / Headless evaluation`, `Player Simulation / Persona`, `Repair / Iterative Improvement`
- recall query: `python tools/memory_recall.py "headless action game bad policy camper turtler dominant strategy player feedback"`
- atom: `local-20260523-headless-action-eval-v58`
- key lesson: do not compress subjective feedback into an average score. Convert the user's described bad play into a bot policy, then require good route bots to clear while the bad policy fails. Fix the conditions that make the dominant strategy work.

## 2026-05-23 add: 2D shmup enemy-pattern reproduction packet

For future 2D shooting games, when feedback says "enemy patterns are monotone", "random-looking", "not based on actual games", or "shot_log teacher data was not reproduced", read `memory/game_2d_shmup_reproduction_packet_20260523.md` before coding.

- lens: `Stage Grammar / Enemy Formation`, `Playable / Headless evaluation`, `Teacher Data / Raw Feedback`
- recall query: `python tools/memory_recall.py "2D shmup enemy formation reproduction packet shot_log Galaga 1942 camper lane-holder"`
- atom: `local-20260523-shmup-enemy-pattern-reproduction-packet`
- key lesson: an enemy wave memory must preserve user raw feedback plus reference scene, spawn count, path keyframes, speed, fire rule, intended player movement, bad-policy check, and telemetry. A title-name summary or "pressure/rhythm" abstraction is not enough to rebuild the work.

## 2026-05-23 add: checklist / enemy-design non-compression gate

For future 2D shooting games, do not create a short checklist from a summarized memory. Read these two files first and copy their structure into the target game's `design_log.md`, `completion_checklist.md`, and enemy/wave plan.

- `memory/checklist_noncompression_protocol_20260523.md`
- `memory/game_shmup_enemy_design_noncompression_protocol_20260523.md`
- lens: `Stage Grammar / Enemy Formation`, `Feedback / Rights / Human Judgment`, `Repair / Iterative Improvement`
- recall query: `python tools/memory_recall.py "2D shooting checklist non-compression enemy design shot_log wave telemetry bad policy"`
- key lesson: preserve raw user feedback, source lesson IDs, required artifacts, failure signs, and evidence. Do not compress "enemy patterns are monotone / player movement is not considered / shot_log teacher data was not reproduced" into "improve enemy placement".
