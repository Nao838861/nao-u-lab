# graze_log v05.2_cdx_v22 design_log

## 入力

pending directive 原文:

> Log_cdx 、細かいUIの足し引きだけで1日が終わったように見える。
> もっと本質的なゲームの改善でできることはないのか？もうそんな細かいレベルを触るくらいしかないくらいにゲームは完成してる？

継続 directive 原文:

> `v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めろと言うまでは、定時サイクルで繰り返し改善を続ける。

## 実装前判断

完成とは判断しない。v21 の二重 ring は cue の局所調整で、ゲーム全体の目的・評価・リプレイ価値には踏み込んでいない。今回の本質改善は、敵を増やすことではなく「ステージの各場面で何を上手くやったのか」をゲーム側が評価し、プレイヤーに次の改善目標を返すことに置く。

採用する過去知見:

- `Playable / Headless 評価`: clear だけでなく、新システムが通しプレイで発火するかを検査する。
- `Balance / Rule Space`: 敵配置・BOMB量・DEF cue を同時に動かさず、評価ルールだけを追加する。
- `Feedback / Rights / Human Judgment`: 人間の指摘を「UIの好み」ではなく、ゲームの評価軸が薄いという設計問題として扱う。

## 設計サイクル 1

良いところ / 悪いところ 30件:

1. v21 は clear できる。2. v21 は final BOMB がある。3. v21 は Active DEF が使える。4. v21 は stage intent を既に持つ。5. intent がスコアに接続していない。6. プレイヤーは「良いプレイ」を後から判断しにくい。7. 敵追加は評価軸を混ぜる。8. BOMB 調整も評価軸を混ぜる。9. route 評価なら既存 stage grammar を使える。10. フェーズ単位なら実装範囲が狭い。11. 成功/失敗が見えるとリプレイ理由になる。12. 失敗が厳しすぎると窮屈になる。13. BOSS にBOMB上限と被弾上限を入れると雑な突破を避けられる。14. RESTOCK にBOMB禁止を入れると貯める意味が出る。15. READ にgraze/killsを入れると見て避ける場面になる。16. chain bonus は通しの緊張を作る。17. contractScore は既存 score に足せる。18. HUD に増やしすぎるとまたUI問題になる。19. クリア画面に grade を出せば結果が残る。20. bot で発火確認できる。21. 人間の納得は別評価が必要。22. v21 のring評価は維持する。23. BOMB経済は維持する。24. 敵配置は維持する。25. titleは更新する。26. README更新が必要。27. devlog更新が必要。28. headless更新が必要。29. pendingをhandledにする必要がある。30. stagingに残す必要がある。

改善案 30件:

1. route contract を追加する。2. phaseStats を追加する。3. graze を記録する。4. kills を記録する。5. bombs を記録する。6. defs を記録する。7. hits を記録する。8. event 切り替わりで評価する。9. clear/gameover時にも評価する。10. READ は graze 1 / kills 1。11. RESTOCK は kills 1 / bomb 0。12. BOSSLET は graze 1 / kills 1 / bomb 1。13. MIDBOSS は graze 1 / kills 1 / bomb 1。14. BOSS は kills 1 / bomb 1 / hit 1。15. 成功で bonus。16. 成功で chain。17. 失敗で break。18. contractLog を残す。19. routeGrade を出す。20. HUD に ROUTE を出す。21. end screen に grade を出す。22. headlessで成功probe。23. headlessで失敗probe。24. simpleBotでcontractScoreを見る。25. 敵配置は触らない。26. BOMB量は触らない。27. DEF ringは触らない。28. v22 pathにする。29. 継続directiveを更新する。30. commit/pushする。

筋の良い案:

- 既存の `WAVE_INTENTS` を実プレイ評価へ接続する route contract を追加する。

新しく生じる懸念:

- contract が「後付けの採点」に留まり、プレイ中の意思決定を変えない可能性がある。次回は人間プレイまたはfocused replayで、BOMBを温存する/DEFを狙う判断が増えたかを見る。

## 設計サイクル 2

良いところ / 悪いところ 30件:

1. contract はステージ構造を壊さない。2. intent を活用する。3. 既存の popup とHUDで表示できる。4. 評価条件が明示される。5. 隠しすぎると読めない。6. 出しすぎるとUIになる。7. `ROUTE +` は短い。8. `ROUTE -` は短い。9. chain は通しの圧になる。10. break は反省点になる。11. BOSS のBOMB上限は資源判断を残す。12. RESTOCK の bombMax 0 は節約を促す。13. READ の kill条件は撃つ理由になる。14. graze条件は近づく理由になる。15. hit 上限は基礎精度を求める。16. bot は完全評価ではない。17. headless は新機能の発火には有効。18. grade は end screen に残る。19. scoreだけより改善目標が見える。20. contract target は後から調整可能。21. 敵配置を触らないので比較しやすい。22. BOMB調整を混ぜないので原因が明確。23. v21への戻しも容易。24. UI文言は短く保つ。25. title説明は最小限。26. design_logに原文を残す。27. devlogに戻し方を書く。28. stagingに結果を書く。29. pendingを閉じる。30. まだ完成とは言わない。

採用案:

- `phaseContractTarget()` と `finishPhaseContract()` を追加し、イベント境界で評価する。

採用しない案:

- 新しい敵・ボス形態の追加: 本質改善に見えるが、今回の指摘に対しては「評価軸が薄い」問題を先に直す方が筋が良い。
- BOMB の数値再調整: v21 の検証済み挙動を壊しやすい。
- 大きなチュートリアル追加: UI説明の足し引きに戻るため不採用。

## 設計サイクル 3

良いところ / 悪いところ 30件:

1. v22 は playable diff である。2. 評価ルールが増えた。3. 敵配置は保った。4. BOMB経済は保った。5. DEF ringは保った。6. final cueは保った。7. clear botで検証できる。8. contract probeで成功/失敗を検証できる。9. human feel は未検証。10. grade の妥当性は未検証。11. READ条件は緩い可能性がある。12. BOSS条件は厳しい可能性がある。13. chain bonus は強すぎる可能性がある。14. routeScore が通常scoreに埋もれる可能性がある。15. HUD行は増える。16. ただし説明文は増やしていない。17. popupは短い。18. contractLogはheadlessで見られる。19. per-wave score0 は今は未使用。20. 今後の評価拡張に使える。21. completed扱いはしない。22. 継続directiveはactive。23. pending directiveはこのdiffでhandledにする。24. stagingに残す。25. commitする。26. pushする。27. v18削除差分は無関係。28. memory大量差分は混ぜない。29. lock fileは混ぜない。30. 次回は人間プレイでcontractの納得性を見る。

## 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v22_check.js
```

期待:

- clear-capable bot が clear する。
- boss final cue と final BOMB 使用を維持する。
- Active DEF 使用を維持する。
- route contract の成功 / 失敗 probe が通る。
- simpleBot の通しプレイで `contractScore > 0` になる。
