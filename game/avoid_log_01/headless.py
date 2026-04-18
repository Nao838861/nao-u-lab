"""avoid_log_01 ヘッドレス自己試遊+評価。
- pygame非依存。avoid.pyのゲームロジックを抽出。
- プレイヤー側もAI制御で自動プレイ（自立化検証サイクルv1の(3)(4)）。
- N回実行→リプレイログJSON保存→メトリクスを計算しレポート出力。
"""
import argparse
import json
import math
import random
from collections import Counter
from dataclasses import dataclass, field, asdict
from datetime import datetime
from pathlib import Path

WIDTH, HEIGHT = 400, 600
PLAYER_SPEED = 5
OBSTACLE_SPEED = 4
SPAWN_INTERVAL = 28
MAX_FRAMES = 60 * 60  # 60秒 = 3600フレーム上限。ヘッドレス暴走防止


@dataclass
class Rect:
    x: float
    y: float
    w: float
    h: float

    @property
    def centerx(self):
        return self.x + self.w / 2

    @property
    def centery(self):
        return self.y + self.h / 2

    def colliderect(self, other):
        return (self.x < other.x + other.w and self.x + self.w > other.x
                and self.y < other.y + other.h and self.y + self.h > other.y)


def new_state(seed):
    rng = random.Random(seed)
    return {
        "player": Rect(WIDTH // 3, HEIGHT - 70, 18, 28),
        "ai": Rect(WIDTH * 2 // 3, HEIGHT - 70, 18, 28),
        "obstacles": [],
        "spawn_timer": 0,
        "score": 0,
        "ai_hits": 0,
        "ai_dead": False,
        "player_dead": False,
        "frame": 0,
        "rng": rng,
    }


def player_ai_decide(state):
    """プレイヤー側AI：avoid.pyの『AI』とは別系の判定で独立性を持たせる。
    最近接脅威を斜め下方コーン（dy<260, |dx|<55）で見て、反対側へ動く。
    脅威なしなら中央寄せ。"""
    p = state["player"]
    threat = None
    best_dy = 10**9
    for ob in state["obstacles"]:
        dy = p.y - ob.y
        if 0 < dy < 260 and abs(p.centerx - ob.centerx) < 55:
            if dy < best_dy:
                threat = ob
                best_dy = dy
    if threat:
        return -1 if p.centerx > threat.centerx else 1
    # 脅威なし: 中央へ緩やかに戻る
    if p.centerx < WIDTH / 2 - 4:
        return 1
    if p.centerx > WIDTH / 2 + 4:
        return -1
    return 0


def step(state, player_input):
    """1フレーム進行。player_input: -1 left, 0 none, 1 right"""
    state["frame"] += 1
    p = state["player"]
    a = state["ai"]

    if not state["player_dead"]:
        p.x += PLAYER_SPEED * player_input
        p.x = max(0, min(WIDTH - p.w, p.x))

    # AI挙動（avoid.pyと同一ロジック）
    if not state["ai_dead"]:
        target_x = p.centerx + 60
        threat = None
        best_dy = 10**9
        for ob in state["obstacles"]:
            dy = a.y - ob.y
            if 0 < dy < 220 and abs(a.centerx - ob.centerx) < 70:
                if dy < best_dy:
                    threat = ob
                    best_dy = dy
        if threat:
            target_x = a.centerx + (40 if a.centerx > threat.centerx else -40)
        target_x = max(a.w / 2, min(WIDTH - a.w / 2, target_x))
        if a.centerx < target_x - 2:
            a.x += PLAYER_SPEED - 1
        elif a.centerx > target_x + 2:
            a.x -= PLAYER_SPEED - 1

    # spawn
    state["spawn_timer"] += 1
    if state["spawn_timer"] >= SPAWN_INTERVAL:
        state["spawn_timer"] = 0
        w = state["rng"].randint(14, 28)
        state["obstacles"].append(Rect(state["rng"].randint(0, WIDTH - w), -30, w, w))

    # 障害物移動 + 衝突
    death_event = None
    for ob in state["obstacles"][:]:
        ob.y += OBSTACLE_SPEED + state["score"] // 30
        if ob.y > HEIGHT:
            state["obstacles"].remove(ob)
            state["score"] += 1
            continue
        if not state["player_dead"] and ob.colliderect(p):
            state["player_dead"] = True
            death_event = {"who": "player", "frame": state["frame"],
                           "ob_x": ob.x, "ob_y": ob.y,
                           "p_x": p.x, "p_y": p.y,
                           "n_obstacles": len(state["obstacles"]) }
        if not state["ai_dead"] and ob.colliderect(a):
            state["obstacles"].remove(ob)
            state["ai_hits"] += 1
            # avoid.pyではAIは無敵。ここではAIの被弾上限を導入し、3hitで死亡と扱う
            if state["ai_hits"] >= 3:
                state["ai_dead"] = True
    return death_event


def run_one(seed):
    state = new_state(seed)
    inputs_alive = []  # プレイヤー生存中のみ記録（死後の0連打を混ぜない）
    death_events = []
    player_death_frame = None
    ai_death_frame = None
    while state["frame"] < MAX_FRAMES:
        if state["player_dead"] and state["ai_dead"]:
            break
        if not state["player_dead"]:
            inp = player_ai_decide(state)
            inputs_alive.append(inp)
        else:
            inp = 0
        ev = step(state, inp)
        if ev:
            death_events.append(ev)
            if ev["who"] == "player" and player_death_frame is None:
                player_death_frame = state["frame"]
        if state["ai_dead"] and ai_death_frame is None:
            ai_death_frame = state["frame"]
    p = state["player"]
    a = state["ai"]
    return {
        "seed": seed,
        "frames": state["frame"],
        "player_survival_frames": player_death_frame if player_death_frame else state["frame"],
        "ai_survival_frames": ai_death_frame if ai_death_frame else state["frame"],
        "score": state["score"],
        "ai_hits": state["ai_hits"],
        "player_dead": state["player_dead"],
        "ai_dead": state["ai_dead"],
        "inputs": inputs_alive,
        "death_events": death_events,
        "final": {"player_x": p.x, "ai_x": a.x},
    }


def compute_metrics(traces):
    n = len(traces)
    survivals = [t["player_survival_frames"] for t in traces]
    ai_survivals = [t["ai_survival_frames"] for t in traces]
    scores = [t["score"] for t in traces]

    # 連打率: 入力が変わった回数 / 入力長 (per frame). 高い=連打
    switch_rates = []
    # 入力単調度: -1/0/+1の頻度から最大頻度比 (0..1, 1=完全単調)
    monotony_scores = []
    # 入力エントロピー
    entropies = []
    for t in traces:
        inp = t["inputs"]
        if len(inp) < 2:
            switch_rates.append(0.0)
            monotony_scores.append(1.0)
            entropies.append(0.0)
            continue
        switches = sum(1 for i in range(1, len(inp)) if inp[i] != inp[i-1])
        switch_rates.append(switches / len(inp))
        c = Counter(inp)
        most = max(c.values())
        monotony_scores.append(most / len(inp))
        h = 0.0
        for v in c.values():
            p = v / len(inp)
            h -= p * math.log2(p) if p > 0 else 0
        entropies.append(h)

    death_causes = Counter()
    for t in traces:
        for ev in t["death_events"]:
            if ev["who"] == "player":
                # 死亡時の障害物数と画面位置でざっくり分類
                bucket_x = "left" if ev["p_x"] < WIDTH / 3 else ("right" if ev["p_x"] > WIDTH * 2/3 else "center")
                bucket_n = "sparse" if ev["n_obstacles"] < 4 else ("crowded" if ev["n_obstacles"] >= 7 else "medium")
                death_causes[f"{bucket_x}/{bucket_n}"] += 1

    p_dead = sum(1 for t in traces if t["player_dead"])
    a_dead = sum(1 for t in traces if t["ai_dead"])
    longer_player = sum(1 for t in traces if t["player_survival_frames"] > t["ai_survival_frames"])

    return {
        "n_runs": n,
        "survival_frames_avg": sum(survivals) / n,
        "survival_frames_min": min(survivals),
        "survival_frames_max": max(survivals),
        "ai_survival_frames_avg": sum(ai_survivals) / n,
        "score_avg": sum(scores) / n,
        "switch_rate_avg": sum(switch_rates) / n,
        "switch_rate_max": max(switch_rates),
        "input_monotony_avg": sum(monotony_scores) / n,
        "input_entropy_avg": sum(entropies) / n,
        "player_death_rate": p_dead / n,
        "ai_death_rate": a_dead / n,
        "player_outlived_ai_count": longer_player,
        "death_cause_distribution": dict(death_causes),
    }


def render_report(metrics, traces, out_md):
    fps = 60
    lines = []
    lines.append(f"# avoid_log_01 ヘッドレス評価レポート")
    lines.append(f"")
    lines.append(f"- 実行日時: {datetime.now().isoformat(timespec='seconds')}")
    lines.append(f"- ラン数: {metrics['n_runs']}")
    lines.append(f"")
    lines.append(f"## 数値メトリクス")
    lines.append(f"")
    lines.append(f"| 指標 | 値 | 解釈 |")
    lines.append(f"|---|---|---|")
    lines.append(f"| プレイヤー平均生存秒 | {metrics['survival_frames_avg']/fps:.2f}s | 死ぬまでの時間 |")
    lines.append(f"| 最短/最長 | {metrics['survival_frames_min']/fps:.2f} / {metrics['survival_frames_max']/fps:.2f}s | 分散の幅 |")
    lines.append(f"| AI平均生存秒 | {metrics['ai_survival_frames_avg']/fps:.2f}s | AIが落ちるまでの時間 |")
    lines.append(f"| 平均スコア | {metrics['score_avg']:.1f} | やり過ごせた弾数 |")
    lines.append(f"| 入力切替率/フレーム | {metrics['switch_rate_avg']:.3f} | 0.05超=連打傾向、0.15超=反射タスク化 |")
    lines.append(f"| 入力単調度 | {metrics['input_monotony_avg']:.2f} | 1.0=完全単調、0.4以下=多様 |")
    lines.append(f"| 入力エントロピー | {metrics['input_entropy_avg']:.2f} bit | 1.5+=多様、0.7-=偏り |")
    lines.append(f"| プレイヤー死亡率 | {metrics['player_death_rate']:.0%} | 100%なら難度過多 |")
    lines.append(f"| AI死亡率 | {metrics['ai_death_rate']:.0%} | AIが先に落ちる頻度 |")
    lines.append(f"")
    lines.append(f"## 死因分布（プレイヤー）")
    if metrics["death_cause_distribution"]:
        for k, v in sorted(metrics["death_cause_distribution"].items(), key=lambda x: -x[1]):
            lines.append(f"- {k}: {v}回")
    else:
        lines.append(f"- 死亡なし")
    lines.append(f"")
    lines.append(f"## 構造批評（評価器ヒューリスティック）")
    lines.append(f"")
    sw = metrics["switch_rate_avg"]
    mono = metrics["input_monotony_avg"]
    if sw > 0.15:
        lines.append(f"- ⚠ **連打化**: 入力切替率 {sw:.3f} は反射タスク域。意思決定ではなく当て勘になっている疑い。")
    elif sw > 0.05:
        lines.append(f"- 注: 入力切替率 {sw:.3f} は連打寄り。回避操作が小刻みすぎないか確認。")
    if mono > 0.7:
        lines.append(f"- ⚠ **入力単調**: 単一方向に偏り {mono:.2f}。プレイヤーAIが盤面の片側に張り付いている可能性。")
    if metrics["player_death_rate"] >= 0.9:
        lines.append(f"- ⚠ 全滅率高: プレイヤーが避けきれない難度。回避戦略の余地不足か障害物速度過多。")
    if metrics["ai_death_rate"] < 0.2 and metrics["player_death_rate"] > 0.8:
        lines.append(f"- ⚠ **非対称**: AIはほぼ生き残るがプレイヤーは死ぬ。AIが『相棒』ではなく『模範解答』化している。")
    if not any(line.startswith("- ⚠") for line in lines):
        lines.append(f"- 顕著な構造不良は検出されず。Nao_u感想と突き合わせて見落としを確認のこと。")
    lines.append(f"")
    lines.append(f"## サンプルトレース（先頭3ラン）")
    for t in traces[:3]:
        lines.append(f"- seed={t['seed']} frames={t['frames']} score={t['score']} "
                     f"player_dead={t['player_dead']} ai_dead={t['ai_dead']} ai_hits={t['ai_hits']}")
    out_md.write_text("\n".join(lines), encoding="utf-8")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--runs", type=int, default=5)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--out", default="replays")
    args = ap.parse_args()

    base = Path(__file__).parent / args.out
    base.mkdir(exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    traces = []
    for i in range(args.runs):
        t = run_one(args.seed + i)
        traces.append(t)

    # rectをdictへ変換不要（既にfinal/death_eventsで数値化済）
    replay_path = base / f"replay_{stamp}.json"
    serializable = []
    for t in traces:
        s = {k: v for k, v in t.items() if k != "rng"}
        serializable.append(s)
    replay_path.write_text(json.dumps(serializable, ensure_ascii=False), encoding="utf-8")

    metrics = compute_metrics(traces)
    metrics_path = base / f"metrics_{stamp}.json"
    metrics_path.write_text(json.dumps(metrics, ensure_ascii=False, indent=2), encoding="utf-8")

    report_path = base / f"report_{stamp}.md"
    render_report(metrics, traces, report_path)

    print(f"runs={args.runs}")
    print(f"replay  : {replay_path}")
    print(f"metrics : {metrics_path}")
    print(f"report  : {report_path}")


if __name__ == "__main__":
    main()
