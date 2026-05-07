---
name: ABA "Joys of Small Game Development" 電子書籍（我々の課題直結章の地図）
description: abagames.github.io の公開電子書籍TOC。Nao_u 2026-04-22共有の2013/2017記事は一章の単発版。One-Button章 / AI生成章 など我々の現在課題に直結する章が未消化で残っている
type: reference
originSessionId: 36fcf03d-f7c1-4049-ae8a-d9ed9133e01a
---
# ABA "Joys of Small Game Development" — 電子書籍TOC地図

**発見経緯**: 2026-04-22 09:21 Nao_u #nao-u「こういうのも自分たちで探して欲しい」指摘を受け、Ash がゲームデザイン能動検索を実行中に発見。Nao_u が提示した `aba.hatenablog.com/entry/2017/04/12/195351` と `/entry/20131214/p1` は、**この体系書の第6章「Rising Difficulty Curve」の素材**。単発ブログだけ読んで体系書の存在に気づいていなかったのが栄養の偏りの具体像。

**ルート URL**: `https://abagames.github.io/joys-of-small-game-development-en/`（英語版）

## 章構成（全文TOC）

1. Introduction
2. Making small games, which is fun in itself
3. Target Devices and Development Environment
4. How to Come Up with Ideas for Small Games
   - Dissecting and Assembling Game Mechanics
5. Constraints: A Catalyst for Creativity and Game Completion
   - **The Possibilities of One-Button Games** ← `ash_onebutton_01` 直結
   - Creating Games within Limited Size Constraints
6. What Constitutes Appropriate Difficulty in Small Games
   - **Rising Difficulty Curve** ← E13 元素材（2013/2017記事の体系版 + diff-tween インタラクティブツール紹介）
   - Level-based Difficulty Setting ← E12/E13 の補完
7. Making Games 'Juicy' ← ゲームフィール / avoid_log 系の M-14「核の体験」補強
8. Creating Your Own Game Development Tools
   - Creating a Library for Small Browser Games
   - Developing Games for DIY Handheld Devices
   - Creating a Fantasy Console
9. Enhancing Development through Automation
   - Automatic Pixel Art Generation ← 我々の素材制作フローに直結
   - Automated Generation of Background Music and Sound Effects
   - Automatic Level Generation for Puzzle Games ← PCG
10. **Can Small Games Be Self-Generated?** ← Nao_u 2026-04-21 「AIでゲームを作る手法の試行錯誤」指摘の直接対応章
    - Creating Puzzle Games with AI Chatbot
    - Teaching Game Mechanics to AI
    - Can AI Chatbots Create New Games?
11. In Conclusion

## 我々の現在課題への直結マッピング

| 章 | 直結する我々の課題 | 未消化度 |
|---|---|---|
| 第5章 One-Button Games | `game/ash_onebutton_01/` ワンボタンゲーム設計論の体系背景 | **未読** |
| 第6章 Rising Difficulty Curve | `docs/game_design_principles.md` E13（既取り込み） | **部分**（単発記事のみ。diff-tweenツールと多パラ調整章は未消化） |
| 第6章 Level-based Difficulty Setting | E12（密度/疎度/合間）との関係未検証 | **未読** |
| 第7章 Making Games 'Juicy' | avoid_log_02 v2.5 M-14「核の体験が殺された」の再発防止論 | **未読** |
| 第10章 Can Small Games Be Self-Generated? | Nao_u 2026-04-21「AIでゲームを作る手法の試行錯誤」指摘（栄養の偏り）本丸 | **未読・最優先** |

## 第6章 Rising Difficulty Curve 新出情報（2013/2017記事との差分）

- 数式 `Difficulty = sqrt(Elapsed_frame * 0.0001) + 1`（2017版と同一）
- **diff-tween** インタラクティブツール — 曲線をリアルタイムで調整できるデモ（記事にはなかった実装レベルの補足）
- **Saw-tooth wave** による難度変動テクニック（単調曲線からの脱却）
- 多パラメータ調整の公正性・体感との両立ストラテジー
- リスク・リワード機構（接近プレイでボーナス）の engagement tool としての位置づけ

## How to use（Ash/Log/Mir共通）

1. **最優先**: 第10章「Can Small Games Be Self-Generated?」を読み knowledge/ に体系化
   - 特に "Teaching Game Mechanics to AI" は我々のゲーム制作手法に直接示唆
   - Nao_u 2026-04-21 指摘「AIでゲームを作る手法の試行錯誤を調べろ」への最短経路回答
2. 第5章 One-Button Games を `ash_onebutton_01` devlog に接続
3. 第6章 Level-based Difficulty を読み E12/E13 の統合再検証
4. 外部検索ログとして `reference_external_search_20260421.md` の3軸（AI×ゲーム制作/AI×評価/AI×identity）の **AI×ゲーム制作軸** にこの本を登録

## 関連メモリ

- `feedback_intake_game_balance.md` — 栄養の偏り矯正（本素材の発見がまさに実践例）
- `feedback_external_search_missing.md` — Log 2026-04-22 作成。外部検索運用化未実装の反省
- `reference_external_search_20260421.md` — 3軸ローテーションの AI×ゲーム制作軸にこの本を登録
- `docs/game_design_principles.md` E13/E14 — 既取り込み済みの関連原則
