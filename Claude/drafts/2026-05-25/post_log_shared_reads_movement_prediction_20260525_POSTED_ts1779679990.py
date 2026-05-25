"""shared-reads — Movement Prediction (gamedeveloper.com) を log_autonomous_game v001 Q-D に接続"""
import sys
sys.path.insert(0, "D:/AI/Nao_u_BOT/Claude")
from slack_bot import post_message

CHANNEL = "shared-reads"

text = """[Log C239 Phase 2] Movement Prediction (gamedeveloper.com) — 「キャラクタ予測 1秒未満」の外部経験則が log_autonomous_game v001 Q-D に直接かみ合う

<https://www.gamedeveloper.com/programming/movement-prediction>

## 概要

ゲームでオブジェクトの未来位置を計算するための **dead reckoning** を中心とした実装ガイド記事。基本式は `predicted_position = current + velocity × prediction_time`、加速付なら `p = p₀ + v₀t + ½at²`、Projectile は反発係数つき step 単位シミュレーション。用途は2つに大別される:
1. **描画用途**: グレネード投擲時の弧軌道を「予測軌道線」としてプレイヤーに見せる
2. **AI 用途**: 予測末端位置を AI に送って「避けるべき場所」マークに使う

具体パラメータ:
- **キャラクタの予測ホライズン = 1秒未満**（明示的記述）
- **Projectile simulation の DeltaTime = 0.02s**（物理エンジン整合）
- **車両の繰り返し step = "just a few"**（精度のため数回）
- 反発係数 0-1 (0=吸収、1=完全反発)

警告 (記事内で明示):
- 「予測ホライズンを延ばすほど実位置と divergence する」
- 「ゲームロジックは予測の失敗に備えた **fail-safe** を必須に持つこと」
- 「人間プレイヤーが介在するインタラクティブ世界の未来を完全に予測することは不可能」

## 内容分析

記事自体は 2010 年代の dead reckoning 基本論で、新規性ゼロの実装ガイドとして読むなら浅い。しかし**「予測 = 1秒未満」と「fail-safe 必須」を明示的に並べた数値・原則**として読むと、予測軌道を**プレイヤーに見せて勝負させる**ジャンルの設計範囲が極めて狭いことが見える:
- 1秒を超えると軌道線の精度は人間プレイヤーの行動で簡単に外れる → 予測軌道は「設計者の保証」ではなく「プレイヤーへの期待値表示」になる
- fail-safe なしに予測を見せると「予測どおりに動かない弾」が出た瞬間に readability 崩壊 → graze_log / Pulse Relay の「敵下部急加速 / 画面外射撃」と同型のフラストレーション源

特に**「対象物側マーカー」(Codex Pulse Relay v003 教師差分 part4) と組み合わせた時の整合性**: 対象物側マーカー = 敵弾本体に状態記号を付ける方式は、予測ゴーストと記号で同居する。記事の「予測線 + 末端ポイント表示」は、対象物側マーカー思想の数学的下地を与えている。

## 自分達の環境への適用

**log_autonomous_game v001 (Echo-Path) Q-D 設計への適用は直接的**:

1. **ECHO_FRAMES=60 (1秒) の妥当性確認**: 我々は v001 で「過去1秒の足跡を未来1秒の再演として確定」する Echo 機構を採用済。外部の経験則「キャラクタ予測 1秒未満」と完全一致。プレイヤー側 Echo と敵弾側ゴーストを**同じ1秒ホライズン**に揃える設計が外部裏付けを得た。
2. **divergence 警告 → 敵弾は直線等速に限定 (v001)**: 曲射/誘導弾を入れるとゴースト末端と実位置が divergence、プレイヤーは「ゴーストを信じて避けたら被弾」状態になる。**v001 では敵弾を直線等速のみに限定**し divergence ゼロを保証。曲射/誘導は v002 以降にゴースト更新ロジックと併せ実装。
3. **fail-safe = Echo 側の resolveLock 機構**: 既存の castLock → 1秒後 resolveLock は「再演中に被弾していなければ予測当」を判定する。Q-D 拡張で「敵弾ゴーストとプレイヤー予測軌道の幾何重なり」を追加するだけで、divergence 時の fail-safe (= miss 判定) が自動成立。新規 fail-safe コード不要。
4. **DeltaTime 0.02s ≒ 16.7ms (60fps)**: 我々は requestAnimationFrame ベース 16.7ms で動作、外部推奨 0.02s と差17%。可視的影響なし、ゴースト末端は `bullet.vx × 60` / `bullet.vy × 60` で算出。
5. **弾速上限の数値化 (Pulse Relay 教師差分「ゴースト見てから判断できない」回避)**: プレイヤー速度 3.4px/frame、1秒で 204px 移動可能。弾速を最大 3.0px/frame に制限すれば、ゴースト末端を見てから物理的に回避可能距離が保証される (プレイヤー速度 > 弾速 × 1.1)。**この数値根拠は外部知見の「予測 1秒未満」を物理回避距離に変換した結果**で、design_log.md §Q-D の弾速禁則を初めて数値化できた。

## メリット・デメリット

メリット:
- 1秒予測ホライズンの外部裏付けで、v001 設計の正当化コストが下がる
- 弾速上限の数値根拠（プレイヤー速度 × 1.1 上限）が得られた = Pulse Relay 教師差分「ゴースト見てから判断できない」を回避する具体閾値が確定
- fail-safe = Echo の resolveLock を再利用できる発見、新規コード不要

デメリット:
- 記事自体は基本論で、graze_log / Pulse Relay v003 教師差分の方が遥かに射程が広い。本記事を過大評価すると「予測ゲームの設計を外部論文に委ねた」錯覚に陥る
- 「予測 1秒未満」は経験則であって理論的下限ではない。我々の Echo-Path は「プレイヤーが過去1秒を未来1秒に投影する」構造で、もっと短い予測ホライズン (0.5秒等) も設計空間に含まれる。1秒固定を所与にせず、v002 以降で 0.5秒/1.5秒バリエーションを試す余地は残す

## 判定: v001 設計の数値根拠として採用、v002 以降の予測ホライズン可変化研究の出発点に保持

短期: v001 Q-D 実装で本記事の数値（1秒予測 / 0.02s step / fail-safe 必須）を直接物理化する。design_log.md §Q-D の弾速禁則を「BULLET_SPEED_MAX = 3.0 px/frame = プレイヤー速度 3.4 × 0.88」と数値化して固定。

長期: 「予測 1秒未満」を所与にせず、Echo-Path 派生ゲームで予測ホライズン 0.5s / 1.0s / 1.5s の差を比較するメタ実験を温める。本記事は実装ガイドであって設計理論ではないため、kaizen #106 摂取経路は満たすが、これ単独で原則昇格はしない（CLAUDE.md「個別指摘を即ルール化しない」と整合、同型外部知見が2-3例集まった時に「予測型回避ゲームの設計原則」候補として `memory/game_lessons_log.md` R 層昇格検討）。"""

result = post_message(CHANNEL, text)
if result.get("ok"):
    print(f"Posted to #{CHANNEL}, ts={result.get('ts')}, len={len(text)}")
else:
    print(f"FAILED: {result}")
