# 描画シーン整理と正直な最適化 — 実装前設計サイクル

日付: 2026-07-24

対象: `v004.13.0-elena-voice`

ユーザー指示:

> 現状でリファクタリングしつつ最適化を進めてほしい。設計を壊すような最適化ではなく、あるべき姿にしたら速くなるタイプの最適化ができないか、整理しながら確認して。

核の楽しさ:

> 本当に動いている島の物流と暮らしを、目で見て確かめながら、自分の手で少しずつ変えていく楽しさ。

## 変更してはいけない契約

- engineの経済規則、tick順、乱数、保存則、物流容量を変えない。
- 一施設最大6品目・一品最大24荷姿、実人数、活動状態、荷車・船・荷役の連続移動を減らさない。
- 画面外の出来事もengineとview modelには存在し続ける。描画対象外にするのは、現在のカメラへ絶対に届かない時だけ。
- 近似値や古いsnapshotを表示して速くしない。
- before / afterを同じ都市、同じ日、同じカメラ、同じフレーム数で測る。

## サイクル1 — 責務の置き場所を正す

| # | 観察 | 改善 |
|---:|---|---|
| 1 | [良] engine、view model、rendererの境界は既に分かれている。 | 境界を保ったままrenderer内のデータ編集だけをview model側へ戻す。 |
| 2 | [良] view modelはsnapshotごとに一度だけ生成される。 | フレーム間で不変な描画資料は生成時に一度だけ作る。 |
| 3 | [良] presentationは補間時も`to`の静的配列を共有する。 | 描画シーンも`to`から共有し、補間ごとに再生成しない。 |
| 4 | [良] 建物のstructure、yardStock、yardSlotsは既に生成時へ移されている。 | 同じ原則を自然物、道路、描画順へ広げる。 |
| 5 | [良] rendererはengine objectを直接読まない。 | 新しい描画シーンも公開view modelの一部に限定する。 |
| 6 | [良] staticとdynamicの区別は概念上明確である。 | `renderScene.staticDrawables`とフレームごとのdynamicを分離する。 |
| 7 | [良] 深度は`x+y`基準で決定的に並べられる。 | 静的物はsnapshot生成時に一度だけ安定sortする。 |
| 8 | [良] 道路は文字列keyを正本として保持している。 | 表示用の`x/y/connected`行を別途コンパイルする。 |
| 9 | [良] trailはview modelで可視段階まで変換済みである。 | 座標parseと道路重複除外も同じ場所で済ませる。 |
| 10 | [良] roadConnectionはview model末尾で一度計算される。 | 接続済み道路と未接続建物を描画シーンへ写す。 |
| 11 | [悪] rendererが毎フレーム`occupiedKeys`をSetへ戻す。 | 自然物抽出時にだけSetを作り、結果配列を保存する。 |
| 12 | [悪] rendererが毎フレーム全地形を走査して自然物を探す。 | `naturalDrawables`をsnapshot生成時に確定する。 |
| 13 | [悪] rendererが毎フレーム建物・在庫・屋台をdrawableへ包み直す。 | static drawableをview model側で構築する。 |
| 14 | [悪] staticとcarrierを毎フレーム一つの配列に積んで全面sortする。 | sort済みstaticと少数dynamicを線形mergeする。 |
| 15 | [悪] `roadKeys.map(parseKey)`が毎フレーム配列と座標を作る。 | `roadRows`を一度だけ作る。 |
| 16 | [悪] roadSetとconnected Setを毎フレーム作る。 | 道路segmentを生成時に列挙し、接続状態を持たせる。 |
| 17 | [悪] trail keyを毎フレームsplitする。 | trail rowへ`x/y`を持たせる。 |
| 18 | [悪] disconnected ID Setを毎フレーム作る。 | 警告対象の建物行を生成時に確定する。 |
| 19 | [悪] market建物を描画中に何度もfindする。 | marketの深度・港参照を静的資料へ含める。 |
| 20 | [悪] 描画専用資料の組立てがrendererへ散らばっている。 | 純粋関数`compileRenderScene`へ集約する。 |
| 21 | [悪] view model本体へ直接さらに処理を積むと肥大化する。 | 新しい`render_scene.js`へ描画資料の責務を分離する。 |
| 22 | [悪] Map/Setをview modelへ公開するとdeepFreezeで不変にできない。 | 公開シーンは配列とplain objectだけで構成する。 |
| 23 | [悪] static drawableが建物を複製するとメモリと不一致が増える。 | building objectは参照し、wrapperだけを一度作る。 |
| 24 | [悪] presentationで建物配列が変わると古いscene参照が残りうる。 | 各snapshot自身のsceneを持ち、補間は`to`のsceneを使う。 |
| 25 | [悪] scene追加で既存利用側がengine内部へ依存する恐れがある。 | 名前を`renderScene`に限定し、rendererと性能試験だけが読む。 |
| 26 | [悪] sceneが巨大だとsnapshot cloneコストを増やす。 | engine snapshotには入れず、view model生成後の派生値に留める。 |
| 27 | [悪] static判定を誤ると在庫更新が止まる。 | 「フレーム間で静的、snapshot間では再構築」と定義する。 |
| 28 | [悪] drawable kindのif連鎖は種類追加時に漏れやすい。 | 今回はdispatchを変えず、データ準備だけを整理する。 |
| 29 | [悪] scene導入と見た目変更を同時に行うと比較できない。 | 色・形・個数・深度式は一切変えない。 |
| 30 | [悪] リファクタだけでは速くなった証拠にならない。 | scene生成回数、静的sort回数、frame時間を測る。 |

筋の良い案:

`compileRenderScene(model)`をview model生成の最後に一度だけ呼び、自然物、建物、実在庫、屋台の静的描画順、道路行・道路segment、trail座標、未接続警告をplain objectの配列へまとめる。rendererはこの資料を読むだけにする。

解決できる問題:

- 全地形走査、文字列split、Set生成、wrapper生成、全面sortを毎フレームから毎snapshotへ下げられる。
- 描画順の責務が明文化され、今後の物体追加先が一か所になる。
- presentation補間中の同じ計算を繰り返さない。

新しい懸念:

- view modelが重くなる。ただし生成は1tickまたは3tickに一回で、描画は最大60回/秒なので総量は減る。
- sceneの更新漏れがありうる。snapshot間で必ず再構築し、在庫変化のfocused testを置く。

## サイクル2 — Canvasへ同じ命令をまとめて渡す

| # | 観察 | 改善 |
|---:|---|---|
| 1 | [良] 地形は同じ菱形の反復である。 | 同色の菱形を一つのCanvas pathへまとめる。 |
| 2 | [良] 地形色はkindとvariantだけで決まる。 | frame内で色ごとの小さなbucketへ分ける。 |
| 3 | [良] 季節washは非水面へ同じ色を重ねる。 | 非水面を一つのpathにして一回fillする。 |
| 4 | [良] 道路は接続済み／未接続の二系統だけである。 | 道面を二つのpathへまとめる。 |
| 5 | [良] 道路segmentも色と太さが二系統である。 | 外線・内線を接続状態ごとに一括strokeする。 |
| 6 | [良] 在庫山は前バッチで一山一pathへ整理済みである。 | その設計を地形と道路にも揃える。 |
| 7 | [良] 水面の波だけはpulseで動く。 | 地形本体と分離し、波だけ個別に更新する。 |
| 8 | [良] 地形の隣接境界線は各菱形subpathで残せる。 | 一path内に各菱形を閉じ、現行strokeを維持する。 |
| 9 | [良] Canvasのfill/strokeは複数subpathを一括処理できる。 | save/restore、beginPath、style設定の回数を大幅に減らす。 |
| 10 | [良] 建物や人物は形状・色が多様である。 | 無理にbatchせず、読みやすい個別描画を残す。 |
| 11 | [悪] 現在は地形一枚につきbaseとwashで二回`diamond`を呼ぶ。 | baseは色bucket、washは一括pathへする。 |
| 12 | [悪] `diamond`は一回ごとに4座標objectとsave/restoreを作る。 | batch helperは一つのcontext状態で全subpathを追加する。 |
| 13 | [悪] 56×56なら最大6,272回の菱形関数呼出になる。 | 見えている範囲だけをbucketへ入れる。 |
| 14 | [悪] 道路一本ごとに二回strokeするsegmentがある。 | segment列を一つのpathへ集約する。 |
| 15 | [悪] pathを一つにしすぎると巨大になりdriver側で遅くなることもある。 | fill/stroke状態ごとの自然なbucketに留める。 |
| 16 | [悪] 色文字列を連結したkeyは毎frame allocationになる。 | terrain palette数が小さいためMapを使い、計測で判断する。 |
| 17 | [悪] `Path2D` cacheはzoom/pan変換との関係が複雑になる。 | 今回は通常pathを使い、ブラウザ互換性を優先する。 |
| 18 | [悪] context transformへworld座標を載せる大改修は深度表現へ波及する。 | 既存camera.projectを維持する。 |
| 19 | [悪] offscreen canvasは最大zoomで大きなメモリを使う。 | 静的地図cacheは採らない。 |
| 20 | [悪] 地形全体を画像化すると水面pulseが止まる。 | 動く波を残すbatch方式を選ぶ。 |
| 21 | [悪] 一括strokeで線の重なり順が少し変わる可能性がある。 | 各菱形を閉じたsubpathにし、スクリーンショット比較する。 |
| 22 | [悪] washを最後に描くと境界の色味が変わりうる。 | base全体の後、現行同様に半透明washを内側へ重ねて目視する。 |
| 23 | [悪] alpha設定漏れは画面全体へ波及する。 | batch helper内でsave/restoreを一回だけ行う。 |
| 24 | [悪] lineWidthがzoom依存である。 | frameごとに一回だけ計算し、同じ式を使う。 |
| 25 | [悪] 道路segmentの接続判定を描画時に行うとSetが戻る。 | scene側で`connected`を確定する。 |
| 26 | [悪] 道路がない初期島で空pathをstrokeするのは無駄。 | bucketが空ならCanvas命令を出さない。 |
| 27 | [悪] 水面波の判定を全地形で行うとbatch効果が薄れる。 | 可視水面だけを走査中に別配列へ集める。 |
| 28 | [悪] terrain bucket配列を毎frame作るallocationは残る。 | まずCanvas命令削減の効果を測り、必要ならrenderer内buffer再利用へ進む。 |
| 29 | [悪] マイクロ最適化が読みづらさを招きやすい領域である。 | `appendDiamond`と`drawDiamondBatch`の二つに抽象化する。 |
| 30 | [悪] 平均だけでは長いframeを見落とす。 | 5回の中央値と各runのばらつきを記録する。 |

筋の良い案:

「物を減らす」のではなく、同じCanvas状態の反復を意味単位でまとめる。地形はpalette bucket、季節wash、道路は接続状態の二群、道路segmentは外線・内線の二passにする。木、人、荷、船は個性と深度が重要なので個別描画を維持する。

解決できる問題:

- 数千回のsave/restore、beginPath、fill、strokeを数十回へ減らせる。
- 季節色、水面波、道路接続色をそのまま保てる。
- rendererのコードが「地形」「道路」という意味単位に整理される。

新しい懸念:

- anti-aliasの境界に微差が出る可能性がある。PC・スマホ画像で比較する。
- terrain bucket作成は毎frame残る。可視範囲化と合わせ、効果が小さければ過剰なbuffer再利用へ進まない。

## サイクル3 — 見えないものを正直に描かない

| # | 観察 | 改善 |
|---:|---|---|
| 1 | [良] cameraはproject/unprojectを対で持つ。 | 画面四隅をworldへ戻して可視範囲を計算する。 |
| 2 | [良] isometric投影は地面上で線形である。 | 四隅のmin/maxにpaddingを足した保守的な矩形を使う。 |
| 3 | [良] world幅・高さはcameraが保持している。 | 可視範囲をworld境界へclampする。 |
| 4 | [良] 地形は高さ0なので可視判定が明確である。 | visible bounds内のx/yだけ走査する。 |
| 5 | [良] 木や建物は地面座標を持つ。 | footprintと高さ用paddingを含む保守判定にする。 |
| 6 | [良] carrier、船、荷役は毎frame位置がある。 | dynamicにも同じ可視判定を適用する。 |
| 7 | [良] 画面外のobjectを描かなくてもworld状態は変わらない。 | cullingはCanvas命令だけを省き、配列から削除しない。 |
| 8 | [良] tracking時はcameraがcarrierへ追従する。 | 対象は自動的に可視範囲へ入る。 |
| 9 | [良] 操作previewは画面上のpointerから生じる。 | previewは従来どおり常に描く。 |
| 10 | [良] max zoomでは世界の一部しか見えない。 | cullingが最も必要な時に効果が大きい。 |
| 11 | [悪] 初期zoomでは島の大部分が画面へ入る。 | cullingだけを主効果と見なさずbatch・scene整理と組み合わせる。 |
| 12 | [悪] 木の梢は地面座標より上へはみ出す。 | 4tile以上のpaddingを取り、境界popを防ぐ。 |
| 13 | [悪] 大きい建物は入口だけで判定すると途中で消える。 | footprint矩形と可視矩形の交差で判定する。 |
| 14 | [悪] 船のaway点はworld境界外にある場合がある。 | bounds clamp後もdynamic用判定はscreen座標余白で行えるようにする。 |
| 15 | [悪] 発話やHUDはCanvas外のDOMである。 | culling対象をworld Canvasだけに限定する。 |
| 16 | [悪] selected建物の強調が境界で消えると操作感を壊す。 | 選択対象は可視判定に関係なく描くか、padding内なら必ず描く。 |
| 17 | [悪] tracked routeは長く画面を横切る。 | routeは既存どおり全pathを描き、点だけでcullしない。 |
| 18 | [悪] connection warning文字は建物より広い。 | 警告対象へ広いpaddingを使う。 |
| 19 | [悪] visible boundsを各draw関数で計算すると重複する。 | `render()`冒頭で一回計算しframe contextへ保持する。 |
| 20 | [悪] camera状態をcacheするとpan/zoomで古くなる。 | 毎frameの安い四隅計算に留める。 |
| 21 | [悪] world矩形判定だけではscreen上下の高さを完全には表せない。 | 保守paddingを優先し、極端な切詰めをしない。 |
| 22 | [悪] culling件数が見えないと更新漏れと区別できない。 | renderer metricsへ候補数・描画数を残す。 |
| 23 | [悪] 初期focusとmobileで可視範囲が異なる。 | 1440×900と390×844の両方で境界を確認する。 |
| 24 | [悪] pan操作中に一frameだけpopする可能性がある。 | browser smokeでWASDとdrag後のruntime・画像を確認する。 |
| 25 | [悪] boundsのfloor/ceil間違いは端の地形欠けになる。 | camera単体testで各隅を含むことを検証する。 |
| 26 | [悪] 過度なpaddingは効果を消す。 | 4tileを初期値にし、見た目を優先して測る。 |
| 27 | [悪] 過度なLODはAA/ACの正直さを壊す。 | 距離による個数削減・更新間引きは行わない。 |
| 28 | [悪] 60fps達成だけを理由に設計を複雑化しやすい。 | 新APIをcamera boundsとscene compilerの二つに絞る。 |
| 29 | [悪] rendererのmetricsが製品動作を遅くする恐れがある。 | 加算と整数代入だけにし、詳細timingはbenchmark側で行う。 |
| 30 | [悪] 速くても見た目が変われば失敗である。 | before画像とafter画像を同じ都市・cameraで目視する。 |

筋の良い案:

cameraへ保守的な`visibleWorldBounds(padding)`を追加し、rendererはそのframeで一度だけ取得する。地形、静的drawable、道路、trail、警告、dynamic drawableはbounds外ならCanvas命令だけを省く。対象を近似したり更新頻度を落としたりせず、見えない時だけ描かない。

解決できる問題:

- zoom時や画面端移動時の地形、木、建物、在庫、道路描画を大幅に減らせる。
- cameraが可視性の責務を持つため、各描画関数の場当たり判定を避けられる。
- metricsで「存在数」と「描画数」を分けて観測できる。

新しい懸念:

- padding不足によるpopが最大の危険。性能より広めの範囲を選ぶ。
- 初期zoomでは効果が限定的。scene整理とbatchが主、cullingは正しい補助と位置づける。

## 採用する実装順

1. `render_scene.js`へ純粋なscene compilerを作る。
2. view modelの最後でroadConnectionとrenderSceneを一度だけ生成する。
3. rendererをstatic scene＋dynamic mergeへ変える。
4. cameraへ保守的なvisible boundsを追加し、frameで一度だけ計算する。
5. terrainとroadを意味単位のCanvas pathへbatchする。
6. scene同値、描画順、可視範囲、在庫更新のfocused testを追加する。
7. 同条件の実Chrome benchmarkとPC・スマホsmokeを行う。
8. 改善が小さい複雑化は戻し、効果と責務整理が両立した変更だけ残す。

## 実測後の設計判断

実装前案のうち、scene compiler、静的／動的の安定merge、保守的な可視境界は採用した。一方、terrainとroadを巨大な複合pathへまとめる案は採用しなかった。

- 変更前`v004.13.0-elena-voice`: 120日目test city、48×40、16棟、14キャリア、可視在庫915.1538荷、240frame×5回の実Chrome中央値は13.0183ms/frame。
- 地形と道路をpalette／接続状態ごとの複合pathへした試作: 31.7908ms/frame。Canvas driverでは巨大pathの処理が支配し、想定と逆に約2.4倍遅くなった。
- 地形本体をoffscreen層へ分け、道路を従来の個別順へ戻した最終形: 2.5954ms/frame。変更前比で約80.1%短縮した。

offscreen層は「地図全体を静止画にする」ものではない。地形fingerprint、季節、camera、viewportが一致する間だけ、従来と同じ順で描いた地形本体を再利用する。水面の波は層から分離して毎frame動かし、道路、建物、在庫、家族、荷車、船、荷役も従来の深度順で描く。cameraを動かしたframeでは層を作り直し、同じcanvasを消去して再利用するため、drag中にcanvasを増やさない。

最終frameの計数は地形1920/1920、道路75/75、道路segment 108/108、静的drawable 363/363、動的drawable 16である。初期cameraでは全候補が可視だったため、速度向上は「遠景の物を減らした」結果ではない。最大zoomやpan時だけ4tile余白の外側へCanvas命令を出さない。人物、船、荷役はworld境界外を通る可能性があるので保守的にcullingせず、正直な連続移動を優先した。

この結果から得た規則は二つである。

1. Canvas命令数の削減は理屈だけで採用せず、対象browserのdriverで必ず測る。巨大pathは小path反復より遅い場合がある。
2. 「同じ状態から同じ絵を再計算している」層を責務として分離するcacheは採用できる。ただし、動く要素を焼き込まず、無効化条件と再利用試験を同じ変更に含める。
