"""Extract full session dialogues with code changes preserved."""
import json, os, sys

def extract_text_from_content(content):
    """Extract text and tool calls from message content."""
    if isinstance(content, str):
        return content.strip()
    if not isinstance(content, list):
        return str(content).strip() if content else ''

    parts = []
    for c in content:
        if not isinstance(c, dict):
            if isinstance(c, str):
                parts.append(c)
            continue
        ctype = c.get('type', '')
        if ctype == 'text':
            parts.append(c.get('text', ''))
        elif ctype == 'tool_use':
            name = c.get('name', '')
            inp = c.get('input', {})
            if name == 'Write':
                fp = inp.get('file_path', '?')
                cont = inp.get('content', '')
                if len(cont) <= 600:
                    parts.append(f'[Write: {fp}]\n```\n{cont}\n```')
                else:
                    parts.append(f'[Write: {fp} ({len(cont)} chars)]\n```\n{cont[:400]}\n... (省略) ...\n{cont[-150:]}\n```')
            elif name == 'Edit':
                fp = inp.get('file_path', '?')
                old = inp.get('old_string', '')
                new = inp.get('new_string', '')
                if len(old) + len(new) <= 800:
                    parts.append(f'[Edit: {fp}]\n旧:\n```\n{old}\n```\n新:\n```\n{new}\n```')
                else:
                    parts.append(f'[Edit: {fp}]\n旧:\n```\n{old[:300]}...\n```\n新:\n```\n{new[:400]}...\n```')
            elif name == 'Bash':
                cmd = inp.get('command', '')
                if len(cmd) <= 300:
                    parts.append(f'[Bash: {cmd}]')
                else:
                    parts.append(f'[Bash: {cmd[:300]}...]')
            elif name == 'Read':
                fp = inp.get('file_path', '?')
                parts.append(f'[Read: {fp}]')
            elif name == 'Grep':
                parts.append(f'[Grep: pattern="{inp.get("pattern", "?")}" path={inp.get("path", "?")}]')
            elif name == 'Glob':
                parts.append(f'[Glob: {inp.get("pattern", "?")}]')
            elif name == 'Agent':
                parts.append(f'[Agent: {inp.get("description", "?")}]')
            else:
                parts.append(f'[{name}]')
        elif ctype == 'tool_result':
            # Include brief tool results for context
            result_content = c.get('content', '')
            if isinstance(result_content, list):
                for rc in result_content:
                    if isinstance(rc, dict) and rc.get('type') == 'text':
                        txt = rc.get('text', '')
                        if len(txt) <= 500:
                            parts.append(f'→ {txt}')
                        else:
                            parts.append(f'→ {txt[:400]}... (truncated)')
            elif isinstance(result_content, str) and len(result_content) <= 500:
                parts.append(f'→ {result_content}')
    return '\n'.join(p for p in parts if p.strip())


def process_session(path, out):
    """Process a single session file."""
    messages = []
    with open(path, 'r', encoding='utf-8', errors='replace') as f:
        for line in f:
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue

            mtype = obj.get('type', '')
            if mtype == 'user':
                msg = obj.get('message', {})
                raw_content = msg.get('content', '')
                # Distinguish real human input from tool results
                is_tool_result = False
                if isinstance(raw_content, list):
                    # If ALL items are tool_result, it's not human input
                    types = [c.get('type', '') for c in raw_content if isinstance(c, dict)]
                    if types and all(t == 'tool_result' for t in types):
                        is_tool_result = True
                    # If mix of text + tool_result, only keep the text parts
                    if not is_tool_result:
                        text_parts = [c.get('text', '') for c in raw_content
                                      if isinstance(c, dict) and c.get('type') == 'text']
                        text = '\n'.join(t for t in text_parts if t.strip())
                    else:
                        text = ''
                elif isinstance(raw_content, str):
                    text = raw_content
                else:
                    text = str(raw_content) if raw_content else ''
                text = text.strip()
                if text and len(text) > 3 and not is_tool_result:
                    if text.startswith('<system-reminder') or text.startswith('<local-command'):
                        continue
                    # Skip automated cycle prompts (but keep game-related ones)
                    if ('Phase 2 (Analyze)' in text or 'Slackレスポンスモード' in text) and \
                       not any(kw in text for kw in ['マリオ', 'game', 'ゲーム', 'コイン', 'ブロック', 'play.py']):
                        continue
                    messages.append(('USER', text))
            elif mtype == 'assistant':
                msg = obj.get('message', {})
                text = extract_text_from_content(msg.get('content', ''))
                if text and len(text) > 5:
                    messages.append(('AST', text))

    # Write with formatting
    user_count = 0
    for role, text in messages:
        if role == 'USER':
            user_count += 1
            out.write(f'\n{"=" * 80}\n')
            out.write(f'**Nao_u ({user_count}):**\n')
            out.write(f'{"=" * 80}\n')
            out.write(f'{text}\n\n')
        else:
            # Cap very long assistant blocks
            lines = text.split('\n')
            if len(lines) > 60:
                text = '\n'.join(lines[:40]) + f'\n\n... ({len(lines) - 45} lines 省略) ...\n\n' + '\n'.join(lines[-5:])
            out.write(f'**Ash:**\n{text}\n\n')

    return user_count, len(messages)


def main():
    sessions = [
        (r'C:\Users\owner\.claude\projects\D--AI-Nao-u-BOT\1c42588d-c71c-4099-8659-9e87bddc0fd7.jsonl',
         '2026-04-09 (ゲーム開発メインセッション)'),
        (r'C:\Users\owner\.claude\projects\D--AI-Nao-u-BOT\c74ed781-a28c-4902-8929-107a57e8adf6.jsonl',
         '2026-04-11 (AI改善+マップ精度向上)'),
    ]

    out_path = os.path.join(os.path.dirname(__file__), 'full_dev_dialogue.md')
    with open(out_path, 'w', encoding='utf-8') as out:
        out.write('# マリオクローン開発 全対話ログ\n\n')
        out.write('Nao_uとAsh(Win2)の直接対話を全て記録。\n')
        out.write('Nao_uの発言は一言も省略していない。\n')
        out.write('Ashのコード変更は [Write], [Edit], [Bash] で記録、主要なコードは展開。\n\n')
        out.write('※ 2026-04-04の初回実装セッション(Log+Nao_u on Win)はWin側のログにあり、\n')
        out.write('  このPCからはアクセスできない。gitコミット履歴とdevlog.mdに記録あり。\n\n')

        total_user = 0
        total_msg = 0
        for path, label in sessions:
            if not os.path.exists(path):
                out.write(f'## {label}\n\n(ファイルなし)\n\n---\n\n')
                continue
            size = os.path.getsize(path) // 1024
            out.write(f'## {label} ({size}KB)\n\n')
            u, m = process_session(path, out)
            total_user += u
            total_msg += m
            out.write(f'\n---\n\n')

        out.write(f'\n(Nao_u発言 計{total_user}件, 全メッセージ 計{total_msg}件)\n')

    fsize = os.path.getsize(out_path) // 1024
    print(f'Output: {out_path}')
    print(f'Size: {fsize}KB, Nao_u messages: {total_user}, Total: {total_msg}')


if __name__ == '__main__':
    main()
