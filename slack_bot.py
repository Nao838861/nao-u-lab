"""
slack_bot.py — Slack投稿・読み取りの共通モジュール

.envからトークンを読み、Slack APIを呼ぶ。
"""

import os
import json
from pathlib import Path
from urllib import request, error, parse

ENV_FILE = Path(__file__).parent / ".env"


def _load_token():
    """Load SLACK_BOT_TOKEN from .env"""
    if ENV_FILE.exists():
        with open(ENV_FILE, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line.startswith("SLACK_BOT_TOKEN=") and not line.startswith("#"):
                    return line.split("=", 1)[1].strip()
    return os.environ.get("SLACK_BOT_TOKEN")


def _api_call(method, data=None):
    """Call Slack API"""
    token = _load_token()
    if not token:
        raise RuntimeError("SLACK_BOT_TOKEN not found in .env")

    url = f"https://slack.com/api/{method}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json; charset=utf-8",
    }

    if data:
        body = json.dumps(data).encode("utf-8")
    else:
        body = None

    req = request.Request(url, data=body, headers=headers, method="POST")
    try:
        with request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read().decode("utf-8"))
            return result
    except error.HTTPError as e:
        return {"ok": False, "error": f"HTTP {e.code}"}
    except Exception as e:
        return {"ok": False, "error": str(e)}


def _normalize_for_dedup(text):
    """重複判定用にテキストを正規化。全角/半角・ダッシュ変種・空白を統一する。

    claude --printが微妙に異なる文面で同じ内容を再投稿する問題への対策として、
    ダッシュ類・句読点の微差を完全に吸収する（2026-03-25 Mir修正）。
    """
    import unicodedata
    import re
    t = unicodedata.normalize("NFKC", text)
    # em dash / en dash / horizontal bar / ハイフン等を削除（置換ではなく削除して微差を吸収）
    t = re.sub(r"[\u2012\u2013\u2014\u2015\u2500\uff0d\-]+", "", t)
    # 連続空白を単一スペースに
    t = re.sub(r"\s+", " ", t).strip()
    return t


def _local_dedup_check(channel, text):
    """ローカルファイルベースの重複チェック（API race condition対策）

    conversations.history APIは投稿直後に反映されないことがあるため、
    ローカルキャッシュで補完する。冒頭80文字のハッシュ+チャンネルで判定。
    Unicode正規化(NFKC)+ダッシュ削除で微差による重複すり抜けを防止。
    80文字に短縮: 同一内容の再生成で冒頭80文字が一致する別メッセージが30分以内に来ることはまずない。
    """
    import time
    import hashlib
    cache_file = Path(__file__).parent / ".diary_dedup_cache.json"
    normalized = _normalize_for_dedup(text)
    key = hashlib.md5(f"{channel}:{normalized[:80]}".encode("utf-8")).hexdigest()
    now = time.time()

    # キャッシュ読み込み
    cache = {}
    if cache_file.exists():
        try:
            with open(cache_file, "r", encoding="utf-8") as f:
                cache = json.load(f)
        except Exception:
            cache = {}

    # 期限切れエントリを削除（重複ガード窓の2倍=60分超）
    cache = {k: v for k, v in cache.items() if now - v < 3600}

    # 重複チェック（kaizen #095: 300s→1800s に拡張）
    if key in cache and now - cache[key] < 1800:
        return True  # 重複

    # 記録して保存
    cache[key] = now
    try:
        with open(cache_file, "w", encoding="utf-8") as f:
            json.dump(cache, f)
    except Exception:
        pass
    return False


def post_message(channel, text, thread_ts=None):
    """チャンネルにメッセージを投稿（thread_ts指定でスレッド返信）

    長文（500文字以上）の投稿には30分間の重複防止ガードが適用される（kaizen #095）。
    ローカルキャッシュ（race condition対策）+ API履歴の二重チェック。
    """
    # 長文投稿の重複ガード（日記の二重投稿防止）
    if len(text) >= 500 and not thread_ts:
        # Phase 1: ローカルキャッシュで即時チェック（race condition対策）
        if _local_dedup_check(channel, text):
            return {"ok": True, "skipped": True,
                    "message": "Duplicate diary post detected (local cache), skipped"}
        # Phase 2: API履歴でも確認（別セッションからの重複検出）
        try:
            recent = _api_call("conversations.history", {
                "channel": channel, "limit": 3
            })
            if recent.get("ok"):
                import time
                now = time.time()
                for msg in recent.get("messages", []):
                    msg_ts = float(msg.get("ts", "0"))
                    # 30分以内の投稿をチェック（kaizen #095: 300s→1800s）
                    if now - msg_ts > 1800:
                        continue
                    msg_text = msg.get("text", "")
                    # 冒頭80文字が一致 → 重複と判断（正規化後に比較、微差を吸収）
                    if len(msg_text) >= 500 and _normalize_for_dedup(msg_text)[:80] == _normalize_for_dedup(text)[:80]:
                        return {"ok": True, "skipped": True,
                                "message": "Duplicate diary post detected (API), skipped"}
        except Exception:
            pass  # ガードのエラーは投稿をブロックしない

    data = {"channel": channel, "text": text}
    if thread_ts:
        data["thread_ts"] = thread_ts
    return _api_call("chat.postMessage", data)


def list_channels():
    """チャンネル一覧を取得"""
    return _api_call("conversations.list", {"types": "public_channel"})


def get_history(channel, limit=10):
    """チャンネルの直近メッセージを取得"""
    return _api_call("conversations.history", {"channel": channel, "limit": limit})


def create_channel(name):
    """チャンネルを作成"""
    return _api_call("conversations.create", {"name": name})


def auth_test():
    """認証テスト"""
    return _api_call("auth.test")


def _resolve_channel(name):
    """チャンネル名からIDを解決"""
    channels = list_channels()
    if isinstance(channels, dict) and 'channels' in channels:
        for ch in channels['channels']:
            if ch['name'] == name:
                return ch['id']
    return name  # IDがそのまま渡された場合


if __name__ == "__main__":
    import sys, io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

    # 認証テスト
    result = auth_test()
    if result.get("ok"):
        print(f"Auth OK: {result.get('user')} @ {result.get('team')}")
    else:
        print(f"Auth FAILED: {result.get('error')}")
        sys.exit(1)

    args = sys.argv[1:]
    if len(args) >= 3 and args[0] == "post":
        channel_name = args[1]
        text = " ".join(args[2:])
        channel_id = _resolve_channel(channel_name)
        result = post_message(channel_id, text)
        if result.get("ok"):
            print(f"Posted to #{channel_name}")
        else:
            print(f"Post FAILED: {result.get('error')}")
    elif len(args) >= 2 and args[0] == "history":
        channel_name = args[1]
        limit = int(args[2]) if len(args) > 2 else 10
        channel_id = _resolve_channel(channel_name)
        result = get_history(channel_id, limit)
        if isinstance(result, dict) and 'messages' in result:
            for m in reversed(result['messages']):
                print(m.get('text', '')[:200])
                print('---')
    elif len(args) >= 1 and args[0] == "list":
        channels = list_channels()
        if isinstance(channels, dict) and 'channels' in channels:
            for ch in channels['channels']:
                print(f"{ch['id']} {ch['name']}")
