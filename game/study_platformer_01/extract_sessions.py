"""Extract all Mario clone development session dialogues into a readable log."""
import json, os, glob, re
from datetime import datetime

BASE = r'C:\Users\owner\.claude\projects\D--AI-Nao-u-BOT'
KEYWORDS = ['study_platformer', 'mario_clone', 'platformer_kata', 'MarioGame',
            'core.py', 'play.py', 'tilemap', 'target_ai', 'Goomba', 'クリボー',
            'マリオ', 'renderer', 'hierarchical_ai', 'mario.c', 'kuribo',
            'MarioGBASample', 'Koopa', 'ノコノコ', 'キノコ', 'mushroom']

def extract_text(content):
    """Extract readable text from message content."""
    if isinstance(content, str):
        return content.strip()
    if isinstance(content, list):
        parts = []
        for c in content:
            if isinstance(c, dict):
                if c.get('type') == 'text':
                    parts.append(c.get('text', ''))
                elif c.get('type') == 'tool_use':
                    name = c.get('name', '')
                    inp = c.get('input', {})
                    if name == 'Write':
                        parts.append(f'[Write: {inp.get("file_path", "?")}]')
                    elif name == 'Edit':
                        parts.append(f'[Edit: {inp.get("file_path", "?")} old="{str(inp.get("old_string",""))[:60]}..."]')
                    elif name == 'Read':
                        parts.append(f'[Read: {inp.get("file_path", "?")}]')
                    elif name == 'Bash':
                        cmd = inp.get('command', '')[:120]
                        parts.append(f'[Bash: {cmd}]')
                    elif name == 'Grep':
                        parts.append(f'[Grep: {inp.get("pattern", "?")}]')
                    elif name == 'Glob':
                        parts.append(f'[Glob: {inp.get("pattern", "?")}]')
                    else:
                        parts.append(f'[{name}]')
                elif c.get('type') == 'tool_result':
                    pass  # Skip tool results (too verbose)
            elif isinstance(c, str):
                parts.append(c)
        return '\n'.join(p for p in parts if p.strip())
    return str(content).strip() if content else ''

def process_session(path):
    """Extract dialogue from a session file."""
    messages = []
    with open(path, 'r', encoding='utf-8', errors='replace') as f:
        for line in f:
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue

            msg_type = obj.get('type', '')
            timestamp = obj.get('timestamp', '')

            if msg_type == 'user':
                msg = obj.get('message', {})
                text = extract_text(msg.get('content', ''))
                # Skip system/hook messages
                if text and not text.startswith('<') and len(text) > 3:
                    messages.append(('user', timestamp, text))

            elif msg_type == 'assistant':
                msg = obj.get('message', {})
                text = extract_text(msg.get('content', ''))
                if text and len(text) > 10:
                    messages.append(('assistant', timestamp, text))

    return messages

def is_game_session(path):
    """Check if session is related to Mario clone development."""
    with open(path, 'r', encoding='utf-8', errors='replace') as f:
        # Check first 100KB
        sample = f.read(100000)
    return any(kw in sample for kw in KEYWORDS)

def main():
    # Find all relevant sessions
    all_files = []
    for path in glob.glob(os.path.join(BASE, '*.jsonl')):
        mtime = os.path.getmtime(path)
        dt = datetime.fromtimestamp(mtime)
        if dt < datetime(2026, 4, 3): continue
        if is_game_session(path):
            all_files.append((dt, path))

    # Add current session explicitly
    current = os.path.join(BASE, 'c74ed781-a28c-4902-8929-107a57e8adf6.jsonl')
    if os.path.exists(current):
        dt = datetime.fromtimestamp(os.path.getmtime(current))
        if (dt, current) not in all_files:
            all_files.append((dt, current))

    all_files.sort()

    output_path = os.path.join(os.path.dirname(__file__), 'full_session_log.md')

    with open(output_path, 'w', encoding='utf-8') as out:
        out.write('# マリオクローン開発 全セッション対話ログ\n')
        out.write('# 2026-04-04 〜 2026-04-11\n\n')
        out.write('抽出元: Claude Code セッションログ (.jsonl)\n')
        out.write('Nao_uの発言は **Nao_u:** で開始。Ashの作業は Ash: で開始。\n')
        out.write('ツール実行は [Write: path], [Edit: path], [Bash: cmd] 等で表記。\n\n')
        out.write('---\n\n')

        session_count = 0
        for dt, path in all_files:
            bn = os.path.basename(path)[:8]
            messages = process_session(path)

            if not messages:
                continue

            # Filter: only sessions with actual game-related user messages
            has_game_msg = False
            for role, ts, text in messages:
                if role == 'user' and any(kw in text for kw in KEYWORDS):
                    has_game_msg = True
                    break
            if not has_game_msg:
                # Check assistant messages too
                for role, ts, text in messages:
                    if role == 'assistant' and any(kw in text for kw in KEYWORDS):
                        has_game_msg = True
                        break
            if not has_game_msg:
                continue

            session_count += 1
            out.write(f'## セッション {session_count}: {dt.strftime("%Y-%m-%d %H:%M")} ({bn})\n\n')

            for role, ts, text in messages:
                if role == 'user':
                    # Clean up garbled text
                    if '\ufffd' in text and len(text) > 50:
                        # Try to salvage readable parts
                        clean = re.sub(r'[\ufffd]+[^\s]*', '', text)
                        if len(clean.strip()) < 20:
                            continue  # Skip mostly garbled messages
                        text = clean

                    out.write(f'**Nao_u:** {text}\n\n')
                else:
                    # Truncate very long assistant messages but keep key info
                    lines = text.split('\n')
                    if len(lines) > 30:
                        # Keep first 15 and last 5 lines
                        kept = lines[:15] + ['...（省略）...'] + lines[-5:]
                        text = '\n'.join(kept)
                    elif len(text) > 2000:
                        text = text[:2000] + '\n...（省略）...'

                    out.write(f'**Ash:** {text}\n\n')

            out.write('---\n\n')

        out.write(f'\n（全{session_count}セッション抽出完了）\n')

    print(f'Extracted {session_count} sessions to {output_path}')
    print(f'File size: {os.path.getsize(output_path)//1024}KB')

if __name__ == '__main__':
    main()
