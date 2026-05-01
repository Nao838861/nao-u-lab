"""graze_log v02 — headless self-play harness (Ash PR proposal 2026-05-01).

cross_review (game/cross_review/20260428_ash_on_graze_log_v01.md §3) で出した
「graze を取りに行くポリシー vs 取りに行かないポリシー」を seed 横断比較する
ためのハーネス。index.html と同一の mulberry32 で再現性担保。

ポリシー:
  graze_seek : medium 自機狙い弾の near-miss を能動的に取りに行く（コンセプト準拠）
  corner_safe: 画面端で iframe + 距離回避、graze は取らない（コンセプト否定）
  random_walk: ランダム移動（baseline）

設計が成立しているなら graze_seek が score / Lv到達速度 / BOMB回数で優位。
逆に corner_safe が長生き&高スコアなら「graze 軸が報酬になっていない」=設計不良。

Usage:
  python headless.py --runs 10 --seed 42                   # 全ポリシー比較
  python headless.py --runs 10 --policies graze_seek       # 1ポリシー
  python headless.py --replay <path>                       # 人間リプレイ分析（未実装）

Note: index.html の挙動を 100% 移植してはいない（描画/パーティクル/HUD は省略）。
graze 判定 / 被弾 / 撃破 / Lv遷移 / BOMB 発動条件 はゲーム結論に直結するので忠実移植。
"""
import argparse
import json
import math
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

# === 定数 (index.html と同期) ===
W, H, FPS = 420, 620, 60
MAX_FRAMES = 60 * 60  # 60秒上限
RETRY_UNLOCK_FRAMES = 240
G_MAX = 208
G_LV2 = 35
G_LV3 = 99
R_GRAZE = 22
R_HIT = 8
GRAZE_GAUGE = 6
GRAZE_SCORE = 10
KILL_SMALL_GAUGE = 2
KILL_MED_GAUGE = 4


def mulberry32(seed):
    """JS互換 PRNG。index.html の mulberry32 と同一系列を生成。"""
    s = [seed & 0xFFFFFFFF]
    def _rand():
        s[0] = (s[0] + 0x6D2B79F5) & 0xFFFFFFFF
        t = s[0]
        t = (t ^ (t >> 15)) & 0xFFFFFFFF
        t = (t * (s[0] | 1)) & 0xFFFFFFFF
        u = (t ^ (t >> 7)) & 0xFFFFFFFF
        v = (t | 61) & 0xFFFFFFFF
        t2 = (t + ((u * v) & 0xFFFFFFFF)) & 0xFFFFFFFF
        t = (t ^ t2) & 0xFFFFFFFF
        return ((t ^ (t >> 14)) & 0xFFFFFFFF) / 4294967296
    return _rand


def gauge_level(g):
    if g >= G_LV3:
        return 3
    if g >= G_LV2:
        return 2
    return 1


def gauge_ready(g):
    return g >= G_MAX


def shot_count(g):
    return gauge_level(g)


def shot_cooldown_f(g):
    lv = gauge_level(g)
    return 6 if lv == 3 else 7 if lv == 2 else 8


def new_state(seed):
    return {
        "t": 0,
        "alive": True,
        "death_t": -1,
        "player": {"x": W / 2, "y": H - 80, "r": 5, "iframe": 0},
        "bullets": [],
        "ebullets": [],
        "enemies": [],
        "gauge": 0,
        "score": 0,
        "graze_count": 0,
        "bomb_count": 0,
        "kill_count": 0,
        "spawn_t": 0,
        "wave": 0,
        "shot_cooldown": 0,
        "intro_med_pending_frames": 72,  # 1200ms ≒ 72f at 60fps
        "intro_med_spawned": False,
        "rng": mulberry32(seed),
        # メトリクス
        "frames_with_eb": 0,
        "frames_in_graze_dist": 0,  # any eb 内 R_GRAZE+10 の任意フレーム数
        "lv2_reached_t": -1,
        "lv3_reached_t": -1,
        "max_lv": 1,
        "first_graze_t": -1,
    }


def spawn_enemy(state, type_, x, phase=0):
    rng = state["rng"]
    if type_ == "small":
        state["enemies"].append({
            "type": "small", "x": x, "y": -12,
            "vx": 0, "vy": 1.6, "r": 9, "hp": 1, "t": 0,
            "fireT": 9999, "phase": phase,
        })
    else:
        state["enemies"].append({
            "type": "medium", "x": x, "y": -16,
            "vx": 0, "vy": 0.9, "r": 13, "hp": 3, "t": 0,
            "fireT": 60 + int(rng() * 40), "phase": phase,
        })


def spawn_player_bullets(state):
    n = shot_count(state["gauge"])
    px, py = state["player"]["x"], state["player"]["y"] - 8
    if n == 1:
        state["bullets"].append({"x": px, "y": py, "vx": 0, "vy": -9})
    elif n == 2:
        state["bullets"].append({"x": px - 5, "y": py, "vx": 0, "vy": -9})
        state["bullets"].append({"x": px + 5, "y": py, "vx": 0, "vy": -9})
    else:
        state["bullets"].append({"x": px, "y": py, "vx": 0, "vy": -9})
        state["bullets"].append({"x": px - 7, "y": py + 2, "vx": -1.5, "vy": -9})
        state["bullets"].append({"x": px + 7, "y": py + 2, "vx": 1.5, "vy": -9})


def spawn_wave(state):
    state["wave"] += 1
    w = state["wave"]
    rng = state["rng"]
    if w == 1:
        spawn_enemy(state, "small", W * 0.30)
        spawn_enemy(state, "small", W * 0.50)
        spawn_enemy(state, "small", W * 0.70)
        # medium は intro_med_pending_frames 経由で遅延スポーン
        return
    if w == 2:
        spawn_enemy(state, "small", W * 0.2)
        spawn_enemy(state, "small", W * 0.4)
        spawn_enemy(state, "small", W * 0.6)
        spawn_enemy(state, "small", W * 0.8)
        spawn_enemy(state, "medium", W * 0.3)
        spawn_enemy(state, "medium", W * 0.7)
        return
    if w == 3:
        for i in range(6):
            spawn_enemy(state, "small", W * 0.15 + i * W * 0.14)
        spawn_enemy(state, "medium", W * 0.5)
        return
    if w == 4:
        spawn_enemy(state, "medium", W * 0.25)
        spawn_enemy(state, "medium", W * 0.5)
        spawn_enemy(state, "medium", W * 0.75)
        for i in range(4):
            spawn_enemy(state, "small", W * 0.2 + i * W * 0.2)
        return
    pop = 4 + min(w - 4, 6)
    for _ in range(pop):
        if rng() < 0.6:
            spawn_enemy(state, "small", 60 + rng() * (W - 120))
        else:
            spawn_enemy(state, "medium", 60 + rng() * (W - 120))


def on_graze(state, bx, by):
    state["graze_count"] += 1
    state["gauge"] = max(0, min(G_MAX, state["gauge"] + GRAZE_GAUGE))
    state["score"] += GRAZE_SCORE * gauge_level(state["gauge"])
    if state["first_graze_t"] < 0:
        state["first_graze_t"] = state["t"]


def on_hit(state):
    p = state["player"]
    lv = gauge_level(state["gauge"])
    p["iframe"] = 24
    if lv == 3:
        state["gauge"] = G_LV2
    elif lv == 2:
        state["gauge"] = 0
    else:
        state["alive"] = False
        state["death_t"] = state["t"]


def fire_bomb(state):
    if not gauge_ready(state["gauge"]):
        return
    state["bomb_count"] += 1
    for b in state["ebullets"]:
        state["score"] += 20
    state["ebullets"].clear()
    for e in state["enemies"]:
        e["hp"] = max(1, math.ceil(e["hp"] / 2))
    state["gauge"] = G_LV2


def step(state, move_x, move_y, space_pressed):
    """1フレーム進行。move_x/y in {-1, 0, 1}、space_pressed: bool"""
    state["t"] += 1
    rng = state["rng"]

    if not state["alive"]:
        return

    p = state["player"]
    dx, dy = move_x, move_y
    if dx and dy:
        dx *= 0.707
        dy *= 0.707
    p["x"] += dx * 4.2
    p["y"] += dy * 4.2
    p["x"] = max(8, min(W - 8, p["x"]))
    p["y"] = max(20, min(H - 12, p["y"]))
    if p["iframe"] > 0:
        p["iframe"] -= 1

    # auto-shoot
    if state["shot_cooldown"] > 0:
        state["shot_cooldown"] -= 1
    else:
        spawn_player_bullets(state)
        state["shot_cooldown"] = shot_cooldown_f(state["gauge"])

    for b in state["bullets"]:
        b["x"] += b["vx"]
        b["y"] += b["vy"]
    state["bullets"] = [b for b in state["bullets"] if b["y"] > -12 and -12 < b["x"] < W + 12]

    # wave スポーン
    state["spawn_t"] -= 1
    if state["spawn_t"] <= 0 and len(state["enemies"]) < 3:
        spawn_wave(state)
        state["spawn_t"] = 160 - min(state["wave"] * 8, 80)

    # intro medium 遅延スポーン
    if not state["intro_med_spawned"]:
        if state["intro_med_pending_frames"] > 0:
            state["intro_med_pending_frames"] -= 1
        else:
            spawn_enemy(state, "medium", W * 0.5)
            state["intro_med_spawned"] = True

    # 敵更新
    for e in state["enemies"]:
        e["t"] += 1
        if e["type"] == "small":
            e["y"] += e["vy"]
        else:
            e["y"] += e["vy"]
            e["x"] += math.sin(e["t"] * 0.04 + e["phase"]) * 1.4
            e["fireT"] -= 1
            if e["fireT"] <= 0 and 0 < e["y"] < H * 0.55:
                ddx = p["x"] - e["x"]
                ddy = p["y"] - e["y"]
                d = math.hypot(ddx, ddy) or 1
                sp = 2.4
                state["ebullets"].append({
                    "x": e["x"], "y": e["y"],
                    "vx": ddx / d * sp, "vy": ddy / d * sp,
                    "grazed": False,
                })
                e["fireT"] = 70 + int(rng() * 40)

    # 自弾 vs 敵
    for b in state["bullets"]:
        for e in state["enemies"]:
            if e["hp"] <= 0:
                continue
            ddx = b["x"] - e["x"]
            ddy = b["y"] - e["y"]
            if ddx * ddx + ddy * ddy < (e["r"] + 3) ** 2:
                e["hp"] -= 1
                b["y"] = -99
                if e["hp"] <= 0:
                    state["kill_count"] += 1
                    if e["type"] == "small":
                        state["score"] += 10
                        state["gauge"] = max(0, min(G_MAX, state["gauge"] + KILL_SMALL_GAUGE))
                    else:
                        state["score"] += 40
                        state["gauge"] = max(0, min(G_MAX, state["gauge"] + KILL_MED_GAUGE))
                break
    state["bullets"] = [b for b in state["bullets"] if b["y"] > -12]
    state["enemies"] = [e for e in state["enemies"] if e["hp"] > 0 and e["y"] < H + 30]

    # 敵弾 + graze + hit
    for b in state["ebullets"]:
        b["x"] += b["vx"]
        b["y"] += b["vy"]
        ddx = b["x"] - p["x"]
        ddy = b["y"] - p["y"]
        d2 = ddx * ddx + ddy * ddy
        if d2 < R_HIT * R_HIT:
            if p["iframe"] <= 0:
                on_hit(state)
                b["y"] = H + 99
        elif not b["grazed"] and d2 < R_GRAZE * R_GRAZE:
            b["grazed"] = True
            on_graze(state, b["x"], b["y"])
    state["ebullets"] = [b for b in state["ebullets"] if -20 < b["x"] < W + 20 and -20 < b["y"] < H + 20]

    # 自機 vs 敵接触
    if state["alive"] and p["iframe"] <= 0:
        for e in state["enemies"]:
            ddx = p["x"] - e["x"]
            ddy = p["y"] - e["y"]
            if ddx * ddx + ddy * ddy < (e["r"] + p["r"]) ** 2:
                on_hit(state)
                break

    # BOMB
    if space_pressed and gauge_ready(state["gauge"]):
        fire_bomb(state)

    # メトリクス更新
    if state["ebullets"]:
        state["frames_with_eb"] += 1
        any_close = any(
            ((b["x"] - p["x"]) ** 2 + (b["y"] - p["y"]) ** 2) < (R_GRAZE + 10) ** 2
            for b in state["ebullets"]
        )
        if any_close:
            state["frames_in_graze_dist"] += 1
    lv = gauge_level(state["gauge"])
    if lv > state["max_lv"]:
        state["max_lv"] = lv
    if lv >= 2 and state["lv2_reached_t"] < 0:
        state["lv2_reached_t"] = state["t"]
    if lv >= 3 and state["lv3_reached_t"] < 0:
        state["lv3_reached_t"] = state["t"]


# === ポリシー ===

def policy_graze_seek(state):
    """medium 自機狙い弾の near-miss を能動的に取りに行く。
    - graze 圏内に弾があれば、弾の真横（軸ずらし）に位置する
    - 弾なし時は中央やや上で待機
    - 被弾しないよう iframe 中以外は R_HIT 圏は避ける
    - gauge_ready なら BOMB
    """
    p = state["player"]
    space = gauge_ready(state["gauge"])

    if not state["ebullets"]:
        # 中央へ
        tx, ty = W / 2, H * 0.65
    else:
        # 最近接の eb を選び、graze 圏ぎりぎりへ寄る
        target = min(state["ebullets"], key=lambda b: (b["x"] - p["x"]) ** 2 + (b["y"] - p["y"]) ** 2)
        # 弾の真横（軸ずらし）= y 同位、x は弾の x ± R_GRAZE-2
        side = 1 if p["x"] >= target["x"] else -1
        tx = target["x"] + side * (R_GRAZE - 4)
        ty = target["y"] + 2
        # ただし R_HIT 直撃コースなら退避
        if abs(p["x"] - target["x"]) < R_HIT - 1 and abs(p["y"] - target["y"]) < R_HIT - 1:
            tx = target["x"] + side * (R_GRAZE + 4)

    mx = 1 if tx > p["x"] + 3 else (-1 if tx < p["x"] - 3 else 0)
    my = 1 if ty > p["y"] + 3 else (-1 if ty < p["y"] - 3 else 0)
    return mx, my, space


def policy_corner_safe(state):
    """画面下角に張り付き、graze は一切取らない。BOMB も使わない（=コンセプト全否定）"""
    p = state["player"]
    tx, ty = 18, H - 18
    # ただし敵接触は避ける
    for e in state["enemies"]:
        if e["y"] > H * 0.7 and abs(e["x"] - tx) < 30:
            tx = W - 18  # 反対角へ
            break
    mx = 1 if tx > p["x"] + 3 else (-1 if tx < p["x"] - 3 else 0)
    my = 1 if ty > p["y"] + 3 else (-1 if ty < p["y"] - 3 else 0)
    return mx, my, False


def policy_random_walk(state):
    """ランダム方向にふらふら移動。baseline。"""
    rng = state["rng"]
    mx = int(rng() * 3) - 1
    my = int(rng() * 3) - 1
    return mx, my, False


POLICIES = {
    "graze_seek": policy_graze_seek,
    "corner_safe": policy_corner_safe,
    "random_walk": policy_random_walk,
}


def run_one(seed, policy_name):
    state = new_state(seed)
    policy = POLICIES[policy_name]
    while state["t"] < MAX_FRAMES and state["alive"]:
        mx, my, sp = policy(state)
        step(state, mx, my, sp)
    survived = state["t"] if state["alive"] else state["death_t"]
    return {
        "seed": seed,
        "policy": policy_name,
        "frames": state["t"],
        "survival_frames": survived,
        "score": state["score"],
        "graze_count": state["graze_count"],
        "kill_count": state["kill_count"],
        "bomb_count": state["bomb_count"],
        "max_lv": state["max_lv"],
        "lv2_reached_t": state["lv2_reached_t"],
        "lv3_reached_t": state["lv3_reached_t"],
        "first_graze_t": state["first_graze_t"],
        "alive_at_60s": state["alive"],
        "frames_with_eb": state["frames_with_eb"],
        "frames_in_graze_dist": state["frames_in_graze_dist"],
        "engagement_ratio": state["frames_in_graze_dist"] / max(1, state["frames_with_eb"]),
    }


def aggregate(traces):
    n = len(traces)
    if n == 0:
        return {}
    return {
        "policy": traces[0]["policy"],
        "runs": n,
        "survival_avg_s": sum(t["survival_frames"] for t in traces) / n / FPS,
        "score_avg": sum(t["score"] for t in traces) / n,
        "graze_avg": sum(t["graze_count"] for t in traces) / n,
        "kill_avg": sum(t["kill_count"] for t in traces) / n,
        "bomb_avg": sum(t["bomb_count"] for t in traces) / n,
        "max_lv_avg": sum(t["max_lv"] for t in traces) / n,
        "lv2_reach_rate": sum(1 for t in traces if t["lv2_reached_t"] >= 0) / n,
        "lv3_reach_rate": sum(1 for t in traces if t["lv3_reached_t"] >= 0) / n,
        "first_graze_8s_rate": sum(1 for t in traces if 0 <= t["first_graze_t"] <= 8 * FPS) / n,
        "alive_at_60s_rate": sum(1 for t in traces if t["alive_at_60s"]) / n,
        "engagement_avg": sum(t["engagement_ratio"] for t in traces) / n,
    }


def diagnose(aggs):
    lines = []
    g = aggs.get("graze_seek")
    c = aggs.get("corner_safe")
    r = aggs.get("random_walk")
    if not (g and c):
        return ["- ポリシー不足"]
    lines.append(f"- 生存: graze_seek={g['survival_avg_s']:.1f}s / corner_safe={c['survival_avg_s']:.1f}s"
                 + (f" / random_walk={r['survival_avg_s']:.1f}s" if r else ""))
    lines.append(f"- スコア: graze_seek={g['score_avg']:.0f} / corner_safe={c['score_avg']:.0f}"
                 + (f" / random_walk={r['score_avg']:.0f}" if r else ""))
    lines.append(f"- graze数: graze_seek={g['graze_avg']:.1f} / corner_safe={c['graze_avg']:.1f}")
    lines.append(f"- Lv3到達率: graze_seek={g['lv3_reach_rate']:.0%} / corner_safe={c['lv3_reach_rate']:.0%}")
    lines.append(f"- 8秒以内初graze率: graze_seek={g['first_graze_8s_rate']:.0%} (オンボーディング保証)")
    lines.append(f"- 60秒生存率: graze_seek={g['alive_at_60s_rate']:.0%} / corner_safe={c['alive_at_60s_rate']:.0%}")
    if c["score_avg"] > g["score_avg"]:
        lines.append(f"  ⚠ corner_safe がスコアで勝っている — graze 軸の報酬機能不全")
    if c["survival_avg_s"] > g["survival_avg_s"]:
        lines.append(f"  ⚠ corner_safe が長生き — 「graze 取らない」の方が安全")
    if g["first_graze_8s_rate"] < 0.5:
        lines.append(f"  ⚠ 8秒以内 graze 達成率低い — オンボーディング保証(introMed)が機能不十分")
    if g["score_avg"] > c["score_avg"] and g["survival_avg_s"] >= c["survival_avg_s"] * 0.8:
        lines.append("  ✓ graze_seek が score で優位 + 生存も corner_safe の80%以上 → 報酬軸として機能")
    return lines


def render_report(all_traces, aggs, diagnoses, out_path):
    lines = [
        f"# graze_log v02 ヘッドレス評価レポート",
        f"",
        f"- 実行日時: {datetime.now().isoformat(timespec='seconds')}",
        f"- ポリシー: {', '.join(aggs.keys())}",
        f"",
        f"## 集計（ポリシー別 平均）",
        f"",
        f"| policy | 生存s | score | graze | kill | bomb | maxLv | Lv3% | 8s graze% | 60s alive% |",
        f"|---|---|---|---|---|---|---|---|---|---|",
    ]
    for name, a in aggs.items():
        lines.append(
            f"| {name} | {a['survival_avg_s']:.1f} | {a['score_avg']:.0f} | "
            f"{a['graze_avg']:.1f} | {a['kill_avg']:.1f} | {a['bomb_avg']:.1f} | "
            f"{a['max_lv_avg']:.1f} | {a['lv3_reach_rate']:.0%} | "
            f"{a['first_graze_8s_rate']:.0%} | {a['alive_at_60s_rate']:.0%} |"
        )
    lines.extend(["", "## 診断", ""])
    lines.extend(diagnoses)
    lines.extend(["", "## サンプルトレース (各ポリシー先頭3件)", ""])
    for name, traces in all_traces.items():
        lines.append(f"### {name}")
        for t in traces[:3]:
            lines.append(
                f"- seed={t['seed']} surv={t['survival_frames']/FPS:.1f}s "
                f"score={t['score']} graze={t['graze_count']} "
                f"kill={t['kill_count']} maxLv={t['max_lv']} "
                f"firstGraze={t['first_graze_t']/FPS:.1f}s" if t['first_graze_t'] >= 0 else
                f"- seed={t['seed']} surv={t['survival_frames']/FPS:.1f}s "
                f"score={t['score']} graze={t['graze_count']} "
                f"kill={t['kill_count']} maxLv={t['max_lv']} firstGraze=N/A"
            )
        lines.append("")
    out_path.write_text("\n".join(lines), encoding="utf-8")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--runs", type=int, default=8)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--policies", default="graze_seek,corner_safe,random_walk")
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

    metrics_path = base / f"metrics_{stamp}.json"
    metrics_path.write_text(json.dumps(aggs, ensure_ascii=False, indent=2), encoding="utf-8")
    report_path = base / f"report_{stamp}.md"
    render_report(all_traces, aggs, diagnoses, report_path)

    print(f"runs per policy: {args.runs}, seed base: {args.seed}")
    print(f"metrics: {metrics_path}")
    print(f"report : {report_path}")
    print()
    for line in diagnoses:
        print(line)


if __name__ == "__main__":
    main()
