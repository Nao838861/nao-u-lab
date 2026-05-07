#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Claude Code の .jsonl セッションファイルを人間が読める対話ログに変換する。
Mac / Windows 両対応。全プロジェクトディレクトリを自動検出する。

Usage:
  Mac:     /usr/bin/python3 export_dialogues.py
  Windows: python export_dialogues.py
"""

import json
import os
import sys
import io
import re
import glob
import platform
from datetime import datetime

if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "対話ログ")
os.makedirs(OUTPUT_DIR, exist_ok=True)


def find_jsonl_dirs():
    """全プロジェクトディレクトリからJSONLがある場所を自動検出する"""
    claude_dir = os.path.expanduser("~/.claude")
    dirs_with_jsonl = set()

    # プロジェクトディレクトリ内を探索
    projects_dir = os.path.join(claude_dir, "projects")
    if os.path.isdir(projects_dir):
        for entry in os.listdir(projects_dir):
            full = os.path.join(projects_dir, entry)
            if os.path.isdir(full):
                # 直下のJSONLを探す
                if glob.glob(os.path.join(full, "*.jsonl")):
                    dirs_with_jsonl.add(full)
                # サブエージェントのJSONLも探す（セッションID/subagents/内）
                for sub in glob.glob(os.path.join(full, "*/subagents")):
                    if glob.glob(os.path.join(sub, "*.jsonl")):
                        dirs_with_jsonl.add(sub)

    return sorted(dirs_with_jsonl)


def extract_text_from_content(content):
    """メッセージのcontentからテキストを抽出する"""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        texts = []
        for block in content:
            if isinstance(block, dict):
                if block.get("type") == "text":
                    texts.append(block.get("text", ""))
                elif block.get("type") == "tool_use":
                    tool = block.get("name", "?")
                    inp = block.get("input", {})
                    if tool == "Read":
                        texts.append(f"[ツール: {inp.get('file_path', '?')} を読む]")
                    elif tool == "Write":
                        texts.append(f"[ツール: {inp.get('file_path', '?')} を書く]")
                    elif tool == "Edit":
                        texts.append(f"[ツール: {inp.get('file_path', '?')} を編集]")
                    elif tool == "Bash":
                        cmd = inp.get("command", "?")
                        if len(cmd) > 80:
                            cmd = cmd[:77] + "..."
                        texts.append(f"[ツール: $ {cmd}]")
                    else:
                        texts.append(f"[ツール: {tool}]")
        return "\n".join(texts)
    return str(content)


# system-reminder等を除去するための正規表現（コンパイル済み）
STRIP_PATTERNS = [
    re.compile(r"<system-reminder>.*?</system-reminder>", re.DOTALL),
    re.compile(r"<local-command-caveat>.*?</local-command-caveat>", re.DOTALL),
    re.compile(r"<local-command-stdout>.*?</local-command-stdout>", re.DOTALL),
    re.compile(r"<command-name>.*?</command-name>", re.DOTALL),
    re.compile(r"<command-message>.*?</command-message>", re.DOTALL),
    re.compile(r"<command-args>.*?</command-args>", re.DOTALL),
    re.compile(r"<available-deferred-tools>.*?</available-deferred-tools>", re.DOTALL),
]


def process_jsonl(filepath):
    """1つの.jsonlファイルを処理して対話を抽出する"""
    dialogue = []
    session_id = os.path.basename(filepath).replace(".jsonl", "")

    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue

            msg_type = obj.get("type", "")
            if msg_type not in ("user", "assistant"):
                continue

            msg = obj.get("message", {})
            if not isinstance(msg, dict):
                continue

            role = msg.get("role", "")
            content = msg.get("content", "")
            text = extract_text_from_content(content)

            if not text.strip():
                continue

            for pattern in STRIP_PATTERNS:
                text = pattern.sub("", text)
            text = text.strip()

            if not text:
                continue

            # 直前と同じroleの場合はマージ
            if dialogue and dialogue[-1]["role"] == role:
                dialogue[-1]["text"] += "\n\n" + text
            else:
                dialogue.append({"role": role, "text": text})

    return session_id, dialogue


def format_dialogue(session_id, dialogue, file_mtime):
    """対話を読みやすいMarkdown形式にフォーマットする"""
    date_str = datetime.fromtimestamp(file_mtime).strftime("%Y-%m-%d %H:%M")
    lines = []
    lines.append(f"# 対話ログ — {date_str}")
    lines.append(f"セッションID: `{session_id}`\n")
    lines.append("---\n")

    for entry in dialogue:
        role = entry["role"]
        text = entry["text"]
        if role == "user":
            lines.append(f"## Nao_u\n")
        else:
            lines.append(f"## Claude\n")
        lines.append(text)
        lines.append("\n---\n")

    return "\n".join(lines)


def main():
    jsonl_dirs = find_jsonl_dirs()
    if not jsonl_dirs:
        print("JSONLディレクトリが見つかりません")
        print(f"探索先: ~/.claude/projects/")
        return

    print(f"検出したJSONLディレクトリ:")
    for d in jsonl_dirs:
        print(f"  {d}")
    print()

    exported = 0
    skipped = 0

    for jsonl_dir in jsonl_dirs:
        jsonl_files = glob.glob(os.path.join(jsonl_dir, "*.jsonl"))
        for filepath in sorted(jsonl_files, key=os.path.getmtime):
            session_id, dialogue = process_jsonl(filepath)
            if len(dialogue) < 2:
                continue

            mtime = os.path.getmtime(filepath)
            date_prefix = datetime.fromtimestamp(mtime).strftime("%Y%m%d_%H%M")
            output_name = f"{date_prefix}_{session_id[:8]}.md"
            output_path = os.path.join(OUTPUT_DIR, output_name)

            # 既にエクスポート済みで、ソースが更新されていなければスキップ
            if os.path.exists(output_path):
                existing_mtime = os.path.getmtime(output_path)
                if existing_mtime >= mtime:
                    skipped += 1
                    continue

            formatted = format_dialogue(session_id, dialogue, mtime)
            with open(output_path, "w", encoding="utf-8") as f:
                f.write(formatted)

            msg_count = len(dialogue)
            print(f"  {output_name} ({msg_count} messages)")
            exported += 1

    print(f"\n完了: {exported}件エクスポート, {skipped}件スキップ（変更なし）")
    print(f"出力先: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
