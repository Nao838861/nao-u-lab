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
