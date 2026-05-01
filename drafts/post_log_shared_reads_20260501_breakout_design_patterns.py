"""Log → #shared-reads: Breakout型 Game Developer 精読 — 移動目標型・動的配置・避けるべき設計"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from slack_bot import post_message, _resolve_channel

channel_id = _resolve_channel("shared-reads")
assert channel_id, "could not resolve #shared-reads channel"

text = """[Log] Breakout型 設計パターン精読 — 「移動する目標」型を入れる前提資料

## ソース（feedback_url_explicit 遵守）
- **Game Developer "Breaking Down Breakout: System And Level Design For Breakout-style Games"**: https://www.gamedeveloper.com/design/breaking-down-breakout-system-and-level-design-for-breakout-style-games
- **Arkanoid (Wikipedia)**: https://en.wikipedia.org/wiki/Arkanoid
- **retrody.com "Arkanoid: Breaking Blocks and Setting Records"**: https://retrody.com/en/blog/arkanoid/

## 文脈
brick_log v04-v07 で「全ブロック揺れ/ボール接近応答」など型前例ゼロの独自要素を v01 で発明 → 4本連続爆散。Nao_u 20:51「型のない素っ頓狂な要素で爆散」「移動するわかりやすい目標を入れるとしたら」の指摘を受けて、Breakout型の確立された設計言語を改めて精読。**M-41 類似事例調査の実例として残す**。

## (1) 軌道制御パターン — 「動くオブジェクト」の型

Game Developer 記事は3つの確立された軌道制御を提示:

| 名称 | 定義（原文） | 効果 |
|------|------------|------|
| **mechanism** | "grabs the ball and ejects it upon a trigger event" | プレイヤー操作で放出方向を選ぶ → Agency |
| **hole** | "sucks the ball in and auto-releases it" | 短期的に視野から消える → 緊張の山 |
| **wedge shape** | "forces the ball to return at a less predictable angle" | 角度予測不可で偶然性注入 |

**brick_log v07 の「警戒対象=接近時に減速ガイド」は wedge の真逆**: 予測しやすくしてしまっている。型としては「mechanism」(プレイヤー介入で放出方向を選べる) の方が確立されており、ボール物理を毀損しない。

## (2) ブロック配置 — 静的/動的パターン

**静的:** Central Mass（中央集中）/ Wall / Columns / Mesh（格子）
**動的（移動目標型の本命）:**
- **Progressive blocks**: "each time the ball hits the paddle, the wall of blocks descends" — Space Invaders × Breakout 的圧迫
- **Split Screen**: "temporary split-screen conditions at timed intervals" — 画面分割が時限で発生
- **Peek-a-boo**: "formations of blocks that hide behind other formations" — 隠蔽 + 露出

これらは**確立された動的パターン**で、独自発明ではない。v04「全ブロック揺れ」と異なり、**何が起こるかプレイヤーが理解できる**形式。

## (3) 避けるべき設計（記事が明示)

> "Cramming too many blocks onto the screen can overly restrict the ball's motion and create a boring start"

ブロック詰めすぎ警告。さらに **パドル応答性の話**：
> "the player's frustration center on their lack of skill, or do they blame the paddle?"

→ **コアメカニズム（パドル＝プレイヤーの腕）を疑わせる機構介入は禁忌**。これは feedback_mechanism_damage_pleasure.md の Q-H-8b と直接接続。v06「全ブロック揺れ」は「パドル/ボールではなく揺れのせいで死んだ」と感じさせる典型。

## (4) Game Token Priority — 注意配分の優先順位

記事は視覚的注意の優先度を以下に固定:
> パドル・ボール > 目標 > 脅威 > パワーアップ > 通常ブロック

> "Moving, pulsating and glowing objects will attract more attention than their static counterparts"

→ **動かすべきは目標/脅威/パワーアップ層**。ブロック層を動かすと優先度設計が崩壊する。v04-v06 は最下層の通常ブロックを動かしていた。

## (5) 設計哲学 — Be Clever

> "educate players on your game's specific features and then **recombine existing features to create new play opportunities**"

**新規発明ではなく既存特徴の再結合**を明確に推奨。Nao_u 04-28「守破離の守、型通りクローンから始めろ、軸ずらしを v01 で作るな」(M-35) と同方向。

## brick_log/新ゲームへの直接適用

この記事から導ける**移動目標型の確立パターン**5つ:
1. **Arkanoid カプセル落下キャッチ**（記事中 Pakkuman/Funkiball 系列。プレイヤー優先注意=取りに行く対象）
2. **Progressive descending wall**（パドルヒットで下降。Space Invaders 圧迫、明確に「下りてくる」）
3. **Peek-a-boo 露出ブロック**（隠れていたブロックが特定条件で露出。発見の快感）
4. **Hole + auto-release**（吸い込み穴。短期消失 → 高位置から再出現）
5. **Wedge ブロック**（予測不可角度を返すブロックを盤面に配置）

**Q-H-2/3 のクローン元として全て確立**: 1=Arkanoid 1986、2=Space Invaders+Breakout、3=各種、4=Bumper系、5=Pinball系の Breakout 移植。

## 反省（meta）

20:56 で Log がまとめた A/B/C 3案は、上記 (1)(2)(3) の知識を持たずに書いた。**Game Developer 記事を Phase 1 で WebSearch で発見していたのに、Phase 2 で精読せず自分の浅い知識で3案を作った**= M-41 違反 + Phase 1→Phase 2 連結の機構不備。次の brainstorm.md ではこの記事の (1)(2) 各パターンを最初に列挙してから新規ブレストに入る。

将来のアイデアの種として保存。"""

post_message(channel_id, text)
print("Posted to #shared-reads")
