"""ash_onebutton v02 (reverse + close-call可視化) ヘッドレス自己試遊+評価。

L-03違反（ヘッドレス未実装）の解消と、v02 devlog の自己問い
「v02 は v01 を増幅したか可視化しただけか」のうち定量側に答える。

v02 の close-call 検出ロジックは観測のみで物理に影響しない（紙一重ゾーンに
入った状態で反転すると CLOSE が加算されるだけ）。よって同じ seed/同じポリシーを
走らせれば v01 と v02 は物理的に等価。違うのは「プレイヤーが close-call を
見て行動を変えるか」だけ。それは Nao_u の体験でしか測れない。

ヘッドレスで測れるのは:
  1. 各ポリシーで close-call 値が**自然に**どれだけ出るか（バックグラウンド分布）
  2. close-call を**意図的に追う**戦略（close_call_seeker）が生存と引き換えに高 CLOSE を出すか
  3. 反転連打や反転ゼロが close-call と生存にどう寄与するか

ポリシー4種:
  intended_dodger : 落下物が頭上に来そうな時だけ反転。本来の意図プレイ。
  random_mash     : 一定確率で反転連打。判断ゼロの上限。
  never_press     : 一度も反転しない（壁反射のみ）。意図放棄の下限。
  close_call_seeker : 落下物が紙一重ゾーンに入った瞬間に反転（CLOSE 最大化）。
                     CLOSE 値を稼ぐと生存が縮むかを検証。
"""
import argparse
import json
import math
import random
from datetime import datetime
from pathlib import Path

W, H, FPS = 240, 320, 60
NEAR_DX, NEAR_DY_FRONT, NEAR_DY_BACK = 22, 70, 8
MAX_FRAMES = 60 * 90  # 90秒上限


def mulberry32(seed):
    """JS互換の seeded PRNG。将来 index.html を seeded 化した時に同一乱数列で揃えられる。"""
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


def new_state(seed):
    rng = mulberry32(seed)
    return {
        "p": {"x": W / 2, "y": H - 28, "r": 5, "v": 1.4},
        "drops": [],
        "t": 0,
        "over": False,
        "close": 0,
        "press_count": 0,
        "close_press_count": 0,  # close-call が成立した反転回数
        "rng": rng,
    }


def step_physics(state):
    """1フレーム進行（入力前段）: drops 落下と新スポーン、衝突判定、壁反射。"""
    if state["over"]:
        return
    state["t"] += 1
    p = state["p"]
    p["x"] += p["v"]
    if p["x"] < p["r"]:
        p["x"] = p["r"]
        p["v"] = -p["v"]
    if p["x"] > W - p["r"]:
        p["x"] = W - p["r"]
        p["v"] = -p["v"]

    rate = 0.02 + min(0.06, state["t"] / FPS * 0.0015)
    rng = state["rng"]
    if rng.random() < rate:
        state["drops"].append({
            "x": rng.random() * (W - 12) + 6,
            "y": -10,
            "vy": 1.6 + rng.random() * 1.4 + state["t"] / FPS * 0.03,
            "r": 4 + rng.random() * 3,
        })

    # 落下と当たり判定
    for d in state["drops"]:
        d["y"] += d["vy"]
        dx = d["x"] - p["x"]
        dy = d["y"] - p["y"]
        if dx * dx + dy * dy < (d["r"] + p["r"]) ** 2:
            state["over"] = True
            return
    state["drops"] = [d for d in state["drops"] if d["y"] < H + 20]


def detect_close(state):
    """現在の物理状態で『反転すれば close-call が発生する drop 数』を返す。
    index.html L26-37 と同等のロジック。観測のみ。"""
    p = state["p"]
    near = 0
    for d in state["drops"]:
        dx = d["x"] - p["x"]
        dy = d["y"] - p["y"]
        if abs(dx) < NEAR_DX and dy > -NEAR_DY_FRONT and dy < NEAR_DY_BACK:
            move_away = (p["v"] > 0 and dx < 0) or (p["v"] < 0 and dx > 0)
            if move_away:
                near += 1
    return near


def apply_press(state):
    """反転入力。close-call 検出 → 反転 → 統計更新。"""
    if state["over"]:
        return
    near = detect_close(state)
    state["p"]["v"] = -state["p"]["v"]
    state["press_count"] += 1
    if near > 0:
        state["close"] += near
        state["close_press_count"] += 1


# ---- プレイヤーポリシー ----

def policy_intended_dodger(state):
    """落下物が頭上に来そうで、自分の進行方向側にいる時だけ反転。
    本来の意図プレイ: 当たりそうな時に避ける。
    """
    p = state["p"]
    for d in state["drops"]:
        dy = p["y"] - d["y"]
        if 0 < dy < 50 and abs(d["x"] - p["x"]) < 18:
            # 自分の進行方向側に drop があるなら反転で避ける
            if (p["v"] > 0 and d["x"] > p["x"]) or (p["v"] < 0 and d["x"] < p["x"]):
                return True
    return False


def policy_random_mash(state, prob=0.04):
    """一定確率で反転連打。判断ゼロの上限。"""
    return state["rng"].random() < prob


def policy_never_press(state):
    """一度も反転しない。壁反射のみで生存できるか。"""
    return False


def policy_close_call_seeker(state):
    """紙一重ゾーンに drop が入った瞬間に反転。CLOSE 最大化。
    生存を犠牲にして高 CLOSE を出すかの検証。
    """
    near = detect_close(state)
    return near > 0


POLICIES = {
    "intended_dodger": policy_intended_dodger,
    "random_mash": policy_random_mash,
    "never_press": policy_never_press,
    "close_call_seeker": policy_close_call_seeker,
}


def run_one(seed, policy_name):
    state = new_state(seed)
    policy = POLICIES[policy_name]
    while state["t"] < MAX_FRAMES and not state["over"]:
        step_physics(state)
        if state["over"]:
            break
        if policy(state):
            apply_press(state)
    return {
        "seed": seed,
        "policy": policy_name,
        "frames": state["t"],
        "survival_s": state["t"] / FPS,
        "close": state["close"],
        "press_count": state["press_count"],
        "close_press_count": state["close_press_count"],
        "close_per_press": state["close"] / max(1, state["press_count"]),
    }


def aggregate(traces):
    if not traces:
        return {}
    n = len(traces)
    return {
        "policy": traces[0]["policy"],
        "runs": n,
        "survival_avg_s": sum(t["survival_s"] for t in traces) / n,
        "survival_max_s": max(t["survival_s"] for t in traces),
        "close_avg": sum(t["close"] for t in traces) / n,
        "close_max": max(t["close"] for t in traces),
        "press_avg": sum(t["press_count"] for t in traces) / n,
        "close_press_ratio": sum(t["close_press_count"] for t in traces) / max(1, sum(t["press_count"] for t in traces)),
        "close_per_sec": sum(t["close"] for t in traces) / max(1, sum(t["survival_s"] for t in traces)),
    }


def diagnose(aggs):
    lines = []
    d = aggs.get("intended_dodger")
    m = aggs.get("random_mash")
    n = aggs.get("never_press")
    s = aggs.get("close_call_seeker")
    if not (d and m and n and s):
        lines.append("- ポリシー不足で診断不可")
        return lines

    lines.append(f"- 生存(平均): dodger={d['survival_avg_s']:.2f}s / mash={m['survival_avg_s']:.2f}s / never={n['survival_avg_s']:.2f}s / seeker={s['survival_avg_s']:.2f}s")
    lines.append(f"- CLOSE累計(平均): dodger={d['close_avg']:.1f} / mash={m['close_avg']:.1f} / never={n['close_avg']:.1f} / seeker={s['close_avg']:.1f}")
    lines.append(f"- CLOSE/秒(密度): dodger={d['close_per_sec']:.2f} / mash={m['close_per_sec']:.2f} / never={n['close_per_sec']:.2f} / seeker={s['close_per_sec']:.2f}")
    lines.append(f"- 反転回数(平均): dodger={d['press_avg']:.1f} / mash={m['press_avg']:.1f} / never={n['press_avg']:.1f} / seeker={s['press_avg']:.1f}")
    lines.append(f"- 反転中CLOSE成立率: dodger={d['close_press_ratio']:.0%} / mash={m['close_press_ratio']:.0%} / seeker={s['close_press_ratio']:.0%}")

    issues = []

    # 1. 意図プレイの優位性
    if d["survival_avg_s"] <= n["survival_avg_s"]:
        issues.append(f"⚠ **(A) 反転の意義不足**: never_press({n['survival_avg_s']:.2f}s) >= intended_dodger({d['survival_avg_s']:.2f}s)。反転が生存に寄与していない")
    if m["survival_avg_s"] > d["survival_avg_s"]:
        issues.append(f"⚠ **(B) 連打優位**: random_mash({m['survival_avg_s']:.2f}s) > intended_dodger({d['survival_avg_s']:.2f}s)。判断不要が最適化")

    # 2. close-call の希少性 vs 達成しやすさ
    if d["close_avg"] < 1.0:
        issues.append(f"⚠ **(C) CLOSEが出ない**: intended_dodgerの平均CLOSE {d['close_avg']:.1f} < 1.0。意図プレイで紙一重がほぼ発生しない=可視化価値が薄い")
    if s["close_avg"] < d["close_avg"] * 1.5:
        issues.append(f"⚠ **(D) seeker優位性が薄い**: close_call_seekerのCLOSEが意図プレイの1.5倍未満。CLOSE狙い行動の差別化が弱い")
    if s["survival_avg_s"] >= d["survival_avg_s"]:
        issues.append(f"⚠ **(E) リスクなしseeker**: close_call_seeker({s['survival_avg_s']:.2f}s) >= intended_dodger({d['survival_avg_s']:.2f}s)。CLOSE狙いに生存リスクがない=トレードオフ不在")

    # 3. ポジティブ判定
    seeker_premium = s["close_avg"] - d["close_avg"]
    survival_cost = d["survival_avg_s"] - s["survival_avg_s"]

    lines.append("")
    lines.append("### 構造判定")
    if not issues:
        lines.append("✅ **設計成立**: 意図プレイが連打/放棄より長生き、CLOSE狙いは生存リスクとトレードオフ")
    else:
        for issue in issues:
            lines.append(issue)

    lines.append("")
    lines.append(f"### v01→v02 の意義")
    lines.append(f"- intended_dodger の自然なCLOSE発生数: 平均 {d['close_avg']:.1f} / 最大 {d['close_max']}")
    if d["close_avg"] >= 2:
        lines.append(f"- → 意図プレイで{d['close_avg']:.1f}回 close-call が**潜在的に**発生していた。v01ではこれが見えていなかった")
        lines.append(f"- 可視化（v02のリング+CLOSEスコア）には観察対象が存在する。表示は『無いものを生み出す』ではなく『あるものを見せる』")
    else:
        lines.append(f"- → 意図プレイでのCLOSE発生が稀（{d['close_avg']:.1f}回）。可視化の意味が薄い可能性")

    if seeker_premium > 0 and survival_cost > 0:
        lines.append(f"- close_call_seeker は dodger より CLOSE +{seeker_premium:.1f} だが生存 -{survival_cost:.2f}s。**増幅とトレードオフが両立**")
    elif seeker_premium > 0 and survival_cost <= 0:
        lines.append(f"- close_call_seeker が dodger を生存でも上回る。CLOSE 狙いに罰がない設計問題")

    return lines


def render_report(all_traces, aggs, diagnoses, out_path):
    lines = []
    lines.append("# ash_onebutton v02 ヘッドレス評価レポート (reverse + close-call)")
    lines.append("")
    lines.append(f"- 実行日時: {datetime.now().isoformat(timespec='seconds')}")
    lines.append(f"- ポリシー: {', '.join(aggs.keys())}")
    lines.append("")
    lines.append("## 集計（ポリシー別）")
    lines.append("")
    lines.append("| policy | 生存s(平均) | 生存s(最大) | CLOSE平均 | CLOSE最大 | 反転回数 | CLOSE/秒 |")
    lines.append("|---|---|---|---|---|---|---|")
    for name, a in aggs.items():
        lines.append(
            f"| {name} | {a['survival_avg_s']:.2f} | {a['survival_max_s']:.2f} | "
            f"{a['close_avg']:.1f} | {a['close_max']} | {a['press_avg']:.1f} | "
            f"{a['close_per_sec']:.2f} |"
        )
    lines.append("")
    lines.append("## 構造診断")
    lines.append("")
    lines.extend(diagnoses)
    lines.append("")
    lines.append("## サンプルトレース（先頭3件/ポリシー）")
    for name, traces in all_traces.items():
        lines.append(f"### {name}")
        for t in traces[:3]:
            lines.append(
                f"- seed={t['seed']} 生存={t['survival_s']:.1f}s "
                f"CLOSE={t['close']} 反転={t['press_count']}"
            )
    out_path.write_text("\n".join(lines), encoding="utf-8")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--runs", type=int, default=8)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--policies", default="intended_dodger,random_mash,never_press,close_call_seeker")
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

    print(f"runs per policy: {args.runs}")
    print(f"metrics : {metrics_path}")
    print(f"report  : {report_path}")
    print()
    for line in diagnoses:
        print(line)


if __name__ == "__main__":
    main()
