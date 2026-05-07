"""
Log C128 Phase 2 → #shared-reads 投稿
外部検索3本（onboarding研究）× shot_log v01 #24 ボム認知問題 × M-25 UI誤謬
6項目template (kaizen #119 起票直後・手動適用)
"""
import subprocess

text = """[Log C128 Phase 2 分析] 短いオンボーディング研究3本 × shot_log v01 ボム認知問題 (#24)

外部検索キーワード `implicit tutorial player onboarding shoot em up game design 2026`（kaizen #106 栄養の偏り処方箋運用化）。shot_log v01 完成宣言（2026-04-26 04:03 #game-rights）後、Nao_u_live #24「ボムって何？」（ボム機能を実装したがNao_uに伝わっていなかった）への処方箋探索。M-25「UIで示せばわかるはずの誤謬」と同型構造を外部語彙で再採点する目的。

──── 6項目template ────

【①記事の核主張1〜2行】
- iABDI "$10M Tutorial: Why Onboarding is Your Most Profitable Mechanic" (2026-01-13) <https://www.iabdi.com/designblog/2026/1/13/g76gpguel0s6q3c9kfzxwpfegqvm4k>: 短いオンボーディングが最も収益寄与する。tutorialはmechanic組込型が最強で、独立画面の説明は離脱を増やす
- Game-Wisdom "The Importance of Onboarding in Game Design" <https://game-wisdom.com/critical/onboarding-game-design>: invisible onboarding。Portal 2 例で「manualでなく small gap を置け」=言語化説明より体験で覚えさせる構造
- Celia Hodent "The Gamer's Brain Pt2: UX of Onboarding (GDC16)" <https://celiahodent.com/gamers-brain-ux-onboarding/>: 安全な学習環境を curated cycle として設計。罰最小・反復可能な閉ループ

【②自作への当てこみ — 一致と矛盾を分離】
shot_log v01 (`game/shot_log/v01/`) #24 ボム認知問題:
- Nao_u 04-26 対面: 「ボムって何？」→「説明がないね、何かいい方法はあるかな」→「忙しいのでプレイヤーしか見れないので、プレイヤーが鬱陶しくない程度にプレイヤーを見るだけでボム発動可能であることが認知できるのがよい」
- 一致: Celia「safe learning」⇄ Nao_u「鬱陶しくない程度」=罰最小passive perception。iABDI「mechanic組込型」⇄ Nao_u「プレイヤーキャラに表示」=独立tutorial画面の否定で一致
- 矛盾: Game-Wisdom Portal 2 の "small gap" は **jump = core mechanic** を教える例。shot_log v01 のボムは **core mechanicではない supplementary mechanic**（撃破連鎖が core、ボムは緊急回避）。3記事はcore mechanic onboardingが暗黙前提

【③暗黙 target player imagination 1文】(M-27 適用)
- iABDI: F2P mobile gamer（収益化目的、初期離脱コスト最小化）
- Game-Wisdom: Portal 2 プレイヤー（puzzle solver、頭で解くタイプ）
- Celia Hodent: GDC学術視点 / general player（UX原則の最大公約数）
- shot_log v01: Nao_u 自身=「忙しいのでプレイヤーしか見れない」STG非ヘビーユーザー、視線移動コストがゼロに近いゲーム要求
→ target が **STGヘビーユーザー想定でなく、視線拘束の強い忙しい人** で、3記事のいずれの target とも一致しない。**反証寄り適用**

【④同調罠回避ノート（直接適用しない宣言）】
「3本そろってオンボーディング重要」と一致を強調すると同調罠（feedback_no_sympathy_goal_first）。
- shot_log v01 のボムは **そもそも onboarding で教えるべきか自体が論点**。Nao_u は「プレイヤーを見るだけで認知できる」=passive perception 解=**tutorial問題ではなく state visualization 問題**として再定義した
- 直接適用しない: 「短い tutorial フェーズ追加」の処方箋は採用しない（target乖離 + supplementary mechanic + Nao_u が既に別解を提示済の3点）
- 反証寄りフラグ: 3記事ともプレイヤーが画面全体を見られる前提だが、shot_log v01 では「自機しか見ない」が制約条件

【⑤一致点を保留せず明示】
- Game-Wisdom「manualでなく small gap」(言語化説明の限界) ⇄ M-25「UIで示せばわかるはずの誤謬」(出力装置と入力装置の混同) は表面矛盾だが深層一致——両者とも「言語より体験」「説明より状態」。M-25 は出力装置として UI を限定、Game-Wisdom は体験で覚えさせる構造。**「言語/UI に過剰負荷をかけるな」で一致**
- iABDI「mechanic組込」⇄ Nao_u「プレイヤーキャラに表示」も一致——両者とも独立画面・独立フェーズを否定し、本来のゲームプレイ画面内に認知導線を置く

【⑥次の一手】
- 採用候補: ボム発動可能であることを **自機の見た目変化** として実装する案を v02 着手前 Q-A/B/C 再採点項目に追加（自機色変化 / 自機オーラ / ゲージMAX時の自機光彩拡大の3案）
- 判定保留: 独立 tutorial フェーズ追加は採用しない（target乖離 + supplementary mechanic + 同調罠の3点で反証寄り）
- 再採点運用: shot_log v02 着手前の Q-A 一文に「**ボム発動可能の認知導線**」を必須項目化。`game/shot_log/v02/devlog.md` 着手時にQ-A/B/C へ Q-D「supplementary mechanic 認知導線」を追加検討（M-25 の派生としてゲーム横断ルール化候補）
- 学びの転送先候補: M-28「supplementary mechanic は state visualization で伝え、tutorial で説明しない」候補として `memory/game_lessons_log.md` に提案中。ただし shot_log v02 で実装→検証してから刻印（M-25 の派生か独立 M か判定保留）

──── ここまで template ────

接合関係（記憶横断）:
- M-25「UIで示せばわかるはずの誤謬」: 出力装置と入力装置の混同。Game-Wisdom は output方向の処方
- feedback_pull_not_force_reading.md: 読ませる構造 ≠ 読まれる文章。同型——見せる構造 ≠ 見られる表示
- M-17 サプライズニンジャ理論: tutorial追加は穴塞ぎの典型。コンセプト段階で「ボム使用が一番嬉しい瞬間」と接続できているか先に問え（v02 Q-A 拡張）
- feedback_self_perception_blindness.md: shot_log v01 完成後の自己評価で「ボム認知導線」を盲点にしていた。自分の現在進行形は観測対象から外れる

なお、本Phase 2 は Nao_u_live #17「こちらにプレイさせる前に分析フェーズを挟んで欲しい」の運用反映の一部。次回 v02 着手前にこの shared-reads 分析を読み返してQ-A 再採点を実施する（再分析は raw_log と分析の両層が揃って初めて機能する=feedback_raw_log_reanalysis.md）。"""

result = subprocess.run(
    ["python", "slack_bot.py", "post", "shared-reads", text],
    capture_output=True, text=True, cwd="D:/AI/Nao_u_BOT", encoding="utf-8"
)
print("STDOUT:", result.stdout)
print("STDERR:", result.stderr)
print("RC:", result.returncode)
