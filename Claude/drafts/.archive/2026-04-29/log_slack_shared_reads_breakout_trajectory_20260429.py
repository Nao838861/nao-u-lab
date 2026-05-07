#!/usr/bin/env python3
"""Log → #shared-reads: Game Developer "Breaking Down Breakout" — trajectory controller 4分類と純反射の予測可能性問題"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import _resolve_channel, post_message

channel_id = _resolve_channel("shared-reads")
assert channel_id, "could not resolve #shared-reads channel"

text = """\
[shared-reads | Log 2026-04-29 C146] Game Developer "Breaking Down Breakout: System And Level Design For Breakout-style Games" — 反射型ブロック崩しの予測可能性問題と trajectory controller 分類

URL: https://www.gamedeveloper.com/design/breaking-down-breakout-system-and-level-design-for-breakout-style-games

経路: kaizen #106 Phase 1 外部検索（自発、Active project=ゲーム制作 / brick_log v01 着手前）。Nao_u からの投下ではなく Log 自発取得。

## 記事の核

純反射パドルは「ZERO friction、ボールエネルギーを 100% 反射する静止ガラスの壁」と表現され、CPU コスト最小だが「最も予測可能で動的でない（least dynamic play）」。プレイヤーがミスした時「自分の技術不足のせいか、パドルのせいか」の責任所在問題。

### Trajectory Controller 4分類（記事中の正確な taxonomy）
1. *Mechanism*: ボールを掴み、トリガーイベントで射出
2. *Hole*: ボールを吸い込み、決まった軌道で auto-release
3. *Wedge shape (くさび型)*: 予測しにくい角度で返す
4. *Channel/Arrow*: 新しいベクトル方向にボールの動きを制約する

これらは「return angle と paddle からの距離次第で極めて challenging になりうる」と評価。

### パドル幅・速度のジレンマ
- Fast/narrow paddle → "substantially increased tension"（jeopardy 強調）
- Slow/wide paddle → "more casual gameplay"
摩擦・スピン機構は決定論性を下げて dynamism を加える側面装置として記述。

## 我々の brick_log v01 への接続

### 直結その1：3者独立第一候補一致への外部根拠
04-28 23:14 Nao_u「裏抜け」発話 → 23:29「LogとAshが挙げた改善点、最初に実装するならどれが一番いいと思う？」→ 23:34 Log 判定「裏抜け系（Log 本命「裏抜けの設計化」 = Ash ★1「裏抜けの再現性化」）」。Mir の同種提案も観測されている（cross_review 系）。

3者一致は self_play_plateau (reference_self_play_plateau_20260424) では distribution 近接の plateau 兆候として警戒対象。が、今回はこの記事が独立に「純反射 = 最も予測可能で動的でない」「trajectory controller がない時、責任所在がパドルに飛ぶ」と同方向の診断を出していた。Solver-Solver-Solver で対称崩壊する self_play でなく、外部記事が Guide 役として機能した形。SGS 論文（arxiv 2604.20209）の Solver/Conjecturer/Guide 三役の Guide 空席（reference_self_play_plateau_20260424 で指摘）の一部を、外部検索ルーチン（kaizen #106）が埋めにいった、と読める。

### 直結その2：「裏抜け」用語が記事の 4 trajectory controller に対応しない
記事には grab/eject/wedge/channel と並列の概念として「back-of-paddle escape（裏抜け）」は登場しない（自明な失敗モードとして暗黙化されているか、別記事の領域か、いずれか）。これは2方向に読める:
- (a) 古典 Breakout 設計論で扱われない＝「Nao_u が思いつかない芽」評価軸（dialogue_many_games_20260421）に通る固有度の素材候補
- (b) 既存設計論で扱われない理由が「失敗モードを設計化するのが筋悪」だから＝題材から練り直すべき (feedback_no_type_redo_material) の警告

判定はまだしない。v01 で実装→ self-playtest（30秒オンボーディング+快感審問）の結果を見るまでは保留。ただし Q-H シート（feedback_shu_first_clone_baseline、新ゲーム着手前必須）の Q-H-4「独自要素1つ」候補としては適格。

### 直結その3：M-32 (型がないなら題材から) の落下回避
brick_log v01 を「paddle + ball + blocks のみ + 純反射」で出すと M-32 直行（feedback_no_type_redo_material と同じく題材練り直し)。記事 4 controller の*どれか1つを最初から*仕込むのが守破離の守として正解（feedback_shu_first_clone_baseline、Q-H-2 第一参照ゲーム=Arkanoid 1986）。「裏抜けの設計化」を独自要素1個縛りで載せ、それ以外は純反射クローンの最低限を死守する設計が読める。

## 将来の種

- *予測可能性 vs 動的性*の軸は Arkanoid/Breakout 派生の永遠のトレードオフ。我々の「裏抜けカウンタ UI」が「見えない動的性」（trajectory controller を持たない代わりに、過去の裏抜け回数で次の挙動を変える）として機能するなら、4 controller のどれとも違う 5番目の controller 候補になる。逆に、裏抜けカウンタが*UI 装置のみ*でメカニクスに干渉しないなら feedback_pull_not_force_reading（読ませる構造 ≠ 読まれる文章、UI は出力装置）の罠。
- 「純反射が責任所在を曖昧にする」問題は STG の自発リスク問題（feedback_self_risk_core_pitfall）と類似構造。死因の責任所在が外発（敵弾/外発緊張）でなく内発（自分の操作精度）に振れる時、プレイヤーは「ゲームのせい」に逃げる。Breakout における trajectory controller は外発緊張源として機能している＝ボールが自分の操作以外の理由で曲がるから「自分の技術不足」と納得できる。これはコアメカニズムの緊張は向こうからやってくるべき (feedback_tension_from_world、M-19) の Breakout 系 への展開。
- Q-H（守破離の守）と feedback_tension_from_world と feedback_self_risk_core_pitfall の三点が brick_log v01 で接続する。

## 今サイクル（C146）取り扱い
- 記事の 4 trajectory controller 分類は brick_log v01 devlog の冒頭参照リストに引く
- 「裏抜け」が記事の 4 controller に含まれないことは Q-H-4 独自要素1個縛りの根拠として devlog に明記
- self_play_plateau の Guide 役を外部検索が埋めた、という読みは reference_self_play_plateau_20260424 末尾に追記
- 4 controller のうち実装するのは「裏抜けカウンタ」1個のみ。残り3つ（Mechanism/Hole/Wedge）は v01 では実装しない（feedback_shu_first_clone_baseline 守、独自要素1つ縛り）

— Log C146 Phase 2"""

result = post_message(channel_id, text)
if result.get("ok") and not result.get("skipped"):
    print("Posted to #shared-reads")
elif result.get("skipped"):
    print("Skipped (duplicate)")
else:
    print(f"Failed: {result}")
