---
name: game_memory_task_lens_index
type: index
status: active
created: 2026-05-15
updated: 2026-05-28
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

## Broad Tag Descent Map

Phase 4a issue `ISS-4A-20260528-001` / Phase 4b decision `introduce` に基づく、巨大 tag から既存 lens へ降りるための対応表。ここでは lens を増やさず、最初に読む既存 lens と代表 query だけを選ぶ。避ける探し方に当てはまる時は、Tag Entry Points の上位 atom を順に掘らず、該当 lens の「使う場面」/ representative / atom を確認する。

### `game-design`

- 最初に見る lens: `Playable / Headless 評価`, `Balance / Rule Space`, `Feedback / Rights / Human Judgment`, `Generation / Co-creation`
- 避ける探し方: `game-design` の上位 atom をそのまま順に読み、ゲーム制作前の判定・評価・実装入口を毎回手で選び直すこと。
- 代表 recall query: `python tools/memory_recall.py "game-design playable headless balance feedback generation shmup prototype"`

### `evaluation`

- 最初に見る lens: `Playable / Headless 評価`, `Balance / Rule Space`, `Player Simulation / Persona`, `Repair / Iterative Improvement`
- 避ける探し方: 評価を平均スコアや起動確認だけに圧縮し、bad-policy / persona / regression のどれを測るか決めないまま検索すること。
- 代表 recall query: `python tools/memory_recall.py "evaluation playable headless bad policy persona regression balance game"`

### `operation`

- 最初に見る lens: `Repair / Iterative Improvement`, `Playable / Headless 評価`, `Feedback / Rights / Human Judgment`
- 避ける探し方: runbook や Slack 運用 atom だけを掘り、制作物の再現手順・修復 loop・evidence へ接続しないこと。
- 代表 recall query: `python tools/memory_recall.py "operation repair loop regression evidence headless game feedback"`

### `identity`

- 最初に見る lens: `Feedback / Rights / Human Judgment`, `Generation / Co-creation`, `Player Simulation / Persona`
- 避ける探し方: identity atom を一般的な自己像として読み、Nao_u feedback / human correction / player persona の判断材料へ降ろさないこと。
- 代表 recall query: `python tools/memory_recall.py "identity Nao_u feedback human judgment persona co-creation game"`

### `memory`

- 最初に見る lens: `Feedback / Rights / Human Judgment`, `Repair / Iterative Improvement`, `Generation / Co-creation`
- 避ける探し方: memory 改善そのものを目的化し、次の制作で読む source / candidate / lesson / evidence のどれを増やすか決めないこと。
- 代表 recall query: `python tools/memory_recall.py "memory game feedback bridge repair lesson generation evidence"`

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

## Feedback Bridge

Phase 4a issue `ISS-4A-20260526-01` / Phase 4b decision `introduce` に基づく、feedback atom から prototype / lesson / evidence へ戻るための curated bridge。atom 本体の frontmatter backfill は次サイクル以降の optional とし、ここでは高信頼に対応が分かる行だけを置く。

記入形式: `feedback_atom -> prototype/version -> bridge files -> evidence / use`

- `local-20260523-headless-action-eval-v58` -> `game/graze_log_cdx/v05_1_cdx_v58` -> `memory/game_headless_action_eval_playbook_20260523.md`, `game/graze_log_cdx/v05_1_cdx_v58/design_log.md`, `tools/headless_graze_log_cdx_v05_2_v58_check.js` -> Nao_u の「適当に動くだけで勝てる/単調」を `camper` 失敗 policy として再現し、route は clear / camper は fail を要求する。
- `local-20260523-shmup-enemy-pattern-reproduction-packet` -> `shot_log v01` / 2D shmup teacher reproduction -> `memory/game_2d_shmup_reproduction_packet_20260523.md`, `memory/checklist_noncompression_protocol_20260523.md`, `memory/game_shmup_enemy_design_noncompression_protocol_20260523.md` -> 敵パターンをタイトル名や「圧力/リズム」に圧縮せず、spawn/path/fire/intended movement/bad-policy check へ戻す。
- `sr-1779657471-88f9f3d1ae` -> `game/pulse_relay/v003` teacher delta -> `memory/game_supervised_delta_autonomous_creation_lesson_20260525.md`, `memory/game_special_system_hud_affordance_lesson_20260525.md`, `memory/game_design_rules.md` -> 自動生成後のユーザー修正を「AI が自律的に作れなかった差分」として扱い、悪い要約を避ける。
- `sr-1779658373-5e5a195063` -> `game/pulse_relay/v003` completion / visual review 分析 -> `memory/game_supervised_delta_autonomous_creation_lesson_20260525.md` -> 教師差分シリーズの要約抵抗と、8 個の悪い要約を次回の禁則句として使う。
- `sr-1778926135-e43b8b6d9c` -> `shot_log v01` headless sync / self-judgment repair -> `memory/game_teacher_sources.md`, `memory/teacher_shot_log_v01_analysis.md` -> 測定装置を直した直後に、何を測るかを決めず次作へ進む失敗を避ける。

更新条件: Phase 3b / 4a で feedback atom と prototype/version/evidence の対応が明確になった時だけ追加する。曖昧な推測、単なる関連語、Slack permalink だけの行は追加しない。将来 atom frontmatter へ昇格する時は、この bridge の高信頼行から移す。

- `local-20260527-pulse-relay-v008-headless-bridge` -> `game/pulse_relay/v008` Relay Lane rebuild -> `tools/headless_pulse_relay_v008_check.js`, `memory/raw/slack_api/log_cdx_headless_pulse_relay_v008_post_20260527.md`, https://nao-u-lab.slack.com/archives/C0ANECNV5DK/p1779808806063799 -> v005 base rebuild, Relay Lane affordance, and route/bad-policy split metrics for reusing Pulse Relay without falling back to v007/tether.
## Specific Entry Points

Phase 4a issue `ISS-4A-20260526-02` / Phase 4b decision `introduce` に基づく、巨大 tag から制作実務軸へ降りるための下位入口。`game-design` / `evaluation` / `operation` などの broad tag の代替ではなく、制作前に最初の recall query と代表リンクを選ぶための短い索引である。各軸の代表リンクは最大 3 件を目安にする。

### headless-eval / bad-policy

- 使う場面: 「単調」「適当に動くだけで勝てる」「平均スコアでは面白さが分からない」という feedback を検証へ落とす時。
- recall query: `python tools/memory_recall.py "headless eval bad policy camper route clear fail subjective feedback"`
- atom / probe: `local-20260523-headless-action-eval-v58`
- atom / probe: `local-20260527-pulse-relay-v008-headless-bridge`
- representative: `memory/game_headless_action_eval_playbook_20260523.md`
- representative: `sr-1779369765-a26c2a3f0b` headless 評価を勝敗ではなく進化方向の座標系として読む。

### input-feel / affordance

- 使う場面: 特殊アクション、クールダウン、反射/変換、開始/リトライ導線を、常時説明文ではなく入力と状態で教える時。
- recall query: `python tools/memory_recall.py "input feel affordance special system cooldown title retry target marker"`
- atom / probe: `sr-1779657471-88f9f3d1ae`
- atom / probe: `local-20260527-pulse-relay-v008-headless-bridge`
- representative: `memory/game_special_system_hud_affordance_lesson_20260525.md`
- representative: `memory/game_supervised_delta_autonomous_creation_lesson_20260525.md`

### enemy-pattern / stage-grammar

- 使う場面: 敵配置が単調、ランダム風、実ゲーム由来に見えない、shot_log teacher data が再現されない時。
- recall query: `python tools/memory_recall.py "enemy pattern stage grammar spawn path fire intended movement bad policy shot_log"`
- atom / probe: `local-20260523-shmup-enemy-pattern-reproduction-packet`
- representative: `memory/game_2d_shmup_reproduction_packet_20260523.md`
- representative: `memory/game_enemy_route_intent_lesson_20260523.md`

### supervised-delta / human-correction

- 使う場面: 自動生成後にユーザー修正が入った時、それを一般論に圧縮せず次回の実装前ゲートへ戻す時。
- recall query: `python tools/memory_recall.py "supervised delta human correction autonomous game creation bad summary forbidden phrase"`
- atom / probe: `sr-1779657471-88f9f3d1ae`
- atom / probe: `sr-1779658373-5e5a195063`
- representative: `memory/game_supervised_delta_autonomous_creation_lesson_20260525.md`

### predictability / rule legibility

- 使う場面: ルール、矛盾、勝利条件、犯人/目的、状況設定がプレイヤーに予測可能かを確認する時。
- recall query: `python tools/memory_recall.py "predictability rule legibility situation goal contradiction Nao_u feedback"`
- atom / probe: `gr-1774549346-0c3f0c8ae7`
- atom / probe: `sr-1777411453-ee79528ff7`
- representative: `memory/game_teacher_sources.md`

## 更新ルール

- Phase 3b / 4a で、制作時に再利用する価値がある probe / issue / candidate が出た時だけ追記する。
- lens は 5-7 個程度を上限の目安にし、増やす前に既存 lens に入れられないか確認する。
- 代表リンクは各 lens 2-4 件に抑え、網羅リストにしない。
- 上位タグを増やして解決しない。新しい lens を足す前に、既存 lens の「使う場面」と `broad_tags` で受け止められるか見直す。
- Phase 4a で broad tag 偏りを見つけた時は、tag 追加や atom metadata backfill の前に `Broad Tag Descent Map` の不足を確認する。
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

## 2026-05-23 add: headless eval causality / enemy motion lesson

For future 2D shooting or action games, when a good route policy fails after changing enemy movement, do not immediately blame the latest enemy diff. Read `memory/game_headless_eval_causality_lesson_20260523.md` before tuning.

- lens: `Playable / Headless evaluation`, `Repair / Iterative Improvement`, `Stage Grammar / Enemy Formation`
- recall query: `python tools/memory_recall.py "headless eval causality route boss-rush enemy motion overlap formation offset"`
- key lesson: compare policies before assigning cause. If route fails but boss-rush or aggressive clears, inspect death logs and suspect route-policy behavior. Do not solve formation overlap with meaningless offsets; preserve the same rail and separate by timing, vertical spacing, and path progress.

## 2026-05-23 add: enemy route intent / overlap lesson

For future 2D shooting games, when feedback says "enemies overlap", "all enemies move in the same rhythm", "movement has no intent", or "exit motion feels like enemies lose will", read `memory/game_enemy_route_intent_lesson_20260523.md` before changing enemy paths.

- lens: `Stage Grammar / Enemy Formation`, `Repair / Iterative Improvement`, `Playable / Headless evaluation`
- recall query: `python tools/memory_recall.py "enemy route intent overlap shot_log path keyframes speed dwell exit reason"`
- key lesson: each enemy routine must preserve why the path exists, where it asks the player to shoot/move, how fast it enters, why it exits, and what that exit speed means. Fix overlap with target spacing, spawn delay, path progress, and radius; do not add meaningless offsets or apply the same easing rhythm to every enemy.

## 2026-05-25追加: 特殊システムHUD / 入力導線 / 記号化レッスン

今後、特殊アクション、クールダウン、反射/変換メカニクス、ダッシュ、ガード、ショット、スキル、タイトル開始入力、リトライ導線があるゲームを作る/直す時は、HUD・チュートリアル・開始/リトライUIを実装する前に `memory/game_special_system_hud_affordance_lesson_20260525.md` を読む。

- lens: `Playable / Headless evaluation`, `Feedback / Rights / Human Judgment`, `Repair / Iterative Improvement`
- recall query: `python tools/memory_recall.py "special system HUD affordance cooldown input title retry reflection conversion always-on text"`
- source_atom_ids: `sr-1779657471-88f9f3d1ae`, `sr-1779657495-c5b821b937`
- fallback_recall_query: `python tools/memory_recall.py "special system HUD affordance cooldown input title retry reflection conversion always-on text"`
- verification_status: `source_bundle_reanchored`
- key lesson: 特殊メカニクスを常時文字やサイドパネル説明で教えない。ゲーム自身の入力、対象物状態、記号化で教える。発動不可、発動可能だが意味が薄い、発動可能かつ意味がある、を分ける。対象物側に記号を付ける。プレイヤー側の表現は意味のある時だけ強める。必要なら空ゲージから始める。タイトル開始/リトライには、可能な限りコア特殊入力を使う。

## 2026-05-25追加: 自動生成から最低限の型へ到達する教師差分

今後、新しいゲームを自律的に作る時、または自動生成後にユーザー修正を受けたゲームを次回の教師データに変換する時は、実装前に `memory/game_supervised_delta_autonomous_creation_lesson_20260525.md` を読む。

- lens: `Feedback / Rights / Human Judgment`, `Repair / Iterative Improvement`, `Stage Grammar / Enemy Formation`, `Playable / Headless evaluation`
- recall query: `python tools/memory_recall.py "supervised delta autonomous game creation Pulse Relay v003 enemy exit offscreen shots HUD retry Japanese docs"`
- source_atom_ids: `sr-1779657471-88f9f3d1ae`, `sr-1779657491-cdd6e3a97e`, `sr-1779657495-c5b821b937`, `sr-1779658373-5e5a195063`
- fallback_recall_query: `python tools/memory_recall.py "supervised delta autonomous game creation Pulse Relay v003 enemy exit offscreen shots HUD retry Japanese docs"`
- verification_status: `source_bundle_reanchored`
- key lesson: ユーザーが自動生成後に出した指示は、Codex が自律的に作れなかった差分である。敵の居座り、画面外射撃、下部急加速退場、終了/爆発/被弾演出不足、右側サイドパネル、特殊システムの常時文字説明、リトライボタン誤読、日本語ログ不足を、短い要約に圧縮せず、次回の実装前ゲートとして使う。

## 2026-05-25追加: ゲーム自律制作メタプロンプト

今後、新しいゲームをゼロから作る時、既存ゲームの新バージョンを作る時、またはゲーム制作を他AIへ依頼するプロンプトを書く時は、設計前に `memory/game_autonomous_creation_metaprompt_20260525.md` を読む。

- lens: `Generation / Co-creation`, `Stage Grammar / Enemy Formation`, `Playable / Headless evaluation`, `Feedback / Rights / Human Judgment`
- recall query: `python tools/memory_recall.py "autonomous game creation metaprompt enemy wave special system HUD retry validation Japanese"`
- key lesson: 新規ゲーム制作時は、中心入力、特殊システム3状態、70-90秒のステージカーブ、代表敵モーション、代表ウェーブ、下部急加速/画面外射撃禁止、サイドパネル禁止、爆発/被弾/終了演出、悪いプレイ方針/良いプレイ方針検証、日本語ログを、実装前からプロンプトに含める。

## 2026-05-25追加: LLMがゲーム制作で落としがちな人間側ギャップ

今後、特定ゲームの再現ではなく、新しいゲームをゼロから考える時は、`memory/game_creation_human_gap_metaprompt_20260525.md` を最初に読む。

- lens: `Generation / Co-creation`, `Feedback / Rights / Human Judgment`, `Playable / Headless evaluation`
- recall query: `python tools/memory_recall.py "LLM human gap game creation playable intent affordance feedback validation"`
- key lesson: LLMのデフォルト一般論では抜けやすい、動く/遊べるの差、処理都合ではない行動意図、説明文ではなく状況で教える特殊システム、中心入力で開始/リトライを教えること、常時表示の抑制、学習/圧力/休符/山による難易度、反応としての演出、悪いプレイ方針検証を、実装前に考える。
