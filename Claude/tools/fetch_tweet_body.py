#!/usr/bin/env python3
"""tools/fetch_tweet_body.py — C300 Phase 4 大作業

Phase 1/2 の Nao_u URL 反応時に本文未読推測反応を構造的に防ぐ。
api.fxtwitter.com JSON API 経路で tweet 本文を純 stdlib 取得する CLI ツール。

C300 Phase 2 §0 で確立した経路:
  - x.com 直叩き = 402 Payment Required (失敗)
  - WebSearch = 該当 tweet_id 検出不能 (失敗)
  - fxtwitter.com (HTML) = x.com に 302 リダイレクト (失敗)
  - api.fxtwitter.com (JSON) = ◯ (本サイクル確立)

使い方:
  # tweet_id 直指定
  python tools/fetch_tweet_body.py --tweet-id 2060219141794197775

  # URL から抽出
  python tools/fetch_tweet_body.py --from-url https://x.com/_reachsumit/status/2060219141794197775

  # smoke test (C300 Phase 1 §1 の 4 URL 巡回 PASS 確認)
  python tools/fetch_tweet_body.py --smoke-test

副作用ゼロ (read-only、ファイル書込なし、Slack 投稿なし)。
純 stdlib のみ (urllib.request / json / re / sys / argparse / pathlib)。

kaizen #139 段階3.5 family 接続点:
  次サイクル以降、multi_phase_cycle_log.py Pre-check 自動化レイヤーから
  本ツールを呼び出して URL 検出 → 本文取得 → 反応判定の閉ループ化候補。
"""
from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.error
import urllib.request

API_FXTWITTER_BASE = "https://api.fxtwitter.com"
USER_AGENT = "Mozilla/5.0 (fetch_tweet_body.py; C300)"
TIMEOUT_SEC = 15

STATUS_URL_RE = re.compile(
    r"(?:x\.com|twitter\.com|fxtwitter\.com)/[^/\s]+/status/(\d{15,20})"
)
DIGITS_ONLY_RE = re.compile(r"^\d{15,20}$")

SMOKE_TEST_IDS = [
    "2060219141794197775",  # URL1 _reachsumit RAISE
    "2062127152271872085",  # URL2 trtd6trtd MUSE-Autoskill
    "2062198531109093475",  # URL3 itarutomy MemForest
    "2062204469538881988",  # URL4 omarsar0 SkillOpt
]


def extract_status_id(url_or_id: str) -> str:
    """x.com / twitter.com / fxtwitter.com URL から status_id 抽出 + digit のみ入力対応"""
    s = url_or_id.strip()
    if DIGITS_ONLY_RE.match(s):
        return s
    m = STATUS_URL_RE.search(s)
    if m:
        return m.group(1)
    raise ValueError(f"status_id を抽出できない入力: {url_or_id!r}")


def fetch_tweet_json(status_id: str) -> dict:
    """api.fxtwitter.com から tweet JSON を取得

    正規エンドポイント: /status/<id> (id 単独パスは FxEmbed ホームページに 302)
    """
    url = f"{API_FXTWITTER_BASE}/status/{status_id}"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    with urllib.request.urlopen(req, timeout=TIMEOUT_SEC) as resp:
        body = resp.read().decode("utf-8")
    return json.loads(body)


def extract_text(resp_json: dict) -> str:
    """JSON から tweet.text を取り出す。欠落時 KeyError"""
    tweet = resp_json["tweet"]
    return tweet["text"]


def fetch_one(status_id: str) -> tuple[bool, str]:
    """1 件取得。(成功フラグ, テキスト or エラー文字列) を返す"""
    try:
        data = fetch_tweet_json(status_id)
        text = extract_text(data)
        return True, text
    except urllib.error.HTTPError as e:
        return False, f"HTTPError {e.code} {e.reason}"
    except urllib.error.URLError as e:
        return False, f"URLError {e.reason}"
    except (KeyError, json.JSONDecodeError) as e:
        return False, f"ParseError {type(e).__name__}: {e}"


def run_smoke_test() -> int:
    """C300 §1 の 4 URL 巡回 PASS 確認。全件成功で exit 0"""
    pass_count = 0
    for tid in SMOKE_TEST_IDS:
        ok, text = fetch_one(tid)
        if ok:
            pass_count += 1
            preview = text.replace("\n", " ")[:120]
            print(f"[PASS] tweet_id={tid} text={preview!r}")
        else:
            print(f"[FAIL] tweet_id={tid} err={text}")
    total = len(SMOKE_TEST_IDS)
    print(f"[SMOKE] {pass_count}/{total} PASS")
    return 0 if pass_count == total else 1


def main() -> int:
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    g = p.add_mutually_exclusive_group(required=True)
    g.add_argument("--tweet-id", help="status_id を直接指定")
    g.add_argument("--from-url", help="x.com / twitter.com / fxtwitter.com URL から抽出")
    g.add_argument("--smoke-test", action="store_true", help="C300 §1 4 URL 巡回 PASS 確認")
    args = p.parse_args()

    if args.smoke_test:
        return run_smoke_test()

    raw = args.tweet_id or args.from_url
    try:
        sid = extract_status_id(raw)
    except ValueError as e:
        print(f"[ERROR] {e}", file=sys.stderr)
        return 2

    ok, text = fetch_one(sid)
    if ok:
        print(text)
        return 0
    print(f"[ERROR] tweet_id={sid} {text}", file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())
