#!/usr/bin/env python3
"""Ash → #game-rights: graze_log v06 (A-3〜A-6(b) 5 機能まとまり) Nao_u プレイ評価依頼。

C197 Phase 4 で宣言したが未発射のままになっていた評価依頼を C198 Phase 4 で回収。
5/20 の A-1+ 評価依頼 (ts=1779233429) から 9 日間、評価ループが止まっていた——
その間に A-3 (Psyvariar Lv up 弱体版) / A-4 (wobble) / A-5 (b) (buzz invincibility) /
A-6 (a) (chain extension) / A-6 (b) (chain reward) の 5 機構が積み上がった。
本書面はそれら 5 機構をまとめて評価ループに乗せる。
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from slack_bot import post_message, _resolve_channel

CHANNEL = _resolve_channel("game-rights")

TEXT = """[Ash → Nao_u] graze_log v06 評価依頼 (第2弾) — 5/20 A-1+ 評価以降に積み上がった 5 機構 (A-3 / A-4 / A-5(b) / A-6(a) / A-6(b)) まとめて

5/20 の v06 A-1+ 評価依頼 (ts=1779233429) から 9 日間、評価ループが止まっていた。その間に積み上がった 5 機構を 1 本にまとめて出す。先行依頼への返信が来ていない段階で重ねる形になるが、評価ループを再開させること自体が今サイクルの本丸で、無敵チェイン系 (A-5〜A-6 (b)) は機構が連動するので 5 機構を 1 つの体感単位として渡す方が判定しやすい構造。

▼ (a) 5/20 以降 v06 に追加された 5 機構

| # | 機構 | commit | 何を 1 個足したか |
|---|---|---|---|
| 1 | **A-3** Psyvariar Lv up 弱体版 | `2db1de9f7` | graze 30 回ごと `state.playerLv +1` (max 4)、shotCount = gaugeLevel + playerLv、HUD に `PLv N/4`。無敵化と連鎖窓は意図的に剥がす (1 個刻み守の段階) |
| 2 | **A-4** wobble (identity チャンネル) | `a064014fb` | 弾本体に type 別 sin 振動 (aimed 緩 / fan3 速)。readability 第 4 層 = 弾 type を視認 1F 弁別 |
| 3 | **A-5 (b)** buzz invincibility | `ee686274f` | Lv up 発火点で自機 60F 無敵化 + 橙色 #ffa040 glow ring。`state.invincibleT` 新設、hit 判定 2 箇所に gate 追加 |
| 4 | **A-6 (a)** buzz chain extension | `5f6ea81ba` | 無敵中の Lv up で無敵時間を**上書きせず加算延長** (cap 180F=3 秒)、chain 中は黄寄り #ffd040 ring。Psyvariar 原典 chain 5 要素の (d) 連鎖 Lv up を獲得 |
| 5 | **A-6 (b)** buzz chain reward | `a36025b6e` | 無敵中の graze は gauge/score を 2x、popup 色 #ffd840。Volguard II 罠 (報酬経路の発火源が無敵中に消える) を入力側勾配 2x で予防 |

A-1 (anticipation) + A-1+ (shape polish) + A-1++ (anticipation color 弁別) は 5/20 評価依頼で提示済。A-3〜A-6(b) は **Psyvariar 経路 (経路A) の縦深化** で、5 要素 ((a) gauge / (b) Lv up invincibility / (c) Lv up 中 graze 継続 / (d) 連鎖 Lv up / (e) Roll hitbox shrink) のうち 4/5 まで到達 ((e) は graze_log に画面外動作がないため不適用)。

▼ (b) self_judgment.md (5/20 構造判定 "Yes") の根拠 — readability 4 層 (anticipation / telegraph / windup / wobble) 完成

> 1. **readability 3→4 層が用語的に揃った**: v05 beta = windup (発射前 10F) + 全弾軌跡 (常時 90F trail) の 2 層 = 「弾の時間」だけ telegraph。v06 で anticipation 層 (spawn 前 30F) で「敵の時間」が telegraph され、A-4 wobble で「弾 type」の identity チャンネルが追加。プレイヤー予測ステップ: 「弾が来る → 弾が動く」(v05) → 「敵が来る → 弾が来る → 弾が動く + type 弁別」(v06)
> 2. **削除可能改良 1 個刻みの純度を保っている**: A-1 が +34 行 / 6 箇所、A-4 が +9 行、A-5(b) が ~27 行 / 7 箇所、A-6(a) が ~15 行 / 2 箇所、A-6(b) が ~9 行 / 1 箇所。各機構独立に v05 beta 同一バイト列 + 中間 state に戻せる。守の段階整合性保たれている
> 3. **A-1+/++ shape polish が anticipation 層に方向性語彙を獲得させた**: 円のみではなく small=垂直線下端 / medium=▼下端 + color 弁別を追加し、3 層が用語だけでなく**視覚的にも一貫**

▼ (c) 評価で焦点を当ててほしい問い (5 機構それぞれの破綻リスク)

1. **A-1/A-1+ anticipation 層**: 画面上端の薄い円 (+ shape hint) が「次にここから降ってくる」として読めるか / それとも「ごちゃごちゃして読めない」になるか。0.5s 予兆が「先読みできて気持ちいい」か「もたつく」と感じるか (wave 間隔 0.5s 延長)
2. **A-4 wobble**: type 別 sin 振動 (aimed 緩 / fan3 速) が「弾の type を 1F で弁別」として機能するか、それとも「弾が小刻みに揺れて読みにくい」逆効果になるか
3. **A-5 (b) buzz invincibility**: Lv up 時の 60F 無敵 + 橙 glow ring が「Psyvariar 的気持ちよさ」を出すか、それとも「無敵中なにもすることがない」空白感を生むか
4. **A-6 (a) chain extension**: 無敵時間の加算延長 (cap 3 秒) で「チェインしてる感」が出るか、3 秒は短すぎ / 長すぎ / 妥当のどれか。chain 中の #ffd040 ring (黄色) と通常 #ffa040 (橙) の色弁別が機能するか
5. **A-6 (b) chain reward**: 無敵中 graze 2x 倍率が「無敵中こそ擦る方が得」の入力勾配として効くか、それとも「気にせず突っ込む」が依然支配戦略のままか。popup の +12 (vs 通常 +6) と色 #ffd840 で価値差が即時伝達できているか

特に **anticipation 層が情報過多になっていないか (A-1 + A-4 wobble + 弾幕 + trail + windup 予告線 + buzz glow ring が同時に出る場面)** と **buzz invincibility 中の chain 倍率が罰の方向に作用していないか (= Volguard 罠の入力側予防が効いているか)** を聞きたい。

▼ 再現可能 URL (?seed=N で同じ wave 順序 reproduce)
- ローカル: `game/graze_log/v06/index.html?seed=12345` 等で起動
- game over 後 Local Storage `graze_log_recent_seeds` に直近 10 件保存 (v05 beta B-1 から継続)

▼ 接続
- [game/graze_log/v06/README.md](https://github.com/Nao838861/nao-u-lab/blob/master/Claude/game/graze_log/v06/README.md) — 5 機構それぞれの採択根拠 + 差分 + 戻し方
- [game/graze_log/v06/devlog.md](https://github.com/Nao838861/nao-u-lab/blob/master/Claude/game/graze_log/v06/devlog.md) — 実装記録 + brainstorm 採択経路
- [game/graze_log/v06/self_judgment.md](https://github.com/Nao838861/nao-u-lab/blob/master/Claude/game/graze_log/v06/self_judgment.md) — 5/20 A-1+ 段階の構造判定 (5 機構統合版は未作成)
- [game/graze_log/v06/index.html](https://github.com/Nao838861/nao-u-lab/blob/master/Claude/game/graze_log/v06/index.html) — 実装本体
- [knowledge/20260522_psyvariar_buzz_chain_invincibility_risk_reward_spiral_v06_a3_shallow_clone.md](https://github.com/Nao838861/nao-u-lab/blob/master/Claude/knowledge/20260522_psyvariar_buzz_chain_invincibility_risk_reward_spiral_v06_a3_shallow_clone.md) — A-5(b) 採択根拠 (Psyvariar 5 要素分解 + shallow/deep clone)
- [knowledge/20260523_volguard2_economic_inversion_dominant_strategy_graze_log_v06_chain_extension.md](https://github.com/Nao838861/nao-u-lab/blob/master/Claude/knowledge/20260523_volguard2_economic_inversion_dominant_strategy_graze_log_v06_chain_extension.md) — A-6(b) 採択根拠 (Volguard 罠分析)
- [knowledge/20260523_psyvariar_3_switch2_review_v06_a6_pure_pointing_diff.md](https://github.com/Nao838861/nao-u-lab/blob/master/Claude/knowledge/20260523_psyvariar_3_switch2_review_v06_a6_pure_pointing_diff.md) — Psyvariar 3 (2026-05-22 Switch 2) との純粋指差し相違点 8 点
- 先行: ts=1779233429 (5/20 v06 A-1+ 評価依頼 — 9 日間返信待ち、本依頼は重ねる形)

▼ 判定方針開示 (`feedback_headless_unfit_for_unfinished_eval.md` t:5 準拠)
本書面・README・devlog は headless 数値 (到達率/生存秒/成功率) を判定根拠から外し、コード読解 + 描画予測 + 機構独立性検証のみで書いています。「面白いか / 前作より良いか」の判定は Nao_u 体感に委ねます。

— Ash (Win2) 2026-05-24 C198 Phase 4 / `feedback_means_ends_reversal_check.md` t:5 評価ループ再開 / 9 日間停止からの回収"""

if __name__ == "__main__":
    result = post_message(CHANNEL, TEXT)
    print(result)
