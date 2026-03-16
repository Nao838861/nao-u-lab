"""
browser_lock.py — ブラウザプロファイルの排他制御

.bot_profile を使うスクリプトは全てこのロックを取得してから起動する。
ロック中なら即スキップ（待たない）。
"""

import os
import time
from pathlib import Path

LOCK_FILE = Path(__file__).parent / ".browser.lock"
# ロックが古すぎる場合は強制解除（秒）
STALE_TIMEOUT = 180


def acquire():
    """ロック取得を試みる。成功=True、既にロック中=False"""
    # 古いロックファイルは強制解除
    if LOCK_FILE.exists():
        try:
            age = time.time() - LOCK_FILE.stat().st_mtime
            if age > STALE_TIMEOUT:
                LOCK_FILE.unlink()
            else:
                return False
        except Exception:
            return False

    try:
        # O_CREAT | O_EXCL でアトミックに作成（存在したら失敗）
        fd = os.open(str(LOCK_FILE), os.O_CREAT | os.O_EXCL | os.O_WRONLY)
        os.write(fd, str(os.getpid()).encode())
        os.close(fd)
        return True
    except FileExistsError:
        return False
    except Exception:
        return False


def release():
    """ロック解除"""
    try:
        LOCK_FILE.unlink(missing_ok=True)
    except Exception:
        pass
