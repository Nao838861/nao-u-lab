# log_autonomous_game v002 — completion_report.md

**作成**: 2026-05-27 C249 Phase 4 (Log)
**対象**: `game/log_autonomous_game/v002/` (Echo-Path v002)
**用途**: Nao_u 出荷時点で「v002 として何を提示するか／提示しないか」を分節記述する出荷文書。Pulse Relay v003 教師差分 §「What this proves / does not prove」順守。

## 0. 一行コンセプト

> 過去 1 秒の動きが「未来の道」になり、その線を弾幕の中で踏み抜けたら危機回避 — **1 秒先の自分の到達予定地点に賭ける、賭けに勝てば短時間の安全圏を得る** ごっこ遊び (`design_log.md` Q-D0)。

## 1. v002 出荷スコープ

### 1.1 中心入力 / 副入力
- 中心入力: `Space` (castLock 発動)。タイトル開始・リトライも同じ Space 1 系
- 副入力: 矢印キー / WASD (4 キーで 1 つの移動系)
- 追加機能キー・マウス・画面内ボタンなし (`game.js` 上で物理確認、Q-A 採点 5/5)

### 1.2 メカニクス3点
1. **castLock**: Space 押下時刻のプレイヤー位置から過去 1 秒 (`ECHO_FRAMES=60`) の trail を「未来の道」として記録、以後 1 秒間 player の入力をロックして trail を再演 (`game.js` §castLock/echo)
2. **危機回避判定**: 再演中に敵弾と接触なく抜けきれば hit、再演開始時点で画面内に敵弾が存在した hit は「危機回避」テキスト 45 フレーム表示 (Q-成功FB 状態3)
3. **3 wave 種別 × 3 phase 時間カーブ**:
   - phase 0 (0-20s): A (縦進行) のみ — 学習
   - phase 1 (20-50s): A + D (横断) ローテ — 縦横の脅威同居
   - phase 2 (50-90s): A + D + C (ダイブ + sin 横揺れ) ローテ — 展開軸成立
   - `WAVE_TIMELINE` 配列 + `currentPhase()` + `spawnNextWave()` で time-based dispatch (`game.js:42-46`)
   - wave clear → 8 秒静寂 (`WAVE_REST_FRAMES=480`) ガード後に次 wave (`game.js:613`)

### 1.3 視覚階差 (Q-成功FB 3 状態)
| 状態 | トリガ | 色 | 形状 | 持続 |
|---|---|---|---|---|
| 1 (発動不可) | `trail.length < ECHO_FRAMES` | グレー (150,155,165) | 閉じていく弧 | 常時 (足跡溜まる間) |
| 2 (意味薄 hit) | castLock hit && 画面内に敵弾なし | シアン薄 (140,230,255) | 膨張リング 0.5s | 30 フレーム |
| 3 (危機回避 hit) | castLock hit && 画面内に敵弾あり | シアンフル | テキスト「危機回避」 | 45 フレーム |

### 1.4 1 原則「内側→外側流出」完全達成
- 1 秒先計算結果はプレイ画面に流出しない (予測軌道線・×印・ゴースト末端マーカー全て非表示)
- タイトル画面も同様 (v001 にあった「未来ゴースト + 結線」を v002 Δ-1 で削除)
- `bullet_origin_audit.js` `c_shots_zero` PASS = 敵 C 追加でも弾源負荷増えていない (本体接触のみ、敵 C 弾数 0/90s)
- 出典: [memory/feedback_inside_to_outside_leak.md](../../../memory/feedback_inside_to_outside_leak.md)

### 1.5 同梱 audit / verify (全 PASS)
| script | 役割 | 結果 |
|---|---|---|
| `verify.js` | 悪手 4 方針 (camper / lane-holder / blind-sweeper / nospecial) 全 wave 1 内 fail 確認 | `pass: true`, exit 0 (90s シミュ) |
| `bullet_origin_audit.js` | 弾源画面内 + 退場前のみ、敵 C 弾数ゼロ、最大 enemy step < player_speed | 10/10 check PASS, exit 0 |
| `enemy_behavior_audit.js` | A/D/C 各 spawn 範囲 + 速度不変式 + 退場条件 | 8/8 case PASS, exit 0 (敵 C の sin oscillation ±60px 不変式含む) |
| `agent_difficulty_proxy.js` | 素朴良手 agent 30 試行中央値 (arXiv:2410.02829 Wordle/Slay 翻訳) | 30/30 完走, exit 0, median_clear_wave=1, median_play_time=9.28s, survival_rate=0/30 |

## 2. 自己採点サマリ (詳細は [self_judgment.md](self_judgment.md))

- **5 ゲート合計: 26.5/30 (88%)** — Q-C 新設で分母 25→30
  - Q-A 中心入力 5/5、Q-導入 4.5/5、Q-成功FB 状態3 3/5、Q-C 敵出現退場 4.5/5、Q-D 弾源 4.5/5、Q-E レイアウト 5/5
- **Q-ミミクリ: 11.5/15 (77%)** — Q-ミミクリ-1 (核を上回るメカ改修なし) 5/5 到達、-2/-3 は実機判定なしで頭打ち
- **展開差カーブ: 21/25 (84%)** — 「反復」根本解消が C247 3/5 → C248 4.5/5 へ +1.5 大幅昇格 (Δ-5/6 で「2 wave 偶奇ループ」を「3 phase × types 配列ローテ」に置換)

## 3. What this v002 proves

- **「内側→外側流出」1 原則がプレイ画面 + タイトル画面の両方でゼロ違反**を Audit script 物理確認できる形で達成 (`bullet_origin_audit` PASS / `c_shots_zero` PASS)
- **「展開なし反復」軸への構造応答** = WAVE_TIMELINE 3 phase で wave 種別 1→2→3 と単調増加。Pulse Relay v003 教師差分の「中盤→終盤で軸が増える」要件をローカル化
- **悪手 4 方針 (camper / lane-holder / blind-sweeper / nospecial) 全 wave 1 内 fail を 90s シミュで維持** = wave 1 軽量化 (n=5→3) と 敵 C 追加が悪手通過の穴を作っていない
- **敵 A/D/C の 3 軸独立性** (A=縦進行 / D=横進行 / C=ダイブ+sin 横揺れ) を `enemy_behavior_audit` 8/8 case PASS で物理確認
- **headless 数値裏付け装置 (agent_difficulty_proxy) を v002 ベースラインとして固定** = 次の改修で proxy 4 指標 (clear_wave / play_time / graze / survival) がどう動くかで「人間体感難易度の変化代理」を観測可能 (arXiv:2410.02829 翻訳の初運用基準)
- **3 層プロンプト構造との governance 整合** (C249 Phase 2 で Atlan Pattern 5 と構造的相同確認) = v002 出荷時点で memory 設計と game 設計の方向が独立収束

## 4. What this v002 does NOT prove

- **実ブラウザでの動作 / 視覚体感の成立**: Log は GUI 操作能力欠如のため、`python -m http.server` ローカル配信 + Node 構文チェック + headless audit までは確認したが、実機プレイで「？を立てる→解消」「3 状態階差」「3 軸視覚峻別 (赤/紫/黄)」がどう感じられるかは Nao_u / Mir / Ash 実機判定に依存 (詳細チェック観点は [visual_review.md](visual_review.md) §UNKNOWN 項目)
- **8 秒静寂 (Δ-4) の体感**: 悪手 4 方針は wave 1 内死亡で 8 秒静寂を観測しないため `verify.js` では計測不能。「圧迫→緩→次の圧迫」のリズムが成立するかは未確認
- **wave 1 軽量化 (n=3) の体感境界**: 「易しすぎ／ちょうどよい／圧不足」が実機判定で割れる可能性あり、proxy 数値 (median_play_time 9.28s) だけでは判定できない
- **タイトル副題 1 行のみで「？を立てる」体感**: Δ-1 でタイトルゴーストを削除した結果、動的視覚要素ゼロでメタファ文 1 行のみに依存 (Q-導入 4.5/5 暫定、5 確定は実機判定後)
- **proxy 4 指標と人間体感難易度の Pearson 相関**: agent_difficulty_proxy 値が増えたら難化、減ったら易化の方向で動くかは 3 サイクル運用後 (v002 と次 version の比較) で初判定可能、本 v002 単体では未測定
- **90s 以降の継続展開**: phase 2 で WAVE_TIMELINE 末尾を維持し続けるだけ。HP system / boss / phase 3+ など長時間プレイ拘束の機構は v002 スコープ外
- **phase 内密度カーブ**: 現状 wave 種別のみ単調増加、phase 2 内で SHOOT_INTERVAL を縮めるなど phase 内の密度カーブは平坦 (展開差カーブ 失点 -1 の出所)
- **`feedback_headless_unfit_for_unfinished_eval.md` 順守**: headless 4 軸全 PASS だけでは「ちゃんと遊べている」判定不能。本 v002 の「面白いか／前作 v001 より良いか」結論は実機判定到達後に保留

## 5. 出荷時の依頼 (Nao_u / Mir / Ash 宛)

### 5.1 何を試してほしいか
1. **70-90 秒通しプレイ** を 3 回以上 (phase 0/1/2 全部を抜けるサンプル)
2. 各プレイで「敵 A (赤) / D (紫) / C (黄)」の 3 軸が視覚的に峻別できたか
3. wave 1 軽量化 (n=3) と wave 2 8 秒静寂のリズムが「圧迫→緩→次の圧迫」として成立しているか
4. v001 (`game/log_autonomous_game/v001/index.html`) との比較で v002 が「展開なし反復」を解消できているか体感比較
5. タイトル副題「あなたの足跡が、これから歩く道になる」だけで「？が立つ」体感が成立するか (動的視覚要素ゼロでの導入が成立するか)

### 5.2 何を判定材料にしないでほしいか
- 実装の細かい数値 (`BULLET_SPEED=2.0` / `SHOOT_INTERVAL=90` / `WAVE_REST_FRAMES=480`) の最適化議論 — これは v003 で複数 version 試行する段で議論する
- 「HP system がほしい」「boss がほしい」「phase 3+ がほしい」 — これは v002 のスコープ外、What does NOT prove §6 で既に明示
- 「LLM playtester 化」 — v001 凍結事項、v002 でも継続凍結 (`projects/log_autonomous_game.md` §評価層構造)

### 5.3 起動手順
- ローカル: `cd game/log_autonomous_game/v002 && python -m http.server 8765` → ブラウザで `http://localhost:8765/`
- リポジトリ直接閲覧: GitHub Pages 公開は未設定 (本 v002 の責務外、希望あれば次サイクルで追加判断)

## 6. リンク

- [self_judgment.md](self_judgment.md) — 詳細採点 (5 ゲート 26.5/30 / Q-ミミクリ 11.5/15 / 展開差カーブ 21/25)
- [visual_review.md](visual_review.md) — Log 側で実施可能な目視チェック項目 + UNKNOWN 項目
- [game.js](game.js) — 採点対象コード本体 (636 行)
- [verify.js](verify.js) — 悪手 4 方針検証 (`pass: true`)
- [bullet_origin_audit.js](bullet_origin_audit.js) — Q-D 弾源監査 (10/10 PASS)
- [enemy_behavior_audit.js](enemy_behavior_audit.js) — 敵挙動監査 (8/8 PASS)
- [agent_difficulty_proxy.js](agent_difficulty_proxy.js) — 素朴良手 30 試行 baseline
- [../v001/design_log.md](../v001/design_log.md) — 8 ゲート (Q-A〜Q-G) 仕様の起点
- [../v001/self_judgment.md](../v001/self_judgment.md) §7g — v001 最終採点 (本 v002 の比較起点)
- [memory/feedback_inside_to_outside_leak.md](../../../memory/feedback_inside_to_outside_leak.md) — 1 原則出典 (v002 で完全達成)
- [memory/feedback_means_ends_reversal_check.md](../../../memory/feedback_means_ends_reversal_check.md) — 「ゲームを動かして出す」原則
- [projects/log_autonomous_game.md](../../../projects/log_autonomous_game.md) — 上位プロジェクトファイル
- [log/cycle_staging_log.md](../../../log/cycle_staging_log.md) C249 Phase 4 セクション — 本ファイル起票文脈
