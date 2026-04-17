#!/usr/bin/env python3
"""trace_recorder.py — Pot行動痕跡層 最小実装（雛形）

C73 (2026-04-17 Mir) で仕様md→実装の1歩目として作成。
projects/pot_dev.md「Pot #012 行動痕跡層 最小仕様」セクション参照。

目的: プレイ時に「自己報告を介さない行動の事実」をJSON Lines形式で記録する。
評価時にgrep/jqで離脱点・滞在時間・クリック分布等を機械的に抽出できる。

最小スコープ（C73）:
    - 3イベント型のみ: session_start / click / session_end
    - 共通フィールド: ts(ISO8601 UTC), session_id(UUID8), pot_id, event_type, elapsed_ms
    - 保存先: game/Pot/{pot_id}/logs/trace_{YYYYMMDD_HHMMSS}_{session_id}.jsonl
    - UIへの組み込みは別タスク（まず単独で動かす）

拡張予定（別サイクル）:
    - scroll / key / idle / visibility イベント
    - 既存 pot_playlog.py との統合（同session_idで突合、or 片方廃止）

使い方:
    from trace_recorder import TraceRecorder

    rec = TraceRecorder(pot_id="012")
    rec.click(x=120, y=80, target="btn_start")
    rec.click(x=300, y=200, target="card_3")
    rec.end()  # session_endを書いてファイルを閉じる
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

    def __init__(self, pot_id: str, base_dir: str | None = None) -> None:
        self.pot_id = pot_id
        self.session_id = uuid.uuid4().hex[:8]
        self.t0 = datetime.now(timezone.utc)

        # パス構築: game/Pot/{pot_id}/logs/trace_{YYYYMMDD_HHMMSS}_{sid}.jsonl
        if base_dir is None:
            base_dir = os.path.dirname(os.path.abspath(__file__))
        log_dir = Path(base_dir) / pot_id / "logs"
        log_dir.mkdir(parents=True, exist_ok=True)

        ts_compact = self.t0.strftime("%Y%m%d_%H%M%S")
        self.log_path = log_dir / f"trace_{ts_compact}_{self.session_id}.jsonl"

        # セッションファイルを追記モードで開く（プロセス中は保持）
        self._fh = open(self.log_path, "a", encoding="utf-8")
        self._closed = False

        self._write_event("session_start", {})

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
