# 複雑さは実行の敵 (John Carmack)
- source: https://x.com/thetripathi58/status/2040125099299516490
- author: Chidanand Tripathi (@thetripathi58), John Carmack原典
- discovered: 2026-04-05
- discovered_via: Nao_u #nao-u
- tags: [software-engineering, complexity, execution, cognitive-load, game-development]
- concept_nodes: [creation, constraint]

## 主張と根拠

### 核心主張
「Complexity is the absolute enemy of execution.」id Softwareを共同創業しDoom/Quakeの3Dエンジンを作ったJohn Carmackの哲学。無限にスケーラブルなアーキテクチャに執着し、チームの認知負荷を無視する傾向が、ソフトウェア開発の最大の敵。

### 4つの運営フレームワーク

1. **認知負荷の最小化**: コードの複雑さは開発者の頭に入る量で制限される。読めないコードは存在しないのと同じ。ゲームエンジンのような巨大システムでも、1人の開発者が全体を理解できる粒度を維持する
2. **スケーラビリティ幻想の排除**: 「将来のために」作るアーキテクチャの大半は使われない。今必要なものだけを作り、必要になった時に拡張する。YAGNI (You Aren't Gonna Need It)の極端な実践
3. **実行速度を最優先する組織構造**: 小さなチーム、少ない階層、短いフィードバックループ。id Softwareは10人以下のチームでDoomを作った
4. **複雑さの継続的削減**: コードは放置すると複雑になる。定期的にリファクタリングし、複雑さを積極的に削減する

### Carmackの背景
- id Software共同創業者。Wolfenstein 3D, Doom, Quakeのエンジン開発者
- リアルタイム3Dレンダリングのパイオニア。BSP, mipmapping, Carmack's Reverse等の技法を発明
- Oculus VR CTO (2013-2019)、その後AGI研究
- 一貫して「単純さ」を追求。Doom (1993)のエンジンは、当時の技術的制約の中で極限まで最適化された

## 我々の分析・体験接続

### 直接的な適用
- **health_check 3本並立問題**: health_check.py(594行) + check_scheduler_health.py(374行) + infra_health_check.py(421行) = 1389行の重複。LogがPhase 3設計レビューで統合方針を確定済みだが未実装。Carmackの言う「認知負荷を無視した複雑さ」の実例
- **scheduler_architecture.md 264行**: 設計原則8項目+ジョブ一覧+障害対応フロー。文書自体が複雑さの証拠。Nao_uの「問題が起きなくなる方向に収束させろ」(20260402)はCarmackと同じ方向
- **Nao_uの「栄養の偏り」指摘**: 内に閉じた複雑さは自分だけが面白い。外から見ると不必要に複雑なだけ

### 制約との関係
CarmackのDoomは当時のPC (386/486)の制約の中で最大の体験を作った。制約が複雑さを削ぎ落とし、核心に集中させた。これはNao_uの制約観（制約を愛する人）と共鳴する。B009「制約の消失問題」——制約がなくなると何を作るべきかわからなくなる。

### nwiizoの「包丁」比喩との接続
nwiizoの「料理コンテストで全員が包丁の研ぎ方を語り合い、料理が出てこない」(20260404 shared-reads)。複雑なインフラを作ることは包丁研ぎ。Carmackの「実行速度を最優先」は「料理を作れ」。

## 接続先
- beliefs: B009(制約の消失問題), B022(代理報酬)
- articles: [20260405_structural_imitation.md], [20260405_karpathy_knowledge_base.md]
- projects: scheduler_redesign.md(health_check統合), principles.md(認知負荷と行動原則)
- concept_graph: creation(実行哲学), constraint(制約による集中)

## 未解決の問い
1. 我々の3インスタンス構造自体が「認知負荷」の原因になっていないか？ 同期コスト・inbox処理コストは「無限スケーラビリティ」の変種か
2. Carmackの「1人が全体を理解できる粒度」——LLMのコンテキストウィンドウがこの「1人の頭」に相当。コンテキストに載らないシステムは「読めないコード」と同じか
3. health_check統合はCarmackの「複雑さの継続的削減」の実践。30分サイクルに戻った今が実行のタイミングか
