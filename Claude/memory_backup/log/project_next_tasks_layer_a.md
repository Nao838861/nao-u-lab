---
name: 次回タスク忘却の構造処方（層A）
description: next_tasks.py CLI とインスタンス別 jsonl で次回タスクを書式依存から外す処方。Mir C126 設計合意済、検証期限 2026-05-10
type: project
originSessionId: c74565d8-0854-42d4-b654-154416353097
---
# 次回タスク忘却の構造処方（層A）— 2026-04-26 実装

**事実**: `next_tasks.py` + `memory/next_tasks_<instance>.jsonl`（log/mir/ash）で次回タスクの実体を JSONL に置き、書く・読む・終わらせるを CLI 経由に固定した。

**Why**: Nao_u 2026-04-26 #human-steering 14:24「ほんとに漏れはない？フォーマットを LLM が正しく出せなくなった途端に破綻しそう」への構造応答。前回 ff32e46b の §0 末尾80行抽出は L1（書く側漏れ）/L2（書式漏れ）/L3（読む側漏れ）を「読め/書け」の自然言語ルールで塞ごうとしたが、注意配分が変われば同じ穴が空く。Mir C126 が「LLM 出力フォーマットを単一ソースから外す」核を肯定し4条件で合意。

**How to apply**:
- セッション開始時 / Phase 1 で `python next_tasks.py --instance <i> pending` を実行（自動の場合は cycle_staging.md §0a に出る）
- `[⚠連続3+]` マーカー付きタスクは最優先で扱う（L6 Priority Displacement 対策）
- Phase 3 で着手したら `next_tasks.py done <task_id>`、断念なら `skip <task_id> --reason "..."`
- 新しい次回タスクが生まれたら `next_tasks.py add "..."` で必ず登録（自然言語の日記末尾だけに頼らない）
- Phase 4 末尾で auto_diary が `check_cycle` を自動実行（add/done/skip=0 + pending残 or 3+滞留 → 各自チャンネル Slack 警告）

**Mir の4条件（実装済）**:
1. インスタンス引数で別 jsonl（L7 sync race 回避）
2. pending 出力に連続サイクル数（L6 対策）
3. check_cycle → Slack 通知（warning がログに埋もれない）
4. Mir cron 接合は Mir 自身（Log は本体 + Ash auto_diary に集中）

**接合状況**:
- Ash (auto_diary.py): Phase 1 §0a 注入 + Phase 4 末尾 check_cycle 実行 ✅
- Mir (cron 直起動): Mir 自身が cron スクリプトに `pending` 注入を追加（Mir 担当）
- Log (手動セッション含む): セッション開始時に手動で `pending` を呼ぶ運用

**検証**:
- 期限 2026-05-10
- 評価軸: L1/L2/L3 が消えたか、L6/L7 が機能したか、3+滞留マーカーが実際に未着手タスクを掘り起こしたか
- Mir 側で F-05/F-07 チェック項目を `add` する運用提案あり（メタUI語ゼロ + 名前⇔メカニクス整合）

**2026-04-26 C133 Phase 3 追記 — kaizen #120 SessionStart hook 起票**:
- 観測: Log pending 5/5 が連続-2サイクル滞留＝L1（読まない）ではなく L2（読んでも閉じない）が現に発生
- 14:13 #human-steering Nao_u「ハーネスで強制がいるやつでは？」を受けて kaizen #120 起票（A 案: SessionStart hook で `python next_tasks.py pending --quiet` を additionalContext 注入）
- A 案の射程: L1（pending を読まない）には効く / L2（読んでも閉じる選ばず別タスク）には効かない
- L2 への次の処方候補: タスク type 別注入位置（game/ 配下は Phase 3 冒頭、検証期限超過は Phase 0）/ 連続滞留タスクの「閉じる/別案で skip する/分割する」3択強制プロンプト / Stop hook で「pending 残ったまま終わるな」警告
- ブロッカー: harness が `.claude/settings.json` 編集を拒否（Edit tool で 2回拒否確認）→ Nao_u 手動編集が必要
- 推奨実装順: B 案（Log 単独 `.claude/settings.local.json` 先行）→ 効果あったら A 案（共有 settings.json）に昇格
