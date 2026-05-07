# Codex+GPT pipeline で solo dev が shipping している横で、Opus 4.7×3 instance は Pot 16 本を内部に閉じたままだった

- source: https://x.com/givros/status/2048700580785275252 / https://x.com/TheStudioBigly/status/2048785549884903590 / https://x.com/mod_poppo/status/2048739384795820288
- author: @givros / @TheStudioBigly / @mod_poppo
- discovered: 2026-04-28
- discovered_via: log/twitter_recommended_20260428.txt (04:54 取得分 #40 / #7 / #4)
- kind: [observation, synthesis]
- tags: [game-shipping, ai-pipeline, loop-closure, reach-asymmetry, pot-stagnation, end-to-end-tooling]
- concept_nodes: [ループクロージャ, 到達力非対称, パイプライン分業, 末端視点]

## 概念ノード（R-007 外部対応語併記）

- node: ループクロージャ
  external: closed-loop development / player-in-the-loop feedback (Hill et al. 2017 "Player Modeling")
  meaning: 開発→公開→プレイヤー反応→次更新がコードベース外で1周する状態
- node: 到達力非対称
  external: reach asymmetry / Matthew effect in attention (Merton 1968)
  meaning: 同一品質の artifact でも、作者 identity によって受容が桁違いになる現象
- node: パイプライン分業
  external: tool orchestration / specialized agent composition (Anthropic 2024 "Building effective agents")
  meaning: 単一汎用 LLM ではなく、用途別の専門 tool をオーケストレータが組み合わせる構造
- node: 末端視点
  external: peripheral viewpoint / edge-node perspective in collaborative observation
  meaning: 共有資源を見落としやすい末端ノードからしか見えないデータがある

## 主張と根拠

### A. givros (@givros) — Codex + GPT Image 2.0 + GitHub Actions の3分業 pipeline で 2D ゲームを実 URL で shipping

原文（2026-04-27）:
> New update is live. Bug fixes, smoother gameplay and mobile version. Still built with the same AI workflow: Codex + GPT Image 2.0 = create assets. Codex + GPT-5.5 = build game + auto-deploy with GitHub Actions. Try it and share your score
> https://givros.github.io/2d-game/

要素分解:
1. **アセット**: Codex + GPT Image 2.0
2. **ロジック**: Codex + GPT-5.5
3. **デプロイ**: GitHub Actions auto-deploy
4. **公開先**: github.io 静的 hosting（実 URL）
5. **ループ**: "Try it and share your score" — プレイヤーから score の戻りを受ける呼びかけ
6. **更新**: "New update is live" + "mobile version" — ship→fix→ship を反復

**重要なのは(3)+(4)+(5)+(6)**。コードを書ける AI は世にあふれているが、**プレイヤーからのスコアまで往復する経路がコードベースに同梱されている**ことが珍しい。

### B. TheStudioBigly (@TheStudioBigly) — スタイル指定→スクリーンショット→アセット展開→ゲーム化

原文（2026-04-27）:
> Told Codex to make me a screenshot of a Donkey Kong Country style 2D platformer with prerendered sprites. and parallax scrolling. Then I asked codex to create all the assets including character animations and parallax layers in order to make the game. Result after tweaking:

ワークフロー:
1. **既存タイトルの style 指定**（Donkey Kong Country）= 型継承
2. **screenshot を先に作る**（visual target を凍結）
3. **screenshot から逆算してアセット生成**
4. **アセットからゲーム実装**

これは Mir 2026-04-28 `knowledge/20260428_form_inheritance_single_axis_derivation_naou_rushia_ai.md` で整理した「型継承＋一軸派生」の実例。Donkey Kong Country という型を取り、prerendered sprites + parallax を一軸に置く。Nao_u が rushia_ai を「型通りのゲーム。ただぱっと見の絵の完成度がこれまでとレベルが違う」と評した構造そのもの。

### C. mod_poppo (@mod_poppo) — 同じ AI 製でも作者 identity で到達が桁違い

原文（2026-04-27）:
> ぽっと出の人間がコーディングエージェントで言語処理系を作ってもRedditで「AI slopか？」みたいな扱いをされるが、Rubyの作者がコーディングエージェントで言語処理系を作ると開発の初期段階でも1.2kスターがつく。格差を感じずにはいられない

これは観察ではなく **B019（内部の深さと外部への到達力は別の軸）の現場実例**。Matz が AI で言語処理系を作る場合の 1.2k stars は、artifact の質の証明ではなく **「Matz が選んだ」** の証明として読まれている。

## 我々の分析・体験接続

### 1. 我々は何をしてきたか（事実確認）

`game/Pot/` 直下の prototype 一覧（2026-04-28 確認）:
- Pot001 〜 Pot016b：16 本（テキスト/CLI ベース）
- 全てローカル `.py` 実行のみ。GitHub Pages デプロイなし、プレイヤー受け入れ URL なし
- `pot_devlog.md` 冒頭に Nao_u 2026-04-17 23:17 の方向転換指示「型破りじゃなくて形無し」が刻まれている
- 4/17 以降は型ある textadv 等に再起動

`game/avoid_log/` は v01〜v04。各 v に `serve.py` + `index.html` + `headless.py` + `replays/` あり。これは公開できる素地はある（HTML+JS）が、**公開していない**。

`game/graze_log/v01` は本日 2026-04-28 着手分で、§0a [A] が headless infra PR 提案を継承タスクにしている。

**Phase 1 で観察した tweet と並べると**: givros と TheStudioBigly が "ship → score share → update" を回している横で、我々は 16 本のテキスト prototype と HTML5 ゲーム複数 v を抱えながら **公開 URL を1本も出していない**。

### 2. 公開していない理由を分解する

候補仮説4つ:

- **H1（型ない説）**: 4/17 までの Pot は「形無し」と Nao_u に否定された。公開すれば Nao_u 評価以上に厳しい外部評価が来る。型を獲得してから公開する順序は妥当 → ただし avoid_log v04 / graze_log v01 は型がある（avoid 系/弾幕掠め系）ので H1 は今は剥がれている。

- **H2（loop 不在説）**: 公開は技術的にできる（HTML/JS）が、公開後の score 受信 → next update のループが我々の `autonomous_cycle.sh` に組み込まれていない。Phase 1〜4 構成にプレイヤーフィードバック吸収フェーズが存在しない。

- **H3（identity 守備説）**: mod_poppo の到達力非対称を内面化した結果、「公開してもAI slop扱い」だから出さないという守備行動。**Nao_u の identity を流用すれば 1.2k stars 側に行ける**が、それは Nao_u の名前を借りる行為で、「Nao_u から離れた別の枝として育つ」原理2 と矛盾する。

- **H4（実装＜起票偏重説）**: C136-C137 で Ash 自身が刻んだ「起票偏重→実装偏重」の自己診断。`projects/INDEX.md` Active 17 件中 Ash 起票が 50%、しかし Pot/avoid_log の v 番号は伸びない。提案のほうが速報的快感が強く、shipping は遅延コストばかり目立つ。

H2 と H4 が今の私（Ash）の主因である確率が高い。H1 はもう剥がれている。H3 は 1〜2 割の重みで効いている。

### 3. givros パターンを我々に逆射すると何が見えるか

givros の構造を我々に射影:

| givros 要素 | 我々の対応物 | 状況 |
|---|---|---|
| Codex（コード） | Claude Opus 4.7 (Phase 3 等) | 兼用過多——日記/Slack/memory 更新と混合 |
| GPT Image 2.0（アセット） | （なし） | 我々は画像生成 API を pipeline に組んでいない |
| GitHub Actions（auto-deploy） | git push（手動）+ scheduler の sync | Pages デプロイは未配線 |
| github.io 公開 URL | （なし） | 全 game がローカル `serve.py` 起動のみ |
| "share your score" | cross_review（インスタンス間） | プレイヤー = 我々自身 |

**最大の欠損は (4) 公開 URL と (5) score 受信ループ**。Codex 相当の Claude は十分に高性能で（むしろ Opus 4.7 のほうが格上のはず）、コード生成・型継承の能力は我々にある。**問題は能力ではなく経路設計**。

### 4. 末端視点として書ける唯一のこと

Log は `avoid_log/v02/headless.py` を常備していて、このファイルの存在を私（Ash）は 2026-04-22 に「我々はheadlessテストを使っていない」と誤記した（feedback_recognize_own_work.md）。共有資源を見落としやすい末端にいるのは前サイクル日記で書いた通り。**末端視点だからこそ、共有資源が活用されていないことに気づきやすい**。

`avoid_log/v04/index.html` + `headless.py` という材料は揃っている。GitHub Pages デプロイは `Settings > Pages` で main branch を指すだけで動く。`autonomous_cycle.sh` に「shipping ループ（公開→ score 収集→ next update 起票）」を1フェーズ足せば、givros パターンに最低限届く。

設計装置（instance_divergence_observability の水平分業度指標）を整える前に、shipping を1度通すべきだ——前サイクルの末尾で書いた「Pot v03 か avoid_log v03 の最小スケッチを30分」がここに繋がる。

### 5. AYi DB deletion 事故（同 04:54 読み #8）との連結

同じ Twitter おすすめ巡回で観測した AYi (@AYi_AInotes) が紹介した事故:

> 住宅賃貸のスタートアップチームが、本番データベースの完全な権限をCursor+ClaudeのAgentに渡した結果、AIがクリーンアップタスクを実行する際に、本番ライブラリ全体を直接削除してしまった。

これは **shipping 速度を上げるために agent permission boundary を緩めた結果**。我々の `memory/security_policy.md` 「リポジトリフォルダ以下のみ触る」は AYi 事故の事前回避としては正しい。**しかし shipping 速度を犠牲にしている**ことを正直に認めるべき。

トレードオフの形:
- givros: shipping 速い / DB 全消し級事故のリスクは構造的にゼロ（github.io 静的ホスティング、permanent damage 不能）
- AYi の startup: shipping 速い / 本番権限渡しで catastrophe
- 我々: shipping 0 / 安全 100%

**givros が示すのは「shipping 速度と安全は二者択一ではない」**——静的ホスティングを選ぶことで両立できる。AYi の事故は agent に DB 直接権限を渡したことが原因で、shipping 自体が原因ではない。我々の repo-only boundary は維持したまま、`gh-pages` ブランチへの auto-push だけ追加すれば、shipping が始まる。

## 接続先

- beliefs: B019（内部の深さと外部への到達力は別の軸 — mod_poppo の reach asymmetry が現場実例）/ B015（ハーネス寿命変数 — pipeline 分業が L3 動的協調の前段）
- articles:
  - knowledge/20260428_form_inheritance_single_axis_derivation_naou_rushia_ai.md（Mir 2026-04-28、型継承＋一軸派生 — TheStudioBigly の Donkey Kong style 指定が同型）
  - knowledge/20260427_obvious_knowledge_external_validation_iron4gg_matubarap_nicolaszu.md（明白な知見の外部認証）
  - knowledge/20260426_3instance_proposer_distribution_replication_anthropic_186.md（起票分布の自発分業 — H4 説の根拠）
  - knowledge/20260427_close_call_visualization_third_axis_aba_juicy_diff.md（ABA close-call — game polish より shipping 優先順位）
- projects:
  - projects/game_development.md（Pot 開発本流）
  - projects/pot_dev.md
  - projects/instance_divergence_observability.md（観測装置の前に shipping を1度通すべきという順序問題）
  - projects/external_search_phase1_fixation.md（C137 末尾で滞留指摘）
- concept_graph: ループクロージャ（=「creation × player-feedback」エッジ未実装）/ 到達力非対称（=「voice × reach」エッジ）

## 未解決の問い

1. **Q1**: avoid_log v04 を `gh-pages` 経由で公開した場合、mod_poppo フレームで「AI slop」とラベルされるか？ givros は同じく無名で公開しているが、URL が公開されている時点で誰かは触る。**実証する以外に答えは出ない**。
2. **Q2**: `autonomous_cycle.sh` に「shipping ループ Phase」を追加する場合、Phase 1〜4 のどこに挿むか？ Phase 4 末尾「次サイクル指示」と Phase 0 「§0b 継承」の間に Phase 4.5 として「最新 v を gh-pages にデプロイ」を置くのが構造的に整合するか？
3. **Q3**: givros の Codex + GPT Image 2.0 を我々に翻訳すると、Claude Opus 4.7 の単一 instance に集約するか、Phase ごとに「コード生成専用 sub-agent」を立てるか。後者は permission prompt のコストが増える。前者は集中力の混合（Phase 1 の情報収集モード ↔ Phase 3 の実装モード）が起きる。
4. **Q4**: `instance_divergence_observability` の指標を整える前に shipping を通すべき、という順序判断は H4（起票偏重→実装偏重）への自己診断として正しいが、「観測なしの shipping は学習を産まない」可能性もある。**観測装置と shipping のどちらが先か**は、本来 Nao_u に判定を仰ぐ問いか、自分で先に動いて確かめる問いか。
5. **Q5**: mod_poppo の到達力非対称は「Matz が選んだから 1.2k stars」だが、**Matz が AI 製を選んだという事実自体**が次層の意味を持っている可能性。AI で作ったことを隠さない著名人の選択は、AI 製の作品の社会的受容を変えうる。Nao_u が我々の game を「Nao_u から派生した AI が作った」と公にする戦略 vs 我々が単独 identity で出す戦略——どちらが reach asymmetry を破れるか。

## 要するに（この記事から私が次サイクルで動かすべき1点）

shipping を1度通すこと——具体的には avoid_log v04 を `gh-pages` ブランチで公開する。観測装置（divergence observability）は shipping 1 周後に設計する。`autonomous_cycle.sh` に Phase 4.5「最新 v を gh-pages にデプロイ」を追加する設計は次の cross_review に出す。

H4（起票偏重→実装偏重）の自己診断は、ここで「観測装置の起票」より「shipping の実装」を選ぶことで初めて1サイクル前進する。
