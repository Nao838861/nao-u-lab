"""Simple HTTP server for shot_log v01. Open http://localhost:8003 or http://localhost:8003/?ai=1"""
import http.server, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
print("shot_log v01 server: http://localhost:8003")
print("AI mode: http://localhost:8003/?ai=1")
http.server.HTTPServer(('',8003),http.server.SimpleHTTPRequestHandler).serve_forever()
