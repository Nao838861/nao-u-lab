#!/usr/bin/env python3
"""trace_recorder.py — Pot行動痕跡層 最小実装（雛形）

C73 (2026-04-17 Mir) で仕様md→実装の1歩目として作成。
projects/pot_dev.md「Pot #012 行動痕跡層 最小仕様」セクション参照。

目的: プレイ時に「自己報告を介さない行動の事実」をJSON Lines形式で記録する。
評価時にgrep/jqで離脱点・滞在時間・クリック分布等を機械的に抽出できる。

最小スコープ（C73）:
    - 3イベント型のみ: session_start / click / session_end
    - 共通フィールド: ts(ISO8601 UTC), session_id(UUID8), pot_id, event_type, elapsed_ms
    - 保存先: game/Pot/{pot_id}/logs/{player}/trace_{YYYYMMDD_HHMMSS}_{session_id}.jsonl
    - player: CLAUDECODE環境変数があれば"ai"、なければ"human"（自動判定）
    - UIへの組み込みは別タスク（まず単独で動かす）

拡張（2026-04-17 Ash, Nao_u 要件「リプレイ再生可能なログ」への応答）:
    - session_start に random_seed を含める（省略時は time ベースで自動生成＋固定）
    - input / state イベント追加: CLIポットでのキー入力・状態遷移を記録
    - replay モジュール（replay_session.py）が seed+input を読み直して決定論的再生

拡張予定（別サイクル）:
    - scroll / key / idle / visibility イベント（Web）
    - 既存 pot_playlog.py との統合（同session_idで突合、or 片方廃止）

使い方（CLI Pot から）:
    from trace_recorder import TraceRecorder
    rec = TraceRecorder(pot_id="014_roll")
    random.seed(rec.seed)           # ← 決定論化
    rec.input("k", label="keep")    # キー入力を記録
    rec.state("kept", value=3)      # ゲーム状態遷移を記録
    rec.end()
"""

import json
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path


class TraceRecorder:
    """Pot行動痕跡の最小ロガー。

    1セッション = 1 JSON Linesファイル。1行 = 1イベント。
    ファイルは __init__ 時に作成され、session_start を即書き込む。
    end() で session_end を書き、ファイルをクローズする。
    """

    def __init__(self, pot_id: str, base_dir: str | None = None,
                 seed: int | None = None, author: str = "") -> None:
        self.pot_id = pot_id
        self.author = author
        is_ai = bool(os.environ.get("CLAUDECODE"))
        self.is_human = not is_ai
        self.player = "ai" if is_ai else "human"
        self.session_id = uuid.uuid4().hex[:8]
        self.t0 = datetime.now(timezone.utc)

        # 決定論的リプレイ用の seed。未指定なら時刻由来で生成して固定。
        # ゲーム側は random.seed(rec.seed) を呼ぶ責務を持つ。
        if seed is None:
            seed = int(self.t0.timestamp() * 1000) & 0x7FFFFFFF
        self.seed = seed

        # パス構築: game/Pot/{pot_id}/logs/{player}/trace_{YYYYMMDD_HHMMSS}_{sid}.jsonl
        # CLAUDECODE環境変数の有無で自動判定。素の端末から実行すればhuman側に落ちる。
        if base_dir is None:
            base_dir = os.path.dirname(os.path.abspath(__file__))
        log_dir = Path(base_dir) / pot_id / "logs" / self.player
        log_dir.mkdir(parents=True, exist_ok=True)

        ts_compact = self.t0.strftime("%Y%m%d_%H%M%S")
        self.log_path = log_dir / f"trace_{ts_compact}_{self.session_id}.jsonl"

        # セッションファイルを追記モードで開く（プロセス中は保持）
        self._fh = open(self.log_path, "a", encoding="utf-8")
        self._closed = False

        # 人間プレイ時は author を上書き（detect_instance()はLog/Mir/Ashを返すため）。
        logged_author = "Nao_u" if self.is_human else self.author
        self._write_event("session_start", {
            "random_seed": self.seed,
            "author": logged_author,
            "player": self.player,
        })

    def _now_iso(self) -> str:
        return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.") + \
            f"{datetime.now(timezone.utc).microsecond // 1000:03d}Z"

    def _elapsed_ms(self) -> int:
        return int((datetime.now(timezone.utc) - self.t0).total_seconds() * 1000)

    def _write_event(self, event_type: str, payload: dict) -> None:
        if self._closed:
            return
        event = {
            "ts": self._now_iso(),
            "session_id": self.session_id,
            "pot_id": self.pot_id,
            "event_type": event_type,
            "elapsed_ms": self._elapsed_ms(),
        }
        event.update(payload)
        try:
            self._fh.write(json.dumps(event, ensure_ascii=False) + "\n")
            self._fh.flush()
        except OSError:
            # ゲームをクラッシュさせない
            pass

    def click(self, x: int, y: int, target: str = "") -> None:
        """クリック/タップイベント。座標と対象要素を記録。"""
        self._write_event("click", {"x": x, "y": y, "target": target})

    def input(self, key: str, label: str = "") -> None:
        """CLIキー入力。replay_session.py が key を順次再生する。
        label はゲーム側の意味づけ（例: "keep" / "reroll"）。省略可。"""
        self._write_event("input", {"key": key, "label": label})

    def state(self, name: str, **fields) -> None:
        """ゲーム状態の変化。リプレイ検証時に突合する。"""
        payload = {"name": name}
        payload.update(fields)
        self._write_event("state", payload)

    def end(self) -> None:
        """セッション終了。session_endを書いてファイルを閉じる。"""
        if self._closed:
            return
        self._write_event("session_end", {})
        try:
            self._fh.close()
        except OSError:
            pass
        self._closed = True


if __name__ == "__main__":
    # 最小動作確認: 3イベント書いて閉じる
    import time

    rec = TraceRecorder(pot_id="000_trace_demo")
    print(f"[trace_recorder] session_id={rec.session_id}")
    print(f"[trace_recorder] log_path={rec.log_path}")

    time.sleep(0.1)
    rec.click(x=120, y=80, target="btn_start")
    time.sleep(0.15)
    rec.click(x=300, y=200, target="card_3")
    rec.end()

    # 書き出し確認
    print("\n--- contents ---")
    with open(rec.log_path, "r", encoding="utf-8") as f:
        for line in f:
            print(line.rstrip())
