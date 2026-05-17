"""Log -> #game-rights: Nao_u 5/17 17:57 (bomb=パワーダウン) + 17:59 (60s固定値が細かすぎる/LLM 判定が本来) 2件への応答"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

channel_id = _resolve_channel("game-rights")
assert channel_id, "could not resolve #game-rights channel"

text = """[Log → Nao_u 5/17 17:57 / 17:59] 受領。両件 memory 修正済み。

▼ 17:57「BOMB はパワーダウンなので焚かない方が良い」
構造を読み直した: graze_log v05.1 では `fireBomb()` (game/graze_log/v05.1/index.html:246) と `onHit()` (同 L517) が同じ G_LV2 リセットを共有しており、bomb 発火 = LV3→LV2 へ自発的パワーダウン (fire interval 6→7 / graze score ×3→×2 / LV3 被弾保険喪失)。つまり bomb は「自発的被弾」と等価。前提が逆だった。
baseline policy を「BOMB ready で必ず焚く」から「LV3 維持 + 瀕死時のみ焚く」に修正 (commit 7fb41e5673fc)。bomb がペナルティを伴う構造かどうかは各ゲーム version で個別確認する旨も rule に明記した。

▼ 17:59「60s はどのゲームにも適用できる固定値ではない / LLM が判定すべき」
固定 60s 閾値を全ゲーム共通ルールにしていたのが過一般化。指摘を受けて feedback_headless_litmus_floor.md を「ちゃんと遊べていないヘッドレスでゲーム設計判定をしない」に書き換え (commit cffee55e4e9e、別マシンの Claude 修正)。「ちゃんと遊べている」の基準はゲームごとに異なる (graze_log は長時間生存 / パズルはクリア / スコアアタックは人間到達スコア帯) と明示し、固定秒数を全ゲーム共通ルールから外した。

「本来は LLM が『ちゃんと遊べている』を判定すべき」も的を射ている。CLAUDE.md「絶対にやる」4項目目「Nao_u/cross_review/Slack は判定装置ではなく最終確認装置 → LLM が自己プレイで結論」と同じ方向。現状機能しきれていないのは feedback_critical_evaluation_before_implement.md (希望的観測スキップ) / feedback_judgment_postpone_patterns.md (β型「実プレイで判定」先送り) / 言葉遊びで「面白い」を結論する癖 — の3つが残っているため。ヘッドレス数値ルールを増やすのは仮設で、本筋は LLM 自己プレイの質を磨くこと、と自覚を残した。

▼ 反省
17:57 については、そもそも bomb 構造を読まずに「BOMB ready で必ず焚く」を baseline に書いたのが浅薄だった。R-A (Nao_u が普通にやって死なないゲームでヘッドレスが死ぬのはヘッドレス側の未熟さ) を守るために baseline を作るはずが、ゲーム機構を読まない baseline で機構ごと壊していた。次の policy_sane 作成時はゲーム version の score 関連メソッドを必ず読む。

—Log"""

ts = post_message(channel_id, text)
print(f"posted ts={ts}")
