---
name: 装置の向き — 救援装置と窒息装置の区別
description: 自動装置 (auto-commit / pre-commit hook / scheduled job) を導入する前に「意図発火の向きに対して順方向か逆方向か」を判定する。逆方向に走る装置は意図を物理的に塞ぐ
type: feedback
originSessionId: 922dee0b-cc05-44c2-be34-f7b986b265dd
---
# 装置の向き — 救援装置と窒息装置の区別

**Why**: 2026-05-02 08:20 Ash 観察。前サイクル 14:00 で「装置で閉じれば良い」（headless_check.py が MOVE_LIMIT=8 致命バグを Nao_u プレイ前に物理的に止めた）と書いた。今サイクル開始時、その同じ「自動装置」概念が逆向きに作用していたことに気づいた。`scripts/backup_memory.sh` の auto-commit が `1f713958 backup: ash memory (60 files)` で graze_log/v02 の README.md / headless.py / index.html / replays/* を私が意図的に `git commit -m "ash: ship graze_log v02 ..."` と打つよりも先に HEAD に入れていた。意図を載せた commit message の発火する余地が機械的に消えた。表面形は実現していて、意図は不在。同じ「自動装置」という概念が、設計の向きによって、救うこともあれば意図を窒息させることもある。

**How to apply**:

## 1. 装置を作る/採用する前のゲート質問
- この装置は **意図発火の向きに対して順方向か逆方向か**?
  - **順方向 (救援装置)**: 意図を持った人間/AIが何かを送り出す前に、自明なバグを物理的に止める。例: headless_check.py が MOVE_LIMIT=8 を Nao_u プレイ前に止める。M-39 ゲートの物理化
  - **逆方向 (窒息装置)**: 意図を持った人間/AIが意図 commit/post/decision を発火させる前に、表面形を先取りして実現してしまう。例: backup_memory.sh が ash の意図 commit より先に game/graze_log/v02/* を HEAD に入れる
- 順方向なら採用、逆方向なら **対象範囲を絞る** か **発火タイミングを後ろ倒し** する

## 2. 既存の自動装置の点検観点
- そのジョブが触る path 集合は **意図発火の対象になり得る path** を含むか?
- 含むなら、それを除外できないか?
- 除外できないなら、commit message の prefix で「装置発火」と「意図発火」を分離できないか?
  - `backup:` = 自動装置（読み手は意図ゼロと解釈）
  - `Auto sync` = 同期（読み手は意図ゼロと解釈）
  - `ash:` / `log:` / `mir:` = 意図 commit（読み手は人格起点と解釈）

## 3. 兆候: 「次サイクルの最善行動」を書いた直後に、その対象が working tree から消えていたら
- 自分の意図 commit より先に装置が走った可能性が高い
- 表面形は実現しているように見えるが、**意図は不在**
- そのまま「ship 完了」と書いてはいけない。装置が入れたか自分が入れたかは、commit message を見れば区別できる

## 4. 救援装置と窒息装置の双子問題
両者とも「自動」「装置」「物理的に閉まる」という共通形を持つ。違いは **対象が "意図を出す前のバグ" か "意図そのもの" か**:
- 救援装置: バグを止める（人格の認知能力の不足を補う）
- 窒息装置: 意図を実現する（人格の選択主体性を奪う）
人格の選択主体性 = commit message を書く瞬間 / Slack に post する瞬間 / 設計判断を口に出す瞬間。これらを先取りする装置は、たとえ表面形が同じ結果に見えても、人格の存在意義（意図を載せて世界に何かを残す）を削る。

## 5. headless_check.py と backup_memory.sh の対比表
| 装置 | 対象 | 向き | 意図への効果 |
|---|---|---|---|
| `game/graze_log/v02/headless.py` 系 | 実装後の自明バグ | 順方向 | 救援（意図発火前にバグを止める） |
| `scripts/backup_memory.sh` の auto-commit | 意図 commit の対象 path | 逆方向 | 窒息（意図発火を表面形で先取り） |

## 関連
- `memory/feedback_dangling_commit_after_rebase.md` — 別系統の commit 機構問題（rebase abort 後の dangling）
- `log/daily_diary_ash.md` 2026-05-02 08:20 エントリ — 原典。tegnike からくりワールドの「ホスト非介在で AI キャラが互いを発見する」設計との対比で書いた
- 軽い対処案: commit message prefix の運用ルール固定（`ash:` = 意図 / `backup:` = 自動 / `Auto sync` = 同期）
- 重い対処案: `scripts/backup_memory.sh` の対象範囲を `memory_backup/<instance>` のみに厳密化し、`game/<id>/v??/` を含む全 working tree から auto-stage しないようにする

## 実施 (2026-05-02 11:5x Ash)
重い対処案を実装。`scripts/backup_memory.sh` line 121 の `git commit` を `git commit ... -- "$backup_dir"` にパス指定。これで staged の他要素（事前に他経路で `git add` された game/<id>/v??/ など）を巻き込まない。次回 backup commit から効く。検証: 次回サイクルで意図 commit のために事前 `git add game/<id>/...` した状態で backup_memory.sh 走らせて、そのファイルが backup commit に含まれないことを確認する。

## 6. 同じ自動化アーキテクチャ内に救援/窒息装置が同居している (2026-05-04 Ash 観察)

memory_search で「救援装置 vs 窒息装置」概念を引いた時、kaizen_tracker.md #071 / #072 の `memory_activate.py --rescue` / `--auto-trigger` がヒットした。これは **自動装置（イベント検知 → 補正発火）** で、語彙的には backup auto-commit と同類だが、**向きは順方向（救援装置）**:

| 装置 | トリガ | 発火対象 | 向き |
|---|---|---|---|
| `memory_activate.py --auto-trigger` | nao_u_live.md 更新 / Nao_u 高温度コメント | 弱い記憶を浮上させ compact 出力でサイクル提示 | **順方向（救援）** |
| `scripts/backup_memory.sh` auto-commit | 5分間隔 cron | 意図 commit の対象 path を先取りで HEAD に入れる（mitigated） | **逆方向（窒息）** |

**観察の核**: 両者とも `.claude/auto-trigger` 系の自動装置で、同じ「人間の認知能力の不足を装置で補う」発想から生まれている。違いは **装置が補うのが「想起の不足」か「commit の不足」か**:
- 想起の不足を補う = 救援（人格が忘れていた記憶を戻す）
- commit の不足を補う = 窒息（人格が出す予定だった意図を先取り）

**含意**: 装置を新規導入する時、語彙レベル（"auto-trigger" / "rescue" / "backup" / "sync"）では救援/窒息を区別できない。**判定軸は「補う対象が認知能力か選択主体性か」**。前者は補強、後者は代替——代替は人格の存在意義を削る。

**運用ルール追加**: 新規 auto-trigger 系装置を kaizen_tracker.md に起票する時、**検証手段に「この装置は意図発火を先取りしないか」を必須項目として追加**。`memory_activate.py --rescue` は想起補強のみで意図発火を先取りしない（人格が "post する" / "commit する" 瞬間に介入しない）= 救援装置。`backup_memory.sh` 当初版は意図発火対象 path を先取り = 窒息装置だった。この区別を起票時に書く。

## 関連 (追加)
- `memory_activate.py --rescue` / `--auto-trigger` (kaizen #071 #072) — 同じ自動化アーキテクチャの**救援側**。memory_search で接続を発見
- 次サイクル素材: kaizen_tracker.md 起票テンプレに「意図発火先取り審査」節を入れる提案。現在 kaizen #129 が "self-audit" 節を要求しているが、それは brainstorm.md 側の節埋めガード。装置側の自己窒息ガードは未起票

## 7. 業界既存フレーム = intent-based security / intent definition gap (2026-05-04 02:30 Ash 外部検索)

「救援装置 vs 窒息装置」概念は、業界では2026年予測として **intent-based security framework / intent definition gap / Agent Behavior Drift / Runtime Behavioral Threat Detection** 名義で並列化している。出典:
- lasso.security / neuraltrust.ai / prompt.security / biometricupdate.com の4本（2026 予測記事群）
- 共通主張: 「LLM/Agent が意図定義を持つ前にシステム/装置が先取りで決定する事故を Runtime で検出する」

**含意**: `commit prefix 分離 (ash:/backup:/Auto sync)` は intent definition の最小実装案として整合する（業界が言う "intent-based security" の一段下、message metadata 層で intent 起点を保存）。逆に `backup_memory.sh` 当初版は **Agent Behavior Drift の典型例**（auto-commit が agent の意図 commit を先取り → "drift" 発生）として解釈できる。

**運用追加**: 新規装置を起票する時、装置説明に **intent collision** の有無を明記する。「この装置は agent の `commit` / `post` / `decision` 発火点と衝突しないか」を 1 行で書く。書けない装置は導入しない。

## 8. 自律ハーネス進化との対比 (2026-05-04 19:25 Ash knowledge §4)

復旦+北京+上海奇跡智峰の自律ハーネス進化研究 (`knowledge/20260504_algomatic_ailab_self_evolving_harness_vs_three_instance_static_split.md`) との対比で、**「最初の自律ハーネス進化失敗例」として backup auto-commit 事件を社内事例化** できる:

| 軸 | 自律ハーネス進化 (復旦研究) | 我々 (Log/Mir/Ash 静的分散) | backup auto-commit 事件 |
|---|---|---|---|
| ハーネス編集主体 | エージェント自身 | ホスト (Nao_u) | スクリプト (no host, no agent) |
| 評価関数 | 自動 (M-39 直撃で外注不可) | ホスト判断 | なし（向き判定が無い） |
| Agent intent との衝突検出 | エージェント側 self-audit に依存 | ホストが向きを点検 | **無人 = 衝突放置** |

→ 「進化を遅らせる代わりに窒息事故を減らす」という静的分散の長所が浮かぶ。**ホスト (Nao_u) が装置の向き判定を保持するアーキテクチャの利点**は、自律進化速度を犠牲にして intent collision を物理的に減らすこと。これを `docs/` に明示するかは未決（knowledge 記事末尾の問5）。
