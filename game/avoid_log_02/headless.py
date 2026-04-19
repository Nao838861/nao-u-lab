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
                   "deathBy": None, "burstCd": 0, "barrier": 0},
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
        "in_field_frames": 0,
        "space_presses": 0,
        "space_inputs": 0,
        # 面白さの近似指標用
        "arc_hits": 0,        # SPACEを押して30f以内にiron弾が消えた回数
        "arc_total": 0,       # SPACEを押した回数（burstCd中含む）
        "arc_window": 0,      # SPACE後のカウントダウン（30f）
        "move_changes": 0,    # 移動方向の変化回数（phase variety用）
        "last_move": 0,       # 前フレームの移動方向
        "phase_space_events": 0,  # SPACE発生回数（phase variety用）
    }


def _spawn(state):
    t = state["t"] / FPS
    speed = 2.2 + min(3.2, t * 0.04)
    rng = state["rng"]
    # 30%の確率でプレイヤー方向スポーン
    p = state["player"]
    if p["alive"] and rng.random() < 0.3:
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
        pull = 0.14 * (1 - min(1, d / 220))
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
    # 磁力場内(160px以内)でしか極性反転できない
    if math.hypot(p["x"] - a["x"], p["y"] - a["y"]) > 160:
        return False
    p["burstCd"] = 18
    # SPACE = AI周囲の鉄片を一括消去（確実に効く）
    cleared = 0
    for b in state["bullets"]:
        if b["mode"] == "iron" and not b["_consumed"]:
            if math.hypot(b["x"] - a["x"], b["y"] - a["y"]) < 180:
                b["_consumed"] = True
                cleared += 1
    state["chain"] += cleared
    state["chainDecay"] = 90
    state["chainPeak"] = max(state["chainPeak"], cleared)
    state["score"] += cleared * 10
    if cleared > 0:
        state["arc_hits"] += 1
    a["absorbed"] = 0
    a["fullFrames"] = 0
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
    interval = max(11, 28 - state["t"] // 150)
    if state["spawn"] >= interval:
        state["spawn"] = 0
        _spawn(state)

    p = state["player"]
    a = state["ai"]
    sp = 4.4

    if p["alive"]:
        p["x"] += sp * move_input
        p["x"] = max(p["r"], min(W - p["r"], p["x"]))
        # phase variety: 移動方向の変化をカウント
        if move_input != state["last_move"]:
            state["move_changes"] += 1
        state["last_move"] = move_input
        if space_input:
            state["space_inputs"] += 1
            state["arc_total"] += 1
            state["arc_window"] = 30  # 30f以内にiron弾が消えたか追跡
            state["phase_space_events"] += 1
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
            if a["fullFrames"] > 45:
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
        b["x"] += b["vx"]
        b["y"] += b["vy"]
        b["vx"] *= 0.995

    # returned vs iron chain
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
                state["score"] += 10 * state["chain"]
                # ARC計測: SPACE後30f以内の消去
                if state["arc_window"] > 0:
                    state["arc_hits"] += 1
                break

    state["bullets"] = [
        b for b in state["bullets"]
        if not b["_consumed"] and -60 < b["y"] < H + 60 and -40 < b["x"] < W + 40
    ]

    # collisions
    for b in state["bullets"]:
        if p["alive"] and math.hypot(p["x"] - b["x"], p["y"] - b["y"]) < p["r"] + b["r"]:
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

    # ARC window countdown
    if state["arc_window"] > 0:
        state["arc_window"] -= 1

    if (not p["alive"] or not a["alive"]) and not state["over"]:
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


def policy_remote_presser(state):
    """手抜き3: 画面端で回避しつつ、AIゲージが危なくなったらSPACEだけ押す。
    Nao_u 2026-04-20 のプレイで発見されたパターン: field 9%, space 50回。
    AIの近くにいなくてもSPACEは効くことを悪用する。
    """
    p = state["player"]
    a = state["ai"]

    # SPACEはAIが満タン近い時だけ押す（遠くから管理）
    space = 0
    if a["alive"] and a["absorbed"] >= a["absorbMax"] - 1 and p["burstCd"] <= 0:
        space = 1

    # 移動はdodgerと同じ（端で回避）
    threats = []
    for b in state["bullets"]:
        if b["mode"] == "iron" or (b["mode"] == "returned" and b["life"] > 12):
            dy = p["y"] - b["y"]
            if 0 < dy < 180 and abs(p["x"] - b["x"]) < 50:
                threats.append(b)

    if threats:
        avg_x = sum(b["x"] for b in threats) / len(threats)
        move = -1 if avg_x > p["x"] else 1
        if p["x"] <= p["r"] + 5:
            move = 1
        elif p["x"] >= W - p["r"] - 5:
            move = -1
        return move, space

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
    return move, space


def policy_oscillator(state):
    """離れて避けて、ゲージが危なくなったらAIに近づいてSPACE→離れる。
    「通い」プレイ。近づく時間を最小限にしてリスクを避ける。
    """
    p = state["player"]
    a = state["ai"]
    space = 0

    # ゲージが危険（absorbMax-1以上）→ AIに近づく
    need_approach = a["alive"] and a["absorbed"] >= a["absorbMax"] - 1
    near_ai = a["alive"] and math.hypot(p["x"] - a["x"], p["y"] - a["y"]) <= 160

    if need_approach and near_ai and p["burstCd"] <= 0:
        space = 1  # 近くに着いたらSPACE

    if need_approach and not near_ai:
        # AIに向かう
        diff = a["x"] - p["x"]
        move = 1 if diff > 3 else (-1 if diff < -3 else 0)
    else:
        # 普段はdodgerと同じ（端で回避）
        threats = []
        for b in state["bullets"]:
            if b["mode"] == "iron":
                dy = p["y"] - b["y"]
                if 0 < dy < 180 and abs(p["x"] - b["x"]) < 50:
                    threats.append(b)
        if threats:
            avg_x = sum(b["x"] for b in threats) / len(threats)
            move = -1 if avg_x > p["x"] else 1
            if p["x"] <= p["r"] + 5: move = 1
            elif p["x"] >= W - p["r"] - 5: move = -1
        else:
            target_x = 25 if p["x"] < W / 2 else W - 25
            diff = target_x - p["x"]
            move = 1 if diff > 4 else (-1 if diff < -4 else 0)
    return move, space


def policy_camper(state):
    """AIの真横に張り付いて動かず、ゲージが溜まったらSPACE。
    「AIの近くにいさえすればいい」が安全すぎないか確認。
    """
    p = state["player"]
    a = state["ai"]
    space = 0
    if a["alive"] and a["absorbed"] >= a["absorbMax"] - 1 and p["burstCd"] <= 0:
        space = 1
    # AIのx座標+20にひたすら張り付く
    target_x = a["x"] + 20 if a["alive"] else W / 2
    diff = target_x - p["x"]
    if diff > 3:
        move = 1
    elif diff < -3:
        move = -1
    else:
        move = 0
    return move, space


POLICIES = {
    "concept": policy_concept,
    "slacker": policy_slacker,
    "dodger": policy_dodger,
    "remote": policy_remote_presser,
    "camper": policy_camper,
    "oscillator": policy_oscillator,
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
        "space_presses": state["space_presses"],
        "space_inputs": state["space_inputs"],
        "supercharge_count": state.get("supercharge_count", 0),
        # 面白さの近似指標
        "arc": state["arc_hits"] / max(1, state["arc_total"]),  # action-reaction coupling
        "move_changes": state["move_changes"],
        "phase_variety": (state["move_changes"] + state["phase_space_events"]) / max(1, pEnd / FPS),  # per second
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
        # 面白さの近似指標
        "arc_avg": sum(t["arc"] for t in traces) / n,
        "phase_variety_avg": sum(t["phase_variety"] for t in traces) / n,
    }


def diagnose(agg_by_policy):
    """4つのポリシーからゲームデザイン成立性を判定。
    (D) remote = 離れてSPACEだけ押す。Nao_u 2026-04-20 のプレイで発見。
    """
    lines = []
    c = agg_by_policy.get("concept", {})
    s = agg_by_policy.get("slacker", {})
    d = agg_by_policy.get("dodger", {})
    r = agg_by_policy.get("remote", {})
    if not (c and s and d):
        lines.append("- ポリシー不足で診断不可")
        return lines

    # 1. 生���比較
    c_surv = c["p_survival_avg_s"]
    s_surv = s["p_survival_avg_s"]
    d_surv = d["p_survival_avg_s"]
    r_surv = r["p_survival_avg_s"] if r else 0
    surv_line = f"- 生存: concept={c_surv:.2f}s / slacker={s_surv:.2f}s / dodger={d_surv:.2f}s"
    if r:
        surv_line += f" / remote={r_surv:.2f}s"
    lines.append(surv_line)
    if s_surv > c_surv:
        lines.append(f"  ⚠ **(A)SPACE連打が優位**: slackerがconceptより{s_surv-c_surv:.2f}s長生き")
    if d_surv > c_surv:
        lines.append(f"  ⚠ **(B)磁石軸無視が優位**: dodgerがconceptより{d_surv-c_surv:.2f}s長生き")
    if r and r_surv > c_surv:
        lines.append(f"  ⚠ **(D)遠隔SPACE優位**: remoteがconceptより{r_surv-c_surv:.2f}s長生き。AIの近くにいる理由がない")

    # 2. スコア比較
    score_line = f"- スコア: concept={c['score_avg']:.0f} / slacker={s['score_avg']:.0f} / dodger={d['score_avg']:.0f}"
    if r:
        score_line += f" / remote={r['score_avg']:.0f}"
    lines.append(score_line)
    if r and r["score_avg"] > c["score_avg"]:
        lines.append(f"  ⚠ 遠隔SPACEがスコアでも勝っている")

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

    # 6. 面白さの近似指標
    lines.append(f"\n### 体験品質指標 (experimental)")
    lines.append(f"- ARC (action-reaction coupling): concept={c['arc_avg']:.0%} / slacker={s['arc_avg']:.0%}")
    if c["arc_avg"] < 0.3:
        lines.append(f"  ⚠ conceptのARC {c['arc_avg']:.0%} — SPACEを押しても弾が消えない。「何もできない」感覚の可能性")
    lines.append(f"- Phase variety (per sec): concept={c['phase_variety_avg']:.1f} / slacker={s['phase_variety_avg']:.1f} / dodger={d['phase_variety_avg']:.1f}")
    if c["phase_variety_avg"] < 3:
        lines.append(f"  ⚠ conceptのphase variety低い — 行動が単調な可能性")

    # 総合判定
    concept_wins = (c_surv > s_surv and c_surv > d_surv
                    and c["score_avg"] >= s["score_avg"]
                    and c["score_avg"] >= d["score_avg"]
                    and (not r or (c_surv > r_surv and c["score_avg"] >= r["score_avg"])))
    if concept_wins:
        lines.append("\n✅ **バランス成立**: conceptが生存/スコア共に手抜き勢を上回る")
    else:
        lines.append("\n❌ **バランス不成立**: 手抜きプレイが優位")

    # 体験品質判定
    arc_ok = c["arc_avg"] >= 0.3
    phase_ok = c["phase_variety_avg"] >= 3
    if arc_ok and phase_ok:
        lines.append("✅ **体験品質OK**: SPACEが機能し、行動に多様性がある")
    else:
        issues = []
        if not arc_ok:
            issues.append("ARC低い(SPACEが無意味)")
        if not phase_ok:
            issues.append("phase variety低い(単調)")
        lines.append(f"⚠ **体験品質に懸念**: {', '.join(issues)}")

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
    ap.add_argument("--policies", default="concept,slacker,dodger,remote,camper,oscillator")
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
