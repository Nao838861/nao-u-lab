#!/usr/bin/env python3
"""
multi_phase_cycle_log.py — Log(Win) マルチフェーズ自律サイクル

Nao_uの提案(2026-04-05 #human-steering):
  「LLMは一回の起動でやるべきことが多いと注意が分散して散漫になる」
  → 1サイクルを複数LLM起動に分割して注意を集中させる。

Mirの4フェーズ分割(autonomous_cycle.sh)を参考にLog向けに実装。
2026-05-08 Nao_u指示で5フェーズ化（Phase 4で大作業を集中実行、Diaryを分離）。

5 Phases:
  Phase 1 (Gather):   Slack確認、情報収集、ステージング書き出し
  Phase 2 (Analyze):  shared-reads深い分析、外部ノート統合
  Phase 3 (Act):      改善適用、Slack返信、プロジェクト更新／Phase 4で完遂する大作業を1つ決める
  Phase 4 (Execute):  Phase 3で決めた大作業1つを完遂（日記は書かない）
  Phase 5 (Diary):    活動日記 + 次回起動時にやること + git push

ステージングファイル: log/cycle_staging_log.md（Phase間の情報受け渡し）

Usage:
  python multi_phase_cycle_log.py           # 通常実行（5フェーズ全部）
  python multi_phase_cycle_log.py --phase 2 # 特定フェーズのみ（デバッグ用）
"""

import sys
import os
import subprocess
import time
import argparse
from pathlib import Path
from datetime import datetime

REPO_DIR = Path(__file__).parent
sys.path.insert(0, str(REPO_DIR))

from claude_runner import build_claude_cmd

os.environ["PYTHONUTF8"] = "1"
os.environ["PYTHONIOENCODING"] = "utf-8"

PY = [sys.executable, "-X", "utf8"]
STAGING_FILE = REPO_DIR / "log" / "cycle_staging_log.md"
LOG_FILE = REPO_DIR / "log" / "scheduler_log.log"

# Windows: 子プロセスのウィンドウを非表示にする
# CREATE_NO_WINDOW + STARTUPINFO/SW_HIDE 併用
# (2026-04-26: Nao_u再指摘「数分に一度一瞬ウインドウが出てフォーカスが持っていかれる」対策)
# CREATE_NO_WINDOWだけではcmd経由のbat(claude.cmd)等の内部子プロセスを抑制できない
if sys.platform == "win32":
    _CREATION_FLAGS = 0x08000000  # CREATE_NO_WINDOW
    _SILENT_STARTUPINFO = subprocess.STARTUPINFO()
    _SILENT_STARTUPINFO.dwFlags |= subprocess.STARTF_USESHOWWINDOW
    _SILENT_STARTUPINFO.wShowWindow = subprocess.SW_HIDE

    _orig_run = subprocess.run
    def _silent_run(*a, **kw):
        kw["creationflags"] = kw.get("creationflags", 0) | subprocess.CREATE_NO_WINDOW
        kw.setdefault("startupinfo", _SILENT_STARTUPINFO)
        return _orig_run(*a, **kw)
    subprocess.run = _silent_run
    _orig_popen = subprocess.Popen
    def _silent_popen(*a, **kw):
        kw["creationflags"] = kw.get("creationflags", 0) | subprocess.CREATE_NO_WINDOW
        kw.setdefault("startupinfo", _SILENT_STARTUPINFO)
        return _orig_popen(*a, **kw)
    subprocess.Popen = _silent_popen
else:
    _CREATION_FLAGS = 0

# Phase timeouts (seconds)
# 2026-04-07: Nao_u指摘「Killしていいことはほとんどない。普通は引っかからないレベルの長さに」
# タイムアウトは安全弁。正常動作中は絶対に引っかからない長さに設定する。
# killされたLLM呼び出し = 消費トークン全損。短すぎるタイムアウトは節約ではなく浪費。
PHASE_TIMEOUTS = {
    1: 900,    # 15min: Gather (実測~250s、余裕を十分に)
    2: 1800,   # 30min: Analyze (旧480sで100%タイムアウトしていた)
    3: 1800,   # 30min: Act (同上)
    4: 1800,   # 30min: Execute (Phase 3で決めた大作業1本を完遂)
    5: 1200,   # 20min: Diary (旧420sでギリギリ～超過)
}


def log(msg):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line, flush=True)
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(line + "\n")
    except Exception:
        pass


def run_prechecks():
    """Run pre-check scripts and collect alert strings."""
    alerts = []
    for script, args, label, timeout_s in [
        ("check_kaizen_due.py", [], "検証リマインド", 10),
        ("verify_kaizen.py", [], "自動検証結果", 60),
        ("verify_kaizen.py", ["--meta"], "メタ検証", 30),
        ("verify_kaizen.py", ["--nag"], "クロスチェック督促", 30),
        ("check_kaizen_crosscheck.py", ["--who=Log"], "クロスチェック", 10),
        ("check_reservations.py", [], "行動予約", 10),
        ("memory_walk.py", ["--n", "1"], "記憶の散歩", 10),
        ("check_beliefs_health.py", ["--summary"], "信念健康", 10),
        ("check_kaizen_due.py", ["--auto-verify"], "自動検証", 60),
        ("slack_insight_digest.py", ["--compact", "--hours", "72"], "他インスタンス洞察", 15),
    ]:
        try:
            r = subprocess.run(
                [*PY, str(REPO_DIR / script)] + args,
                capture_output=True, text=True, timeout=timeout_s,
                cwd=str(REPO_DIR), encoding="utf-8", errors="replace",
                creationflags=_CREATION_FLAGS,
            )
            if r.returncode == 0 and r.stdout.strip():
                out = r.stdout.strip()
                skip_words = ["検証対象なし", "自動検証対象なし", "未レビュー項目なし", "nag不要"]
                if not any(w in out for w in skip_words):
                    alerts.append(f"[{label}] {out[:300]}")
                    log(f"[multi_phase] {label}: {out[:100]}")
        except Exception as e:
            log(f"[multi_phase] {label} error: {e}")
    return alerts


def run_periodic_checks():
    """Run kaizen checklist and weekly review (elapsed-time based, not LLM-dependent)."""
    # Kaizen checklist (24h interval)
    checklist_ts_file = REPO_DIR / ".kaizen_status_last_posted"
    should_run = True
    try:
        if checklist_ts_file.exists():
            last_posted = datetime.fromisoformat(checklist_ts_file.read_text().strip())
            if (datetime.now() - last_posted).total_seconds() < 24 * 3600:
                should_run = False
    except Exception:
        pass
    if should_run:
        try:
            r = subprocess.run(
                [*PY, str(REPO_DIR / "verify_kaizen.py"), "--slack-status"],
                capture_output=True, text=True, timeout=30,
                cwd=str(REPO_DIR), encoding="utf-8", errors="replace",
                creationflags=_CREATION_FLAGS,
            )
            if r.returncode == 0:
                checklist_ts_file.write_text(datetime.now().isoformat())
                log(f"[multi_phase] Kaizen checklist posted: {r.stdout.strip()[:100]}")
        except Exception as e:
            log(f"[multi_phase] kaizen-status error: {e}")

    # Weekly self-review (Sunday, 7-day interval)
    weekly_flag = ""
    weekly_ts_file = REPO_DIR / ".weekly_review_last_triggered"
    should_run_weekly = False
    if datetime.now().weekday() == 6:  # Sunday
        try:
            if weekly_ts_file.exists():
                last_review = datetime.fromisoformat(weekly_ts_file.read_text().strip())
                if (datetime.now() - last_review).total_seconds() >= 6 * 24 * 3600:
                    should_run_weekly = True
            else:
                should_run_weekly = True
        except Exception:
            should_run_weekly = True
    if should_run_weekly:
        weekly_flag = "[週次自己レビュー] 日曜日のため週次レビューを実行してください"
        weekly_ts_file.write_text(datetime.now().isoformat())
        log("[multi_phase] Weekly self-review trigger (Sunday)")
    return weekly_flag


def get_next_tasks_pending():
    """next_tasks.py 層A pending 一覧を取得（Mir C126 設計合意 2026-04-26 / Log接合 同日）。
    LLM 出力フォーマット依存を外した構造的な次回タスク注入。"""
    try:
        kwargs = dict(
            capture_output=True, text=True, timeout=10,
            cwd=str(REPO_DIR), encoding="utf-8", errors="replace",
        )
        if _CREATION_FLAGS:
            kwargs["creationflags"] = _CREATION_FLAGS
        r = subprocess.run(
            [sys.executable, str(REPO_DIR / "next_tasks.py"),
             "--instance", "log", "pending"],
            **kwargs,
        )
        return r.stdout.strip()
    except Exception as e:
        log(f"[multi_phase] next_tasks pending取得失敗: {e}")
        return ""


def run_repeated_pattern_check():
    """nao_u_live.md 同パターン2回検出 hook を実行し staging 注入用の行リストを返す。

    kaizen #131 段階2 (2026-05-10 C175 Log 実装):
      段階1 = scripts/check_repeated_pattern_indication.py（実装済 / C170 Phase 4 PASS）
      段階2 = この関数で init_staging() から自動呼出 → staging に inline 注入
      段階3 = 判定機構4点（過去ベンチ等）優先構築 gate（未着手）

    Mir 側 autonomous_cycle.sh の対応 hook と対称。形骸化防止のため WARN 0件でも
    `[M-40 発火なし]` 1行を必ず注入する（ノーオペで黙らない）。"""
    script = REPO_DIR / "scripts" / "check_repeated_pattern_indication.py"
    if not script.exists():
        return [f"[M-40 hook ERROR] script not found: {script}"]
    try:
        kwargs = dict(
            capture_output=True, text=True, timeout=15,
            cwd=str(REPO_DIR), encoding="utf-8", errors="replace",
        )
        if _CREATION_FLAGS:
            kwargs["creationflags"] = _CREATION_FLAGS
        r = subprocess.run([*PY, str(script)], **kwargs)
        warns = [ln.strip() for ln in r.stderr.splitlines() if "[M-40 WARN]" in ln]
        ts = datetime.now().strftime("%Y-%m-%d %H:%M")
        if warns:
            return warns + [f"(kaizen #131 段階2 hook, {ts}, exit={r.returncode})"]
        return [f"[M-40 発火なし] (kaizen #131 段階2 hook, {ts}, exit={r.returncode})"]
    except subprocess.TimeoutExpired:
        return ["[M-40 hook ERROR] timeout (15s)"]
    except Exception as e:
        log(f"[multi_phase] M-40 hook 失敗: {e}")
        return [f"[M-40 hook ERROR] {e}"]


def run_probe_atom_quality():
    """probe_atom_quality.py hook (kaizen #134 段階2):
    atom 品質 3指標 (format_missing / ref_count / next_action) を機械算出し staging 冒頭に
    inline 注入する。形骸化防止のため WARN=0 でも 1行必ず注入する。
    出自: 2026-05-17 C198 #all-nao-u-lab ts=1778969177 で Log → Log_cdx Q3 結論として直列分岐
    構造を提示、その発火点として kaizen #131 段階2 hook の同型実装で本関数を追加。"""
    script = REPO_DIR / "tools" / "probe_atom_quality.py"
    if not script.exists():
        return [f"[probe_atom_quality hook ERROR] script not found: {script}"]
    try:
        kwargs = dict(
            capture_output=True, text=True, timeout=30,
            cwd=str(REPO_DIR), encoding="utf-8", errors="replace",
        )
        if _CREATION_FLAGS:
            kwargs["creationflags"] = _CREATION_FLAGS
        r = subprocess.run([*PY, str(script)], **kwargs)
        summary = [ln.strip() for ln in r.stderr.splitlines() if "[probe_atom_quality]" in ln]
        ts = datetime.now().strftime("%Y-%m-%d %H:%M")
        if summary:
            return summary + [f"(kaizen #134 段階2 hook, {ts}, exit={r.returncode})"]
        return [f"[probe_atom_quality 発火なし] (kaizen #134 段階2 hook, {ts}, exit={r.returncode})"]
    except subprocess.TimeoutExpired:
        return ["[probe_atom_quality hook ERROR] timeout (30s)"]
    except Exception as e:
        log(f"[multi_phase] probe_atom_quality hook 失敗: {e}")
        return [f"[probe_atom_quality hook ERROR] {e}"]


def run_memory_retention_audit():
    """memory_retention_audit.py hook (kaizen #138 段階3, 2026-06-07 C310 Phase 4 着地):
    Forget phase 装置 (C280 Phase 4 着地、約 130 行純 stdlib) を Pre-check 層で自動診断レイヤー化。
    `--hook-summary` モードで stdout 全抑止 + stderr に 1 行サマリ + 退役候補発火時の WARN 行を出力。
    `[memory_retention_audit] ...` と `[memory_retention_audit WARN] stale: ...` を拾い inline 注入。
    形骸化防止のため WARN=0 でもサマリ 1 行は必ず注入する (#131 / #134 hook と同型)。
    副作用ゼロ (memory_retention_audit.py 自体が読み取り専用、退役は人手判断のまま)。"""
    script = REPO_DIR / "tools" / "memory_retention_audit.py"
    if not script.exists():
        return [f"[memory_retention_audit hook ERROR] script not found: {script}"]
    try:
        kwargs = dict(
            capture_output=True, text=True, timeout=30,
            cwd=str(REPO_DIR), encoding="utf-8", errors="replace",
        )
        if _CREATION_FLAGS:
            kwargs["creationflags"] = _CREATION_FLAGS
        r = subprocess.run([*PY, str(script), "--hook-summary"], **kwargs)
        summary = [ln.strip() for ln in r.stderr.splitlines() if ln.startswith("[memory_retention_audit")]
        ts = datetime.now().strftime("%Y-%m-%d %H:%M")
        if summary:
            return summary + [f"(kaizen #138 段階3 hook, {ts}, exit={r.returncode})"]
        return [f"[memory_retention_audit 発火なし] (kaizen #138 段階3 hook, {ts}, exit={r.returncode})"]
    except subprocess.TimeoutExpired:
        return ["[memory_retention_audit hook ERROR] timeout (30s)"]
    except Exception as e:
        log(f"[multi_phase] memory_retention_audit hook 失敗: {e}")
        return [f"[memory_retention_audit hook ERROR] {e}"]


def init_staging(alerts, weekly_flag):
    """Initialize staging file with pre-check results."""
    ts = datetime.now().strftime("%Y-%m-%d %H:%M")
    pending = get_next_tasks_pending()
    m40_lines = run_repeated_pattern_check()
    probe_lines = run_probe_atom_quality()
    retention_lines = run_memory_retention_audit()
    lines = [f"# サイクルステージング ({ts})", ""]
    # 層A: 未完了タスクを冒頭に注入（書式依存を外した次回タスク継承 / 2026-04-26 Mir C126接合）
    lines.extend([
        "## 未完了タスク（層A: next_tasks.py pending）",
        pending if pending else "(なし — next_tasks_log.jsonl は空。Phase 3/4 で `python next_tasks.py --instance log add \"...\"` 実行有無を確認)",
        "",
        "## M-40 自己診断ゲート (kaizen #131 段階2 hook)",
    ])
    lines.extend(m40_lines)
    lines.extend([
        "",
        "## probe_atom_quality (kaizen #134 段階2 hook)",
    ])
    lines.extend(probe_lines)
    lines.extend([
        "",
        "## memory_retention_audit (kaizen #138 段階3 hook)",
    ])
    lines.extend(retention_lines)
    lines.extend([
        "",
        "## Pre-check結果",
    ])
    for a in alerts:
        lines.append(a)
    if weekly_flag:
        lines.append(weekly_flag)
    lines.extend([
        "", "## Phase 1: 情報収集", "(Phase 1が書き込む)",
        "", "## Phase 2: 分析", "(Phase 2が書き込む)",
        "", "## Phase 3: アクション", "(Phase 3が書き込む)",
    ])
    STAGING_FILE.write_text("\n".join(lines), encoding="utf-8")
    fired = sum(1 for ln in m40_lines if "[M-40 WARN]" in ln)
    probe_fired = sum(1 for ln in probe_lines if "[probe_atom_quality]" in ln)
    retention_warn = sum(1 for ln in retention_lines if ln.startswith("[memory_retention_audit WARN]"))
    log(f"[multi_phase] Staging initialized: {len(alerts)} alerts, pending={'yes' if pending else 'empty'}, M-40 WARN={fired}, probe_atom_quality lines={probe_fired}, memory_retention_audit WARN={retention_warn}")


def run_phase(phase_num, phase_name, prompt, timeout_s):
    """Run a single phase via claude --print. Returns True on success."""
    log(f"[multi_phase] Phase {phase_num} ({phase_name}) starting (timeout={timeout_s}s)")
    start = time.time()
    try:
        cmd = build_claude_cmd(prompt)
        kwargs = dict(
            capture_output=True, text=True, timeout=timeout_s,
            cwd=str(REPO_DIR), encoding="utf-8", errors="replace",
        )
        if _CREATION_FLAGS:
            kwargs["creationflags"] = _CREATION_FLAGS
        r = subprocess.run(cmd, **kwargs)
        elapsed = time.time() - start
        log(f"[multi_phase] Phase {phase_num} ({phase_name}) finished in {elapsed:.0f}s (exit={r.returncode})")
        if r.returncode != 0 and r.stderr:
            log(f"[multi_phase] Phase {phase_num} stderr: {r.stderr[:200]}")
        return r.returncode == 0
    except subprocess.TimeoutExpired:
        elapsed = time.time() - start
        log(f"[multi_phase] Phase {phase_num} ({phase_name}) TIMEOUT after {elapsed:.0f}s")
        return False
    except Exception as e:
        log(f"[multi_phase] Phase {phase_num} ({phase_name}) error: {e}")
        return False


# --- Phase prompt builders ---

SLACK_RULES = (
    "[Slack投稿ルール] "
    "・Nao_uへの返信は同じチャンネルで返す（#nao-uだけ例外→#all-nao-u-labに書く） "
    "・外部記事への反応は1件ずつ別メッセージで投稿（まとめ返信禁止） "
    "・スレッド返信は使わない "
    "・#nao-uにはClaude投稿禁止 "
    "・各自チャンネルに長文日記+外部の新情報を交える "
    "・Slack即時応答最優先（Nao_uの時間を使わせない）"
)


def build_phase1_prompt(alert_block):
    return (
        "Log Phase 1 (Gather): 情報収集のみ。判断・行動・Slack投稿は禁止。\n"
        "log/cycle_staging_log.mdを読み、以下を実行して結果をlog/cycle_staging_log.mdの"
        "「Phase 1: 情報収集」セクションに追記:\n"
        "0) **`git status` を最初に実行**し、編集中ファイル（M/??/A）と直近5commit "
        "(`git log --oneline -5`) を staging 冒頭の『### 0) git状態』にメモ。"
        "feedback_self_perception_blindness.md (T:5) 直処方——Slackログ偏重で"
        "Nao_uが同時編集中なのに『流れた』と書いた C122 反省（next_tasks t-260426195755-770b）。"
        "結果が空なら『編集中ファイルなし』と明記。Slack観測より git 観測を先に。\n"
        "1) #nao-uチャンネル確認。新しいURLがあれば内容をメモ。"
        "**[連続事案9 処方 / §7 hook 先行参照規律 2026-06-08 C311]** 新URLを見つけたら、"
        "§1 で「未処理 / 既応答」を判定する前に必ず以下を実行する:\n"
        "   (a) URL末尾の tweet_id (status/数字部分) で "
        "`log/slack_archive/*.jsonl` と `../GPT/memory/raw/slack_api/*.jsonl` の "
        "全 jsonl を grep してヒット数を確認\n"
        "   (b) staging に既に §7 [既応答 SUMMARY] tweet_id=X hits=N が存在すれば "
        "§7 を主証拠とし、§7 の判定をそのまま §1 に反映する "
        "(自前 grep は補助確認用、照合ズレ時のみ §1 を §7 に合わせて修正)\n"
        "   (c) ヒット ≥1 件は『既応答 (hits=N, channels=..., paths=...)』、"
        "0 件のみ『未処理の新規』と判定。shared-reads.jsonl だけで判定しない "
        "(他チャンネル既応答を見落とす §1/§7 構造分離パターン、"
        "feedback_self_perception_blindness 連続事案9 2026-06-08 C311 記録)\n"
        "2) #all-nao-u-lab、#human-steering、#game-rights確認。返信すべきものをリストアップ\n"
        "3) pending_requests.md確認。対応すべきものをリストアップ\n"
        "4) memory/external_notes_log.mdの未統合エントリを確認。統合候補を1-2件選ぶ"
        "（**必ず `python tools/external_notes_integration_audit.py` で未統合件数を取得する**。"
        "`grep -c '\\[統合済'` は `[対応済]` `[取得断念]` `[済 ` の変種を取りこぼす"
        "——2026-04-21 C93 Phase 2で再発確認。目視推定は #079 Phase 1運用バグの原因）\n"
        "5) Activeプロジェクト(projects/INDEX.md)で今日関係しそうなものをメモ\n"
        "6) **現課題キーワード外部検索**（kaizen #106 2026-04-22組込、栄養の偏り処方箋運用化）: "
        "今サイクルの Active project(5の結果)または CLAUDE.md 未完タスク（栄養の偏り/記憶階層再設計）から"
        "1キーワード選び、arxiv/Google/Twitter いずれか1本で外部検索し、staging に "
        "`## 外部検索結果` 節を追加（タイトル+1行要約 最大3件、0件でも『0件：理由』と明記）。"
        "時間予算=Phase 1全体の10%以内、超過したら『タイムアウト：理由』で残してPhase 2へ進む。"
        "前サイクルと同キーワードなら別 Active project のキーワードに切替。"
        "**内容をPhase 2/3で強制利用しない**——摂取経路の固定化だけが目的（ノイズ混入防止）。\n"
        "※Phase 1では情報を集めるだけ。分析・投稿・ファイル更新はPhase 2以降で行う。\n"
        "※inbox処理はinbox_checkが専用で行う。このサイクルでは行わない。\n"
        "\n【空サイクル防止ルール v1.1（2026-04-18 Nao_u #human-steering / 2026-04-19 v1.1）】\n"
        "上記1-3の新着返信対象＋pending合計が2件以下（＝スカスカサイクル）の場合、"
        "Phase 1の残り時間でこの『潜在課題の洗い出し』も必ず行い、"
        "stagingの『## 深掘り候補（空サイクル時）』セクションに書き出す:\n"
        "  A) 前回のlog/cycle_staging_log.mdに『次回持ち越し』『未完了』『TODO』があれば拾う\n"
        "  B) projects/INDEX.mdのActiveで直近7日更新のないプロジェクト → 停滞理由と次の一手を1行"
        "（**v1.2強制**: `ls -lt projects/*.md | head -15` 等の走査コマンドを実行し、"
        "その実行結果（先頭15行まで）を staging に貼付する。結果が空でも空のまま貼る）\n"
        "  C) CLAUDE.mdの「絶対にやる」リストから、直近サイクルで触れていない項目を1つ選び"
        "     『今サイクルで何を1mm進めるか』を書く（栄養の偏り問題 or 記憶階層の再設計）\n"
        "  D) memory/MEMORY.mdでT:4以上かつ直近3日アクセスしていないエントリを1つ想起\n"
        "  E) kaizen-logで検証期限は未到来だが2週間動いていない項目があればメモ"
        "（**v1.2強制**: `head -60 memory/kaizen_tracker.md` 等で kaizen_tracker.md を"
        "実際に開き、該当項目を直読した根拠として走査結果（ID+状態の列、先頭20行まで）を"
        "staging に貼付する。結果が空でも空のまま貼る。未走査のまま『該当なし』は禁止）\n"
        "**v1.1+v1.2強制化**: A〜E の **5カテゴリ全てに必ず1文** 書く。該当なしの場合も"
        "『該当なし（走査済み: 根拠）』と明記して飛ばさない。未走査のまま持ち越しは禁止。"
        "B/Eカテゴリは走査コマンド実行結果の貼付必須（v1.2, 2026-04-20 kaizen #093 本体反映）。"
        "Phase 2の判断材料を欠損させないための構造強制（2026-04-18 21:17 第2発動で"
        "Eカテゴリ未走査持ち越しが発生 → feedback_empty_cycle_rule.md 改善案）。\n"
        "新着がないほど進捗が進むサイクルにする——これが新着ゼロサイクルの存在意義。\n"
        f"\nPre-check結果:\n{alert_block}"
    )


def build_phase2_prompt():
    return (
        "Log Phase 2 (Analyze): log/cycle_staging_log.mdを読み、Phase 1で集めた情報を深く分析。\n"
        "1) #nao-uの新URLに対する自分の反応を形成し#all-nao-u-labに投稿"
        "（1件ずつ別メッセージ。ルール8: 他者の反応を読む前に自分の視点を持つ）\n"
        "2) shared-readsに値する分析があれば#shared-readsに投稿"
        "（Nao_uの指示: 「なるべく詳細な記述と分析を。将来のアイデアの種につなげる"
        "大事な外部入力。1フェーズ丸ごと使ってもいいくらい重要」）\n"
        "3) external_notes_log.mdの未統合エントリ1-2件を日記やbeliefsに接続し"
        "[統合済 YYYY-MM-DD]マーカーを付ける\n"
        "4) 分析結果をlog/cycle_staging_log.mdのPhase 2セクションに追記\n"
        f"\n{SLACK_RULES}"
    )


def build_phase3_prompt():
    return (
        "Log Phase 3 (Act): log/cycle_staging_log.mdを読み、改善を実行。日記は書かない。\n"
        "1) Slackで返信すべきものに返信（Phase 1のリストに基づく）\n"
        "2) 改善サイクル: 検討→適用→#kaizen-logに書く（検証ファースト原則: "
        "新しい改善を提案する前に直近の未検証提案の検証結果を埋める）\n"
        "3) [他インスタンス洞察]があれば: 該当プロジェクトファイルに考察と次の一手を追記\n"
        "4) Activeプロジェクト(projects/INDEX.md)に関係する変化があれば更新\n"
        "5) 【空サイクル時】Phase 1が『## 深掘り候補』を書いていたら、その中から"
        "1-2件を今サイクルで実際に動かす（小さく1mmでよい。選んだ理由と結果をstagingに記録）\n"
        "6) **Phase 4で完遂する大作業を1つ決める**。staging に "
        "`## 次フェーズの大作業` 節を追加し、以下を明記:\n"
        "   - タイトル（何をやるか1行）\n"
        "   - 完遂の定義（Phase 4終了時に何が成立していれば完了か。観測可能な条件で）\n"
        "   - 着手手順（最初の1手と、想定する手順を箇条書き）\n"
        "   - 選んだ理由（なぜこれを最優先にするか）\n"
        "   選定基準: Active project の停滞解消／Nao_u指摘の同型再発防止／"
        "kaizen未検証提案の検証／ゲーム実装の1スプリント分など、"
        "30分で「進んだ」と言える粒度。Slack投稿1本で済むものは大作業ではない。\n"
        "7) アクション結果をlog/cycle_staging_log.mdのPhase 3セクションに追記\n"
        f"\n{SLACK_RULES}"
    )


def build_phase4_prompt():
    return (
        "Log Phase 4 (Execute): log/cycle_staging_log.md の `## 次フェーズの大作業` 節を読み、"
        "Phase 3で決めた1作業を完遂する。日記は絶対に書かない（日記はPhase 5）。\n"
        "1) staging の `## 次フェーズの大作業` を最初に読み、タイトル・完遂の定義・手順を確認\n"
        "2) 着手。途中で別の作業に逸れない。1作業に集中する\n"
        "3) 完遂の定義に到達するまで進める。到達できなければ "
        "『どこまで到達したか／残りは何か／次サイクルで継続する場合の手順』を記録\n"
        "4) 副産物（新規/変更ファイル、Slack投稿、kaizenエントリ等）を staging の"
        "Phase 4セクションに列挙\n"
        "5) commit はしない（git push は Phase 5 で日記とまとめて行う）\n"
        "※Slack返信や小さな改善は Phase 3 で処理済みのはず。Phase 4 で増やさない。\n"
        f"\n{SLACK_RULES}"
    )


def build_phase5_prompt():
    return (
        "Log Phase 5 (Diary): log/cycle_staging_log.mdを全て読み、サイクルの締めくくり。\n"
        "1) #logに活動日記を書く。温度の残る長文で。外部の新情報も交える。"
        "1行報告に成り下がらない。Phase 4 で完遂した大作業の経緯と結論も含める\n"
        "2) 日記の最後に「次回起動時にやること」を書く"
        "（Nao_u 2026-04-05指示: 日記の文脈で「なぜそれをやるか」の温度を残す。"
        "他インスタンスやNao_uからも次のアクションが見えるように）\n"
        "3) このサイクルで書き込んだメモリファイルを全てリストアップし、"
        "「Nao_uが読んで理解できるか」「未来の自分が文脈なしで行動を変えられるか」チェック\n"
        "4) git add + commit + push（書いたらすぐpush）。"
        "**game/ 配下を編集した場合は明示的に `git add game/` を含めること** "
        "(5/25 ゲーム消失再発防止 / kaizen #134 family hook)\n"
        f"\n{SLACK_RULES}"
    )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--phase", type=int, help="Run only this phase (1-5)")
    args = parser.parse_args()

    log("[multi_phase] === マルチフェーズサイクル開始 ===")
    total_start = time.time()

    # Pre-checks (always run)
    alerts = run_prechecks()
    weekly_flag = run_periodic_checks()
    init_staging(alerts, weekly_flag)
    alert_block = "\n".join(alerts)
    if weekly_flag:
        alert_block += f"\n{weekly_flag}"

    # Determine which phases to run
    phases = [args.phase] if args.phase else [1, 2, 3, 4, 5]

    results = {}
    for p in phases:
        if p == 1:
            prompt = build_phase1_prompt(alert_block)
        elif p == 2:
            prompt = build_phase2_prompt()
        elif p == 3:
            prompt = build_phase3_prompt()
        elif p == 4:
            prompt = build_phase4_prompt()
        elif p == 5:
            prompt = build_phase5_prompt()
        else:
            log(f"[multi_phase] Unknown phase: {p}")
            continue

        ok = run_phase(p, ["Gather", "Analyze", "Act", "Execute", "Diary"][p - 1],
                       prompt, PHASE_TIMEOUTS[p])
        results[p] = ok

        # If a phase fails, continue to next (Mir pattern: don't abort the whole cycle)
        if not ok:
            log(f"[multi_phase] Phase {p} failed, continuing to next phase")

        # kaizen #136 段階2 hook: Phase 1 完了直後に URL 既応答チェックを構造強制
        # Phase 1 §1 に書かれた #nao-u の新URL を 3 経路 grep し、ヒットすれば WARN 注入。
        # Phase 2 が staging を読む前に走らせる必要がある。
        # 段階1.5 (C308 Phase 4): 同一 hook で arxiv ID 軸も並列発火 = URL/arxiv family 統合。
        if p == 1:
            try:
                hook_script = REPO_DIR / "tools" / "check_url_response_coverage.py"
                kwargs = dict(
                    capture_output=True, text=True, timeout=60,
                    cwd=str(REPO_DIR), encoding="utf-8", errors="replace",
                )
                if _CREATION_FLAGS:
                    kwargs["creationflags"] = _CREATION_FLAGS
                r = subprocess.run(
                    [sys.executable, str(hook_script),
                     "--from-staging", str(STAGING_FILE), "--apply"],
                    **kwargs,
                )
                stdout_lines = (r.stdout or "").splitlines()
                fired = sum(1 for ln in stdout_lines if ln.startswith("[既応答 WARN]"))
                fired_arxiv = sum(1 for ln in stdout_lines if ln.startswith("[既出 ARXIV WARN]"))
                log(f"[multi_phase] kaizen #136 hook: exit={r.returncode} fired={fired} fired_arxiv={fired_arxiv}")
            except Exception as e:
                log(f"[multi_phase] kaizen #136 hook error: {e}")

    total_elapsed = time.time() - total_start
    summary = " ".join(f"P{p}={'OK' if ok else 'FAIL'}" for p, ok in results.items())
    log(f"[multi_phase] === マルチフェーズサイクル完了 ({total_elapsed:.0f}s) {summary} ===")

    # 層A: サイクル末尾チェック（add/done/skip=0でpending残→#logに警告）
    # Mir C126 設計合意 2026-04-26 / Log接合 同日。Mir版 autonomous_cycle.sh と対称。
    # 全フェーズ通過時のみ実行（--phase 単独指定時はスキップ＝デバッグノイズ防止）
    if not args.phase:
        try:
            log("[multi_phase] 層A check_cycle 開始")
            kwargs = dict(
                capture_output=True, text=True, timeout=15,
                cwd=str(REPO_DIR), encoding="utf-8", errors="replace",
            )
            if _CREATION_FLAGS:
                kwargs["creationflags"] = _CREATION_FLAGS
            r = subprocess.run(
                [sys.executable, str(REPO_DIR / "next_tasks.py"),
                 "--instance", "log", "check_cycle"],
                **kwargs,
            )
            log(f"[multi_phase] 層A check_cycle 完了 (exit={r.returncode}) {r.stdout.strip()[:200]}")
        except Exception as e:
            log(f"[multi_phase] 層A check_cycle 失敗: {e}")


if __name__ == "__main__":
    main()
