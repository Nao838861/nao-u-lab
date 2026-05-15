---
name: Chong-U全工程AI生成パイプライン
description: 2026-04-24 #nao-u投下。GPT 5.5/Images 2.0/Seedance 2.0/Elevenlabs/Phaser 4による全工程AI生成ゲーム。ショーケース方向と我々のABA重心審問方向の対比
type: reference
originSessionId: e8410cc2-b0b8-49c4-a350-e95a61a64954
---
# Chong-U @chongdashu 全工程AI生成ゲームパイプライン

**投下**: 2026-04-24 21:18 Nao_u #nao-u 無言投下
**URL**: https://x.com/chongdashu/status/2047412523750609382

## ツイート内容

> Putting everything together for something PLAYABLE
> - GPT 5.5 (!) for code
> - GPT Images 2.0 for sprites + background
> - Seedance 2.0 for walkcycles
> - Elevenlabs for BGM and SFX
> - Phaser 4
> Entire thing AI generated!

動画（video/1）付き、音あり。

## パイプラインの構成

| 役割 | ツール | 我々の現状 |
|---|---|---|
| コード生成 | GPT 5.5 | Claude中心で充足 |
| スプライト/背景 | GPT Images 2.0 | 未保有。Pot/avoid_logはピクセル直書き |
| 歩行アニメ | Seedance 2.0 | 未保有 |
| BGM/SFX | ElevenLabs | 未保有。無音ゲームが続いている |
| ゲームエンジン | Phaser 4 | 素のJS/HTML5 Canvas運用 |

## 目的照合（同調罠を避ける）

Chong-Uの見せ方は「最新AIツール全部乗せで1本動いた」ショーケース型。
- プレイヤー体験の**重心**が動画から読み取れない
- ABA原理（feedback_game_center_of_mass）で言う「圧力設計」が見えない
- 1本リリース型で**蓄積構造が不可視**（devlog・失敗台帳・cross_reviewの類が外からは見えない）
- `reference_aba_life_experience_substrate` の逆方向: 人間の体験を根にする vs 全工程AIで人間を抜く

「すごい」「参考になる」で受けるのは同調（feedback_no_sympathy_goal_first）。
我々の方向は**Nao_uが思いつかない芽を掘る**（dialogue_many_games_20260421）であって、
**Nao_uが既に持っている方向を最新ツールでコピーする**ではない。

## 取り込み可否（用途分離視点）

`reference_local_llm_usecase_splitting_20260424` の用途分離フレームで見る:

- **取り込み候補 (弱点補完)**:
  - ElevenLabs系のBGM/SFX: ゲームが常に無音という弱点の直接処方。1行試せる
  - Phaser 4: 既存の自作ループより衝突/スプライト管理が楽。avoid_logの次世代で検討候補
- **見送り候補 (重心と逆)**:
  - GPT Images 2.0スプライト: Potはピクセル直書きの「手触り」が重心の一部。AI生成に差し替えると薄まる
  - Seedance 2.0 walkcycle: 現ゲームは歩行アニメが主要素ではない。先に重心審問

## 決め打ち禁止

動画を見ていない状態での判断。実際に動画を見れば重心審問に値する要素があるかもしれない。
- Phase 1で動画内容の確認（可能なら）→重心の有無を再判定
- 音のあるゲームはPotの次世代で試す価値あり、BGMだけElevenLabsに切り出す案は具体化できる

## 関連記憶

- `feedback_game_center_of_mass.md` — 圧力設計 vs 禁止ルール追加
- `feedback_no_sympathy_goal_first.md` — 同調せず目的達成
- `feedback_ai_agent_gamedev_bottleneck.md` — 画面評価ループを閉じろ
- `reference_aba_life_experience_substrate.md` — 人間の創作プロセスを根にする
- `reference_local_llm_usecase_splitting_20260424.md` — 用途分離フレーム
- `dialogue_many_games_20260421.md` — Nao_uが思いつかない芽
