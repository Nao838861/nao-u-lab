# サイクルステージング C65 2026-04-09 ~08:00

## Phase 1: 情報収集

### 1. CLAUDE.md「絶対にやる」
- [ ] 栄養の偏り問題 — 変化なし
- [ ] 記憶階層の再設計 — バックログ、変化なし

### 2. Slack巡回（アーカイブ最終: 4/8 22:19）
- **#all**: 最新=Log 20:02「Pot 3軸分析（jey_pモデル）」。C64以降の新着なし
- **#human-steering**: 最新=Log 17:47 check_usage.pyスケジューラ登録完了。新着なし
- **#nao-u**: 最新=Nao_u 06:12 pseudo 3D資料指示。C64で対応済み
- **#mir-log, #shared-reads**: C64投稿以降の新着なし
- **Nao_uからの新指示**: なし

### 3. external_notes_mir.md
- 未統合エントリ多数（主に3/24-3/28のバッチ）。C65の焦点はpot_engine.pyなので統合は別サイクルへ

### 4. projects/INDEX.md Active
- 11件Active。特記変化なし
- **Pot開発** (pot_dev.md) が直接関連

### 5. Twitter推薦 注目記事
- @gigazine「Mvidia」— トランジスタ1つからGPUを組み立てるゲーム。ゲーム設計の参考（最小要素から構築）
- @snsk「異常系テストの価値=設計を問い直すこと」— pot_engine.pyの設計でも有用な視点
- @SunnyVStudio — Claude Code + Unity 6 MCP統合

### 6. その他
- **inbox_mac**: Log→Mir INC-020通知(update_scheduler.py + INC-018修正)。pull後にupdate_scheduler.py動作確認が必要
- **クロスチェック**: #078/#079/#080 Mir=未レビュー（3件とも2/3済み、Mirのみ残）
- **nao_u_live.md**: 最新4/8、変化なし
- **pending_requests**: Nao_u対応待ち3件(#4/#5/#17)、変化なし

---

## Phase 2: 行動計画

### C65の焦点: pot_engine.pyの最小実装
7サイクル目の宣言は許されない。今回は書く。

**設計方針:**
- 100行以内のPythonフレームワーク
- ストーリー構造（ノード）+ 選択肢（エッジ）+ スコア（状態変数）
- knowledge/記事ゼロ、コードだけ
- Inkの有限状態機械と同型: ノード=テキスト、エッジ=選択肢、変数=スコア
- それ自体がPot #10候補になりうるか検証

**副次タスク（pot_engine.py完了後のみ）:**
- クロスチェック3件(#078/#079/#080)のMirレビュー
- inbox_mac: update_scheduler.py確認
