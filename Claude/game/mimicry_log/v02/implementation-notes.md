# mimicry_log v02 — implementation-notes (3 層分離試行 Log 側初実例)

**status**: 2026-05-21 C218 Phase 4 新規。C216 Phase 4 で完了済の実装 (focus shot + token burst + large + wave10 miniboss) を対象に、3 層分離の試行を後追いで物理化する。

**3 層分離の定義 (C215 Phase 3 §洞察3 で予告した試行)**:

| 層 | 役割 | 書く時 | 形式 |
|---|---|---|---|
| `devlog.md` | 事後整理 / 結論 / 採用判定 / 差分一覧 | 実装完了後 | 表 + 採用判定 + 接続先 |
| `implementation-notes.md` (本ファイル) | リアルタイム判断 / 分岐点で何を選び何を捨てたか | 実装中 (後追いも可) | 分岐リスト形式 |
| 却下案ログ (未着手) | 5 秒以上迷った判断の独立記録 | 迷いが発生した瞬間 | brainstorm の補助層 |

本ファイルは C218 で後追い記述。実装中の判断記録としては不完全 (= リアルタイム性が失われる) だが、3 層分離の **形式自体** を Log 側で初めて物理化する意義を優先する。次の v03 以降で「実装中に書く」運用を本ファイルの構造で試行する。

---

## §1. C216 実装中に判断した分岐点 (後追い再構成)

### 分岐 1: focus token の加算条件

**選んだ**: focus 中の kill のみで加算 (`state.focus` が真の時のみ `state.focusTokens += value`)

**選ばなかった案**:
- (a) 全 kill で加算: focus と無関係に蓄積、burst が「いつでも撃てる強化」になり focus mode との因果接続が消える
- (b) graze と kill 両方で加算: 加算源が 2 系統になり「token がどこから来たか」player が追えなくなる

**理由**: brainstorm §採用判定 通過条件 3「focus token + 3 個で burst」は focus mode と burst を 1 つの判断系として結ぶ要件。kill 加算を focus 中に限定することで「focus 中に積極的に撃つ → token 蓄積 → burst 発動」の因果が 1 本線になる。

**未解決**: focus 中に **graze** したら加算するかは判断保留。現実装は加算しない (kill のみ)。次サイクル実プレイで「focus 中の graze に対する手応えが薄い」と感じたら追加候補。

### 分岐 2: burst 発動キー割り当て

**選んだ**: `Z` キー新規割り当て (操作キー数 5 → 6)

**選ばなかった案**:
- (a) SHIFT 長押し (= focus mode を一定時間継続したら自動 burst): player が「いつ burst するか」を選べなくなる、judgement の第 2 軸が消える
- (b) SPACE 統合 (= BOMB と兼用): 既に SPACE は BOMB/DEF/start/retry の 4 役で飽和、5 役目は誤発火 risk が高すぎる
- (c) SHIFT ダブルタップ: 入力認識が曖昧、戦闘中に意図しない発火または無反応の両方が起きうる

**理由**: brainstorm S1 撤回トリガー「操作キー飽和による初心者把握破綻」を新規キー Z 追加で**自ら触れる**判断。Cave 系の「同じボタンで状態切替」(brainstorm §3 事例2) への退避は v03 候補と明記して先送り。

**自己批判**: 操作キー 6 個は初プレイ 30 秒で全部押される設計か? 現状 README に SHIFT/Z の存在を明示していない (README.md 自体が v02 に未配置)。次サイクル冒頭で HUD 表示か README 1 行 で「Z = burst」の自然な気づき経路を作る必要あり。

### 分岐 3: wave 10 miniboss 撃破後の進行

**選んだ**: `bossClear=true` フラグのみ立て、wave>=11 はランダム生成に戻す

**選ばなかった案**:
- (a) game clear 画面 + retry プロンプト: clear 後の continue を断つので「習得を確認して終わり」の達成感が強いが、再プレイの摩擦が大きい
- (b) wave 11+ で large 出現率を 30% に固定: ミニボスの「習得報酬」が wave 単位の難度上昇に置き換わるが、ランダム配置の崩れが起きる

**理由**: brainstorm §4 L5「wave 10 ミニボス」の役割は「習得報酬の確認」であって「ゲーム終了」ではない。clear 後にランダム生成へ戻すことで、player が「習得した focus 操作を続けて使う」誘因を残す。

**未解決**: bossClear フラグが立った後、HUD やエフェクトで「clear した」事実を player に伝えていない。次サイクルで clear 演出 (画面外周一瞬の光 + "WAVE 10 CLEAR" テキスト 1 秒) 候補。

### 分岐 4: large 出現率「5% / 15%」の解釈

**選んだ**: per-wave に 1 体程度 (= 5% 解釈) 寄り。WAVE_FUNCS の 70% 既存パターン + 30% spawnWaveRandom 分岐で、後者の中に large 抽選を組み込み。

**選ばなかった案**:
- (a) per-enemy 5% (= 1 wave 20 体中 1 体が large): wave 当たりの large 体感率は同じだが、small/medium の合間に紛れる配置になり「large が出てきた」感が薄い
- (b) per-wave 1 体固定 (確率なし): wave 5 以降全 wave で必ず 1 体 large、確率的緩急が消える

**理由**: brainstorm §4 L3「wave>=5 で 5% 出現、wave>=8 で 15% 出現」は出現密度の「動的な揺らぎ」を含む記述。per-wave 確率解釈の方が「あ、今 wave は large 来た」「今 wave は来なかった」の差が出てプレイ感が動く。

**未解決**: `_sim_check.js` Test4 で per-enemy ≈ 1.5% という観測値 (= devlog §3 補足) を残している。これは「per-wave 5% 解釈」と「per-enemy 1.5%」の表記揺れ問題。次サイクル冒頭で観測単位を「per-wave 確率 P(large 出現)」に統一して再 calibration する。

### 分岐 5: vignette の透過率と色

**選んだ**: focus 中 `createRadialGradient` で外周 vignette 15% 透過の黒

**選ばなかった案**:
- (a) 30% 以上の濃い vignette: 視認性低下、敵弾を見落とす危険
- (b) 色付き vignette (青系): focus mode の cool 感は強まるが、敵弾 (赤/橙系) との色干渉でハレーション
- (c) vignette なし + 自機リング表示のみ: focus 中であることの全画面通知が消え、S4 撤回トリガー「視覚シグナル埋没」発火 risk

**理由**: brainstorm S4「視覚情報過多による focus モードシグナルの埋没」を 15% 透過の控えめな vignette で**画面全体に均等に**伝える設計。撃破粒子の 0.7x 減衰と組み合わせて、focus 中は画面全体の情報量を僅かに落としつつ、focus の存在を背景レイヤーで通知する。

**未解決**: 15% という値は感覚的に決めた。次サイクル実プレイで「focus 中の通知が弱すぎる/強すぎる」の両方の意見を集めて再 calibration。

---

## §2. 却下案ログ (5 秒以上迷った判断) — 未着手の理由

C215 Phase 3 §洞察3 で「却下案ログ最小 4 点形式」を Log 視点で投稿 (#all-nao-u-lab 2026-05-21 05:33) したが、その投稿に対して Nao_u 5/21 05:50 で「君たちは発火段数の概念は考えない方が良さそう。段数の議論が始まってるが、何段あるかは本質的に重要ではない」と直叱責された。

この叱責を受けて、本 v02 では「却下案ログ」を独立ファイルとして着手することを **本サイクルで保留** とした。理由:

1. **段数議論凍結ルール (5/21 staging Phase 3 §1) との整合**: 「却下案ログ」自体が「最小 4 点形式 = N 段の発火段数構造」を持つ提案だった。これを物理化する前に「最小 N 点」という設計枠そのものを再検討する必要がある。
2. **3 層分離が「層数を増やす」方向に流れていないか**: devlog / implementation-notes / 却下案ログ の 3 層化は、Nao_u 叱責の「段数」議論と構造的に同型のリスクを持つ。「層数で解決した気になる」誤謬を踏まないため、implementation-notes (本ファイル) を作って 2 層運用を試した結果で 3 層目の必要性を判断する。
3. **brainstorm.md §A4 で既に「不明 = 撤回」規律で 6 案を捨てた記録がある**: 本来「却下案ログ」が担う「迷って捨てた判断の記録」は brainstorm.md §A4 に既に書かれている (案 #1/#3/#4 の懸念 c 不明撤回)。独立ファイル化の必然性が薄い。

**次サイクル以降の判定**: implementation-notes が「実装中のリアルタイム判断」を十分捉えきれていれば、却下案ログは brainstorm.md §A4 形式の「着手前批判」内に統合する方向で確定。3 層分離は「形式実例化したが、運用上は 2 層 + brainstorm 統合で十分」という結論に倒れる可能性がある。

---

## §3. devlog との重複/差分

devlog.md は「結論」を書く層、本ファイルは「分岐点で何を選び何を捨てたか」を書く層。重複は最小化、差分は以下:

| 項目 | devlog | implementation-notes (本ファイル) |
|---|---|---|
| focus token の加算条件 | 「small+1/med+3/large+9」のみ記載 | なぜ全 kill ではなく focus 中のみにしたか |
| burst キー Z | 「Z キー新規割当、S1 risk 拡大」のみ記載 | SHIFT 長押し / SPACE 統合 / SHIFT ダブルタップ を捨てた理由 |
| wave 10 boss clear | 「`bossClear=true` フラグのみ」 | game clear / 難度上昇 を捨てた理由 |
| large 出現率 | 「per-wave 5% 解釈寄り」 | per-enemy / per-wave 固定 を捨てた理由 + 観測単位の揺らぎ |
| vignette | 「外周 vignette」 | 15% / 30% / 色付き / なし を捨てた理由 |

devlog の各項目を本ファイルで「捨てた案を含めて」展開する関係。devlog だけ読めば結論は分かるが、なぜ別案を選ばなかったかは本ファイルで補完する。

---

## §4. 本試行の評価軸 (次サイクル冒頭で判定)

**1. 後追いで書いた本ファイルが、未来の v03 実装中に「同じ分岐点を再判定する手間」を減らせるか**

→ v03 で focus burst キーを Cave 系 (SHIFT 長押し) に変える検討に入った時、本ファイル §1 分岐 2「SHIFT 長押しを捨てた理由」が再判定の出発点として機能するか。機能すれば 3 層分離は成功、機能しなければ devlog だけで十分 (= 本ファイル不要)。

**2. 実装中にリアルタイムで書く運用に移行できるか**

→ v03 実装で本ファイル形式 (分岐 N の見出し + 選んだ/選ばなかった案/理由/未解決) を実装中に書きながら進める運用が成立するか。成立すれば 3 層分離は本格採用、成立しなければ「実装後に devlog + brainstorm への統合追記で十分」と結論。

**3. 却下案ログ独立ファイル化の必要性**

→ §2 で保留した独立ファイル化が、v03 で必要になるか。本ファイル + brainstorm.md §A4 で「迷って捨てた判断」を吸収できれば、3 層化は 2.5 層 (devlog + implementation-notes + brainstorm 内吸収) で十分と判定。

---

## §5. 接続

- [`game/mimicry_log/v02/devlog.md`](./devlog.md) — 事後整理層 (本ファイルの結論側 peer)
- [`game/mimicry_log/v02/brainstorm.md`](./brainstorm.md) — 着手前批判層 + §A4 で「不明 = 撤回」規律
- [`log/cycle_staging_log.md`](../../../log/cycle_staging_log.md) C215 Phase 3 §洞察3 — 3 層分離試行の起源
- [`log/cycle_staging_log.md`](../../../log/cycle_staging_log.md) C218 Phase 4 — 本ファイル新規作成サイクル
- [`memory/feedback_means_ends_reversal_check.md`](../../../memory/feedback_means_ends_reversal_check.md) — means-ends 反転診断 (本ファイル §1 分岐 1 の「focus との因果接続」根拠)
- Nao_u 2026-05-21 05:50 #all-nao-u-lab — 段数議論凍結叱責 (本ファイル §2 却下案ログ独立化保留の根拠)

---

## §6. Log R-I 評価 (2026-05-31 C274 Phase 4)

**目的**: principles.md ミミクリ軸候補 N=4+ 移行の検証材料として、v02 現状コードから R-I 4 要素を Log が直接判定する。各要素を「軸立て成立 / 演出強化に逃げた / 未判定」のいずれかに分類し、根拠コードパス + 理由を明示する。

**評価対象コード**: `index.html` (1035 行)、`_sim_check.js` (5 テスト全 OK 状態)、devlog.md §1-§11 (C246 ゲート名リネーム + C220 bossClear 救済 まで反映)。

**R-I 4 要素の出典**: principles.md 101 行「mimicry_log v02 着手前批判 R-I 4要素チェックの第一項に『ミミクリ軸が立っているか / 演出だけか』を組み込む」+ staging C274 Phase 4 で運用形に展開した 4 要素。R-I 本来の定義 (game_lessons_log.md R-I「着手前に類似30本、提出前に自己判定」) からミミクリ軸検証用に派生した運用枠。

### 要素1: どんな ___ ごっこ — **軸立て成立 (条件付き)**

**根拠**: devlog.md §1 line 33 「**弾の間合いを毎秒選び替えるごっこ**」が ___ に入る軸名として明示。v01 「因果操作ごっこ」から v02 「間合い選択ごっこ」へ軸を更新済 (devlog §1)。

**コード対応**: focus mode 5 効果 (move 0.5x / spread 1/3 / DPS 1.3x / hit 0.5x / graze 1.5x = `FOCUS_*` 定数 line 67-72) と focus burst (token 3 で 60f 強化 = `BURST_*` 定数 line 76-79) の 2 軸が「間合いを選び替える」物理化として実装されている。

**条件付き**: principles.md 124-138 行 Margaris 降格判定で「fill-in-the-blank 命名は power fantasy への重力吸引 (b) + invented authority (c)」とされ、v02 軸名も fill-in-the-blank 形式 (「弾の間合いを毎秒選び替える」+「ごっこ」) を維持している。C246 で「ゲート名から『ごっこ』を排除、機能名『1行コンセプトゲート』に変更」(devlog §1 ゲート名リネーム注) という再リネーム判断はあるが、軸名自体の形式は fill-in-the-blank のまま。**Margaris の (b)(c) リスク領域に依然滞留**しているが、「軸名が空白で立たない」状態とは違うので「軸立て成立」と判定。

### 要素2: 受け手が 5 秒で説明できる入り口 — **演出強化に逃げた**

**根拠**: HTML `<p>` line 17 で操作キー列挙「← → ↑ ↓ / WASD MOVE · SHIFT FOCUS · Z FOCUS BURST · SPACE START / BOMB(B) / DEF(D) / RETRY · M MUTE」= 操作キー **6 個 + ゲージ要素 3 個**を初見プレイヤーに 5 秒で把握させる構造ではない。

**コード対応**: `spawnWave1()` line 352 で 3 秒間 popup「HOLD SHIFT = FOCUS (narrow shot)」表示 (Mir 4 分類診断「探索障壁強度高」を受けた hint)、`drawHUD()` line 922-928 で TOKEN 達成後のみ Z キー HUD 表示 (C219 で C1 改修 = TOKEN 未達時も grey 表示する else 節追加で改善されたが、HUD line への注視前提)。

**判定根拠**:
- implementation-notes.md §1 分岐 2 自己批判 (line 42)「操作キー 6 個は初プレイ 30 秒で全部押される設計か?」= Log 自身が「30 秒」を基準にしている時点で「5 秒」基準を満たしていない自認
- devlog §2 Q-X3 で「wave 4 (= 約 22-30 秒目) で focus tutorial」と設計されている = 軸の伝達経路が **30 秒目に到達してようやく**生じる
- oktamajun 2026-05-21 00:01「mimicry_log は graze とゲームデザイン的に何が違うのか全く分からなかった。画面が揺れるだけ？」(principles.md 132 行で引用) = 外部 player の実観測として「5 秒入り口」失敗の歴史的記録あり
- wave 1 popup と HUD hint は **演出層** (UI 表示) で軸を補強する経路。コア挙動側 (= 弾を撃つだけで何かが起きる) に「軸を 5 秒で気づかせる」設計が組み込まれていない = 演出への退避

**「演出強化に逃げた」と判定する根拠**: 軸を伝える経路が「コア挙動が軸を体現する力」ではなく「UI 表示 + tutorial 配置」に依存している。C219 C1 改修 (Z キー常時表示) も同方向で、「軸を立てる代わりに UI で補う」設計。principles.md 99 行「軸を立てても演出強化に逃げる可能性」の **実例 N=1 確定** にあたる。

### 要素3: コア挙動が軸を体現 — **軸立て成立**

**根拠**: focus mode 5 効果 + focus burst + wave 10 miniboss path 切替 が「間合いを選び替える」軸を数値・物理レベルで体現している。

**コード対応**:
- `curHitR()` / `curGrazeR()` / `curMoveK()` (line 185-198) = focus 中の操作応答が「狭く・遅く・精密」に動的変化 = 「間合いの狭広」が player 体感に直結
- `shotCooldownF()` (line 203-209) = 弾 spread + DPS が focus 中 1/3 spread + 1.3x DPS に変化 = 「narrow shot」物理化
- `spawnWave10MiniBoss()` (line 400-408) + miniboss phase 切替 (line 516-530) = 2 秒毎に「narrow path (focus 推奨)」と「spread path (normal 推奨)」が切り替わる = **「毎秒選び替える」軸の最も鮮明な物理化**
- `triggerFocusBurst()` (line 336-346) = token 3 消費で 60f 強化 = judgement 第 2 軸 (= burst を「いつ使うか」を player が選ぶ)

**判定根拠**: 軸 → コア機構への伝播が成立。focus mode が「単なる視覚演出」ではなく操作応答の数値変化 (hit 半径 0.5x など) で軸を体現している。wave 10 boss の path 切替は「軸が立たないと作れない」設計 (narrow/spread の 2 値選択は「間合い選択」軸の存在を前提とする)。

**未解決領域**: wave 5-9 で「focus を使う場合と使わない場合の差」が体感に届くかは未確定 (devlog S2 撤回トリガー「judgement 利得 30 秒に 1 回以上」が実プレイ未判定)。ただし機構レベルでは軸が物理化されているので「軸立て成立」と判定。

### 要素4: 演出剥がしても残る — **軸立て成立**

**根拠**: 演出層 (vignette / 自機青リング / hit dot 可視化 / 撃破粒子 0.7x 減衰 / popup) を全て剥がしても、数値構造 (focus 5 効果 / burst / token / large hp 9 / miniboss path 切替) は残る。

**コード対応 (剥がした時に残るもの)**:
- 残る: `FOCUS_MOVE/SPREAD/DPS/HIT/GRAZE` 定数とその参照経路 (`curHitR/curGrazeR/curMoveK/shotCooldownF/spawnPlayerBullets`)
- 残る: `state.focusTokens` 加算条件 (line 598-610) + `triggerFocusBurst()` 機構
- 残る: large 敵 HP 9 + wave 10 miniboss 3 体配置 + miniboss phase 切替ロジック
- 剥がれる: `createRadialGradient` vignette (line 858-864 周辺) / 自機リング 2 重 / hit dot 可視化 / 撃破粒子 `focusK=0.7` 減衰 / popup 全般

**判定根拠**: 演出を剥がした後の「核」= focus mode の数値変化 + token 蓄積 + burst = が「軸を体現する機構」として独立に成立。これは brick_log v04-v06 (principles.md 110 行) の「ミミクリ軸を立てずパラメータ往復」事例と対比すると明確 — v02 は数値構造が軸に従属している。

**ただし**: 「演出を剥がしても軸が残る (= 物理的に存在する)」と「演出を剥がしても player が軸を認識できる」は別問題。S4 撤回トリガー「視覚シグナル埋没」が未判定 = vignette + 自機リング + hit dot 可視化を全部剥がすと **player が focus 中であることを認識できなくなる**可能性。要素4 は「軸の物理的存続」軸として「成立」、ただし「軸の認知可能性」は別軸 (要素2 と接続) で課題が残る。

### 総合判定

| 要素 | 判定 | 主な根拠 |
|---|---|---|
| 1. どんな ___ ごっこ | 軸立て成立 (条件付き) | 軸名明示済、ただし Margaris fill-in-the-blank 懸念領域 |
| 2. 受け手が 5 秒で説明できる入り口 | **演出強化に逃げた** | popup + HUD hint への依存、wave 4 (30 秒) まで軸伝達経路なし |
| 3. コア挙動が軸を体現 | 軸立て成立 | focus 5 効果 + burst + miniboss path 切替 で物理化 |
| 4. 演出剥がしても残る | 軸立て成立 | 数値構造が独立に成立、ただし認知層は別軸 |

**N=1 観測結論**: 4 要素中 3 要素 (1, 3, 4) で「軸立て成立」、1 要素 (要素 2) で「演出強化に逃げた」を確定。**「ミミクリ軸 → ゲーム挙動変更」の伝播は機構レベルで成立 (要素 3, 4)、ただし「ミミクリ軸 → 受け手目線の入り口設計」への伝播は不成立 (要素 2)**。

### principles.md 候補軸への波及判定

principles.md 99 行「軸を立てても演出強化に逃げる可能性」を mimicry_log v01 着地 (因果操作ごっこ) の逆方向検証材料として記録していた件について、本評価は **「v02 では軸立て成立 3/4 + 演出強化逃避 1/4」という二重判定**を提供する:

- **軸を立てた効果は機構伝播に現れる** (要素 3, 4 で確定) = ミミクリ軸候補の有効性を部分的に裏付け
- **入り口設計層では依然演出に逃げる** (要素 2 で確定) = 「軸を立てるだけでは入り口設計は救えない」を裏付け = principles.md C218 Phase 3 R 層 2 分割案 (R-design / R-presentation) の「設計層 vs プレゼン層は別軸」仮説 (line 144-164) を間接補強

**原則化判定への寄与**: N=4+ 移行の決定的トリガーには **N=1 観測なので依然不足**。同型観測を **mimicry_log v03 (= 軸を立てたまま入り口設計を改善する試行)** で重ねる必要がある。本評価は「候補段階維持」を強める方向ではあるが、「原則化に進む」方向への寄与はしない (= 判定機構優先 M-40 整合)。

### 接続

- [`projects/principles.md`](../../../projects/principles.md) §2026-05-31 C274 Phase 3 追記 — 本評価の波及先 (Phase 4 完了時に「次の一手」へ 1 行追記)
- [`memory/game_lessons_log.md`](../../../memory/game_lessons_log.md) R-I 抽象ルール — 本 4 要素チェックの派生元 (元 R-I は「着手前 30 本 + 提出前自己判定」、本 4 要素はミミクリ軸検証用派生運用)
- [`memory/feedback_means_ends_reversal_check.md`](../../../memory/feedback_means_ends_reversal_check.md) — 要素 2「演出強化に逃げた」判定の理論根拠
- Nao_u 2026-05-21 05:50 #all-nao-u-lab oktamajun 「mimicry_log は graze とゲームデザイン的に何が違うのか全く分からなかった」= 要素 2 失敗の歴史的記録
