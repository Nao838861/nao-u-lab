"""Log -> #game-rights: log_autonomous_game v002 (Echo-Path) Nao_u 出荷投稿 (C249 Phase 4)"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from slack_bot import post_message, _resolve_channel

channel_id = _resolve_channel("game-rights")
assert channel_id, "could not resolve #game-rights channel"

text = """[Log → Nao_u / Mir / Ash] log_autonomous_game v002 (Echo-Path) 出荷 — C249 Phase 4

▼ 何を出すか
- `game/log_autonomous_game/v002/` (Echo-Path v002、game.js 636 行)
- 1 行コンセプト: 過去 1 秒の動きが「未来の道」になり、その線を弾幕の中で踏み抜けたら危機回避 = 1 秒先の自分の到達予定地点に賭けるごっこ遊び
- 中心入力 Space (castLock) / 副入力 矢印・WASD / 70-90 秒カーブ
- v001 比較主差分: タイトル + プレイ画面で「1 秒先計算結果の流出」完全ゼロ (Δ-1)、敵 C ダイブ追加 (Δ-5)、WAVE_TIMELINE で wave 種数 1→2→3 と時間進行で単調増加 (Δ-6)

▼ ヘッドレス監査 4 軸 全 PASS (90s シミュ、seed=20260527)
- verify.js: 悪手 4 方針 (camper 5.32s / lane-holder 4.62s / blind-sweeper 6.30s / nospecial 8.15s) 全 wave 1 内 fail、pass: true
- bullet_origin_audit: 10/10 check PASS、敵 C 弾源ゼロ、max enemy step 3.201 < player_speed 3.4
- enemy_behavior_audit: 8/8 case PASS、敵 A/D/C 3 軸独立確認
- agent_difficulty_proxy: 30/30 試行完走、素朴良手中央値 play_time=9.28s / clear_wave=1 / survival_rate=0

▼ 起動 (ローカル)
`cd game/log_autonomous_game/v002 && python -m http.server 8765` → `http://localhost:8765/`

▼ 文書 3 本 (リポジトリ閲覧)
- completion_report.md (What this proves / does not prove 分節): <https://github.com/Nao838861/nao-u-lab/blob/master/Claude/game/log_autonomous_game/v002/completion_report.md>
- visual_review.md (Log 側目視チェック 17 項目 + UNKNOWN 8 項目): <https://github.com/Nao838861/nao-u-lab/blob/master/Claude/game/log_autonomous_game/v002/visual_review.md>
- self_judgment.md (5 ゲート 26.5/30 / Q-ミミクリ 11.5/15 / 展開差カーブ 21/25): <https://github.com/Nao838861/nao-u-lab/blob/master/Claude/game/log_autonomous_game/v002/self_judgment.md>

▼ Nao_u / Mir / Ash に依頼したい体感判定 (Log は GUI 操作能力欠如で確定できない 8 項目)
1. 70-90 秒通しプレイ 3 回 (phase 0/1/2 全部抜けるサンプル)
2. 敵 A (赤) / D (紫) / C (黄) の 3 軸視覚峻別が成立するか
3. wave 1 軽量化 (n=3) + wave 2 8 秒静寂のリズム「圧迫→緩→次の圧迫」体感
4. タイトル副題「あなたの足跡が、これから歩く道になる」のみで「？」が立つか (動的視覚要素ゼロ後の純メタファ導入)
5. v001 との比較で「展開なし反復」解消の体感差
6. 状態1 グレーリング (起動直後 1 秒) が情報過多にならないか
7. 状態2 シアン薄リング (hit 後 0.5s) と状態3 「危機回避」テキストの視覚区別
8. 90s 以降の継続展開 (phase 2 維持で反復に戻らないか)

▼ 判定材料にしないでほしいもの (v002 スコープ外)
- 数値最適化議論 (BULLET_SPEED / SHOOT_INTERVAL / WAVE_REST_FRAMES) → v003 で複数試行する段
- HP system / boss / phase 3+ → completion_report.md §4 で明示済
- LLM playtester 化 → v001 凍結事項、継続凍結

▼ Log 自己採点 (詳細は self_judgment.md)
- 5 ゲート: 26.5/30 (88%) ← v001 21/25 → Q-C 新設で分母拡張 + Q-D/Q-ミミクリ-1 暫定昇格
- 展開差カーブ: 21/25 (84%) ← v001 0/0 (未設置) → C247 15.5/20 → C248 21/25 「反復」根本解消 +1.5
- 5 確定 (Q-導入/Q-C/Q-D/Q-成功FB 状態3/Q-ミミクリ-2/-3) は全て実機判定後

—Log (C249 Phase 4、kaizen #131〜#136 並走中)"""

ts = post_message(channel_id, text)
print(f"posted ts={ts}")
