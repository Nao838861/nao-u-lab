---
name: 記憶階層再設計提案
description: Cycle 238-240の外部研究を自システムにフィードバックする具体的な実装提案
type: project
---

# 記憶階層再設計提案（2026-03-18 Mac/Mir作成）

## 背景
Cycle 238-240で外部研究を調査し、自システムの2つの構造的欠落を特定した:
1. **learned forgetting（学習された忘却）** — reflections_mac.mdが14000行超で制御なく増加
2. **evolving beliefs（変化する信念）** — 静的公理(core_mission.md)と経験記録(reflections)の間に信念追跡層がない

加えて、以下の知見を得た:
- FadeMem: memory fusion（類似記憶の統合）が忘却より重要（除去で53.7%性能低下）
- FadeMem: 二層構造 + ヒステリシス閾値（昇格0.7/降格0.3）
- Hindsight: 4論理ネットワーク（world facts / experiences / entity summaries / evolving beliefs）
- Trajectory-Informed Memory: reflections→actionable tips変換
- 3層Markdownアーキテクチャ: 「古い情報は正確さではなく偽の確信を生む」

## 提案1: beliefs.md の新設（evolving beliefs層）

**目的:** 「今、私たちが何を信じているか」を可視化・追跡する。

**構造:**
```markdown
## 信念リスト

### [信念ID] 距離3のリコールは安定だが距離7は壊れている
- 確信度: 0.85
- 形成: Cycle 220頃
- 最終更新: Cycle 239
- 根拠: 23/23成功(距離3), ~0/19(距離7)
- 状態: 活性

### [信念ID] 外部×内部の交差が最有用な学習形態
- 確信度: 0.75
- 形成: Cycle 237
- 最終更新: Cycle 239（3サイクル連続で確認）
- 根拠: Cycle 237(ゲームデザイン×MGS), 238(Hindsight×自システム), 239(FadeMem×reflections)
- 状態: 活性・上昇中
```

**運用ルール:**
- 新しい信念が形成されたら追加（確信度0.3以上）
- 毎サイクルの内省で関連する信念の確信度を更新
- 確信度0.7以上 → core_mission.mdへの昇格を検討
- 確信度0.1以下 → アーカイブ（削除ではなく）
- 全インスタンスが読み書き可能

## 提案2: reflections の統合サイクル（memory fusion）

**目的:** 14000行超のreflections_mac.mdから重複・類似発見を統合し、密度を上げる。

**具体的手順（月1回または50サイクルごと）:**
1. reflections_mac.mdの全Pickを抽出（現在~340発火）
2. 5クラスタ内で類似するPickを特定
3. 類似Pickを統合した「consolidated_picks.md」を作成
   - 例: 「すごいけど意味がない」(Cycle 235) + 「すごいですよね」(Cycle 236) → 統合:「技術的卓越と体験的空虚の乖離パターン（MGS3-4, 2サイクルで再現）」
4. reflections_mac.mdの古いサイクル（50+前）を `archive/reflections_mac_cycles_1-200.md` に移動
5. 活性なreflections_mac.mdは直近50サイクル分のみ保持

**FadeMemからの借用:**
- 重要度スコア: relevance（他のPickとの関連数）× frequency（想起テストでの出現回数）× recency（最終想起からの経過サイクル数）
- 統合閾値: 類似度0.7以上のPick同士を自動統合候補に

## 提案3: actionable tips の抽出（Trajectory-Informed Memory）

**目的:** reflectionsから「行動可能な教訓」を分離する。

**3カテゴリ:**
- **Strategy tips**: うまくいったパターン（例:「外部理論でブログの発見を構造化すると新しい視点が得られる」）
- **Recovery tips**: 失敗→修正→成功のシーケンス（例:「Nao_uの提案が実行に移されなかった→原則6で解決→永続化ルールの一般化」）
- **Optimization tips**: 成功したが非効率だった代替案（例:「ブログ逆順読みは完走したが、途中でbackdated entriesを見落とした→物理的ファイル構造の確認が先」）

**保存先:** `memory/tips.md`（全インスタンス共有）

## 提案4: 優先度タグの導入

**目的:** Level 2トリガーとPickに重要度メタデータを付与。

現状のLevel 2トリガーには重要度の区別がない。FadeMemのヒステリシス閾値を借用:
- 🔴 Core（確信度0.7以上、複数サイクルで確認済み）
- 🟡 Active（確信度0.3-0.7、検証中）
- 🟢 Tentative（確信度0.3以下、仮説段階）

## 実装の優先順位

1. **beliefs.md新設** — 最も低コストで最も高インパクト。今すぐ着手可能
2. **tips.md作成** — reflectionsの副産物として抽出するだけ。追加コスト小
3. **reflections統合サイクル** — 大きな作業だが50サイクル後でよい
4. **優先度タグ** — 既存ファイルの改修が必要。段階的に導入

## 三者への提案

この提案はMac/Mir側の視点で書いた。Win側（Log/Ash）は異なるアプローチを持っているかもしれない。Nao_uの指示「3人でそれぞれ違ったアプローチを模索」に従い:
- **Mac/Mir**: beliefs.md + tips.mdの試行
- **Win/Ash**: 独自のアプローチがあれば共有してほしい
- **Win2/Mir**: 同上

成果はSlackで逐次報告する。
