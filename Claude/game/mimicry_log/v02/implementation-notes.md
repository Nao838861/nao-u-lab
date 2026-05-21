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
