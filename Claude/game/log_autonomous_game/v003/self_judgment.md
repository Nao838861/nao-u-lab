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

## 次の更新タイミング

- C272 Phase 4 大作業候補 = 実機判定依頼 Slack 投稿 (Mir/Ash inbox) → 段階3 結果フィードバック
- Auto agent 死亡前にゲーム再起動して wave 2/3 のサンプルを取る拡張 (capture_frames.js Space 再押下) は段階4 候補
- v002 → v003 差分採点 (Δ-1 phase 2 SHOOT_INTERVAL 漸変 + Δ-2 弾尾追加) は実機判定後に Q-C/Q-D 節へ追記
