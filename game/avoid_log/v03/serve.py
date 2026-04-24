"""avoid_log_02 ローカルサーバー。
index.html を配信し、リプレイJSONを replays/human/ に自動保存する。

使い方:
    python serve.py
    → http://localhost:8002 でプレイ。ゲームオーバーごとにリプレイが自動累積。
"""
import http.server
import json
from datetime import datetime
from pathlib import Path

PORT = 8002
BASE = Path(__file__).parent
HUMAN_DIR = BASE / "replays" / "human"
HUMAN_DIR.mkdir(parents=True, exist_ok=True)


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(BASE), **kwargs)

    def do_POST(self):
        if self.path == "/save-replay":
            length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(length)
            try:
                data = json.loads(body)
                ts = datetime.now().strftime("%Y%m%d_%H%M%S")
                score = data.get("summary", {}).get("score", 0)
                surv = data.get("summary", {}).get("survival_s", 0)
                fname = f"human_{ts}_{surv:.1f}s_{score}pt.json"
                out = HUMAN_DIR / fname
                out.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"ok": True, "file": fname}).encode())
                print(f"  Replay saved: {fname}")
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(str(e).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def log_message(self, format, *args):
        if "/save-replay" in str(args):
            return  # POST は上で print 済み
        super().log_message(format, *args)


if __name__ == "__main__":
    with http.server.HTTPServer(("", PORT), Handler) as s:
        print(f"avoid_log_02 server: http://localhost:{PORT}")
        print(f"Replays → {HUMAN_DIR}/")
        s.serve_forever()
