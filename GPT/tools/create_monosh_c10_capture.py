"""元プロジェクトを変更せず、C10背景録画用の独立コピーを作る。"""
import hashlib, json, re, shutil, subprocess
from pathlib import Path

SOURCE = Path('D:/HomeBrew/MonoSH')
DEST = Path('D:/temp/MonoSH_C10_background_capture')
assert not DEST.exists(), f'既存フォルダには上書きしません: {DEST}'
assert DEST.parent.resolve() == Path('D:/temp').resolve()

def digest(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

# 既存ROMとビルド入力を後で照合する。未コミットの編集もそのままコピー。
protected = list(SOURCE.rglob('*.nes'))
for directory in ['src', 'res', 'lib', 'sys', 'tools']:
    protected += [p for p in (SOURCE/directory).rglob('*') if p.is_file()]
protected += [SOURCE/'makefile']
before = {str(p.relative_to(SOURCE)): digest(p) for p in protected}
shutil.copytree(SOURCE, DEST, ignore=shutil.ignore_patterns('.git', 'build', 'tmp', '__pycache__', '.agents', '.vscode'))
(DEST/'source_hashes.json').write_text(json.dumps(before, indent=2), encoding='utf-8')

def replace_once(text, old, new):
    assert text.count(old) == 1, old
    return text.replace(old, new)

path = DEST/'src/game.c'
s = path.read_text(encoding='utf-8')
s = replace_once(s, '#define STAGE1_START_ADVANCE 128u', '#define STAGE1_START_ADVANCE 0u /* C10 capture */')
for old, new in [('INITIAL_PLAYER_Y       STAGE1_PLAYER_Y', 'INITIAL_PLAYER_Y       120u'),
                 ('INITIAL_TITLE_FRAMES   STAGE1_TITLE_FRAMES', 'INITIAL_TITLE_FRAMES   0u'),
                 ('INITIAL_TITLE_TIMER    STAGE1_TITLE_TIMER', 'INITIAL_TITLE_TIMER    0u'),
                 ('INITIAL_GROUND_OFFSET  STAGE1_GROUND_OFFSET', 'INITIAL_GROUND_OFFSET  14u')]:
    s = replace_once(s, old, new)
s = replace_once(s, '                update_enemy_spawn();', '                /* C10 capture: no enemies or boss transition. */')
s = replace_once(s, 'spawn_frame = ent->frame;\n            spawn_index = R00;', 'spawn_frame = 0;\n            spawn_index = 0; /* C10: repeat the late background section. */')
s = replace_once(s, 'if (player_stumble_timer == 0u &&\n                (trig_accum & BUTTON_A)', 'if (0 && player_stumble_timer == 0u &&\n                (trig_accum & BUTTON_A)')
s = replace_once(s, '            if (player_hit_pending != 0u) {', '            player_hit_pending = 0u; /* C10: background contact never interrupts capture. */\n            if (player_hit_pending != 0u) {')
s = replace_once(s, 'if ((trig_accum & BUTTON_START) &&', 'if (0 && (trig_accum & BUTTON_START) &&')
s = replace_once(s, '#define PLAYER_SHADOW_OAM_Y    209u', '#define PLAYER_SHADOW_OAM_Y    255u /* C10: hidden */')
s = replace_once(s, '"eor #$2E\\n"', '"lda #$FF\\n"')
path.write_text(s, encoding='utf-8')
path = DEST/'src/write_player_oam.s'
s = path.read_text(encoding='utf-8')
s = replace_once(s, '.proc _write_player_oam\n', '.proc _write_player_oam\n    rts ; C10 capture: retain camera input, hide player and shadow.\n')
path.write_text(s, encoding='utf-8')
path = DEST/'src/spawn_table_stage1.inc'
rows = []
for line in path.read_text(encoding='utf-8').splitlines():
    m = re.match(r'(\s*\{\s*)(\d+)(,.*)', line)
    if m and int(m[2]) >= 1009:
        rows.append(f'{m[1]}{int(m[2])-1008}{m[3]}')
assert 'BGOBJ_TYPE_TREE0' in rows[0] and 'BGOBJ_SPAWN_END' in rows[-1]
path.write_text('// C10 capture: original Stage 1 frames 1009..1950, rebased by 1008.\nstatic const BgobjSpawnEntry spawn_table[] = {\n'+'\n'.join(rows)+'\n};\n', encoding='utf-8')
(DEST/'build').mkdir()
with (DEST/'build.log').open('w', encoding='utf-8') as log:
    result = subprocess.run(['make', '-j2', 'TITLE=C10_background_only'], cwd=DEST, stdout=log, stderr=subprocess.STDOUT)
assert all(digest(SOURCE/p) == h for p,h in before.items()), '元プロジェクトの変更を検知'
assert result.returncode == 0, f'ビルド失敗: {DEST}/build.log'
rom = DEST/'build/C10_background_only.nes'
assert rom.read_bytes()[:4] == b'NES\x1a'
print(json.dumps({'rom': str(rom), 'sha256': digest(rom), 'protectedFiles': len(before), 'originalUnchanged': True}, indent=2))
