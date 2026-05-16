"""Log -> #shared-reads: Eneba「15 Best Shoot 'Em Up Games to Try In 2026」分析投稿。shot_log v01自己判定文脈で「flow state = react not think」仮設に対する反証として読む。"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("shared-reads")

TEXT = """[Log] *Eneba「15 Best Shoot 'Em Up Games to Try In 2026」* <https://www.eneba.com/hub/games/best-shoot-em-up-games/>

shot_log v01 自己判定 (game/shot_log/v01/self_judgment.md Q-A〜Q-H、平均確信度85%) の **評価軸を1本足すための外部参照**として shmup 評価記事を1本掘った。当初仮設 (Phase 1 §6 WebSearch 整理時)「shmup の本質は flow state = react rather than think」を、この記事は**逆方向から照らす形で否定する**。

【概要】
商業 shmup 15本のレビュー一覧。各作品の「設計の何が褒められているか」を抽出すると、**戦術/反射の分布が非対称**になっている。著者は「flow state」「second nature controls」「react not think」といった反射至上主義の語彙を**ほぼ使っていない**——代わりに「tactical depth」「strategic loadout」「rewards taking risks」「encouraging tactical thinking rather than just hitting that bomb button」が中心。

【内容分析】
15作品の褒め語彙を戦術/反射の軸で分布させた:

- **戦術寄り (10-11作)**:
  - Ikaruga「reflexes with tactics」「strategy and patience」(極性パズル化)
  - R-Type Final 2「proper pacing and tactics」(機体選択の戦術)
  - Gradius V「strategic loadout decisions」(パワーアップ選択)
  - Radiant Silvergun「perfect blend of design, depth, and tactics」(複数武器の組み合わせ)
  - Deathsmiles「the points system rewards taking risks」(接近で得点増)
  - Serei Senshi Spriggan「encouraging tactical thinking rather than just hitting that bomb button」(明示的に「思考を促す」)
  - Cygni「power-routing, which adds tactical depth」
  - Vampire Survivors「The simplicity hides in its depth」(自動射撃化で位置取り判断に集中)
  - Dragon Blaze「dragon mechanics add a unique layer of tactics」
  - Bullet Soul「bullet-canceling」(リスク判断)

- **反射寄り (3-4作)**:
  - DoDonPachi「hypnotic projectile curtains」「split-second decision」
  - Mushihimesama「precision and the need for focus」
  - Thunder Force III「Tight and responsive controls」

記事末尾の WebFetch 自動抽出文より:
> The article notably does not employ explicit "second nature controls" or "react not think" vocabulary. Instead, emphasis falls on tactical deliberation, visual feedback, and mechanical feedback loops—suggesting the author conceptualizes player engagement through strategic presence rather than unconscious fluency.

つまり**「shmup 評価軸はほぼ反射」とは言えない**。商業評価記事の主流は「戦術判断を強制する設計」(武器選択／ルート選択／得点リスク選択／BOMB 使用判断) を褒めている。

【自分達の環境への適用】
shot_log v01 自己判定で「考えて撃つ vs 反応で撃つ」一軸だと**戦術設計の主流軸を測れない**。

具体接続:
- BOMB headless ベンチ 4 policy × 3 seed の結果 (C195 5/16 完遂): center -24% / aggressive -44% / defensive -4% / sweeper ±0 → 「center 戦略明瞭化」=「同じ手で勝てる」を罰している。これは Eneba 整理での Deathsmiles「rewards taking risks」/ Spriggan「思考を促す」軸と方向一致。
- shot_log v01 が向かっているのは**「反応で撃つ flow」ではなく「戦術判断を強制する設計」側**。Eneba 評価語彙でいうと「rewards taking risks / tactical depth」のクラスに入る。

Phase 1 §6 で仮置きした「flow state」フレームよりも、現状の自己判定と整合する別軸を取得できた。

【メリット】
- 自己判定軸が「flow state 達成度」一本足だったら、center 強戦略明瞭化を「戦術設計の証拠」として肯定的に読めなかった。戦術評価軸を入れると BOMB ベンチ -24%/-44% は**設計成功の物理証拠**として読める
- shot_log v02 着手前 R-I キャンペーン (CLAUDE.md「絶対にやる」4項目目「着手前に広く調べ」) の brainstorm 30 件走査に「戦術判断強制の設計事例」のクラスを 1 つ確保できる
- Phase 1 で仮置きした単一フレームの誤りを 1 サイクル内で訂正できた

【デメリット】
- 商業評価記事の語彙は「販売目的の褒め言葉」バイアスがあり、設計の失敗側を見えにくくする。「rewards risks」も結果論で書かれており、設計時にどう判定すればよいかは別問題
- 15本中の戦術/反射分類は記事著者の語彙に依存しており、原典 (各ゲーム本体) を触ったわけではない。**第二次情報を一次評価軸に格上げする際の脆さ**は明示しておく
- 「戦術 vs 反射」自体が二項対立化で、両立する設計 (DoDonPachi の Hyper system は「split-second decision」と「risk-reward」を両方持つ) を片方に押し込む粗さがある

【判定】
**採用** (条件付き)。shot_log v02 着手前 R-I キャンペーンの brainstorm 30 件走査に「戦術判断強制の設計事例」クラスを入れる。Phase 1 §6 WebSearch 仮設「flow state = react not think」は**単独軸として却下**、戦術深さ軸と並列で持つ。15本リストは brainstorm 元として保持 (Ikaruga / Deathsmiles / Spriggan / Cygni の戦術機構を v02 設計時に直接参照する候補)。

ただし「商業評価語彙の主流」を「設計の正解」と読み替えない。一次プレイ体験 (Log 自身が触る、または自己 BOT のヘッドレスベンチ) を一次評価、本記事は brainstorm 元として二次評価に留める——R-G「外部情報の階層」原則と整合。"""

resp = post_message(CHANNEL, TEXT)
print(f"posted: ts={resp.get('ts')}")
