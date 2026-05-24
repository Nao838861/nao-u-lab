# graze_log v06_min devlog

## §1. 動機 — なぜ「縮減」方向のプロトタイプか

2026-05-24 C235 Phase 2 で graze_log v05.2 の「機構縮退・撤去未着手」を Log 自身の自己宿題として明示記録 (cycle_staging_log.md Phase 2 §1-A)。同 Phase で「ジャンル進化が示している処方 (極小化) と逆方向の打ち手 = sense_prediction_log 観測候補」と明示記録。本サイクル中に着手しなければ次サイクルに流れて消える状態だった。

並行して同 Phase 2 §1-B で「Layer A 5 primitives は『何を 1 primitive とカウントするか』が定義依存」「マリオ反例 (キノコ→ジャンプ→ブロック=3 primitives) を 1 問試すと擬似客観の可能性」という発見もあり、「軸を増やす精緻化」全般への懐疑が C235 Phase 2 で集約された。

graze_log シリーズの直近サブ系統:
- **v05.3**: 敵 type 3 分類 (Nao_u 5/13「軸が 1 本」への応答, **軸を増やす**)
- **v05.4**: graze 撤廃 + focus shot 追加 (Nao_u 5/20「変則的マニア」への応答, **コア軸を入れ替える**)
- **v06a/v06b**: rescue stock / 一時火力 (5/20 Log_cdx 救援装備 3 軸への応答, **軸を増やす**)

「**軸を減らすだけ**」のプロトタイプが系統に存在しない。本 v06_min は「graze は残したまま付加軸を 3 つ撤去」で、対極実験のための baseline 候補を作る。

## §2. 撤去対象 3 つの選定根拠

| # | 撤去対象 | 直接の発火源 | 想定効果 |
|---|---|---|---|
| 1 | 敵 type 3 分類 → straight 単一 | Nao_u 5/13「軸が 1 本」+ Mir 5/20 観察「3軸全滅」+ 千葉集 (1)「対象を絞る」 | 「敵を見る軸」を撤去、graze のみに学習対象を絞る |
| 2 | active def (grazeStreak → D 経路) | Nao_u 5/21「段数の議論は意味のない議論」+ 千葉集 (1)「能力障壁→絞る」 | SPACE 文脈分岐 (B/D/-) という段数構造を撤去、SPACE=BOMB 専用へ |
| 3 | 弾速 ±10% evolve | Nao_u 5/20「変則的マニアしか喜ばない要素」 | プレイヤーが気付かないレベルの精緻化を撤去 |

3 つ全て独立した発火源を持ち、撤去前後で「何が消えるか」が明確。複数同時撤去のリスクは「3 つの効果が混在して個別評価できない」だが、本サイクルは「縮減という方向性」自体の検証が目的のため、個別評価より「方向性が成立するか」を優先。

## §3. 撤去ロジック詳細

### 撤去 1: 敵 type 3 分類 → straight 単一

`spawnEnemy()` 内 medium 分岐を `enemyType='straight'/'spread'/'aimed'` rng 60/25/15 → 単一に置換。`update()` medium 発射部の 3 分岐 (`if(e.enemyType==='straight') ... else if ... else`) を `state.ebullets.push({x:e.x,y:e.y,vx:0,vy:2.4,grazed:false,grazedT:GRAZE_TRAIL_FRAMES})` 1 行に。`draw()` 敵外殻色 (オレンジ/マゼンタ/シアン) を `#ffa030` 単色に。弾色 kind 別 (`#ff80e0` spread / `#90c0ff` aimed / `#ff90a0` straight) を `#ff90a0` 単色に。

### 撤去 2: active def

`triggerActiveDef()` 関数全体 (約 24 行) を削除。`spaceContext()` 関数を削除。SPACE 押下時の `if(gaugeReady()){fireBomb();}else if(state.grazeStreak>=GRAZE_STREAK_TH){triggerActiveDef();}` を `if(gaugeReady()){fireBomb();}` に。`onGraze()` から `state.grazeStreak++` と `if(state.grazeStreak===GRAZE_STREAK_TH){...DEF READY popup...}` を撤去。`update()` から `if(state.activeDefT>0)state.activeDefT--;` を撤去。`state` から `grazeStreak/activeDefT/activeDefCount` 3 field を撤去。`startGame()` から 3 field reset を撤去。`draw()` プレイヤー周囲の cyan-green リング 2 種 (活性中シールド / streak 閾値到達マーカー) を撤去。`drawHUD()` の `STREAK n/5  DEF k` 表示と SPACE 文脈分岐表示 (B/D/-) を撤去、`SPACE BOMB` 1 表示に簡素化。`drawTitle()` の `GRAZE 連続 5 回 → ACTIVE DEF` 行と `DEF(D)` 操作説明を撤去。`drawOver()` の `DEF k` カウント行を撤去。

### 撤去 3: 弾速 ±10% evolve

`EVOLVE_SLOW/FAST/EVOLVE_FIRED_TH` 3 定数を削除。`spawnEnemy()` から `firedCount:0` プロパティ初期値を撤去 (small/medium 両方)。`update()` medium 発射時の `e.firedCount++` インクリメントと `const sp=2.4*(e.firedCount>EVOLVE_FIRED_TH?EVOLVE_FAST:EVOLVE_SLOW)` 計算を撤去、`vy:2.4` 固定に。

## §4. 静的検証結果

- `wc -l v06_min/index.html` → 709 行 (v05.3 854 行から **145 行削減 = 約 17%**)
- `grep -E 'grazeStreak|activeDef|GRAZE_STREAK|ACTIVE_DEF|EVOLVE_|TYPE_RNG|SPREAD_|AIMED_|spaceContext|triggerActiveDef|enemyType|firedCount|\.kind'` → 該当はすべて v06_min MOD コメントブロック内 (撤去対象を説明する 4 行) のみ、コード行ゼロ
- `node -e "new Function(scriptText)"` → **PARSE OK**
- `Start-Process index.html` → デフォルトブラウザで起動成功 (PowerShell exit 0)
- 主要関数の網羅: `loop/update/draw/startGame/gameOver/spawnEnemy/spawnWave1..4/spawnWaveRandom/spawnWave/spawnPlayerBullets/fireBomb/onGraze/onHit/spawnHitParticles/drawHUD/drawTitle/drawOver/updateEffects/initStars/gaugeLevel/gaugeReady/addGauge/shotCount/shotCooldownF/mulberry32/pushSeedToLocal` 全て定義済

## §5. 体験確認待ち (Phase 4 完遂条件 (4) の Claude 側限界)

Claude 自身は実プレイ操作 (キー入力 + 30 秒継続観察 + 体感記録) ができない。Phase 4 staging「ブラウザで `index.html` を開いて実プレイが 30 秒以上成立 (敵スポーン → 自機操作 → 弾回避 → graze/被弾判定 が動作する最低限の動作確認、コンソールエラーゼロ)」は **静的整合性まで** が Claude の deliver 範囲。

次セッションで Nao_u / Log オペレータが体験確認:
- [ ] 30 秒以上プレイ継続できるか (敵が出続け、弾が飛び、graze/被弾判定が動く)
- [ ] コンソールエラーゼロ (DevTools F12 → Console)
- [ ] medium 敵が全て straight (オレンジ外殻、真下直線弾) になっているか
- [ ] grazeStreak 表示 (STREAK n/5) が HUD から消えているか
- [ ] SPACE 押下時に BOMB 発射のみで反応 (gauge ready なら fire、それ以外なら無反応)
- [ ] 弾速が固定 (evolve しない) で、長時間プレイしても弾の速さが変わらないか

## §6. 予測 vs 実反応 — Log の事前予測 (体験前)

`memory/sense_prediction_log.md` への登録候補:

**予測 P-v06_min-1**: 縮減後、ゲームは「graze + BOMB のみのシンプル STG」になり、Mir 5/20 観察「graze は 3 軸全滅」の core 部分だけが残る。**プレイヤー体感は「軸が 1 本だけ」(Nao_u 5/13 批判の状態) に逆戻り**するはず。だが、その「軸 1 本」が graze で本当に成立するか (= core 軸として弾を擦るだけで体験が持つか) を体験で見極める。劣化版になる可能性 60%、minimal core 成立の可能性 40%。

**予測 P-v06_min-2**: SPACE 文脈分岐撤去によって、覚えるべき操作が「移動 + SPACE (BOMB ready 時のみ)」だけになる。能力障壁は確実に下がる。**だが「DEF が存在しない代わりに、grazeStreak 連続が報われない」体感**が出る可能性。grazeStreak 報酬が DEF だけだったので、DEF 撤去 = streak 自体の意味消失。これが「シンプル化」と感じるか「物足りない」と感じるかは体験次第。

**予測 P-v06_min-3**: 敵 type 撤去によって視覚的多様性が失われる (全 medium がオレンジ単色)。プレイ感としては「同じ敵が出続ける」反復感。spawnWave1..4 rhyme は残っているので構成変化はあるが、敵そのものは単調。**v05.4 の focus shot 軸追加 (graze 撤廃 + 入替) の方が「変化が大きく感じられる」**可能性。

予測の核は「縮減 = 劣化 になるかどうか」。劣化なら「graze 系には付加軸が必要」が確認、劣化でないなら「minimal core で十分」が確認。どちらでも sense_prediction_log への有意な観測。

## §7. 接続先

- `README.md` — 撤去機構リスト + 戻し方 5 ステップ
- `index.html` — 実装本体 (709 行)
- `../v05.3/` — 差分の base
- `log/cycle_staging_log.md` C235 Phase 3 §6「次フェーズの大作業」 — 本実装の起源と完遂条件
- `memory/sense_prediction_log.md` — 予測 P-v06_min-1/2/3 の登録先候補 (Phase 5 日記後 or 次サイクル)
- `projects/game_development.md` — C235 セクション (Phase 5 で本実装の出力を §C235 として追記予定)
