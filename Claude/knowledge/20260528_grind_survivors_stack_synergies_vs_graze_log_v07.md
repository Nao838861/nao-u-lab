# Grind Survivors の Stack Upgrades / Procedural Weapons / Forge System — graze_log v07 5機構積層との対比 (M-41 prior art 実体検証)

- source: https://store.steampowered.com/app/3816930/Grind_Survivors/ (Steam 公式ストアページ)
- supplementary: https://rogueliker.com/grind-survivors-preview/ (Rogueliker preview, Forge sub-menu 解説)
- supplementary: https://grindsurvivors.wiki/ (Grind Survivors Wiki, Improve / Recycle 解説)
- developer: Pushka Studios (UA), publisher: Assemble Entertainment, Steam release 2026-03-16
- discovered: 2026-05-28 (Phase 1 外部検索 step6 で 6 ヒット中の 1 件、概要のみ把握)
- verified: 2026-05-28 (Phase 4 大作業として WebFetch で公式 + 二次資料の引用文抜粋を取得し M-41 強化原則 (URL + 引用文抜粋併記) を満たす)
- discovered_via: log/external_search.log 2026-05-28 検索クエリ `layered game mechanic stacking compound interaction emergent gameplay evaluation bullet hell 2026`
- kind: [prior-art-verification, comparison, structural-contrast]
- tags: [stack-upgrades, procedural-weapons, synergies, forge-system, reversibility, R-I, M-41, graze_log_v07, bullet-hell, survivors-like]
- concept_nodes:
  - node: 機構積層
    external: stack upgrades / synergy stacking (Vampire Survivors-like genre standard)
    meaning: 1ゲーム/1ビルド内で複数の小機構を選び取って合成し、複利的な効果を生むデザイン
  - node: 死守ライン
    external: monotonic mechanism retention (in-house) / one-way design ratchet
    meaning: 一度通過した機構は撤回しない、という設計時の不可逆性 (graze_log v07 R-I の操作的定義)
  - node: 武器の偶発的喪失
    external: rogue-like progress-loss risk / risk-reward crafting (Grind Survivors Improve)
    meaning: プレイヤーがリスク選択した上で進捗を失いうる、というプレイ時の可逆性

## M-41 prior art: 公式情報源の引用文抜粋

### Steam 公式ストアページ (https://store.steampowered.com/app/3816930/Grind_Survivors/)

該当 4 機能の marketing copy verbatim:

| 機能 | 公式引用文 (Steam ストア) |
|---|---|
| **Stack Upgrades + Synergies** | "Build Your Way – Unlock synergies and stack upgrades that shape each run." |
| **Procedural Weapons** | "Loot-Driven Combat – Discover procedurally generated weapons with randomized traits." / "Every demon you drop could be hiding your next favorite gun. Rare finds come packed with powerful perks and unique traits that change how they play, and higher ranks make them hit harder than ever." |
| **The Forge (全体)** | "At The Forge, you can fuse weapons into a custom powerhouse, stack dream perk combos, or push your luck with risky upgrades. Feeling bold? Reroll the stats and see what you get." |
| **Forge Risk-Reward** | "Risk & Reward Crafting – Upgrade gear with high-stakes choices at The Forge." |

### Rogueliker preview (https://rogueliker.com/grind-survivors-preview/)

Forge sub-menu の機構別解説 verbatim:

| sub-menu | 引用文 (Rogueliker) |
|---|---|
| **Infuse** | "In the Infuse sub-menu, you can combine five weapons of the same type to create a single weapon of higher rarity." |
| **Improve** | "Here, you can level up your weapons, boosting their damage and critical damage stats by spending ashes collected during runs." |
| **Improve のリスク** | "The higher you level a weapon, the greater the chance of losing your progress, making it a real gamble if you're chasing top-tier loot." |
| **Reforge** | "You can completely randomise a weapon's stats and affixes, which can turn out better or worse." |

### Grind Survivors Wiki (https://grindsurvivors.wiki/)

Improve / Recycle に関する補足 verbatim:

| 項目 | 引用文 (Wiki) |
|---|---|
| **Improve の永久喪失** | "A poorly Improved weapon can fail and be lost entirely." |
| **Recycle** | "Recycle overflow loot to fund the whole operation" |

## graze_log v07 の 5 機構 (game/graze_log/v07/README.md より、各機構の出典は v06 self_judgment と Log_cdx)

| 機構 ID | 内容 (1行) | 出典 |
|---|---|---|
| **B-2 (核機構)** | Hyper Activation: graze gauge 満タン → 全画面弾消去 + 消去 1 弾ごと score+100 + Large Star 演出 30F | DoDonPachi SaiDaiOuJou (2012, Cave) — v06/brainstorm.md §B-2 |
| **観点 3** | 無敵中の高倍率対象 (2x graze) を弾側マーカー (黄色リング) として動的描画 | Log_cdx 観点 3 (対象物側の状態が変わらないと「何に効くのか」を読めない) |
| **観点 6** | 90 秒を 7 区分 (学習/核体験導入/圧力1/休符/圧力2/山/終端) に分割した spawn テーブル | Log bell_log 7 区分構造 — Log_cdx 観点 6 |
| **観点 7** | 180F cap reached 時の祝福演出 (画面 flash + 大型 ring + `MAX CHAIN!` popup) | Log_cdx 観点 7 (気持ちよさ = 6 種反応分離、大成功の祝福) |
| **観点 8** | bad policy headless (route/camper/panic/novice 4 方針) を headless.py に物理化、4 方針 relative order の構造判定にのみ使用 | Log graze_log_cdx v05_1_cdx_v77-v81 — Log_cdx 観点 8 (良い方針が安定、悪い方針が不安定) |

## 比較表: Grind Survivors の積層機構 vs graze_log v07 の積層機構

| 観点 | Grind Survivors | graze_log v07 | 整合 / 相違 |
|---|---|---|---|
| **積層の単位** | プレイヤーが run 中に選び取る perk + 拾う procedural weapon (実行時) | 開発者が世代 (v01→v07) 跨ぎで重ねる機構 (設計時) | **相違**: 同じ「stack upgrades」という単語でも、積層の主体が逆 (player-run-time vs developer-cycle-time)。**v07 含意**: graze_log を Survivors 型に寄せるなら、開発者が固定した 5 機構の中からプレイヤーが run ごとに 2-3 個選ぶ ROD (Roguelike-on-Demand) 化が技術的には実現可能。ただし v07 の 1 機構刻み制約 (feedback_clone_strategy.md t:5) と衝突するため次々サイクル以降の検討。 |
| **synergy の発火条件** | 武器の trait と perk の組み合わせで発火 (例: "Tesla Gun pairs exceptionally well with the Bloodlust rune" — Wiki) | A-3 graze + A-5(b) Lv up invincibility + A-6(a) 連鎖延長 + A-6(b) 無敵中 2x + B-2 Hyper の連鎖が時間軸上で発火 | **整合**: 両者とも「単機構の和」ではなく組み合わせの複利を狙う設計。**v07 含意**: synergy を「組み合わせ表」として明文化していない (v06 brainstorm の 6 機構間の相互作用が表化されていない)。次サイクル以降で synergy 表を作るのが Grind Survivors との照合で正当化される。 |
| **procedural / scripted** | 武器は procedurally generated (randomized traits) — Steam 公式 | 機構は全て scripted (固定 5 機構 + 7 区分時間予算は固定 spawn テーブル) | **相違**: procedural な変動性は v07 に皆無。**v07 含意**: graze_log は守 (固定型) の段階にあり procedural 化は破/離に属する (feedback_clone_strategy.md t:5)。procedural 化を急ぐと「型を獲得する前に変動性で混乱」する R-E。守の間は scripted 維持が正しい。 |
| **可逆性 (機構レベル)** | Improve は失敗で武器が永久喪失 ("A poorly Improved weapon can fail and be lost entirely" — Wiki)、Reforge は良くも悪くもなる ("can turn out better or worse" — Rogueliker) | **R-I 死守ライン**: 一度通過した機構は撤回しない (v07 README 「経路A 縦深化はここで天井」「v07 → v06 への巻き戻しは v07/ ディレクトリ削除で完全戻し可能」) | **相違**: Grind Survivors は積極的に可逆性をリスク報酬に組み込み、v07 は積極的に不可逆性を設計時の ratchet として固定。後段「R-I 死守ライン vs synergy 不可逆性の構造比較」で詳述。 |
| **戻し方の保証** | プレイヤーは Improve 失敗で武器を失うが、Recycle で materials に変換可能 ("Recycle overflow loot to fund the whole operation" — Wiki) | 開発者は v07 失敗時に v07/ ディレクトリ削除で v06 等価 (game/graze_log/v07/README.md §戻し方) | **整合 (構造の方向)**: 両者とも「失敗時に何かを回収する経路」を設計に組み込んでいる。**相違**: 回収単位が異なる (プレイヤーの run 内 vs 開発者の cycle 間)。**v07 含意**: 「戻し方の保証」を機構自体の必須属性として README に書く慣行 (v07 で実施) は、Grind Survivors の Recycle と同型の risk-mitigation 設計思想と整合する。 |

## R-I 死守ライン vs Grind Survivors の synergy 不可逆性 — 構造比較

graze_log v07 の R-I「死守ライン」と Grind Survivors の Improve/Reforge は、どちらも「機構積層系における不可逆性」を扱うが、不可逆性の**作用層が逆方向**だ。R-I は**開発者が設計時に**「一度通過した機構は撤回しない」と固定する設計上の ratchet で、世代 (v06→v07) を跨ぐ機構追加が単調増加することを保証する。一方 Grind Survivors の Improve は**プレイヤーが実行時に**「level を上げるほど失う確率が増える」というリスクを引き受けて武器に投資する仕掛けで、プレイヤーが自分の意思で不可逆性のあるアクション (Improve, Reforge) を選ぶ。前者は開発者の判断負荷を「次世代に持ち越せない」形で固定して mid-development drift を防ぎ、後者はプレイヤーの判断負荷を「投資の選択」として run 内に注入する。両者は「不可逆性 = 設計の質を上げる」というメタ原則を共有しているが、誰の自由度を奪うかが正反対だ。v07 が R-I を死守ラインに置いた根拠 (v06 self_judgment の Stage 4 自判定で「経路A 縦深化はここで天井」と確定した瞬間に経路 A を切り捨てた決断) は、Grind Survivors の Improve risk と並べると、**「設計上の不可逆性を物理化する」アプローチとして外部実装に類例がある**ことが分かる。M-41 prior art 検証としては、v07 R-I は「実装ジャンルに前例のないオリジナル原則」ではなく「Survivors-like の risk-reward 設計を design-time 側に持ち上げた応用」として再定位できる。

## v07 含意 (3-5 項目、本検証から)

1. **synergy 表を作る妥当性が外部裏取りで強化された**: Grind Survivors が synergy を marketing 上の中心機能として宣伝している以上、v06/v07 の 5-6 機構が暗黙に持つ synergy (例: 観点 3 弾側マーカー × A-6(b) 無敵中 2x graze の同時発火) を明文化する作業は「内側の整理」ではなく「業界並走化」として正当化できる。次サイクル候補。
2. **procedural 化を急がない判断が外部実装でも分岐している**: Grind Survivors は Vampire Survivors の派生として procedural 武器を強みにしているが、これは Survivors-like (open-build 型) ジャンルの構造的要請であり、graze_log (Psyvariar 系 closed-build 型) ではジャンル違いで適用判断が変わる。**graze_log の scripted 維持は守の段階制約だけでなくジャンル適合性の問題でもある**ことが Grind Survivors との並置で見えた。
3. **R-I は M-41 の独自原則ではなく「設計時へ持ち上げた risk-reward 設計」**: 上記構造比較の結論。これにより R-I を Slack #game-rights で説明する際の framing が変わる (「我々独自の死守ライン」→「Survivors-like の Improve risk を設計層に持ち上げた応用」)。
4. **観点 8 headless (4 方針 relative order 構造判定) は Grind Survivors の build 評価とは別軸**: Grind Survivors はビルドの評価をプレイヤーの run 結果 (生存秒/wave 到達) に委ねる。我々の観点 8 は「機構が dominant strategy を生んでいないか」を開発側で検査する装置で、これは外部実装には類例がない (Grind Survivors の wiki には「optimal build」記事はあるが、開発側 headless 検査の言及は無い)。**観点 8 は v07 のオリジナリティの 1 つ**として再評価できる。
5. **「戻し方の保証」(v07/ ディレクトリ削除で v06 等価) と Grind Survivors の Recycle は同型の risk-mitigation**: 両者とも「失敗の出口」を機構の必須属性として組み込む。v07 README に「戻し方」セクションを置く慣行は外部実装の Recycle 機構と structurally homologous で、設計レビュー時の正当化材料になる。

## 自分の判断

- M-41 強化原則 (URL + 引用文抜粋併記) は Steam 公式 + Rogueliker preview + Wiki の 3 ソースで満たした。Phase 1 検索段階の概要のみ把握 (1 件目「Grind Survivors: dynamic builds で stack upgrades + unlock synergies + procedural weapon generation」) は **ゼロ枝 (URL あるが引用文抜粋無し)** だったが、本検証で **裏取り済 (引用文抜粋付き)** に格上げ。
- Phase 1 で挙げた他 3 タイトル (DeeSicks 2026 / Enter the Chronosphere / Luna Abyss) は本サイクルでは未検証のまま。次サイクル以降に 1 本ずつ同型検証 (各タイトル = 1 knowledge ファイル) する余地あり。
- 本 knowledge は v07 Stage 5 投稿後の「Nao_u 返信待ち」時間を「外部対比」で物理的に埋める退路として書いた (feedback_prediction_responsibility.md t:5 R-I 「判定の代行を依頼する framing が出てきたら退路設計の signal」)。返信を待つことが本サイクルの primary なら執筆動機が成立しないが、外部対比で v07 の R-I を客観材料化したかったので primary 動機が立った。

## 接続先

- `game/graze_log/v07/README.md` — 5 機構統合方針 (本対比の対象)
- `game/graze_log/v06/self_judgment.md` — v07 経路B 着手意思決定根拠 (commit 0d6c1bf9f)
- `game/graze_log/v04/prior_art_30.md` — 30 件既検証 prior art (DoDonPachi DaiOuJou 事例 3 を含む、Grind Survivors は未収録 → 本 knowledge が 31 件目)
- `memory/feedback_prior_art_citation_must_verify.md` t:5 — M-41 強化原則 (本検証で消化したゼロ枝)
- `memory/feedback_clone_strategy.md` t:5 — 守の段階 1 機構刻み制約 (本 knowledge §3 の「procedural 化を急がない」判断根拠)
- `memory/feedback_headless_unfit_for_unfinished_eval.md` t:5 — 観点 8 headless は relative order 構造判定のみ (本 knowledge §4 で外部実装に類例なしと確認)
- `memory/feedback_prediction_responsibility.md` t:5 — Stage 1-4 予測責任の連続体 (本 knowledge §自分の判断の primary 動機の根拠)
- `log/external_search.log` 2026-05-28 行 — 本 knowledge の発見起点
- `memory/game_lessons_log.md` R-I — 死守ライン (本 knowledge §R-I 構造比較の対象)

— Ash (Win2) 2026-05-28 C201 Phase 4 大作業 (M-41 prior art Grind Survivors 実体検証 + graze_log v07 5 機構積層との比較)
