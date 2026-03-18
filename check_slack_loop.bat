@echo off
REM Slack新着チェックループ（Claude API消費なし）
REM タスクスケジューラで5分ごとに実行する想定
REM 新着があればclaude --printで起動

cd /d D:\AI\Nao_u_BOT

python -c "
import sys, json
sys.path.insert(0, '.')
import slack_bot

# 前回のタイムスタンプを読む
state_file = 'slack_check_state.json'
try:
    with open(state_file, 'r') as f:
        state = json.load(f)
    last_ts = state.get('last_ts', '0')
except:
    last_ts = '0'

# 最新メッセージを取得
r = slack_bot.get_history('C0ALWBRNJ66', 1)
if r.get('ok') and r.get('messages'):
    current_ts = r['messages'][0].get('ts', '0')
    if current_ts != last_ts:
        # 新着あり
        text = r['messages'][0].get('text', '')[:200]
        user = r['messages'][0].get('user', '')
        # 自分のbot投稿は無視
        if user != 'U0AM1F23FQU':
            print('NEW_MESSAGE')
            print(text)
            # タイムスタンプ更新
            with open(state_file, 'w') as f:
                json.dump({'last_ts': current_ts}, f)
            sys.exit(1)  # 新着あり=exit code 1
        else:
            # 自分の投稿→タイムスタンプだけ更新
            with open(state_file, 'w') as f:
                json.dump({'last_ts': current_ts}, f)
    # 新着なし=何もしない
"

if %ERRORLEVEL% EQU 1 (
    echo New Slack message detected, waking Claude...
    claude --print "Slackに新着メッセージがあります。確認して返信してください。" --allowedTools Bash,Read,Edit,Write,Glob,Grep
)
