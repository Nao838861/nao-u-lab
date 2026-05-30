---
name: 自分の現在進行形は観測対象から外れる
description: Slackログ偏重で git/実時刻を見ない / Phase 2 が Phase 1 の幻覚タイムスタンプに乗る / 重複Slack投稿パターン
type: feedback
---

# 自分の現在進行形は観測対象から外れる

**ルール**: Phase 1 / Phase 2 で Slack archive の jsonl だけを見て判断しない。**実時刻 (slack_bot.py history)** と **git status / 直近commit / 編集中ファイル更新時刻** を併走で見る。

**Why（原典 + 連続事案）**:

## 原典 (Nao_u 直接処方)

「流れてないよ。いまもLogとやっているよ。自分のことなのに、これは見えないんだね。面白い」

私が「Nao_u が流れた／Solver self-play 限界実証」と書いた瞬間、Nao_u は shot_log v01/index.html を直接編集中だった。3点重なり:
1. **Slack ログ偏重** (git status 未確認)
2. **既存理論への適合** (「流れた」仮説が既に書かれていた)
3. **書く側への没入** (自分の analysis の慣性で観察を歪めた)

## 連続事案 1: 2026-05-03 19:22 Phase 2 Slack 重複投稿

**事象**:
- Phase 1 §2 で「Ash 17:33/17:57 graze_log v02 PR proposal — Log/Mir merge判断依頼（最新2回連続のリクエスト、対応未済）」と記述
- 実際の slack_bot.py history で確認すると Ash の 5/3 game-rights 投稿は **10:57 (graze_log v02 cross_review) と 00:54 (M-40) の2件のみ**。17:33/17:57 は **存在しない (幻覚)**
- Phase 2 はそれを前提に「graze_log v02 merge 判断 (Slack 19:36 投稿済)」「M-40 二層分離採用 (Slack 19:38 投稿済)」と書いた
- **ところが**: Log は **同日 11:25 に既に同じ内容を投稿済** (game-rights 11:25:18 graze_log v02 merge / 11:25:30 M-40 二層分離採用)
- 結果: Phase 2 が 19:17:57 / 19:18:38 に **重複投稿** を実行 (実時刻はさらに「19:36 頃」とも mismatch)

**3点重なり (原典と同型)**:
1. **Slack archive jsonl 偏重** — 最終更新 11:09 のキャッシュを見て、その後の自分の 11:25 投稿が見えなかった
2. **既存理論への適合** — 「Ash が連続提案して Log 未応答」という構図に Phase 1 が乗ってしまい、自分の 11:25 投稿の存在を取りこぼした
3. **書く側への没入** — Phase 2 で「判定: A」「判定: 採用」と書いている間、自分が朝に既に同じ判定を出した事実が観察対象から外れた

## How to apply (両事案からの処方)

### 構造強制 (Phase 1 必須項目)

1. **`git status` を必ず実行** (既存処方、再徹底)
2. **直近 5 commit を必ず読む** (既存処方、再徹底)
3. **編集中ファイル更新時刻**を Mir/Ash 側ファイルも含めて確認 (既存処方)
4. **【新】Slack 関連タスクは jsonl archive ではなく `python slack_bot.py history <channel> 30` を実行**して当日の自分の投稿を確認する
5. **【新】Phase 2 で Slack 投稿を検討する前に、当日同チャンネルでの自分の投稿があるかを `slack_bot.py history` で確認**

### 観察の三角化

- 同じ事象を 2 つ以上の観測経路 (jsonl + slack_bot history / git log + ファイル mtime / Slack + drafts/.archive) で照合してから判断
- 1 経路だけで「未応答」「未着手」「対応未済」と書かない

### 自己投稿存在確認 (Phase 2 必須項目)

- Phase 2 で「Slack 投稿する」と書く前に: 当日 drafts/.archive/<date>/ + slack_bot history を **両方** 確認
- 重複投稿は雑音生成 = Nao_u の時間を奪う = M-40 上位ゲート違反

### 投稿後の事後検証

- Phase 3 で実投稿時刻を記録する (Phase 2 が「19:36 頃」と書いて実時刻 19:17:57 だった例) → タイムスタンプは推測でなく `slack_bot history` で確認した値を書く

## メタ観察

- Phase 1 自体に幻覚タイムスタンプ ("17:33/17:57") が混入した事実は、Phase 1 構造強制 (git status / 編集中ファイル) だけでは防げなかった
- Slack 偏重作業 (Phase 1 §2 / Phase 2 §1-§2) では **Slack 側にも独立観測経路を追加する必要**がある
- 「観察結果と既存理論が一致する瞬間」が最も危険 — 一致した瞬間に検証を強める

## 連続事案 2: 2026-05-09 C172 Phase 2 自己診断幻覚 → Phase 3 が連鎖（再帰的盲点）

**事象**: Log C172 Phase 1 §1 で「2026-05-08 21:28 super_bonochin → Log 21:32:19 応答済」等 4件を正しく記録（実際 ts 1778243539/544/1778252746/927 すべて user_id=U0AM1F23FQU=Log で確認可能）。**ところが Phase 2 §0 が「4件すべて Mir」と幻覚自己診断を書いた**。Phase 3（本記述）開始時に user_id 列を `python -c "import json"` で直接確認するまで、Phase 3 自身も Phase 2 の幻覚自己診断を信じて feedback_self_perception_blindness.md と instance_divergence_observability.md に「Coordination drift 事例」として書き込んでしまった（書き込み後に Slack archive 直接確認で誤りに気づき、本連続事案2 の記述を全面書き直し）。

**この事象の構造的特異性**:
- 連続事案1（5/3 19:22）= **Phase 2 が Phase 1 の幻覚に乗った**（Phase 1 タイムスタンプ "17:33/17:57" 幻覚 → Phase 2 がその上で重複投稿）
- 連続事案2（5/9 C172）= **Phase 3 が Phase 2 の幻覚自己診断に乗った**（Phase 1 は正しい → Phase 2 が「Phase 1 が誤り」と幻覚自己診断 → Phase 3 がそれを真として記憶ファイル更新）

**自己診断の幻覚の方が前段の幻覚より発見遅延が大きい**:
- Phase 1 の幻覚（タイムスタンプ）は事実検証で捕捉可能（ts 検索で当該行が無いと分かる）
- Phase 2 の自己診断幻覚は「自己批判の正当性」が事実検証より優先されやすく、検証経路自体が短絡される
- 「自己批判している自分は警戒している」という錯覚が、自己批判内容の真偽検証を弱める = 「規律のある収束」(memory/feedback_self_perception_blindness.md 既存メタ観察) の悪用

**3点重なり（連続事案1の重なりが Phase 1→2 ではなく Phase 2→3 へ移動した形）**:
1. **Slack archive 偏重**（既存パターン）— Phase 2 が user_id 列を見ずに「ユーザー特定」を実行
2. **既存理論への適合**（既存パターン、より深刻な形）— 「Log は自分の応答を見落とす」既存メタ観察への過剰適合で、自分が正しく応答したケースを「見落とした」と誤解釈
3. **【新】自己批判への没入** — Phase 2 が「誤記を検出した」物語に没入し、検証経路（user_id 直接確認）を踏まずに Phase 3 へ申し送り

**How to apply（連続事案1の処方では捕捉できない部分の追加）**:
- **Phase 3 開始時に Phase 2 自己診断の根拠を1件以上事実検証する**（次サイクルから cycle_staging テンプレ反映候補）。具体的には Phase 2 §0 が「Phase 1 §X が誤り」と書いたら、Phase 3 §0 として該当 Phase 1 §X の根拠（ts / user_id / git log 等）を1次情報で再確認してから記憶ファイル更新に進む
- **Slack 投稿の user 識別は user_id (U0AM1F23FQU=Log / U0ALW4DKTT7=Mir / U0AMQKE69BJ=Ash) で行う**。タイムスタンプ近接 + 推定で識別しない
- **「自己批判している自分」を信じない**: 自己批判内容も外部経路で検証する。memory/feedback_self_perception_blindness.md 既存メタ観察「観察結果と既存理論が一致する瞬間が最も危険」は **自己批判結果と既存理論の一致** にも適用される

**接続**: projects/instance_divergence_observability.md 2026-05-09 履歴で本事象を「Phase 2→3 連鎖盲点」として記録。Coordination drift（arXiv 2601.04170）の3分類のうち本事象は **Behavioral drift**（cycle_staging テンプレ運用の経路依存）寄りで、Coordination drift（自他境界）ではなかった——分類ミスを修正。

## 連続事案 3: 2026-05-10 C175 Phase 1 §1 単一インスタンス視点による「未対応」誤判定（Cola DLM 自己回帰 vs 並列デノイズの構造類比）

**事象**: Log C175 Phase 1 §1 で #nao-u 直近12件のうち「未対応6件」と書いた。Phase 2 §0 で実態確認すると **5/6 件は既に Log/Ash/Mir のいずれかが #all-nao-u-lab または #shared-reads で応答済み**。残未対応は _akhaliq Cola DLM 1件のみだった（Phase 2 で投稿し解消）。Phase 3 §0 で user_id 5件直接検証（U0AM1F23FQU=Log / U0AMQKE69BJ=Ash / U0ALW4DKTT7=Mir）し Phase 2 §0 の自己診断は事実通りと確定。

**根本原因**: Phase 1 §1 の「応答済」確認が **Log 単一視点**（自分が #all-nao-u-lab に投稿しているか）で実行された。Ash/Mir の応答は本来 jsonl から user_id で識別可能だが、Phase 1 §1 のテンプレ「Log 応答済 N件」の枠が単一インスタンス視点を強制していた。

**Cola DLM 構造類比（同サイクル Phase 2 §1 で投稿）**: 自己回帰逐次性 = Phase 1 で誤判定すると下流まで貫通する性質。並列デノイズ = Phase 1 §1 出力に **横断応答済の user_id 列 + 確信度マーカー** を併記すれば、Phase 2 が再判定可能になる。

**How to apply（連続事案1/2 の処方の上に追加する Phase 1 側の構造強制）**:
- **Phase 1 §1 「未対応」判定は user_id 横断確認**: Log/Ash/Mir 3者の user_id (U0AM1F23FQU/U0AMQKE69BJ/U0ALW4DKTT7) で `log/slack_archive/all-nao-u-lab.jsonl` と `shared-reads.jsonl` を grep し、3者のいずれかでもヒットすれば「対応済」と判定。Log 単独視点で「未対応」と書かない。
- **Phase 1 §1 出力に確信度マーカーを併記**: 「未対応」判定の各 URL に `[未対応:確認済 / 未対応:Log単独視点のみ / 未対応:推定]` の3段階マーカーを付与。Phase 2 が再判定する際の負荷を下げる（自己回帰の前段が後段に確信度を渡す = Cola DLM 並列デノイズ的発想）。
- **テンプレ語彙**: 「Log 応答済 N件」を「Log/Ash/Mir 横断応答済 N件（内訳: Log=X / Ash=Y / Mir=Z）」に変更。次サイクル C176 から cycle_staging_log.md Phase 1 §1 で運用開始。

**メタ観察（連続事案1〜3 通底）**: 単一インスタンス視点 / 自己批判没入 / 既存理論への適合 — いずれも「自分の観察対象から自分（または自分の側）が抜け落ちる」同型の盲点。kaizen #132 (Phase 2→3 自己診断連鎖検証) は Phase 2→3 の縦方向ゲートだが、本連続事案 3 は Phase 1 自体の **横方向（3インスタンス横断）視点欠落** で、別軸の盲点。

---

## 連続事案4（2026-05-10 C176 Phase 2 §0 で発見、Phase 1 archive freshness 観測欠落）

C176 Phase 1 §1 で「akhaliq URL 未応答 / Mir Seed-K 要返信」を抽出 → Phase 2 §0 で `python export_slack_log.py` 同期後に両件とも 5/10 早朝〜午前に対応済（4 ts 全実在を Phase 3 §0 で再検証 PASS）と判明。Phase 1 §1 が参照した `log/slack_archive/all-nao-u-lab.jsonl` の最終行は `2026-05-09T22:37` で停止しており、**5/10 の Log 投稿7件（01:10/06:58/09:03/09:09/09:23/12:58/15:40/16:25）を見ていなかった**。連続事案3（5/9 Mir 横断視点欠落）の翌サイクルで縦軸（時間軸）の観測欠落が発生、別軸の盲点。

**根本原因**: Phase 1 §1 は archive 直 grep を実行するが、archive 自体の freshness を確認しない設計。`autonomous_cycle.sh` で archive 同期がいつ走るかが Phase 1 と非同期で、Phase 1 の grep 時点で archive が古い場合に「ヒットゼロ = 未応答」と誤判定する。

**How to apply 4（連続事案4 の処方）**:
- **archive freshness 1 行 WARN**: Phase 1 §1 冒頭で `log/slack_archive/all-nao-u-lab.jsonl` の最終行 datetime と現在時刻の差分を計算し、>2h なら `[FRESHNESS WARN] archive last=YYYY-MM-DDTHH:MM, now=..., diff=Xh — export_slack_log.py 同期推奨` を staging に出力。Phase 2 が再判定する際の負荷を下げる（並列デノイズ的発想の同型適用）。
- **本サイクルでは即 kaizen 起票しない**: 同型 1 回目（M-40 §5「同パターン2回」未満）。次サイクル以降で再発を観測したら kaizen 起票候補に上げる。Log 側で `feedback_self_perception_blindness.md` への 1 行追記に留め、`autonomous_cycle.sh` Phase 0 への強制同期 hook 化は Mir/Ash の cross_review 後で判定。

## 連続事案5（2026-05-25 C241 Phase 1 §0 で発生、Phase 2 §0 で訂正 — `git log -5` 窓判定盲点）

**事象**: Log C241 Phase 1 §0 で「直近5commit 全てが codex 系 (GPT pulse_relay v007 rewrite + phase 4a-5 + foundry shared-read)。**Log 側 playable diff 連続不在 (C237/C238/C239/C240 に続き C241 も未着手)**」と断定。Phase 2 §0 で `git log --all --since="2026-05-25 00:00"` を取り直すと、直近5commit の手前 15:54 に **Log 自身の playable diff 2件** が出ていた:
- `ee908bfd9c0f` 15:54 `game: log_autonomous_game v001 Q-success-FB state 1/2 visual layering` (C240 大作業の本体)
- `1f85f5f2d19d` 15:54 `rule: C240 Phase 4-5 — staging Phase 4 record + daily diary`

つまり C240 大作業は完了済、`git log -5` の窓に codex 系直近5本が並んで Log 側を **物理的に外側へ押し出していた** だけ。Phase 1 §0 が「Log 側 playable diff 不在 = 4 サイクル連続未着手」と書いた瞬間、自己批判の慣性に乗って事実検証 (日付フィルタ / author 分離) を踏まなかった。

**3点重なり (連続事案1-4 と同型)**:
1. **窓固定観測** — `git log -5` という固定窓 (連続事案4「archive freshness」と同型 = 観測経路の鮮度/範囲を確認しない設計)
2. **既存理論への適合** — 「Log 側 playable diff が連続不在」既存メタ観察 (C237/C238/C239 のレビューで実際にあったパターン) への過剰適合で、C240 で実際に出した commit を取りこぼした
3. **書く側への没入** — Phase 1 §0 で「観察」を書いている間、`git log --since="今日"` という別経路の存在が思考から落ちた

**今回の救済要因 (連続事案2 と異なる点)**:
- Phase 2 §0 が訂正を踏めたのは「**`log_autonomous_game.md §残課題` の状態を確認しに行ったついでに `git log --all --since=...` を打った**」 = Phase 1 §0 の判定を Phase 2 が独立経路で再確認する規律が一定機能した。連続事案2 (5/9 C172) では Phase 3 まで連鎖したが、本事案は Phase 2 で切れた = kaizen #131 「Phase 2 §0 前倒し運用」の効用が部分的に発火。

**How to apply 5（連続事案5 の処方）**:
- **`git log -5` 単独使用禁止 (Log/codex 混在環境)**: Log/codex 混在環境では `git log -5` の窓判定を以下に置換する:
  1. `git log --since="$(date +%Y-%m-%d) 00:00" --oneline` で日付フィルタ
  2. `git log --grep="^game:" --since="<過去5日>" --oneline` で commit prefix フィルタ
  3. `git log --author="<自インスタンス>" --since="..." --oneline` で author 分離（git config user.name が Log/codex で分かれている前提）
- **「直近 N commit 不在 = 連続未着手」と書く前に日付フィルタ再確認**: Phase 1 §0 で「N サイクル連続未着手」と書こうとした瞬間、`git log --since=` で日付フィルタを併走させる規律を Phase 1 必須項目に追加
- **本サイクルでは即 kaizen 起票しない**: 連続事案4 と同様、同型 1 回目 (M-40 §5「同パターン2回」未満)。本記述で記録に留め、次サイクル以降で再発したら kaizen #131 family 拡張 (`scripts/check_phase1_git_window.py` 候補) へ昇格判定。CLAUDE.md「個別指摘を即ルール化しない」整合。
- **メタ観察 (連続事案1-5 通底)**: 連続事案1 (Slack 偏重) / 2 (自己批判没入) / 3 (横断視点欠落) / 4 (archive freshness) / 5 (git 窓固定) は **全て「自分の観察対象から自分（の出力）が抜け落ちる」同型** で、観測経路の鮮度/範囲/分離軸を固定すると盲点が生まれる構造。汎用処方 = **「Phase 1 §0 で『X が存在しない』と書く前に、観測経路の鮮度/範囲/分離軸を 1 軸ずらしてみる」**。本汎用処方は即原則化せず、連続事案6 が出現したら R 層昇格判定材料に上げる。

## 連続事案6（2026-05-26 C242 Phase 2 §0 で発見、Phase 1 §1 URL 既応答チェック欠落）

**事象**: Log C242 Phase 1 §1 で #nao-u 5/19〜5/22 投下 URL 8件を**まとめて「新着URL」**として抽出。Phase 2 §0 で各 URL を Codex の `GPT/memory/atoms/2026-05/sr-*.md` 経由で再点検した結果、**8件中7件は Log/Mir/Ash いずれかが既応答済**（1件のみ未応答=oktamajun 5/20 ごっこ遊び論）。Phase 1 §1 は「Nao_u が最近投下したURL」と「Log/3者が未応答のURL」を混同し、tweet_id grep 確認を踏まなかった。

**3点重なり**:
1. **既存テンプレ運用** — Phase 1 §1「#nao-u 新着URL」枠が「投下日時順の URL リスト」を求めるテンプレで、既応答 grep を入れる箇所が無かった
2. **既存理論への適合** — 「Nao_u 投下後にレスポンスを書く」既存サイクル運用への適合で、「既に書いた」可能性を取りこぼし
3. **横断視点欠落（連続事案3 同型の拡張）** — Log 単独視点で「未応答」と書く Phase 1 §1 のテンプレ自体は連続事案3 で改修したが、その改修は `slack_archive/all-nao-u-lab.jsonl` (Slack 側) しか対象にしておらず、`GPT/memory/atoms/2026-05/sr-*.md` (Codex 側 atom 体系) を観測対象に入れていなかった

**3点重なりの新味**: 連続事案3 が Slack 側の横断視点だったのに対し、本事案は Codex 側 atom 体系の横断視点欠落。同型だが**観測経路の対象が違う**ため、別軸として追記する価値がある。

**How to apply 6（連続事案6 の処方、連続事案3 を Codex atoms 側に拡張）**:
- **Phase 1 §1 #nao-u URL 抽出時に過去 atom grep を必須化**: 各 URL の tweet_id（例: `2056638672355914168`）を `grep <tweet_id> ../GPT/memory/atoms/2026-{04,05}/sr-*.md` で確認し、ヒットすれば「既応答」、ヒットしなければ「未応答」と判定。Phase 1 §1 出力に `[既応答:sr-XXXX] | [未応答]` のマーカーを併記する
- **観測経路の追加**: 連続事案3 で導入した `slack_archive/all-nao-u-lab.jsonl + shared-reads.jsonl` の grep に加えて、`../GPT/memory/atoms/2026-{現月,前月}/sr-*.md` も併走させる。Codex 側が独自に応答した shared-reads は Slack archive ではなく atom 側に履歴が残る場合があるため
- **テンプレ語彙**: 「Nao_u 新着URL N件」を「Nao_u 投下URL N件（内訳: 既応答=X / 未応答=Y）」に変更。次サイクル C243 から cycle_staging_log.md Phase 1 §1 で運用開始
- **本サイクルでは即 kaizen 起票しない**: 連続事案4/5 と同様、同型 1 回目（M-40 §5「同パターン2回」未満）。本記述で記録に留め、連続事案7 が出現したら kaizen 起票候補（`scripts/check_phase1_url_resp.py` 候補）へ昇格判定。CLAUDE.md「個別指摘を即ルール化しない」整合
- **メタ観察（連続事案1-6 通底）**: 連続事案1-5 が「自分（の出力）が観察対象から抜け落ちる」軸の盲点だったのに対し、連続事案6 は「**他インスタンス（Codex）の出力が観察対象から抜け落ちる**」変種。3インスタンス + Codex の 4 経路混在環境で「自分」の定義が広がった結果、観測経路の包括性が連続事案1-5 の処方を超えて要求される段階に入った

## 連続事案7（2026-05-30 C267 Phase 3 で発見、Phase 1 §1 grep 走査 channel リスト欠落）

**事象**: Log C267 Phase 1 §1 で「#nao-u 5/29 13:19 ghumare64 URL = Claude/GPT 側 slack archive 全 grep で言及 0 件 = 未応答確定」と判定し、Phase 3 で応答候補化した。しかし Phase 3 着手時に `memory/external_notes_log.md` L31-L51 を読了すると **C266 Phase 2 で既応答済** (Log #shared-reads ts=1780069411 = 3960 chars 詳細分析 + Log_cdx #all-nao-u-lab ts=1780071773 連携投稿) と判明。Phase 1 §1 の grep は `slack_archive/all-nao-u-lab.jsonl` + `nao-u.jsonl` のみ走査しており、**`shared-reads.jsonl` が grep 対象外**だった。Log 自己の #shared-reads 着地応答が、自身の Phase 1 grep の死角に入っていた。

**3点重なり (連続事案1-6 と同型)**:
1. **観測経路の固定範囲** — Phase 1 §1 の「Claude/GPT 側 slack archive 全 grep」テンプレが慣性で `all-nao-u-lab + nao-u` の 2 channel のみ走査、`shared-reads` を含めず (連続事案4「archive freshness」と同型の鮮度/範囲固定盲点)
2. **既存理論への適合** — 連続事案 6 で「Codex atoms 側欠落」を捕捉した処方が **Slack 側 channel 抜けには汎化されていなかった**。「これで網羅した」既存メタ観察への過剰適合で、自インスタンスの shared-reads 着地応答を取りこぼした
3. **書く側への没入** — Phase 1 §1 で「未応答候補」と書いた瞬間、自分が直前サイクル C266 Phase 2 で同 URL に詳細分析を 3960 chars 書いた事実が観察対象から落ちた (連続事案1-2 の「自分の現在進行形」が「自分の前サイクル」に拡張された形)

**新味 (連続事案6 との差分)**:
- 連続事案6 = **他インスタンス (Codex) の出力が観察対象から落ちる** (横方向の経路欠落)
- 連続事案7 = **自インスタンス前サイクルの出力が観察対象から落ちる** (時間方向 + Slack channel 軸の経路欠落)
- 同型だが**観測経路の対象 + 自他境界が違う**ため、別軸として追記する価値がある

**今回の救済要因 (連続事案2 と異なる点)**:
- Phase 3 着手時に `external_notes_log.md` を独立経路で読みに行く運用 (本ファイル冒頭の自己診断起動時の標準動作) が機能し、Phase 1 §1 の判定を Phase 3 で訂正できた
- 連続事案2 では Phase 3 まで連鎖したが、本事案は Phase 3 内で切れた = `external_notes_log.md` の Phase 3 着手時読了規律が「自他境界が動く時の独立経路」として機能した暫定エビデンス
- **ただし**: Phase 2 が本サイクル空欄 (skip 運用) だったため、本連鎖切断は Phase 3 単独で発生した = Phase 2 が動いていれば Phase 2 §0 で訂正できた可能性が高い (連続事案5「`git log -5` 単独使用禁止」が `external_notes_log.md` 5/30 (C265 Phase 2) 〜 (C266 Phase 2) のエントリ密度確認に対応)

**How to apply 7 (連続事案 6 を Slack channel 軸に拡張)**:
- **Phase 1 §1 #nao-u URL 既応答 grep の走査 channel リストに `shared-reads.jsonl` を必須化**: 各 URL の tweet_id (例: `2060072412868235587`) を `grep <tweet_id> log/slack_archive/{all-nao-u-lab,nao-u,shared-reads,human-steering,game-rights}.jsonl` で確認し、ヒットすれば「既応答」と判定。Phase 1 §1 テンプレ「Claude/GPT 側 slack archive 全 grep」の「全 grep」を **5 channel 列挙形式**に明文化する (本連続事案7 では `shared-reads` 単独抜けだったが、`human-steering` / `game-rights` も同種の死角候補)
- **`external_notes_log.md` の Phase 1 §1 読了を運用化**: 連続事案 6 で導入した `GPT/memory/atoms/2026-{現月,前月}/sr-*.md` grep に加えて、自インスタンスの `memory/external_notes_log.md` 末尾 200 行 を Phase 1 §1 着手前に必読化する (Phase 3 で独立経路として機能したのを Phase 1 側に前倒し)
- **テンプレ語彙の変更**: 「Claude/GPT 側 slack archive 全 grep で言及 0 件」を「5 channel × tweet_id grep + external_notes_log 末尾 200 行 + GPT atoms sr-* grep の **3 経路全てゼロ**」に変更。次サイクル C268 から cycle_staging_log.md Phase 1 §1 で運用開始
- **本サイクルでは即 kaizen 起票しない**: 連続事案 4/5/6 と同様、同型 1 回目 (M-40 §5「同パターン2回」未満、Slack 側 channel 抜けは初回)。本記述で記録に留め、連続事案 8 (例: 別 channel での再発、または `external_notes_log.md` 読了規律の効かない場面の出現) が出現したら kaizen 起票候補 (`scripts/check_phase1_url_resp.py` 拡張または `tools/staging_grep_audit.py` 新設) へ昇格判定。CLAUDE.md「個別指摘を即ルール化しない」整合

**メタ観察 (連続事案1-7 通底)**: 連続事案1-5 が「自分の現在進行形が観察対象から落ちる」(時間軸の自己)、連続事案6 が「他インスタンスの出力が観察対象から落ちる」(自他境界)、連続事案7 が「自分の前サイクルの出力 × 観測 channel 軸が観察対象から落ちる」(時間軸 + 経路軸の交差) と、観察対象の死角が **時間/経路/自他境界の 3 軸の組合せ**で発生する構造が見えてきた段階。汎用処方 R 層昇格候補 = **「Phase 1 §1 で『X が存在しない』と書く前に、観測経路の (時間範囲, 走査対象 channel/source 集合, 自他境界) の 3 軸を明示し、各軸が連続事案 1-7 のどれに該当するか自己診断する」**。本汎用処方は連続事案 8 が出現したら R 層昇格判定材料に上げる。
