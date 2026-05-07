"""
tweet_login.py — EdgeからX.comのCookieをエクスポートする

1. Edgeで https://x.com にログイン済みの状態で実行する
2. EdgeのCookieデータベースからX.com用Cookieを読み取る
3. .x_cookies.json に保存する
4. 以後 tweet_poster.py から投稿できる

※ Edgeが開いていてもOK（コピーして読むため）
"""

import json
import shutil
import sqlite3
import tempfile
import os
from pathlib import Path

COOKIES_PATH = Path(__file__).parent / ".x_cookies.json"
EDGE_COOKIES_DB = Path(os.environ["LOCALAPPDATA"]) / "Microsoft" / "Edge" / "User Data" / "Default" / "Network" / "Cookies"


def export_cookies():
    if not EDGE_COOKIES_DB.exists():
        # Profileフォルダ名が違う可能性
        alt = Path(os.environ["LOCALAPPDATA"]) / "Microsoft" / "Edge" / "User Data" / "Default" / "Cookies"
        if alt.exists():
            db_path = alt
        else:
            print(f"Error: Edge Cookieデータベースが見つかりません")
            print(f"  試したパス: {EDGE_COOKIES_DB}")
            print(f"  試したパス: {alt}")
            return False
    else:
        db_path = EDGE_COOKIES_DB

    # ロック回避のためコピーして読む
    tmp = Path(tempfile.mktemp(suffix=".db"))
    shutil.copy2(db_path, tmp)

    try:
        conn = sqlite3.connect(str(tmp))
        cursor = conn.cursor()

        # X.com / Twitter.com のCookieを取得
        cursor.execute("""
            SELECT name, value, host_key, path, is_secure, expires_utc
            FROM cookies
            WHERE host_key LIKE '%x.com' OR host_key LIKE '%twitter.com'
        """)

        rows = cursor.fetchall()
        conn.close()

        if not rows:
            print("Error: X.com/Twitter.comのCookieが見つかりません。")
            print("Edgeで https://x.com にログインしてから再実行してください。")
            return False

        cookies = []
        for name, value, host, path, secure, expires in rows:
            cookies.append({
                "name": name,
                "value": value,
                "domain": host,
                "path": path,
                "secure": bool(secure),
                "expires": expires,
            })

        COOKIES_PATH.write_text(json.dumps(cookies, ensure_ascii=False, indent=2))
        print(f"X.comのCookieを {len(cookies)} 件エクスポートしました → {COOKIES_PATH}")
        return True

    finally:
        tmp.unlink(missing_ok=True)


if __name__ == "__main__":
    export_cookies()
