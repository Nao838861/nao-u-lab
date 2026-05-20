# mimicry_log v01 — devlog (因果操作ごっこ 最小プレイアブル着手)

**status**: 2026-05-20 C-2026-05-20 Phase 4 で graze_log/v05.2 から派生。1 commit playable diff として ship 候補。

## 0. 起源 — Nao_u 09:35 graze 凍結 + 玉置絢氏 + Log 13:13 自己観察 の 3 源泉独立収束

2026-05-20 09:35 ts=1779237349 (#game-rights):
> 「Graze は一旦無視した方が良い。変則的なマニアしか喜ばない要素」

2026-05-20 13:10 ts=1779250230 (#nao-u → Nao_u 共有 oktamajun ツイート):
> 「ロジック的正解 ≠ プレイヤーニーズ」「ミミクリ (ごっこ) は付随的・全体を支える支柱」「プレイヤーが遊ぶ前に受け取れる入り口 = 何ごっこのつもりで遊べばいいか」

2026-05-20 13:13 Log 自己観察 (#game-rights 投稿):
> graze_log でミミクリ軸が空白。「graze = かすめる」が何のごっこか言語化できていない

→ 3 源泉が独立に「graze の core 軸はミミクリ軸の空白で支えられていない」を指している = 強い裏付け。graze_log v06b/v10 が「マニア軸のかすめプレイごっこ」しか持っていなかったのが構造的根因。

## 1. Q0 — ミミクリ軸 (何ごっこか)

**「自分の弾が世界を即座に変える因果の手触りを楽しむごっこ」**

- カイヨワ 4 要素のうち **ミミクリ (世界変容者) + アゴン (撃破スコア) + アレア (敵生成 RNG)** の 3 軸を core に置く
- graze は sub 層 (擦ると DEF 蓄積) として残す。Nao_u 09:35「一旦無視」方針に従いつつ、機構自体は削除せず**降ろす**だけにする (rollback 可能性の保証)

## 2. Q1 — 30 秒プレイの想像 (操作 / 報酬 / 失敗の見え方)

| 秒数 | 起こること | プレイヤーの受け取り |
|---|---|---|
| 0–3 | PRESS SPACE → 自機 + 敵 small 3 体登場 | 「ああ、撃つゲームか」 |
| 3–8 | 撃つ → 敵 small 撃破 (粒子 14 + 閃光 + shake3) | 「撃つと崩れる、撃つと画面が変わる」 |
| 8–15 | 敵 medium 登場 → 撃破 (粒子 28 + 大リング + shake7) | 「中型を倒した = 世界を強く変えた」 |
| 15–22 | 敵弾発射開始 → graze ring 表示 | 「擦ると蓄積される、core じゃないが味付け」 |
| 22–30 | gauge MAX → BOMB ready パルス → BOMB (shake14) | 「世界を一括で変えた」 |

**30 秒で「自分の弾が世界を変えるごっこ」を 10 回以上体験**。5 秒で受け取れるミミクリ軸が core。

## 3. graze_log v05.2 → mimicry_log v01 の差分 (実装 5 箇所)

| 項目 | graze_log v05.2 | mimicry_log v01 | 差分の意味 |
|---|---|---|---|
| KILL_SMALL_GAUGE | 2 | **4** | 撃破の gauge 報酬倍増 = BOMB を「撃破ループの帰結」化 |
| KILL_MED_GAUGE | 4 | **8** | 同上 |
| GRAZE_SCORE | 10 | **5** | graze score 半減 = graze を sub 層へ降ろし、score 比重を撃破へ移す |
| 撃破 particle | small:5 / med:10 | **small:14+6 / med:28+14** + 閃光リング | 「散る」演出を約 3 倍化、視覚的に「世界が変わった」を明示 |
| screen shake | なし | small:3 / med:7 / BOMB:14 / hit:10 | 「自分の操作が世界に物理影響を与えた」を体感に変換 |

**触っていない既存機構** (v05.2 と完全同一):
- 弾速 ±10% evolve (Sparen rhythm 崩し)
- 全弾常時軌跡 (Mir 案、grazedT クランプ)
- 敵スポーン構成 (`spawnWave1..4` + wave>=5 rhyme 70%)
- 自機操作 / hit/graze 半径 / active def
- seed 再現性 / fireBomb の G_LV3 維持 (v05.2 修正)

## 4. 設計判断 — なぜ graze を削除せず「降ろす」か

選択肢:
- (a) graze 機構を index.html から削除 = 「graze 完全凍結」を字義通り実装
- (b) graze 機構を残し sub 層化 = 機構の保全 + 必要なら DEF 蓄積として保持

**(b) を選んだ理由**:
1. Nao_u 09:35「一旦無視」は「core にしない」を意味し「機構を消す」を意味しない。Phase 2 §2 で「単発強指摘の即時ルール化」(N=22) の自己観測あり、過剰反応を避ける
2. graze ring 表示は「敵弾を擦った瞬間に画面が反応する」副次的な因果操作フィードバックとして機能、core の「世界が変わる手触り」を**邪魔せず**むしろ密度を上げる
3. rollback 可能性: KILL_*_GAUGE と GRAZE_SCORE を v05.2 値に戻し、spawnKillBurst/triggerShake 呼び出しを消せば v05.2 と機能等価 (rollback ≈ 15 行)

## 5. 観察項目 (5軸×4段階 マトリクス 適用)

| アフォーダンス軸 | 覚える | 遊ぶ | 応用 | 極める |
|---|---|---|---|---|
| 視覚 (撃破フィードバック) | ✗→○ (v05.2: 粒子のみ → v01: 粒子+リング+shake) | ○ | ○ | ? |
| 応答 (撃つ→崩れる遅延) | ○ (1フレーム以内) | ○ | ○ | ○ |
| 構成 (撃破ループの蓄積) | △→○ (v01 で gauge 比重を撃破に移したため明示) | ○ | ? | ? |
| 時間 (shake 残響) | ✗→○ (新規、shake 12 フレーム残響) | ○ | ? | ? |
| 聴覚 | ✗ (未実装、v02 以降の候補) | ✗ | ✗ | ✗ |

→ v01 で **視覚/構成/時間アフォーダンスが「覚える」段階で改善**、graze_log v05.2 比で「撃つと世界が変わる」が即時受け取れる状態に。聴覚は次バージョン送り。

## 6. 削除手順 (rollback to graze_log v05.2 機能等価)

- `KILL_SMALL_GAUGE` 4→2 / `KILL_MED_GAUGE` 8→4 / `GRAZE_SCORE` 5→10
- `spawnKillBurst()` 関数を削除、撃破時の particle ループを v05.2 の `for(let i=0;i<5;i++)...` `for(let i=0;i<10;i++)...` に戻す
- `triggerShake()` 呼び出し 4 箇所削除、`state.shakeT/shakeMag` 初期化削除
- `draw()` の `ctx.save()/translate(sx,sy)/restore()` を消す
- `SHAKE_*` 定数を消す
- HUD の `KILL ${state.killCount} GRAZE ${state.grazeCount}` 順を `GRAZE ${state.grazeCount} KILL ${state.killCount}` に戻す
- title/subtitle 文字列を v05.2 へ戻す

合計 **約 25 行**。タイトル/HUD の表示順は機能非影響だが「core が撃破か graze か」を読み取る要素なので併記。

## 7. 判定方針

`feedback_headless_unfit_for_unfinished_eval.md` t:5 順守。headless 数値は判定根拠にしない。
ブラウザ実プレイで「撃つ → 世界が変わる」を 30 秒で 10 回以上体験できるか + 5 秒で「何ごっこか」が伝わるかを採用判定の根拠とする (Phase 4 では実プレイ不可、Phase 5 で Slack 投稿 → Nao_u フィードバック待ち)。

## 8. 次バージョン (v02 以降) 候補

- 聴覚アフォーダンス追加 (撃破 SE / BOMB 音 / shake と同期した低音)
- 撃破連鎖の連動 (Downwell 系: 撃破粒子が他敵に当たって連鎖ヒット = 因果操作の拡張)
- 敵種追加 (large enemy で「世界を強く変える」演出をさらに大きく)
- Nao_u フィードバック (Phase 5 #game-rights 投稿後) を待ち、次サイクル以降で軌道修正

## 9. 接続先

- [`game/mimicry_log/v01/README.md`](README.md) — Q0/Q1 と「何ごっこ」1 行
- [`game/graze_log/next/mimicry_candidates.md`](../../graze_log/next/mimicry_candidates.md) — 候補 A/B/C のうち B (因果操作ごっこ) を本実装で採用
- [`game/graze_log/v05.2/`](../../graze_log/v05.2/) — 派生元 base
- [`projects/principles.md`](../../../projects/principles.md) ミミクリ軸候補 — 本実装の理論根拠
- [`memory/sense_prediction_log.md`](../../../memory/sense_prediction_log.md) — N=20/N=21 frame archive、本実装は新 frame の N=23+ 教師データ
- [`log/cycle_staging_log.md`](../../../log/cycle_staging_log.md) Phase 4 — 本実装の起源 (本サイクル staging)
- Nao_u 2026-05-20 09:35 ts=1779237349 / 玉置絢氏 2026-05-20 13:10 ts=1779250230 — 3 源泉のうち 2 つ
