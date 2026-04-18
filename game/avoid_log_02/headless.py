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


def new_state(seed):
    rng = random.Random(seed)
    return {
        "player": {"x": W * 0.35, "y": H - 70, "r": 9, "alive": True,
                   "deathBy": None, "burstCd": 0},
        "ai": {"x": W * 0.65, "y": H - 70, "r": 10, "alive": True,
               "deathBy": None, "absorbed": 0, "absorbMax": 6,
               "fullFrames": 0},
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
    state["bullets"].append({
        "x": rng.random() * (W - 30) + 15, "y": -20,
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
        if a["absorbed"] < a["absorbMax"]:
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
    n = a["absorbed"]
    rng = state["rng"]
    for i in range(n):
        ang = -math.pi / 2 + (i - (n - 1) / 2) * 0.22 + (rng.random() - 0.5) * 0.08
        speed = 5 + rng.random() * 1.2
        state["bullets"].append({
            "x": a["x"], "y": a["y"] - 2,
            "vx": math.cos(ang) * speed, "vy": math.sin(ang) * speed,
            "r": 5, "mode": "returned", "life": 0, "_consumed": False,
        })
    a["absorbed"] = 0
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
            "mode": "returned", "life": 0, "_consumed": False,
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
        if a["absorbed"] >= a["absorbMax"]:
            a["fullFrames"] += 1
            if a["fullFrames"] > 90:
                a["alive"] = False
                state["aEndT"] = state["t"]
                a["deathBy"] = "overload"
        else:
            a["fullFrames"] = 0
    elif not state["aiDeathBurstFired"]:
        state["aiDeathBurstFired"] = True
        _fire_ai_death_burst(state)

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
                r["_consumed"] = True
                state["chain"] += 1
                state["chainDecay"] = 90
                state["chainPeak"] = max(state["chainPeak"], state["chain"])
                state["score"] += 10 * state["chain"]
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

    if not p["alive"] and not a["alive"] and not state["over"]:
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
    # 満タン手前でSPACE（overload回避+武器化）
    if a["absorbed"] >= a["absorbMax"] - 1 and p["burstCd"] <= 0:
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
    ゲームデザインの核(磁石軸)を全く使わない。
    """
    p = state["player"]
    # 端に寄せる（磁力場=AI中央付近から離れる）
    target_x = 20 if p["x"] < W / 2 else W - 20

    # 近距離iron弾を回避
    threat = None
    best_dy = 9e9
    for b in state["bullets"]:
        if b["mode"] != "iron":
            continue
        dy = p["y"] - b["y"]
        if 0 < dy < 120 and abs(p["x"] - b["x"]) < 25:
            if dy < best_dy:
                threat = b
                best_dy = dy
    if threat:
        # 脅威の逆側へ
        move = -1 if threat["x"] > p["x"] else 1
        if p["x"] <= p["r"] + 2:
            move = 1
        elif p["x"] >= W - p["r"] - 2:
            move = -1
        return move, 0

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


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--runs", type=int, default=5)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--policies", default="concept,slacker,dodger")
    ap.add_argument("--out", default="replays")
    args = ap.parse_args()

    base = Path(__file__).parent / args.out
    base.mkdir(exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")

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
