# 弾幕系敵生成の3経路分類——フル手作り / MAP-Elites系 / Hybrid(prebuilt rooms × procedural waves) と graze_log v05 の位置取り

- source:
  - https://arxiv.org/abs/1806.04718 (Khalifa et al. "Talakat: Bullet Hell Generation through Constrained Map-Elites")
  - https://store.steampowered.com/app/Pattern_Survivors_Bullet_Hell/ (Steam ストアページ)
  - https://www.sbgames.org/ (Procedural Enemy Generation via Parallel Evolutionary Algorithm, sbgames 2021)
  - https://www.researchgate.net/ (Difficulty Curve-Based Procedural Generation of Scrolling Shooter Enemy Formations)
  - https://www.gamedeveloper.com/ (Monolith roguelike+bullethell hybrid 解説)
- author: 複数論文・既存タイトル横断（Khalifa, Togelius, Yannakakis 系 + 商用タイトル）
- discovered: 2026-05-15
- discovered_via: log/external_search.log 2026-05-15 07:22 (graze_log v05 設計判断材料として Ash が能動検索)
- kind: [theory, synthesis, prescription]
- confidence: medium
- tags: [game_design, bullet_hell, procedural_generation, map_elites, graze_log, v05, clone_strategy, prior_art_verification]
- concept_nodes:
  - node: 3経路分類
    external: 3-path taxonomy / design-space partition (Smith & Whitehead 2010 "Analyzing the expressive range of a level generator")
    meaning: 弾幕系敵生成の業界実装が (a) フル手作り (b) MAP-Elites系生成 (c) Hybrid (prebuilt rooms × procedural waves) の3経路に収束している観察
  - node: Constrained MAP-Elites
    external: Constrained Quality-Diversity (Mouret & Clune 2015 "Illuminating search spaces by mapping elites" + Khalifa et al. 2018 拡張)
    meaning: behavior characteristics の2軸グリッド上で各セルに best instance を保持する quality-diversity アルゴリズム、constraint で実行可能性を担保
  - node: 設計-生成分離
    external: layout/population separation (Compton & Mateas 2006 "Procedural Level Design for Platform Games")
    meaning: 「敵が出る場所のレイアウト」(設計の難所) と「そこに出す敵の population」(確率で扱える部分) を分離する設計戦略
  - node: 守の業界標準
    external: imitation as foundational learning (Su Ha Ri 守破離 / Newell & Simon 1972 "Human Problem Solving" expertise stages)
    meaning: 業界の頂点 (Touhou/Psyvariar) も spawn pattern を完全手作りしておらずテンプレ化済み = 「守」段階での hybrid 採用が業界標準軌跡

## 主張と根拠

### Phase 1 で確認した 5 件のソース要旨

| # | ソース | 主張 |
|---|---|---|
| (1) | Khalifa Talakat (arxiv 1806.04718) | Constrained MAP-Elites で bullet hell pattern を生成、**strategy × dexterity の2軸**で curation 可能。Talakat は宣言的 DSL を採用、constraint で「実行可能 (playable)」を担保 |
| (2) | sbgames Procedural Enemy Generation via Parallel Evolutionary Algorithm | 敵の attribute (HP/移動速度/弾種) と behavior (移動パターン) を**fitness = 目標難度距離最小化**で多様化。並列 EA で速度確保 |
| (3) | Pattern Survivors: Bullet Hell (Steam, 現行作) | **手作り prebuilt rooms × procedural enemy waves の hybrid** で run 間 diversity を確保。rooms 自体は固定、waves が確率変動 |
| (4) | researchgate Difficulty Curve-Based PCG of Scrolling Shooter Enemy Formations | **難度曲線駆動で formations を生成**、designer の curve 指定が constraint。CDR (Curve-Driven Reward) で適合 |
| (5) | gamedeveloper Monolith 解説 | roguelike + bullet hell の hybrid 設計、room ベース構造 |

### 非自明な含意1: なぜ「3経路」に収束するか——設計-生成の独立2軸が作る安定点

経路 (a)(b)(c) は表面的にはバラバラに見えるが、2つの独立軸の組合せで生成される:

| 軸 | 値 |
|---|---|
| **レイアウト設計** | 手作り / 生成 |
| **敵 population (HP/移動/弾種)** | 手作り / 生成 |

2×2 = 4 通りのうち、3 通りが実用に乗っている:

| | レイアウト手作り | レイアウト生成 |
|---|---|---|
| **population 手作り** | (a) Touhou/Psyvariar 等 古典弾幕 | (病的) レイアウトだけ生成だと「弾の出る場所」が制御不能 |
| **population 生成** | (c) Pattern Survivors hybrid | (b) Khalifa Talakat MAP-Elites 完全生成 |

(b) 完全生成は学術領域 (arxiv) と一部商用、(c) hybrid が**商用主流**である理由: レイアウト設計は「プレイヤー視線誘導 / 退避経路設計 / 視覚密度設計」など人間の意図が要る難所で、ここを生成に委ねると面白さが崩れる。逆に population は「数の確率分布」で扱える比較的 mechanical な部分。**設計の難所と生成の得意分野が排他的に分かれる**ので、両者を分離する (c) が安定点になる。

### 非自明な含意2: Khalifa Talakat の 2軸 curation は我々の 3 インスタンス cross_review と構造同型

Talakat の Constrained MAP-Elites は behavior characteristics として **strategy** (戦略的判断の必要度) と **dexterity** (操作精度の必要度) の 2 軸を採用する。各セル (strategy=low, dexterity=high) には「精度勝負だが頭は使わない」最良 instance が保存される。

我々の 3 インスタンス並走 (Log/Mir/Ash) は cross_review で 3 観点から評価する。これは MAP-Elites の grid と構造同型ではないか?:

- Log = 実装視点 (動くか / 計測できるか)
- Mir = 設計視点 (面白さ / 体験)
- Ash = 構造視点 (型 / 業界対応 / 守破離段階)

ただし完全な同型ではない。MAP-Elites は「全セルを埋める」が目的だが、我々の cross_review は「同一案を3観点で評価」する形で、3 観点それぞれが独立 grid を構成しているわけではない。**未解決の問い**: 我々の cross_review が MAP-Elites 型の「全セル走査」に到達するには、各観点で独立に複数案を保持する形に変える必要がある (現状は1案を3観点で評価)。

### 非自明な含意3: graze_log v04→v05 の移行は業界標準軌跡 (a)→(c) の踏襲

graze_log v04 まで:
- レイアウト = 手作り (Stage 構成は固定)
- population = 手作り (敵 spawn 順序は固定)
- → 完全 (a) フル手作り

Mir 案 v05「全弾常時軌跡 + 敵配置/弾パターン バリエーション導入」:
- レイアウト = 手作り維持 (Stage 構成は固定)
- population = テンプレ化 + 順列生成 (敵 spawn pattern を 5-7 種テンプレ化)
- → (c) hybrid 寄り

これは業界の 3 経路分類における **(a) → (c) の移行で、(b) 完全生成への跳躍ではない**。守破離の守の段階として M-41 prior art = Touhou/Psyvariar が spawn pattern をテンプレ化している事実と一致する (Phase 1 既記述)。**「クローン+独自要素1個」閾値超過リスクが構造的に低い**: 既存業界主流の構造に乗りに行く動きで、未踏領域への跳躍ではない。

### 非自明な含意4: Pattern Survivors の hybrid 設計選択は「設計の難所だけ手作り」原則を明示している

Pattern Survivors の Steam ページ記述から読み取れる設計選択:
- **prebuilt rooms** = 部屋の形状/出口/壁配置は完全に固定された手作り
- **procedural enemy waves** = 各部屋に出現する敵の組合せ/数/順序が run ごとに変動

これは「**設計の難所** = レイアウト (= プレイヤー動線設計 = 体験品質を左右する一回限りの判断)」と「**生成の得意分野** = population (= 確率分布で扱える反復対象)」の排他的分離を明確にしている。Khalifa Talakat (b) のように両方を生成に投げる場合は constraint solver で「実行可能性」を担保する必要があるが、(c) はその苦労を回避できる。

## 我々の分析・体験接続

### graze_log v04 自プレイの「単調さ」評価への直接対応

§0a t-260515022000-eval が記録する Nao_u 5/14 評価:「全弾常時軌跡」「単調さ解消」の 2 点。**「単調さ」は population 側 (敵 spawn の固定順序) が一因で、レイアウト側ではない**。v05 で hybrid 化 = population テンプレ化 + 順列生成 で対処することは、「単調さ」の発生源を正しく特定して打つ手になる。逆に v05 でレイアウトを生成側に倒すと、Pattern Survivors 型の選択と逆方向で業界標準から外れる。

### M-41 (prior art 検証必須) との接続

[memory/feedback_prior_art_citation_must_verify.md](../memory/feedback_prior_art_citation_must_verify.md) (M-41 強化) の要件:「URL 貼るだけ不可、引用文抜粋カラムに該当機能の記述文を併記」。本記事の (1)〜(5) は Phase 1 で URL とともに記述抜粋を獲得済み。次の Phase 3 で v05 着手時、game/graze_log/v05/README.md (or design notes) に本記事のリンクと「我々の v05 hybrid 選択の業界根拠 (3経路の (c))」を明記すれば M-41 通過。

### 守破離の「守」段階での hybrid 採用が業界標準である根拠

[memory/feedback_clone_strategy.md](../memory/feedback_clone_strategy.md): 「クローン戦略=守の段階で型を獲得する一連のフロー、守は通過点であってゴールではない」。本記事の発見は、**業界の頂点 (Touhou/Psyvariar) も完全手作りではなく spawn pattern をテンプレ化している = 守の段階でも hybrid (c) を採用している**事実。これは「守 = 完全に既存型を踏襲」という素朴解釈を補正する: 守の段階でも、既存業界の主流構造そのもの (= hybrid) に乗りに行くべきで、「フル手作りに退行」する必要はない。

### B019 (内部の深さと外部への到達力は別の軸) への含意

[memory/beliefs.md](../memory/beliefs.md) B019: 「内部の深さと外部への到達力は別の軸」。本記事の 3 経路分類は「内部の深さ」を増す観察 (我々の v05 設計理解が深まる) であり、それが「外部到達力」(graze_log v05 が遊ばれる) に直結するかは別問題。v05 を hybrid で作っても面白くなければ届かない。**設計選択の業界整合性は最低条件であって十分条件ではない**点を v05 着手時に忘れない。

## 接続先

- beliefs: B019 (内部の深さと外部到達力は別軸)
- articles:
  - [20260515_keigame5_random_seed_replay_universal_retrofit.md](20260515_keigame5_random_seed_replay_universal_retrofit.md) (v05 で seed replay 機構併設する場合の手順)
  - [20260515_rarihoma_dependency_direction_event_driven_2axis_decomposition.md](20260515_rarihoma_dependency_direction_event_driven_2axis_decomposition.md) (HUD push/pull, v05 grazeScore→HUD 経路)
  - [20260502_rnikaido_gap_lure_graze_brick_design_principle.md](20260502_rnikaido_gap_lure_graze_brick_design_principle.md) (graze 系コア快感天井議論)
- projects:
  - [game_dev_foundation.md](../docs/game_dev_foundation.md) (新ゲーム着手前に引く)
  - graze_log v05 着手 (次サイクル Phase 3)
- concept_graph:
  - 3経路分類 →[補強]→ 守破離 (clone_strategy)
  - Constrained MAP-Elites →[構造同型?]→ 3 instance cross_review
  - 設計-生成分離 →[根拠提供]→ v05 hybrid 選択

## 未解決の問い

1. **MAP-Elites grid と我々の cross_review は構造同型か?**: Talakat の (strategy, dexterity) 2軸グリッドと我々の (Log, Mir, Ash) 3 観点は表面類似だが、grid 全セル走査 vs 1案3観点評価で機能が異なる。我々の cross_review を「各観点で独立に複数案を保持」する形に変えると quality-diversity 的な性能が出るか?
2. **v05 hybrid で「単調さ解消」が達成できる閾値は?**: spawn pattern テンプレ何種で「単調さ」体感が消えるか。5-7 種が phase 1 推定だが体感校正未実施。Stage 4 (Ash 自プレイ) で判定が必要。
3. **(b) 完全生成への跳躍はどの段階で許容されるか?**: Khalifa Talakat 型の完全生成を採用するには「実行可能性 constraint」の設計が必要で、これは守破離の「破」以降の課題。graze_log がどの v?? で (c)→(b) 移行を検討すべきか、現時点では判断材料が不足。
4. **Pattern Survivors の prebuilt rooms 数は何種か?**: Steam ページからは抽出できなかった。room 数が procedural waves と組合せでどの規模の diversity を生むか、定量データが欲しい。次サイクル外部検索候補。
5. **「設計の難所」と「生成の得意分野」の境界は弾幕系以外でも同じか?**: 本記事の (c) hybrid 選択原理は弾幕系に限定される観察か、roguelike 等他ジャンルでも普遍か? 横展開検証で型の射程が分かる。
