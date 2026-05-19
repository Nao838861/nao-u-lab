# graze_log v06 — self_judgment.md (実装後・Nao_u プレイ前 / 2026-05-20 C192 Ash)

**status**: v06 A-1+ (`8d2f4b992`) 実装後・Nao_u プレイ前。Stage 4 (AI 自プレイで「良い」と確信) の代替実装。判定方針: コード読解 + 描画予測 + readability 3 層 構造判定のみ、headless 数値 (到達率/生存秒/成功率) は根拠から外す (`feedback_headless_unfit_for_unfinished_eval.md` t:5)。

## 結論: v06 は v05 beta より良いか — **Yes (構造判定)**

1. **readability 3 層が用語的に揃った**: v05 beta は windup (発射前 10F) + 全弾軌跡 (常時 90F trail) の 2 層で「弾の時間」しか telegraph しなかった。v06 で anticipation 層 (spawn 前 30F) が埋まり、「敵の時間」が初めて telegraph される。3 層は時間軸 (過去 trail → 未来 windup → 更に未来 anticipation) と方向性 (line / 円+垂直線 or ▼) で**用語が一貫**する。「弾が来る → 弾が動く」の 2 ステップから「敵が来る → 弾が来る → 弾が動く」の 3 ステップへ readability 連鎖が完成する構造変化。
2. **削除可能改良 1 個刻みの純度を保っている**: 差分 34 行 (functional ~25 + comment ~9)、6 箇所削除で v05 beta 同一バイト列に戻る (README §戻し方)。`emitEnemy()` 新設で spawn 経路を queue 経由に集約しただけで、既存機構 (graze 半径 / hit 半径 / BOMB / Psyvariar active 防御 / Lv 進行 / 弾パターン rhyme / seed 再現性) は完全同一。守の段階整合性は保たれている。
3. **A-1+ shape polish が anticipation 層に方向性語彙を獲得させた**: 円のみだった A-1 では「ここに何かある」しか telegraph できなかった。A-1+ で small=垂直線下端 / medium=▼下端を追加し、anticipation 層が windup (発射方向線) / trail (弾軌跡 line) と同じ「方向性 telegraph」の語彙を獲得。3 層が用語だけでなく**視覚的にも一貫**する。

## 「良い」と確信できない条件 (Nao_u 評価で覆る可能性)

- **画面情報密度の破綻リスク 25%** (predicted_play.md §予測の限界): anticipation 円 + windup 予告線 + 弾幕 + trail が同時に画面に出る場面で「ごちゃごちゃして読めない」評価が出る確率。pending tick で次 wave を待たせる設計と alpha=0.4 上限で抑えているが、Nao_u 体感で「逆に読みづらくなった」判定なら v07 で anticipation alpha 削減 or wave 間隔調整。
- **anticipation 0.5s が「待たされる」と感じるリスク**: pending tick で wave 間隔が 0.5s 延びる (1 wave 周期 2.5s → 3.0s)。テンポを重視するプレイスタイルでは「もたつく」評価が出る可能性。Nao_u が STG 上級者として「もっと速く来い」と感じるなら anticipation 短縮 (30F → 20F or 15F)。

## 出荷判断: 出すべき

graze_log v04 (α'') 退役後の v05 alpha (`34814472e`) → v05 beta B-1 (`536caaa75`) → B-2 (`fcd6cc818`) → B-2' (`90adecd15`) と進めてきた readability 軸の最後の 1 機構。Nao_u 評価未受領のまま v07 (経路B B-2 / agency 強化 A-3) に進むのは「core が fun と確定していない段階で大きな変更を入れる」業界基準逸脱 (devlog §2 参照)。v06 で readability 連鎖完成を Nao_u に体感確認してから次の axis に進むのが正しい順序。

— Ash (Win2) 2026-05-20 C192 Phase 4
