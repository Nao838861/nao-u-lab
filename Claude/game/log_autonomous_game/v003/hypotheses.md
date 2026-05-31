# log_autonomous_game v003 — hypotheses.md

PEARSON_BLOCKER.md L4 ルール (C276 追加) 「Pearson gate 未解除中の playable diff は新規仮説 1 個 + その検証用 diff だけ許可」の **初適用記録**。

ルール本体: `Pearson gate 未解除中の game/log_autonomous_game/v003/ への playable diff は「新規仮説 1 個 + その検証用 diff」だけ許可、「触ってみた」型 diff は禁止。`

---

## H-001 phase 0 第 1 wave の y-stagger 拡大による「Q-導入 teaser」効果 (C276 Phase 4, 2026-06-01, Log)

**仮説**:
phase 0 (0-20s, 学習導入) の **最初の wave のみ**、敵 A の y-stagger を現状 40 px (= 28 frame 遅延 / 0.47s) から **168 px (= 120 frame 遅延 / 2.0s)** に拡大すると、先行 1 体が単独で約 2 秒間プレイヤーに視認される **「teaser → 本体 2 体」構造** が成立する。

このとき以下が起きると予測する:
- (a) **Q-導入 (敵出現パターン明示) 採点が改善** = プレイヤーは単独敵の挙動 (vy=1.4 直進・shootCooldown 60 後の射撃) を「孤立観測条件」で学習でき、後続 2 体が到来する時には弾源パターンが認知済みになる
- (b) **Q-D (予測軌道) 体感の補強** = 単独敵から発射される弾 (1 発、画面下半身狙い) は段階3 弾尾 6F とあわせて方向認知が容易、密集弾幕より先に「1 弾の運動を読む」予行演習が成立する
- (c) **悪手 4 方針 (camper/lane-holder/blind-sweeper/nospecial) の全死亡は維持** = teaser 期間に死ぬパターンは増えにくく (1 体は脅威が薄い)、本体 2 体到来時に死ぬパターンが大半。verify.js pass:true 維持が予測の前提条件

**反証ライン** (Pre-mortem):
- (a-反) wave 1 が「易しすぎ」になり、本体到来前に castLock を覚えないままで進む → 後続 wave 2 (phase 1, A+D 同時) でカモられる体感が増す可能性。観察手段: verify.js 各方針の `survived_frames` が現行より延びていないか確認
- (b-反) teaser 期間中の単独敵 1 体は射撃前に画面上端 (y < 0) を抜けてしまう可能性 (y=-20 → y_gate 突入まで `(20)/1.4 = 14 frame`、cooldown 初期 60 → 射撃前に gate 退場せず OK 試算)。観察手段: verify.js 死因 `death_cause` 分布を現行と比較
- (c-反) teaser → 本体の構造がプレイヤーには「単に最初 1 体しか出てこない遅れた wave」と読まれ、Q-導入効果が成立せず Q-A (進行ペース) の体感が逆に劣化する可能性。観察手段: Phase 5 Slack 出荷後の実機判定 (Nao_u/Mir/Ash)、自己判定では未確認

**検証用 diff** (本 commit に含めるもの):
1. `game.js`: `spawnWaveA()` 関数内、`waveCount === 0` (= phase 0 第 1 wave) の場合のみ y-stagger を 40 → 168 に切替。1 定数追加 + 1 行条件分岐 + 1 行 y 式変更 = 約 3-5 行差分
2. `verify.js`: 同型 `spawnWaveA(state)` 関数を同じ条件で同じ stagger 切替 (game.js と完全同型維持、verify 整合性)
3. 観測: `node verify.js` で `pass: true` 維持 (悪手 4 方針 90s 内全死亡)、各方針の `survived_frames` を H-001 適用前後で記録 (`self_judgment.md` Q-導入節へ 1 行追記)

**判定装置位置確認 (R-A)**: 本仮説検証は自己批判 verify.js + 自己観察 = **自己判定精度の補強**、確定採点は依然 Nao_u/Mir/Ash 実機判定が条件 (R-A 順守、判定装置=最終確認装置)。

**外部知見裏付け** (R 層):
- design_log §Q-導入「最初の wave は学習プロトコル」設計意図 (起票時 C238 系) に teaser 機構を追加する直処方
- game_lessons_log.md R-A「最初の wave で 1 種の挙動だけを孤立観測させる」一般則 (Pulse Relay 70-90s カーブ第1段「4-12s 学習」の局所化)

**期待される C277 以降の継続課題**:
- 実機判定 (Nao_u/Mir/Ash) で teaser 構造が「親切」と読まれるか「冗長」と読まれるかの判定 → 5/5 確定 or 撤回 (revert は 1 commit)
- teaser 時間長 (2.0s) の幅探索 (1.0s / 1.5s / 2.5s) は実機判定後に検討
- phase 1/2 では従来通り 40 stagger 維持 = phase 進行で「学習→展開」の落差を保つ設計
