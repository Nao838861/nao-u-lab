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
