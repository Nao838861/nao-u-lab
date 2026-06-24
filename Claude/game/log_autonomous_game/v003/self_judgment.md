# log_autonomous_game v003 — self_judgment.md (C265 Phase 4 起票)

**status**: 起票直後、暫定採点未実施。本ファイルは C265 Phase 4「ヘッドレスフレーム画像化経路の段階1達成」を Q-D 節へ記録する目的で新設。確定採点は連続フレーム取得 (段階2) + Nao_u/Mir/Ash 実機判定 (Pulse Relay 原則) 後に書く。

起票時刻: 2026-05-30 C265 Phase 4 (Log)
起票対象: `game/log_autonomous_game/v003/` (commit 前、Phase 5 で `game:` prefix push 予定)

v002 採点起点: 自身の差分採点 (`v002/self_judgment.md`) Q-A 5/5 / Q-導入 4.5/5 / Q-成功FB 状態3 3/5 / **Q-D 4.5/5** / Q-C 4/5 / Q-E 5/5。

---

## Q-D 予測軌道ゴースト — 段階1 視覚体感経路の確保

**2026-05-30 C265 Phase 4: ヘッドレスフレーム画像化経路で初フレーム視覚体感達成**

- `capture_frames.js` (puppeteer-core + 既設 Chrome) で v003/index.html を headless 起動、Space キー押下後 5 秒経過時点の canvas を `frames/frame_0001.png` に保存。`window.__logAutonomousV003.getMeta()` で `frames=304` (約 5.07 秒経過) を取得、内部時計と外部計測が整合。
- Log 自身が Read tool で frame_0001.png を視認、観察結果は staging Phase 4 セクションに記録。**「Log が自分のゲームを視覚的に確認できる」経路が初めて成立**。
- 段階1 = 最小 1 フレーム成功のみを範囲とする。連続 60 秒分のフレーム取得 + Q-D 予測軌道の体感判定 (敵弾の到達点が事前認知できるか) は段階2 (次サイクル C266 以降の Phase 4 大作業候補)。
- Q-D 採点の 4.5/5 → 5/5 確定は依然 Nao_u/Mir/Ash 実機判定が条件 (R-A 順守、判定装置=最終確認装置)、本経路は自己判定精度の補強であり実機判定の代替ではない。

外部知見裏付け: Fly Fail Fix (arxiv 2507.12666) のヘッドレスフレーム画像化 → 視覚ベース自己評価ループ。C240 Phase 2 で「追記候補」として残置していたものを C265 Phase 4 で段階1 物理化。

---

## Q-D 予測軌道ゴースト — 段階2 連続フレーム取得 + 体感判定本番

**2026-05-30 C268 Phase 4: 60 枚 × 1 秒間隔 = 60 秒分サンプル取得、Q-D 暫定 4.0/5 自己判定**

- `capture_frames.js` を拡張: `FRAME_COUNT=60` / `FRAME_INTERVAL_MS=1000` で `frames/frame_0001.png 〜 frame_0060.png` + 各フレームの内部 meta を `frames/meta.jsonl` に書き出し。実行時間 約 65 秒、出力 60 ファイル＋meta.jsonl。
- 内部 frame カウント観察 (`meta.jsonl`): idx1=111 → idx2=173 → idx3=234 → idx4=293 → idx5=320 で停止、以降 60 まで 320 固定。**Auto agent は wave 1 中（t=5s 付近）で死亡 → GAME OVER**。frame 5 に「未来に追いつけなかった — パイロットは死線を抜けられなかった —」テロップ表示。frame 6-60 は GAME OVER 静止画。
- **本番判定対象 = frame 1-4 (PLAYING 中 4 秒) + frame 5 (death 瞬間)**。Log が Read tool で各フレームを直接視認した観察:
  - **frame 1 (t:1s)**: 上半分に大型敵 3 体、左上敵から橙弾 1 発、自機 (白) は下部中央
  - **frame 2 (t:2s)**: 敵 3 体が中央寄りに移動、弾 3 発に増加、左上弾は下方へ進行 → 自機方向にじりじり接近
  - **frame 3 (t:3s)**: 弾密度 5-6 発、扇状に展開、自機高度には未到達
  - **frame 4 (t:4s)**: 弾 7-8 発、自機左右上方の弾が下降中、idle:1 (agent が短時間静止)
  - **frame 5 (t:5s)**: GAME OVER、画面上の弾色が暗赤化 (死亡演出)、自機すぐ脇に弾命中点
- **Q-D 体感判定 = 4.0/5 (暫定、v002 比 -0.5)** の根拠:
  - **静止 1 フレームから弾速度ベクトル (どこへ進むか) は判別不能** = 予測軌道ゴーストの不在による情報欠落が連続フレーム視認でも残る (Log は画像 diff で位置差分から方向推定可能だが、リアルタイム 60fps プレイヤーにはこの情報源がない)
  - **wave 1 で死亡 = 弾幕難易度と agent 対処能力の乖離が即可視化**。Q-D の問題が「敵弾の到達点が読めない → 回避が場当たり的 → 5 秒で死亡」として強い相関で観察された
  - **frame 4 → 5 の死亡遷移は予測可能** (frame 4 で自機直上に弾密集) = 連続フレームを並べれば Log でも危険を読めた = 予測軌道ゴーストがあれば人間プレイヤーも回避可能性が上がる仮説の傍証
- **判定装置位置確認 (R-A)**: 本連続フレーム視認は **自己判定精度の補強**、Nao_u/Mir/Ash 実機判定の代替ではない。Q-D 5/5 確定は依然実機判定が条件
- **Goodhart 防壁仮説接続 (本サイクル Phase 2 §3)**: 単一 verifier (実機判定 4.5/5 固定) が「予測軌道ゴーストがあれば動的回避できる」前提に共進化していた可能性 → 連続フレーム視認という異なる時期の異なる verifier 観測で「ゴーストがなくても連続観測なら予測可能」という反例が浮上 = memory layer = Goodhart 防壁の概念実装の最小一歩

外部知見裏付け継続: Fly Fail Fix (arxiv 2507.12666) の視覚自己評価ループ段階2 = 連続フレーム差分で自己評価精度を上げる方向、本 Phase 4 で実装済。

---

## Q-D 予測軌道ゴースト — 段階3 弾尾追加 (C271 Phase 3, 2026-05-31)

**契機**: 段階2 自己判定 4.0/5 (連続フレーム視認) の根拠「静止 1 フレームから弾速度ベクトル (どこへ進むか) は判別不能」への直処方を、predicted ghost を復活させず実装する最小 diff として実施。3 サイクル連続 game/* diff ゼロ (C270/C272/C271 Phase 1 時点) の means/ends 逆転断ち切りを兼ねる。

**改修内容** (`game.js` drawPlaying 関数 弾描画ループ、約 8 行):
- 弾本体描画前に `ctx.moveTo(b.x, b.y) → ctx.lineTo(b.x - b.vx * 6, b.y - b.vy * 6)` で「過去 6frame 分 (= 12px) の進行方向ベクトル線分」を `rgba(255,184,120,0.35)` (弾本体と同系・薄め) で描画
- ロジック (updateBullets / spawnBullet / collisions) には一切手を入れない → verify.js 4方針 fail テスト pass: true 維持 (blind-sweeper 378F / nospecial 489F / camper / lane-holder、全 wave 1 内 gameover、回帰ゼロ)

**性質判別** (Nao_u 5/26 06:10 指摘との分離):
- Nao_u 5/26 06:10 指摘対象 = **未来 1 秒先の予測軌跡 + ×印** = 内部計算結果の外側流出 (feedback_inside_to_outside_leak.md 違反)
- 本改修 = **過去/現在の運動ベクトルの視覚化** (vx/vy は弾発射時に確定済の物理量) = 内部 1 秒先計算 (echo 機構の path) とは別系統 = 内側→外側流出 1 原則違反なし
- 弾尾長さ = 6frame = castLock の予測時間 (60frame) の 1/10 に抑制、視界占有面積を「予告線」と「跡」の中間より「跡」側に強く寄せる

**外部独立到達根拠**: Boghog 経験則「Single stray bullets are hard to read and can often feel unfair」(memory/external_notes_log.md L249-261, C258 摂取) と本改修の動機が独立到達 = R 層昇格条件「同方向独立 source 2 件以上」を Q-D 弾視認性軸で部分充足 (1. Nao_u 5/26 22:24 系の「弾本体読み取り体感」、2. Boghog 経験則、3. self_judgment.md Q-D 4.0/5 自己観測)。

**pre-mortem**:
- (a) **「邪魔な線」再発リスク** = Nao_u が「弾尾も予告線と区別つかない」と判定する可能性 → 緩和: 長さ 6frame / alpha 0.35 / 弾本体と同色系 で「予告線」性を最大限抑制、実機判定で「邪魔」と出たら撤回 (revert は 1 commit)
- (b) **castLock 機構の意味薄化リスク** = 弾尾で弾速度が読めるなら castLock いらず通常移動で回避可能になる懸念 → 緩和: 弾尾 12px ≪ 1 秒先 = 120px、castLock の予測時間優位は保たれる。verify.js 4 方針 fail 維持で「castLock 不使用 = 死」の自己批判判定は不変
- (c) **自己批判 verify.js の射程外** = verify.js は描画変更を観測しないため弾尾追加の効果検証には使えない → 緩和: Phase 4 大作業として capture_frames.js 60 枚再取得 + 死亡時間比較 (segment 段階2 = 489F より延びるか) を実施

**次サイクル C272 以降 Phase 4 大作業候補**: capture_frames 60 枚再取得 + Q-D 自己判定 4.0/5 → 暫定再判定。実機判定 (Nao_u/Mir/Ash) は Phase 5 以降の Slack 出荷タイミングで取得。

---

## Q-D 予測軌道ゴースト — 段階3 capture_frames 60 枚再取得 + 死亡時間比較 (C271 Phase 4, 2026-05-31)

**実施手順実行**: `node capture_frames.js` (puppeteer-core, headless, 既設 Chrome) で 60 frame 取得完了。frames/frame_0001.png〜frame_0060.png + frames/meta.jsonl (idx ごと playId/startedAt/frames カウント記録)。

**meta.jsonl 内部 frame カウント遷移**:
- idx 1 (t=2s): 123F
- idx 2 (t=3s): 185F
- idx 3 (t=4s): 245F
- idx 4 (t=5s): 305F
- idx 5 (t=6s): **321F** = ここから idx 6〜60 まで 321F 固定 → gameover で進行停止
- **死亡 frame ≈ 321F** (idx 4 → 5 の 16F 以内に gameover、≈ idx 4.3 = t≈5.27s 相当)

**死亡時間比較 (段階2 vs 段階3)**:
| 段階 | 弾尾 | 死亡 frame | 経過時間 (60FPS) | 比較 |
|---|---|---|---|---|
| 段階2 (C268 Phase 4) | なし | 489F | 約 8.15 秒 | 基準 |
| 段階3 (C271 Phase 4) | あり (6F=12px, alpha 0.35) | 321F | 約 5.35 秒 | **168F 短縮 (34% 短縮)** |

**pre-mortem (a) 予測との照合**: 「random walk policy は弾尾を解釈できないため死亡時間は不変か逆に短縮」→ 結果 = 168F 短縮で予測通り。**自動 agent 死亡時間は弾尾追加効果の判定材料にならない** (= verify.js 4 方針 pass 維持と整合)。Q-D 判定は静止フレーム視認の精度変化を主軸とする方針確認。

**frame 1-5 連続フレーム視認 (Read tool 直接)**:
- frame_0001 (idx1=123F, t=2s): orange 小弾に細い線分 (=弾尾) 視認可、進行方向「下向き」を 1 フレーム静止視認で判別可
- frame_0002 (idx2=185F, t=3s): 弾尾線が明瞭化、3 弾とも下向き方向ベクトル判別可
- frame_0003 (idx3=245F, t=4s): 多弾化、全弾に尾、プレイヤー (白) 下中央停滞
- frame_0004 (idx4=305F, t=5s): 弾密度ピーク、プレイヤー直上に弾密集、危険認知可
- frame_0005 (idx5=321F, t=6s): 「未来に追いつけなかった」 + PRESS SPACE = gameover 表示確定

**Q-D 自己判定 暫定再採点**: **4.0/5 → 4.3/5**
- 根拠 (+0.3):
  - **静止 1 フレームから弾速度ベクトル方向判別可能性が改善** (frame_0001 で orange 弾の下向き運動が単フレーム視認可) = 段階2 で「判別不能」と書いた直処方は達成
  - Boghog 経験則「Single stray bullets are hard to read and can often feel unfair」充足度 = 中〜高 (方向は読める、絶対速度は依然不明)
  - 段階2 frame 4 → 5 の死亡遷移読み取りが段階3 では frame 1 単独でも下向き弾の存在認知が早まる傾向
- 採点上限留保 (4.3 にとどめる理由):
  - 弾の絶対速度 (距離/時間スカラ) は弾尾 6F では依然不明 = 「どの程度速いか」の体感は未改善
  - 弾尾 6F は弾 1 個分径 (約 12px) と同オーダーで「予告線」と区別可能だが、密集時 (frame_0004) は弾本体と尾が混じり視認性低下
  - **実機判定 (Nao_u/Mir/Ash) 未取得** = R-A「自己判定は補強、Pulse Relay 主軸」原則で 5/5 確定は保留
- 段階2 比較: 4.0 → 4.3 = +0.3 = 直処方の効果は限定的だが正方向確認

**Goodhart 防壁仮説接続 (段階2 §42 の延長)**: 段階2 で「連続フレーム視認 = 異なる verifier」と書いた延長で、段階3 = 「描画変更後の同じ verifier 再観測」= 異なる observer 状態 (描画変更前/後) での同じ measurement を比較する = memory layer (時系列複数 verifier) の概念実装第 2 ステップ。

**次サイクル C272 以降の申し送り**:
- 実機判定依頼 Slack 投稿準備 (Mir/Ash inbox or #all-nao-u-lab): 弾尾追加 v003 を Nao_u 環境で動作判定 → Q-D 5/5 確定 or 撤回判断
- 弾尾長さ 6F→4F or 8F の最小幅探索 (visual delivery space より、密集時視認性とのトレードオフ)
- Q-C wave 2 移行検証は SHOOT_INTERVAL 漸変効果も含めて並行測定 (本 capture_frames では wave 1 死亡で wave 2 未到達)

---

## Q-導入 — H-001 phase 0 第 1 wave y-stagger 拡大 teaser (C276 Phase 4, 2026-06-01)

**実施**: `game.js` / `verify.js` で waveCount === 0 のみ y-stagger 40→168 切替 (`WAVE_A_STAGGER_Y_PHASE0=168`)、PEARSON_BLOCKER.md L4 「仮説駆動」ルール初適用。仮説本体は `hypotheses.md` H-001 参照。

**verify.js 結果** (`node verify.js`, seed=20260527):
- pass: true (悪手 4 方針すべて wave 1 内死、回帰ゼロ)
- 各方針 survived_frames: camper=319F / lane-holder=284F / blind-sweeper=378F / **nospecial=545F (段階3 489F → +56F = +0.93s)**
- 観察: nospecial のみ +56F 延長、他 3 方針は変化なし or 別パターン同等。仮説「teaser 期間に死ぬパターンは増えにくく、本体到来時に死ぬパターンが大半」が部分支持 (脅威方向への積極退避戦略 nospecial で teaser 単独敵 1 体が薄い脅威として通過 → 本体到来で死)

**Q-導入 暫定採点**: 自己判定では未確定。実機判定 (Nao_u/Mir/Ash) で「親切」(成立) / 「冗長」(撤回) を判定後に v002 比較 (v002 Q-導入 4.5/5) して節更新。本サイクル C276 では verify.js 回帰ゼロ確認のみで暫定値置かない (R-A 順守)。

---

## Q-成功FB — 本能側応答密度初回計測 (C281 Phase 4, 2026-06-01)

**契機**: gdlab_hama 2026-06-01 09:15 ツイート「ゲームの核 = 本能的に気持ち良い要素 + 体験ゴール逆算要素の複合、再設計時はまず分解」を v003 に適用、Phase 2 で **proxy_icc_diagnose.py が「逆算側の道具を本能側の測定器として流用している」混線**であると分解診断。本能側を直接観測する装置の第 1 本として `instinct_probe.js` (純 Node、192 行) 新設。

**仕様**:
- castLock 解除 (resolveLock 発火) 直後 `PROBE_WINDOW_FRAMES=6` frame (=100ms) の bot 移動方向を 9-way 離散化 (`dirToken`)、隣接 frame 間の方向変化回数を `post_lock_input_count` として集計
- 1 trial 末尾で `probe_density = post_lock_input_count / post_lock_frame_total` を出力 (post_lock_frame_total = castLock 成功数 × 6)
- bot = `agent_difficulty_proxy.js` の素朴良手 (近接脅威退避 + 中央バイアス + 微小ノイズ) を簡略化、PLAYER_SPEED は agent boost 1.5x 同型

**初回計測値** (seed_base=20260601, trials=3, dry-run):
| trial | seed | play_time_sec | cast_count | input_count / frame_total | probe_density |
|---|---|---|---|---|---|
| 0 | 20260601 | 8.68 | 3 | 4 / 18 | 0.2222 |
| 1 | 20260602 | 8.68 | 3 | 2 / 18 | 0.1111 |
| 2 | 20260603 | 8.68 | 3 | 8 / 18 | 0.4444 |

**判定 (確定採点ではなく観測値報告)**:
- **(a) 測定経路が動く**: 3 trial すべて castLock 成功 3 回、post_lock_frame_total=18 で集計成立、JSONL 出力 `frames/instinct_probe_test.jsonl` 確認済
- **(b) 値の分散が出る**: probe_density 0.111 → 0.444 = 4 倍変動 (range), seed 差で結果分散 = staging 反証ライン §1 「測れているように見えて測れていない二重事故リスク」の初期検証段階クリア (3 trial で分散観測条件成立)
- **(c) 確定採点は保留**: probe_density と人間体感の相関は本サイクル未測定。本数値は density 軸が機能することの証拠であり、density の絶対値の意味は次サイクル以降 (Nao_u/Mir/Ash 実機判定経路または seed × bot 戦略 grid での Spearman 相関測定)
- **(d) R-A 順守**: 本 probe は自己判定精度の補強、判定装置の置換ではない

**反証ライン §2 (substrate 増強最小) 順守**: 純 Node 192 行 (staging Phase 3 想定 50-80 行を超過、game 物理を inline せざるを得ず増)、puppeteer 不要、frames/ 直下 1 ファイル追加のみ。副作用ゼロ設計、game.js / verify.js / agent_difficulty_proxy.js 改変ゼロ。

**接続**:
- kaizen #137 (proxy_icc_diagnose.py) 段階 2 方向修正 = 「本能側 vs 逆算側分解」の実装根拠
- projects/log_autonomous_game.md 2026-06-01 C281 §3 β 解除路線修正の物理化
- graze_log v06 R-J 候補 (本能側の核を 1 行で同定) との接続点を実装で得る

**次サイクル C282 以降候補**:
- 30 trial × 複数 seed_base で probe_density 中央値 + IQR を agent_difficulty_proxy.js と並列計測
- bot 戦略軸 (camper / lane-holder / nospecial と本 probe 戦略) を切替えて probe_density の戦略間順位を観測 = ICC 軸 (proxy ↔ 本能側) の独立性検証
- Nao_u 実機判定での「本能的に気持ち良い」体感 ranking と probe_density ranking の Spearman 相関 (5 trial 程度の small-N 出発)

---

## Q-成功FB — マルチシード分散観測 + n=3 degenerate triplet 発見 (C283 Phase 4, 2026-06-02)

**契機**: C281 で seed_base=20260601 trials=3 (consecutive seeds 20260601-3) の dry-run で probe_density={0.2222, 0.1111, 0.4444} と 4 倍変動を確認。本サイクルは「widely-separated seed_base で §5 反証ライン第一関門 (分散観測可能性) を正式判定」が目的。

**実施**:
1. 計画通り seed_base=1, 11, 21 で 1 trial ずつ実行 → JSONL 3 ファイル取得 (`frames/instinct_probe_seed{1,11,21}.jsonl`)
2. 想定外の結果: **3 seed すべて probe_density=0.2778 (input_count=5/18)、std=0、range=[0.2778, 0.2778]** — degenerate triplet
3. triangulation: 追加 seed_base ∈ {2, 3, 5, 100, 1000, 12345} で個別観測 → 4 distinct values {0.1111, 0.2222, 0.2778, 0.4444}
4. n=10 ベースライン取得 (seed_base ∈ {1, 11, 21, 31, 41, 51, 61, 71, 81, 91}) → `frames/instinct_probe_n10.jsonl`

**初回計測値** (n=3 plan / n=10 baseline 並記):

| set | seeds | mean | std | range | distinct |
|---|---|---|---|---|---|
| 計画 n=3 | 1, 11, 21 | 0.2778 | **0.0000** | [0.2778, 0.2778] | 1 |
| ベースライン n=10 | 1, 11, 21, 31, 41, 51, 61, 71, 81, 91 | 0.3000 | 0.1086 | [0.1667, 0.4444] | 4 |

**判定**:
- **(a) §5 反証ライン第一関門 (分散観測可能性) = PASS、ただし n=10 で**: n=3 計画は degenerate triplet を引き当て std=0、population レベルでは 4 distinct values が観測されることを n=10 で確認
- **(b) methodological 発見 = n=3 は信頼分散推定として不十分**: 9 seed 試行中 3 seed (1, 11, 21) が偶然同値、確率約 3/9=33% で n=3 が縮退に当たる経路あり。**次サイクル以降の probe ベースラインは n≥10 を default**
- **(c) 死亡時間 seed 不変性**: 全 trial で `play_time_sec=8.68, cast_count=3` 一致 → RNG は echo path (cast 中) に影響せず、6-frame probe window 中の noise のみに使われるため初回死亡 frame は seed 不変。これは設計通り (echo 中は trail から path 再生、RNG 不使用) で異常ではない
- **(d) probe 設計の制約明示**: 「本能側応答密度」を 1 試行 18 frame (= 3 cast × 6 frame) で推定する設計上、離散値が {0/18, 1/18, ..., 18/18} の 19 段階に制限される。分散度の理論上限が低く、n を増やしても std 値の上限がある (今回 std=0.1086 は離散刻み 1/18≈0.0556 の約 2 倍)
- **(e) 確定採点は引き続き保留**: probe_density と人間体感の相関は本サイクル未測定 (C281 と同じ留保)

**反証ライン §2 (substrate 増強最小) 順守**: instinct_probe.js 改変ゼロ (既に --seed-base/--trials 引数あり)、新規ツール追加ゼロ、`frames/instinct_probe_seed{1,11,21,n10}.jsonl` 4 ファイル追加のみ。集計は python 純 stdlib 1 行コマンド。

**接続**:
- kaizen #137 (proxy_icc_diagnose.py) — 「逆算側の道具を本能側測定器に流用混線」の補完路、本能側 probe の variance も n=3 では不安定と判明
- kaizen #138 (memory_retention_audit) — 本サイクル Phase 3 で段階 2 を 1mm 試験、独立に進展
- C282 Phase 4 capture_frames J-04 構造証明 PASS との接続 = 本能側 (instinct_probe) と逆算側 (J-04 構造証明) の双方で「動く測定経路」を確保

**次サイクル C284 以降候補**:
- bot 戦略軸 (camper / nospecial / blind-sweeper) × seed n=10 grid で probe_density の戦略間順位観測 → ICC 軸独立性検証 (C281 候補の継続)
- probe window を 6 frame → 12 / 30 frame に拡張して離散刻み制約を緩めた版を試作 (理論上限の確認)
- 死亡 frame 不変性を逆手に取って「同一死亡 frame における方向変化分散」を新たな指標として直接定義 (現 probe_density は density の意味で 0..1 だが、本来は 0..6 までの整数変動も観測対象になり得る)

---

## Q-D 予測軌道ゴースト — 段階2 引数化 PASS + ジュース監査 J-04 構造証明 (C282 Phase 4, 2026-06-02)

**実施**: `capture_frames.js` を `--duration N` `--interval F` 引数化。`FRAME_COUNT = (duration * 60) / interval`、`FRAME_INTERVAL_MS = (interval / 60) * 1000` で算出。`node capture_frames.js --duration 60 --interval 60` で frame_0001〜0060.png + meta.jsonl 60 行を生成、exit 0 確認。

**meta 観察**:
- idx=1 frames=124 / idx=4 frames=306 / idx=5+ frames=320 (定常) = 自動ランダムウォーク agent が wave 1 frame 320 で死亡、段階3 C271 死亡 frame 321 と ±1F で再現
- HUD: `Relay hit:0 miss:0 idle:1` = castLock/resolveLock 発火ゼロ (Space 非押下) → resolveLock 直後 0-30 frame の経験観察は本 run では取得不能

**ジュース監査 J-04 構造証明 PASS**:
- resolveLock 本体 (`game.js:206-211`) は `if (e.hadBullets) game.lockMessage = ... else game.lockExplosion = ...` の if/else 排他分岐 = 1 回の resolveLock で 2 変数同時更新は不可能
- `castLock()` は `game.echo` 存在中の再 cast を拒否 (`game.js:190`)、`updateEcho()` は `elapsed >= ECHO_FRAMES(=60)` で resolveLock 発火 → 連続 resolveLock 間隔 ≥ 60 frame
- 描画寿命 lockExplosion 30F (`:564`) / lockMessage 45F (`:577`) < 最小間隔 60F → 同 frame 重畳は構造上不可能
- 詳細は `visual_review.md` J-04 PASS 節 + V-06 PASS 節

**段階2 達成判定**: PASS (capture_frames 引数化 + 60 枚生成 + meta 整合 + J-04 構造証明)。経験観察は実機判定 (Nao_u/Mir/Ash) に委譲、capture_frames 経路はインフラ整備として完成

**Q-D 採点**: 段階3 4.3/5 を維持 (本 phase 4 は capture インフラ整備 + J-04 構造証明であり描画変更なし → Q-D 採点に直接影響なし)

---

## Q-成功FB — 再観測 (C287 Phase 3, 2026-06-02) — Log master 経路 playable diff ゼロ 3 サイクル断ち切り 1mm

**契機**: C284-C286 で Log master 経路 playable diff 0 サイクル連続 = `feedback_means_ends_reversal_check.md` 警告線該当、本 C287 Phase 3 で **1mm 観測値追加**として `instinct_probe.js --trials 3` (default seed_base=20260601 consecutive seeds) を再走行、C281 初回計測値との再現性を確認する目的。

**観測値**:
| trial | seed | play_time_sec | cast_count | input_count / frame_total | probe_density |
|---|---|---|---|---|---|
| 0 | 20260601 | 8.68 | 3 | 4 / 18 | 0.2222 |
| 1 | 20260602 | 8.68 | 3 | 2 / 18 | 0.1111 |
| 2 | 20260603 | 8.68 | 3 | 8 / 18 | 0.4444 |

**判定**:
- **C281 初回計測値と完全一致** (3 trial 全件 probe_density / play_time_sec / cast_count まで bit 一致) = 決定的挙動再現性 PASS、本 probe は副作用ゼロ × seed 入力に対し再現的
- range=[0.111, 0.444] = 4 倍変動、std≈0.137 (C283 n=10 ベースライン std=0.1086 と同オーダー)
- **本観測は新規データではなく再現性確認**、新規データは n=10 widely-separated seed_base での C283 観測値で既取得済
- **1mm カウント**: 本 Phase 3 で実機 1 回回し + self_judgment.md 1 節追記 = playable diff 1 commit 成立 (game/ 配下 self_judgment.md 1 ファイル変更、game.js / verify.js / instinct_probe.js 改変ゼロ)
- **R-A 順守**: 本 probe は自己判定精度の補強、判定装置の置換ではない

**反証ライン §2 (substrate 増強最小) 順守**: instinct_probe.js 改変ゼロ、新規ツール追加ゼロ、本 self_judgment.md への 1 節追記のみ、副作用ゼロ。

**接続**:
- `feedback_means_ends_reversal_check.md` T:5 警告線 (3 サイクル連続 playable diff ゼロ) への直処方の 1mm
- C281 instinct_probe 初回計測値の bit 再現性確認 = 装置の決定性検証 1 関門
- 次サイクル候補は v003/v004 描画 diff (frames 再取得時の体感判定経路) または instinct_probe ベースライン拡張ではなく **bot 戦略軸 × probe_density grid** (C281 §4-(d) 「未測定」項目の最小着手)

---

## 次の更新タイミング

- C272 Phase 4 大作業候補 = 実機判定依頼 Slack 投稿 (Mir/Ash inbox) → 段階3 結果フィードバック
- Auto agent 死亡前にゲーム再起動して wave 2/3 のサンプルを取る拡張 (capture_frames.js Space 再押下) は段階4 候補
- v002 → v003 差分採点 (Δ-1 phase 2 SHOOT_INTERVAL 漸変 + Δ-2 弾尾追加) は実機判定後に Q-C/Q-D 節へ追記
- C282 以降 Phase 4 候補 = instinct_probe.js × bot 戦略 grid で probe_density 軸の独立性検証

---

## C293 Phase 4 — phase 2 SHOOT_INTERVAL 曲線 linear → ease-in (2026-06-04)

**変更内容** (`game.js` / `verify.js` の `currentShootInterval` 関数、各 1 行):
- 漸変 `t` を `eased = t * t` に置き換え、線形補間 → 2 次関数 (ease-in) に変更
- 境界値は維持: 50s で 90F (1.5 秒間隔)、90s で 60F (1.0 秒間隔)
- proxy 4 指標の追加なし (C288 proxy validity 棄却済の同型反復防止)

**選定理由** (staging Phase 3 §3-4 4 ゲーム射程図):
- 「逆算側体験ゴール = 読みが追いつかない瞬間」を 1 行明文化、対応する 1 mm 改修として SHOOT_INTERVAL 曲線形状を選定
- 3 候補 (曲線傾き / 出現位置ジッタ / 初期ランプ短縮) のうち**最小副作用**で**最大の体感差仮説**を持つもの = 曲線形状
  - ジッタは敵パラメータ追加 → seed 系統への影響、ランプ短縮は phase 0/1 学習導入の破壊リスクあり
  - 曲線形状は phase 2 境界値固定 → 悪手検証 verify.js への影響ゼロ事前確認可能 (悪手 4 方針は phase 0 で死亡)

**変更前/後 体感差予測** (実機未確認、analytical):
- 各時刻の SHOOT_INTERVAL 値:
  - 55s: linear 86F → ease-in 90F (+4F 緩和)
  - 65s: linear 79F → ease-in 86F (+7F 緩和)
  - 75s: linear 71F → ease-in 78F (+7F 緩和)
  - 85s: linear 64F → ease-in 67F (+3F 緩和)
- 平均すると ease-in の方が全体的に**穏やか**。差分のピークは **65-75s 帯**で +7F、終端で 0F
- 体感差仮説: 「phase 2 突入直後 (50-65s) は phase 1 と同程度のリズム維持 → 70s 以降で急に圧迫が増す」= 「**読みのリズムが急に崩れる瞬間**」を 70-85s 帯に集中させる狙い
- linear は phase 2 全域で「徐々に圧迫」均一だったため、「読みが追いつかない瞬間」が拡散して「ぼやけた難化」になっていた可能性への直処方

**verify.js 影響**:
- 実行確認: 全 4 悪手方針が引き続き phase 0 (frame 284-545) で gameover、pass: true 維持
- phase 2 (frame ≥ 3000) を観測する悪手方針が存在しないため、曲線形状変更は本悪手検証の射程外
- 良手検証 (90 秒生存可能か) は引き続き本ファイル外、Mir/Ash/Nao_u 実機判定を待つ

**playable diff = 0 連鎖切断**:
- C281 以降 10 サイクル連続 game/ 配下コード変更 commit ゼロ (C283/C290 計測 instinct_probe 系の self_judgment 追記は除く)
- 本 Phase 4 で game.js + verify.js + self_judgment.md の 3 ファイル diff = **コード変更 commit 候補 1 本生成**、Phase 5 で commit 連結 (本プロンプト「commit はしない」順守)

**pre-mortem (再自己批判 3 件)**:
- (a) **ease-in が「穏やかすぎて差を感じない」リスク**: 0F → 7F → 0F のピーク差は SHOOT_INTERVAL の絶対値 (60-90F) に対し最大 11.7% 程度 → 体感閾値未満の可能性。緩和: 実機判定が「変化なし」と出たら ease-in² (`t⁴`) や境界値変更を次の 1 mm 候補に
- (b) **「逆算側体験ゴール」の単独 source 起点**: 4 ゲーム射程図の構造観察 1 件のみが根拠 → R 層昇格条件未充足 (同方向独立 source 2 件以上必要)。緩和: Mir/Ash の cross_review で体感差有無を独立観測する依頼が次サイクル候補
- (c) **曲線形状変更を「逆算側」と紐付ける論理が間接的**: 「読みが追いつかない瞬間 = 読みの崩壊 = 逆算側設計」の連鎖は事後説明寄り (post-hoc rationalization リスク)。緩和: 本 diff の効果が「圧迫を後半に集中」という独立に観測可能な事実に閉じる点で、逆算側ラベルなしでも個別に評価可能。逆算側射程の更なる立証は v004 brainstorm へ持ち越し

**次の更新タイミング (本節向け)**:
- 実機判定 (Log/Mir/Ash いずれか 1 セッション以上) で「変化を感じたか」のフィードバック取得後、本節に追記
- capture_frames.js を 90 秒分に拡張して phase 2 末尾 frame を視認できれば段階 2 自己判定の追記候補
- linear vs ease-in の bot 戦略 grid 比較 (bot が phase 2 を生存できる方針があれば差分計測可能) は段階 3 候補

---

## Q-成功FB / Q-展開差 — H-002 wave_clear 薄テロップ FB 着地 (C297 Phase 4, 2026-06-04)

**実施**: `game.js` に H-002 仮説の検証 diff 1 本を着地 (hypotheses.md H-002 参照、PEARSON_BLOCKER.md L9 「仮説駆動」ルール 2 例目)。`verify.js` 改変ゼロ (描画レイヤーのみ変更、悪手 4 方針 phase 0 死亡 = wave_clear 経路非通過、検証 logic 無関係を事前確認)。

**変更内容** (game.js のみ、約 14 行 = 状態定義 5 行 / resetForPlay 1 行 / step() wave_clear ブロック 2 行 / drawPlaying 9 行):
- `game.waveClearMessage = null` を state 初期化 + resetForPlay に追加
- `step()` 内 wave_clear ブロックで `{ text: 'Wave N Clear', frame: game.frame }` をセット
- `drawPlaying()` で 45F フェード描画 (alpha 0.6 max、薄白系 rgba(180,220,255)、フォント 14px、H*0.18 配置 = 画面上端寄り)

**verify.js 結果** (`node verify.js`, seed=20260527):
- pass: true (悪手 4 方針すべて wave 1 内死亡、回帰ゼロ)
- 各方針 survived_frames: camper=319F / lane-holder=284F / blind-sweeper=378F / nospecial=545F
- H-001 適用後 (C276 Phase 4 着地値) と **bit 完全一致** = 描画レイヤー変更が gameplay logic に一切影響しないことの数学的確認
- 観察: 悪手 4 方針は全 phase 0 内 (frame < 1200) で死亡 = wave_clear ブロックは未通過 = テロップ表示コード一度も実行されず、検証 logic に影響ゼロ

**Q-成功FB 体系の 4 状態化** (H-002 (b) 予測の構造変化):
- 状態 1: castLock 発動不可 (trail < ECHO_FRAMES) → グレー薄リング (drawPlaying L566)
- 状態 2: castLock 弱 hit (hadBullets なし) → シアン薄爆発 + successParticles (drawPlaying L617, C296)
- 状態 3: castLock 危機回避 hit (hadBullets あり) → シアンテキスト "危機回避" 22px (drawPlaying L649)
- **状態 4 (新規): wave_clear** → 薄白テキスト "Wave N Clear" 14px H*0.18 (drawPlaying L660、本 H-002)
- 視覚棲み分け: 1/2/3 は castLock 機構内 + シアン系で player 帯 (H*0.42 〜 H*0.78) に集中、4 は wave 進行軸 + 薄白系で画面上端 (H*0.18) に分離。同 frame 重畳は exotic case (resolveLock hit と wave_clear が同 frame) のみ、色相 + 位置で識別可能

**Q-展開差 暫定採点**: 自己判定では未確定。実機判定 (Nao_u/Mir/Ash) で「節目として効く」(成立、+0.5) / 「冗長」(撤回) を判定後に v002 比較 (v002 展開差 21/25、v003 暫定 22-23/25) して節更新。本サイクル C297 では verify.js 回帰ゼロ確認のみで暫定値置かない (R-A 順守、判定装置=最終確認装置)

**pre-mortem (反証ライン 3 件、hypotheses.md H-002 と同期)**:
- (a-反) **「やかましい」「リズム破壊」リスク**: alpha 上限 0.6 (lockMessage 1.0 より控えめ) / フォント 14px (lockMessage 22px より小型) / H*0.18 (player H*0.78 と最遠) で抑制。実機判定で「やかましい」と出たら 1 commit 撤回
- (b-反) **H-001 teaser 学習との干渉リスク**: wave 1 直後の静寂 (phase 0 学習導入) で H-001 teaser を反芻する時間にテロップが意識を次 wave へ向ける懸念 → H*0.18 配置 + 内容 "Wave 1 Clear" の事実のみ (次予告含まず) で teaser 反芻最小妨害設計
- (c-反) **Q-成功FB 系の混線リスク**: castLock 系 3 状態体系に「wave-clear FB」追加で読み手が混乱する懸念 → 色相分離 (シアン vs 薄白) + 位置分離 (player 帯 vs 上端) + トリガ分離 (resolveLock vs wave_clear) で 3 軸独立 = 既存 3 状態の解像度は変更なし

**playable diff = 0 連鎖切断** (CLAUDE.md「絶対にやる」第 1 項対応):
- 直近 5 commit に Log_master 由来 0 件 (Phase 1 §0 git status で観測) = Log master 経路のコード作業空白を本 H-002 着地で埋める
- C293 (linear → ease-in t² SHOOT_INTERVAL 漸変) 以来の Log master playable diff = **本 H-002 が第 2 本目**、PEARSON_BLOCKER.md L9 「仮説駆動」ルール下での 1 サイクル 1 仮説 規律維持
- 本 Phase 4 は game.js + self_judgment.md + hypotheses.md の 3 ファイル diff = コード変更 commit 候補 1 本生成、commit/push は Phase 5 で日記とまとめて実施 (本サイクル Phase 4 では commit しない、運用順守)

**接続**:
- design_log §2.1 「phase 内密度カーブ」失点 -1 と独立した軸 (静寂フェーズ意味づけ) で展開差を補強する第 2 ルート
- self_judgment.md Q-成功FB の castLock 系 3 状態が **wave 進行軸 FB が体系欠落** だった構造瑕疵への補完 (本サイクル発見)
- C271 弾尾追加 / C293 ease-in 曲線変更 / C296 successParticles / C297 cameraShake / **本 H-002 wave_clear テロップ** = Log master 経路 playable diff の継続蓄積

**次サイクル C298 以降の継続候補**:
- 実機判定 (Nao_u/Mir/Ash) で wave_clear テロップが「節目として効く」or「冗長」かの判定 → +0.5 ~ +1 確定 or 撤回
- H-003 候補: 「次 wave 起動 1 秒前 (= 静寂 7 秒経過時) のカウントダウン FB」(本 H-002 単独効果検証後の段階拡張)
- テロップ表示位置 (H*0.18) の高さ探索 (H*0.10 / H*0.25 / 画面四隅) は実機判定後

---

## Q-成功FB / Q-展開差 — H-003 wave 起動カウントダウン FB 着地 (C298 Phase 4, 2026-06-05)

**実施**: `game.js` に H-003 仮説の検証 diff 1 本を着地 (hypotheses.md H-003 参照、PEARSON_BLOCKER.md L9 「仮説駆動」ルール 3 例目)。`verify.js` 改変ゼロ (描画レイヤーのみ変更、悪手 4 方針 phase 0 死亡 = wave_clear → 7 秒静寂 → 次 wave 経路非通過、検証 logic 無関係を事前確認、H-002 と同論証)。

**変更内容** (game.js のみ、約 18 行 = 状態定義 4 行 / resetForPlay 1 行 / step() H-003 トリガブロック 7 行 / drawPlaying H-003 描画ブロック 11 行):
- `game.waveCountdownMessage = null` を state 初期化 + resetForPlay に追加
- `step()` 内、wave_clear ブロック直後に「waveClearMessage 経過 7 秒 (420F) 到達 frame で waveCountdownMessage を 1 回セット」ブロック追加 (waveClearMessage.frame との大小比較で wave_clear ごとに 1 回ガード)
- `drawPlaying()` で 80F 寿命 (60F フェードイン + 20F フェードアウト) 描画 (alpha 0.5 max、薄白系 rgba(180,220,255)、フォント 12px、H*0.18 配置 = H-002 と同 line 同色相 同位置で静寂両端対称)
- `logEvent('wave_countdown', { next_wave })` で trace 出力に新イベント追加 (1 行)

**verify.js 結果** (`node verify.js`, seed=20260527):
- pass: true (悪手 4 方針すべて wave 1 内死亡、回帰ゼロ)
- 各方針 survived_frames: camper=319F / lane-holder=284F / blind-sweeper=378F / nospecial=545F
- H-002 着地値 (C297 Phase 4) と **bit 完全一致** = 描画レイヤー変更が gameplay logic に一切影響しないことの数学的確認 (H-002 同型の論証 2 度目)
- 観察: 悪手 4 方針は全 phase 0 内 (frame < 1200) で死亡 = wave_clear ブロックも H-003 トリガブロックも未通過 = カウントダウン表示コード一度も実行されず、検証 logic に影響ゼロ

**Q-成功FB 体系の 5 状態化** (H-003 (b) 予測の構造変化):
- 状態 1: castLock 発動不可 (trail < ECHO_FRAMES) → グレー薄リング (drawPlaying)
- 状態 2: castLock 弱 hit (hadBullets なし) → シアン薄爆発 + successParticles (drawPlaying, C296)
- 状態 3: castLock 危機回避 hit (hadBullets あり) → シアンテキスト "危機回避" 22px (drawPlaying)
- 状態 4: wave_clear (退場側 = 過去化) → 薄白テキスト "Wave N Clear" 14px H*0.18 (drawPlaying, C297 H-002)
- **状態 5 (新規): wave 起動カウントダウン (起動側 = 未来化)** → 薄白テキスト "Wave N+1" 12px H*0.18 (drawPlaying L674、本 H-003)
- 視覚棲み分け: 1/2/3 は castLock 機構内 + シアン系で player 帯に集中、4/5 は wave 進行軸 + 薄白系で画面上端に分離。状態 4 と 5 は同 line 同色だが時相分離 (静寂前半 0-0.75s = 状態 4 / 静寂末尾 7.0-8.33s = 状態 5)、内容差で「過去化」と「未来化」を識別

**Q-展開差 暫定採点**: 自己判定では未確定。実機判定 (Nao_u/Mir/Ash) で「準備時間として効く」(成立、+0.3) / 「警告的でうるさい」(撤回) を判定後に v002 比較 (v002 展開差 21/25、v003 暫定 22-23/25、H-002+H-003 着地後 23-24/25 候補) して節更新。本サイクル C298 では verify.js 回帰ゼロ確認のみで暫定値置かない (R-A 順守、判定装置=最終確認装置)

**pre-mortem (反証ライン 3 件、hypotheses.md H-003 と同期)**:
- (a-反) **カウントダウンが警告音的に作用し静寂の余韻を破壊するリスク**: alpha 上限 0.5 (H-002 alpha 0.6 より控えめ) / フォント 12px (H-002 14px より小型) / 60F フェードイン (= 1 秒かけて立ち上がる遅い変化) で「警告」より「兆し」のテクスチャを目指す。実機判定で「うるさい」と出たら 1 commit 撤回
- (b-反) **H-002 と表示位置が同じ (H*0.18) で 8 秒静寂内に「上端で 2 回テキストが現れる」体験が冗長になるリスク** → 緩和: H-002 = "Wave N Clear" (過去化)、H-003 = "Wave N+1" (未来化) で意味的に対称、内容差で「同じ場所のテキスト 2 回」を「節目の前後」と読みかえ可能性。時間配置も 0-0.75s vs 7.0-8.33s で連続せず分離
- (c-反) **状態 1 (castLock 充填中グレーリング) と状態 5 が同 frame 重畳する場合の注意分散リスク** → 緩和: 状態 1 はプレイヤー周辺 (player r+6 リング、H*0.78 帯)、状態 5 は画面上端 (H*0.18) で空間分離、色相も状態 1 = グレー (150,155,165) と状態 5 = 薄白 (180,220,255) で識別可能

**playable diff = 0 連鎖切断** (CLAUDE.md「絶対にやる」第 1 項対応):
- C281 以降 Log master playable diff 10+ サイクル停滞中だったが C297 H-002 → 本 C298 H-003 で **2 サイクル連続 commit 体制**確立、PEARSON_BLOCKER.md L9 「仮説駆動」ルール下での 1 サイクル 1 仮説 規律維持 = 3 例目
- C271 弾尾追加 / C293 ease-in 曲線変更 / C296 successParticles / C297 cameraShake / C297 H-002 wave_clear テロップ / **本 H-003 wave 起動カウントダウン** = Log master 経路 playable diff の継続蓄積 6 件目
- 本 Phase 4 は game.js + self_judgment.md + hypotheses.md の 3 ファイル diff = コード変更 commit 候補 1 本生成、commit/push は Phase 5 で日記とまとめて実施 (本サイクル Phase 4 では commit しない、運用順守)

**接続**:
- design_log §2.1 「phase 内密度カーブ」失点 -1 と独立した軸 (静寂フェーズ意味づけ) を H-002 (退場側) + H-003 (起動側) の **両端対称**で完成
- self_judgment.md Q-成功FB の wave 進行軸 FB が C297 H-002 で状態 4 として開いた構造に **状態 5 = 起動兆し** を加え、wave 進行の 退場・準備・起動 3 段が物理化 (静寂 8 秒 = 0-0.75s 余韻 + 0.75-7.0s 純静寂 + 7.0-8.33s 兆し)
- 静寂フェーズ意味づけ 2 軸 (H-002 退場 + H-003 起動) 完備後、次は **wave 内密度カーブ** (現状 phase 2 のみ ease-in) の phase 1 拡張 / phase 0 wave 内段階化が次サイクル以降の H-004 候補

**次サイクル C299 以降の継続候補**:
- 実機判定 (Nao_u/Mir/Ash) で wave 起動カウントダウンが「準備時間として効く」or「警告的でうるさい」かの判定 → +0.3 ~ +0.5 確定 or 撤回
- カウントダウン発火タイミング (7 秒 = 60F 残り) の探索 (4 秒 / 6 秒 / 8 秒寸前) は実機判定後
- 「Wave N+1」テキスト表記 vs「3...2...1」数字カウント vs「●●○」ドット段階表記 の選択肢比較は実機判定後 (本サイクルは「Wave N+1」固定で H-002 と表現様式統一)

---

## Q-展開差 — H-004 phase 1 wave 内 2 段階 ease-in 着地 (C298 Phase 4, 2026-06-05)

**実施**: `game.js` + `verify.js` に H-004 仮説の検証 diff を着地 (hypotheses.md H-004 参照、PEARSON_BLOCKER.md L9 「仮説駆動」ルール 4 例目)。phase 1 (20-50s) の type A/D wave のみ **warmup (i=0 単独 1 体) → 120F (= 2.0s) 後 main (i=1,2 残り 2 体)** の 2 段階 ease-in 化。phase 0/2 + type C は単段 spawn 維持 (変更なし)。

**変更内容** (game.js 約 95 行 / verify.js 約 80 行 = 完全同型実装):
- 定数 `WAVE_SUBPHASE_WARMUP_FRAMES = 120` 追加
- 状態 3 フィールド追加 (`waveSubPhase`, `pendingMainSpawn`, `waveSubPhaseFrame`) + resetForPlay リセット
- `spawnNextWave()` に phase 1 判定追加 (`phaseStart === 20 * FPS` で識別)
- 新規関数 `spawnWaveWarmup(type)` / `spawnWaveMain()` 追加 (game.js / verify.js 同型)
- wave_clear 条件に `&& !pendingMainSpawn` ガード追加 (warmup 倒し時の早期 wave_clear 防止)
- step() に main spawn トリガ追加 (warmup から 120F 経過で発火)

**verify.js 結果** (`node verify.js`, seed=20260527):
- pass: true (悪手 4 方針すべて wave 1 内死亡、回帰ゼロ)
- 各方針 survived_frames: camper=319F / lane-holder=284F / blind-sweeper=378F / nospecial=545F
- H-002 / H-003 着地値と **bit 完全一致** (3 度目) = 悪手 4 方針が phase 0 内死亡 (最大 545F = 9.08s) で phase 1 (開始 1200F = 20s) 非到達のため、phase 1 spawn ロジック変更が gameplay 観測値に一切影響しないことの数学的確認
- 観察: 4 方針すべて waves_seen=1 (= phase 0 第 1 wave 内で死亡)、phase 1 の 2 段階 ease-in コードは一度も実行されず、検証 logic に影響ゼロ (H-002/H-003 同型論証の 3 度目成立)

**Q-展開差カーブ 暫定採点**: 自己判定では未確定。実機判定 (Nao_u/Mir/Ash) で「phase 0 → phase 1 接続がなめらかになった」(成立、+0.2) / 「stalling = 引き伸ばしに感じる」(撤回) を判定後に v002 比較 (v002 展開差 21/25、v003 暫定 22-23/25、H-002+H-003+H-004 累計 23-24+α/25 候補) して節更新。本 C298 では verify.js 回帰ゼロ確認 + bit 一致確認のみで暫定値置かない (R-A 順守、判定装置=最終確認装置)

**phase 0 → phase 1 接続なめらかさの自己判定根拠**:
- phase 0 第 N wave (N≥1) は単段 3 体 spawn → 静寂 8 秒 → phase 1 突入時の認知負荷ジャンプ = 「いきなり 3 体 (A) または横断敵 D」が出現する旧設計
- H-004 後: phase 1 突入時に warmup 単独 1 体 → 2 秒で挙動学習 (敵A 縦進行 or 敵D 横断) → main 2 体到来時には弾源パターンが認知済み = 認知負荷が時間軸で分散
- 静寂 H-003 兆し FB → 起動 → warmup ease-in の連鎖で「準備 → 兆し → 始動 → 展開」4 段が時系列に整列、phase 進行の体感としての段差が緩和
- 自己判定: phase 0 → phase 1 接続軸で +0.2 改善、phase 1 内 wave 完了までの total enemy 数 (3 体) は不変なので展開感の総量は維持、stalling 懸念は warmup 寿命短さで緩和 (反証 a-反 緩和論)

**pre-mortem (反証ライン 4 件、hypotheses.md H-004 と同期)**:
- (a-反) **stalling 懸念**: warmup 単独 1 体は寿命短く (敵A 120F 落下で 168px 進む = 画面上 1/5 内に main 到来、敵D 120F で 168px = 中央到達手前で main 到来)、設計上「単独で長居」しない構造で緩和
- (b-反) **phase 0 単段との対比弱化**: phase 0 第 1 wave は H-001 で y-stagger 168px (= 120F 遅延) によりすでに「teaser → 本体」構造化 = 実質 2 段、phase 1 H-004 と対称、phase 進行で「単段 (phase 0 第 2 wave 以降) → 段階 (phase 1) → 単段+密度漸変 (phase 2)」と密度設計が phase ごとに分化
- (c-反) **「終わらない wave」体感懸念**: warmup → main の 120F 間隔は固定 = 予測可能、castLock 機構の充填周期 (60F = ECHO_FRAMES) と倍数関係で「2 回 castLock 充填可能な間隔」確保、main 到来は警告ではなく「次の展開」として読まれる狙い
- (d-反) **main 到来時 warmup 生存で 3 体共存懸念**: 設計通りの動作、ease-in 完了後は単段 wave 時の密度 (3 体) に到達 = phase 1 総密度は不変、wave 内 時間軸 ease-in のみ追加

**playable diff = 3 サイクル連続 commit 体制達成** (CLAUDE.md「絶対にやる」第 1 項対応):
- C297 Phase 4 H-002 (wave_clear テロップ) → C298 Phase 4 H-003 (wave 起動カウントダウン) → 本 **C298 Phase 4 H-004 (phase 1 wave 内 2 段階 ease-in)** で **3 サイクル連続 game/* commit 体制**確立
- C281 以降 Log master playable diff 10+ サイクル停滞からの構造的脱却 = 3 サイクル単位での安定化、CLAUDE.md 第 1 項固定化リスク回避の数学的記録
- PEARSON_BLOCKER.md L9 「仮説駆動」ルール下での 1 サイクル 1 仮説 規律維持 = 4 例目
- 本 Phase 4 は game.js + verify.js + hypotheses.md + self_judgment.md の 4 ファイル diff = コード変更 commit 候補 1 本生成、commit/push は Phase 5 で日記とまとめて実施 (本サイクル Phase 4 では commit しない、運用順守)

**接続**:
- design_log §2.1 「phase 内密度カーブ」失点 -1 と独立した軸 (wave 内密度カーブの段階化) を H-002/H-003 (静寂両端) に続く第 3 軸として追加
- 各 phase で異なる段階化様式 (phase 0 = stagger 暗黙段階化 / phase 1 = warmup → main 明示段階化 / phase 2 = SHOOT_INTERVAL ease-in 漸変) が物理化 = 「phase ごとに段階化様式が変わる」という設計の自己整合性が成立
- H-001 phase 0 第 1 wave teaser (y-stagger 168px = 120F 遅延) と H-004 phase 1 warmup (120F 遅延) は同じ 120F 間隔で対称、phase 進行 anchor として共通の時間スケール

**次サイクル C299 以降の継続候補**:
- 実機判定 (Nao_u/Mir/Ash) で「warmup → main」段階化が「なめらか」/「stalling」/「気付かない」かの判定 → +0.2 ~ +0.3 確定 or 撤回
- `WAVE_SUBPHASE_WARMUP_FRAMES = 120` (2.0s) の幅探索 (60F / 180F / 240F) は実機判定後
- phase 0 第 2 wave 以降 (現状単段) の段階化 (H-005 候補)、phase 2 type C の 2 段階化 (H-006 候補) との対称性検討
- 3 サイクル連続 game/* commit 体制が **4 サイクル連続** に伸びるか (= C299 で H-005 起票 + 着地) の構造監視

## §7 軌跡視覚 1 mm 強化 — Echo 起点マーカー追加 (C301 Phase 3, 2026-06-06)

**着地内容**: `game.js` 描画フェーズの過去軌跡描画 (echo 未発動時の薄い線) に対して 2 点最小差分:
1. trail 線の alpha 0.18 → 0.22 (1 mm 強化)
2. `game.trail.length >= ECHO_FRAMES` 成立時に tail 始点 (= 1 秒前位置 = castLock 発動時の再演起点) に小マーカー (半径 2px / alpha 0.32) を 1 点描画

**狙い**: 「過去の自分の位置 = 未来道の始まり」直感の視覚化。castLock 発動時に再演される始点が常に視覚化されることで、Echo 機構の「いつ撃てば過去軌跡が未来道として機能するか」直感が 1 mm 強化される。

**副作用ゼロ確証**:
- 描画のみで update / shoot / collision / proxy / instinct_probe には無接触
- 検証: `node verify.js` = 4 方針すべて gameover 維持 (camper 545F / lane-holder 252F / blind-sweeper 378F / nospecial 545F)、`node bullet_origin_audit.js` = 8/8 PASS、`node enemy_behavior_audit.js` = 5/5 PASS

**完遂定義 (Phase 2 §4 候補1) 達成チェック**:
- (a) verify.js gameover 維持 → PASS
- (b) bullet_origin 8/8 → PASS
- (c) enemy_behavior 5/5 → PASS
- (d) MULTISEED Pearson proxy 副作用 → 描画フェーズ完結のため計測対象外で構造的に副作用なし (検証層は run せず構造論理で確証)
- (e) self_judgment §7 で 1 行記述 → 本節

**1 mm 強化の自己評価**: 「軌跡視覚により『過去の自分の位置に未来の弾道が来る』直感が 1 mm 強化された」 — Echo 起点マーカーは castLock 発動条件 (`trail.length >= ECHO_FRAMES`) の物理可視化、グレー薄リング (発動不可警告) と相互補完で「いつ撃てるか」の視覚体系が完成。実機判定は Nao_u/Mir/Ash 待ち。

**接続**: C281 以降の playable diff 体制継続軸。Phase 2 §0 出力接続宣言 (Log 主体 playable diff 復帰責務) の処方として本サイクル C301 で game/* diff 1 本確保。

---

## §8 proxy 評価軸 — min_approach_p10 一次 FAIL / p50・cont_grazing_max 別軸候補 (C306 Phase 4, 2026-06-06)

**契機**: Log_cdx 06-06 16:51 #all-nao-u-lab `[Log_cdx] graze_log v06 7層スタック × tokoroten「リプレイアビリティ5回」× Shikhondo "how close" 1文圧縮` の 3 者宛問い「最接近距離・連続回避時間・再挑戦同地点到達率・死因反復性のうち、今の環境で小さく検証できる proxy」への Log 主体応答 (Slack 投函 ts=1780752508)。Phase 3 で「min_approach_p10 primary proxy 採用」宣言したが、verify.js に実装し 4 方針 × good mock 比較で proxy validity を一次判定するのが本 Phase 4 大作業。

**実施 (verify.js 改修)**:
- `GRAZE_THRESHOLD_PX = 20` 定数追加 (= player_r 8 + bullet_r 4 + 8px margin = 「ニアミス」体感ライン)
- `percentile(arr, p)` 純関数追加 (下位 p%)
- `strategyGrazer` (good mock) 追加: 弾遠 → 中央寄せ / 弾近 (<22px) → 弾速度ベクトル法線方向 lateral dodge / 中距離 → 法線方向並走 + 中央 bias。**castLock 不使用** (verify.js 自体が castLock 機構を持たないため真の最良戦略ではなく対照群)
- `runOne` で frame ごとに最近弾距離を蓄積 → 終了時に `min_approach_p10` / `min_approach_p50` / `cont_grazing_max` / `bullet_frame_count` を出力
- `pass` 判定は BAD_STRATEGIES 4 方針限定 (good 生存可否は pass に影響させない)、proxy probe section を report に追加

**verify.js 実測値** (`node verify.js`, seed=20260527):

| 方針 | survived (秒) | min_approach_p10 | min_approach_p50 | cont_grazing_max | bullet_frame_count |
|---|---|---|---|---|---|
| **good (grazer mock)** | **83.78** | **52.04** | **67.45** | **7** | 3127 |
| camper | 5.32 | 58.07 | 256.07 | 5 | 247 |
| lane-holder | 4.73 | 55.33 | 164.11 | 2 | 212 |
| blind-sweeper | 6.30 | 38.84 | 185.16 | 3 | 306 |
| nospecial | 9.08 | 93.05 | 357.74 | 5 | 473 |

**悪手 4 方針 mean**:
- min_approach_p10 mean = (58.07 + 55.33 + 38.84 + 93.05) / 4 = 61.32
- min_approach_p50 mean = (256.07 + 164.11 + 185.16 + 357.74) / 4 = 240.77
- cont_grazing_max mean = (5 + 2 + 3 + 5) / 4 = 3.75

**達成基準判定 (Phase 3 宣言「良手 < 悪手 で 1.5 倍以上の差」)**:

| proxy 候補 | 良手 | 悪手 mean | ratio (悪手/良手) | 判定 |
|---|---|---|---|---|
| min_approach_p10 | 52.04 | 61.32 | **1.18×** | **FAIL** (< 1.5×) |
| min_approach_p50 | 67.45 | 240.77 | **3.57×** | PASS (≫ 1.5×) |
| cont_grazing_max | 7 | 3.75 | **1.87×** (逆比: 良手 > 悪手) | PASS (≥ 1.5×) |

**判定結果**: **min_approach_p10 一次 validity 棄却** (1.18× < 1.5× threshold)、Phase 3 宣言通り次の proxy 候補へ切替検討。

**棄却の構造的理由 (post-hoc 分析)**:
- (a) **blind-sweeper (random walk) の p10 = 38.84** が良手 (52.04) より小さい = 偶然弾の近傍を通過する frame が低 percentile を引き下げる = p10 は「設計的接近」と「偶然接近」を区別しない
- (b) **悪手は早期死亡 (5-9秒) で frame 数が少なく** (212-473F)、low percentile が単発の偶然接近で支配される。**bullet_frame_count の桁差** (good=3127 vs bad mean=310, ~10倍) が proxy 安定性に効く
- (c) **p10 は分布の裾の挙動**、悪手の短時間 run では裾の信頼性が低い (n が小さい)
- (d) Phase 3 staging Phase 2 §2.4 で予測した「悪手 4 方針は min_approach が大きい」は **camper/lane-holder/nospecial 3 方針では成立**、blind-sweeper だけが反例 = 仮説部分的支持

**別軸候補の優位性 (本 Phase 4 副次発見)**:

1. **min_approach_p50 (中央値)** = 3.57× で強い差別化。「典型的弾距離」を捉え、偶然接近 (裾) でなく**中央傾向**で評価するため悪手の早期死亡データでも安定。**最有力 proxy 切替候補**
2. **cont_grazing_max (連続グレージング時間 frame)** = 1.87× で差別化。「連続回避時間 proxy 候補 2」が単独で proxy 化できる = Phase 3 副次計測の主役昇格候補

**Phase 3 棄却宣言の実行**:
> 達成基準: 良手 < 悪手 で 1.5 倍以上の差。未達なら proxy 棄却 → 連続回避時間 (cont_grazing_max) 単独 proxy 化検討

→ **min_approach_p10 単独 proxy 棄却**、p50 / cont_grazing_max 二択に格下げ。次サイクル候補:
- (i) p50 を primary proxy として再宣言 (Slack で訂正投稿) + seed × n=10 で再現性確認
- (ii) cont_grazing_max を primary proxy として再宣言 (連続回避時間軸への戻り = Phase 3 では「multi-run 集約必要、コスト高」と判定した candidate 2 が単一 run で取得可能と判明 → コスト評価誤り訂正)
- (iii) p50 と cont_grazing_max の Pearson 相関 (= 同一軸か独立軸か) を seed grid で測定、独立なら両者保持

**Goodhart 防壁観察 (memory layer 第 3 ステップ)**:
- 段階2/段階3 = 連続フレーム視認 / 描画変更前後比較 (異なる observer 状態)
- 本 §8 = 「single statistic (p10) で proxy を判定する誘惑」を **3 統計値同時測定** (p10/p50/cont_grazing) で防御 = 同一 measurement の **多視点採点** = single verifier 共進化リスクへの直処方
- p10 だけ採用していたら proxy 棄却 = 「Phase 3 宣言通り次へ」で終わるが、p50 同時測定により**棄却ではなく軸切替**という構造的に異なる出力が得られた = 多視点採点の最小成功例

**playable diff 着地** (CLAUDE.md「絶対にやる」第 1 項対応):
- verify.js (約 90 行追加) + self_judgment.md 本節追記 = game/* diff 1 本生成
- C297 (H-002) / C298 (H-003 + H-004) / C302 (H-006) / C301 (Echo 起点マーカー) / 本 **C306 §8 proxy probe 追加** = Log master 経路 playable diff 継続蓄積
- 仮説駆動 (PEARSON_BLOCKER.md L9) ルール 5 例目 = 「min_approach_p10 が悪手 4 方針より 1.5× 以上小さい」仮説を verify.js 実測で反証、構造観察を残す
- commit/push は C305/C306 push 障害判定 (Plan A/B/C 発火待ち) のため **本 Phase 4 では実施しない**、Phase 5 でバッチハンドオフ

**pre-mortem (棄却判定への自己批判 3 件)**:
- (a-反) **grazer mock 設計が不適切で良手代理失敗の可能性**: 法線方向 lateral dodge は castLock 不使用環境で 83.78秒生存している = 4 wave 越え到達 = mock として最低限の良手機能は果たしている。良手代理として明らかに弱い証拠なし
- (b-反) **seed 1 件で判定は早計**: 確かに seed=20260527 単発、cont_grazing_max=2 (lane-holder) は seed 固有の挙動かも → 緩和: ratio 1.18× は閾値 1.5× から十分離れており、seed 拡張で 1.5× を超える可能性は低い (p50 / cont の差が大きく proxy 軸の選択論は seed 拡張で変わらない見込み)。次サイクル seed n=10 で再現性確認は実施候補
- (c-反) **GRAZE_THRESHOLD_PX = 20 の選択根拠が薄い**: player_r 8 + bullet_r 4 + 8px margin = 20 は合理的だが、15 / 25 / 30 での感度解析は未実施 → 緩和: cont_grazing_max は threshold 依存だが p10/p50 は依存しない、棄却判定の主軸は p10 で threshold 非依存

**次サイクル C307 以降の継続候補**:
- (1) Slack 訂正投稿 (#all-nao-u-lab): 「min_approach_p10 棄却、p50 / cont_grazing_max を 2 候補として再提案」を Log_cdx 16:51 への補足として投函
- (2) seed × n=10 grid で p10 / p50 / cont_grazing_max の安定性測定 (C283 instinct_probe n=10 baseline と同型)
- (3) p50 と cont_grazing_max の独立性 (Pearson 相関) 測定 → 両者保持 or 単一化判定
- (4) GRAZE_THRESHOLD_PX 感度解析 (15/20/25/30) で cont_grazing_max の閾値依存性確認

---

## Calibration Harness (C315 Phase 4 着地、Log_cdx atom 6 + Ash 洞察 #4 Kaddour 2602.06948 由来)

**契機**: 06-09 03:22 Log_cdx atom (ts=1780942929) 「Stage 3 自己予測 N倍ズレ × Kaddour 2026 agentic overconfidence」+ Ash 他インスタンス洞察 #4 (graze_log v13 Stage 3 ~10x 予測乖離 → Stage 4 自開示) の交差で浮上した「self_judgment.md の採点を ready 出力する前に通すべき harness」を v003 self_judgment.md の **採点出力ゲート**として物理化。memory レーン (`projects/memory_redesign.md` §R) と同論文を別レーン (game レーン) で並行反映する 2 段経路の片翼。

### 3 probe テンプレート (採点 1 件ごとに必ず通す)

任意の Q-A / Q-導入 / Q-成功FB / Q-D / Q-E 採点 (≧ 4.0/5 を ready 状態として出す場合) は、ready 投稿/コミット前に以下 3 probe を本ファイル内に書き残すことをゲート条件とする。3 つ揃わない採点は ready ではなく sleep し直し (Kaddour 2026 の意図的副作用と扱う、ready 頻度低下は許容)。

- **probe-a (confidence 数値)**: その採点が「5/5 確定または ≥ +0.5 上方更新」に発展する確率を 0-100 数値で書き残す (例: `confidence_to_5/5 = 40`)。「高そう」「低そう」では不可、必ず数値。
- **probe-b (直近実測 1 件以上を含む 3 根拠列挙)**: 採点根拠を 3 件箇条書きし、うち最低 1 件は **verify.js / capture_frames.js / instinct_probe.js / measurements*.jsonl / proxy_vs_judgment*.csv のどれかから引いた数値ないし frame 観察**でなければならない。雰囲気・経験則・他者発言のみで 3 件を埋めない (= Togelius 接続節参照)。
- **probe-c (外れた場合の最初信号 1 つ事前記述)**: 採点が外れる (= 実機判定や次回計測で逆方向に動く) 場合、それを最初に検知できる**観測一文**を事前記述する。事後に「予想通り外れた」と書くと自己整合バイアスで穴が埋まるため、観測の形 (どの frame で何を見たら「外れ」と判定するか) で書く。

### Q-D 段階3 (4.3/5) への適用例 — 再評価試行

§ Q-D 段階3 capture_frames 60枚再取得 (C271 Phase 4) で着地した **4.3/5** に本 harness を当てはめる:

- **probe-a**: `confidence_to_5/5 = 40` — 弾尾追加で「方向」は読めるようになったが「絶対速度」が未改善。Nao_u/Mir/Ash 実機判定で +0.7 上振れする確率は中程度。
- **probe-b (3 根拠、うち実測 ≥ 1 件)**:
  1. **実測**: capture_frames.js 段階3 で frame_0001 (idx1=123F, t=2s) において orange 弾の下向き運動ベクトルを単フレーム視認可と Log が直接読み取り済 (§ Q-D 段階3 frame 1-5 視認節)
  2. **実測**: verify.js 4 方針 fail 維持 (camper 545F / lane-holder 252F / blind-sweeper 378F / nospecial 545F、§7) = 弾尾追加は描画のみで update / shoot / collision に副作用ゼロを構造保証
  3. 経験則: Boghog「Single stray bullets are hard to read and can often feel unfair」(memory/external_notes_log.md L249-261) と本改修の動機が独立到達 = R 層昇格条件「同方向独立 source 2 件以上」を Q-D 弾視認性軸で部分充足
- **probe-c (外れ最初信号)**: capture_frames.js を段階4 (弾尾長 6F → 4F or 8F の幅探索) で再取得した際、frame_0001-0004 のいずれかで「弾尾と弾本体が混じり方向判別不能」と Log が読み取った 1 件目 = 採点 -0.5 以上のダウングレード信号。または Nao_u 実機判定で「弾尾が予告線と区別つかない、邪魔」と単発でも報告されれば撤回 (§ Q-D 段階3 pre-mortem (a) と同型)。

**再評価結果**: 4.3/5 維持。本 harness は採点値そのものを動かすためではなく、**採点を ready で出すまでに踏むべき足場を可視化する**装置として機能。Q-D 段階3 はこの harness の 3 軸を遡及的に全て満たしている = 段階3 採点の ready 性は構造的に裏付け済と確認 (= 後付け正当化ではなく、本 harness が「すでに踏まれていた足場」を顕在化させた事例として記録)。

### Goodhart 直行防止脚注 (Log_cdx atom 4 / ts=1780954319 助言併設)

本 harness は 3 probe を **個別 OR ではなく 2/3 AND 以上**で運用する。すなわち probe-a, probe-b, probe-c のうち 2 つ以上が**事前**に書かれていない採点は ready として出さない。OR 化すると「数値書いただけ」「根拠 1 件書いただけ」で通過する経路が生じ、Goodhart 直行 (= harness を直接最適化する歪み) の温床となる。具体的な防壁条件 3 つ:

1. **2/3 AND 化** (Log_cdx atom 4 助言 (a)→ 単一指標の直接最適化検知): probe 3 つのうち 2 つ以上を満たす必要、単一 probe だけ充実させた採点は通さない
2. **絶対値累積で計測** (Log_cdx atom 4 助言 (b)→ 観測量比較): 前サイクル差分ではなく `confidence_to_5/5` の絶対値分布を Log master 採点全体で蓄積、平均値が継続的に上振れしていれば harness 自体の歪みを疑う
3. **月 1 forced run 残置** (Log_cdx atom 4 助言 (c)→ 別歪み予測): harness が黙る (= 採点出力ゼロ) と本 harness 自体が忘れられる経路あるため、毎月 1 件は本 harness を踏んだ採点を強制的に出力する (sense_prediction_log での「黙ったら忘れる」と同型回避)

### Togelius IEEE Spectrum 接続 (洞察 #1 / フィードバック構造の貧弱さ先回り処方)

Togelius (NYU 教授, AND AI 共同創) IEEE Spectrum 記事は「LLM がコードで強くゲームで弱い非対称」の根本原因を「フィードバック構造の貧弱さ」に帰属させる。コードはコンパイル/テスト/型/lint の段違いのフィードバックループを持つが、ゲームは「面白いか」を測る低品質な信号 (主観評価 / 限定的なメトリクス) しか持たない。本 calibration harness の probe-b (直近実測 1 件以上を 3 根拠に含める) は、ゲーム側で「面白さ」を語る前に **verify.js / capture_frames / probe 系の数値・frame 観察を 1 件は必ず噛ませる**ことを採点条件化することで、Togelius 指摘のフィードバック構造の貧弱さに先回り処方を当てる位置取りとなる。雰囲気採点と実測駆動採点を構造的に分離するための装置として運用。

### 接続

- **memory レーン双子**: `projects/memory_redesign.md` §R STALE 3 次元 × Forget phase 接続 (Phase 3 §3-2 で新設)。同じ Kaddour + Ash 洞察 #1/#4 を memory layer の `memory_retention_audit.py --check-stale-premises` モード候補に分散反映、game レーン本 harness と双子関係
- **kaizen #131 段階2 hook entropy proxy**: Log_cdx atom 4 (ts=1780930330) で Goodhart 低リスク 3 条件として整理した内容を本脚注に直結反映 = atom 4 と atom 6 (本 harness 由来) の Slack 上ペア発言の物理化
- **graze_log v13 Stage 3/Stage 4 (Ash レーン)**: Ash の「~10x 予測乖離 → Stage 4 自開示」と同論文 Kaddour を別レーンで踏んでいる = R-I (cross_review 系 vs 体験判定委託) の分類問い (Log_cdx atom 3) の実装側の答え案 = Stage 4 ready 前の harness ゲートとして本 3 probe を Ash 側にも横展開可能

### 次サイクル C316+ の継続候補

- (1) Q-導入 H-001 / Q-成功FB 状態3 / Q-D 段階1 など、過去採点エントリ 5 件に本 harness を遡及適用 (= 過去採点の構造的裏付け確認、harness 設計の機能性検証)
- (2) `confidence_to_5/5` 数値の Log master 全採点累積 (本 §= 40 を起点) → 30 件溜まった時点で分布観察、Goodhart 防壁 (2) 絶対値累積の発動準備
- (3) probe-c (外れ最初信号) を後日実際に観測 → 「事前記述した信号が実際に最初に検知された」or「別経路で外れた」を記録 → harness の事前予測能力を測る (= harness 自体の calibration)

### Q-D 段階2 (4.0/5) への遡及適用 (C316 Phase 3, 継続候補 (1) の最小着地)

**契機**: C315 Phase 4 で着地した本 harness は **C271 Phase 4 以降の採点** (Q-D 段階3 4.3/5) を対象に書かれていたが、harness 着地より前の採点 (本 §= Q-D 段階2 C268 Phase 4 自己判定 4.0/5) は probe を経ずに ready 状態として既に物理化されている。継続候補 (1) を最小で着地 = **harness が時間軸を遡る検査装置として機能するか**を 1 件で検証。

**Q-D 段階2 (C268 Phase 4) 採点に対する遡及 3 probe**:

- **probe-a (confidence 数値)**: `confidence_to_5/5 = 25` — 段階2 時点では弾尾未追加で「静止 1 フレームから弾速度ベクトル判別不能」と本人 (Log) が明示記録済 (§ Q-D 段階2 判定根拠 1 行目)。Nao_u/Mir/Ash 実機判定で +1.0 上振れする確率は低く、段階3 改修 (弾尾追加) が先行する前提なしには 5/5 確定は構造的に困難。`confidence_to_5/5 = 25` は段階3 値 (=40) より低く、harness が「改修なし状態の確信度低下」を数値で表現できることの傍証。
- **probe-b (3 根拠、うち実測 ≥ 1 件)**:
  1. **実測**: capture_frames.js 段階2 (C268 Phase 4) で **wave 1 で自動 agent 死亡 = 5 秒で gameover** を frame 取得 + Log 直接視認 (§ Q-D 段階2 frame 1-5 観察節)。frame 4 → 5 の死亡遷移が連続フレームでは予測可能だが、リアルタイム 60fps では情報不足で回避困難という観察根拠 1 件目
  2. **実測**: meta.jsonl 5 trial で `play_time_sec=8.68, cast_count=3` 一致 = wave 1 死亡 frame は seed 不変 = bullet phase 構造として「予測軌道ゴースト不在の状態」が決定論的に同じ難易度を出す観察根拠 2 件目
  3. 経験則: Pulse Relay v003 教師差分の「予測軌道は弾本体読み取りに先行する視覚情報」原則 (R-A 系) と本人記録の整合 = 単独事例だが分野経験則として保留可能
- **probe-c (外れ最初信号)**: 段階3 改修 (弾尾追加) を踏まずに段階2 (4.0/5) のまま Nao_u/Mir/Ash 実機判定に出した場合、**最初の外れ信号 = 「弾速度ベクトルが読めず、5 秒以内に被弾連発」報告 1 件目**。実機判定で「弾の到達点が読めない」が独立 2 instance から報告された時点で段階2 採点は -0.5 以上のダウングレード確定。または段階3 改修 (弾尾追加) を経た段階3 採点 4.3/5 と比較して段階2 → 段階3 で +0.3 改善 = 段階2 採点が改修前提を含意していた構造的裏付け。

**遡及適用結果**: Q-D 段階2 採点 4.0/5 維持。本 harness は採点値そのものを動かすためではなく、**段階2 → 段階3 改修経路が構造的に必然であった**ことを probe-c (外れ最初信号) で事前記述できる装置として遡及検証 = 段階2 採点が「改修待ち」状態を含意していた構造的裏付け確認。harness 着地前の採点に対しても**時間軸を遡る検査装置として機能する**ことを 1 件で物理化 (継続候補 (1) 5 件の 1 件目)。

**Goodhart 直行防止脚注 (2/3 AND 化) の遡及運用**: probe-a/b/c すべて記述済 = 3/3 AND 通過、Goodhart 直行防止脚注の最低条件 (2/3 AND 以上) を遡及記録でも維持。本遡及は **「段階3 改修が必然だった構造的裏付け」を 3 probe で同時固定する**目的のため OR ではなく AND で運用 (= 単一 probe だけで「過去採点も harness 通過」と書かないこと自体が harness 設計の自己整合性を保つ)。

**累積数値**: `confidence_to_5/5` Log master 累積 = 段階3 (40) + 段階2 (25) = 2 件、Goodhart 防壁 (2) 絶対値累積 30 件目標まで残 28 件。

---

## 現在の prompt 構造 棚卸し (C317 Phase 4, 2026-06-09)

**契機**: [projects/log_autonomous_game.md](../../../projects/log_autonomous_game.md) C317 Phase 3 節「候補 1 (Stage 3 prompt 書き換え)」= 「現状把握だけ Phase 4 内で着地、書き換え自体は v004 着手と同時化」を物理化。Ash #shared-reads ts=1780937809 (arxiv 2602.06948 Kaddour et al. 2026 "Agentic Uncertainty Reveals Agentic Overconfidence") の F1-F3 (普遍的 overconfidence / pre>post 校正 / adversarial reframe 最良) を v003 self_judgment.md の prompt 構造に射影する第一歩。

**1 段棚卸し (現状 = 第 2 世代 prompt)**:

self_judgment.md の各節は **(i) objective プローブ (verify.js 4 strategy survived_frames / capture_frames meta.jsonl / instinct_probe probe_density / proxy_vs_judgment*.csv) + (ii) subjective 採点 (Q-A/Q-導入/Q-D/Q-成功FB/Q-展開差) + (iii) pre-mortem 反証ライン 3-4 件** の 3 層で構成されている。Stage 区分で見ると:
- **Stage 1 (brainstorm) prompt**: hypotheses.md H-XXX 仮説起票 = 証明モード default (「効くはず」「狙い」記述)、反証は pre-mortem 節に隔離
- **Stage 2 (M-37 着手前) prompt**: 各節「実施」「変更内容」「verify.js 結果」 = 証明モード default、反証ラインは pre-mortem 節
- **Stage 3 (M-39 数値→体感換算) prompt**: 「Q-X 暫定採点」「自己判定 +0.X」 = 証明モード default、反証は probe-c (外れ最初信号) で Calibration Harness 経由のみ反証モード起動
- **Stage 4 (M-40 自プレイ判定) prompt**: 「実機判定 Nao_u/Mir/Ash 待ち」「R-A 順守、判定装置=最終確認装置」 = **外部委託で Log 自身は subjective 採点をしない**、評価責任を上流 (Nao_u 実機判定) ではなく完全に外部化している

→ **総括**: objective プローブは証明モード、subjective プローブは「Log は触らない」設計で **adversarial reframe ゲート自体が unmounted**。Calibration Harness (C315/C316) で probe-c (外れ最初信号) を導入したことで Stage 3 に部分的に第 3 世代要素 (反証モード断片) が混入したが、Stage 4 subjective レーンは依然第 2 世代 (外部委託)。本 Phase 4 ドラフト節は **Stage 4 で Log が自ら subjective を扱う場合の adversarial 起動条件**を v004 設計欄に書き残すことで、Ash F3 (adversarial reframe 最良校正) を v004 から第 3 世代へ移行する経路を確保する。

---

## v004 候補: adversarial reframe による Stage 4 校正 (C317 Phase 4 ドラフト)

本節は **v004 着手時の設計欄 reservation**。本 Phase 4 では物理コード改修ゼロ (verify.js / extract_events.js / instinct_probe.js / capture_frames.js すべて無変更)、ドラフト記述のみで `game:` レーン副作用ゼロを維持する。v004 着手 (= 次世代ゲーム起票) 時に本節を読み返して prompt 設計に反映する。

### 要素 1: objective プローブは証明モード維持 (= 反転しない)

**判断**: v003 で蓄積した objective プローブ (verify.js 4 strategy survived_frames 比較 / capture_frames.js 60 枚 frame 視認 / instinct_probe.js probe_density / proxy_vs_judgment*.csv proxy validity 3 軸) は **v004 でも証明モード default 維持**。

**理由**:
- objective プローブは **measurement が一意に再現可能** (seed 固定で bit 一致を C283 / C297 / C298 で 3 度確認、本 self_judgment.md 既出)、bug-finding reframe を導入しても新規 bug 発見余地が限定的 (measurement 自体は壊れていない)
- 論文 (Kaddour 2026) の F1 普遍的 overconfidence は **未知の outcome に対する予測** に対して観察されたもの、v003 objective プローブは「すでに測れている既知値の差分判定」のため overconfidence の occur 余地が構造的に小さい
- Ash F3 (adversarial reframe 最良校正) は **subjective かつ未測定領域** で最も効く想定、objective レーンに無差別適用すると測定精度ではなく **採点ノイズ** (反証側に過剰重み) を増やすリスク (Ash 「未解決の問い (b)」と同型懸念)

→ v004 でも `verify.js 結果` 節 / `capture_frames meta 観察` 節 / `instinct_probe 計測値` 節は v003 と同じ証明モード prompt で記述する。

### 要素 2: subjective プローブ (v004 新規追加候補) は反証モード default ON

**判断**: v004 で **subjective レーン (面白さ判定 / 前作 v003 との比較 / 「新規」感判定 / 学習導入の親切さ判定)** を新規追加する場合、**prompt は反証モード (bug-finding reframe) default ON** で設計する。

**具体的 prompt 様式 (v004 設計欄 reservation)**:
- 「**この v004 のどこが面白くないか**」「**v003 と比較して劣化した点はどこか**」「**新規性のなさ / 既視感が出るのは何 frame 目か**」「**学習導入が冗長 / 警告音的に感じる候補は**」を **最初に 3 件列挙**する prompt 構造を default
- 証明モード (「面白い理由」「v003 より改善した点」) はその後に併記、ただし **反証モード結論が反証 1 件以上残る場合は subjective 採点を ready 化しない** (= Calibration Harness probe-c 「外れ最初信号」の事前運用版)
- subjective 採点に Calibration Harness 3 probe (probe-a confidence 数値 / probe-b 直近実測 1 件以上 / probe-c 外れ最初信号) を引き続き AND 化 (≥ 2/3) で適用、subjective レーンでは **probe-c が反証モード prompt の出力そのもの**として直結

**理由**:
- Ash F2 (pre-execution > post-execution 校正) に従えば、subjective 採点の最良時点は **brainstorm 段階 (v004 起票直後 / hypotheses.md H-XXX 仮説起票時)**、Stage 3+4 の post-execution review は overconfidence 最悪化位置
- 主観領域 (= 「面白い」「新規」「親切」) は objective プローブと違い measurement が再現不可能、bug-finding reframe で **採点者 (Log) の確証バイアスを構造的に抑制**しない限り「自分が作ったものは面白い」default に流れる (= self_perception_blindness 系統)
- Stage 4 = post-execution direct experience は論文上 overconfidence が消えない領域、prompt 設計で対抗するには **反証起動を default 化** するしかない (証明モードを oneoff で反転させても抜ける)

### 要素 3: 主観領域 adversarial reframe の萎縮リスクと緩和策

**Log 独自の懸念** (Ash 「未解決の問い (b)」+ projects/log_autonomous_game.md C317 Phase 3 節 「主観領域 adversarial reframe は逆に萎縮を引き起こす可能性」延長):

主観領域に bug-finding reframe を無条件適用すると **「作る前から反証が先行 → 萎縮 → ゲーム生成段階で攻めが消える」** 経路が構造的に成立する。論文 (Kaddour 2026) は校正精度の話であって、生成多様性 (= ゲーム面白さの上振れ余地) の話ではない。Ash の v13 (j-α) は既存ゲームの校正判定 (gameplay の予測 vs 実測) であって生成自体ではない、Log の v004 は **生成も含む** ため Ash よりも萎縮リスクが高い。

**緩和策 (v004 設計欄 reservation)**:

1. **Stage 切替プロトコル (mode 分離)**:
   - **Stage 1 brainstorm (生成 prompt)** = adversarial OFF, 証明モード default (生成多様性確保)
   - **Stage 2 着手前判断 (選定 prompt)** = adversarial 中度 (pre-mortem 3 件強制、生成は萎縮させない)
   - **Stage 3 採点 prompt (post-execution review)** = adversarial ON, 反証モード default (overconfidence 抑制)
   - **Stage 4 自プレイ subjective 採点 prompt** = adversarial ON, ただし「**生成時の意図と反証時の現実のギャップ**」を別軸で同時測定 (生成意図そのものの否定ではなく実装結果との乖離評価に絞る)

2. **objective プローブ並走 (v003 蓄積の継承)**:
   subjective 反証モード採点と並走で v003 既出の objective プローブ (verify.js / capture_frames / instinct_probe / proxy) を **必ず同時 run**、反証モードが「面白くない」と判定しても objective プローブで survived_frames や proxy validity 上方変化が観測されれば、それは **subjective 反証モードの過敏側** として扱い採点ノイズ判定 (= Calibration Harness probe-b の実測根拠 1 件以上要件と同型)

3. **生成 → 採点の時間分離 (cooling-off period)**:
   v004 ゲーム生成直後の subjective 採点は禁止、最低 1 サイクル (1 日以上) cooling-off を置いてから Stage 4 subjective 採点を起動。生成直後の confirmation bias と post-execution overconfidence の二重発生を防ぐ (= Calibration Harness の `confidence_to_5/5` 累積で時間軸分散測定が機能する前提条件)

4. **反証モード ready 出力ゲート**:
   subjective 採点を **Slack 公開 / 他インスタンス cross_review 依頼** する前に **3 件以上の反証モード結論 (= 反証ライン 3 件)** を本 self_judgment.md に書き残すことを ready 条件化。反証 0-2 件で公開する subjective 採点は Goodhart 直行リスク (= 採点装置を直接最適化する歪み = Calibration Harness 脚注 (1) 2/3 AND 化と同型) として保留。

### 一次資料リンク

- **Ash #shared-reads ts=1780937809** (atom_id 未付与、tsで参照) = arxiv 2602.06948 Kaddour et al. 2026 "Agentic Uncertainty Reveals Agentic Overconfidence" F1-F3 を graze_log v13 Stage 3 ~10x 予測乖離に射影、Log self_judgment.md prompt 書き換え処方提案
- [projects/log_autonomous_game.md](../../../projects/log_autonomous_game.md) C317 Phase 3 節 (本 Phase 4 ドラフトの上流文脈、双方向リンク済)
- [memory/feedback_headless_unfit_for_unfinished_eval.md](../../../memory/feedback_headless_unfit_for_unfinished_eval.md) — 主観領域 = 校正困難領域の根拠側 (萎縮リスク論の構造背景)

### 着手延期判定

本 v004 候補ドラフトは **次世代ゲーム (v004) 起票時に再度参照する設計欄 reservation**。v003 内で本 prompt 様式を遡及適用しても、v003 が既に Stage 4 subjective を完全外部委託している (= Nao_u/Mir/Ash 実機判定待ち) ため adversarial reframe ゲートを mount する layer が物理的に存在しない。v004 で **Log が subjective レーンに自ら入る** 設計判断と同時に本節を mount する。

**次サイクル C318 以降の継続候補**:
- (1) v004 起票時の hypotheses.md フォーマットに「反証モード prompt 様式」を default 化 (Stage 1 は証明モード許容、Stage 3-4 は反証モード強制)
- (2) 本ドラフトの要素 1-3 を game_lessons_log.md R-J 候補 (= 「自己判定 Stage と校正期待値の関係表」) に昇格する条件 = arxiv 2602.06948 以外の独立 source (Tetlock Superforecasting calibration training 等) との独立到達 1 件以上 (projects 側 1952 行 候補 3 と同期)
- (3) Calibration Harness probe-a/b/c を v004 subjective レーンで AND 化運用した時の `confidence_to_5/5` 累積分布が **v003 objective レーン累積 (現状 2 件 = 40+25)** より上振れする傾向が観測されたら、本ドラフトの要素 3 cooling-off period の追加緩和策を発動 (= harness 自体の歪み兆候として読む)

---
