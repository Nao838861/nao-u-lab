# graze_log v05.1 — devlog (弾速 ±10% evolve 試作)

**status**: 本サイクル C199 (Log Phase 4) で v05 から派生。v05 alpha (`34814472e`) を base とし、playable diff として ship。

## 0. 起源
- v05 ベース (`game/graze_log/v05/index.html`、全弾常時軌跡 + 敵配置 rhyme)
- C199 Phase 1 §6 外部検索 (Boghog / Sparen / SHMUP Creator) で精密化された改修候補3つのうち、最も実装コスト低い「弾速 ±10% evolve」を1案先行で playable diff 化
- graze_log v04 Nao_u 指摘 (2026-05-14 ts=1778767221「shot_log のようなリズム/バリエーション必要」) への Log 独自の playable 応答

## 1. 改変箇所 (`v05/index.html` → `v05.1/index.html`)

3 箇所 + コメントブロック1つ:

1. **コメントブロック追加** (L96-110 相当): `=== v05.1 MOD: 弾速 ±10% evolve ===` 定数 `EVOLVE_SLOW=0.9 / EVOLVE_FAST=1.1 / EVOLVE_FIRED_TH=3` 宣言
2. **spawnEnemy() 内** (L196-200 相当): small / medium 双方の enemy オブジェクトに `firedCount:0` 追加
3. **update() 内 medium enemy 発射部** (L408-413 相当): `e.firedCount++` + `const sp = 2.4 * (e.firedCount > EVOLVE_FIRED_TH ? EVOLVE_FAST : EVOLVE_SLOW)` で 1-3 発目 = 2.16 (-10%)、4 発目以降 = 2.64 (+10%) に切替
4. **タイトル表示更新** (L5 + drawTitle L709 相当): 「v05 beta — 全弾常時軌跡 + 敵配置 rhyme」→「v05.1 — 弾速 ±10% evolve」

削除手順 (v05.1 → v05): 上記 4 箇所のうち (1)(2)(3) を巻き戻すと v05 alpha と完全等価。タイトル文字列のみ残しても挙動影響なし。

## 2. 触っていない既存機構 (v05 と完全同一)

- 自機操作・graze/hit 半径・BOMB / Psyvariar active def
- 敵スポーン構成 (`spawnWave1..4` + wave>=5 rhyme 70%)
- 全弾常時軌跡 (Mir 案、grazedT クランプ)
- seed 再現性 / score/gauge 系
- `e.fireT` のクールダウン (70 + rng*40 フレーム)
- 軌跡描画 (常時 fade=1.0)

## 3. Mental Sim — 30 秒予測

開始 → wave1 (small3 + 1.2s 後 medium1)。medium は `fireT=60+rng*40` で約 1 秒後に初弾。その後の 4 発目までは sp=2.16 (緩弾)、自機追尾向きで遅め。プレイヤーはこれに対応する graze リズムを掴む。5 発目以降 sp=2.64 (約 22% 増し速度) で「同じ向きに来ると思っていた弾が速く到達する」体感が出る。

wave2-3 (medium2-3 体) では各 enemy がそれぞれ独立に firedCount を持つため、複数 enemy の発射タイミングが揃わない限り「ある弾は遅く、ある弾は速い」混合状態が出る。これは Sparen Guide A2 が言う「予測リズムの evolve 崩し」と Boghog の「速度の加減速段階で mental adjustment 継続」を 1 mm だけ実装した状態。

30 秒以内に最低 1 体の medium が 4 発以上撃つので evolve は確実に体験される (fireT=60-100 フレーム周期 = 1-1.7 秒/発、4 発で 4-7 秒)。

## 4. v05 比較 — 期待される体感差

| 軸 | v05 | v05.1 |
|---|---|---|
| 弾速 | 2.4 固定 | 2.16 (1-3) / 2.64 (4-) |
| 予測装置 | 全弾常時軌跡 (恒常化) | 軌跡は同じ、速度のみ evolve |
| 緊張源 | 弾数密度・配置 rhyme | 上記 + 速度の段階切替 |
| プレイヤーが「同じ」と認識するもの | 軌跡角度 | 軌跡角度のみ。長さ (= 速度) は途中で変化 |

**緊張関係の明示**: v05 の「全弾常時軌跡 = 予測装置の恒常化」と v05.1 の「弾速 evolve = 予測前提の途中崩し」は意図的に矛盾を含む。軌跡長は速度に比例する (描画式: `b.x + b.vx/sp*GRAZE_TRAIL_LEN`) ため、evolve 後の弾は「軌跡が伸びて見える」副作用が出る — これは Mir 案の「軌跡 = 予測の手がかり」の意味を「速度の手がかり」に拡張する偶発効果になり得る (good side)。逆に「予測の前提が崩れる」体験を弱めるかもしれない (bad side) — 30 秒プレイで確認すべきポイント。

## 5. 採用判定 — 1 段落

**判定**: ship 候補として残す。理由 = (1) 削除手順 4 箇所と最小、v05 から戻し可能。(2) Nao_u 指摘「リズム/バリエーション」への Log 独自軸 (Mir の「軌跡常時化」とは別軸の variation 導入) として説明可能。(3) Mental Sim で 30 秒以内に evolve が確実発火する設計になっており、体感差を測れる素地がある。**保留事項** = enemy 個別の firedCount 軸が「wave 全体での crescendo」とは独立 (各 enemy がスポーンするたびに 1 発目 = 緩弾から始まる) のため、wave 全体としては evolve リズムが繰り返される構造。これは Boghog の「coherent crescendo」軸への応答としては弱い → 次案 v05.2 / v06 で wave 全体の経過時間や spawnT 比率での evolve 軸を試す候補。本 v05.1 は「個別 enemy の time-axis evolve」の最小試作として位置づけ、Nao_u フィードバック後にどちらの evolve 軸が体感に効くか判定する素材として残す。

## 6. 次サイクル接続候補

- **v05.2 案**: 弾速 evolve の軸を「enemy ごとの firedCount」→「wave 全体の経過フレーム」に変更し、wave 全体としての crescendo を試す比較版
- **v06 案**: 位相 ±0.1s evolve (発射 fireT に位相シフト導入) — Phase 2 §2 で精密化済の改修候補2つ目
- **Ash 5/16 trajectory 二重使用 atom 未解決問い③ への応答**: 本 v05.1 は速度の時間微分が瞬間的にステップ変化する低次版 = 加速度プロファイル要求の前段試作。v06 で連続加速度 (`vx += ax*dt` 様) を試す前に、本 v05.1 で「速度段階変化」の体感を測ることで「連続加速度が必要か / 段階で足りるか」の判定材料を得る

## 7. 自己違反検出

- `feedback_clone_strategy.md` t:5 「削除可能改良 1 個刻み」順守: 改変 4 箇所のみ、戻し手順明文化
- CLAUDE.md「ゲームを動かして出す」遵守: playable diff として `game/graze_log/v05.1/index.html` を出力
- staging Phase 3 §6 「Phase 4 中止条件」(bullet update 関数 30 分以内拡張不能なら破棄) → 該当せず、拡張は 4 箇所で完了

## 8. JavaScript シンタックス検証

`node --check` 相当 (`new Function(js)`) で OK 確認済 (Phase 4 実行時 2026-05-17)。ブラウザでの実プレイ確認は Phase 5 以降または Nao_u 視聴時に。
