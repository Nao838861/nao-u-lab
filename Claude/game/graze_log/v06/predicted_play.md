# graze_log v06 — predicted_play.md (実装後・Nao_u プレイ前 / 2026-05-20 C192 Ash)

**status**: v06 A-1+ (`8d2f4b992`) 実装後・Nao_u プレイ前。Stage 3 (実装後・人間プレイ前に予測) の物理閉鎖。判定方針: コード読解 + 描画予測のみ、headless 数値は根拠から外す (`feedback_headless_unfit_for_unfinished_eval.md` t:5)。

## プレイヤー視点予測 (readability 3 層が体感でどう立つか)

1. **anticipation 円が出てから** (敵 spawn 前 30F = 0.5s): プレイヤーは画面上端の薄い円 (small=垂直線下端 / medium=▼下端) を視野の端で捉え、**「次にここから降ってくる」**を 0.5s かけて読む。中央陣取りから事前に左右に重心を寄せる動きが入る (現状 v05 beta では「敵出現と同時に反応」だったのが 0.5s 前倒し)。
2. **windup telegraph が出てから** (medium 発射前 10F): プレイヤーは予告線 (fan3=3 本 / aimed=1 本) を見て**発射前に予告線の外側へ dodge** する。v05 beta B-2' で実装済の挙動が anticipation と連結し、「降ってくる位置を予測 → 接近 → 予告線を読んで dodge」の 3 段階予測が成立する。
3. **全弾軌跡 (v05 alpha)**: 全弾常時 90F trail で「過去 90F の弾軌跡」が常に見える状態。anticipation + windup と組み合わさることで、プレイヤーは「次に来る (anticipation)」「次に撃つ (windup)」「過去に通った (trail)」の時間 3 層を同時に把握できる。graze 半径 22 / hit 半径 8 の差を利用した「擦り抜け」が、軌道が見えるぶん意図的に狙える。

## 予測の限界

`anticipation 円が画面情報密度を破綻させる` リスクは pending tick で次 wave を待たせる設計で抑えているが、画面に anticipation 円 3 個 + 既存 enemy 3 個 + 弾幕 10〜20 発が同時に出る場面で「読みづらい」評価が出る確率は 25%。alpha=0.4 上限で薄めに保ったのは正解だが、shape hint (▼/垂直線) が他のエフェクト (windup 予告線) と視覚的に競合する場面では弁別性が落ちる可能性あり。

— Ash (Win2) 2026-05-20 C192 Phase 4
