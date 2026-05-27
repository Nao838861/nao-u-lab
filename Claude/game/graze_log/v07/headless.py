#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
graze_log v07 headless — 観点 8 (bad policy headless: route/camper/panic/novice 4 方針 物理化)

判定方針 (R-I 死守):
  本ファイルの数値出力 (生存秒 / score / kill / graze 平均) を Nao_u プレイ評価 / cross_review /
  Slack / merge 要請の根拠として使用してはならない。
  使用は self_judgment.md 内の **構造判定 (relative order の signal 読み)** のみに限定する。
  詳細: memory/feedback_headless_unfit_for_unfinished_eval.md t:5

参照:
  - game/graze_log/v07/README.md §観点8
  - game/graze_log/v07/predicted_play.md 観点8 Stage 3 予測
  - game/graze_log/v07/index.html (本ファイルの移植元、JavaScript)

中核ロジック移植粒度:
  完全移植 = player 移動 / 自機弾 / 敵移動 / 敵弾発射 (aimed/fan3) / hit/graze 判定 /
              gauge / Lv up / invincibleT (60F/cap 180F) / Hyper / phase 1-7 / spawnInterval
  省略     = anticipation 30F 遅延 / windup 10F (描画のみ) / wobble (描画のみ) /
              particle / ring / popup / 観点3 マーカー描画 / 観点7 flash 描画 /
              grazeStreak / activeDef / playerLv shotCount n>=4 の追加弾 (relative order 不変)

Usage:
  python headless.py                          # 4 方針 × 100 試行 デフォルト実行
  python headless.py --trials 30              # 30 試行
  python headless.py --policy route --trials 5 --verbose  # route 5 試行、詳細出力
  python headless.py --json                   # JSON 出力
"""

import math
import random
import json
import argparse
import sys
from collections import defaultdict

# === Constants (index.html 由来、全て同値) ===
W, H = 420, 620
G_MAX, G_LV2, G_LV3 = 208, 35, 99
R_GRAZE, R_HIT = 22, 8
GRAZE_GAUGE, GRAZE_SCORE = 6, 10
KILL_SMALL_GAUGE, KILL_MED_GAUGE = 2, 4
LV_GRAZE_TH, PLAYER_LV_MAX = 30, 4
BUZZ_INVINCIBLE_FRAMES, BUZZ_INVINCIBLE_CAP = 60, 180
HYPER_FLASH_FRAMES = 30
PHASE_BOUNDARIES = [780, 1560, 2340, 3120, 3900, 4680, 5400]  # 13/26/39/52/65/78/90 sec @ 60fps
ANTICIPATION_FRAMES_SIMULATE = 0  # 30F 遅延を 0 に置換 (relative order 不変、簡略化)
PHASE1_MED_DELAY_F = 72  # index.html の setTimeout(1200ms) を 72F = 1.2s 相当で simulate


def gauge_level(g):
    if g >= G_LV3:
        return 3
    if g >= G_LV2:
        return 2
    return 1


def shot_count(state):
    # gauge level + player_lv (A-3) — n>=4 の追加弾は省略 (relative order 不変)
    return gauge_level(state.gauge) + state.player_lv


def shot_cooldown_f(state):
    lv = gauge_level(state.gauge)
    return 6 if lv == 3 else 7 if lv == 2 else 8


def current_phase(state):
    for i, b in enumerate(PHASE_BOUNDARIES):
        if state.t < b:
            return i + 1
    return 7  # 90秒以降は phase 7 維持 (無限 final)


def spawn_interval(state):
    p = current_phase(state)
    if p in (1, 3, 6):
        return 140  # 学習 / 休符
    if p in (5, 7):
        return 80   # 山 (圧力ピーク)
    return 110      # 圧力 (phase 2/4)


# === State ===
class GameState:
    __slots__ = (
        't', 'mode', 'rng',
        'player_x', 'player_y', 'player_iframe',
        'bullets', 'ebullets', 'enemies',
        'gauge', 'score',
        'graze_count', 'bomb_count', 'kill_count',
        'spawn_t', 'wave',
        'shot_cooldown',
        'intro_med_pending_t', 'intro_med_x',
        'player_lv',
        'invincible_t',
        'hyper_flash_t',
    )

    def __init__(self, seed):
        self.t = 0
        self.mode = 'play'
        self.rng = random.Random(seed)
        self.player_x = W / 2.0
        self.player_y = H - 80.0
        self.player_iframe = 0
        self.bullets = []   # {x, y, vx, vy}
        self.ebullets = []  # {x, y, vx, vy, grazed}
        self.enemies = []   # {type, x, y, vx, vy, r, hp, t, fire_t, phase, bp}
        self.gauge = 0
        self.score = 0
        self.graze_count = 0
        self.bomb_count = 0
        self.kill_count = 0
        self.spawn_t = 0
        self.wave = 0
        self.shot_cooldown = 0
        self.intro_med_pending_t = -1  # phase 1 で 0 に初期化
        self.intro_med_x = 0.0
        self.player_lv = 0
        self.invincible_t = 0
        self.hyper_flash_t = 0


def add_gauge(state, d):
    state.gauge = max(0, min(G_MAX, state.gauge + d))


# === Spawn ===
def spawn_enemy(state, kind, x, bp='aimed'):
    """anticipation queue を介さず直接 emit (relative order 不変)"""
    if kind == 'small':
        state.enemies.append({
            'type': 'small', 'x': x, 'y': -12.0, 'vx': 0.0, 'vy': 1.6,
            'r': 9, 'hp': 1, 't': 0, 'fire_t': 9999, 'phase': 0, 'bp': 'aimed',
        })
    else:
        fire_t = 60 + int(state.rng.random() * 40)
        phase = state.rng.random() * math.pi * 2
        state.enemies.append({
            'type': 'medium', 'x': x, 'y': -16.0, 'vx': 0.0, 'vy': 0.9,
            'r': 13, 'hp': 3, 't': 0, 'fire_t': fire_t, 'phase': phase, 'bp': bp,
        })


def spawn_phase1(state):
    # phase 1 (0-13s): 学習 — small 3 + medium 1 (1.2s 遅延 intro)
    spawn_enemy(state, 'small', W * 0.30)
    spawn_enemy(state, 'small', W * 0.50)
    spawn_enemy(state, 'small', W * 0.70)
    # setTimeout(1200ms) intro medium を 72F カウントダウンで simulate
    if state.intro_med_pending_t < 0:
        state.intro_med_pending_t = PHASE1_MED_DELAY_F
        state.intro_med_x = W * 0.5


def spawn_phase2(state):
    # phase 2 (13-26s): 圧力 — fan3 導入
    spawn_enemy(state, 'small', W * 0.2)
    spawn_enemy(state, 'small', W * 0.4)
    spawn_enemy(state, 'small', W * 0.6)
    spawn_enemy(state, 'small', W * 0.8)
    spawn_enemy(state, 'medium', W * 0.3, 'fan3')
    spawn_enemy(state, 'medium', W * 0.7, 'fan3')


def spawn_phase3(state):
    # phase 3 (26-39s): 休符 — aimed 復帰
    for i in range(6):
        spawn_enemy(state, 'small', W * 0.15 + i * W * 0.14)
    spawn_enemy(state, 'medium', W * 0.5, 'aimed')


def spawn_phase4(state):
    # phase 4 (39-52s): 圧力 — fan3 増量
    spawn_enemy(state, 'medium', W * 0.25, 'fan3')
    spawn_enemy(state, 'medium', W * 0.5, 'fan3')
    spawn_enemy(state, 'medium', W * 0.75, 'fan3')
    for i in range(4):
        spawn_enemy(state, 'small', W * 0.2 + i * W * 0.2)


def spawn_phase5(state):
    # phase 5 (52-65s): 山 1 — aimed 高密度
    for i in range(8):
        spawn_enemy(state, 'small', W * 0.1 + i * W * 0.11)
    spawn_enemy(state, 'medium', W * 0.35, 'aimed')
    spawn_enemy(state, 'medium', W * 0.65, 'aimed')


def spawn_phase6(state):
    # phase 6 (65-78s): 休符 — decrescendo
    for i in range(4):
        spawn_enemy(state, 'small', W * 0.2 + i * W * 0.2)
    spawn_enemy(state, 'medium', W * 0.5, 'aimed')


def spawn_phase7(state):
    # phase 7 (78-90s+): 山 2 final — fan3 4 + small 4
    spawn_enemy(state, 'medium', W * 0.2, 'fan3')
    spawn_enemy(state, 'medium', W * 0.4, 'fan3')
    spawn_enemy(state, 'medium', W * 0.6, 'fan3')
    spawn_enemy(state, 'medium', W * 0.8, 'fan3')
    for i in range(4):
        spawn_enemy(state, 'small', W * 0.15 + i * W * 0.24)


PHASE_FUNCS = [None, spawn_phase1, spawn_phase2, spawn_phase3, spawn_phase4,
               spawn_phase5, spawn_phase6, spawn_phase7]


def spawn_wave(state):
    state.wave += 1
    PHASE_FUNCS[current_phase(state)](state)


# === Player shot ===
def spawn_player_bullets(state):
    n = shot_count(state)
    px, py = state.player_x, state.player_y - 8.0
    if n == 1:
        state.bullets.append({'x': px, 'y': py, 'vx': 0.0, 'vy': -9.0})
    elif n == 2:
        state.bullets.append({'x': px - 5, 'y': py, 'vx': 0.0, 'vy': -9.0})
        state.bullets.append({'x': px + 5, 'y': py, 'vx': 0.0, 'vy': -9.0})
    else:
        # n >= 3: 3-way 中心 + ±1.5
        state.bullets.append({'x': px, 'y': py, 'vx': 0.0, 'vy': -9.0})
        state.bullets.append({'x': px - 7, 'y': py + 2, 'vx': -1.5, 'vy': -9.0})
        state.bullets.append({'x': px + 7, 'y': py + 2, 'vx': 1.5, 'vy': -9.0})
        # n>=4 の追加弾は省略 (relative order 不変)


# === Hyper (B-2) ===
def fire_bomb(state):
    if state.gauge < G_MAX:
        return
    state.bomb_count += 1
    removed = len(state.ebullets)
    state.ebullets = []
    state.score += removed * 100
    for e in state.enemies:
        e['hp'] = max(1, math.ceil(e['hp'] / 2.0))
    state.gauge = 0
    state.hyper_flash_t = HYPER_FLASH_FRAMES


# === Hit / Graze ===
def on_hit(state):
    lv = gauge_level(state.gauge)
    state.player_iframe = 24
    if lv == 3:
        state.gauge = G_LV2
    elif lv == 2:
        state.gauge = 0
    else:
        state.mode = 'over'


def on_graze(state):
    state.graze_count += 1
    mult = 2 if state.invincible_t > 0 else 1
    add_gauge(state, GRAZE_GAUGE * mult)
    state.score += GRAZE_SCORE * gauge_level(state.gauge) * mult
    # Lv up 判定 (LV_GRAZE_TH ごと)
    if state.player_lv < PLAYER_LV_MAX and state.graze_count % LV_GRAZE_TH == 0:
        state.player_lv += 1
        # Hyper 中 (hyperFlashT>0) は invincibleT 新規セットしない (二重カバー禁止)
        if state.hyper_flash_t <= 0:
            if state.invincible_t > 0:
                state.invincible_t = min(state.invincible_t + BUZZ_INVINCIBLE_FRAMES,
                                          BUZZ_INVINCIBLE_CAP)
            else:
                state.invincible_t = BUZZ_INVINCIBLE_FRAMES


# === Frame step ===
def step(state, action):
    """action = (dx, dy, bomb_press) を受けて 1F 進める"""
    state.t += 1

    # 1F tick
    if state.player_iframe > 0:
        state.player_iframe -= 1
    if state.invincible_t > 0:
        state.invincible_t -= 1
    if state.hyper_flash_t > 0:
        state.hyper_flash_t -= 1

    # Player 移動
    dx, dy, bomb_press = action
    if dx and dy:
        dx *= 0.7071067811865476
        dy *= 0.7071067811865476
    state.player_x += dx * 4.2
    state.player_y += dy * 4.2
    state.player_x = max(8.0, min(W - 8.0, state.player_x))
    state.player_y = max(20.0, min(H - 12.0, state.player_y))

    # 自機弾発射
    if state.shot_cooldown > 0:
        state.shot_cooldown -= 1
    else:
        spawn_player_bullets(state)
        state.shot_cooldown = shot_cooldown_f(state)

    # 自機弾移動 + 範囲外消去
    new_bullets = []
    for b in state.bullets:
        b['x'] += b['vx']
        b['y'] += b['vy']
        if b['y'] > -12 and -12 < b['x'] < W + 12:
            new_bullets.append(b)
    state.bullets = new_bullets

    # spawn wave
    state.spawn_t -= 1
    if state.spawn_t <= 0 and len(state.enemies) < 3:
        spawn_wave(state)
        state.spawn_t = spawn_interval(state)

    # phase 1 intro medium 遅延 spawn (setTimeout 相当)
    if state.intro_med_pending_t > 0:
        state.intro_med_pending_t -= 1
        if state.intro_med_pending_t == 0:
            spawn_enemy(state, 'medium', state.intro_med_x, 'aimed')

    # 敵移動 + 弾発射
    sp_bullet = 2.4
    for e in state.enemies:
        e['t'] += 1
        if e['type'] == 'small':
            e['y'] += e['vy']
        else:
            e['y'] += e['vy']
            e['x'] += math.sin(e['t'] * 0.04 + e['phase']) * 1.4
            e['fire_t'] -= 1
            if e['fire_t'] <= 0 and 0 < e['y'] < H * 0.55:
                ex, ey = e['x'], e['y']
                bdx, bdy = state.player_x - ex, state.player_y - ey
                d = math.hypot(bdx, bdy) or 1.0
                pat = e['bp']
                if pat == 'fan3':
                    base = math.atan2(bdy, bdx)
                    spread = 0.26
                    for k in (-1, 0, 1):
                        a = base + spread * k
                        state.ebullets.append({
                            'x': ex, 'y': ey,
                            'vx': math.cos(a) * sp_bullet, 'vy': math.sin(a) * sp_bullet,
                            'grazed': False,
                        })
                else:
                    state.ebullets.append({
                        'x': ex, 'y': ey,
                        'vx': bdx / d * sp_bullet, 'vy': bdy / d * sp_bullet,
                        'grazed': False,
                    })
                e['fire_t'] = 70 + int(state.rng.random() * 40)

    # 自機弾と敵の判定
    for b in state.bullets:
        if b['y'] < -10:
            continue
        for e in state.enemies:
            if e['hp'] <= 0:
                continue
            dxe = b['x'] - e['x']
            dye = b['y'] - e['y']
            rr = e['r'] + 3
            if dxe * dxe + dye * dye < rr * rr:
                e['hp'] -= 1
                b['y'] = -99
                if e['hp'] <= 0:
                    state.kill_count += 1
                    if e['type'] == 'small':
                        state.score += 10
                        add_gauge(state, KILL_SMALL_GAUGE)
                    else:
                        state.score += 40
                        add_gauge(state, KILL_MED_GAUGE)
                break

    # 自機弾 範囲外消去
    state.bullets = [b for b in state.bullets if b['y'] > -12]
    # 敵 hp/y 削除
    state.enemies = [e for e in state.enemies if e['hp'] > 0 and e['y'] < H + 30]

    # 敵弾移動 + 当たり/graze 判定
    new_ebullets = []
    for b in state.ebullets:
        b['x'] += b['vx']
        b['y'] += b['vy']
        dxp = b['x'] - state.player_x
        dyp = b['y'] - state.player_y
        d2 = dxp * dxp + dyp * dyp
        if d2 < R_HIT * R_HIT:
            # 被弾 — iframe>0 or invincibleT>0 なら skip
            if state.player_iframe <= 0 and state.invincible_t <= 0:
                on_hit(state)
                if state.mode == 'over':
                    return
                # 弾消去
                continue
            else:
                # 無敵中だが skip — 弾は残す
                pass
        elif not b['grazed'] and d2 < R_GRAZE * R_GRAZE:
            b['grazed'] = True
            on_graze(state)
        # 範囲外消去
        if -20 < b['x'] < W + 20 and -20 < b['y'] < H + 20:
            new_ebullets.append(b)
    state.ebullets = new_ebullets

    # 敵接触判定 (R-A 衝突)
    if state.player_iframe <= 0 and state.invincible_t <= 0:
        for e in state.enemies:
            dxe = state.player_x - e['x']
            dye = state.player_y - e['y']
            rr = e['r'] + 5  # player r=5
            if dxe * dxe + dye * dye < rr * rr:
                on_hit(state)
                if state.mode == 'over':
                    return
                break

    # BOMB 発動 (action 由来)
    if bomb_press:
        fire_bomb(state)


# === Policies ===
def sign_to_dxdy(target_x, target_y, state):
    dx = 0
    dy = 0
    if abs(target_x - state.player_x) > 1.0:
        dx = 1 if target_x > state.player_x else -1
    if abs(target_y - state.player_y) > 1.0:
        dy = 1 if target_y > state.player_y else -1
    return dx, dy


def policy_route(state):
    """8 字経路 + phase 5/7 山で gauge MAX 時 BOMB (Psyvariar 想定良方針)"""
    cx, cy = W / 2.0, H * 0.7
    rx, ry = W * 0.3, H * 0.15
    tx = cx + rx * math.sin(state.t * 0.025)
    ty = cy + ry * math.sin(state.t * 0.05)
    dx, dy = sign_to_dxdy(tx, ty, state)
    p = current_phase(state)
    bomb = (state.gauge >= G_MAX) and (p in (5, 7))
    return dx, dy, bomb


def policy_camper(state):
    """画面下端中央張り付き、BOMB 使わない"""
    tx, ty = W / 2.0, H - 12.0
    dx, dy = sign_to_dxdy(tx, ty, state)
    return dx, dy, False


def policy_panic(state):
    """8 字経路は route と同等、gauge MAX 到達即 BOMB (使い所無視で消費)"""
    cx, cy = W / 2.0, H * 0.7
    rx, ry = W * 0.3, H * 0.15
    tx = cx + rx * math.sin(state.t * 0.025)
    ty = cy + ry * math.sin(state.t * 0.05)
    dx, dy = sign_to_dxdy(tx, ty, state)
    bomb = (state.gauge >= G_MAX)
    return dx, dy, bomb


def policy_novice(state):
    """ランダム移動 + 弾無視、BOMB 稀にランダム発動"""
    dx = state.rng.choice([-1, 0, 1])
    dy = state.rng.choice([-1, 0, 1])
    bomb = (state.rng.random() < 0.001)
    return dx, dy, bomb


POLICIES = {
    'route': policy_route,
    'camper': policy_camper,
    'panic': policy_panic,
    'novice': policy_novice,
}


# === Trial / Aggregation ===
MAX_FRAMES = 5400 * 2  # 90秒 × 2 = 180秒 で強制終了 (無限 final 暴走防止)


def run_trial(policy_name, seed, max_frames=MAX_FRAMES):
    state = GameState(seed)
    policy_fn = POLICIES[policy_name]
    while state.mode == 'play' and state.t < max_frames:
        action = policy_fn(state)
        step(state, action)
    return {
        'frames': state.t,
        'seconds': state.t / 60.0,
        'score': state.score,
        'grazes': state.graze_count,
        'kills': state.kill_count,
        'bombs': state.bomb_count,
        'player_lv': state.player_lv,
        'reached_phase7': state.t >= PHASE_BOUNDARIES[5],   # 78s+ 到達
        'survived_90s': state.t >= PHASE_BOUNDARIES[6],     # 90s+ 到達
    }


def aggregate(trials):
    n = len(trials)
    if n == 0:
        return {}
    keys_avg = ('frames', 'seconds', 'score', 'grazes', 'kills', 'bombs', 'player_lv')
    keys_rate = ('reached_phase7', 'survived_90s')
    out = {'n_trials': n}
    for k in keys_avg:
        vals = [t[k] for t in trials]
        out[k + '_avg'] = sum(vals) / n
        out[k + '_min'] = min(vals)
        out[k + '_max'] = max(vals)
    for k in keys_rate:
        out[k + '_rate'] = sum(1 for t in trials if t[k]) / n
    return out


def main():
    parser = argparse.ArgumentParser(
        description='graze_log v07 headless (観点8: 4 bad policy relative order 構造判定のみ)',
        epilog='WARNING: 数値の絶対値を Nao_u 評価 / cross_review / Slack / merge 要請の根拠にしてはならない (R-I 死守)',
    )
    parser.add_argument('--policy', choices=list(POLICIES.keys()) + ['all'],
                        default='all', help='policy to run (default: all 4)')
    parser.add_argument('--trials', type=int, default=100, help='trials per policy (default: 100)')
    parser.add_argument('--seed-base', type=int, default=1000, help='base seed (default: 1000)')
    parser.add_argument('--json', action='store_true', help='JSON output')
    parser.add_argument('--verbose', action='store_true', help='per-trial detail')
    args = parser.parse_args()

    policies_to_run = list(POLICIES.keys()) if args.policy == 'all' else [args.policy]
    all_results = {}

    for pname in policies_to_run:
        trials = []
        for i in range(args.trials):
            seed = args.seed_base + i
            t = run_trial(pname, seed)
            trials.append(t)
            if args.verbose:
                print(f'  {pname} seed={seed}: t={t["frames"]:4d}F sc={t["score"]:6d} '
                      f'gr={t["grazes"]:3d} kl={t["kills"]:3d} bm={t["bombs"]:2d} '
                      f'p7={int(t["reached_phase7"])} 90s={int(t["survived_90s"])}')
        agg = aggregate(trials)
        all_results[pname] = agg

    if args.json:
        print(json.dumps(all_results, indent=2))
    else:
        print('# graze_log v07 headless 観点8 (relative order 構造判定のみ、R-I 死守)')
        print(f'# trials_per_policy={args.trials}  seed_base={args.seed_base}')
        print()
        cols = ['policy', 'sec_avg', 'score_avg', 'graze_avg', 'kill_avg', 'bomb_avg',
                'p7_rate', '90s_rate', 'plv_avg']
        widths = [8, 8, 9, 9, 8, 8, 8, 8, 7]
        print('  '.join(c.ljust(w) for c, w in zip(cols, widths)))
        print('  '.join('-' * w for w in widths))
        for pname, agg in all_results.items():
            row = [
                pname,
                f'{agg["seconds_avg"]:.2f}',
                f'{agg["score_avg"]:.0f}',
                f'{agg["grazes_avg"]:.1f}',
                f'{agg["kills_avg"]:.1f}',
                f'{agg["bombs_avg"]:.2f}',
                f'{agg["reached_phase7_rate"]:.2f}',
                f'{agg["survived_90s_rate"]:.2f}',
                f'{agg["player_lv_avg"]:.2f}',
            ]
            print('  '.join(v.ljust(w) for v, w in zip(row, widths)))
        print()
        print('# === relative order signal 読み (R-I 死守、構造判定のみ) ===')
        order_by_score = sorted(all_results.items(), key=lambda kv: -kv[1]['score_avg'])
        print('# score_avg 降順: ' + ' > '.join(f'{k}({v["score_avg"]:.0f})' for k, v in order_by_score))
        order_by_sec = sorted(all_results.items(), key=lambda kv: -kv[1]['seconds_avg'])
        print('# seconds_avg 降順: ' + ' > '.join(f'{k}({v["seconds_avg"]:.1f}s)' for k, v in order_by_sec))


if __name__ == '__main__':
    main()
