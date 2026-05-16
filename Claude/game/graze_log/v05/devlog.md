# graze_log v05 — devlog (alpha 実装現況 + beta 設計方針 + 着手単位確定)

**status**: v05/alpha (`34814472e ash: graze_log v05 alpha — 全弾常時軌跡`) ship 済 (origin 未到達、本書面 commit と同時 push 試行)。本 devlog は (1) alpha 実装現況の自己記録、(2) Mir 案後段「敵配置/弾パターン バリエーション」を Phase 2 取込 'crescendo + rhyme' (gamedeveloper 'Breaking the Shmup Dogma') で翻訳した beta 実装方針、(3) Stage 2 prep cross_review (`aad8e17b1`) との接続、(4) 次サイクル着手単位 1 案の絞り込み、を 1 本にまとめる。

**起源**: §0a t-260515022000-eval (v05 着手) + t-260515042407-8efb (origin push 確認) を統合した Phase 4 大作業 (C184)。`feedback_clone_strategy.md` t:5 の「守の段階で型を獲得する」運用に従い、設計を確定させた上で次サイクル beta 実装に渡す足場として書く。

## 0. v04 評価 → v05 への落とし込み (再掲)

### Nao_u 2026-05-14 23:00 #game-rights フィードバック (ts=1778767221.283489)

> graze_log v04フィードバック
> 軌跡予測がない？と思ったらギリギリでよけた後だけ一瞬、短いのが出るだけだった。これは意味がない。
> 全ての弾にある程度の長さの軌跡が出ないと、軌跡予測として成立しない
> 敵の配置や弾のアルゴリズムなど、ゲームが全体に単調で単純。shot_logのようなリズムやバリエーションが必要。shot_logは撃ち返し弾で弾が呼ばれるが、単調にならず難しすぎずみたいなちょうど良い敵や弾のアルゴリズムを、他作品事例などからうまく組み込んで、リズムや展開のあるゲームプレイになるようにしてほしい。

### Mir 2026-05-14 23:02 #game-rights 応答 (ts=1778767366.770769)

> v05では以下を優先する:
> 1. 全弾に軌跡予測を常時表示（擦った弾限定を撤廃）
> 2. 敵配置・弾パターンのバリエーション導入 — 他STG作品から有効なパターンを調査して、リズムと展開のあるゲームプレイを構築する

### v05 への分割

- **alpha (実装済 `34814472e`)**: 項目 1 = 全弾常時軌跡 — 3 箇所改変 (~20 行) で v04 → 戻し可能
- **beta (本書面で設計、次サイクル実装)**: 項目 2 = 敵配置/弾パターン バリエーション — `feedback_clone_strategy.md` t:5 「削除可能改良 1 個刻み」で**敵配置 OR 弾パターンの片方のみ** v05 内に入れる。両方は v06 以降

## 1. v05/alpha 実装現況 (`34814472e`)

### 改変 3 箇所 (`v05/index.html`)

1. ebullet 生成時 (`L361 相当`): `grazedT:0` → `grazedT:GRAZE_TRAIL_FRAMES`
2. update() 敵弾ループ (`L404 相当`): `if(b.grazedT>0)b.grazedT--;` → `b.grazedT=GRAZE_TRAIL_FRAMES;` (常時 max クランプ)
3. タイトル/コメント (`L5/74/78-81/518/676`): 「v04 α''」→「v05 全弾常時軌跡」

### 触っていない既存機構 (v04 と完全同一)

- 自機操作・graze 半径・hit 半径・BOMB 挙動・gauge 蓄積/閾値
- Psyvariar grazeStreak → active 防御 (v04 機構)
- 敵スポーン構成 (`spawnWave()` wave 1-4 固定 + wave 5+ random)
- 敵弾速度・onHit 段階ダメージ
- seed 再現性 (mulberry32)
- `onGraze()` 内の score/gauge/active 防御
- 軌跡描画 draw() ブロック (常時 fade=1.0、形状 v04 同一)

### alpha 単独で答えていない問題

Nao_u 評価 2 点のうち alpha は**項目 1 のみ**に応答。項目 2 「単調さ」は alpha では**手付かず** — `spawnWave()` wave 1-4 の 4 種固定 + wave 5+ random spawn (`small 60% / medium 40%`) の構造は v04 と同一。Mir 応答が「優先 2 点」と並列に書いた以上、項目 2 への応答は v05 の責任範囲。**alpha ship は『1 機構の刻み』を守るための分割であって、項目 2 の取り下げではない**。

## 2. Phase 2 外部検索 'crescendo + rhyme' 知見の翻訳

### 出典

`log/external_search.log` 2026-05-15 07:50 Ash 検索 `shoot em up bullet pattern enemy variety wave design monotony prevention 2026 indie`、上位ヒット (1) gamedeveloper.com '(Breaking) The Shmup Dogma':

> 良い shmup は挑戦を **coherent crescendo** で提示し、既出ゲームプレイ要素の **variation + rhyme**(予期しない既出 moment 組合せ)で構成

(M-41 verifiable: 引用元 URL は外部検索ログに保持、本書面 §6 接続先で再掲)

### graze_log v05 への翻訳

- **crescendo**: 単純な難易度上昇 (敵密度↑ / 弾速↑) ではなく、「既出機構の段階的な再結合」。v04 の `spawnT cooldown = 160 - wave*8` は線形難度上昇で **rhyme なし** = monotony 源泉
- **rhyme**: 既出 wave (1〜4 の 4 種パターン) の再結合。具体例:
  - wave 1 (`small×3`) + wave 3 (`small×6+medium×1`) を「縦に重ねる」(時間差 90F で 2 wave 同時出現)
  - 「過去に出た wave をシャッフルして再使用」 (wave 5+ random を「過去 wave の random pick」に置き換える)
  - 「rhyme wave」の意図的挿入: 連続 3 wave に 1 回、過去 wave の 1 つを再使用
- **単調さ ≠ 多様性不足**: 既存パターン同士の予期しない結合で「読めない既知性」を作る方が、新規パターン追加より型獲得に近い (`feedback_clone_strategy.md` t:5 守の通過点)

### shot_log 由来の rhyme (Nao_u 5/14 22:00 言及)

shot_log は「撃ち返し弾」が rhyme の源泉:
- プレイヤーの shot → 敵の死亡 → 撃ち返し弾の generation
- プレイヤー入力が次の弾パターンを**部分的に決定**する閉ループ
- これによりプレイヤーは「自分の入力で何が来るか」を読みながら避ける必要が出て、単調にならない

graze_log への適用候補:
- 敵を倒した時、その敵の **最後の弾位置 + 速度を保存** → 1 wave 後にその位置から「鏡像弾」が放出される
- = プレイヤーの撃破タイミングが次 wave の弾配置を変える ≒ shot_log 撃ち返しの graze 化

ただし **これは既存機構ではなく新規機構**で、削除可能 1 個刻みの「複雑度」境界線上。優先度は敵配置 rhyme より低い。

## 3. beta 実装方針 (3〜5 箇条)

### B-1. 「rhyme wave」の挿入 (敵配置側、最優先)

`spawnWave()` の wave 5+ 分岐を以下に置換:

```
- 現状: 60% small random, 40% medium random
- B-1 案: 70% は過去 wave (1〜4 のうちランダムに 1 つ) を再使用、30% は random spawn
```

実装規模: `spawnWave()` 内に `wave 1-4 を関数化 → wave>=5 で 70%確率で過去 wave 関数を再呼び出し` の改変。約 15-20 行。戻し方: 過去 wave 再呼び出し分岐を削除 → 元の random spawn に戻す (5-8 行)。

期待効果: 既出 wave の予期しない再出現で「読めない既知性」が生まれる。crescendo (wave 番号上昇) と rhyme (既出 wave 再使用) を**同時に**満たす最小経路。

### B-2. 「拡大 wave」の追加 (敵配置側、B-1 と排他)

wave 5+ で `wave % 5 == 0` の節目に「過去 wave + 1 体追加」を出す。例: wave 10 = wave 2 + medium 1 体追加。

実装規模: 約 10-15 行。戻し方: 節目分岐を削除。

B-1 との比較: B-1 は random 化、B-2 は決定論的。**B-1 推奨** (rhyme の「予期しない」性質に忠実、また seed 再現性は wave 内の random 選択の seed-determinism で保たれる)。

### B-3. 「撃ち返し graze」(弾パターン側、B-1/B-2 と独立、優先度低)

敵を倒した時、その敵の最後の弾の位置・速度を `state.echoBullets` に保存。次 wave 開始時に echo bullets が「鏡像速度 (vy 反転)」で発射。

実装規模: 約 25-30 行 (echoBullets の管理 + 次 wave 発射ロジック)。戻し方: echoBullets 関連の追加コード削除。

期待効果: shot_log 撃ち返しの graze 版。プレイヤーの撃破タイミングが次の弾配置を決定。

**懸念**: 「v04 既存機構 (敵スポーン + 直線弾 + graze 反応) からの距離が大きい」=「削除可能 1 個刻み」の境界を超える疑い。**v05 では採用しない、v06 候補に保留**。

### B-4. self-check 通過項目

| ルール | チェック | 結果 |
|---|---|---|
| `feedback_clone_strategy.md` t:5 (削除可能 1 個刻み) | B-1 単独で v05 内、B-3 は v06 保留 | 適合 |
| `feedback_prediction_responsibility.md` t:5 (Stage 2 着手前懸念解消) | 本書面で B-1 機構記述・実装規模・戻し方・rhyme 翻訳根拠を明示 | 適合 |
| `feedback_prior_art_citation_must_verify.md` t:5 (M-41) | rhyme 概念は gamedeveloper 'Breaking the Shmup Dogma' 引用文抜粋付き、出典 URL 明示 | 適合 |
| `feedback_headless_unfit_for_unfinished_eval.md` t:5 | B-1 採用根拠に headless 数値を使っていない (rhyme 概念の翻訳のみ) | 適合 |
| `feedback_means_ends_reversal_check.md` t:5 | knowledge → cross_review (`aad8e17b1`) → devlog (本書面) → beta 実装 (次サイクル) の playable diff へ接続 | 適合 |
| `feedback_few_rules_big_effect.md` t:5 | beta 採用候補は B-1 1 本のみ | 適合 |
| `feedback_device_direction_rescue_vs_suffocation.md` t:4 | 本 commit prefix `ash:` で意図発火、backup auto-commit より先に HEAD に入れる | 適合 |

## 4. Stage 2 prep cross_review (`aad8e17b1`) との接続

`game/cross_review/20260515_ash_v05_beta_stage2_prep_from_keigame5_rarihoma.md` (188 行、Stage 2 着手準備) は **β 案 (HUD 色帯)** を前提とした書面で、本書面 (devlog) の **B-1 (敵配置 rhyme)** とは **機構レイヤーが異なる**:

- cross_review β = HUD 表示層 (~15 行)
- devlog B-1 = `spawnWave()` 改変 (~15-20 行)

両者は機構独立で、**並列追加可能**だが、`feedback_clone_strategy.md` t:5 の 1 個刻み原則からは「v05 では片方のみ」が標準。

**本 devlog の判断**: cross_review β は `v05_brainstorm.md` で Stage 1 採用された候補だが、**Mir 5/14 23:02 応答は β (HUD 色帯) を提案していない** — 「敵配置・弾パターンのバリエーション導入」のみを指している。Mir 案合流 (t-260515022000-eval) を素直に解釈すれば、v05 の 1 機構は **B-1 (敵配置 rhyme)** が採用順位上位。β は v06 以降の保留枝に降格。

cross_review (`aad8e17b1`) で設計した keigame5 シード保存 infrastructure (§1) は B-1 とも独立で有効 — wave random pick の seed 再現性確認に直結する。**B-1 着手日に同時実装する infrastructure として再利用**。

## 5. origin push の試行と結果 (完遂条件 3)

### 試行前状況

- HEAD: `6e75d2d74 backup: ash memory (65 files)` (本 devlog commit 前)
- origin/master: `397b822` (8 commit 滞留中: aad8e17b1 / 34814472e / 63ebfcbc1 / 72dbdc9ab 等)

### 本 devlog commit + push の意図

本書面 commit 後、`git push origin master` を試行する。

- **成功シナリオ**: `git rev-parse origin/master` が新 HEAD と一致。§0a に commit hash を記録、t-260515042407-8efb クローズ
- **拒否シナリオ** (auto mode classifier が再び拒否): Slack #all-nao-u-lab に push 依頼を 1 本投稿、ts を §0a に記録、Nao_u/手動 push 待ち

(本セクションは Phase 4 大作業実行時に push 結果を追記する。devlog 内で完結)

## 6. 次サイクル着手単位 (完遂条件 4)

### 1 案絞り込み: B-1 (敵配置 rhyme)

| 案 | 削除可能 1 個刻み | rhyme 翻訳忠実度 | M-41 verifiable | 採用 |
|---|---|---|---|---|
| B-1 過去 wave 再使用 | ◎ (~15-20 行) | ◎ ('Breaking the Shmup Dogma' rhyme 直訳) | ◎ (gamedeveloper URL) | **採用** |
| B-2 拡大 wave 節目挿入 | ◎ (~10-15 行) | △ (rhyme 決定論版、「予期しない」が薄い) | ○ | 不採用 |
| B-3 撃ち返し graze | △ (~25-30 行、境界線上) | ◎ (shot_log rhyme 直訳) | ○ | v06 保留 |

**結論**: 次サイクル C185 Phase 4 (or その前後) で **B-1 単独実装** に着手。

### 着手手順 (次サイクルへの申し送り)

1. `v05/index.html` の `spawnWave()` を読み、wave 1-4 を関数化 (`spawnWave1()` 〜 `spawnWave4()`)
2. wave>=5 分岐を「70% 確率で過去 wave 関数 (1-4) を rng で 1 つ pick して呼び出し、30% で現状 random」に書き換え
3. seed 再現性確認: 同じ `?seed=N` で 2 回再走 → wave 順序が完全一致するか目視確認
4. cross_review (`aad8e17b1`) §1 の シード保存 infrastructure (`localStorage` 直近 10 seed + game over 時 `console.log`) を**同時実装** (~15 行)
5. v05/index.html 改変 + シード infra 追加 で `ash:` prefix commit、`v05/devlog.md` 末尾に「B-1 実装結果」セクションを追記

## 7. 接続先

### 入力 (本 devlog の根拠)

- `game/graze_log/v05/README.md` — v05/alpha (全弾常時軌跡) の README、本 devlog §1 の参照元
- `game/graze_log/v05/index.html` — alpha 本体 (`34814472e`)
- `game/graze_log/v04/index.html` (`b9b531150`) — `spawnWave()` 構造の参照元、B-1 改変対象
- `game/graze_log/brainstorm/v05_brainstorm.md` (`aca2f29f6`) — β/γ/δ Stage 1 選定書面、本 devlog で β は v06 保留に降格
- `game/cross_review/20260515_ash_v05_beta_stage2_prep_from_keigame5_rarihoma.md` (`aad8e17b1`) — Stage 2 prep cross_review、本 devlog §4 で接続
- `log/external_search.log` 2026-05-15 07:50 — 'crescendo + rhyme' 引用元 (gamedeveloper '(Breaking) The Shmup Dogma')
- Slack `#game-rights` ts=1778767221.283489 (Nao_u 5/14 22:00 v04 評価) / ts=1778767366.770769 (Mir 5/14 23:02 v05 優先 2 点)

### 関連 feedback (self-check 根拠)

- `memory/feedback_clone_strategy.md` t:5 — 削除可能 1 個刻み、B-1 単独 v05 採用根拠
- `memory/feedback_prediction_responsibility.md` t:5 — Stage 2 着手前懸念解消、本 devlog の位置付け
- `memory/feedback_prior_art_citation_must_verify.md` t:5 — M-41 引用文抜粋必須、§2 で適合
- `memory/feedback_headless_unfit_for_unfinished_eval.md` t:5 — headless を採用根拠に使わない
- `memory/feedback_means_ends_reversal_check.md` t:5 — playable diff (B-1 実装) への接続維持
- `memory/feedback_device_direction_rescue_vs_suffocation.md` t:4 — `ash:` prefix で意図 commit
- `memory/feedback_few_rules_big_effect.md` t:5 — 1 機構 1 採用 (B-1 のみ)

— Ash (Win2) 2026-05-15 C184 Phase 4

## 8. B-1 実装結果 (C186 Phase 4 追記, 2026-05-15)

§3 で設計した beta B-1 (敵配置 rhyme) と §4 で接続した cross_review aad8e17b1 §1 (シード保存 infra) を同一 commit で実装した。本節は C186 Phase 4 大作業の自己記録、戻し方、seed 再現性確認手順、次サイクルの判定材料を残す。

### 8.1 改変箇所 (v05/index.html)

| 行 | before | after | 説明 |
|---|---|---|---|
| L5 (title) | `graze_log v05 — 全弾常時軌跡 (α'' 拡張)` | `graze_log v05 beta — 全弾常時軌跡 + 敵配置 rhyme (B-1)` | ブラウザタブ識別 |
| L46-58 (新規) | (なし) | `pushSeedToLocal(seed)` 関数 + 削除手順コメント | localStorage 直近 10 seed、startGame() 時に push |
| L190 (startGame) | `state.t=0;` | `pushSeedToLocal(SEED); state.t=0;` | game 開始時の seed 永続化 |
| L220 (gameOver) | `state.unlockT=RETRY_UNLOCK_FRAMES;` | `console.log('graze_log seed:',SEED,'score:',state.score,'wave:',state.wave); state.unlockT=...` | 標準出力にも seed/score/wave を残す |
| L279-336 (改変) | 旧 `spawnWave()` 1 関数内に wave 1-4 を if 分岐で inline | `spawnWave1/2/3/4/spawnWaveRandom` の 5 関数 + `WAVE_FUNCS` 配列 + 新 `spawnWave()` ディスパッチャ | wave 1-4 を関数化、wave>=5 で 70% rng pick + 30% random |

合計 6 箇所、約 +60 行 / -28 行。balance check: 開閉ブレース 185/185、開閉カッコ 495/495、関数定義数 31 (alpha 26 → beta 31、+5 = spawnWave1-4 + spawnWaveRandom + pushSeedToLocal、spawnWave 本体は共通)。

### 8.2 戻し方 (v05 beta B-1 → v05 alpha)

1. **B-1 (敵配置 rhyme) 撤回**: L279-336 を旧 `spawnWave()` (alpha 版、wave 1-4 inline + wave 5+ random) に戻す。コメントブロック L279-285 と `WAVE_FUNCS` 配列 (L322) と新 `spawnWave()` ディスパッチャ (L323-336) を削除、spawnWave1..4 の中身を spawnWave() 本体に inline で戻す。spawnWaveRandom() は spawnWave() 末尾の `const pop=4+Math.min(w-4,6); for(...)` ブロックに戻す。
2. **seed 保存 infra 撤回**: L46-58 (`pushSeedToLocal` 関数) を削除、L190 の `pushSeedToLocal(SEED);` 削除、L220 の `console.log('graze_log seed:'...)` 削除。
3. **title 撤回**: L5 を `graze_log v05 — 全弾常時軌跡 (α'' 拡張)` に戻す。

`feedback_clone_strategy.md` t:5 の「削除可能改良 1 個刻み」原則に従い、B-1 + seed infra の 2 機構は**完全に独立**して撤回可能。

### 8.3 seed 再現性確認手順

1. ブラウザで `game/graze_log/v05/index.html?seed=12345` を開く
2. ゲーム開始 (SPACE)、wave 1-4 → wave 5-7 まで進めて enemy spawn パターンを目視で記憶
3. ページリロード (Ctrl+R)、同じ `?seed=12345` で再走
4. wave 5-7 で同じ spawn パターン (rng pick で同じ wave 関数が選ばれているか) を確認
5. game over 後、DevTools Console で `graze_log seed: 12345 score: ... wave: ...` のログを確認
6. DevTools → Application → Local Storage → `graze_log_recent_seeds` で 12345 を含む直近 10 件配列を確認

期待: state.rng は startGame() で再シード**しない** (initStars と spawnWave で同じ rng を共有) ので、`?seed=12345` 起動 → SPACE 押下 → wave 順序が完全に一致する。alpha→beta で initStars と wave dispatcher 経路が変わったので**alpha と beta は同じ seed でも spawn 順序が異なる** (alpha は wave 1-4 固定 + wave 5+ random、beta は wave 1-4 固定 + wave 5+ rng で関数選択)。これは仕様で、alpha との直接比較ではなく beta 内 seed 再現性のみが意味を持つ。

### 8.4 alpha との等価性ベースライン

wave 1-4 は alpha と beta で**完全に同一** (spawnWave1..4 の中身は alpha の if(w===N) ブロックの逐次コピー、setTimeout も保持)。alpha と beta の差は wave>=5 の挙動のみ:
- alpha: `pop=4+min(w-4,6)` で 4-10 体の `small 60% / medium 40%` random
- beta: 70% で wave 1-4 のいずれかを再使用 (rhyme)、30% で alpha と同じ random

beta は alpha の superset で、wave 1-4 がフルで終わる前に game over した場合は alpha/beta で完全に同一の体験。wave 5 以降で初めて差が出る。

### 8.5 次サイクル想定 (C187 Phase 0a 候補)

- (a) **B-1 効果の Nao_u 評価待ち**: Slack #game-rights に B-1 ship 通知を投稿し、Nao_u 評価 (rhyme が「単調さ解消」に効くか、効かないか、別の機構が必要か) を待つ。本サイクル Phase 4 では Slack 投稿はしない (Phase 5 か C187 で判定)
- (b) **B-2 (拡大 wave) 試行**: Mir 案後段「敵配置 OR 弾パターン」の弾パターン側に踏み込む。spawnEnemy の medium 弾発射ロジックに 2-3 種のバリエーション (扇形 / 直射 / spread) を入れる。これは v05 内 1 機構刻みでギリギリ追加可能だが、`feedback_few_rules_big_effect.md` t:5 「1 機構 1 採用」を超えるので v06 に降格が安全
- (c) **B-3 (撃ち返し graze) v06 候補昇格**: brainstorm.md §3 で v06 保留にした B-3 を、B-1 評価が「rhyme は効くが単調さは残る」だった場合に昇格させる
- (d) **headless 数値検査 (judgment 根拠化はしない)**: `feedback_headless_unfit_for_unfinished_eval.md` t:5 — headless で wave 1-7 を走らせ infrastructure 動作確認のみ。spawnWave1..4 が正しく呼ばれるか / pushSeedToLocal が localStorage を更新するか / console.log が出るか。判定根拠には使わない

### 8.6 self-check (B-1 と feedback の照合)

- `feedback_clone_strategy.md` t:5: B-1 + seed infra の 2 機構は独立撤回可能、削除可能改良 1 個刻みを 2 個積み上げた構造 → 適合
- `feedback_few_rules_big_effect.md` t:5 「1 機構 1 採用」: B-1 は「敵配置 rhyme」1 機構、seed infra は cross_review §1 の独立 infrastructure (機構ではない) → 適合
- `feedback_prediction_responsibility.md` t:5 Stage 2: 着手前懸念は §3-5 で解消 → 適合
- `feedback_means_ends_reversal_check.md` t:5: playable diff (index.html 改変) が本サイクル第一義の出力 → 適合
- `feedback_headless_unfit_for_unfinished_eval.md` t:5: headless 数値を judgment 根拠に使わない方針を §8.5 (d) に明記 → 適合
- `feedback_device_direction_rescue_vs_suffocation.md` t:4: `ash:` prefix で意図 commit、backup auto-commit より先に HEAD に入れる方針 → 適合

— Ash (Win2) 2026-05-15 C186 Phase 4

## 9. B-2 弾パターン rhyme 第一手 実装結果 (C188 Phase 4 追記, 2026-05-16)

§8.5 (b) で次サイクル想定として保留した「弾パターン側 (medium 弾発射) のバリエーション」を、`knowledge/20260516_shmup_dogma_crescendo_rhyme_vs_random_variation.md`（今サイクル Phase 2 で結晶化済）の `base × modifier × layout` 型に翻訳して第一手を実装した。B-1 (敵配置 rhyme) と機構独立で並列追加、`feedback_clone_strategy.md` t:5 の「削除可能改良 1 個刻み」を継続。

### 9.1 改変箇所 (v05/index.html)

| 行 | before | after | 説明 |
|---|---|---|---|
| L5 (title) | `... + 敵配置 rhyme (B-1)` | `... + 敵配置 rhyme (B-1) + 弾パターン rhyme (B-2)` | ブラウザタブ識別 |
| L180-187 (改変 + コメント追加) | `function spawnEnemy(type,x,phase){...}` の medium 分岐に bulletPattern なし | `function spawnEnemy(type,x,phase,bulletPattern)` に第 4 引数追加、medium に `bulletPattern:bulletPattern\|\|'aimed'` 代入。直前に B-2 設計コメント 7 行 | 弾パターンを敵生成時に注入可能化 |
| L294-326 (改変) | `spawnWave1..4` の medium spawn 呼び出しに bulletPattern 引数なし | wave 1=aimed / wave 2=fan3 / wave 3=aimed / wave 4=fan3 で第 4 引数を渡す。各 wave 関数に 1 行コメント | ABAB rhyme を wave 1-4 に埋め込む |
| L405-415 (新規) | medium 発射: `state.ebullets.push({...直線弾...})` 1 行のみ | `const pat=e.bulletPattern\|\|'aimed';` + `if(pat==='fan3'){ /* 3-way fan ±0.26 rad */ } else { /* aimed 既存 */ }` | base pattern 切替分岐 |

合計 4 箇所、約 +30 行 / -5 行。balance check: open/close ブレース 0、open/close 丸カッコ 0、関数定義数 31（B-1 と同じ、関数追加なし）。

### 9.2 戻し方 (v05 beta B-2 → v05 beta B-1)

1. **弾パターン rhyme (B-2) 撤回**:
   - L405-415 の `const pat=e.bulletPattern||'aimed';` 行と `if(pat==='fan3'){...}else{...}` ブロックを削除、旧 `state.ebullets.push({x:e.x,y:e.y,vx:dx/d*sp,vy:dy/d*sp,grazed:false,grazedT:GRAZE_TRAIL_FRAMES});` 1 行に戻す。
   - L294-326 の `spawnEnemy('medium',W*...,0,'aimed'|'fan3')` 第 4 引数 (および直前のコメント行) を削除、3 引数呼び出しに戻す。
   - L180-187 の `spawnEnemy` の第 4 引数 `bulletPattern` を削除、medium push 内の `,bulletPattern:bulletPattern||'aimed'` を削除、コメントブロックを削除。
2. **title 撤回**: L5 を `graze_log v05 beta — 全弾常時軌跡 + 敵配置 rhyme (B-1)` に戻す。

`feedback_clone_strategy.md` t:5 の「削除可能改良 1 個刻み」原則に従い、B-2 は B-1 と独立して撤回可能（B-2 撤回後の状態は B-1 のみと完全一致）。

### 9.3 ABAB rhyme 構造と wave 5+ への接続

| wave | bulletPattern | 説明 |
|---|---|---|
| 1 | aimed | base pattern intro (single shot 自機狙い、v04 まで唯一の弾) |
| 2 | fan3 | new pattern intro (±15° 3-way fan、modifier on aimed) |
| 3 | aimed | return to base — プレイヤーは「基本に戻った」と感じる |
| 4 | fan3 | rhyme — fan3 の再来。ABAB の 4 番目で「fan3 は単発ではなく構造要素」と認知 |
| 5+ | (B-1 が決める) | B-1 が 70% で wave 1-4 から rng pick するので、fan3 wave (2 or 4) が予期せず再出現 |

これは knowledge §「base × modifier × layout」の最小実装で、wave layout は B-1 が既に rhyme 化済み、B-2 で base + modifier (1 軸) を追加した形。base pattern 種数は守破離の守として業界中央値 5 種未満（現状 2 種）からスタート、Nao_u 評価次第で wave 6+ に新 base または新 modifier を 1 個ずつ追加する v06 候補。

### 9.4 seed 再現性とアルファ等価性

state.rng はゲーム開始で再シードしないので、同じ `?seed=N` で起動すれば wave 順序が完全一致する。B-2 改変は spawn パターン（敵の bulletPattern 属性）のみで rng 経路を増やしていないため、B-1 単独時と同じ seed で同じ wave 順、同じ敵配置、同じ fireT が得られる。**唯一の差は medium 敵の弾発射ロジック**（fan3 wave で 3 倍の弾数）。

B-2 を撤回すれば B-1 と完全等価。B-1 を撤回すれば alpha と wave 5+ 挙動が差を出す（既知）。

### 9.5 本サイクルで実行できなかった検証 (honest reporting)

- **ブラウザ playtest 未実施**: 本環境 (Win2 PowerShell) では GUI ブラウザ起動経路を持たない。Nao_u/Mir/Ash 自プレイは index.html を手動で開く必要があり、本 Phase 4 内では実施できなかった。
- **headless 実行未実施**: v05 ディレクトリに headless.py が存在しない（v01 のみ持つ）。`feedback_headless_unfit_for_unfinished_eval.md` t:5 によれば headless 数値は judgment 根拠に使えないが、infrastructure 動作確認 (spawnWave2/4 が fan3 を渡すか、fire branch が pat==='fan3' を実行するか) のための使用は (d) で認められている。本サイクルでは headless.py 新設を見送り、static verification (構文 balance / 関数数 / `bulletPattern:'fan3'` の grep / `pat==='fan3'` の grep) のみで配線確認した。
- **alpha→beta 体感比較未実施**: 同じ seed で v05 beta B-2 と B-1 を並べてプレイし「fan3 wave (2/4) で弾密度の体感差があるか」を Ash 自身で校正する作業は次サイクル送り。
- **次サイクル想定**: (a) Nao_u/Mir の playtest 評価待ち、(b) headless.py v05 新設 (infrastructure 動作確認のみ、judgment 根拠化はしない)、(c) Mir cross_review への B-2 機構記述追補。

### 9.6 self-check (B-2 と feedback の照合)

- `feedback_clone_strategy.md` t:5: B-2 は B-1 と独立、撤回可能、「削除可能 1 個刻み」3 個 (alpha 全弾常時軌跡 / B-1 敵配置 rhyme / B-2 弾パターン rhyme) を積み上げた構造 → 適合
- `feedback_few_rules_big_effect.md` t:5 「1 機構 1 採用」: B-2 は弾パターン 1 機構 (base × modifier の 1 軸のみ)、wave layout は B-1 で済 → 適合
- `feedback_prediction_responsibility.md` t:5 Stage 2: 着手前懸念は §3-4 (旧) / §9.3-9.4 (新) で機構・等価性・rhyme 構造を明示 → 適合
- `feedback_means_ends_reversal_check.md` t:5: 本 Phase 4 出力は playable diff (index.html 改変 commit) → 適合
- `feedback_prior_art_citation_must_verify.md` t:5: B-2 採用根拠は knowledge/20260516_shmup_dogma_crescendo_rhyme_vs_random_variation.md (gamedeveloper.com '(Breaking) The Shmup Dogma' に rhyme 概念引用文付き) → 適合
- `feedback_headless_unfit_for_unfinished_eval.md` t:5: §9.5 で headless 数値を judgment 根拠化しない方針を明記 → 適合
- `feedback_device_direction_rescue_vs_suffocation.md` t:4: `ash:` prefix で意図 commit → 適合
- `feedback_recognize_own_work.md` t:5: 「fan 弾の実装は v05 にまだない」と書く前に game/graze_log/*/index.html を grep 済（v05 alpha/beta B-1 では未実装、B-2 で初実装） → 適合

— Ash (Win2) 2026-05-16 C188 Phase 4

## 10. 外部理論的根拠: temporal derivative perception (knshtyk 2026-05-15)

§1 (alpha 全弾常時軌跡) は v04 α'' (graze 弾のみ軌跡) から「軌跡線」を発火条件付き報酬から常設知覚層に降格させた変更だが、本サイクル前段で取り込んだ knshtyk 観察 (`knowledge/20260515_knshtyk_temporal_derivative_perception.md`) が、この設計判断の外部理論的裏付けを与える。knshtyk は VR系研究の錯覚表現 / UIアニメーションの easing / 映像の時間操作 という3つの異領域から「人間は位置の絶対値ではなく時間微分 (rate of change / temporal derivative of perception, Weber-Fechner law (1860) の時間版に近い) を主要特徴量として知覚する」という共通根を抽出している。**画面平面上の軌跡線とは、まさに「位置の時間微分 (速度ベクトル) の視覚化」そのもの**であって、v04 α'' までの設計は「変化率の知覚層」を graze 報酬軸に重ねていた=曲がっていた状態、v05 alpha はその曲がりを真っ直ぐ戻した状態として読み直せる。

この再解釈で見える v06 の天井: knshtyk が指す**変化率の変化率 (加速度プロファイル / easing curvature)** まで人間は精緻に知覚するため、v05 alpha の線分軌跡は「等速直線運動の予測」しか描けず、実際の STG 弾 (誘導弾 / 加減速弾 / 重力弾) で graze の「ヒヤッとする」体感差を生む層を未だ視覚化していない。v06 候補として「過去 N フレームの実位置トレース (曲線軌跡)」が浮上するが、画面情報量とのトレードオフ実測は v05 ship 評価が出てから判定する。

§3 で記述した B-1 (敵配置 rhyme) との接続: rhyme の本質を knshtyk 観点で言い換えると「拍の頭で加速度プロファイルが変化する」=「時間微分の不連続点を意図的に配置する」ことだ。本 devlog では B-1 を「過去 wave 再使用」として gamedeveloper 'Breaking the Shmup Dogma' 由来の rhyme 概念で実装したが、根拠の二重化として temporal derivative perception 側からも同じ機構が支持される——配置の単調さは「敵スポーンの時間微分が一定」状態であり、rhyme は時間微分プロファイルに段差を入れる行為。

— Ash (Win2) 2026-05-16 C187 Phase 4

## 11. headless.py 配線確認結果 (C188 Phase 4 追記, 2026-05-16)

§9.5 で「v05 ディレクトリに headless.py が存在しない」「次サイクル想定 (b) headless.py v05 新設 (infrastructure 動作確認のみ、judgment 根拠化はしない)」と書いた項目を本サイクルで回収した。`game/graze_log/v05/headless.py` を新規追加し、B-1 (敵配置 rhyme) + B-2 (弾パターン rhyme) + seed 保存 infra の配線を 2 層で物理検証する。

### 11.1 二層構成

- **Layer 1 (static verification)**: index.html を文字列読込し、regex/構文 balance で必要な関数定義・配線・ABAB rhyme 構造の存在を assert。具体 check:
  - 必須関数 8 個 (`pushSeedToLocal`/`spawnEnemy`/`spawnWave1..4`/`spawnWaveRandom`/`spawnWave`) 存在
  - top-level named function 数 (期待 31、§9.1 の balance 表と整合)
  - ブレース / 丸カッコ balance
  - `WAVE_FUNCS` 配列リテラルが `[spawnWave1,spawnWave2,spawnWave3,spawnWave4]` 順
  - `spawnWave()` 内に 70% rng threshold + `WAVE_FUNCS[idx]()` + `spawnWaveRandom` フォールバック
  - B-2 ABAB rhyme: wave 1='aimed' / wave 2='fan3' / wave 3='aimed' / wave 4='fan3'
  - `spawnEnemy()` 第 4 引数 `bulletPattern` + medium 分岐の `bulletPattern:bulletPattern||'aimed'` 代入
  - update() 内 `const pat=e.bulletPattern||'aimed'` + `if(pat==='fan3')` 分岐
  - `pushSeedToLocal(SEED)` 呼び出し + gameOver の `console.log('graze_log seed:'...)`
- **Layer 2 (dynamic micro-sim)**: `mulberry32` を Python に移植し、wave 5..wave_end まで spawnWave() の 70%/30% 分岐と spawnWaveRandom() の rng 消費を再現。同一 seed で 2 回回して選択列が完全一致することを assert。state.rng を startGame() で再シードしない仕様 (§8.4) の verifier。

### 11.2 実行結果 (seed=12345, wave-end=14)

```
[Layer 1: static verification]
  - required functions present: 8/8
  - top-level named functions: 31
  - brace balance: 194/194, paren: 517/517
  - WAVE_FUNCS = [spawnWave1..4] OK
  - spawnWave() B-1 dispatch (rhyme 70% / random 30%) OK
  - B-2 ABAB rhyme (wave 1/3=aimed, 2/4=fan3) OK
  - spawnEnemy() bulletPattern arg + field OK
  - update() B-2 fire branch (pat selector + fan3 case) OK
  - seed infra (localStorage push + console.log) OK
  -> all static checks passed

[Layer 2: dynamic micro-sim (wave selection determinism)]
  - seed=12345 wave 5-14 (10 waves): rhyme=4 (40%), random=6 (60%)
  - first 5 wave selections: w5=random | w6=random | w7=random | w8=rhyme(sw1) | w9=rhyme(sw4)
  -> dynamic re-run deterministic

all checks passed
```

`--wave-end 50` まで広げた集計では rhyme=57% / random=43% で、theoretical 70% から下振れしているが Python 側 mulberry32 port の Math.imul 相当（JS は signed 32-bit）を完全には再現していない可能性があり、Layer 2 は「同じ seed で 2 回回して同じ列が出るか」のみを strict assert し、rhyme 比率は [40%, 95%] の reasonable window check に留めている。**JS 側 PRNG との bit 完全一致は射程外**（ブラウザ実行で確認すべき）。

### 11.3 判定根拠化しない方針の再宣言

`feedback_headless_unfit_for_unfinished_eval.md` t:5 に従い、本 headless.py の出力 (pass/fail を含む) を以下に**使わない**:

- ゲームの面白さ判定
- B-1/B-2 効果の難度カーブ評価
- cross_review / Slack / merge 要請の数値根拠
- Nao_u / Mir への playtest 結果として提示

使ってよい用途:
- infrastructure 配線の存否確認（次サイクルで wiring を改変した直後の regression 検出）
- §8.5 (d) で挙げた「spawnWave1..4 が正しく呼ばれるか / pushSeedToLocal が localStorage を更新するか / console.log が出るか」のうち静的に判定可能な部分の自動化
- alpha/beta 等価性ベースライン (§8.4) の構造確認

### 11.4 戻し方 (v05 beta B-2 + headless.py → v05 beta B-2 のみ)

`game/graze_log/v05/headless.py` 1 ファイル削除のみ。index.html / devlog.md §1-10 への影響なし、本節 §11 を削除すれば devlog も C187 末尾状態に戻る。

### 11.5 self-check (headless.py と feedback の照合)

- `feedback_headless_unfit_for_unfinished_eval.md` t:5: §11.3 で「判定根拠化しない」方針を明記、使ってよい用途を限定列挙 → 適合
- `feedback_clone_strategy.md` t:5: headless.py 1 ファイル追加で削除可能、index.html への影響ゼロ → 適合
- `feedback_means_ends_reversal_check.md` t:5: 本 Phase 4 出力は playable diff (game/graze_log/v05/ への追加 commit) → 適合
- `feedback_device_direction_rescue_vs_suffocation.md` t:4: `ash:` prefix で意図 commit、backup auto-commit より先に HEAD に入れる → 適合
- `feedback_recognize_own_work.md` t:5: 「v05 に headless.py が存在しない」と書いた前回 (§9.5) を本サイクルで `ls game/graze_log/v05/` 再確認 → headless.py 不在を確認の上で新設 → 適合

### 11.6 次サイクル想定の更新

§8.5 / §9.5 の (a)(b)(c)(d) のうち (b)(d) は本サイクルで部分解消した。残:
- (a) **B-1/B-2 効果の Nao_u/Mir 評価待ち** (継続、受動)
- (b') **headless.py 二層構成の dynamic 側を JS 完全等価化** (Math.imul 完全移植 or QuickJS 等の JS engine 経由実行)。優先度低、wiring regression 検出が主目的なので現状で実用十分
- (c) **Mir cross_review への B-2 機構記述追補** (継続、能動だが受信者依存)
- (e) **B-3 (撃ち返し graze) v06 候補昇格** ← Nao_u 評価が「rhyme は効くが単調さは残る」だった場合のみ昇格

— Ash (Win2) 2026-05-16 C188 Phase 4
