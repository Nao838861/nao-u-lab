"""graze_log v05 — headless infrastructure verifier (Ash 2026-05-16 C188 Phase 4).

目的: v05/index.html の B-1 (敵配置 rhyme) + B-2 (弾パターン rhyme) 配線を
ブラウザ起動なしで infrastructure 動作確認する。

非目的: ゲームの面白さ判定、難度カーブ評価、playtest 代替。
`feedback_headless_unfit_for_unfinished_eval.md` t:5 に従い、本スクリプトの
出力を judgment / cross_review / Slack / merge 要請の根拠にしない。

二層構成:
  Layer 1 (static verification): index.html を文字列読込し regex/構文 balance で
    必要な関数定義・配線・ABAB rhyme 構造の存在を assert
  Layer 2 (dynamic micro-sim): mulberry32 を Python に移植し、
    seed=12345 での wave 5-14 の wave_funcs 選択列を計算、
    再走で同列が再現することを assert (state.rng は startGame で再シードしない仕様の verifier)

Usage:
  python headless.py                # 全check 実行
  python headless.py --seed 42      # dynamic check の seed 変更
  python headless.py --wave-end 20  # dynamic check の wave 末尾変更

Exit code:
  0 = 全check pass
  1 = 1個以上 fail
"""
import argparse
import re
import sys
from pathlib import Path


HTML = Path(__file__).parent / "index.html"


def mulberry32(seed):
    """v05/index.html の mulberry32 と同一系列を生成する Python ポート。"""
    s = [seed & 0xFFFFFFFF]
    def _rand():
        s[0] = (s[0] + 0x6D2B79F5) & 0xFFFFFFFF
        t = s[0]
        t = ((t ^ (t >> 15)) * (t | 1)) & 0xFFFFFFFF
        u = (t + ((t ^ (t >> 7)) * (t | 61))) & 0xFFFFFFFF
        return ((u ^ (u >> 14)) & 0xFFFFFFFF) / 4294967296
    return _rand


# === Layer 1: static verification ===

REQUIRED_FUNCS = [
    "pushSeedToLocal",
    "spawnEnemy",
    "spawnWave1", "spawnWave2", "spawnWave3", "spawnWave4",
    "spawnWaveRandom", "spawnWave",
]

# B-2 ABAB rhyme: wave 1=aimed / wave 2=fan3 / wave 3=aimed / wave 4=fan3
ABAB_EXPECT = {
    "spawnWave1": "'aimed'",
    "spawnWave2": "'fan3'",
    "spawnWave3": "'aimed'",
    "spawnWave4": "'fan3'",
}


def extract_function_body(src, name):
    """`function name(...){...}` の body を抜き出す (簡易、ネスト関数で破綻するが top-level 用途)。"""
    m = re.search(r"function\s+" + re.escape(name) + r"\s*\([^)]*\)\s*\{", src)
    if not m:
        return None
    start = m.end()
    depth = 1
    i = start
    while i < len(src) and depth > 0:
        c = src[i]
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
        i += 1
    return src[start:i - 1]


def check_static(src):
    failures = []
    notes = []

    # 1) 必須関数定義の存在
    for fname in REQUIRED_FUNCS:
        if not re.search(r"function\s+" + re.escape(fname) + r"\s*\(", src):
            failures.append(f"missing function: {fname}()")
    notes.append(f"required functions present: {len(REQUIRED_FUNCS)}/{len(REQUIRED_FUNCS)}")

    # 2) 関数定義総数 (name 付き top-level)
    func_count = len(re.findall(r"^\s*function\s+[A-Za-z_]\w*\s*\(", src, re.MULTILINE))
    notes.append(f"top-level named functions: {func_count}")

    # 3) ブレース / 丸カッコ balance
    braces_open = src.count("{")
    braces_close = src.count("}")
    parens_open = src.count("(")
    parens_close = src.count(")")
    if braces_open != braces_close:
        failures.append(f"brace imbalance: {{={braces_open} }}={braces_close}")
    if parens_open != parens_close:
        failures.append(f"paren imbalance: (={parens_open} )={parens_close}")
    notes.append(f"brace balance: {braces_open}/{braces_close}, paren: {parens_open}/{parens_close}")

    # 4) WAVE_FUNCS 配列リテラル存在
    if not re.search(r"const\s+WAVE_FUNCS\s*=\s*\[\s*spawnWave1\s*,\s*spawnWave2\s*,\s*spawnWave3\s*,\s*spawnWave4\s*\]", src):
        failures.append("WAVE_FUNCS array literal not found or wrong order")
    else:
        notes.append("WAVE_FUNCS = [spawnWave1..4] OK")

    # 5) wave>=5 で 70% rng pick + 30% random の dispatch 構造
    spawn_wave = extract_function_body(src, "spawnWave")
    if spawn_wave is None:
        failures.append("spawnWave() body not extractable")
    else:
        if "state.rng()<0.7" not in spawn_wave and "state.rng() < 0.7" not in spawn_wave:
            failures.append("spawnWave() missing 70% rng threshold (state.rng()<0.7)")
        if "WAVE_FUNCS[" not in spawn_wave:
            failures.append("spawnWave() missing WAVE_FUNCS[idx]() call")
        if "spawnWaveRandom" not in spawn_wave:
            failures.append("spawnWave() missing spawnWaveRandom fallback")
        else:
            notes.append("spawnWave() B-1 dispatch (rhyme 70% / random 30%) OK")

    # 6) B-2 ABAB rhyme: wave 1/3='aimed', wave 2/4='fan3'
    for fname, expect in ABAB_EXPECT.items():
        body = extract_function_body(src, fname)
        if body is None:
            failures.append(f"{fname}() body not extractable")
            continue
        if expect not in body:
            failures.append(f"{fname}() does not pass {expect} to spawnEnemy() — ABAB rhyme broken")
    if all(extract_function_body(src, f) and ABAB_EXPECT[f] in extract_function_body(src, f) for f in ABAB_EXPECT):
        notes.append("B-2 ABAB rhyme (wave 1/3=aimed, 2/4=fan3) OK")

    # 7) spawnEnemy() 第 4 引数 bulletPattern + medium 分岐に bulletPattern フィールド代入
    spawn_enemy = extract_function_body(src, "spawnEnemy")
    if spawn_enemy is None:
        failures.append("spawnEnemy() body not extractable")
    else:
        if not re.search(r"function\s+spawnEnemy\s*\(\s*type\s*,\s*x\s*,\s*phase\s*,\s*bulletPattern\s*\)", src):
            failures.append("spawnEnemy() signature missing bulletPattern as 4th arg")
        if "bulletPattern:bulletPattern||'aimed'" not in spawn_enemy.replace(" ", ""):
            failures.append("spawnEnemy() medium branch missing bulletPattern field assignment")
        else:
            notes.append("spawnEnemy() bulletPattern arg + field OK")

    # 8) update() medium 発射分岐に pat==='fan3' branch
    pat_match = re.search(r"const\s+pat\s*=\s*e\.bulletPattern\s*\|\|\s*'aimed'", src)
    fan3_match = re.search(r"if\s*\(\s*pat\s*===\s*'fan3'\s*\)", src)
    if not pat_match:
        failures.append("update() missing `const pat=e.bulletPattern||'aimed'` line")
    if not fan3_match:
        failures.append("update() missing `if(pat==='fan3')` branch")
    if pat_match and fan3_match:
        notes.append("update() B-2 fire branch (pat selector + fan3 case) OK")

    # 9) pushSeedToLocal() 配線確認: startGame() / gameOver() に呼ばれている
    if "pushSeedToLocal(SEED)" not in src:
        failures.append("pushSeedToLocal(SEED) call missing (expected in startGame())")
    if "console.log('graze_log seed:'" not in src and 'console.log("graze_log seed:"' not in src:
        failures.append("gameOver() console.log('graze_log seed:'...) missing")
    if "pushSeedToLocal(SEED)" in src and "console.log('graze_log seed:'" in src:
        notes.append("seed infra (localStorage push + console.log) OK")

    return failures, notes, func_count


# === Layer 2: dynamic micro-sim (wave selection deterministic re-run) ===

def simulate_wave_selection(seed, wave_end):
    """state.rng を再シードしない仕様を verify する。
    wave 5..wave_end まで spawnWave() を回し、各 wave で 70% rng pick / 30% random fallback の選択列を返す。
    rng 消費数:
      - 各 wave で `state.rng()<0.7` 判定で 1 個消費
      - rhyme 分岐に入れば `Math.floor(state.rng()*WAVE_FUNCS.length)` で 1 個消費 (wave_funcs 選択)
      - random 分岐に入れば spawnWaveRandom() 内で `pop=4+min(w-4,6)` 個の敵生成それぞれで 2 個消費
        (rng()<0.6 判定 + 位置 60+rng()*(W-120))
    `update()` ループや setTimeout は本 micro-sim の射程外 (Layer 1 で wiring assert 済)。
    """
    rng = mulberry32(seed)
    selections = []
    for w in range(5, wave_end + 1):
        r1 = rng()
        if r1 < 0.7:
            r2 = rng()
            idx = int(r2 * 4)
            selections.append(("rhyme", w, idx + 1))  # spawnWave{idx+1} (1-indexed)
        else:
            pop = 4 + min(w - 4, 6)
            for _ in range(pop):
                rng()  # type pick
                rng()  # x position
            selections.append(("random", w, pop))
    return selections


def check_dynamic(seed, wave_end):
    failures = []
    notes = []

    sel_a = simulate_wave_selection(seed, wave_end)
    sel_b = simulate_wave_selection(seed, wave_end)
    if sel_a != sel_b:
        failures.append("dynamic re-run mismatch — mulberry32 not deterministic for same seed (Python port bug)")
        return failures, notes

    rhyme_count = sum(1 for s in sel_a if s[0] == "rhyme")
    random_count = sum(1 for s in sel_a if s[0] == "random")
    notes.append(f"seed={seed} wave 5-{wave_end} ({len(sel_a)} waves): rhyme={rhyme_count} ({rhyme_count/len(sel_a):.0%}), random={random_count} ({random_count/len(sel_a):.0%})")

    # 期待: rhyme 比率は 70% を中心に分布。サンプル少数なので幅広く許容。
    if not (0.4 <= rhyme_count / len(sel_a) <= 0.95):
        failures.append(f"rhyme ratio {rhyme_count/len(sel_a):.0%} outside reasonable [40%, 95%] window for seed={seed}")

    # 選択列の最初の 5 wave をログ
    head = sel_a[:5]
    notes.append("first 5 wave selections: " + " | ".join(f"w{s[1]}={s[0]}({'sw'+str(s[2]) if s[0]=='rhyme' else 'pop'+str(s[2])})" for s in head))

    return failures, notes


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--seed", type=int, default=12345)
    ap.add_argument("--wave-end", type=int, default=14)
    args = ap.parse_args()

    if not HTML.exists():
        print(f"FAIL: {HTML} not found", file=sys.stderr)
        return 1

    src = HTML.read_text(encoding="utf-8")
    print(f"# graze_log v05 headless infrastructure check")
    print(f"# source: {HTML} ({len(src)} bytes)")
    print(f"# scope: B-1 (wave dispatcher) + B-2 (bulletPattern) + seed infra wiring")
    print(f"# NOT a judgment device — see feedback_headless_unfit_for_unfinished_eval.md t:5")
    print()

    print("[Layer 1: static verification]")
    s_fail, s_notes, func_count = check_static(src)
    for n in s_notes:
        print(f"  - {n}")
    if s_fail:
        for f in s_fail:
            print(f"  FAIL: {f}")
    else:
        print("  -> all static checks passed")
    print()

    print("[Layer 2: dynamic micro-sim (wave selection determinism)]")
    d_fail, d_notes = check_dynamic(args.seed, args.wave_end)
    for n in d_notes:
        print(f"  - {n}")
    if d_fail:
        for f in d_fail:
            print(f"  FAIL: {f}")
    else:
        print("  -> dynamic re-run deterministic")
    print()

    total_fail = len(s_fail) + len(d_fail)
    if total_fail == 0:
        print("all checks passed")
        return 0
    else:
        print(f"FAILED: {total_fail} check(s) failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())
