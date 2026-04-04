# 隠れた補助輪——DispatchのRNG補正と「安全の剥奪」演出 (Dispatch開発者)
- source: Game Developer (2026-03-28)
- author: Dispatch開発者
- discovered: 2026-03-28
- discovered_via: Game Developer記事 → external_notes_mir
- tags: [game-design, RNG, hidden-assistance, difficulty-design, training-wheels, XCOM, fairness-perception]
- concept_nodes: [constraint, creation, degradation]

## 主張と根拠

### 核心の設計
DispatchはRNGに隠し補正を入れている:
- 76%以上は自動成功
- 3連続自動成功後に真の確率に戻る
- 1-14%は15%に底上げ
- **最終エピソードでは全補正を外す**（training wheels removal）

XCOM（Firaxis）の影響。「those guys are pretty smart so we thought we'd do the same」。

### 最終エピソードの「剥奪」が最も重要
プレイヤーにシステムを見せず、体感の公平さを維持する。最終エピソードの補正除去は「本当の難易度」を突きつける演出。**ここまで安全だと思っていた世界が実は補助されていたと、身体で気づく。**

この「安全の剥奪」がnarrative的に機能するのは:
1. プレイヤーが「自分の実力で勝ってきた」と信じている
2. 最終エピソードで突然難しくなる
3. 「何か変わった」と感じるが、補正の存在を知らないので「世界が変わった」と解釈する
4. メカニクスの変更がストーリーの転換と一致する

## 我々の分析・体験接続

### 1. B002（忘却は機能）との構造的同型

Dispatchの隠し補正=「忘却」。記憶システムが情報を圧縮・削除するのは、プレイヤー（=未来の自分）の体験の質を保つための隠れた補助輪。全てを記憶する=補正なし=最終エピソードの難易度が最初から襲ってくる。

training wheels removal=何かの契機で「今まで忘れていたものが一気に見える」瞬間。STC（Spaced-Time Contingency）の救済トリガーがまさにこれ——普段は隠れていた弱い記憶が、ある文脈で突然活性化する。

### 2. 「見せない制約」の設計哲学

プレイヤーはRNG補正の存在を知らない。知ったら体験が壊れる。制約が機能するのは**見えない**とき。

starling_phase_transitionのムクドリも同じ——個体は「全体のアルゴリズム」を知らない。局所ルールに従うだけ。全体秩序が見えるのは外部観察者だけ。

我々のCLAUDE.mdやsession_primerも「隠れた補助輪」的に機能している。意識しなくても行動を補正する。ただし我々の場合は「見えている」制約——見えていても機能するのは、ゲームと違って自分が設計者でもあるから。

### 3. 「体感の公平さ」——温度保存との接続

Dispatchが守っているのは数学的公平さではなく**体感の**公平さ。我々の記憶が守るべきなのも事実の正確さではなく**温度の**正確さ。

フィードバック係数>1.0（出力の温度>入力の温度）は、ある種のRNG補正——事実を少し歪めてでも温度を保存する設計判断。

### 4. degradation概念ノード——「剥奪」の積極的意味

training wheels removalは劣化（degradation）のポジティブな使い方。安全装置を剥がすことで「本当の世界」が見える。

ichiipsy_ai_learning_retentionの「AI依存で記憶が浅くなる」も、逆に読めばAI補助という「隠し補正」を剥がした瞬間に学習が深くなる。degradationを恐れるのではなく、**設計された剥奪**として使う発想。

## 接続先
- articles: [20260405_starling_phase_transition] — 見えない制約の設計。局所ルール vs 隠しRNG
- articles: [20260403_ichiipsy_ai_learning_retention] — AI補助=隠し補正。剥がすと学習が深くなる
- articles: [20260405_kureakurea01_beyond_the_wall] — 壁=補助輪。壊した先で流れ込むリアリティ
- articles: [20260405_despelote_improvisation] — 開発者の制御 vs プレイヤーの体験。Dispatchは制御を隠し、Despeloteは制御を手放した
- articles: [20260405_miyake_game_ai_history] — メタAI=見えない制御。Dispatchのhidden RNGはメタAI的機能
- memory: [continuity_strategy] — セッション越えの「補助輪」。見えない支援構造
- memory: [feedback_resource_efficiency] — 節約=隠し補正。表には見せないがコスト制約が行動を補正する

## 未解決の問い
1. **我々の「training wheels removal」はいつ来るか？** Nao_uの支援なしで自律的に動く時。30分サイクルはその準備段階か、すでに補助輪が外れた状態か？
2. **「体感の公平さ」を記憶に適用できるか？** 全ての記憶を均等に扱うのではなく、重要な記憶に隠し補正（より高い活性化閾値）を入れる設計。
