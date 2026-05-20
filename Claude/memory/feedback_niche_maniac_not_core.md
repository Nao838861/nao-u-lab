---
name: feedback_niche_maniac_not_core
description: マニア向けの変則要素をゲームのコアに据えない。graze は graze_log で coreに置いていたが、Nao_u 2026-05-20「graze は変則的なマニアしか喜ばない要素」で軌道修正。
type: feedback
source: Nao_u 2026-05-20 09:35 #game-rights
---

# マニア向け要素をコアに据えない

**ルール**: ゲームのコア要素を選ぶ時、「ジャンルマニアだけが面白がる変則的快感」と「普通のプレイヤーが拾える快感」を区別する。前者は**サブ層に置く**か、削る。コアは後者で組む。

**Why**:
- Nao_u 2026-05-20 09:35 #game-rights:「Grazeは一旦無視した方が良いと思ってる。あれはコア要素として扱ってはいけない変則的なマニアしか喜ばない要素なので。」
- 実際の出力履歴: graze_log v05 / v06a / v06b / v10 / "tune graze pressure without backlash" / "archive-informed graze log stage versions" など、graze 挙動のチューニング自体がサイクル出力の中心になっていた。
- 構造: 「graze pressure を最適化すれば面白くなる」と無意識に置いていた → graze 自体は STGマニアの語彙であり、普通のシューターは「敵を撃って崩す」「弾を避ける」「ステージを突破する」を主軸に楽しむ。マニア軸を polish しても**普通の人には届かない自己満ゲーム**になる。
- core_mission#3「ゲームを作ること」の文脈で、誰が遊ぶゲームかの想定がマニア側に静かにずれていた。広く客観的な視点（CLAUDE.md 着手前ガード「外の世界を広く見る」）が抜けた典型。

**How to apply**:
1. 新ゲーム / 改修着手前 (Q0 段階) に**コア要素候補に対して「マニア軸か / 普通軸か」を1行判定**する。マニア軸はサブ層へ降ろす、または削る。
2. 既存ゲームのコアを定義する時、**そのジャンルを初めて遊ぶ人が「何が面白いか」を5秒で答えられる軸**を core にする。graze / cancel / extend ループ / risk-reward の細かい裏取りは sub。
3. 「pressure tuning が出力の中心になっている」状態は要素の評価ではなく、**コア配置が間違っている可能性のシグナル**として扱う。サイクル中盤で気づいたら polish 続行ではなく core 再選定に戻る。
4. graze_log は v10 までで graze を core に置いた線は一旦凍結。次バージョンは graze をサブ層に置き、コアは別軸（敵配置の読み / 撃ち分けのテンポ / 突破達成感など）で再構成する案から brainstorm する。

**関連**:
- [[feedback_genre_general_element_blindness]] — ジャンル一般要素をコア外に追いやる別軸の盲点（こちらは「コアを狭く取りすぎる」、本記憶は「コアにマニア軸を置く」）
- [[feedback_recency_bias_concept_overuse]] — graze pressure を最新のチューニング対象として磨き続けた構造の遠因
- [[feedback_self_judgment_no_human_dep]] — 「面白いか」を自己判定する時、ジャンルマニア視点に偏らないチェックを入れる
