"""avoid_log_02 (磁石と鉄片) ヘッドレス自己試遊+評価。

Nao_u 2026-04-19 #game-rights の問いへの回答実装:
  「コンセプト通りに遊ぶAI」「わざとつまらない遊び方をするAI」の両輪で
  ゲームデザインが成立しているかを定量確認する。

本ファイルは index.html の核ロジックを Python に移植し、3種のプレイヤーAIを走らせて
メトリクス比較する。描画・入力は含まない。乱数は seed で再現性を担保。

プレイヤーAIの3モード:
  concept : コンセプト準拠。磁力場内に居座り、iron弾をAIに吸わせ、満タン手前でSPACEを叩く。
  slacker : SPACE連打のみ手抜き。移動は最低限、SPACEを毎フレーム押し続ける。
  dodger  : AI無視手抜き。画面端で鉄片回避のみ。SPACEは一度も押さない。

ゲームデザインが成立しているなら:
  concept のスコア/生存/連鎖 > slacker / dodger
  slacker / dodger は短命 or スコアが伸びない

逆に dodger/slacker の方が長生き&高スコアなら「手抜きが最適戦略化」=設計不良の証拠。
"""
import argparse
import json
import math
import random
from collections import Counter
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path

W, H, FPS = 420, 620, 60
MAX_FRAMES = 60 * 90  # 90秒上限（暴走防止）


def mulberry32(seed):
    """JS互換の seeded PRNG。index.html と完全同一の乱数列を生成する。"""
    a = seed & 0xFFFFFFFF
    def _i32(x):
        x = x & 0xFFFFFFFF
        return x - 0x100000000 if x >= 0x80000000 else x
    def _u32(x):
        return x & 0xFFFFFFFF
    def _imul(x, y):
        return _i32(_i32(x) * _i32(y))
    class RNG:
        def random(self):
            nonlocal a
            a = _u32(a + 0x6D2B79F5)
            t = _i32(a)
            t = _imul(t ^ (_u32(t) >> 15), t | 1)
            t = _i32(t) ^ _i32(_i32(t) + _imul(_i32(t) ^ (_u32(_i32(t)) >> 7), _i32(t) | 61))
            return _u32(t ^ (_u32(t) >> 14)) / 4294967296
    return RNG()


def new_state(seed, use_mulberry=False):
    rng = mulberry32(seed) if use_mulberry else random.Random(seed)
    return {
        "player": {"x": W * 0.35, "y": H - 70, "r": 9, "alive": True,
                   "deathBy": None, "burstCd": 0},
        "ai": {"x": W * 0.65, "y": H - 70, "r": 10, "alive": True,
               "deathBy": None, "absorbed": 0, "absorbMax": 6,
               "fullFrames": 0, "invincible": 0},
        "bullets": [],
        "spawn": 0,
        "t": 0,
        "pT": 0, "pEndT": 0,
        "aT": 0, "aEndT": 0,
        "over": False,
        "aiDeathBurstFired": False,
        "chain": 0, "chainDecay": 0, "chainPeak": 0,
        "score": 0,
        "rng": rng,
        # 計測用
        "in_field_frames": 0,   # プレイヤーが磁力場内(AIから160px以内)にいたフレーム数
        "space_presses": 0,     # 極性反転が成功したフレーム数
        "space_inputs": 0,      # SPACEが押された入力の総数（連打度）
    }


def _spawn(state):
    t = state["t"] / FPS
    speed = 2.2 + min(3.2, t * 0.04)
    rng = state["rng"]
    # 90%の確率でプレイヤー方向スポーン
    p = state["player"]
    if p["alive"] and rng.random() < 0.9:
        x = p["x"] + (rng.random() - 0.5) * 100
    else:
        x = rng.random() * (W - 30) + 15
    x = max(15, min(W - 15, x))
    state["bullets"].append({
        "x": x, "y": -20,
        "vx": (rng.random() - 0.5) * 0.8, "vy": speed,
        "r": 6 + rng.random() * 4,
        "mode": "iron", "life": 0, "_consumed": False,
    })


def _ai_attract(state, b):
    a = state["ai"]
    if not a["alive"]:
        return
    dx = a["x"] - b["x"]
    dy = a["y"] - b["y"]
    d = math.hypot(dx, dy) + 0.001
    if b["y"] > H * 0.3 and b["mode"] == "iron" and d < 220:
        pull = 0.08 * (1 - min(1, d / 220))
        b["vx"] += (dx / d) * pull * 3
        b["vy"] += (dy / d) * pull * 3
    if b["mode"] == "iron" and d < a["r"] + b["r"] + 2:
        if a.get("invincible", 0) > 0:
            pass  # 無敵中は吸収しない（鉄片は通過）
        elif a["absorbed"] < a["absorbMax"]:
            a["absorbed"] += 1
            b["_consumed"] = True
        else:
            b["_consumed"] = True
            a["absorbed"] = a["absorbMax"]


def _trigger_polarity_reversal(state):
    a = state["ai"]
    p = state["player"]
    if not a["alive"]:
        return False
    if a["absorbed"] <= 0:
        return False
    if p["burstCd"] > 0:
        return False
    p["burstCd"] = 12
    is_supercharge = a["absorbed"] >= a["absorbMax"]
    n = a["absorbed"] + (3 if is_supercharge else 0)
    rng = state["rng"]
    for i in range(n):
        if is_supercharge:
            ang = (i / n) * math.pi * 2 + rng.random() * 0.2
            speed = 2.4 + rng.random() * 1.8
            r = 6 + rng.random() * 3
        else:
            ang = -math.pi / 2 + (i - (n - 1) / 2) * 0.22 + (rng.random() - 0.5) * 0.08
            speed = 5 + rng.random() * 1.2
            r = 5
        state["bullets"].append({
            "x": a["x"], "y": a["y"] - 2,
            "vx": math.cos(ang) * speed, "vy": math.sin(ang) * speed,
            "r": r, "mode": "returned", "life": 0, "_consumed": False,
            "pierce": is_supercharge,
        })
    a["absorbed"] = 0
    a["fullFrames"] = 0
    if is_supercharge:
        a["invincible"] = 45
        state["supercharge_count"] = state.get("supercharge_count", 0) + 1
    state["space_presses"] += 1
    return True


def _ai_move(state):
    a = state["ai"]
    p = state["player"]
    threat_close = None
    best_dy = 9e9
    for b in state["bullets"]:
        if b["mode"] != "iron":
            continue
        dy = a["y"] - b["y"]
        if dy > 0 and dy < 80 and abs(a["x"] - b["x"]) < 40 and a["absorbed"] >= a["absorbMax"] - 1:
            if dy < best_dy:
                threat_close = b
                best_dy = dy
    if threat_close:
        side = 1 if a["x"] > threat_close["x"] else -1
        tx = a["x"] + side * 40
    else:
        tx = W * 0.5 + (W * 0.5 - p["x"]) * 0.5
    tx = max(a["r"], min(W - a["r"], tx))
    d = tx - a["x"]
    a["x"] += (1 if d > 0 else (-1 if d < 0 else 0)) * min(2.0, abs(d))


def _fire_ai_death_burst(state):
    a = state["ai"]
    n = max(4, a["absorbed"] + 3)
    rng = state["rng"]
    for i in range(n):
        ang = (i / n) * math.pi * 2 + rng.random() * 0.2
        speed = 2.4 + rng.random() * 1.8
        state["bullets"].append({
            "x": a["x"], "y": a["y"],
            "vx": math.cos(ang) * speed, "vy": math.sin(ang) * speed,
            "r": 6 + rng.random() * 3,
            "mode": "returned", "life": 0, "_consumed": False, "pierce": True,
        })
    a["absorbed"] = 0


def step(state, move_input, space_input):
    """1フレーム進行。move: -1/0/1, space: 0/1"""
    if state["over"]:
        return
    state["t"] += 1
    state["spawn"] += 1
    # B: 弾幕激化 — 15秒以降急カーブ、下限5
    t_sec = state["t"] / FPS
    if t_sec < 15:
        interval = max(11, 28 - state["t"] // 150)
    else:
        interval = max(5, int(11 - (t_sec - 15) * 0.35))
    if state["spawn"] >= interval:
        state["spawn"] = 0
        _spawn(state)

    p = state["player"]
    a = state["ai"]
    sp = 4.4

    if p["alive"]:
        p["x"] += sp * move_input
        p["x"] = max(p["r"], min(W - p["r"], p["x"]))
        if space_input:
            state["space_inputs"] += 1
            if a["alive"] and a["absorbed"] > 0 and p["burstCd"] <= 0:
                _trigger_polarity_reversal(state)
        if p["burstCd"] > 0:
            p["burstCd"] -= 1
        state["pT"] = state["t"]
        # 磁力場内滞在計測
        if a["alive"] and math.hypot(p["x"] - a["x"], p["y"] - a["y"]) <= 160:
            state["in_field_frames"] += 1

    if a["alive"]:
        _ai_move(state)
        state["aT"] = state["t"]
        if a["invincible"] > 0:
            a["invincible"] -= 1
        if a["absorbed"] >= a["absorbMax"]:
            a["fullFrames"] += 1
            if a["fullFrames"] > 90:
                # overload: SPACEを押さなかったのでAI死
                a["alive"] = False
                state["aEndT"] = state["t"]
                a["deathBy"] = "overload"
        else:
            a["fullFrames"] = 0

    for b in state["bullets"]:
        b["life"] += 1
        if b["mode"] == "iron":
            _ai_attract(state, b)
            d_to_ai = math.hypot(b["x"] - a["x"], b["y"] - a["y"])
            in_field = a["alive"] and d_to_ai < 160
            if in_field:
                # 磁力場内の鉄片は減速（磁場がブレーキ）
                drag = 0.88 + 0.08 * (d_to_ai / 160)
                b["vx"] *= drag
                b["vy"] *= drag
            elif p["alive"]:
                # 場外の緩い誘導
                dx = p["x"] - b["x"]
                dy = p["y"] - b["y"]
                d = math.hypot(dx, dy) + 0.001
                homing = 0.12 if not a["alive"] else 0.07
                b["vx"] += (dx / d) * homing
                b["vy"] += (dy / d) * homing
            # 古い鉄片は追尾化（磁石に処理されない鉄片は暴走する）
            if b["life"] > 240 and p["alive"]:  # 4秒以上場に残った弾
                dx = p["x"] - b["x"]
                dy = p["y"] - b["y"]
                d = math.hypot(dx, dy) + 0.001
                rage = min(0.25, (b["life"] - 240) / 300 * 0.25)  # 徐々に強化
                b["vx"] += (dx / d) * rage
                b["vy"] += (dy / d) * rage
        b["x"] += b["vx"]
        b["y"] += b["vy"]
        b["vx"] *= 0.995

    # returned vs iron chain (磁力場内報酬 + 範囲消去)
    p_in_field = (a["alive"] and p["alive"]
                  and math.hypot(p["x"] - a["x"], p["y"] - a["y"]) <= 160)
    field_mult = 2.0 if p_in_field else 0.1
    splash_radius = 35  # 巻き込み半径
    for r in state["bullets"]:
        if r["mode"] != "returned" or r["_consumed"]:
            continue
        for b in state["bullets"]:
            if b is r or b["mode"] != "iron" or b["_consumed"]:
                continue
            if math.hypot(r["x"] - b["x"], r["y"] - b["y"]) < r["r"] + b["r"]:
                b["_consumed"] = True
                if not r.get("pierce"):
                    r["_consumed"] = True
                state["chain"] += 1
                state["chainDecay"] = 90
                state["chainPeak"] = max(state["chainPeak"], state["chain"])
                state["score"] += int(10 * state["chain"] * field_mult)
                # 範囲消去: 当たったiron弾の近くのiron弾も巻き込む
                for s in state["bullets"]:
                    if s is b or s["mode"] != "iron" or s["_consumed"]:
                        continue
                    if math.hypot(b["x"] - s["x"], b["y"] - s["y"]) < splash_radius:
                        s["_consumed"] = True
                        state["chain"] += 1
                        state["chainPeak"] = max(state["chainPeak"], state["chain"])
                        state["score"] += int(10 * state["chain"] * field_mult)
                break

    state["bullets"] = [
        b for b in state["bullets"]
        if not b["_consumed"] and -60 < b["y"] < H + 60 and -40 < b["x"] < W + 40
    ]

    # collisions (磁力場内ではプレイヤー判定縮小: 磁石に守られる)
    p_hitbox = p["r"] * 0.45 if p_in_field else p["r"]
    for b in state["bullets"]:
        if p["alive"] and math.hypot(p["x"] - b["x"], p["y"] - b["y"]) < p_hitbox + b["r"]:
            if b["mode"] == "returned" and not state["aiDeathBurstFired"]:
                continue
            if b["mode"] == "returned" and state["aiDeathBurstFired"] and b["life"] <= 12:
                continue
            p["alive"] = False
            state["pEndT"] = state["t"]
            p["deathBy"] = b["mode"]

    if state["chainDecay"] > 0:
        state["chainDecay"] -= 1
        if state["chainDecay"] == 0:
            state["chain"] = 0

    if not p["alive"] and not state["over"]:
        state["over"] = True


# ---- プレイヤーAI 3モード ----

def policy_concept(state):
    """コンセプト準拠: 磁力場内に居座り、iron弾をAIに吸わせ、満タン手前でSPACE。
    - 目標x: AIのx±15（磁力場内で動きやすい位置）
    - 緊急回避: 近距離の ironが直撃コースならx方向に逃げる
    - SPACE: absorbed >= absorbMax-1 かつ近距離iron弾がプレイヤーに脅威ない時
    """
    p = state["player"]
    a = state["ai"]
    if not a["alive"]:
        # AI死後は純回避。returned弾(AI死爆発)が主敵
        return policy_dodger(state)

    # 脅威検知: プレイヤーの前方80px以内の iron
    imminent = []
    for b in state["bullets"]:
        if b["mode"] != "iron":
            continue
        dy = p["y"] - b["y"]
        if 0 < dy < 80 and abs(p["x"] - b["x"]) < 30:
            imminent.append(b)

    space = 0
    # 過充電狙い: 満タンならSPACE（画面掃除）
    if a["absorbed"] >= a["absorbMax"] and p["burstCd"] <= 0:
        space = 1
    # 緊急反転: 脅威が迫っていて吸収があればSPACE（通常反転で脅威を撃つ）
    elif imminent and a["absorbed"] >= 2 and p["burstCd"] <= 0:
        space = 1

    if imminent:
        # 直撃回避。最も近い弾の逆側へ
        b = min(imminent, key=lambda x: p["y"] - x["y"])
        move = -1 if b["x"] > p["x"] else 1
        # 壁チェック
        if p["x"] <= p["r"] + 2:
            move = 1
        elif p["x"] >= W - p["r"] - 2:
            move = -1
        return move, space

    # 磁力場内への誘導: AIのx±15にいるよう
    target_x = a["x"]
    # プレイヤーがAI近くにいると磁力場の鉄片密度が高くなるので、ほどよい距離
    # AIより少し横にずれて待つ
    offset = 15 if a["x"] < W / 2 else -15
    target_x = a["x"] + offset
    target_x = max(p["r"] + 2, min(W - p["r"] - 2, target_x))
    diff = target_x - p["x"]
    if diff > 4:
        move = 1
    elif diff < -4:
        move = -1
    else:
        move = 0
    return move, space


def policy_slacker(state):
    """手抜き1: SPACE連打のみ。移動は画面下中央付近に留まる。
    コンセプト否定: 磁石軸を理解せず、機能ボタンを連打するだけで長生きできるか。
    """
    p = state["player"]
    # 中央付近をキープ
    center = W / 2
    diff = center - p["x"]
    if diff > 6:
        move = 1
    elif diff < -6:
        move = -1
    else:
        move = 0
    return move, 1  # SPACE常時押下


def policy_dodger(state):
    """手抜き2: 画面端で鉄片回避のみ。SPACEは一度も押さない。AI無視。
    コンセプト否定: 磁石軸を無視して、伝統的な避けゲーとしてプレイ。
    人間プレイヤーに近い回避力を持つ（検知範囲広め、複数脅威対応）。
    """
    p = state["player"]

    # 複数脅威を収集（人間に近���認知範囲）
    threats = []
    for b in state["bullets"]:
        if b["mode"] == "iron" or (b["mode"] == "returned" and b["life"] > 12):
            dy = p["y"] - b["y"]
            if 0 < dy < 180 and abs(p["x"] - b["x"]) < 50:
                threats.append(b)

    if threats:
        # 全脅威の重心の逆側へ
        avg_x = sum(b["x"] for b in threats) / len(threats)
        move = -1 if avg_x > p["x"] else 1
        # 壁際なら反転
        if p["x"] <= p["r"] + 5:
            move = 1
        elif p["x"] >= W - p["r"] - 5:
            move = -1
        return move, 0

    # ���全な端を動的に選択（鉄片が少��い側）
    left_count = sum(1 for b in state["bullets"] if b["x"] < W / 2 and b["mode"] == "iron")
    right_count = sum(1 for b in state["bullets"] if b["x"] >= W / 2 and b["mode"] == "iron")
    target_x = 25 if left_count <= right_count else W - 25

    diff = target_x - p["x"]
    if diff > 4:
        move = 1
    elif diff < -4:
        move = -1
    else:
        move = 0
    return move, 0


POLICIES = {
    "concept": policy_concept,
    "slacker": policy_slacker,
    "dodger": policy_dodger,
}


def run_one(seed, policy_name):
    state = new_state(seed)
    policy = POLICIES[policy_name]
    while state["t"] < MAX_FRAMES:
        if state["over"]:
            break
        if state["player"]["alive"]:
            move, space = policy(state)
        else:
            move, space = 0, 0
        step(state, move, space)
    p = state["player"]
    a = state["ai"]
    pEnd = state["pEndT"] if not p["alive"] else state["t"]
    aEnd = state["aEndT"] if not a["alive"] else state["t"]
    return {
        "seed": seed,
        "policy": policy_name,
        "frames": state["t"],
        "player_survival_frames": pEnd,
        "ai_survival_frames": aEnd,
        "score": state["score"],
        "chain_peak": state["chainPeak"],
        "player_dead": not p["alive"],
        "ai_dead": not a["alive"],
        "player_deathBy": p["deathBy"],
        "ai_deathBy": a["deathBy"],
        "in_field_frames": state["in_field_frames"],
        "in_field_ratio": state["in_field_frames"] / max(1, pEnd),
        "space_presses": state["space_presses"],  # 反転成功数
        "space_inputs": state["space_inputs"],    # 入力フレーム数（連打度）
        "supercharge_count": state.get("supercharge_count", 0),
    }


def aggregate(traces):
    if not traces:
        return {}
    n = len(traces)
    return {
        "policy": traces[0]["policy"],
        "runs": n,
        "p_survival_avg_s": sum(t["player_survival_frames"] for t in traces) / n / FPS,
        "a_survival_avg_s": sum(t["ai_survival_frames"] for t in traces) / n / FPS,
        "score_avg": sum(t["score"] for t in traces) / n,
        "chain_peak_avg": sum(t["chain_peak"] for t in traces) / n,
        "chain_peak_max": max(t["chain_peak"] for t in traces),
        "in_field_ratio_avg": sum(t["in_field_ratio"] for t in traces) / n,
        "space_presses_avg": sum(t["space_presses"] for t in traces) / n,
        "space_inputs_avg": sum(t["space_inputs"] for t in traces) / n,
        "player_death_rate": sum(1 for t in traces if t["player_dead"]) / n,
        "ai_death_rate": sum(1 for t in traces if t["ai_dead"]) / n,
        "player_outlived_ai": sum(
            1 for t in traces
            if t["player_survival_frames"] > t["ai_survival_frames"]
        ) / n,
    }


def diagnose(agg_by_policy):
    """3つのポリシーの集計からゲームデザイン成立性を判定する。

    成立条件:
      (1) concept の生存/スコア > slacker, dodger 両方
      (2) concept の in_field_ratio > slacker, dodger (磁石軸を実際に使っている)
      (3) concept の chain_peak > slacker, dodger (コンセプト固有の快感=連鎖が出ている)

    反成立のシグナル:
      (A) slacker が concept より長生きする → SPACE連打が最適戦略化
      (B) dodger が concept より長生きする → 磁石軸を無視した方が安全=軸が機能していない
      (C) concept の chain_peak が低い → 連鎖がほぼ発生しない=報酬段が未接続
    """
    lines = []
    c = agg_by_policy.get("concept", {})
    s = agg_by_policy.get("slacker", {})
    d = agg_by_policy.get("dodger", {})
    if not (c and s and d):
        lines.append("- ポリシー不足で診断不可")
        return lines

    # 1. 生存比較
    c_surv = c["p_survival_avg_s"]
    s_surv = s["p_survival_avg_s"]
    d_surv = d["p_survival_avg_s"]
    lines.append(f"- 生存: concept={c_surv:.2f}s / slacker={s_surv:.2f}s / dodger={d_surv:.2f}s")
    if s_surv > c_surv:
        lines.append(f"  ⚠ **(A)SPACE連打が優位**: slackerがconceptより{s_surv-c_surv:.2f}s長生き。連打最適化=設計不良")
    if d_surv > c_surv:
        lines.append(f"  ⚠ **(B)磁石軸無視が優位**: dodgerがconceptより{d_surv-c_surv:.2f}s長生き。核機能を使わない方が安全=軸が機能していない")

    # 2. スコア比較
    lines.append(f"- スコア: concept={c['score_avg']:.0f} / slacker={s['score_avg']:.0f} / dodger={d['score_avg']:.0f}")
    if s["score_avg"] >= c["score_avg"] and s["score_avg"] > 0:
        lines.append(f"  ⚠ 連打がスコアでも勝っている")
    if d["score_avg"] > c["score_avg"]:
        lines.append(f"  ⚠ 磁石軸無視がスコアでも勝っている")

    # 3. 磁力場内滞在
    lines.append(f"- 磁力場内滞在率: concept={c['in_field_ratio_avg']:.0%} / slacker={s['in_field_ratio_avg']:.0%} / dodger={d['in_field_ratio_avg']:.0%}")
    if c["in_field_ratio_avg"] < 0.4:
        lines.append(f"  ⚠ conceptでさえ磁力場に居ない時間が多い=「近づく動機」不足（Nao_u 04-18指摘の再確認）")

    # 4. 連鎖ピーク
    lines.append(f"- chain peak(平均/最大): concept={c['chain_peak_avg']:.1f}/{c['chain_peak_max']} / slacker={s['chain_peak_avg']:.1f} / dodger={d['chain_peak_avg']:.1f}")
    if c["chain_peak_avg"] < 2:
        lines.append(f"  ⚠ **(C)連鎖が発生していない**: コンセプト固有の報酬段(Q4累積)が未接続")

    # 5. AI死因
    lines.append(f"- AI死亡率: concept={c['ai_death_rate']:.0%} / slacker={s['ai_death_rate']:.0%} / dodger={d['ai_death_rate']:.0%}")

    # 総合判定
    concept_wins = (c_surv > s_surv and c_surv > d_surv
                    and c["score_avg"] >= s["score_avg"]
                    and c["score_avg"] >= d["score_avg"])
    if concept_wins:
        lines.append("\n✅ **設計成立シグナル**: conceptが生存/スコア共に手抜き勢を上回る")
    else:
        lines.append("\n❌ **設計不成立シグナル**: 手抜きプレイが優位。ゲームデザインが機能していない")

    return lines


def render_report(all_traces, aggs, diagnoses, out_path):
    lines = []
    lines.append("# avoid_log_02 ヘッドレス評価レポート (磁石と鉄片)")
    lines.append("")
    lines.append(f"- 実行日時: {datetime.now().isoformat(timespec='seconds')}")
    lines.append(f"- ポリシー: {', '.join(aggs.keys())}")
    lines.append("")
    lines.append("## 集計（ポリシー別）")
    lines.append("")
    lines.append("| policy | p生存s | a生存s | score | chain_peak | field滞在率 | SPACE反転回数 | P死亡率 |")
    lines.append("|---|---|---|---|---|---|---|---|")
    for name, a in aggs.items():
        lines.append(
            f"| {name} | {a['p_survival_avg_s']:.2f} | {a['a_survival_avg_s']:.2f} | "
            f"{a['score_avg']:.0f} | {a['chain_peak_avg']:.1f} | {a['in_field_ratio_avg']:.0%} | "
            f"{a['space_presses_avg']:.1f} | {a['player_death_rate']:.0%} |"
        )
    lines.append("")
    lines.append("## 構造診断")
    lines.append("")
    lines.extend(diagnoses)
    lines.append("")
    lines.append("## サンプルトレース")
    for name, traces in all_traces.items():
        lines.append(f"### {name}")
        for t in traces[:3]:
            lines.append(
                f"- seed={t['seed']} p={t['player_survival_frames']/FPS:.1f}s "
                f"a={t['ai_survival_frames']/FPS:.1f}s score={t['score']} "
                f"chain_peak={t['chain_peak']} "
                f"p_death={t['player_deathBy']} a_death={t['ai_deathBy']} "
                f"field={t['in_field_ratio']:.0%} "
                f"space={t['space_presses']}"
            )
    out_path.write_text("\n".join(lines), encoding="utf-8")


def run_human_replay(replay_path):
    """人間リプレイJSONを再シミュレーションしてメトリクス+診断を出力する。"""
    data = json.loads(Path(replay_path).read_text(encoding="utf-8"))
    seed = data["seed"]
    inputs = data["inputs"]

    state = new_state(seed, use_mulberry=True)
    for frame_idx in range(len(inputs)):
        if state["over"]:
            break
        encoded = inputs[frame_idx]
        move_dir = (encoded >> 1) - 1  # decode: 0-5 → move -1/0/1
        space = encoded & 1
        if state["player"]["alive"]:
            step(state, move_dir, space)
        else:
            step(state, 0, 0)

    p = state["player"]
    a = state["ai"]
    pEnd = state["pEndT"] if not p["alive"] else state["t"]
    result = {
        "seed": seed,
        "policy": "human",
        "frames": state["t"],
        "player_survival_s": pEnd / FPS,
        "score": state["score"],
        "chain_peak": state["chainPeak"],
        "in_field_ratio": state["in_field_frames"] / max(1, pEnd),
        "space_presses": state["space_presses"],
        "player_deathBy": p["deathBy"],
        "supercharge_count": state.get("supercharge_count", 0),
    }

    # 3つのAIと比較
    ai_aggs = {}
    for pol in ["concept", "slacker", "dodger"]:
        traces = [run_one(seed + i, pol) for i in range(8)]
        ai_aggs[pol] = aggregate(traces)

    # 分析レポート
    lines = [
        f"# Human Replay Analysis",
        f"- seed: {seed}",
        f"- frames: {state['t']} ({state['t']/FPS:.1f}s)",
        f"",
        f"## Human Metrics",
        f"- survival: {result['player_survival_s']:.2f}s",
        f"- score: {result['score']}",
        f"- chain peak: {result['chain_peak']}",
        f"- field ratio: {result['in_field_ratio']:.0%}",
        f"- SPACE presses: {result['space_presses']}",
        f"- death by: {result['player_deathBy']}",
        f"- supercharges: {result['supercharge_count']}",
        f"",
        f"## vs AI Policies (8 runs each)",
        f"| metric | **human** | concept | slacker | dodger |",
        f"|---|---|---|---|---|",
    ]
    c, s, d = ai_aggs["concept"], ai_aggs["slacker"], ai_aggs["dodger"]
    lines.append(f"| survival | **{result['player_survival_s']:.2f}s** | {c['p_survival_avg_s']:.2f}s | {s['p_survival_avg_s']:.2f}s | {d['p_survival_avg_s']:.2f}s |")
    lines.append(f"| score | **{result['score']}** | {c['score_avg']:.0f} | {s['score_avg']:.0f} | {d['score_avg']:.0f} |")
    lines.append(f"| chain peak | **{result['chain_peak']}** | {c['chain_peak_avg']:.1f} | {s['chain_peak_avg']:.1f} | {d['chain_peak_avg']:.1f} |")
    lines.append(f"| field ratio | **{result['in_field_ratio']:.0%}** | {c['in_field_ratio_avg']:.0%} | {s['in_field_ratio_avg']:.0%} | {d['in_field_ratio_avg']:.0%} |")

    # プレイスタイル判定
    lines.append(f"")
    lines.append(f"## Play Style Analysis")
    field = result["in_field_ratio"]
    sp = result["space_presses"]
    if field < 0.2:
        lines.append(f"- **dodger寄り**: 磁力場滞在{field:.0%}。磁石軸をほぼ使っていない")
    elif field > 0.7 and sp == 0:
        lines.append(f"- **passive**: 磁力場内にいるがSPACE未使用。コンセプトの武器化ステップ未到達")
    elif field > 0.7 and sp > 0:
        lines.append(f"- **concept寄り**: 磁力場滞在{field:.0%}、SPACE {sp}回。コンセプト準拠に近い")
    else:
        lines.append(f"- **mixed**: 磁力場滞在{field:.0%}、SPACE {sp}回。コンセプトとdodgerの中間")

    if result["player_survival_s"] > c["p_survival_avg_s"] * 1.5:
        lines.append(f"- ⚠ conceptの1.5倍以上長生き → 設計が想定しないプレイパスの可能性")
    if result["score"] < d["score_avg"]:
        lines.append(f"- ⚠ dodger AI以下のスコア → 磁石軸の報酬が機能していない")

    # Nao_uのコメント用プレースホルダ
    lines.append(f"")
    lines.append(f"## Nao_u Comment")
    lines.append(f"_(ここにNao_uの「こういうプレイだと破綻するのでは」コメントを追記)_")

    return "\n".join(lines), result


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--runs", type=int, default=5)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--policies", default="concept,slacker,dodger")
    ap.add_argument("--out", default="replays")
    ap.add_argument("--replay", type=str, default=None, help="Path to human replay JSON")
    args = ap.parse_args()

    base = Path(__file__).parent / args.out
    base.mkdir(exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    if args.replay:
        # 人間リプレイ分析モード
        report_text, result = run_human_replay(args.replay)
        human_dir = base / "human"
        human_dir.mkdir(exist_ok=True)
        report_path = human_dir / f"analysis_{stamp}.md"
        report_path.write_text(report_text, encoding="utf-8")
        print(report_text)
        print(f"\nReport saved: {report_path}")
        return

    # AI回帰テストモード（既存）
    policies = [p.strip() for p in args.policies.split(",") if p.strip()]
    all_traces = {}
    aggs = {}
    for pol in policies:
        traces = [run_one(args.seed + i, pol) for i in range(args.runs)]
        all_traces[pol] = traces
        aggs[pol] = aggregate(traces)

    diagnoses = diagnose(aggs)

    replay_path = base / f"replay_{stamp}.json"
    replay_path.write_text(
        json.dumps({k: v for k, v in all_traces.items()}, ensure_ascii=False),
        encoding="utf-8",
    )
    metrics_path = base / f"metrics_{stamp}.json"
    metrics_path.write_text(json.dumps(aggs, ensure_ascii=False, indent=2), encoding="utf-8")
    report_path = base / f"report_{stamp}.md"
    render_report(all_traces, aggs, diagnoses, report_path)

    print(f"runs per policy: {args.runs}")
    print(f"replay  : {replay_path}")
    print(f"metrics : {metrics_path}")
    print(f"report  : {report_path}")
    for line in diagnoses:
        print(line)


if __name__ == "__main__":
    main()
