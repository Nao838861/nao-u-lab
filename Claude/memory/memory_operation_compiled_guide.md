---
name: memory_operation_compiled_guide
description: Claude記憶運用のcompiled guide。write/manage/read、配置分類、raw/compiled lifecycle、判断機会を塞がない自動化境界をまとめる。
type: memory
status: active
lifecycle: compiled
created_at: 2026-05-14
---

# 記憶運用 compiled guide

## いつ読むか

- Claude側の記憶階層、記憶ファイル、定時サイクルの扱いを変更するとき。
- feedback、dialogue、external_notes、reference、shared_reads をどこへ置くか迷うとき。
- 新しいProtocol、Memory、Skills、Projectを追加・昇格・退役させるとき。
- raw資料をcompiled artifactへまとめるとき。
- schedulerやcycleが読むruntime stateに触りたくなったとき。

## 目的

記憶システムの目的は、記憶そのものを増やすことではない。Nao_uとClaudeがゲーム制作を進めるうえで、過去の失敗、成功、判断基準、フィードバックを、必要な場面で使える形にすること。

したがって、改善対象は主に「保存量」ではなく「運用」である。特に、write、manage、readのうち、弱くなりやすいのはmanage層である。

## 基本構造

### 1. write / manage / read を分ける

writeは、素材を失わないための層。発言、フィードバック、観察、失敗、成功、出典、鮮度、利用場面を残す。

manageは、素材を判断可能な形へ変える層。統合、昇格、分割、退役、配置、重複整理、入口作成を扱う。

readは、実行時に必要なものを取り出す層。巨大なrawを毎回読むことではなく、作業中の判断に必要な入口へ短く接続することが目的。

記憶システムの改善では、writeを増やす前にmanageが足りているかを見る。manageが弱いままwriteを増やすと、記憶は判断材料ではなく探索負荷になる。

### 2. raw と compiled を混ぜない

rawは、元発言・元資料・元観察をできるだけ残す層。証拠であり、後から再解釈できる余地を守る。

compiledは、複数のrawから作った運用可能な判断材料。読めばすぐ行動に反映できるが、必ず出典を持たせる。

compiled artifactを作るときは、rawを消さない。compiledに書くべきなのは「全要約」ではなく、次の判断に効く原則、例外、配置基準、読みどころである。

### 3. 配置分類を先に決める

新しい知見を置く前に、まず分類する。

| 分類 | 置くもの | 判断基準 |
| --- | --- | --- |
| Protocol | 破ると事故、信頼低下、ユーザー可視の害が出る制約 | 常時守る必要があり、例外が少ない |
| Memory | 判断材料、文脈、証拠、フィードバック、compiled guide | 必要な場面で参照されればよい |
| Skills | 反復可能な手順、チェックリスト、作業方法 | 同じ種類の作業で再利用する |
| Project | 複数セッションにまたがる目的、状態、履歴、次の作業 | 特定プロジェクトの進行に結びつく |
| State / Runtime I/O | scheduler、cycle、inbox、pending、staging、task log | ツールや定時サイクルが読み書きする |

State / Runtime I/Oは、人間が読みやすく整えるために直接編集しない。必要な場合は、対応する生成元や運用手順を確認してから触る。

### 4. lifecycleを明示する

記憶には状態がある。

- raw: 元資料。保存と出典保持が主目的。
- candidate: 昇格候補。まだ判断材料として安定していない。
- active: 現在使う記憶。
- compiled: rawやactiveから作った運用可能な要点。
- superseded: 後続の記憶に置き換えられたもの。
- archived: 通常読まないが、証拠として残すもの。

activeやcompiledが増えすぎたら、追加より先に退役・統合・入口整理を検討する。

## 自動化の境界

自動化してよいのは、反復的、機械的、検証可能な作業である。例として、出典の記録、重複候補の検出、古い候補の一覧化、runtime stateの整合性チェック、未処理inboxの可視化がある。

自動化しすぎてはいけないのは、優先度、価値判断、ゲーム制作上の美学、Nao_uの意図の解釈、曖昧なフィードバックの意味づけである。

新しい自動化を入れる前に、次を確認する。

- この仕組みは、どの判断機会を人間やClaudeから奪うか。
- 奪ってよい判断か。
- 間違ったとき、rawへ戻れるか。
- 出典と責任範囲が残るか。
- ゲーム制作の判断を助けるか、単に記憶システムを整える趣味になっていないか。

## external_notes と feedback の昇格

external_notesやfeedbackは、最初からProtocolへ入れない。まずrawまたはMemoryとして保存し、同種の指摘が繰り返されるか、重大な事故を防ぐものか、具体的な作業手順へ落ちるかを見る。

昇格の目安は次の通り。

- 同じ失敗を防ぐ常時制約になるならProtocol。
- 特定作業で再利用する手順になるならSkills。
- プロジェクトの方向や次の作業に関わるならProject。
- 判断材料として必要なときに読めればよいならMemory。
- ツールが読む状態ならState / Runtime I/O。

大きなrawをそのまま毎回読む設計にしない。必要ならcompiled artifactを作り、出典としてrawへ戻れるようにする。

## 触らない・慎重に触る領域

次は、記憶改善の流れでも慎重に扱う。

- `Claude/memory/core_mission.md`: 明示許可なしに編集しない。
- `Claude/memory/mir_boot_intent.md`: cycleの起動意図に関わるため、直接編集しない。
- `Claude/memory/inbox_*.md`: inbox処理の入出力であり、手で整形しない。
- `Claude/memory/next_tasks_*.jsonl`: append-only運用のtask stateとして扱う。
- `Claude/log/cycle_staging*.md`: cycleの途中成果物として扱う。
- scheduler、auto_diary、inbox処理のコード: 変更前に入出力と既存運用を確認する。

## 使い方

記憶ファイルを追加・変更する前に、対象がProtocol、Memory、Skills、Project、State / Runtime I/Oのどれかを決める。

compiled artifactを作る場合は、次を満たす。

- rawを消さない。
- 出典を残す。
- 「いつ読むか」を書く。
- 全要約ではなく、次の判断に効く形にする。
- 既存の中核記憶へ接続する前に、単体で妥当性を見る。

このguide自体はMemoryのcompiled artifactであり、Protocolではない。必要なら、後続の検証を経てCLAUDE.md、MEMORY.md、session_primer、Skillsなどへ接続する。

## 出典

- `Claude/memory/feedback_memory_architecture.md`
- `Claude/memory/dialogue_memory_purpose_20260421.md`
- `Claude/memory/memory_architecture.md`
- `Claude/memory/feedback_substrate_not_infrastructure.md`
- `Claude/memory/dialogue_micromanagement_20260504.md`
- `Claude/memory/feedback_few_rules_big_effect.md`
- `Claude/memory/feedback_info_integration.md`
- `Claude/memory/beliefs_compact.md`
- `GPT/memory/directive_claude_memory_system_improvement_20260514.md`
- `GPT/memory/claude_memory_baseline_20260514.md`
- `GPT/memory/claude_memory_io_inventory_20260514.md`
- `GPT/memory/claude_memory_boundary_matrix_20260514.md`
- `GPT/memory/claude_memory_compiled_artifact_candidate_20260514.md`
