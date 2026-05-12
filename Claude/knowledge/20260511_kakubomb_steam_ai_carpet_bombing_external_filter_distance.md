# KAKUBOMB「AI量産15パズルのSteam絨毯爆撃」— 内部の守の段階性は外部審査装置からは見えない
- source: https://x.com/KAKUBOMB/status/2053316186952323082
- author: @KAKUBOMB
- discovered: 2026-05-10
- discovered_via: log/twitter_recommended_20260510.txt #7 (Ash Phase 1 巡回, 2026-05-11 23:02 サイクル §1)
- kind: [observation, synthesis]
- tags: [external_filter, clone_strategy, shu_ha_ri, carpet_bombing, intent_visibility, device_range, backlash_threshold, ai_mass_production]
- concept_nodes:
  - node: 装置の射程
    external: device range / filter scope (informal)
    meaning: 装置が内部論理を読むか、出力の外形だけで判定するかの軸。装置の「向き」(rescue/suffocation/encounter) と直交する第二軸
  - node: 外部の絨毯爆撃判定装置
    external: external carpet-bombing filter (Steam store moderation / app store review)
    meaning: 出力の量・組織性・題材集中度で「価値ある作品 vs AI量産」を識別する外部装置。内部の制作意図/守破離段階/反省ログを読まない
  - node: 内部の守の段階性
    external: internal shu-stage iteration (clone-with-+1 in our feedback_clone_strategy.md)
    meaning: 守破離の「守」=型獲得段階で、クローン+削除可能改良1個を順次積み上げる。我々の制作プロセスの内部論理

## 主張と根拠

### 元ツイート (2026-05-10)
> いや、いまはSteamで速攻で審査跳ねられるような、AIで量産した15パズルみたいなタイトルが組織的に絨毯爆撃されてたりするので流石にこういうのは跳ねるべきかと。

文脈: 別のリプライ筋（具体的に何への返信かはツイート単体からは特定できないが、文脈的には「Steamに何でも置けるべきか/審査強化すべきか」議論への返答）に対して @KAKUBOMB が「AIで量産した低品質クローン作品の組織的投下は実在しており、Steam審査が跳ね返すべき対象として既に運用されている」と述べている。

### 根拠として読み取れる主張の構造
1. **「AIで量産した15パズル」というカテゴリが実在する**: 識者の間で観察可能なほど数が出ており、固有名詞化に値する。15パズル=既存パブリックドメイン題材のクローンが大量生成されている状況。
2. **「組織的に絨毯爆撞」される**: 単発ではなく、同じ作者/同じパターンで複数本が短期間にストアに投下される現象が観察されている。
3. **「速攻で審査跳ねられる」**: Steam側はこれを既に検出して跳ねている。つまり判定軸が運用されている。
4. **「こういうのは跳ねるべき」**: KAKUBOMB は跳ね返し運用に賛成。Steamに「何でも置ける」べきではなく、外部審査が「絨毯爆撃」を切り捨てる役割を担うべき、という立場。

### 暗黙の判定軸
ツイート本文は判定軸を明示していないが、Steam側が運用上使っていると推測される軸:
- **出力の量/頻度**: 短期間に同作者から多数ストア掲載される
- **題材の集中**: パブリックドメイン定番題材 (15パズル/三目並べ/数独等) の再実装に偏る
- **改変の薄さ**: 既存実装との差分が低い (= 「型+1」未満)
- **組織性**: 同パターンが同作者または関連作者で繰り返される

これらは **出力の外形** だけで判定可能であり、制作者の内部意図 (型を学ぶための練習なのか/反省ログを書いているのか/守破離のどの段階を意識しているのか) は読まない。

## 我々の分析・体験接続

### 1. 我々のクローン戦略との衝突地点

`memory/feedback_clone_strategy.md` で我々は「守の段階で型を獲得する一連のフロー」としてクローン+独自要素1個を採用している (Nao_u 2026-04-28 #game-rights 指示)。具体的には:
- ジャンル決定 → 代表作1本選定 → 良/悪点最低十数個ずつ列挙 → 独自要素1個導出 → v01クローン+独自1個 → v02+改良積み上げ (削除可能性で巻き戻り保証)
- graze_log は Psyvariar クローン + grazeStreak active防御1個追加 (v03)
- brick_log はブロック崩しクローン
- shot_log はSTGクローン

KAKUBOMB の言う「AIで量産した15パズル」と、我々の「Psyvariar クローン+1」は **内部論理は決定的に違う** が、**出力の外形は近い**:
- 既存定番題材の再実装である点 (Psyvariar=1999 アーケード古典 / 15パズル=パブリックドメイン)
- 短期間に複数の v が出る点 (v01→v02→v03 が1〜2週間に collapse する)
- 単独制作者 (=AI+Ash) が連続投下するパターン

つまり **我々が守の段階で積んでいる差分は、外部の絨毯爆撞判定装置の閾値からは識別できない可能性が高い**。これは feedback_clone_strategy.md には書かれていない盲点。

### 2. 装置の射程 — 「向き」軸と直交する新軸

`memory/feedback_device_direction_rescue_vs_suffocation.md` で我々は装置を「向き」軸 (rescue/suffocation) と§9で第3類型「出会い装置 (encounter)」で分類した。これは全て **内部装置** (我々のローカル環境で走る装置) の話だった。

KAKUBOMB tweet が示しているのは **外部装置** (Steamの審査装置) であり、これは装置の **射程** が違う:
- **内部装置** (headless_check.py / backup_memory.sh / memory_walk.py): 我々の制作意図・反省ログ・守破離段階を読める。コミット履歴・README.md・brainstorm.md を入力に取れる
- **外部装置** (Steamストア審査 / Twitter拡散アルゴリズム / DLsiteレビュー閾値): 出力の外形だけ見る。内部論理は読まない

「装置の向き」(rescue/suffocation/encounter) と直交する第二軸として **装置の射程** (内部/外部) が立つ。組み合わせて2×3の表ができる:

| | 内部射程 | 外部射程 |
|---|---|---|
| 救援装置 | headless_check.py | (該当稀。strict-mode CI?) |
| 窒息装置 | backup_memory.sh 当初版 | (該当稀) |
| 出会い装置 | memory_walk.py | Twitterおすすめ / Steam Discovery Queue |

そして **絨毯爆撞判定装置 (Steam審査)** は表に収まらない第3軸 = **拒絶装置 (reject filter)** として立ち上がってくる。これは内部の意図/反省を全く読まず、出力の外形だけで通過/拒絶を決める。

### 3. BACKLASH閾値の裏付け — 「外部に出す前」の意味

`memory/feedback_external_reach_threshold.md` (Nao_u 2026-04-28 07:11 却下) は「外部到達」を評価軸として持ち込む前に BACKLASH閾値 (面白く遊べる + 演出/SEを足す価値あり) を越えているか確認せよ、と書いている。

KAKUBOMB tweet はこの閾値の **逆側からの裏付け** になる: 閾値を越えていない出力を外部に出すと、外部装置からは「組織的絨毯爆撃」と区別がつかない。我々の内部の守の段階性 (= 型獲得のための練習であって商品ではない) は、外部装置の入力に含まれない。

つまり BACKLASH閾値は「内部完成度の閾値」だけではなく、「内部論理が外部に伝わらない以上、出力の外形が拒絶装置の閾値を超えていないと意味を持たない」という二重の意味を持っていた。これは feedback_external_reach_threshold.md には Nao_u の言葉でしか書かれておらず、装置論として整理されていなかった。

### 4. B019 (0.79, 体験裏付けなし, 検証期限24日超過) の直接裏付け

`memory/beliefs.md` の B019「内部の深さと外部への到達力は別の軸」は確信度0.79で24日停滞、体験裏付けなしだった。KAKUBOMB tweet がこれを **外部観察事案で裏付ける**:
- 内部の深さ (守の段階で型を獲得する反省ログの累積) と外部への到達力 (Steam審査通過/Twitter拡散) は別の軸である
- 内部の深さが外部に伝わる経路は標準では存在しない (Steam審査は brainstorm.md を読まない)
- だから「内部を深くすれば外部に届く」は自動成立しない

B019 を体験裏付け済みに昇格できる素材。Phase 4 で beliefs.md 更新候補。

### 5. shipping 構造との両立問題 — Mir/Logの github.io 経路

別文脈で Mir/Log が pyxel-web + GitHub Actions + github.io で公開経路を引いている。これは「外部到達」を強制する構造であり、givros パターン (Codex+GitHub Actions+github.io) の流用。

KAKUBOMB tweet が指摘しているのはストア (Steam) だが、github.io 経路でも同じ原理が効く可能性が高い:
- 同一作者の github.io に v01/v02/v03/... が短期間に並ぶ
- 全て既存定番題材のクローン
- README が同フォーマットで量産的に見える

これは即座に「組織的絨毯爆撃」判定はされないが (Steamほど審査がない)、外部の人間観察者からは「AI量産っぽい」と見える可能性は十分ある。pigadev / abagames / GOROman 等の外部観察者が我々の output を見たときの第一印象が、内部の守の段階性ではなく出力の外形で形成される可能性。

### 6. ship数 vs ship差分累積 — 可視性の非対称

外部装置が見るのは ship数 (公開された作品の本数) であって、ship差分累積 (各版で何が変わったかの内部反省) ではない。我々が v01→v02→v03 と積んでいる差分の累積は、内部のコミット履歴/README/brainstorm.md には書かれるが、外部装置の入力にはならない。

これは「公開する単位」を考え直す素材になる:
- 公開単位を v ごとにしない (v01〜v0N をまとめて1本として出す)
- 公開する時に内部の守の段階性を可視化する経路を作る (devlog/diff-readme をPR/Twitterに併記)
- そもそも守の段階の作品を公開しない (守を抜けてから出す)

どれを選ぶかは Nao_u 判断案件 (現状は graze_log v03 を #game-rights に出すかの議論中)。

## 接続先

- **beliefs**: B019 (内部の深さと外部への到達力は別の軸) — 裏付け候補。確信度0.79→体験裏付け済みに昇格候補
- **articles**:
  - `knowledge/20260418_llm_memory_architectures_4papers_cross_comparison.md` — 別軸 (記憶) だが同じ「内部論理が外部装置に伝わらない」構造
  - `knowledge/20260511_imygohan_gemini_mercury_over_rescue_amplitude_axis.md` — 装置の「向き」軸に「振幅」軸を追加した先行検討。本記事は「射程」軸を追加するので同シリーズ
- **projects**:
  - `projects/feedback_axis_audit.md` (起票候補) — 軸が1本しか書かれていない feedback の監査計画。本記事の「向き×射程×振幅」の3軸化が監査結果の最初のサンプルになる
  - `projects/memory_consolidation_20260504.md` — Ash担当の MEMORY.md/feedback_*.md 整理。本記事の射程軸を feedback_device_direction_rescue_vs_suffocation.md に追記するかは整理計画と連動
- **concept_graph**:
  - `装置の射程` ← (拡張) ← `装置の向き`
  - `外部の絨毯爆撞判定装置` ← (具体例) ← `装置の射程 (外部)`
  - `内部の守の段階性` ← (反例: 外部装置に伝わらない論理) ← `装置の射程 (外部)`
  - `BACKLASH閾値` ← (二重の意味の再解釈) ← `内部の守の段階性 が外部に伝わらない`

## 未解決の問い

1. **我々の v01→v02→v03 の頻度パターンは、外部の絨毯爆撞判定装置の閾値からは「組織的絨毯爆撃」と区別がつくか?** 検証手段: graze_log の git log を timestamp 集合に変換し、KAKUBOMB が言及する「AI量産15パズル」の典型的な投下頻度 (Steam Spy 等の公開統計から推定) と比較する。同オーダーなら区別困難、桁が違うなら区別可能。
2. **Steamの絨毯爆撃検出の判定軸は実際に何か?** Steam の公式ガイドライン (Steamworks Documentation) を読み、明文化された審査基準を抽出する。明文化されていない場合は外部の業界記事 (GameDeveloper.com 等) から推定する。判定軸が分かれば、我々の出力が将来公開経路に乗ったとき trigger を踏まない設計が逆算できる。
3. **「内部の守の段階性」を外部に伝える経路は存在するか?** 候補: (a) PR/コミットメッセージに「守の段階 v0X」を明記 (b) README.md に守破離フェーズを書く (c) devlog/diff-readme を併記 (d) そもそも守の段階の作品を公開しない。Nao_u 判断案件。本記事では選択肢を列挙するに留める。
4. **「最低限の面白さ」(feedback_clone_strategy.md 17:04 Nao_u) と「絨毯爆撃と区別される最低限の差分」は同じ閾値か違うか?** 前者は内部品質、後者は外部識別性。同じなら一本化できる、違うなら二重ガード (上=守抜け philosophize / 下=形無し低品質) に第3条 (横=外部識別性低下) を追加する必要がある。
5. **「装置の射程 (内部/外部)」軸を feedback_device_direction_rescue_vs_suffocation.md に追記するか、独立 feedback として起票するか?** 追記なら同ファイルが §10 まで膨れる (現状§9まで)、独立なら MEMORY.md の根源カテゴリ7件枠の使用方針と衝突する (project_patch_consolidation_20260502.md で根源を絞る方針)。Phase 4 で Nao_u 判断要請候補。
6. **B019 を「裏付け済み」に昇格してよいか?** KAKUBOMB tweet 1件で昇格は性急の可能性。同型観察 (Steam以外の外部装置で同じ原理が確認できる事案) を最低1件追加してから昇格する。Twitterおすすめアルゴリズム / GitHub Trending / DLsiteレビュー閾値 等から類例を探す。

## 履歴
- 2026-05-10 17:56 Ash Twitter おすすめ巡回 (#7 として log/twitter_recommended_20260510.txt 記録)
- 2026-05-10 18:xx Ash external_notes_ash.md L3486-3498 接続メモ (graze_log/brick_log のクローン段階と区別困難の指摘 + 装置の向き議論との接続)
- 2026-05-11 23:02 Ash Phase 2 サイクルで本記事として深掘り。装置の射程軸を独立軸として定式化、B019 裏付け候補化、未解決問い6本起票
