# 性能・ヘッドレス・疎描画 STEPBOOK

対象はプレイテスト申し送り L / M / N。近似や検証省略で速くするのではなく、観測契約を保ったまま重複計算・全走査・無差別な DOM 更新を減らす。

## 守る契約

- 同じ seed と入力 journal から得る生 snapshot、全イベント列、tutorial director 状態を完全一致させる。
- 保存則・物理不変条件・長期較正を変えない。経済定数は触らない。
- テストの観測内容を削らない。長い検証を軽い検証に置き換えず、同じ実行結果の再利用と不要観測の削減で速くする。
- UI はモデルが変化した部品だけ更新し、フォーカス、押下、ホバー、スクロールを DOM 再生成で奪わない。
- 測定はウォームアップと複数回を含み、before / after を同じ条件で比較する。

## 着手前の基準値（2026-07-23）

- engine 生実行、seed 11 の見本都市、3600 tick: 389.55 / 248.53 / 226.90 / 371.54 / 240.20 ms、中央値 **248.53 ms**。
- UI 相当の「3 tick ごとに full snapshot と差分 events」を3600 tick: 19968.97 / 16726.14 / 15609.25 ms、中央値 **16726.14 ms**。
- 36000 tick、イベント捕捉あり: 5482 / 6659 / 7635 ms。なし: 5031 / 4911 / 5263 ms。イベント追跡だけでも約2〜3割を占める。
- 実 Chrome 速度3、3秒: advance 30回、90 tick、snapshot 30回、view model 30回、events 30回、display batch 30回、renderHud 呼出相当 32回。
- `npm run test:unit`: **450.57秒**で段20〜21の seed 14 較正に失敗。これは変更前 master の基準値として扱い、今回の変更起因と混同しない。

---

## 設計サイクル1 — 測る場所と同値性の境界

### 30の観察

1. [良] engine は controller と公開 API で分離され、測定境界が明瞭。
2. [良] `captureEventStream` でイベント不要時の経路を既に選べる。
3. [良] snapshot は JSON 化可能な値だけで構成され、完全一致比較が可能。
4. [良] journal replay が入力同値性の正本になっている。
5. [良] tutorial director は観測専用で world を変更しない。
6. [良] display batch は速度3の描画回数を既に3分の1へ減らしている。
7. [良] `uiMetrics` が controller と表示の呼出数を観測できる。
8. [良] focused test の名前指定と依存展開がある。
9. [良] seed が固定され、before / after を比較できる。
10. [良] 保存則と8年監査は今回の契約境界として再利用できる。
11. [悪] UI 相当経路は engine 生実行の約67倍かかり、snapshot / event 観測が支配的。
12. [悪] `events(afterSequence)` が全履歴を毎回 `filter` し、履歴が伸びるほど高価。
13. [悪] event tracker の Map と価格件数 object を毎 tick 作り直す。
14. [悪] snapshot は毎回 world state 全体を deep clone する。
15. [悪] controller は表示に不要な全 state も snapshot として取得する。
16. [悪] view model は snapshot の大部分を別の配列・objectへ写し直す。
17. [悪] UI とテストのどこで時間を使ったか標準出力から分からない。
18. [悪] unit 全体は7分半かけた後半で初めて較正失敗を報告する。
19. [悪] 長い章通しの結果が近接する検証間で十分共有されていない。
20. [悪] 観測不要な純 engine 試験でもイベント列を蓄積する箇所がある。
21. [悪] `domUpdates` は render pass 数で、実 DOM write 数ではない。
22. [悪] render 呼出と実際に変わった部品を区別できない。
23. [悪] Chrome 実測が tick 数だけで、入力保持の品質を数値化していない。
24. [悪] full test の基準値が成功時間でなく既存失敗時間しかない。
25. [悪] benchmark 条件が通常テスト内に固定されておらず再現が手作業。
26. [悪] deep clone 高速化は値の不変性を壊す危険がある。
27. [悪] event 省略は tutorial 発火 tick を変える危険がある。
28. [悪] 章通しの共有は試験間の独立性を壊す危険がある。
29. [悪] DOM 更新の抑制は古い表示を残す危険がある。
30. [悪] マイクロベンチだけ改善して実 Chrome が変わらない可能性がある。

### 30の改善案

1. engine 生、API 観測込み、実 Chrome、test runner の4層を別々に測る。
2. 同じ seed・tick・入力で各測定を3回以上行い中央値を記録する。
3. `events` は連続 sequence を利用して先頭 index を算出し、末尾だけ clone する。
4. sequence の連続性が崩れた場合だけ二分探索へフォールバックする。
5. event tracker の Map は差分更新し、毎 tick の全面再構築を避ける。
6. 価格列の前回件数は object 再生成でなく保持 Map を更新する。
7. active haul / call の追跡は同じ ID の object を再利用しないが、索引だけ再利用する。
8. snapshot の公開不変性は維持し、clone 自体を省く案は採らない。
9. controller の snapshot 頻度は tutorial 中1 tick、自由時3 tickの契約を維持する。
10. snapshot 内容の部分 API 化は今回の互換範囲から外し、次の明示判断に残す。
11. test runner に各試験の経過秒と遅い試験一覧を表示する。
12. 長いシード通しは一度得た immutable result を同一プロセス内で再利用する。
13. 再利用 result を後続試験が変更できない形にする。
14. イベントを検証しない試験だけ `captureEventStream:false` を明示する。
15. 省略対象ごとに「何を検証しない試験か」をコメントで残す。
16. journal / event 検証試験ではイベント捕捉を絶対に切らない。
17. `uiMetrics` を render pass / DOM write / component render / skip に分ける。
18. render cache は selector 個別でなく意味のある component 単位にする。
19. HUD の text 書換えは値が異なる時だけ行う。
20. list 再構築は表示に使う小さな signature が変わった時だけ行う。
21. signature は巨大 snapshot 全体の stringify を避ける。
22. 入力 draft は model から分離し、適用まで DOM と state に保持する。
23. scrollable list は更新前後の scrollTop を保持する。
24. pointer guard は安全網に留め、主手段を変更検知にする。
25. Chrome で入力中に速度3を流し、value / focus / click journal を確認する。
26. component ごとの mutation 数を before / after で採る。
27. benchmark script は製品コードを変えず再実行できる形にする。
28. full 失敗はまず focused で再現し、性能変更と既存較正を分ける。
29. engine 変更時は snapshot / events / journal の二重実行比較を追加する。
30. 最終判断は tick 時間だけでなく、操作取りこぼしゼロとの両立で行う。

### 強い解決案と代償

公開値を近似したり観測を間引いたりせず、**イベント履歴の全走査を正確な cursor 参照へ置換し、tracker の一時 object を減らす**。テストは結果共有・イベント不要経路・所要時間表示で速くする。UI は component signature と条件付き DOM write を共通化する。snapshot の部分化は最大の余地だが API 契約と不変性を大きく変えるため、このバッチでは行わない。これにより最大理論値より安全性を優先する代償はあるが、自然な設計の範囲を守れる。

---

## 設計サイクル2 — engine と headless の正確な高速化

### 30の観察

1. [良] event sequence は生成時に単調増加する。
2. [良] stream は途中削除されず、sequence と配列位置の関係を保ちやすい。
3. [良] `events(0)` と cursor 差分を連結する同値試験を作れる。
4. [良] tracker は観測イベント生成専用で、world の計算を変えない。
5. [良] `captureEventStream:false` は明示的 opt-out で既存 API を壊さない。
6. [良] テスト名が章段に対応し、遅い区間を人が認識しやすい。
7. [良] 章依存を自動展開するため focused でも前提を壊しにくい。
8. [良] replay test が速度変更と UI 表示から独立している。
9. [良] 較正値は複数 seed で、偶然の高速化を見抜ける。
10. [良] Node の `performance.now()` だけで外部依存なく計測できる。
11. [悪] stream の先頭 sequence が常に1とは API 文書化されていない。
12. [悪] sequence から直接 index を引く実装は将来の切詰めに弱い。
13. [悪] `jsonClone` は events の小差分にも stringify / parse を行う。
14. [悪] event payload の参照返却は利用側から内部を書き換えられる。
15. [悪] Map の in-place 更新は削除漏れで偽イベントを生む危険がある。
16. [悪] households / prices / active jobs は件数が動的である。
17. [悪] price history は goods ごとの配列長を毎 tick 全走査する。
18. [悪] test runner の単純な並列化は共有 fixture と順序依存を壊す。
19. [悪] tutorial 通しは director の issuedTick まで厳密で観測頻度を落とせない。
20. [悪] seed 共有は failure path と natural path を混ぜる恐れがある。
21. [悪] full test の失敗点が後半だと改善の before 成功値が取れない。
22. [悪] wall time は別プロセス負荷の影響を受ける。
23. [悪] 長期監査と tutorial 試験の目的が異なるのに一括実行される。
24. [悪] テスト省略オプションが常用されると coverage が不透明になる。
25. [悪] 進捗表示を増やしすぎると CI log が読みにくい。
26. [悪] timer 自体を hot loop に入れると測定が処理を遅くする。
27. [悪] fixture cache key が不足すると別条件の結果を誤再利用する。
28. [悪] clone 削減と cache 導入を同時に行うと原因の切分けが難しい。
29. [悪] engine 最適化で event 順が1件でも変わると全章へ波及する。
30. [悪] ベンチ改善率だけでは読みやすさ低下を正当化できない。

### 30の改善案

1. event cursor はまず `sequence <= afterSequence` の境界を二分探索する。
2. 末尾 cursor が典型なので、最後の sequence との早期判定を入れる。
3. `afterSequence <= 0` は全件 clone の既存挙動を保つ。
4. cursor が最終 sequence 以上なら clone せず空配列を返す。
5. sequence 欠番を許す二分探索にして将来の stream 切詰めへ備える。
6. event payload は差分部分だけ従来どおり deep clone する。
7. tracker 更新は新 Map を作りつつ必要 payload 配列を作らない形から始める。
8. 複雑な in-place tracker は profiler で必要性を確認してから採用する。
9. 価格は previousCount より後を index loop し、`slice` allocation を消す。
10. `Object.fromEntries` を Map のまま保持する。
11. active jobs の前回 Map は ID と観測に必要な最小値だけ持つ。
12. 同値 harness で変更前 API と変更後 API の結果を seed 11/13/14 比較する。
13. snapshot は終了時だけでなく区切りごとにも比較する。
14. 全 events は JSON 文字列比較で順序と値を同時に監査する。
15. journal replay の最終 snapshot も比較する。
16. test timer は各 test wrapper の外周だけで測る。
17. 1秒以上の test だけ slow list に出す。
18. 進捗は開始時の `[実行]` と終了時の秒数に限定する。
19. fixture cache は seed・mode・終点・event 捕捉の複合 key にする。
20. cache result は `structuredClone` 相当で渡すか、読み取り専用利用に限定する。
21. 同一の natural tutorial run だけ共有し、failure path は独立実行する。
22. 既にある章通し result を後続の数値 assertion に利用する。
23. イベント不要の物理試験は作成時点から捕捉を切る。
24. test CLI に `--timings` を既定有効で追加する。
25. focused / full / audit の実行コマンドと用途を TESTING_POLICY に書く。
26. before の seed14失敗を regression として focused で先に確定する。
27. 性能変更後も同じ seed14 failure なら別課題として明記する。
28. failure が消えた場合は挙動変化を疑い、snapshot/event diff を優先する。
29. 最適化 commit は engine と UI 疎更新を可能な限り分離する。
30. 可読性を損なう branchless 化や型の詰込みは採用しない。

### 強い解決案と代償

`events(afterSequence)` を**欠番にも耐える二分探索 + 末尾早期 return**にし、価格 event 検出の `slice` と毎 tick の件数 object を除く。test runner は外周計時と immutable fixture 再利用を導入する。全 test の並列化は速いが、章依存と共有状態による再現性低下が大きいため採らない。snapshot の clone は依然支配的だが、公開不変性を守る代償として残す。

---

## 設計サイクル3 — 疎描画と操作の信用

### 30の観察

1. [良] UI の表示源は単一 view model に集約されている。
2. [良] 各 sheet は関数境界があり component 化しやすい。
3. [良] 会社 sheet には入力保護の先行実装がある。
4. [良] 表示 batch と engine clock は分離されている。
5. [良] sheet open 状態と selected building は UI state にある。
6. [良] event list はイベント到着時だけ更新する経路がある。
7. [良] 実 Chrome smoke が PC / mobile の両方にある。
8. [良] journal でクリックによる公開操作を確認できる。
9. [良] DOM selector は固有 ID が多く個別更新しやすい。
10. [良] CSS で未反映・focus を明示できる。
11. [悪] `renderHud` は同じ値でも全 textContent を毎 batch 書く。
12. [悪] build dock は毎 batch `replaceChildren` する。
13. [悪] company sheet の大部分は innerHTML 全置換。
14. [悪] building sheet は選択が同じでも innerHTML 全置換。
15. [悪] island market と finance は別の変化周期なのに一括更新される。
16. [悪] manifest は毎 batch replaceChildren され scroll が飛びうる。
17. [悪] tutorial letter list は開いている間に再構築される。
18. [悪] secretary 文面が同一でも書換えられる。
19. [悪] focus 中だけ守る方式では button の押下や hover が消える。
20. [悪] pointerdown と次の tick の競合は低速端末で再現しやすい。
21. [悪] 全 snapshot stringify は疎描画自体を重くする。
22. [悪] 小さすぎる cache key は表示更新漏れを起こす。
23. [悪] 大きすぎる cache key は比較 allocation を増やす。
24. [悪] innerHTML の条件抑制だけでは変更部分だけ更新にならない。
25. [悪] sheet close/open 時は cache を無効化しないと空表示になりうる。
26. [悪] locale formatting は同じ数値でも毎回文字列を作る。
27. [悪] graph は履歴追加ごとに全 SVG 再生成しやすい。
28. [悪] toast は出入りが多く mutation 観測を汚す。
29. [悪] mobile では sheet と toast の重なりが操作試験を難しくする。
30. [悪] 「一度も取りこぼさない」は自動試験だけで完全証明できない。

### 30の改善案

1. 共通 `renderIfChanged(key, signature, render)` を導入する。
2. 共通 `setTextIfChanged(element, value)` を導入する。
3. 実 write と skip を `uiMetrics` に記録する。
4. cache は start mode 切替、load、sheet close 時に適切に invalidate する。
5. HUD は資金・日付・人口・食料・船・速度を個別 signature にする。
6. build dock は category / tool / affordability / tutorial 推薦だけを key にする。
7. company は支援、注文、在庫、台帳を別 component に分ける。
8. 在庫 input の draft は DOM 値を cache key に含めない。
9. building は基本情報、世帯、棚、加工を別 component に分ける。
10. island は収支、グラフ、相場、現物を別 component に分ける。
11. event list は event sequence の変化時だけ append または再構築する。
12. letter list は letter id / read / priority の列だけ signature にする。
13. secretary は source id と本文の組を signature にする。
14. tutorial objective は goal id / completed / system instruction だけを見る。
15. signature builder は表示文字列と同じ丸め値を使う。
16. 配列は必要フィールドを delimiter 付きで結ぶ軽量 key にする。
17. user text に delimiter がありうる箇所は JSON.stringify する。
18. input focus 中でも model 更新部分は sibling DOM だけ変える。
19. list row は data-key を持ち、将来の keyed patch へ拡張可能にする。
20. 今回は変更頻度の低い list を component 単位で置換し、過剰抽象化を避ける。
21. scroll list 再構築時だけ scrollTop を復元する。
22. button handler は event delegation か再生成時の明示再接続を統一する。
23. Enter / blur の二重適用は dirty flag で1回にする。
24. pointer capture を必要としない通常 click で操作する。
25. Chrome 試験で input focus を2秒保持し value / activeElement を検査する。
26. 各 sheet の button を速度3中に1回ずつ押し journal / open state を確認する。
27. MutationObserver で主要 panel の childList / characterData 件数を測る。
28. toast は通知専用領域へ移し、操作対象との hit-test 重なりを検査する。
29. PC と mobile の双方で viewport screenshot とクリック座標を確認する。
30. 手動確認項目を completion audit に残し、自動試験の限界を明示する。

### 強い解決案と代償

全 UI を仮想 DOM 化せず、既存の素直な DOM 構造に**小さな component signature cache と条件付き text write**を入れる。低頻度 list は component 単位、高頻度 HUD は値単位に分ける。keyed diff の完全実装より導入リスクが小さく、操作中 DOM を守る効果は十分大きい。一方、表示フィールド追加時に signature へ入れ忘れる危険があるため、render関数の直前に key 生成を置き、Chrome smoke と component 更新計数で補う。

---

## 実装 STEPBOOK

- [x] 1. event cursor を二分探索化し、世帯・荷車・港便trackerの毎tick全Map再生成を差分更新へ置換する。
- [x] 2. events cursor完全一致、API journal再生、director非干渉の既存・追加harnessで同値を確認する。
- [x] 3. test runner に試験別時間・slow list・全体時間を表示する。
- [x] 4. 長時間fixture共有は章依存の汚染リスクが高いため採用せず、`--match`時に長期workerを起動しない既存方針を維持する。
- [x] 5. イベント非検証経路では既存の `captureEventStream: false` を使用し、検証を弱める一括置換はしない。
- [x] 6. `renderIfChanged` / `setTextIfChanged` / cache を共通化する。
- [x] 7. HUD・build dock・secretary・tutorial objective を疎更新化する。
- [x] 8. company / building / island / events / letters を部品別疎更新化する。
- [x] 9. 入力 draft、focus、scroll、押下を高速再生中も保持する。
- [x] 10. `uiMetrics` に実 write / render / skip を追加し before / after を採る。
- [x] 11. focused Node と実 Chromeで同値性・操作性を確認する。
- [x] 12. engine/APIを同一プロセスで再測定する。full unitは開始時点で450.57秒かつ既存seed14失敗だったため、ユーザー指定の軽量方針に従い再実行しない。
- [x] 13. 結果・代償・残件を design_log と completion_audit に記録する。

## 未決質問

- `AGENTS.md` が参照する v004 `product_spec.md` は存在しない。今回の要求正本は HANDOFF / PLAYTEST / README / 本書とし、`product_spec.md` を新設するかは勝手に決めず HANDOFF の質問欄へ残す。
