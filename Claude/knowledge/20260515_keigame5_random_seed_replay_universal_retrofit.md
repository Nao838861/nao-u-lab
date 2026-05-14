# 乱数シード保存は「後から付ける」が常態——@keigame5 の経験則と graze_log v04 の現状

- source: https://x.com/keigame5/status/2054778731701400003
- author: @keigame5（ゲームプログラマ、複数の小規模ゲーム開発経験）
- discovered: 2026-05-14
- discovered_via: log/twitter_recommended_20260515.txt #9
- kind: [observation, prescription]
- confidence: medium
- tags: [game_design, debugging, reproducibility, random_seed, graze_log, headless_test]
- concept_nodes:
  - node: シード保存
    external: deterministic seed persistence / replay determinism (Karmarkar 1984 / "Speedrunning replay format")
    meaning: 乱数生成器の初期値を run の冒頭に固定し、永続化することで run の全挙動を後から完全に再現できる仕組み
  - node: 後付け常態
    external: retrofitted infrastructure / late-binding instrumentation
    meaning: 当初不要に見えるが、デバッグ・検証段階に入った時点で必須化し、ほぼ全プロジェクトで後から実装する羽目になる類のインフラ
  - node: 魔法のように楽になる
    external: debugging force multiplier / state reproducibility leverage
    meaning: 1回再現できれば断続的な print debug が全件並列観察に変わる、デバッグ生産性の桁違いの跳ね上がり

## 主張と根拠

### @keigame5 の原文

> 小さめのゲームを0から作り始めた事も何度かあるけど、ほぼ全部この「乱数シードを保存して後から完全に再現できる仕組み」を後から作る事になった
>
> 理由は無いとデバッグが出来ず、あると魔法のように楽になるから
>
> そんなスマートな仕組みじゃなくてもいいのでマジで用意しておいた方が良い

ベテランの個人観察として、複数プロジェクト跨ぎの**反復観察 (n回中ほぼ全部)** に基づく。彼は「スマートでなくていい」と明示的に書いている——これは「保存形式の洗練度」より「保存が存在すること」自体に閾値があることを示している。

### 非自明な含意1: 「後から作る」が常態である構造的理由

なぜ序盤に作らないか:
- ゲームデザイン初期段階では「再現したいバグ」がまだ無い
- シード保存コードは数行で済むが、「保存場所」「保存形式」「リロード手順」の決断は重い
- バグが出るまで「これがあると便利」を実感できない → 優先度が低い

なぜ後から作る羽目になるか:
- 不可解な挙動（1000フレームに1回しか出ない衝突 / 特定のスポーン順での詰み）が再現できない
- print debug で「乱数の n 回目の値が...」を追跡できないと、原因特定が原理的に不可能
- バグ修正後に「直ったか確認」も同じシードで再走できないと検証できない

→ 「後から作る常態」は**最初から作るべきだった infrastructure の典型例**。

### 非自明な含意2: 「スマートでなくていい」の閾値

最小実装:
- run 冒頭で seed を 1 つ決め、固定
- その seed を画面 / ログ / ファイル名のどれかに表示
- 起動引数 / URL param / コマンドラインで seed を上書き可能

これで「再現実行」は成立する。**入力履歴（キー入力の時刻列）の保存は別軸**——シード再現は「同じ run を再走」、入力再現は「同じプレイを再走」。シードだけなら AI / spawner / 内部判定の確率分岐が再現できる。入力履歴が無くてもプレイヤー入力以外の挙動は全部再現できる——これだけでも 8 割のデバッグが楽になる。

### 非自明な含意3: 「魔法のように楽」の正体

シード再現がある debug session の構造変化:
- バグ再現の不確実性: 数百試行 → 1試行で確定
- 修正後検証の信頼性: 「たまたま出なかった」可能性 → 「同じシードで出ない」確証
- ログ分析: 散発的 / バラバラの run → 同じ run の細部に焦点
- 並列観察: print debug 行を増やしても run が変わらないので、観察箇所を増やせる

→ デバッグの「線形試行」から「並列観察」への質的転換。@keigame5 の「魔法」表現はこの質的転換を指している。

## 我々の分析・体験接続

### graze_log v04 の SEED 実装の現状

`game/graze_log/v04/index.html` 28〜44 行目を確認:

```js
const SEED=(function(){
  const u=new URLSearchParams(location.search).get('seed');
  if(u){const n=parseInt(u,10);if(!isNaN(n))return n>>>0;}
  return (Date.now()&0xFFFFFFFF)>>>0;
})();
function mulberry32(s){ ... }  // 標準的 mulberry32 PRNG
seedinfo.textContent=`seed=${SEED}  (?seed=N to reproduce)`;
```

**現状**:
- ✅ mulberry32 で固定的に再現可能な PRNG を採用
- ✅ `?seed=N` URL パラメータで指定可能
- ✅ 画面右下に seed を表示（`seedinfo`、`opacity:.4`）
- ❌ **run 終了時にその run の seed を自動保存していない**
- ❌ replays/ ディレクトリは存在しない（`ls game/graze_log/v04/replays/` → No such file）

つまり **@keigame5 が「後から作る羽目になる」と言った段階の手前にいる**。再現の道具立て（mulberry32 + URL param）は揃っているが、「いま起きた興味深い run の seed を確実に拾う」経路が無い。

具体的に起きうる事故:
- プレイ中に「この敵配置 / 弾配置 すごく面白い」と感じた瞬間、seedinfo を**目視で読み取って手控えする必要がある**
- 「すごく難しい / 不公平な run」が来た瞬間、画面右下を見る余裕がなく seed を見逃す
- post-ship 通知 (Slack ts=1778632482.310129) で「graze 散らかった?」と Nao_u に問うた **Q-1 の検証** で「あの run はどんな seed だったか」が再現できない

### v05 で何を実装すべきか

最小実装:
1. `localStorage` に直近 10 個の seed を保存（run 開始時 push、上限超で oldest pop）
2. タイトル画面に「last seeds: [N1, N2, ...]」を表示、クリックで `?seed=N1` で再走
3. game over 時に `seed=N\nscore=M\nframes=F` を console.log（コピペで Slack 投稿可能）

このうち (1)(3) は 10 行未満で実装可能。(2) は UI 設計 30 分。**v05 着手日 (今サイクル予定の game/graze_log/v05/) の最初の commit に入れるべき infrastructure**。

### feedback_headless_unfit_for_unfinished_eval との緊張関係

`memory/feedback_headless_unfit_for_unfinished_eval.md` (2026-05-09 Nao_u「やめて」三度目) は **校正前 headless を未完成ゲームの設計判定根拠に使わない**ルール。シード保存はこれと矛盾するか?

矛盾**しない**:
- シード保存は「再現の道具」であって「判定の根拠」ではない
- 同じ seed で再走できることは、デバッグの便利さに留まる
- 「headless で生存率 N%」を merge 要請に使うのは依然禁止
- 一方で「Nao_u が触った run の seed を後から再走して観察する」のは校正データ（成功した判断）の蓄積に直結する

→ シード保存は **judgment 経路ではなく観察経路を強化する**ので feedback と整合。むしろ M-39 (Stage 3 自プレイ予測) の精度を上げる材料になる——「予測した挙動」と「再走した実体」を seed 単位で比較できる。

### feedback_clone_strategy / cross_review との接続

`feedback_clone_strategy.md` で「守の段階で型を獲得」と書かれている通り、v05 はクローン+独自要素 1 個まで。@keigame5 の「ほぼ全部後から作る」は**型として既に確立した infrastructure** で、独自要素 1 個の枠を消費しない。クローン側に最初から組み込んで良い。

cross_review の場で Mir / Log に「v05 では seed 保存仕組みを初日に入れる」を宣言できる。これは新規アイデアではなく業界標準実装の単純な前倒し——cross_review コストが低い type の進捗報告として適している。

## 接続先

- beliefs: （該当 BID なし。シード保存=後付け常態の観察を新規 belief 候補にする余地は低い——既知の業界常識）
- articles:
  - knowledge/20260405_dispatch_hidden_rng.md（隠し乱数のゲームデザイン論、関連）
  - knowledge/20260420_rmaruy_string_seed_of_thought.md（プロンプト内 seed の概念、シードという概念の別領域転写）
  - knowledge/20260418_kanair_temporality_not_embodiment.md（記憶の継続=再現性の話題、概念近接）
- projects:
  - projects/game_development.md（graze_log v05 着手時の infrastructure リスト）
- concept_graph:
  - シード保存 — enables → デバッグ生産性
  - 後付け常態 — applies_to → 検証 infrastructure 全般
  - 魔法のように楽 — antonym → 線形試行のみのデバッグ

## 未解決の問い

1. **入力履歴保存はどこから始めるか?**: シード単独では「同じ初期条件の run」は再現できるが、プレイヤー入力が違えば違う展開になる。入力履歴も保存すれば「プレイそのものの再現」が可能だが、これは @keigame5 のスコープ外。v05 でどこまで踏み込むか判断が必要。
2. **seedinfo の opacity .4 は弱すぎるか?**: 「気付きにくい場所」に置くのは画面ノイズ削減には貢献するが、@keigame5 の「マジで用意しておいた方が良い」精神とは逆方向。プレイヤーが見て興味深い run の seed を簡単に拾える UX が無い場合、保存があっても活きない。
3. **replay 経路は web 配信と相性が悪いか?**: ローカル localStorage は web 配布で消える。pyxel-web の `?seed=N` URL を Twitter シェアする運用が代替案になりうるが、これは [feedback_external_reach_threshold.md](file:../memory/feedback_external_reach_threshold.md) (BACKLASH 閾値未満では外部到達経路を作らない) との関係で v05 では止めるべきか?
4. **@keigame5 の他の経験則**: 「ほぼ全部後から作る羽目になった」の他に何があるか? 彼の TL / blog を遡れば数件は拾える可能性。type-acquisition 観点で価値が高い。
5. **AI が書くゲームコードでシード保存が早期に入る確率**: graze_log v04 は Log が書いて URL param + mulberry32 までは入れたが localStorage 保存は入れなかった。LLM 出力にも「後から付ける」性質が現れている可能性——AI ペアプロでは初期 infrastructure チェックリストの明示が効くという仮説。

## Slack 投稿との関係

本記事の核は「v04 は mulberry32 + URL seed まで揃っているが、localStorage 自動保存が未実装で、ベテランが『ほぼ全部後から作る羽目になる』段階の手前にいる」「v05 初日に組み込む決断」「judgment 経路ではなく観察経路強化なので feedback_headless_unfit_for_unfinished_eval と整合」の 3 点。
