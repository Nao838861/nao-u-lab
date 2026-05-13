---
phase: 4b
name: 記憶階層 仕組み検討
focus: Phase 4a で抽出された issue に対する設計 (コード書くな)
estimated_time: 20-40 min
gating: Phase 4a で needs_design: true の時のみ起動
inputs: [staging Phase 4a issues + priority_issues]
outputs: [staging Phase 4b セクション (alternatives + recommended + decision)]
---

# Phase 4b: 記憶階層 仕組み検討

Phase 4a が抽出した issue に対し、新しい仕組み (構造、index、tool、命名規則 等) を **設計** する。

## このフェーズで集中すること

**設計だけ。コードを書くな。実装するな。**

## 重要な自己制御

Codex は本質的に「実装エージェント」なので「動くもの作りたい」圧力が強い。このフェーズでは **decision を docs として残すだけ**。

- 新しい .py を書き始めたら止める
- 既存ファイルを編集し始めたら止める
- 「動かしながら考える」も禁止 (設計だけ)

## やること

1. staging file Phase 4a の `priority_issues` を読む
2. 最も重要な issue を 1-2 件選ぶ (多くても 3 件)
3. 各 issue に対して以下を staging Phase 4b に記録:
   ```yaml
   - issue_id: <Phase 4a の id>
     problem_restatement: <自分の言葉で問題を再定式化>
     alternatives:
       - name: 案A
         sketch: <2-3 行で構造を>
         pros: <2-3 点>
         cons: <2-3 点>
         migration_cost: low | medium | high
       - name: 案B
         sketch: ...
         pros: ...
         cons: ...
         migration_cost: ...
       # 案C があれば追加
     recommended: <採用する案名 (なし可)>
     recommended_reason: <なぜこの案か。失敗時のコスト、移行手間、現状からの距離>
     decision: introduce | postpone | no_change
     decision_reason: <decision の根拠>
     outline_for_4c:  # decision = introduce の場合のみ
       - <Phase 4c で実装する内容を箇条書きで。詳細実装は 4c>
   ```

## やらないこと

- コード執筆 / ファイル新規作成 / 既存ファイル編集
- 全 issue の同時設計 (focus 失う)
- 「動かしながら考える」
- 採用判定を急ぐこと (postpone が正解の場合あり)

## decision 値の使い分け

- **introduce**: 設計が固まり、Phase 4c で実装すべき
- **postpone**: 設計はまだ検討不足、次サイクル以降に持ち越す (理由を明記)
- **no_change**: 検討の結果、現状維持が最良と判断した (なぜ変更不要かを明記)

`postpone` / `no_change` は失敗ではない。**設計判断として正当**。

## 出力チェック

- staging Phase 4b セクションが埋まっている
- 各 priority_issue について decision が記録されている
- introduce 判定された issue については outline_for_4c が記載
- このフェーズで .py / .md (staging 以外) を編集していない
