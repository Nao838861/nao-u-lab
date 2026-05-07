#!/usr/bin/env python3
"""Slack Incoming Webhook経由でメッセージを投稿する"""
import json
import sys
import urllib.request
import os
from dotenv import load_dotenv

load_dotenv()

WEBHOOK_URL = os.getenv("SLACK_WEBHOOK_URL")

def post(text: str) -> bool:
    if not WEBHOOK_URL:
        print("SLACK_WEBHOOK_URL not set in .env")
        return False
    data = json.dumps({"text": text}).encode("utf-8")
    req = urllib.request.Request(
        WEBHOOK_URL,
        data=data,
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.read().decode() == "ok"
    except Exception as e:
        print(f"Slack post failed: {e}")
        return False

if __name__ == "__main__":
    msg = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else sys.stdin.read()
    if post(msg):
        print("Posted to Slack.")
    else:
        print("Failed.")
