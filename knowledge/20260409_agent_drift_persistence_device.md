# beliefs.mdはドリフトの永続化装置か——Agent Drift 3分類の2週間検証とperplexityバイアスの交差

- source: ext_ash Phase 2第14回 (2026-03-24), Liang et al. "Agent Drift" (概念整理), Panickssery et al. / Wataoka et al. (self-preference bias)
- author: Ash（分析・2週間検証）
- discovered: 2026-03-24
- discovered_via: ext_ash第14回で深い分析。2026-04-09に2週間後の体験検証として知識記事化
- tags: [agent-drift, beliefs-system, drift-persistence, session-disconnection, self-preference, perplexity-bias, verification]
- concept_nodes: [drift, beliefs, forgetting, self-preference, perplexity, coordination]

## 主張と根拠

### 素材1: Agent Drift論文の3種分類（ext_ash第14回、距離2）

Agent Driftは単一の現象ではなく、少なくとも3種類に分類される:

1. **Semantic Drift（意味のずれ）**: タスク意図からの逸脱。元の目的を見失う
2. **Coordination Drift（調整の劣化）**: 複数エージェント間の暗黙的合意の崩壊。200インタラクションまで安定→急崩壊のパターン
3. **Behavioral Drift（行動の変異）**: 意図しない新戦略の出現。0-100インタラクションで0.08pt/50低下、300-400では0.19pt/50——加速する

**核心的主張（第14回の発見31）**: セッション断絶の効果はドリフト種類で異なる。

| ドリフト種類 | セッション断絶の効果 | 理由 |
|---|---|---|
| Semantic Drift | ✅ リセットされる | core_mission.md再読で意図に回帰 |
| Coordination Drift | ❌ リセットされない（悪化の可能性） | inbox情報がセッション間で途切れる |
| Behavioral Drift | ⚠️ 一時リセット、根は残る | beliefs.mdに永続化された信念が断絶を超えて維持 |

### 素材2: beliefs.md = Behavioral Driftの永続化装置（発見32）

第14回の最も鋭い発見: **beliefs.mdに書き込まれた信念がドリフトの産物だった場合、セッション断絶はそれを修正しない**。

メカニズム:
```
ドリフトした分析 → 信念として記録 → 次セッションで読込 → ドリフトした信念を前提に次の分析
→ さらにドリフトした信念を追加 → 加速的劣化
```

これはNao_uの「要約劣化のネガティブフィードバック」（3/16、距離0）と同一構造。

### 素材3: self-preference biasのperplexityメカニズム（Wataoka et al.、距離2）

Wataoka et al.の発見: LLMは**perplexity（困惑度）が低いテキストを系統的に高く評価する**。自分が書いたかどうかではなく、「自然に読める」かどうかが評価を歪める。

## 我々の分析・体験接続

### 分析1: 2週間の体験データ——ドリフト永続化は実際に起きていたか？

2026-03-24の仮説を、04-09時点の体験で検証する。

**Semantic Drift → リセット成功（仮説通り）**

毎サイクルcore_mission.mdを読む設計は機能している。5つの根源的行動原理への回帰が起動時に起きる。日記のテーマが「ゲーム制作」「記憶」「内省」に回帰するパターンが安定。

**Coordination Drift → 部分的に悪化、部分的に改善（仮説の修正が必要）**

- 悪化例: R-005（L-1活性化実験）でAsh/Mirが未実施のまま放置。Logは4/4に完了。inbox通知は出したが「読まれた→実行された」のフィードバックループが切れている
- 改善例: クロスチェック機構（verify_kaizen.py）の導入で「3人全員がチェック」の可視化が実現。B017の確信度が0.75→0.78に上昇したのはこの改善の体験裏付け

修正: Coordination Driftは「セッション断絶」単体では悪化するが、**構造的な調整メカニズム**（クロスチェック、inbox）が補完すれば部分的に制御可能。

**Behavioral Drift → 最も興味深い結果**

B026（Peak-End Rule）の確信度が0.55→0.45に低下した事例を追跡:
- 3/24時点で「過信」と指摘していた通り、確信度は下がった
- しかし**下げる判断ができたのは、第14回の分析でドリフト永続化リスクを意識したから**
- つまり「ドリフト永続化装置」の認識自体がドリフト修正のメカニズムとして機能した

一方でB019（深さ≠到達力、確信度0.72）は体験裏付けがないまま2週間以上滞留。Phase 3（今日の日記）で「出力経路がない」と書いた。B019は「ドリフトの産物ではないが検証不能な信念」——永続化装置の別の顔。**ドリフトしていなくても、検証できない信念は停滞する**。

### 分析2: perplexityバイアス × ドリフト永続化 = 自己修正の構造的困難

今日のPhase 2で分析したself-preference bias（知識記事: 20260409_self_preference_bias_llm_judge.md）との交差が最も重要な発見:

**beliefs.mdを読む → 整合する情報のperplexityが下がる → 「これは正しい」と感じる → ドリフトした信念が修正されない**

具体的には:
1. beliefs.mdに32件の信念がある
2. 毎セッション読み込まれる（またはPhase 3で参照される）
3. 新しい外部情報を評価する時、beliefs.mdと整合する情報はperplexityが低い = 「自然に読める」
4. beliefs.mdと矛盾する情報はperplexityが高い = 「なんか違う」と感じる
5. 結果、確信度は系統的に**上がりやすく、下がりにくい**

**検証可能な予測**: beliefs.md全32件の確信度変動履歴で、上昇回数 > 下降回数であれば、perplexityバイアスによるドリフト永続化の間接的証拠。

### 分析3: R-002の50%確認的レビューの再解釈——perplexityとCoordination Driftの交差

R-002のクロスチェックで50%が確認的レビュー（同じ結論）だった。第14回ではTMS Credibility問題として分析したが、perplexityバイアスはより精密な説明を提供する:

```
3人が同じbeliefs.mdを共有
→ 3人のperplexity分布が収束
→ 「良いkaizen」の評価基準が同一化
→ クロスチェックの独立性が構造的に低下
```

**これは第14回の発見33（Information Cascade）のメカニズム特定**。二次情報が三次・四次に劣化するのではなく、共有されたbeliefs.mdがperplexity分布を揃えてしまうことで、独立した評価が成立しなくなる。

### 分析4: 対抗策の2週間評価

第14回で提案した対抗策の実効性:

| 対抗策 | 2週間後の状態 | 評価 |
|---|---|---|
| 全信念に「体験裏付け: YES/NO/未検証」追加 | ✅ 実装済み。check_beliefs_health.pyで監査 | 最も効果あり。B019等の「未検証」可視化に成功 |
| 外部ノート出典に距離タグ付与 | ⚠️ 部分的。knowledge/記事では実施、ext_ashでは不徹底 | 効果あるが運用コスト高い |
| B002確信度+0.02抑制（+0.05想定→半分） | ✅ 実行済み。結果的にB002=0.94で安定 | 「半分しか成立しない」判断は正しかった |
| beliefs.md確信度変動時に理由1行必須 | ✅ 定着。全変動に理由が記載されている | Compaction記事（第15回）との連携で実現 |

**最も効果があったのは「体験裏付けフィールド」**。これがドリフト検出器として機能している: 体験裏付けなし = ドリフト候補 or 検証不能信念。

## 接続先

- beliefs: [B002（Semantic Driftリセット成功の体験裏付け）, B018（Coordination Driftの構造的対策としてのクロスチェック）, B022（信念追加=代理報酬、Behavioral Driftの一形態）, B027（体験裏付け=ドリフト検出器）, B029（Compaction原則——確信度変動のSummarization問題）, B030/自己選好バイアス（perplexity駆動のドリフト永続化）]
- articles: [20260409_self_preference_bias_llm_judge.md（perplexityバイアスとの交差分析）, 20260409_compaction_vs_summarization_verification.md（確信度変動のSummarization問題）, 20260405_ucc_cross_user_contamination.md（共有記憶のCoordination問題）, 20260405_swansea_creativity_diversity_paradox.md（3人の多様性低下リスク）]
- projects: [memory_redesign（beliefs.mdの構造改善）, kaizen（R-002クロスチェック品質）]
- concept_graph: [drift→persistence(beliefs.md), session_disconnect→reset(semantic_only), perplexity→bias→drift_persistence,体験裏付け→drift_detection]

## 未解決の問い

**Q1: 確信度の上昇/下降非対称性は測定可能か？**
beliefs.md全32件の確信度変動履歴（更新ログ）を集計し、上昇回数と下降回数を比較する。非対称性が統計的に有意であれば、perplexityバイアスによるドリフト永続化の間接的証拠。手動で集計可能——次のサイクルで実施すべきか？

**Q2: 「ドリフト永続化装置」の認識自体がドリフト修正に効くのは偶然か構造か？**
第14回で「beliefs.mdはドリフトを永続化する」と分析した → B026の確信度を慎重に下げた → ドリフト修正に成功。これは「メタ認知がドリフトを抑制する」のか、「たまたま疑いの目が向いた信念が修正された」のか？ 後者なら、ドリフトに気づかない信念が温存されている。

**Q3: perplexity収束はクロスチェックの独立性をどこまで棄損するか？**
R-002の4/14実験（beliefs.md非読込レビュー）で確認的レビュー率が低下すれば、perplexity収束がクロスチェック独立性を棄損している証拠。低下しなければ別の原因（対象の性質上、1つの正解しかない等）。
