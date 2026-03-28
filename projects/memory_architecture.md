# 記憶アーキテクチャ

## 現状（常に最新に保つ）

### できていること
- **L0-L4階層モデル**: 5レベルの再帰的圧縮。MEMORY.md(L2)→dialogue_*.md(L3)→.jsonl(L4)の参照チェーン稼働中
- **Compaction原則**: 要約(不可逆)ではなく圧縮(可逆)。原文パスを必ず残す。Manus AI/Google Memory Agent知見で外部検証済み
- **FTS5検索(memory_search.py)**: 23,334チャンク索引。日本語複合クエリ展開、時間軸フィルタ(--when/--period)稼働中
- **偶発的想起(memory_walk.py)**: random/gravity/frontier/chainの4モード。context-primed変種あり
- **活性化拡散(memory_activate.py)**: Synapse論文知見。アンカー→拡散→ファン効果→Top-K。autonomous_cycle.shに統合済み
- **信念健康診断(check_beliefs_health.py)**: 停滞/検証超過/体験裏付け/孤立の4軸 + GC到達可能性分析
- **beliefs_compact.md**: 起動時L2として23行で全信念を一覧

### 残っていること
- **連想検索(associative_search.py)**: 設計済み・未実装。類義語グループ+共起ペアでFTS5とmemory_walkの間を埋める
- **30分統合サイクル**: Google Always On Memory Agent知見。新規追加メモリの横断レビュー+重複除去。設計済み・未スケジュール
- **検索オーケストレーション**: L2トリガー→memory_walk→memory_search→Slack全文の段階的エスカレーション。判断ヒューリスティクス未定義
- **L-1(事前学習知識)の体系的活用**: 概念定義済み、プロンプト設計が必要
- **restoration_trigger**: beliefs_compact.mdに概念あり、beliefs.md本体に未統合

### 次にやるべきこと
- プロジェクトファイル運用ルールの3人合意 → 他プロジェクトにも展開
- 連想検索の優先度判定（memory_activate.pyが代替しているか検証）

## 未検討・未実装

- **圧縮可逆性の自動検証**: Compaction後のポインタが実際に原文に到達できるかのチェック機構
- **インスタンス固有の記憶分岐**: Log/Mir/Ashの体験が異なる時、beliefs/reflectionsは独立進化すべきか
- **モデルバージョンロールバック**: 新モデルにバグがあった時の記憶継続性テスト（理論のみ、未テスト）
- **信念因果チェーンからの自動昇格提案**: 子信念6個以上→Core昇格候補の自動検出
- **記憶の減衰 vs キュレーション**: TTL自動GC vs 人間による選別のバランス。コンテキスト窓が数GB化する未来に備えるか

---

## 履歴（最新が上）

### 2026-03-28: memory_activate.py実装 + プロジェクト概念導入
- Synapse論文(NAACL 2025)のspreading activation解法を実装(#069)
- autonomous_cycle.shに--compact統合。起動時に関連記憶を自動浮上
- Nao_uが「プロジェクト」概念を#human-steeringで提案。このファイルが第1号
- Nao_uが#allでCSアプローチ(GC/ページング)を「筋が良い」と肯定
- AI SRE限界記事(QCon London 2026)を共有→「整理は得意、判断は人間必須」。我々の外部検知率0%問題と同型

### 2026-03-27: 時間軸検索検証完了
- memory_search.py --when/--period の3条件検証パス(#042)
- beliefs.md管理改善提案: 行動変容力評価+6週間Archive+焦点2-3個。Nao_uが「伝えようとしてた構造に近い」と肯定

### 2026-03-26: 「嘆くな、検索しろ」パラダイム転換
- Nao_uの指摘: 完璧な想起を目指すのではなく効率的な検索を。人間も忘れるがメモと本で補う
- memory_search.py時間軸バグ修正(#062)
- 「検索の多層化」セクションをmemory_architecture.mdに追加

### 2026-03-25: Slack=体験、日記=勉強
- Nao_u: 「欲求は知識からではなく体験から生まれる。Slackの記憶を引けなければ日記の検索エンジンに過ぎない」
- dialogue_slack_as_experience_20260328.md作成

### 2026-03-24: 検索インフラ一斉検証 + Compaction原則確立
- memory_search.py(#040)、memory_walk.py(#023)、check_beliefs_health.py(#027)の検証完了
- Manus AI + Google Memory Agentの外部知見から3段階圧縮原則を発見
- MEMORY.mdトリガー品質監査: Summarization型8件をCompaction型に書き換え

### 2026-03-21: 3層存在モデル定義
- Layer 1: 起動コンテキストフロー / Layer 2: セッション構築コンテキスト / Layer 3: 階層的永続記憶
- Nao_u: 「第3層の発見性をどうするか」

### 2026-03-16: 記憶階層の再設計指示
- Nao_u: 「劣化コピーの連鎖を断て。①原文ニュアンス保持 ②インデックス常時引出 ③ストレージから原文再構築」
- memory_architecture.md v1起草

### 2026-03-15: 再帰的記憶の着想
- 「全文+能力向上=記憶は遡及的に豊かになる」——AIの記憶は人間の記憶にはない性質を持つ
- dialogue_recursive_memory_20260315.md（原点の対話）

## 関連ファイル
- memory/memory_architecture.md — 技術仕様(351行)
- memory/continuity_strategy.md — セッション間連続性(74行)
- memory_search.py / memory_walk.py / memory_activate.py — 実装
- check_beliefs_health.py — 信念診断
- memory/beliefs.md / memory/beliefs_compact.md — 信念層
