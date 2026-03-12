# -*- coding: utf-8 -*-
"""
Claude Code の .jsonl セッションファイルを人間が読める対話ログに変換する。
Usage: python export_dialogues.py
"""

import json
import os
import sys
import io
import glob
from datetime import datetime

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

JSONL_DIR = os.path.expanduser("~/.claude/projects/D--AI-Nao-u-BOT")
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "対話ログ")

os.makedirs(OUTPUT_DIR, exist_ok=True)


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
                    # ツール呼び出しは簡潔に記録
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

            # system-reminder等のタグを除去（対話の本質を残す）
            import re
            text = re.sub(r"<system-reminder>.*?</system-reminder>", "", text, flags=re.DOTALL)
            text = re.sub(r"<local-command-caveat>.*?</local-command-caveat>", "", text, flags=re.DOTALL)
            text = re.sub(r"<local-command-stdout>.*?</local-command-stdout>", "", text, flags=re.DOTALL)
            text = re.sub(r"<command-name>.*?</command-name>", "", text, flags=re.DOTALL)
            text = re.sub(r"<command-message>.*?</command-message>", "", text, flags=re.DOTALL)
            text = re.sub(r"<command-args>.*?</command-args>", "", text, flags=re.DOTALL)
            text = re.sub(r"<available-deferred-tools>.*?</available-deferred-tools>", "", text, flags=re.DOTALL)
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
    jsonl_files = glob.glob(os.path.join(JSONL_DIR, "*.jsonl"))
    if not jsonl_files:
        print("対話ファイルが見つかりません")
        return

    for filepath in sorted(jsonl_files, key=os.path.getmtime):
        session_id, dialogue = process_jsonl(filepath)
        if len(dialogue) < 2:
            continue

        mtime = os.path.getmtime(filepath)
        date_prefix = datetime.fromtimestamp(mtime).strftime("%Y%m%d_%H%M")
        output_name = f"{date_prefix}_{session_id[:8]}.md"
        output_path = os.path.join(OUTPUT_DIR, output_name)

        formatted = format_dialogue(session_id, dialogue, mtime)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(formatted)

        msg_count = len(dialogue)
        print(f"  {output_name} ({msg_count} messages)")

    print(f"\n完了: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
