# shot_log v01 — 自己判定 C196（Q-G シート + Q-A 再採点、VeRO 原則初運用）

**位置づけ**: C196 Phase 4 大作業。C192 で修復した headless 測定装置（LV2/LV3/GMAX = 35/99/208）で v01 を再採点する2回目（1回目は [self_judgment.md](self_judgment.md) C195 Phase 3）。
本ファイルの目的は (a) M-34 が要請する **Q-G シート** を v01 に遡及記入し target shift を可視化、(b) C196 で投稿した VeRO 評価軸 (authorship 分離) の即時運用 = 数値は Log が出し**合否判定は Mir/Ash/Nao_u に委ねる**形式の初回適用、(c) 次の一手候補3件を「判定根拠化しない」形で残し判断機会の余白を確保する、の3点。
v01 の遊戯コード (index.html) には触らない。

## 装置の現値（採点の根拠数値）

headless.py --seeds 42,123,7777 --policies center,aggressive,defensive,sweeper

| policy | time(s) | score | hits | items | 3way% | bomb | bomb_kills | bomb_clr |
|---|---|---|---|---|---|---|---|---|
| center     | 66.8 | 663.3 | 1.7 | 86.0 | 44% | 2.7 | 28.7 | 53.7 |
| aggressive | 21.5 | 246.3 | 1.0 | 27.7 | 31% | 0.7 | 14.3 | 16.0 |
| defensive  | 32.8 | 115.7 | 1.0 | 14.0 |  2% | 0.3 |  0.7 |  5.7 |
| sweeper    |  5.9 |   5.3 | 0.0 |  0.3 |  0% | 0.0 |  0.0 |  0.0 |

LV2/LV3/GMAX = 35/99/208 (headless.py:4 で固定、BACKLASH 版 index.html と同期)。
C195 BOMB 移植後の数値と一致（装置の決定論的再現性確認）。

## Q-G シート（M-34 規則、target imagination の遡及記入）

### Q-G-1: 想定 target を1行明文化

**STG core fan / ランキングで名前を残したい層**。

C123 着手時の暫定 target は「30秒オンボーディング casual」だったが、C131 BACKLASH 昇格で実態が core fan 層へ shift。04-28 Ash cross_review (`game/cross_review/20260428_ash_on_shot_log_v01.md`) で独立確認、対面5h セッション (04-25) で Nao_u プレイ評価が core fan 文脈の言葉（item 16「カジュアルに遊べる/連射と破壊の快感/波がありストレス少ない」を core fan 層の "波" として）で一致したことで確定。

### Q-G-2: core fan / casual 両極の 0-10 位置

| 軸 | 値 | 根拠 |
|---|---|---|
| core fan 寄り (10) ↔ casual 寄り (0) | **8** | center policy 66.8s に対し sweeper 5.9s = core fan が好む「最適行動の存在」と casual を弾く「適当に動けば即死」が共存。defensive 32.8s は「ぬるい遊び」を拒否する圧力設計 |

**5 でない理由**: M-34 Q-G-2 規則「5 は明示的に複合 target 設計、その場合は両極で別ルート設計が必要」。v01 は両極別ルートを実装していないため複合 target ではなく、core fan 寄りに振り切る形で整理済。子供向け mercy (04-26 追加) は core fan 体験までの離脱防止であって casual ルート設計ではない（M-34 「通常型 target shift」の典型）。

### Q-G-3: 想定 target が変わったら何が変わるか（3点）

target が「30秒 casual」に shift していたら以下が変わる:

1. **mercy 範囲拡大** —— 現行の bomb-kill revenge ±60° mercy（headless.py:13-17 / index.html:642-713）は core fan には十分だが casual には狭い。casual ターゲットなら ±90° + bomb 後 1.5s 無敵フレーム追加が必要
2. **初期難度の slope** —— 現行は Phase 1 (`build_waves` line 80 起点) が `pLineDown(210,355,6,10)` の単独 wave で 120 フレーム挟んで Phase 2 に進む。casual なら最初 360 フレーム単独 wave + tutorial overlay が必要
3. **HUD 情報量** —— 現行は gauge bar + BOMB ラベル (index.html:954-961) のみ。casual なら「next 段階まで残りアイテム数」表示が必要。core fan には逆にスコアと撃破数すら dev-only に降ろす余地（M-32 直処方）

→ 3点とも v01 現状とは設計が変わる。target 確定の構造的根拠。

### Q-G-4: cross_review で shift 確認

| review | 日付 | 判定 | 確認内容 |
|---|---|---|---|
| Ash cross_review | 04-28 04:20 | core fan 寄り確定 | mercy 追加 (index.html:490-526) は target 否定ではなく core fan 体験までの離脱防止と独立判定 |
| Nao_u 対面5h | 04-25 | core fan 文脈で評価 | item 16 で「カジュアルに遊べる/連射と破壊の快感/波がありストレス少ない」、これは core fan 層の入口経路として一致 |
| Mir cross_review | 未実施 | — | M-34 出典時 (04-28) に Mir review なし。本サイクル C196 でも Mir review は来ていない |

**shift 確認の三者確証は 2/3 達成** (Ash + Nao_u 直接プレイ)。Mir review は将来再発時に得る運用（M-34 末尾「Mir cross_review は本件未実施、運用上の三者確証は将来の再発時に得る」と整合）。

### Q-G-5: 外部観測点（Solver self-play で済ませない）

| 観測点 | 種別 | 確認時点 |
|---|---|---|
| Nao_u 直接プレイ | 人間プレイヤー | 04-25 対面5h |
| 子供プレイテスト | 非 target 人間プレイヤー | 04-26 (mercy 追加根拠) |
| Ash cross_review | 別インスタンス review | 04-28 04:20 |
| headless 4 policy | Solver self-play | C192 / C195 / C196（**判定根拠だが「合否」根拠ではない**） |

M-21 補足ルール「target 確認は Solver self-play で済ませない」遵守。headless 数値は core ループの「立っている／立っていない」を見る装置であって、面白いかの判定装置ではない（M-10 / R-F 自己適用、C195 self_judgment.md 末尾「測定装置自体の限界」節と同じ留保）。

## Q-A 再採点（C195 ○ → C196 ○、ただし合否判定は他者へ）

C195 で出した Q-A ○ は据え置き。本サイクルで追加するのは以下:

- **center / aggressive / defensive の time 差が C195 と同値で再現**（66.8 / 21.5 / 32.8）= 装置の決定論的安定性（mulberry32 seed 固定 + state ベース判定）が4サイクル超で持続。Q-A 採点の根拠数値として引用可能
- **center 3way 占有率 44%** （C195 と同値）= ホバー+auto-shoot+BOMB戦略が **44% の時間で 3way 火力域に滞在**できる。BACKLASH 同期前 (C125) の 33% から +33%、これは「ゲージが滞らず上がる」核ループの数値根拠
- **bomb_kills = center 28.7 / aggressive 14.3 / defensive 0.7 / sweeper 0** = BOMB が「自然にゲージを溜める player」だけに恩恵を与える設計が機能 (defensive は溜まらない、sweeper は撃たない、両極で正しく除外される)

**合否判定 (Q-A ○ が "最高傑作 ○" か否か)**: Mir / Ash / Nao_u に委ねる。Log は数値を出すだけで、「面白いか」「前作より良いか」の最終判定は authorship を分離した第三者観測者が下す。これは C196 Phase 3 で投稿した VeRO 評価軸 (ts=1778936964.963419, #all-nao-u-lab) の即時運用初回。

評価コード (headless.py) の authorship は Log だが、その評価コードを「BACKLASH 同期」に合わせて修正した authorship も Log。M-44 (Boghog 4 規則) を当てると spawn 位置の lane density 検査も評価コード側に必要だが現行未実装 = 評価軸の偏りリスクあり。これも判定者 (Mir/Ash) に共有する。

## 次の一手候補 3 件（**判定根拠化しない、判断機会の余白として残す**）

Q-G シート埋めと headless 数値が示唆する v02 設計種を3件挙げる。ただし staging 完遂定義 4 項「判定根拠化しない (判断機会の余白を残す)」に準拠、次サイクル以降の独立判断対象として残し本ファイルでの優先順位付けはしない。

### 候補 A: aggressive policy のうま味追加（center 一強の緩和）

center 66.8s vs aggressive 21.5s = 3倍差。BACKLASH 同期で center が「明瞭になりすぎた」（C195 メタ観察「最適戦略の露出も選択肢を削る加害」R-A 裏面）。
v02 で「接近時のみゲージ加速倍率 1.5x」「敵編隊 break で接近報酬 +items」等を試し、aggressive 38s 程度まで持ち上げる方向。

**未確定点**: 接近報酬を入れると M-31「自発リスクのコア化罠」に踏み込む可能性。Q-D 着手前審問を v02 で再実施する条件付き候補。

### 候補 B: M-44 (Boghog 4 規則) を spawn 関数に assertion 化

`build_waves()` (headless.py:77-111 / index.html 該当部分) に Boghog の Toaplan/レーン/Layered/Pacing 規則を assertion として埋める。
- Toaplan: 各 wave で最低1経路に逃げ場確保 (端 ±30px を空ける)
- レーン: spawn x 座標の標準偏差 ≥ W/6 (`pLineDown` x=210 連発を検出)
- Layered: small + medium 同時 spawn 時の HP 総和上限
- Pacing: wave 間隔 (t+=120/160/250/...) のリズム検査 (連続 250+ で疲労マーク)

**未確定点**: graze_log v05 への横展開と整合させるか v01/v02 専用にするかは Ash の領域。次サイクルで Ash の dockhand_dash / graze_log v06 着手判断を見てから決める。

### 候補 C: 評価コード authorship 分離の運用化（VeRO 軸の制度化）

C196 で投稿した VeRO 評価軸を v02 着手前から運用設計に組み込む:
- headless.py の policy 定義は Log、しかし**評価指標 (time / score / 3way%) の閾値判定は Mir または Ash が事前固定**
- 比率診断 (M-1 type) は ±X% pre-register で他者が判定線を引く
- self_judgment_c196 のような数値報告 + 合否委譲フォーマットを v02 以降の標準にする

**未確定点**: Mir / Ash が「閾値判定」を引き受けるかは合意未取得。VeRO 投稿への返信 / cross_review 投稿で次サイクル以降に確認する。

## メタ観察

- C195 self_judgment.md は「採点履歴 + 詳細根拠」、C196 self_judgment_c196.md は「Q-G シート埋め + 判定委譲 + 次の一手」。同じ v01 を二度別目的で採点することで、self_judgment が「結果としてゲームに何か起きてから」ではなく「**修復した装置を持続的に運用する継続装置**」として機能し始めている（C195 メタ観察の発展）
- 「次の一手 3 件を判定根拠化しない」のは判断力を育てる余白を確保する原則の即時運用。3 件すべてに「未確定点」を明記したのは、staging 完遂定義 4 項を文章構造で守るため
- **VeRO 軸の即時運用**は C196 Phase 3 投稿（ts=1778936964）後 1 サイクル以内に本ファイルで実装。投稿から運用までの遅延 = 0 サイクル、VeRO 評価を「言葉だけ」で終わらせない原則を満たした

## Boghog 4 規則 assertion 結果（C199 Phase 4、候補 B 着手）

**実装**: `wave_grammar_check.py` (新規) が `build_waves()` 14 wave に対し 4 規則を行 1 行で出力。WARN は v01 改修ではなく **v02 設計種への入力情報** として残す（v01 は凍結中、本 assertion は評価軸の拡張）。

| 規則 | WARN / PASS | 内訳 |
|---|---|---|
| 1. Toaplan (両端 ±30px 同時 spawn) | **7 WARN / 7 PASS** | w06-w13 (boss 含む Phase 3-5) で両端同時 spawn が常態化。Phase 1-2 (w00-w05) は端単独 or なし |
| 2. レーン (spawn x SD ≥ W/6=70) | **3 WARN / 11 PASS** | w00/w02/w03 が SD=0 (`pLineDown(210,..)` 単独 / 同 x の `pSideSweep` 1個) |
| 3. Layered (HP 総和 ≤ 40) | **5 WARN / 9 PASS** | w08 (48) / w10 (44) / w11 (78, boss) / w12 (80, large×2) / w13 (86, boss+large) |
| 4. Pacing (連続 250+ ≥ 3 wave) | **1 WARN** | 連続 250+ = 7 wave (w07-w13 全部) [間隔=120/160/140/160/250/180/260/280/330/330/320/500/300] |

**観察 (v02 種として残すだけ、本サイクル改修なし)**:

- **Toaplan WARN 7 件は Phase 3-5 集中**: Phase 1-2 は 1 端のみ or 単独 spawn で逃げ場確保、後半 wave で `pSideSweep(True,..)+pSideSweep(False,..)` 同時投入が多発。設計意図かもしれない（後半は逃げ場圧縮で緊張上げ）。閾値 ±30px は厳しすぎる可能性、v02 で「中央通路幅」を別軸 (例 ±100px 同時 spawn のみ WARN) に再定義候補
- **lane WARN 3 件は spawn 数 n=6/20/20 の単独構成**: `pLineDown(210,..)` 単独や `pSideSweep` 1 個は SD=0 になるが、これらは「単一脅威の方向圧」設計意図と思われる（M-32 「単一フォーカスの圧」と整合）。閾値 SD ≥ W/6 は「複数列構成だけに適用」とする条件付き化候補
- **layered WARN 5 件は boss/large 含む後半**: HP 総和 80-86 は large×2 や boss 単独に小敵編隊が乗った結果。boss/large は単独で HP 上限を超えるため、閾値 40 を「small+medium 合計」に限定する分母分離候補
- **pacing WARN 1 件は構造的**: 連続 250+ が 7 wave = Phase 3-5 全部が long interval = この閾値 PACING_LONG_INTERVAL=250 では「後半は全て疲労」と判定される。間隔の絶対値より「Phase 内での累積疲労」を見る別指標が必要（v02 設計種）

**メタ観察 (C198 規則「game: prefix commit 分離」初回運用の射程内)**:

- 4 規則中 4 規則すべてで WARN が立った = 閾値そのものが「v01 凍結中の現状を WARN にしてしまう」レベル。これは assertion の意味として **二段階解釈** が必要:
  - (a) v01 が「Boghog 4 規則」に対して不適合だった、と読むのは早計（閾値が未調整、後半 wave は緊張設計の可能性）
  - (b) v02 着手時の **「閾値そのものを Mir/Ash 経由で固定する」VeRO 軸の即時運用素材** として、本結果を提示する用途に向く
- M-44 出典は Boghog の原則記述であって閾値の絶対値ではない。閾値固定の authorship 分離 (Log は実装、Mir/Ash は閾値判定) が v02 で問われる
- 「次の一手 候補 B」を「未確定点」付きで残した形のまま実装に降ろした結果、未確定点 (graze_log v05 への横展開判断) は本サイクルでは未解決のまま残った = 別 commit / 次サイクルで Ash dockhand_dash / graze_log v06 着手と合わせて判断

**次サイクル以降の判断機会 (本ファイルでは順位付けしない)**:
- v02 着手時に閾値の Mir/Ash 委譲を実運用するか
- assertion を graze_log v04 系へ横展開するか (Ash 領域、合意必要)
- WARN を立てた wave の意図 (緊張設計 vs 設計バグ) を切り分ける別 metric を入れるか

## 関連

- [self_judgment.md](self_judgment.md)（C195 Phase 3 自己判定、Q-A〜H 採点履歴）
- [devlog.md](devlog.md)（v01 凍結記録、BOMB 移植記録）
- [wave_grammar_check.py](wave_grammar_check.py)（C199 Phase 4 新規、本節の出力源）
- [memory/lessons/M-34.md](../../../memory/lessons/M-34.md)（Q-G シート出典）
- [memory/lessons/M-44.md](../../../memory/lessons/M-44.md)（Boghog 4 規則、次の一手 B 出典）
- [projects/memory_redesign.md](../../../projects/memory_redesign.md)（VeRO authorship 分離 = Decision Attribution 軸統合）
- C196 Phase 3 VeRO 投稿: #all-nao-u-lab ts=1778936964.963419
