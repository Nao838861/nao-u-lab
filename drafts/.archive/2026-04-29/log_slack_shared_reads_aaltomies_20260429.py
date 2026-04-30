#!/usr/bin/env python3
"""Log → #shared-reads: Aaltomies "Breakout, Arkanoid and Cyber Block Metal Orange: Evolution in simplicity" (2018)

経路: Phase 1 §6 外部検索1本必須運用、kw="Arkanoid Breakout clone game design analysis variations"。
brick_log v01 (Arkanoid 5項+独自1項=5:1) self-playtest 直前に当てる。
Nao_u 04-28 23:11「3本分析が浅い、次回は最低十数項」への直接対応として項目化。
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import _resolve_channel, post_message

channel_id = _resolve_channel("shared-reads")
assert channel_id, "could not resolve #shared-reads channel"

text = """\
*Aaltomies "Breakout, Arkanoid and Cyber Block Metal Orange: Evolution in simplicity"* (2018)
https://aaltomies.wordpress.com/2018/03/16/breakout-arkanoid-and-cyber-block-metal-orange-evolution-in-simplicity/

[Log C147 Phase 2] 経路=Phase 1 §6 外部検索（kw=Arkanoid Breakout clone game design analysis variations）。brick_log v01 self-playtest 直前に当てる。Nao_u 04-28 23:11「3本分析が浅い、次回は最低十数項」への先行充填。

中心テーゼ: 「複雑化ではなく、コアの拡張(expansion)としての進化」。シンプルさを保ったまま *目的を持った変奏(purposeful variation)* を加えるのが Arkanoid。それを破棄して技術ショーケース化すると Cyber Block Metal Orange の失敗に至る。

引用（再分析素材として残す）:
> "There is nothing unnecessary in Breakout, there is nothing in-between the player and the game."
> "Taito's success with Arkanoid stems from well planned expansions on pre-existing game design."
> "(Cyber Block Metal Orange) is not really an expansion on Arkanoid's gameplay, but a modification."
> "Perhaps rather than designing expansive and complex game systems...focus on core gameplay over everything else."

【Breakout 1976】
1. パドル5領域分割で角度差を作る（決定論、乱数なし）
2. Atari 2600版は12回反射ごとにスピードアップ（時間軸テンション）
3. プレイヤーとゲームの間に何も介在しない（HUD最小化）
4. easy to get into / hard to master を同一ルールの中で実装

【Arkanoid 1986 が Breakout に追加した拡張点】
5. パワーアップカプセル（multi-ball / longer paddle / shots）= *戦術判断の付加* であって機構変更ではない
6. ステージ単位の進行（単純な難度スケーリングを置換）
7. パワーアップは*選択的取得*（避けることもできる）—「機構変更ゼロでルートが増える」鍵
8. 著者は「他のクローンは Arkanoid を超えられなかった」と明言（30年以上）

【Cyber Block Metal Orange 1990 の失敗観察】
9. 拡張(expansion)ではなく *modification*（Arkanoid のゲームプレイそのものを別物に変えた）
10. パワーアップ蓄積ゲージで戦術判断構造が破壊された
11. *HUD位置がアクション中心から目を外させる*（HUD distraction）
12. ヒットボックスとビジュアルがズレて誤解を生む
13. アニメーション背景がボールと混在して視認性破壊（コア快感の阻害）
14. 視覚スペクタクル投資（宇宙船美術・キャラ・凝った背景）はコア快感を消す方向に作用しうる

【brick_log v01 への直接接続（self-playtest 観察軸の差し替え）】
15. *裏抜けカウンタ ≠ HUD distraction* にできているか自問必須。弧状ゲージ＋ボール色変化(白→金)が「裏抜け状態を伝える」目的なのか「目を引いて誘導する」目的に転化していないか。著者の (11)〜(13) を v01 self-playtest 観察軸 (b)「邪魔になっていないか」の具体三項に差し替える
16. Q-H-3「Arkanoid 拡張要素 v02 以降」の検討順序: 著者の主張に従えば *選択的取得型(パワーアップ・マルチボール)* から先、*modification 型(物理パラメータ・スコア計算・失敗条件変更)* は最後。守破離の守の延長
17. M-36 候補: 「拡張は『選択的取得型』から始め、『modification 型』は最後」を game_lessons_log に追加検討（Phase 3 で kaizen 起票判断）

注: 著者は Arkanoid 派生（Krakout / TRAZ / Off the Wall 等の機構違い）に踏み込んでいない。MobyGames Breakout variants と組み合わせて自分で派生を当てるのが「3本分析の浅さ」のもう一段の処方箋——次のサイクルの shared-reads 候補。"""

result = post_message(channel_id, text)
if result.get("ok") and not result.get("skipped"):
    print("Posted to #shared-reads")
elif result.get("skipped"):
    print("Skipped (duplicate)")
else:
    print(f"Failed: {result}")
