# graze_log v05.2_cdx_v83 design_log

## v83 追記: input trace comparator

### 対象 directive と原文

対象は `game/graze_log_cdx/CONTINUOUS_DIRECTIVE.md` の `status: active`。

Nao_u の継続指示:

> `v05_1_cdx_v03` 以降、このゲームが完成するか Nao_u が止めるまでは、定時サイクルで繰り返し改善を続ける。
> 2026-05-22 の直接指示として、別指示があるまではゲーム制作そのものよりも、AI がゲームを作る際の headless のあり方について検討と実地検証を重ねる。headless 測定に必要であればゲームを改変してよいが、主眼は自動実行で何をどう振るのが良さそうかの検証。

### 実装前判断

v82 は `j4/lag4` が同じ seed で落ち、`j6/lag6` が通る非単調 cell を packet 化した。ただし原因は「入力履歴差分または死亡直前操作 trace を比較する」として未分解だった。今回は gameplay、敵配置、報酬、既定 bot を変えず、評価用 telemetry だけを増やす。使う知見は `memory/game_headless_action_eval_playbook_20260523.md` の policy split、`memory/game_headless_eval_causality_lesson_20260523.md` の「原因を決める前に policy 比較」、および v82 の次課題。

### 設計サイクル 1

良いところ 30件: gameplay固定; v82の未解決点に直結; seed単位; j4 failure維持; j6 clear維持; baseline維持; 入力列保存; target保存; jitter保存; lag source保存; Active DEF保存; BOMB保存; gauge保存; shield保存; nearest保存; route intent保存; phase保存; wave保存; raw JSONL保存; packet維持; screenshot契約; DOM契約; Chrome確認; VM確認; bad-policy平均に逃げない; 合否より差分; 人間確認前処理; 次回原因分析へ接続; playable index維持; 既存UI非破壊。

悪いところ 30件: 面白さ判定ではない; 人間入力ではない; route bot固有; seed 2個中心; visual意味解析なし; rawが大きい; packetは代表frame; j6が人間耐性を意味しない; j4 failure原因の断定はまだ危険; Active DEF判断の善悪は別問題; BOMB判断の善悪は別問題; 画面外の文脈はログ依存; target差分は解釈が必要; 入力列だけで感触は分からない; mobile未確認; all regression未実行; Chrome依存; VM環境依存; trace量が増える; review_packetは補助のまま; completion判定ではない; 既存v82 rawと別ファイルになる; seed探索は未拡張; bad policy今回は走らせない; j12 stressは外す; 評価器過信リスク; route target clampの意味説明が必要; death前だけでは前半差を落とす; 画面スクショは同一; Nao_u実評価待ち。

改善案 30件: botTrace追加; 5 frame cadence; action時即保存; target type保存; final target保存; pre-lag target保存; lag source保存; jitter delta保存; key state保存; nearest保存; shield保存; gauge保存; graze保存; death前180 frame抽出; j4/j6同時刻window比較; key divergence assertion; target delta assertion; baseline clear assertion; j4 failure assertion; j6 clear assertion; DOM packet assertion; screenshot assertion; raw JSONL append; README更新; devlog更新; directive更新; staging更新; commit; push; 次回focus明記。

筋の良い案: `botTrace` を gameplay に影響しない telemetry として入れ、j4 failure seed と j6 clear seed の死亡直前 window を同じ時刻で比較する。解決できる問題は、非単調結果を「評価器の不安定さ」だけで終わらせず、実際の入力分岐として説明できること。懸念は、まだその入力分岐がなぜ起きたかの因果分解までは完了しないこと。

### 設計サイクル 2

良いところ 30件: v82派生で差分明確; version表示更新; raw分離; actionTrace取得; deathContext連携; routeCoverage維持; seed12345比較; seed77777比較; finalTargetDelta計測; keyDivergence計測; `j4`の右下固着を見られる; `j6`の別位置維持を見られる; shield差が見える; BOMB差が見える; Active DEF回数差が見える; pressure差が見える; routeIntent差が見える; targetType差が見える; lagApplied確認; lagSourceT確認; jitter符号確認; packet URL維持; `.tmp` screenshot残る; raw memoryに追記; headless pass/fail明確; future work明確; game改変最小; continuous directiveに沿う; 新規説明UI不要; playable性維持。

悪いところ 30件: v83のreview_packetはまだframe中心; botTraceはブラウザ画面に直接表示しない; JSONLを読まないと深掘りできない; j4/j6以外は未比較; camper等は今回除外; `route` policyの癖が強い; targetが画面外clampされる場面の説明が必要; finalTargetDeltaだけでは足りない; keyDivergenceは粗い; shield差の発生源は未確定; BOMBタイミング差は未確定; Active DEFタイミング差は未確定; replay packetは長い; stdoutが大きい; raw保存が増える; v82 check再実行は未実施; manual browser目視は未実施; mobile未実施; game design自体は進まない; completion条件は未到達; bad-policy failure維持を今回直接assertしない; j12境界は今回扱わない; `nearestThreatDistance`呼び出しコスト増; telemetry名が英語; seed数不足; frame窓幅180は経験値; 5 frame cadenceは経験値; UI文言が少ない; screenshotは意味保証でない; Nao_u判断待ち。

改善案 30件: pairSummaries出力; j4NearDeathTail出力; j6SameTimeTail出力; eventTail出力; actionTrace出力; traceCount assertion; route clear assertion; failure retained assertion; DOM contract; screenshot contract; input trace title; review packet attribute; READMEに解釈を書く; devlogに結果を書く; directive last_result更新; staging記録; raw JSONL保存; source path更新; methodVersion固定; seed固定; variants固定; future nextを因果分解に絞る; gameplay変えない; route bot以外を次回候補へ; finalTargetDelta threshold; key sequence比較; Active DEF/BOMB差を読む; shieldStock差を読む; targetType差を読む; run command明示; commit/push。

筋の良い案: headless check の合否を「j4が落ち、j6が通る」だけでなく「入力列とtargetが実際に分岐する」に置く。これで平均点ではなく、再現可能な行動差を evidence にできる。懸念は、この時点ではまだ「j6の方が良い人間モデル」とは言えないこと。

### 設計サイクル 3

良いところ 30件: continuous directiveに合致; headlessのあり方検証; playable diffあり; focused evaluationあり; design_logあり; devlogあり; READMEあり; raw evidenceあり; screenshotあり; DOMあり; seed-level比較; baselineあり; anomalyあり; assertedあり; route coverageあり; death contextあり; shield contextあり; bomb contextあり; activeDef contextあり; route intent contextあり; target contextあり; input contextあり; jitter contextあり; lag contextあり; non-monotonicを保持; gameplay非変更; future causalityへ渡せる; Nao_u確認用pathあり; commit単位明確; push可能。

悪いところ 30件: 長期的には人間レビューが必要; packet単体ではtrace表が見えない; traceの読み方が専門的; j4の失敗を仕様改善に結びつけるには不足; j6の成功を採用するには不足; 複数policy同時比較は次回; visual stable frame探索は使っていない; cue family比較は使っていない; human packet高度化は未実施; stage改善は未実施; BOMB体験改善は未実施; Active DEF体験改善は未実施; enemy wave改善は未実施; route targetアルゴリズムの修正は未実施; input lagモデルは固定; jitterモデルは固定; seed追加なし; threshold暫定; rawが重い; stdoutが重い; review_packetの本文更新は最低限; source noteが英語混じり; all checks未実行; ブラウザ手動未実行; モバイル未実行; 完成判定ではない; Slack返信なし; Nao_uの新規原文なし; 次回も継続が必要; 深追い停止判断ではない。

改善案 30件: trace表をpacketに表示; pair rawをHTMLに埋める; j4/j6入力差のheatmap; target軌跡を描画; shieldHit前後比較; Active DEF前後比較; BOMB前後比較; policy追加; seed追加; j12比較復帰; camper bad-policy併走; novice併走; panic併走; visual stable frame連携; cue review連携; stdout縮小; raw path index化; finalTargetDelta分布; keyDivergence分類; cause hypothesis欄; route target修正案; lagモデル比較; jitterモデル比較; human-review checklist; manual frame URL; all regression smoke; screenshot diff; README trace読み方; directive focus更新; next version v84計画。

筋の良い案: v83は原因修正へ飛ばず、差分観測器を作って止める。解決できる問題は、headlessが偶然の合否を出した時に「どの入力が分岐したか」を残せること。懸念は、観測器だけではゲームの完成度は上がらないため、次回以降にこの evidence を使って評価器設計またはgameplay改善へ戻す必要があること。

### 採用案

`v05_1_cdx_v83` は v82 から派生し、`index.html` に `botTrace` telemetry を追加する。`tools/headless_graze_log_cdx_v05_2_v83_input_trace_check.js` は seeds `12345 / 77777`、variants `baseline / j4_lag4 / j6_lag6` を route policy で実行し、baseline clear、j4 failure、j6 clear、入力分岐、target分岐、packet DOM、screenshotを assert する。

### 懸念

v83 は人間の「楽しい」を判定しない。j4 failure と j6 clear の差分は、入力履歴と target の分岐として保存できたが、その分岐が bot policy の欠陥なのか、gameplay の危険点なのか、perturbation設計の不自然さなのかは次回以降の比較対象。

### 検証方法

```powershell
node tools\headless_graze_log_cdx_v05_2_v83_input_trace_check.js
```

結果: pass。baseline route は seeds `12345 / 77777` の両方で clear。`j4/lag4` は両 seed で failure。`j6/lag6` は両 seed で clear。`keyDivergence` は両 seed で true、`finalTargetDelta` は seed `12345` が `302`、seed `77777` が `43`。packet DOM contract と screenshot contract も pass。raw evidence は `memory/raw/headless_eval/graze_log_cdx_bot_perturbation_input_trace.jsonl` に追記した。
