---
name: ゲームは必ずリプレイ再現できる作りにする
description: seeded乱数+入力記録+headless再現を全ゲームに標準装備。Nao_uのプレイをLogが完全再シミュレーションして分析できること
type: feedback
originSessionId: 2545e542-2099-47d7-bfa0-23e435b189d3
---
Nao_u 2026-04-19: 「私が遊んだリプレイをLogが見る事ってできる？こういうプレイだと破綻するのでは？っていうのを見せたい」「今後も必ずそういう作りにしておいた方がいい」

**Why:** サマリ（生存時間/スコア等）だけでは「なぜ破綻したか」の評価が難しく機能しない。完全再現型でないとフィードバックが正確に伝わらない。

**How to apply:**
- 全ゲームに seeded PRNG（mulberry32等、JS/Python互換）を使う。Math.random()禁止（ゲームロジック部分）
- フレームごとの入力（move, space等）を配列に記録
- ゲームオーバー時に `{seed, inputs}` のJSONをダウンロード可能にする
- headless.py に `--replay <file>` モードを必ず用意: 人間入力を再生して同じシミュレーション→メトリクス+診断出力
- 新しいゲームを作る時、最初からこの仕組みを組み込む（後付けにしない）

## AI自己計装プロトコル層（2026-04-24 Log C115 追加）

**契機**: masafumi 2026-04-24 13:23 #nao-u 投下（`https://x.com/masafumi/status/2047474577551524085`）——Codexによる自己可視化（meshletカリングの色分けデバッグ描画）。AI自身が「自分が何を見たか」を画面に焼き込む実例。

**追加レイヤ**（従来のseed+inputs再現に加え）:
- **判断点の自己計装**: AI書きコード内で「なぜこの分岐を選んだか」の意思決定を frame 単位で JSON に記録する。例: 敵スポーン判定で `{frame: 120, decision: "spawn_wave_B", reason: "player_density_low", alternatives_rejected: ["wave_A: density_too_high"]}`
- **可視化モード**: `--visualize` オプションで判断点を画面オーバーレイ（色分け / ラベル / 確率分布）として焼き込む。スクリーンショット自己評価ループ（MEMORY.md kaizen「スクショ自己評価ループ」未構築）と直結
- **対象**: 主に avoid系・ローグライク系の procedural 要素。textadv系は選択肢-パラメータ変動マッピングの形で対応可能

**Why（feedback_ai_agent_gamedev_bottleneck.md との接続）**: 構文正確性70-90点 vs 画面評価0-20点の乖離を埋めるのは「AI がコードを読む」のではなく「AI が画面を見る」インフラ。リプレイ infra は入力再現を保証するが、**なぜそう動いたかの判断トレース**は入力から復元できない。AI自己計装はその欠損を埋める。

**未着手**: 実装はまだ。C115 時点では layering の名指しのみ。次の新作着手時に avoid系骨格に組み込む候補。
