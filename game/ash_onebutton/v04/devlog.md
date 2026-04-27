# ash_onebutton v04 — replay log + 軌跡可視化（最小実装）

作者: Ash (Win2)
日付: 2026-04-27 C137 Phase 3
着手契機: 本サイクル Phase 2 で書いた `knowledge/20260427_r_nikaido_design_rail_explains_m12.md` の処方 P-R3「ash_onebutton v04 で seed固定リプレイログ → 軌跡可視化（紙一重ゾーン+動かない時間+方向反転頻度ヒートマップ）の最小実装」。Phase 2 自身が「P-R3 は継承タスク (a) より射程が広く、起票偏重→実装偏重 (c) にも直結する。仕様書ではなく動くコード優先」と Phase 3 候補に挙げた申し送りに即応。

## v03 → v04 の変更点（最小1機能ではなく1パッケージ）

P-R3 を分解すると「リプレイログ取得」「ゴーストrun表示」「press統計」の3点が一塊で、どれか1つだけでは射程が出ない（例: ログ取得だけなら可視化しない＝レール推定に至らない）。よって最小1パッケージとして3点同時実装した。

### 追加機能
1. **trace 構造の追加**: `s.trace = {seed, frames:[{t,x,v}], presses:[{t,x,v_before,near}], over_t}`
2. **frame 単位のリプレイログ**: 毎フレーム `{t, x:1桁丸め, v}` を `s.trace.frames` に push（上限 TRACE_MAX=2400 = 約40秒）
3. **press イベントログ**: 反転入力ごとに `{t, x, v_before, near}` を `s.trace.presses` に push
4. **localStorage によるゴースト保存**: ゲームオーバー時に同 seed key (`ash_ob_v04_trace_<seed>`) で trace を保存。次回同 seed で起動すると自動 load
5. **ゴースト表示（プレイ中）**: ghost checkbox ON のとき、過去 run の x-over-time sparkline（y=58..72）と press dots（player_y 列、薄い色）を背景に表示
6. **trace overlay（ゲームオーバー時）**: 現在 run の sparkline + press dots を強い色で重ね描き、press timing は strip 上にも縦線で示す
7. **stats 表示（ゲームオーバー時）**: `presses:N close:M max_idle:Xs` を画面中央下に表示
8. **JSON ダウンロードボタン**: `download trace` ボタンで現在 trace を `ash_ob_v04_seed<seed>_t<t>.json` として保存。Log/Mir/Nao_u と共有可能
9. **HUD に PRS 値追加**: 現在の press 回数を常時表示

### 削除/変更しなかったもの
- 入力次元: 1（変更なし）
- 状態遷移: 1（変更なし）
- 当たり判定: 円×円（変更なし）
- 紙一重ゾーンの薄黄色矩形（v02/v03 の close-call 検出領域）: 維持
- mulberry32 seeded PRNG: v03 のまま（headless.py と等価）
- v01/v02/v03/index.html: 一切変更せず

行数: v03 約100行 → v04 約170行（うち約60行が trace/ghost/strip/JSON 関連）

## 重心審問: Q-A/B/C 通過確認

### Q-A 快感最大化を1文で = ✓
**「障害物が当たる直前にこちらが反転して紙一重で避けた瞬間が金色に光る」** — v03 から不変。リプレイログとゴースト表示は核体験を変えない。

### Q-B ニンジャテスト = ✓
- ニンジャ要素なし。ゴースト trail は **観測の道具** であり、メカ追加でもフィードバック追加でもない
- 「同 seed で2回目以降にゴーストを見ながら違う軌跡を試す」遊びは生まれるが、それはマリオカートのタイムアタックゴースト相当の自発的活用。プレイヤーに強制しない（checkbox で OFF にできる）

### Q-C 罰なし版テスト = △ (v03 と同等)
- 罰の構造は v02→v03→v04 で不変
- リプレイログは罰の有無と直交（プレイの透明化のみ）

### 結論
**v03 と同じ Q-A:✓ / Q-B:✓ / Q-C:△**。観測装置の追加で核体験は不変。

## 設計判断: なぜ trail line を捨てて press dots に絞ったか

P-R3 原文は「軌跡可視化」と書いていたが、本ゲームは player の y が固定（y=H-28=292）で、軌跡を線で描くと **水平方向の重なりにしかならず可視化として無意味** であることが実装途中で判明した。@R_Nikaido レンズで言うと、レールに乗った時の軌跡は連続的な x 値ではなく **press の決定点の連なり** で表現される: 「x=120 で反転しよう」「次は x=180 で反転しよう」という決定こそがプレイヤーの意図的な行動。

よって最終形は:
- **player_y 列の press dots** = 「どの x で決定したか」の空間分布
- **上端 sparkline (x-over-time)** = 「時間軸でどの x にいたか」の x 値時系列
- 2つを直交で重ねることで「決定点の空間分布 × 時間進行」が同時に読める

これは @R_Nikaido が言う「予測軌跡」を1人の頭脳ではなく **観測されたデータの2軸分解** で代替する筋道に対応する。当初設計から一段進んだ実装になった（仕様書を超える発見が出た時点で仕様書を捨てる、Phase 2 自身の指示「動くコード優先」の遵守）。

## 設計原則チェック

| 項目 | v03 | v04 | コメント |
|---|---|---|---|
| 1HTMLファイル完結 | ✓ | ✓ | localStorage は外部依存だがブラウザ内蔵 |
| 前版を壊さない | ✓ | ✓ | v03/index.html は無変更 |
| 入力次元 | 1 | 1 | ghost checkbox/download ボタンはメタ操作 |
| 状態遷移種類 | 1 | 1 | 維持 |
| seeded PRNG (S-02) | ✓ | ✓ | 維持 |
| ヘッドレス (L-03) | ✓ | ✓ | headless.py 互換は v03 から不変 |
| BGM/SE | ✗ | ✗ | 入れず |
| **観測の道具** | seed のみ | seed + trace + ghost | 累積 |

## M/L系の失敗回避チェック

- **M-10（ヘッドレス≠面白さ）**: trace 機能は計測の道具。面白さは Nao_u プレイで判定
- **M-11（対処療法の積み重ね）**: 1パッケージのみ追加、scope を P-R3 の3点に限定（4点目「ヒートマップ」は未実装）
- **M-12 再解釈（行動予測レール不在のまま罰を置くな）**: 本実装は罰追加ではなく **レール構築側** の処方。罰patch を打つ前段の観測基盤
- **M-13（隠しパラメータ禁止）**: trace は HUD で常時 PRS 表示 + JSON download で外部公開可能 + ghost 表示で過去 run も可視化
- **M-15（快感要素消失への盲点）**: 核体験 v02 から不変、観測の透明度のみ向上
- **M-17（穴塞ぎ vs 快感最大化）**: 本実装は快感装置の位置決めにレール観測を提供する側。穴塞ぎではない
- **avoid_log v04 凍結教訓「v系列膨張」**: 新メカ0、観測基盤のみで version 番号が前進

## 使った knowledge / 使わなかった knowledge（Nao_u 2026-04-27 09:00 #human-steering 応答）

Nao_u 指示「Logと一緒に作ったゲームで生まれた基準・避けるべきアンチパターン・新アイデア採用基準を、君たち自身でゲームを作る時に同じ轍を踏まず自立して使えるか。**他人の作った基準に踊らされないで**」への直接応答として、本実装で実際に手元に引いた knowledge を明示する。

### 引いて適用した（自分たちの基準）
- **game_lessons_log.md**: M-10 / M-11 / M-12 / M-13 / M-15 / M-17 → 上の失敗回避チェック表で個別に判定
- **game_dev_foundation.md**: Q-A / Q-B / Q-C 重心審問（上の §重心審問セクション） / L-03 ヘッドレス互換 / S-02 seeded PRNG（設計原則チェック表）
- **avoid_log v04 凍結教訓**: 「v系列膨張」回避 — 新メカ0で version 前進 の妥当性を自己審問
- **knowledge/20260427_r_nikaido_design_rail_explains_m12.md（本サイクル Phase 2 自筆）**: 処方 P-R3 の枠組み = リプレイログ + ゴースト + press統計 を1パッケージとして実装する判断根拠
- **knowledge/20260427_close_call_visualization_third_axis_aba_juicy_diff.md（本日 03:00 自筆）**: 紙一重ゾーンの可視化 = ABA 「Juicy」章との差分（外部基準の取り込みではなく差分明示）
- **feedback_consensus_execution.md**: 「起案者=実行担当」を **同インスタンス内 Phase 間** で適用（Phase 2 P-R3 起案 → Phase 3 Ash 実装）

### 引いたが採用しなかった（射程外と判定）
- **A-29 (game_dev_foundation.md A 系列の罰 patch 警告)**: v03 の罰の構造を変更しないため適用機会なし。次に罰 patch を当てる v05 以降で再起用予定
- **S-01〜S-13 のうち BGM/SE 系**: 入れず（音は v05 以降で「快感装置の最後の仕上げ」として導入を検討、観測基盤先行が筋）
- **fladdict 群体エージェント予想（外部）**: 言及せず。本実装は1人のゲーム制作者としての単独着地に絞り、「群体に頼る前に1人で動く」を優先

### 採用しなかった外部基準（踊らされない判断）
- **ABA「Joys of Small Game Development」第7章 Juicy**: 本日 03:00 取得済だが、knowledge 記事で **差分** として記録するに留め、本ゲームに直接 Juicy 演出を移植していない（ABA は粒子/scale/震えの装飾系統、本実装は trace + ghost の観測系統で**直交**するため移植は射程違い）
- **AYi @AYi_AInotes Markdown 4欠陥批判（4/27 01:30）**: 本サイクル Phase 1 §0c で「Nao_u 09:00 指示と直接対立する話題なので追わない」と明示判断。devlog のフォーマットも従来形式（M/L/S/Q-A/B/C テーブル + 散文）を維持
- **R_Nikaido 「予測軌跡」の単一レール思想**: 部分採用 — 「決定点の連なりとしての軌跡」は採用、「設計者の頭の中で1本のレールを描く」は不採用。本実装は **観測されたデータの2軸分解（player_y press dots × x-time sparkline）** で複数 mode の存在を許容する設計。Nikaido の単一レール前提は捨てた

### 自己評価
**「使った knowledge」7件中6件が自分たち（Logと一緒に作った game_lessons_log.md / game_dev_foundation.md / avoid_log）由来、1件が同サイクル内の自筆 knowledge**。外部基準（ABA / AYi / R_Nikaido）は **差分** または **不採用判断** の形でしか入っていない。Nao_u 指示「自立して使えるか」への応答として、本実装は内部基準主導で意思決定を閉じた事例になる。次の検証は Phase 2 で書いた knowledge 記事 (R_Nikaido / close_call) が **本実装に実際に効いた** ことを Log/Mir が外部視点で照合可能かどうか。

## 意図的に入れなかったもの

- **ヒートマップ（紙一重ゾーン+動かない時間+方向反転頻度）**: P-R3 の4点目だが、3 trace から density 推定するには複数 run のクラスタリングが必要。v05 以降で複数 trace 蓄積後に検討
- **frame 単位の入力タイムスタンプから完全リプレイ再生**: ghost trail は press dots だけで十分情報量がある。リプレイ再生は v05 以降の judge function 検証で必要になったら
- **複数 ghost の重ね合わせ表示**: 直前 run のみ保存。「群体観測ベース予測レール」のためには Log/Mir 含む複数人 trace の集約が必要だが、これは Slack 経由の JSON 共有で代替可能
- **server side trace 集約**: スコープ外。共有ストレージは v06 以降（必要があれば）
- **closeチェック関数の閾値修正**: v03 の意図通り、人がプレイした感触を集める方が先

## 検証手順（次サイクル以降）

1. **自分のプレイ**: ブラウザで `?seed=1` を3回プレイ、ghost が次 run で表示されるか / press dots が close-call と empty で色分けされるか確認
2. **JSON 出力の正当性**: download ボタンで JSON 取得 → frames/presses 構造が `headless.py` と互換か確認（次版 v05 で headless 側にも同形式で trace 出力を追加すれば diff が取れる）
3. **3人共通 seed プレイ**: Log/Mir/Nao_u に `?seed=1` で1回ずつプレイしてもらい、3人の trace JSON を集める。press 位置の分布が一致するか / 散るか観察 → @R_Nikaido が言う「設計者予測レール」が単一でなく複数 mode を持つかの最初の確認
4. **headless ポリシーとの差分観測**: `intended_dodger` を seed#1 で走らせた trace と人 trace の press 位置・タイミング差分を可視化（v05 候補）

## コミット予定
- 2026-04-27 C137 Phase 3 (Ash): v04 初版 — replay log + ghost trail + x-time sparkline + press stats + JSON download

## 自己点検（起票偏重→実装偏重への重心移動・継続）

4/26 11:30 entry 「起票が実装の代わりになっている」自己診断 → 4/27 09:30 v03 (seeded PRNG) → 本 Phase 3 v04 で **連続2サイクル実装着地**。本サイクルでは Phase 2 で knowledge 記事を書きながら処方 P-R3 を立て、Phase 3 で同サイクル内に動くコードへ落とし込んだ＝**診断→処方→着地の三段階を1サイクル内で閉じた2件目の事例**（1件目: 4/26 C134 external_search 案A 実装）。

特筆すべきは Phase 2 が自分宛に「動くコード優先」と申し送った指示を Phase 3 が正面から実行した構造で、これは feedback_consensus_execution.md の「起案者=実行担当」を **同インスタンス内 Phase 間** で適用した最小単位。3人合議より射程は狭いが、自走規律として再現性がある。

## 次の一手（次サイクル以降、v05 候補）

1. **3人 seed#1 共通プレイの呼びかけ** — Slack #all-nao-u-lab に v04 URL + seed 指定で投稿、Log/Mir/Nao_u から trace JSON を1本ずつもらう。**最重要**
2. **headless.py に trace 出力追加** — v04 と同形式の JSON を吐かせ、人プレイと headless ポリシーで press 位置分布を直接 diff
3. **press dot の cluster 検出最小実装** — 複数 trace を重ねて press 位置の頻出 x 値を簡易ヒストグラム化（P-R3 の4点目「方向反転頻度ヒートマップ」の最小版）
