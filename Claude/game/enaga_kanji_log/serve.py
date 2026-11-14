"""エナガの かんじの森 をローカル配信する（Windows でも .js / .mjs を正しい MIME で返す）。
使い方: python serve.py [port]  → http://127.0.0.1:8766/
GitHub Pages ではこのスクリプトは不要。
"""
import functools
import http.server
import pathlib
import sys

port = int(sys.argv[1]) if len(sys.argv) > 1 else 8766
root = pathlib.Path(__file__).resolve().parent
Handler = functools.partial(http.server.SimpleHTTPRequestHandler, directory=str(root))
Handler.func.extensions_map.update({".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml"})
print(f"http://127.0.0.1:{port}/")
http.server.ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()
