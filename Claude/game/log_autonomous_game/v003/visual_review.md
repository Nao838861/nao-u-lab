# log_autonomous_game v003 — visual_review.md

**作成**: 2026-06-01 C282 Phase 4 (Log)
**対象**: `game/log_autonomous_game/v003/` (Echo-Path v003)
**役割**: Log 側で実施可能な目視チェック項目を列挙する出荷文書 + 本 v003 で新設した **ジュース監査** 節。

## 0. Log 制約の明示

Log は GUI 操作能力欠如のため、本ファイルのチェックは **コードレビュー + 静的データ確認 + ヘッドレス連続フレーム (capture_frames.js 段階1)** の範囲に限定する。

- `game.js` / `index.html` のソースを読んで色・座標・条件式・描画順序を確認できる
- `verify.js` / `bullet_origin_audit.js` / `enemy_behavior_audit.js` / `agent_difficulty_proxy.js` / `proxy_icc_diagnose.py` / `instinct_probe.js` の数値結果を読める
- `capture_frames.js` で puppeteer-core 経由の 1 フレーム取得は実施可能 (C265 Phase 4 段階1 PASS)、連続フレーム判定は段階2 で着手予定
- **実ブラウザで画面を見て体感判定することは不可** (PASS と書けない項目は UNKNOWN とし、実機判定者 = Nao_u / Mir / Ash に判定委譲)

## 1. v002 から v003 への差分視点

v002 から v003 の主な変更点 (game.js 上の確認可能箇所):
- **C271 Phase 3 弾尾追加** (`game.js:537-549`): 弾本体に過去 6 frame ベクトル方向の短い尾 (alpha 0.35, 長さ 12px) を追加。Boghog 経験則「single stray bullets are hard to read」への直処方 + self_judgment v003 Q-D 4.0/5 根拠への二重独立到達。1 原則違反は弾尾長を castLock 1秒予測の 1/10 (6frame) に抑制 + alpha 控えめで pre-mortem 緩和済
- **proxy_icc_diagnose.py** (`v003/proxy_icc_diagnose.py`, kaizen #137 段階1 PASS): ICC(2,1) 4 列 ≈ 0 / FAIL = seed_base 軸では系統差ゼロ、class 軸切替実験が段階2 候補
- **instinct_probe.js** (`v003/instinct_probe.js`, C281 Phase 4): castLock 解除後 6 frame 窓内の方向トークン変化を「本能側応答密度」として最小計測 — **C282 Phase 4 で物理的再定義** (§3 参照)

## 2. チェック項目 (PASS / UNKNOWN 判定付き)

### V-01 タイトル画面の構成
- **判定**: PASS (v002 から無変更)
- **観点**: タイトル + 副題 + PRESS SPACE のみ、操作説明列挙なし
- **根拠**: `game.js:467` `Echo-Path` / `:471` `あなたの足跡が、これから歩く道になる` / `:477` `PRESS SPACE`、`index.html:27` `.note` 2 行のみ
- **逸脱兆候**: なし

### V-02 タイトル画面の動的視覚要素ゼロ
- **判定**: PASS (v002 Δ-1 継承)
- **観点**: 未来ゴースト + 結線が `drawTitle()` に残存していないこと (1 原則 violation 回帰防止)
- **根拠**: `game.js:453-479` 内に `ctx.strokeStyle` の trail 系描画なし、`fillText` + 静止キャラ円のみ
- **逸脱兆候**: なし

### V-03 HUD 面積 10% 以下 (Q-E)
- **判定**: PASS
- **観点**: HUD 文字列が画面の極小領域に閉じる
- **根拠**: `game.js:590` `Relay hit:N miss:N idle:N` (左上 12px) / `:593` `wave:N t:Ns` (右上 12px) 2 ヶ所のみ、画面比 ≈ 2.2%
- **逸脱兆候**: なし

### V-04 1 原則「内側→外側流出」プレイ画面ゼロ違反
- **判定**: PASS (C271 弾尾追加後も維持)
- **観点**: 予測軌道線・×印・未来ゴースト末端マーカーが drawPlaying に存在しないこと、弾尾は過去ベクトルのみ
- **根拠**: `game.js:533-554` の弾尾は `b.x - b.vx * 6` で **過去 6 frame 方向** = 物理的に未来予測ではない。`drawPlaying()` 全域に `ghost / predict / future / marker` 描画ロジックなし。`bullet_origin_audit.js` PASS
- **逸脱兆候**: なし (弾尾追加は 1 原則境界の再判定を伴ったが、過去ベクトル可視化として整合 — `feedback_inside_to_outside_leak.md` 末尾 NextMars refine 節と整合)

### V-05 弾尾 (C271 追加要素) の視覚ノイズ評価
- **判定**: UNKNOWN
- **観点**: 弾尾 (rgba(255,184,120,0.35), 6frame, 12px) が弾本体読み取りを阻害していないか
- **根拠 (静的)**: alpha 0.35 は背景 #05070b に対し控えめ、6frame は ECHO_FRAMES (60frame) の 1/10、弾本体 r とは独立描画 (`fillStyle '#ffb878'` で本体は不透明)
- **実機判定必要**: 高密度 wave 2/3 時に弾尾が重なって 1 原則違反 (視覚ノイズ → 弾本体判別困難) が発生しないか
- **判定委譲先**: Nao_u / Mir / Ash 実機プレイ時

### V-06 capture_frames.js による段階2 連続フレーム取得
- **判定**: PASS (C282 Phase 4, 2026-06-02 確定)
- **観点**: 段階1 (1 フレーム取得) は PASS、段階2 = `--duration N` / `--interval F` 引数化 + 60 枚連番取得 + meta.jsonl 整合
- **根拠**:
  - `capture_frames.js` に `parseArgs()` 追加 (process.argv 2 引数 `--duration` `--interval` をパース、`FRAME_COUNT = (duration * 60) / interval` で算出)
  - `node capture_frames.js --duration 60 --interval 60` 実行 → `frames/frame_0001.png〜frame_0060.png` 60 枚 + `meta.jsonl` 60 行生成、exit 0
  - meta 列: idx=1 frames=124 / idx=4 frames=306 / idx=5+ frames=320 (= 自動ランダムウォーク agent が wave 1 frame 320 で死亡 = 段階3 C271 死亡 frame 321 と整合 ±1F)
- **段階2 自動 run の限界**: 自動 agent は Space を押さないため castLock/resolveLock 発火ゼロ (HUD `Relay hit:0 miss:0 idle:1`)、resolveLock 直後窓の経験的観察は本 run では取得できない → 経験観察は実機判定 (Nao_u/Mir/Ash) に委譲、capture_frames 経路はインフラ整備として段階2 PASS

## 3. ジュース監査 (本 v003 新設、C282 Phase 2 §2 起票)

**契機**: 本サイクル C282 Phase 2 で取得した shared-reads 3 ソース (Wayline「The Juice Problem」/ ACM CHI 2024「How does Juicy Game Feedback Motivate?」/ 濱村 6/01 09:15「本能側 + 逆算側の複合」) が **独立同型として「本能側強化には天井があり、超えると action-feedback link が切れて competence が下がる」** を主張。これを v003 の Q-成功FB 状態 1/2/3 に対する自己診断軸として導入する。

### 3.1 監査基準: 1 行動 1 強フィードバック原則

- **強フィードバック** = (a) 画面の 5% 以上を占める視覚変化 (b) 高彩度色 (rgba alpha ≥ 0.6) (c) アニメーション (時間軸を持つ描画変化) のいずれか 2 つ以上を満たす描画イベント
- **PASS 条件**: 1 つの castLock 成功イベントに対し同時発火する強フィードバック数 **N=1** を維持
- **WARN 条件**: N≥2 で因果関係 (どの強フィードバックが何の成功を示すか) が視覚的に隠れる懸念

### 3.2 監査対象: castLock 成功時の状態 1/2/3 (C240 Phase 4 完了)

#### J-01 状態1 (castLock 発動不可リング, `game.js:512-525`)
- **強フィードバック数 (静的計測)**: **N=1** (グレー薄リング 1 つのみ、alpha 0.22-0.40 で強度は閾値以下)
- **判定**: PASS (alpha が強フィードバック閾値 0.6 未満で、定義上「弱フィードバック」に分類される。情報伝達は機能するが「強」の天井議論からは免責)
- **行動**: castLock を「撃てる/撃てない」事前提示 (状態予告) であり、行動の結果フィードバックではない
- **メモ**: ACM CHI 2024 言う「action-feedback link」の link 側 (結果) ではなく **action 前段の予告** のため、ジュース監査の射程外と判定して良いか自問: 含めて良い。理由 = 予告も視覚情報のノイズ床を上げるため、状態 1 alpha 高めにすると後段の状態 2/3 を覆い隠す可能性あり、現状の控えめ alpha は天井議論と整合

#### J-02 状態2 (シアン薄爆発, `game.js:562-573`)
- **強フィードバック数 (静的計測)**: **N=1** (シアン薄爆発リング 1 つ、alpha 0.32 → 0、半径膨張 4 → 30 px、30 frame)
- **判定**: PASS (alpha 0.32 で閾値 0.6 未満だが、アニメーション (半径膨張 + alpha 減衰) を持つため強フィードバック条件 (c) 単独で満たす)
- **行動**: castLock 成功 (resolveLock 発火) で **敵弾交差なし = 意味薄 hit** を控えめ伝達
- **メモ**: 状態 3 (危機回避メッセージ) より淡く・小さくの設計 (`game.js:563` コメント) は 1 行動 1 強FB の天井ではなく強度階差設計と整合。Wayline「juice for the sake of juice」批判への防御として、意味薄 hit を強くしない選択は正解

#### J-03 状態3 (危機回避メッセージ, `game.js:577-585`)
- **強フィードバック数 (静的計測)**: **N=1** (シアン文字 22px bold, alpha 1.0 → 0, 45 frame, 画面中央 H*0.42)
- **判定**: PASS (alpha 1.0 から開始, 22px bold = 高彩度高サイズ、明確に強フィードバック)
- **行動**: castLock 成功 + 敵弾交差あり = **本来の意味的成功 (危機を回避した)** を強伝達
- **メモ**: 状態 2 (alpha 0.32) と階差を持ち、状態 3 のみ画面中央テキスト = 視覚的注意の階差設計が成立。ACM CHI 2024「competence 媒介変数」議論で「成功を成功として認知させる」役割を最も強く担う。**ただし監査懸念**: 状態 3 発火時に弾尾 (V-05) + シアン薄爆発の残光 (状態 2 終了直後 0-15 frame は alpha 残存) + メッセージ文字が **同 frame で重畳する可能性あり** = 実機で N≥2 観測される瞬間がないか、capture_frames.js 段階2 (連続フレーム) で確認すべき次の一手

#### J-04 状態 2 → 状態 3 遷移時の重畳リスク
- **判定**: PASS (C282 Phase 4, 2026-06-02 確定)
- **観点**: 状態 2 (30 frame 持続) + 状態 3 (45 frame 持続) が同 frame で重畳発火するか
- **根拠 (構造証明)**: 同 frame での重畳は **構造的に発生し得ない**
  1. **単一 resolveLock 内の排他**: `game.js:206-211` の resolveLock 本体は `if (e.hadBullets) game.lockMessage = ... else game.lockExplosion = ...` の if/else 排他分岐 = **1 回の resolveLock で 2 変数同時更新は不可能**
  2. **連続 resolveLock の最小間隔**: `castLock()` は `game.js:190` で `if (game.echo) return` により echo 中の再 cast 不可。`updateEcho()` は `game.js:226` で `elapsed >= ECHO_FRAMES (=60)` に達した時のみ resolveLock 発火し `game.echo = null`。**よって連続する 2 つの resolveLock 呼出間隔 ≥ 60 frame**
  3. **描画寿命との比較**: 各変数の描画寿命は lockExplosion 30 frame (`game.js:564`) / lockMessage 45 frame (`game.js:577`)。**両寿命 < 60 frame の最小間隔** = 次 resolveLock が新変数を立てる前に前 resolveLock の変数は age 上限を超えて非描画域へ遷移
- **結論**: lockExplosion と lockMessage が同 frame で両方とも描画条件 (age < 寿命) を満たす状況は構造上不可能 → **J-04 PASS**
- **経験補強の限界**: C282 Phase 4 で `capture_frames.js --duration 60 --interval 60` を実行したが、自動ランダムウォーク agent は Space を押さないため resolveLock 発火ゼロ (HUD `Relay hit:0 miss:0 idle:1`)。実 resolveLock 直後 0-30 frame の経験観察は **実機判定 (Nao_u/Mir/Ash)** に委譲。本 J-04 PASS は構造証明により確定し、経験観察は確認補強であって判定の必要条件ではない

### 3.3 監査結果サマリ (C282 Phase 4 2026-06-02 確定)

- **PASS**: J-01 / J-02 / J-03 / **J-04** (J-04 は resolveLock if/else 排他 + ECHO_FRAMES=60 > max(45, 30) 寿命の構造証明により確定)
- **UNKNOWN**: なし
- **総合判定**: v003 は Wayline / ACM 2024 / 濱村 3 ソース独立同型「本能側強化天井」議論に対し、現状の Q-成功FB 3 状態は天井議論を意識した強度階差設計 (J-01 弱 / J-02 中 / J-03 強) で整合、加えて同時発火の構造的排他 (J-04) も保証。**v004 以降の追加強フィードバック導入時にこの監査を必ず再実施**する運用契約として本節を残置

### 3.4 監査の自己批判 (反証ライン)

- **本監査自体が「逆算側の道具」で本能側を測っている可能性**: J-01/J-02/J-03 の N=1 判定は alpha 閾値 0.6 とサイズ閾値 5% という静的指標であり、これらは Wayline / ACM 2024 が本能側強化の天井議論で言及する「認知負荷」「action-feedback link 切断」とは異なる軸 — 直接相関未検証。**しかし出発点として静的監査を導入する価値はある** (天井議論への意識を v003 開発に物理化する効果はゼロではない)
- **N=1 閾値の経験則妥当性**: 「同時発火する強フィードバック数 N=1」は本サイクル C282 Phase 2 で導出した暫定基準で、業界 SOTA 実装事例の系統的検証は未実施。v004 以降で「N=2 を意図的に試した時に何が起きるか」の比較実験ができれば閾値の根拠が強化される

## 4. 次の一手 (Phase 4 完遂条件外、C283 以降候補)

- **J-04 確定**: resolveLock コード詳読 + capture_frames 段階2 (連続フレーム) で状態 2/3 重畳の有無を物理確認
- **instinct_probe.js 物理的再定義の実機投入**: 本サイクル C282 Phase 4 で docstring 更新 = action-feedback link 切断指標として再定義したが、実測の 3 trial 分散観測は未実施 (kaizen #138 段階 2 と並列で C283-C290 観測期間内に実施)
- **v004 設計時のジュース監査前提化**: 本節を v004 着手前の必読項目として `design_log.md` 8 ゲートに「Q-Juice 監査前提」を追加する候補 (起票は C283 以降、本サイクルでは visual_review.md 内に節として置くのみ)
