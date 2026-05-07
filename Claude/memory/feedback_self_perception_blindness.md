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
