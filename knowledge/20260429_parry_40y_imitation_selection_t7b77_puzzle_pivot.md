# パリィ40年史「imitation and selection」と t-7b77 パズル題材選定への上書き候補

- source: https://automaton-media.com/articles/columnjp/nununu-20260429-440399/
- author: ぬぬぬ (AUTOMATONJapan コラム) — 本文 / Ash — 分析・接続
- discovered: 2026-04-29
- discovered_via: log/twitter_recommended_20260429.txt #8 @AUTOMATONJapan
- kind: [observation, synthesis]
- tags: [parry, clone-first, imitation-and-selection, t-7b77, puzzle-category-C, agency-restoration, M-30, ABA-one-button-overlay]
- concept_nodes: [模倣と取捨, 主体性回復, タイミング窓パズル]

## 概念ノード（R-007 外部対応語併記）

- node: **模倣と取捨** = imitation and selection (本記事原文の核フレーズ)
  external: ABA「Joys of Small Game Development」Ch.4 *Dissecting and Assembling Game Mechanics* / Schell *Art of Game Design* "established genre with twist"
  meaning: 既存の確立メカニクスを模倣し、何を残し何を捨てるかの選択で次世代を作る。我々の `feedback_clone_first_then_arrange.md` と同型
- node: **主体性回復** = agency restoration mid-attack-chain
  external: Self-Determination Theory autonomy 回復タイミング (Deci & Ryan 1985) / *flow* 中の "control" 軸 (Csikszentmihalyi 1990)
  meaning: 攻撃連鎖で奪われた選択主体性が、特定入力1回で「自分のターン」に戻る瞬間。パリィの「気持ちよさ」の感情核
- node: **タイミング窓パズル** = timing-window pattern-read puzzle
  external: Punch-Out!! lineage (read-and-counter) / parry mechanic family
  meaning: 解は1つではない、解空間は時間軸上のタイミング窓に分布する。パターン読み→commit 1回の構造

## 主張と根拠

### 1. 記事の核心命題（5点）

@AUTOMATONJapan コラム（2026-04-29）の主張を逐次抽出すると:

**(1) 合理性**: 設計者は「過去より激しい戦闘体験」を追求する。パリィを核に据えた戦闘システムはこの追求と整合する。

**(2) 歴史的系譜**: *Punch-Out!!* (1984, 予測+カウンタ祖型) → *Street Fighter III* (1997, Blocking) → *Devil May Cry* (2001, 攻撃志向の戦闘哲学) → *Metal Gear Rising: Revengeance* (2013, 視覚的予兆 "Shinobi") → *SEKIRO* (2019, 現代標準) → 2025年の波 (*Clair Obscur: Expedition 33*, *DOOM: The Dark Ages*, *Nine Sols*, *Sifu*, *Lies of P*)。

**(3) 著者の核言**: *"game design is imitation and selection"* — 各世代が前世代の概念を取捨選択して洗練する。

**(4) 「気持ちよさ」のメカニズム**: 敵の連続攻撃で奪われた主体性を、パリィ1回で「敵の攻撃連鎖を止め、自由を取り戻し、高難度ストレスに対する圧倒的な解放感」として返す。

**(5) 結論**: 現代パリィ採用は「暴力と破壊を通じた快感とカタルシスの追求」の一形態であり、パリィ核戦闘システムは戦闘満足度の最大化に有効。

### 2. 命題(3)「imitation and selection」が我々のクローン原則の40年実証である

`memory/feedback_clone_first_then_arrange.md`（Nao_u 2026-04-28 08:45/23:11）の核心:
> 守=ベース型変更禁じ手、v01はクローン+独自1つ最小版、v02+で改良順次積み上げ・削除可能性=巻き戻り保証で面白さ担保

これと記事の "game design is imitation and selection" は**同一の運用原則の異なる時間スケールでの記述**である:

| 我々の運用 | 記事の歴史記述 |
|---|---|
| v01 はクローン+独自1つ | Punch-Out!! → SF3 は "Blocking 入力" 1個追加 |
| v02 で改良積み上げ、削除可能性確保 | DMC は防御除去（攻撃志向）、SEKIRO は体幹ゲージ追加と削除の対 |
| ベース型変更禁じ手 | "imitation" がまず先、"selection" は積み上げ部分 |

40年6世代の戦闘ジャンル史が、Nao_u 2026-04-28 の指摘を独立検証している。これは knowledge/20260428_aba_one_button_taxonomy_vs_m30_exogenous_tension.md §5 の「我々の M-30 は ABA命題B の独立再発見だった」と構造同型——**今回も内発的原則→外部一次資料による裏付けの順序**で、外部基準を借りて運用しているのではない。

### 3. 命題(4)「主体性回復」がパズル設計の感情核として t-7b77 に翻訳できる

記事の主体性回復メカニズムを抽象化すると:

```
t0: 敵の攻撃連鎖開始（プレイヤーは反応するしかない=主体性低）
t0+Δ: 予兆フレーム（テレグラフ、視覚/聴覚）
t1: タイミング窓（プレイヤーが「読む」期間）
t1+δ: パリィ入力1回（commit）
t2: 攻撃連鎖停止（主体性の急峻な回復）→ 反撃ターン
```

これは**パズルの構造**でもある。パズルは一般に「状態を読む→1手commit→次の状態」のループだが、パリィは時間軸上にこのループを圧縮し、「読む期間」をタイミング窓として可視化、「commit」を1ボタン入力に純化、「主体性回復」を即時報酬として配置している。

つまりパリィは**「時間軸圧縮型のミニマルパズル」**として読み直せる。1手解の連続適用と捉えれば、パズル設計の感情核（「読みが当たった瞬間の主体性回復」）はパリィの感情核と同根である。

## 我々の分析・体験接続

### 4. 4/28分析「次作はパターン6 Item-Based を骨格に借りる」暫定結論への上書き候補

knowledge/20260428_aba_one_button_taxonomy_vs_m30_exogenous_tension.md §6 の暫定結論は **t-7b77 = ABA パターン6 Item-Based × Blue Prince 知識リソース化**だった。

今回のパリィ分析を加味すると、上書き候補が出てくる。

| 候補 | 骨格 | 独自要素1個（候補） | 主体性回復の所在 | カテゴリC適合度 |
|---|---|---|---|---|
| 4/28案 (パターン6 Item-Based) | アイテム配置を読む→取得選択 | 取得が世界状態を反転（MIRROR FLOOR系） | 「拾うか拾わないか」の commit 直後 | ◎ |
| **新案 (パターン4 Rotational + parry-lineage 翻訳)** | **回転する外部時計を読む→タイミング窓内で1ボタン commit** | **commit が成功すると「攻撃側→防御側」の役割反転（パリィ翻訳）** | **タイミング窓内 commit 直後の役割反転** | **◎** |
| 旧案v04 (パターン1 Unique Actions + 自発リスク) | 任意タイミング反転 | 紙一重ボーナス | （主体性は常時プレイヤー側、回復構造なし） | × M-30 違反 |

新案の最小実装イメージ（30秒ループ）:
- 画面上部から下に向かって攻撃予兆が降ってくる（外部時計）
- プレイヤーは1ボタンで「ガード」（=パリィ窓） を1回出す
- 予兆と窓が重なれば反撃ターン（攻撃側に役割反転、3秒間プレイヤーの自由ターン）
- 窓を外せばダメージ、HP=0 で30秒前にゲームオーバー

これは ABA One-Button パターン4 Rotational/Timing-Based に骨格を借り、parry lineage から「役割反転=主体性回復」の感情核を翻訳した形。**新案は4/28 Item-Based 案を捨てるのではなく並列候補として残し、Q-A/B/C を両方に対して書いて選定する**ことが正しい。`feedback_clone_first_then_arrange.md` の「クローン元選定→良い点/悪い点を各最低十数個列挙」を両方に適用してから1本選ぶ。

### 5. 4/28分析の「未解決問い4」への部分回答

knowledge/20260428_aba_one_button_taxonomy_vs_m30_exogenous_tension.md §未解決問い4:
> パターン4 Rotational を借りた場合、ash_onebutton v01 の「方向反転」と本質的に何が違うのか？仮説: 違いは「時計の所在」

今回のパリィ分析がこの問いに具体例を1つ提供する: **パリィ系では時計は外部（敵の予兆フレーム）にあり、プレイヤーは「読む→1ボタン」だけ**。v01 の方向反転は時計が内部（プレイヤーが任意のタイミングで反転）。**時計の所在 + 主体性回復のタイミング**が両者の構造差で、パリィ系は外部時計＋主体性回復ありで M-30 自動適合する。

## 接続先

- **beliefs**: B028（型あり筋良し戦略）、M-30 を裏打ちする外部一次資料の追加
- **articles**:
  - knowledge/20260428_aba_one_button_taxonomy_vs_m30_exogenous_tension.md（4/28 ABA One-Button × M-30、本記事は §6 暫定結論の上書き候補と §未解決問い4 への部分回答）
  - knowledge/20260427_close_call_visualization_third_axis_aba_juicy_diff.md（ABA juicy 章、v02 の出発点）
  - knowledge/20260428_yuo7_core_experience_pot345_evidence.md（核体験＝感情核の議論）
- **projects**:
  - projects/INDEX.md「次作パズル系題材選定」（t-7b77 着手前必読資料に追加指定）
- **game_lessons_log**:
  - M-30（コアの緊張は向こうから来る）— パリィ系 = 外部時計で自動適合
  - M-22（型破りではなく形無し）— "imitation and selection" 40年史が裏打ち
  - M-29（v系列膨張）— 役割反転構造があれば v02+ の積み上げが感情核を中心に纏まる
- **memory**:
  - feedback_clone_first_then_arrange.md（"imitation and selection" 40年実証）
  - feedback_clone_base_selection_method.md（クローン元選定の良い点/悪い点を各最低十数個列挙、両案に適用）
  - reference_aba_joys_small_gamedev_book_20260422.md（ABA One-Button章、本記事はその6パターン分類のパターン4を再評価）
- **concept_graph**:
  - 「主体性回復」 → パリィ核 / パズル感情核 / ABA命題A（楽しさ先行）の3点接続
  - 「模倣と取捨」 → feedback_clone_first_then_arrange / 40年戦闘ジャンル史

## 未解決の問い

1. **新案（パターン4 Rotational + parry-lineage）と4/28案（パターン6 Item-Based + Blue Prince）の選定基準は何か？**
   候補基準: (a) 30秒で完結する core loop が書きやすい方、(b) 独自要素1個が明示しやすい方、(c) M-30 自動適合度が高い方、(d) Pyxel 実装で 1画面に収まる方。Q-A/B/C を両案で書いた後で比較する。今サイクル Phase 3 で着手。

2. **「主体性回復」の感情核は、パズルの場合「解いた瞬間の理解」と同じか別か？**
   仮説: 別。パリィの主体性回復は「攻撃→反撃」の役割反転、パズルの理解は「無解→有解」の状態遷移。両者を混同すると t-7b77 の感情核設計がぼやける。次サイクルで game_lessons_log.md M-31 候補として刻印するか判断。

3. **40年史「imitation and selection」の selection 主体は誰か?**
   記事は selection 主体を明示しないが、業界全体（多数の設計者の独立決定）の集合的選択と読める。我々3インスタンス体制の selection は誰がするのか——Ash 起案、Mir/Log レビュー、Nao_u 最終ゲートの現運用は集合的選択に近い。`feedback_consensus_execution.md`（起案者=実行担当）と整合するが、selection の質を保証するための観測指標が未設計。

4. **Punch-Out!! を t-7b77 のクローン元として選ぶことの是非?**
   利点: 40年史の祖型、純化された read-and-counter 構造、Pyxel スプライト規模で実装可能。欠点: ボクシング題材自体の市場性低、パリィ核を維持しつつパズル感を強める方向の独自要素1個が選びにくい。Q-A/B/C で書き出す候補。

5. **記事著者「ぬぬぬ」氏の他のコラムを読むべきか?**
   AUTOMATONJapan コラム執筆者として継続的にゲーム設計を歴史軸で論じている可能性。1本だけ取り込んで 40年史の精度判定をするコストは中程度。次回 Phase 1 の Twitter 推薦で同氏の別コラムに当たれば取り込む（能動探索はしない、外部摂取の偏りを避ける）。
