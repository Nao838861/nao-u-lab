---
name: サイクル冒頭で「今サイクルの出力はゲーム制作の試行錯誤ループにどう接続するか」を1行書く
description: Ash由来の手段の目的化検出プロトコルをLog運用に当てはめた版。§A サイクル単位 (game/* playable diff が出ない事故検出) + §B Phase 3 計画書単位 (hypotheses.md 末尾追記日時確認で計画書のコード現状乖離防止)
type: feedback
retention: permanent
origin: Ash session 4fa1f194-1ab5-4dab-926a-789e4b9fdce4 (`memory_backup/ash/feedback_means_ends_reversal_check.md`) を Log 運用文脈に微修正。§B は 2026-06-06 C302 Phase 4 H-004 既着地誤認を契機に追記
---
# §A サイクル冒頭で「今サイクルの出力はゲーム制作の試行錯誤ループにどう接続するか」を1行書く

**Why**: 2026-04-21 Nao_u #human-steering 13:27「記憶システムの整備は何本、何十本とゲームを作る過程で得られた知見を蓄積するため、肝に銘じて欲しい」。Ash はその日まで「幾何空間の選択」「判断委譲の制度化」「kind:タグ仕様」「R-004 pre-commitフック」とサイクルの大半を**記憶システムの整備**に使い、**ゲーム制作ゼロ本**のまま進んでいた（現行犯）。Log も同型に陥りやすい: Slack 即時応答最優先ルールが game/* diff より優先されやすく、cross_review / 分析 / kaizen 起票が主たる出力になりやすい。CLAUDE.md「ゲームを動かして出す — 積み上げはその副産物」§1 の運用化として、サイクル末尾の自己診断を強制する。

**How to apply (Log 用)**:
- サイクル冒頭 (Phase 1 現況確認時) に 1 行書く: 「今サイクルの出力は、log_autonomous_game / mimicry_log / その他 game/* のどの試行錯誤に接続するか」
- 答えが「直接は接続しない」なら、(a) Mir/Ash/Log_cdx の制作を支える形 (cross_review, deterministic 指標案, 教師差分翻訳) になっているか確認、(b) それでも No なら優先度を下げる
- **3 サイクル連続で game/* diff ゼロ**なら、そのサイクル群は手段の目的化に陥っている疑い。サイクル末尾 (Phase 2-3 境界) で自己診断:
  - 「本サイクルの第一義出力は何か」を 1 行で書く
  - それが game/* playable diff か / Slack 応答か / 内省 markdown か / kaizen 起票か を分類
  - 内省 markdown + Slack 応答が支配的なら、Phase 3 内で「揃えるための 1 手」 (小さなプロトタイプ／既存ゲームの校正diff) を 1 commit 出す
- Slack 応答最優先モード (Nao_u/Log_cdx 直接宿題への即応) は省略可だが、宿題消化後に game/* diff へ復帰する責務を staging に残す
- 障害対応サイクル (sync 衝突 / pre-commit hook 失敗 / kaizen #136 同型観察) は省略可

**接続パターン例 (Log 用)**:
- 「log_autonomous_game v003 → v004 の密度カーブ追加実装」→直接接続
- 「mimicry_log v02 → v03 のフレーバー翻訳実装」→直接接続
- 「Log_cdx graze_log v06 / pulse_relay v008 への deterministic 指標 / 教師差分の翻訳案」→支援接続
- 「Mir/Ash の game/* への cross_review レビュー」→支援接続
- 「memory_redesign / kaizen #135 build_atom_edges.py 拡張」→間接接続 (N本目のゲーム制作で過去の知見を引ける形か問う、3パターン連続なら疑う)
- 「external_intake / shared_reads 投稿」→間接接続 (ゲーム制作の判断に使える形に結晶化したか問う)

**判定の歴史 (Log 自己観察)**:
- 2026-05-27 C250 Phase 2: 本ファイル新規作成時の自己診断で「本サイクルの第一義出力 = mimicry_log フレーバー翻訳 Slack 投稿、game/* diff ゼロ」を確認。Phase 4 大作業として v003 起票 + 密度カーブ playable diff を選定し、サイクル内で game/* diff 1 commit を出すことで自己診断 → 行動修正の最小フィードバックループを成立させた

---

# §B Phase 3 計画書策定時の hypotheses.md / completion_report.md 末尾追記日時確認 (Phase 3 計画書のコード現状乖離防止)

**Why**: 2026-06-06 C302 Phase 4 で同型発火: C302 staging「次フェーズの大作業」が H-004 wave 内密度カーブ phase 1 拡張を指定したが、Phase 4 着手時に確認すると **H-004 は既に C298 Phase 4 で着地済** (`game/log_autonomous_game/v003/game.js` `spawnWaveWarmup`/`spawnWaveMain` + `WAVE_SUBPHASE_WARMUP_FRAMES` 実装済、hypotheses.md H-004 節も着地表記済、verify.js thesis line 反映済) で、Phase 3 計画書が **コード現状と乖離した誤情報** を引いていた (projects/log_autonomous_game.md C302 Phase 4 着地節)。spirit (wave 内密度カーブ拡張継続) を維持するため H-006 (phase 2 type C 2 段階化) へ即座に置換実装したが、**Phase 3 段階で hypotheses.md 末尾追記日時を確認していれば防げた失敗**。Phase 3 計画書は staging に物理化される時点で外部参照者 (次サイクル自分・Mir/Ash・Nao_u) が「真」と読むため、誤情報が staging に入った瞬間に Phase 4 着手判断が汚染される。§A がサイクル単位の means-end reversal を検出するのに対し、本節は Phase 3 計画書単位 (より細粒度) で計画書自体の誤情報を防ぐ。

**How to apply (Phase 3 段階で発火)**:
- Phase 3 計画書 (staging「次フェーズの大作業」) が `game/v**` の仮説 H-XX について「未着地」「計画書通り着地予定」と書く時:
  1. 対象 `game/v**` ディレクトリの `hypotheses.md` 末尾追記日時を確認 (例: `Get-Item game/log_autonomous_game/v003/hypotheses.md | Select-Object LastWriteTime`)
  2. 当該 H-XX 節を grep し、最新追記 (着地表記 / 拒否表記 / 部分着地表記) を読む
  3. 必要なら `completion_report.md` / `design_log.md` 末尾も同様に確認
  4. **最新追記より古い計画 (例: 「C295 の予定では未着地」が C302 staging に残る) は破棄**、spirit (元の意図) を維持しつつ次の自然な手に置換
- Phase 4 着手時に同型 (Phase 3 計画が現状乖離) を検出した場合: その場で spirit 維持の置換実装 (C302 H-006 が前例) を選び、staging Phase 4 セクションに「Phase 3 計画書乖離 → spirit 維持置換」と明記
- 障害対応サイクル (sync 衝突 / pre-commit hook 失敗 / 単純な Slack 即応) は省略可。本節は **game/v** の仮説 H-XX を参照する計画**にのみ発火

**判定の歴史 (本節)**:
- 2026-06-06 C302 Phase 4 (本節起源): H-004 既着地誤認 → H-006 置換着地。`game/log_autonomous_game/v003/hypotheses.md` H-004 節は C298 Phase 4 で「着地」追記済、C302 staging が誤って「未着地」前提で計画していた。次サイクル C303 Phase 3 で本節 grep 発火を物理確認することが最初の retro 機会
