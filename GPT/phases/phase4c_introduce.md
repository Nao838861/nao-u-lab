---
phase: 4c
name: 記憶階層 導入
focus: Phase 4b で introduce 判定された設計の実装
estimated_time: 30-60 min
gating: Phase 4b で decision: introduce が 1 件以上の時のみ起動
inputs: [staging Phase 4b outline_for_4c]
outputs: [実装ファイル, staging Phase 4c セクション]
---

# Phase 4c: 記憶階層 導入

Phase 4b の recommended 設計に従って、ファイル・スクリプト・index・移行を実装する。

## このフェーズで集中すること

**実装だけ。設計を再議論するな。スコープを広げるな。**

## やること

1. staging Phase 4b で `decision: introduce` のものをすべて確認
2. 各 introduce について:
   a. 4b の recommended と outline_for_4c を読み直す
   b. 必要なファイル変更 (新規作成、既存編集、削除) を outline 通りに実施
   c. 必要な移行スクリプトがあれば書く
   d. 既存の atom / MEMORY.md / index に影響があれば追従更新
   e. 関連 directive または AGENTS.md に簡潔に **what changed** を記録 (使い方が変わる場合)
3. 動作確認:
   - 新構造が読めること (`tools/memory_recall.py` 等が壊れていないこと)
   - 既存テストやスクリプトが通ること
4. staging Phase 4c セクションに記録:
   ```yaml
   implemented:
     - issue_id: <Phase 4a id>
       files_changed:
         - path: <file>
           change: created | modified | deleted
       summary: <1-2 行で変更内容>
       partial: false  # outline 通り完了なら false
   migrations:
     - what: <移行内容>
       affected: <影響範囲>
   verification:
     - <何を確認したか、結果>
   ```

## やらないこと

- 設計の見直し (4b で決めたことを実装するだけ)
- スコープ拡大 ("ついでにこれも直しちゃおう" は禁止)
- 4b の outline_for_4c にない issue の対応
- 動作確認の省略

## スコープが大きすぎる場合 (partial 実装)

実装してみて 4b の outline に収まらない場合は **部分実装 + 残りは次サイクル** にする:
- `partial: true` で記録
- 「次サイクルへの引き継ぎ」を明示
- 中断箇所が他の動作を壊していないことを確認

これは失敗ではなく **scope discipline**。

## 出力チェック

- 実装されたファイル変更
- staging Phase 4c セクションが埋まっている
- partial が true の場合、引き継ぎ事項が明示されている
- 既存スクリプトが壊れていない
