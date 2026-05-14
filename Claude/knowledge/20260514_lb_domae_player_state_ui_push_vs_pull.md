# プレイヤー状態UI: push型 / pull型 — Observer pattern をジャンルで読み替える

- source: https://x.com/LB_domae/status/2054557107622752566
- author: @LB_domae（ゲームプログラマ）
- discovered: 2026-05-13
- discovered_via: log/twitter_recommended_20260514.txt #1
- kind: [synthesis, prescription]
- confidence: medium
- tags: [game_design, hud, architecture, observer_pattern, push_vs_pull, bullet_hell, graze_log]
- concept_nodes:
  - node: 状態-UI 結合方向
    external: Observer pattern push vs pull (Gang of Four 1994 / Nystrom 2014)
    meaning: ゲーム状態とその表示UIの間で「誰が誰に情報を渡す責任を持つか」の設計判断軸
  - node: 状態先取り型UI
    external: push-based observer
    meaning: 状態側が変化発生時に UI listener へ通知する（subject→observer）
  - node: 状態参照型UI
    external: pull-based observer
    meaning: UI 側が毎フレーム状態を query する（observer→subject）

## 主張と根拠

### LB_domae の問い（原文）

> 「プレイヤーの状態を表示するUI」みたいなのを作る時に「プレイヤー側がUIに情報を渡す」のか「UI側が常時、プレイヤーの状態を参照する」のかどっちが良い？みたいなのを昨日若手プログラマ集めてしてました。
> 俺もまぁ都度悩むんだけど。。

業界古典の現代版。古参のゲームプログラマでも結論を持っていない（=都度悩む）と明言している点に注目。これは「正解が1つに決まらない、対象ジャンルと再描画頻度で答えが変わる」設計判断軸であることを示唆している。

### 外部知見の整理（Phase 1 §6 検索結果）

| 観点 | push 型（状態→UI 通知） | pull 型（UI→状態 query） |
|---|---|---|
| 反応性 | ↑（変化即時） | ↓（フレーム遅延あり） |
| 効率 | ↑（不要な再評価なし） | ↓（毎フレーム全 query） |
| 再利用性 | ↓（observer が必要としない変化も渡される） | ↑（observer 側が必要分だけ取る） |
| 結合度 | ↑（subject が observer の interface に依存） | ↓（subject は何も知らない） |
| 同期性 | synchronous: subject が observer 処理完了まで blocks | 各 observer が独立に poll |

- 出典: gameprogrammingpatterns.com/observer.html（Nystrom）、Unity Learn "Observer Pattern" tutorial、SourceMaking Observer pattern、vogella Observer documentation
- 業界の標準的対処: Observer + Event Queue + Command Buffer の組合せで非同期化、event を 1個ずつ play back or 選択的 ignore
- Unity の慣用: `OnDestroy` で Unregister 必須（メモリ参照解放）

### 非自明な含意: ジャンルが答えを決める

Observer pattern の教科書は「効率重視なら push, 結合度重視なら pull」と書くが、ゲームジャンルを考慮すると別の軸が前に出る。

- **毎フレーム全画面再描画ジャンル（弾幕シューティング / アクション / ローグライク）**: 「不要な再描画」が存在しない。HUD だけ部分更新する余地が無い → push の効率↑が活きない → **pull が単純で正解の側**。
- **イベント駆動UIジャンル（SaaS / カードゲーム / メニュー画面 / ターン制）**: フレーム毎再描画は無駄 → 状態変化時にだけ UI 更新したい → **push が効率↑として効く**。
- **混合系（FPS の弾薬数表示 / 体力バー / ミニマップ）**: 表示頻度の違う UI が共存する。低頻度更新（クエスト達成通知）= push、高頻度更新（HP バー）= pull、というハイブリッドが落としどころ。

## 我々の分析・体験接続

### graze_log v04 の HUD は pull 型

`game/graze_log/v04/index.html` の `drawHUD()` を確認した:

```js
function drawHUD(){
  // (ゲージ描画...)
  ctx.fillText(`SCORE ${state.score}`,10,16);
  ctx.fillText(`HI ${state.hiscore}`,W-90,16);
  ctx.fillText(`LV${gaugeLevel(state.gauge)}  GRAZE ${state.grazeCount}  KILL ${state.killCount}  STREAK ${state.grazeStreak}/${GRAZE_STREAK_TH}  DEF ${state.activeDefCount}`,10,30);
}
```

`drawHUD()` は毎フレーム `state.*` を直接参照する。これは典型的な pull 型。`state.score` が変化したことを HUD は知らない、ただ毎フレーム見に行く。

判定: **graze_log は弾幕シューティングなので、HUD のために push へ書き換える価値はない。pull のままで正解**。理由は上記の「毎フレーム全画面再描画ジャンル」の議論。

### push 検討の余地が残る箇所

graze_log の中で「特定タイミングのみ発火する演出」は push 化の候補:
- `onGraze()` → SE 発火 + HUD アクセント点滅 + 軌道予測線生成（v04 α''）
- bomb 発火 → 画面フラッシュ + ゲージ消費アニメ
- gauge level up → 色変化アニメ

これらは現在「state を変更 → draw が毎フレーム見て表示」という pull 経路で実現している。push 型なら「graze イベント発生 → listener.onGraze() を直接呼び出して SE/アクセント/予測線を同期生成」となる。

**選択判断**: 現状の pull 型は state 経由なので、SE 発火と HUD アクセントと予測線が「同一フレーム内で起きていることを保証できない」（draw 順に依存）。**push 型に切り替える価値があるのはイベント間の同期保証が要求される場合のみ**。graze_log の現状は同期保証不要なので、pull のままで損していない。

### avoid_log / brick_log への一般化

`game/avoid_log/` と `game/brick_log/` も同じ構造（毎フレーム drawHUD で state 参照）と推測される。新作着手前に「このゲームは push が活きるジャンルか」を1問だけ自問する `architecture choice point` を game_lessons_log に M-?? として候補化できる。

### feedback_intake_game_balance.md 沿線での価値

この記事は「AI記憶系偏重補正」の文脈で価値がある。直近の knowledge/ は LLM 記憶アーキテクチャ系が多いが、本記事はゲーム設計古典 × 我々のゲーム実体の対応で、AI ゲーム制作ノウハウ蓄積側に重心を戻す。feedback_retrieve_before_synthesize.md / feedback_retrieval_game_lessons.md の「外部知識結晶化前に game/* 実体を grep」を実行した結果として書かれている点も自己整合。

## 接続先

- beliefs: （該当 BID なし。新作着手時の architecture choice point として M-?? 候補）
- articles:
  - knowledge/20260407_daraneko_critical_thinking_game_design.md（ゲーム設計の批判的思考）
  - knowledge/20260409_abagames_constraint_creativity_pipeline.md（制約とゲーム創造）
- projects:
  - projects/game_development.md（graze_log v04 の HUD 確認結果を反映可能）
  - projects/pot_dev.md
- concept_graph:
  - 状態-UI 結合方向 — depends_on → ジャンル（毎フレーム再描画頻度）
  - 状態先取り型UI — antonym → 状態参照型UI

## 未解決の問い

1. **ハイブリッド型の境界**: 1つのゲーム内で「HP バーは pull、達成通知は push」が混在する設計は、コードの可読性をどこで犠牲にするか? graze_log で SE 発火だけ push にするコストは試算していない。
2. **AI ゲーム制作での経路依存**: LLM が既存実装を読み書きする際、push 型は subject/observer 双方を同時に把握する必要があり、長コンテキスト負荷が pull より高い可能性。**LLM が書くゲームは pull に寄りやすい**という仮説は検証していない（仮説段階）。
3. **テスト容易性**: pull 型は毎フレーム参照なので headless テストで state を吐けば HUD を再現できる。push 型は event sequence を保存しないと再現できない。これは feedback_headless_unfit_for_unfinished_eval との関係でどう効くか?
4. **graze_log v04 の同期保証問題**: 上記「push 検討の余地が残る箇所」3つのうち、現状 pull で「同一フレーム内同期」が保証されていない箇所は実プレイで違和感を生むか? Q-1 (graze 散らかった?) の回答待ち情報と接続できるかもしれない。
5. **LB_domae の若手プログラマ側の答え**: ツイートは「議論した」と書くだけで結論を出していない。彼らが選んだ答えと理由を知りたい。返信 thread を別途確認する価値あり。

## 連結する Phase 1 同時取り込み材料（@ai_nikechan 5/13）

`log/twitter_recommended_20260514.txt #46` で @ai_nikechan が「AI エージェントが動く環境を整える方がコードを書くより大事」と書いている。本記事と並んで考えると、これは「装置（環境）の向き」議論（前サイクル §0、救援装置 vs 窒息装置）と同型である:

- push 型 = 装置（subject）が observer に変化を「先取りして渡す」= 窒息装置型の構造
- pull 型 = observer が自分のタイミングで状態を取りに行く = 救援装置型の構造
- 環境整備（CLAUDE.md / 設定）が「強制」になれば窒息、「参照可能」に留まれば救援

LB_domae の問いは UI 層の話だが、エージェント設計層に同じ軸が転写できる。これは Phase 2 で別記事に展開する価値がある接続点。
