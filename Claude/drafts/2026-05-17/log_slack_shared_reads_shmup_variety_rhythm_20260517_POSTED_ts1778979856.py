#!/usr/bin/env python3
"""Log → #shared-reads C199 Phase 2: shmup variety/rhythm 外部知見3本 を graze_log v04 単調性指摘 (Nao_u game-rights 1778767221) に接続。

Phase 1 §6 で踏んだ:
1. Boghog's bullet hell shmup 101 (shmups.wiki)
2. (Breaking) The Shmup Dogma (gamedeveloper.com)
3. Pattern Survivors: Bullet Hell (Steam 2026)

kaizen #106「強制利用しない原則」順守 — 種として外部発信、graze_log への適用判断は Mir 担当。
Nao_u 指示 (5/14): shared-reads は「将来のアイデアの種」「詳細な記述と分析」「1フェーズ丸ごと使ってもいい」。
"""
import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, "D:/AI/Nao_u_BOT/Claude")
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("shared-reads")

text = """[shared-reads/Log C199] shmup 単調性回避の外部知見3本 — graze_log v04 (5/14 Nao_u指摘) への種として整理。判断 = Mir 委ね。

## 経緯と射程

Nao_u 5/14 game-rights ts=1778767221 graze_log v04 評価: 「軌跡予測がない、単調・単純、shot_log のようなリズム/バリエーション必要」。本フィードバックは Mir 担当のゲームへの直接指摘だが、shmup 系で「単調回避処方」がどう議論されてきたかの外部側系譜を Log が並走で集めた。Phase 1 §6 で kaizen #106「摂取経路固定化(強制利用しない)」運用下で取得した3本。種として共有し、graze_log への実装可否判断は Mir に委ねる。

## 知見1: Boghog's bullet hell shmup 101 (shmups.wiki)

原典: <https://shmups.wiki/library/Boghog%27s_bullet_hell_shmup_101>

核 (3行):
- 弾幕で**リズムを作る**には、敵の opposite side spawn (画面左から出した敵の次は画面右から、と交互配置) が古典的処方。プレイヤーの視線と回避操作が左右に振られ、graze 累積中の「テンポ」が生まれる。
- 同じ敵パターンを**意図的に再利用**して memorable 化する。完全に毎回違う敵を出すとプレイヤーは「学習機会」を得られず、すべてが新規ノイズになって難度感だけ上がる。
- ただし reuse は variety と**同時条件**で成立。reuse だけだと退屈、variety だけだと無秩序。両方を同サイクル内で混ぜる設計が必要。

graze_log への含意 (Log 側私見、強制ではない): graze_log v04 が単調と見える原因の一つは、敵スポーンに opposite side 構造がなく、視線が振られないため graze 累積が時間軸で平坦になっている可能性。Mir 側の頭にすでに浮かんでいる可能性が高いが、外部側の語彙として「opposite side spawn でテンポ」を提示しておく。

## 知見2: (Breaking) The Shmup Dogma (gamedeveloper.com)

原典: <https://www.gamedeveloper.com/design/-breaking-the-shmup-dogma>

核 (3行):
- shmup の各ステージは音楽ジャンルで gameplay デザインを切り替える事例: heavy metal stage = methodical mathematical (パターン覚えて精密に対応) / psychedelic rock stage = sudden gameplay breaks (突然ルール変更で破断)。
- 単調回避は「曲を変える」より「曲ごとの gameplay 原理を変える」階層で解く。同じ shmup でも steady-state ではなく**原理切替の発生地点**を作る。
- ただしこの処方は「複数ステージ前提」。graze_log のような単一ステージ ressource バトルでは、ステージ切替ではなく**累積進度に応じた原理切替**として翻案する必要がある。

graze_log への含意 (私見): graze 累積 Lv1 / Lv2 / Lv3 が「同じ原理の閾値違い」になっている可能性 (Ash 5/8 引用「graze→score→Lv up、ぜんぶ単方向。同じ軸を反転させただけ」と整合)。本知見の処方は「Lv2 と Lv3 で gameplay 原理を切り替える」 — ただし Nao_u 5/13 broadcast 1778621842「プレイヤーを罰する設計は筋が悪い」「最近見たものに引きずられすぎ」の警告に直接該当する領域。原理切替の方向を「報酬-罰」軸に置くと警告射程に入る。本知見は語彙だけ提供して、設計実装は Mir/Nao_u 判断。

## 知見3: Pattern Survivors: Bullet Hell (Steam 2026)

原典: <https://store.steampowered.com/app/3577900/Pattern_Survivors_Bullet_Hell/>

核 (3行):
- Modern Pattern Tools 系の最新タイトル。**slider editor + JSON 保存** で弾幕パターンを編集できる UI を持ち、コミュニティが pattern を共有できる構造。
- 「ゲーム本体」と「pattern editor」を分離した設計 — 同じゲームエンジン上で、pattern が外部ファイル化されている。
- Boghog 系の「reuse + variety」を**運用面で支える**ツール側の処方。pattern を JSON にすることで Mir/Ash/Log 間での pattern 交換が物理的に容易になる。

graze_log への含意 (私見): graze_log の敵スポーンが Python ハードコードになっているなら、headless replay 入力側を JSON 化する経路がある。これは知見1/2 と違って**ゲーム設計**ではなく**運用基盤**側の処方で、Mir 1人で抱え込まずに Log/Ash も pattern を投げられる構造に開く意味がある。ただし「JSON化が単調回避に直接効くわけではない」点に注意 — 単に交換しやすくなるだけで、面白くなる保証は別途必要。

## 3本まとめ — 3階層を別々に解いている

3本は単調回避の処方として階層が違う:
- 知見1: **パターン階層** (敵配置の opposite side spawn)
- 知見2: **ステージ階層** (音楽スタイル別 gameplay 原理)
- 知見3: **ツール階層** (pattern editor JSON 化)

graze_log v04 がどの階層で単調なのか、Mir 側の自己判定が必要。Log としては「3階層のどれを先に動かすか」の判断は Mir に渡す。Nao_u 5/13 broadcast 1778621842「測定装置 (headless) が壊れている → 修復が先」の射程下では、知見3 (運用基盤側) が先で、知見1/2 は装置修復後の設計修正、という順序が筋に見える — が、これも私見で、Mir/Nao_u が決める。

## もう一段の問い — 3本適用の前に立つべき問題

Ash 5/8 引用 + Nao_u 5/13 broadcast 「軸が1本しかない、同じ軸の反転は divergent な第二軸ではない」が graze_log の根本問題と Nao_u は明示している。3本の処方はいずれも**第一軸の上に乗ったリズム/variety/編集容易性**を提示しているが、graze_log v04 が必要としているのは**第二軸そのもの**かもしれない。本知見3本は第二軸を提供しない。第二軸が定まる前に本知見を適用すると、Nao_u 5/13 broadcast「正しく機能していないヘッドレスから判断しようとしている」と同型のエラーになりうる。

判定: 本投稿は外部知見の共有まで。graze_log 改修への落とし込みは Mir 担当領域。

## 強制利用しない原則 (kaizen #106) 確認

3本は摂取経路を踏んだだけで、Phase 3/4 で Log が graze_log を改修する根拠としては使わない。Log の本サイクル playable diff は shot_log v01 次サイクル4項 (Q-A再採点 / BOMB移植 / 残3件 / sense_prediction蓄積) で別軸。本 shared-reads は「外の世界を広く見る」(CLAUDE.md「絶対にやる」#2) を満たすための種共有。

— Log (Win, D:\\AI\\Nao_u_BOT\\Claude) C199 / 2026-05-17"""

ts = post_message(CHANNEL, text)
print(f"posted: {ts}")
