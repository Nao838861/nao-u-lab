"""Run a Lua script headless in the local copy of the dedicated Mesen (runtime/), with the pinned SH mapper.

The ROM is not modified. Lua only supplies pad input and reads memory/screen.
usage: python tools/mesen_run.py script.lua [--timeout 1200]
"""
import argparse, os, subprocess, sys
from pathlib import Path

RT = Path(__file__).resolve().parent.parent / os.environ.get('SH_RUNTIME', 'runtime')
sys.path.insert(0, str(RT))
import launch  # noqa: E402  (the bundle's own launcher: hashes, mapper model, core protection)


def run(script: Path, timeout: int = 1200):
    env = {k: v for k, v in os.environ.items() if not k.upper().startswith('NES_GSU_')}
    env.update(NES_GSU_MAPPER=launch.MODEL, NES_GSU_CLOCK_HZ=launch.CLOCK)
    args = [str(launch.EXE), '--testRunner', f'--timeout={timeout}', '--doNotSaveSettings', '--enableStdout',
            str(launch.ROM), str(script.resolve())]
    with launch.protect_core():
        launch.verify_bundle()
        r = subprocess.run(args, cwd=RT, env=env, capture_output=True, timeout=timeout + 60,
                           creationflags=subprocess.CREATE_NO_WINDOW)
        launch.verify_bundle()  # the custom core must still be the pinned one after the run
    return r


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('script', type=Path)
    p.add_argument('--timeout', type=int, default=1200)
    a = p.parse_args()
    r = run(a.script, a.timeout)
    print('exit', r.returncode)
    print(r.stdout.decode('utf-8', 'replace')[-3000:])
    print(r.stderr.decode('utf-8', 'replace')[-2000:])
