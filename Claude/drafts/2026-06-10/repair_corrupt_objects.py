"""C318 Phase 5: corrupt loose object repair (one-shot).

Recovers corrupt blobs from a known-good GPT_push_tmp clone, replacing
the corrupt loose object files. Idempotent.
"""
import os, subprocess, sys
sys.stdout.reconfigure(encoding='utf-8')

GIT_DIR = 'D:/AI/Nao_u_BOT/.git'
CLONE   = 'D:/AI/Nao_u_BOT/GPT_push_tmp_phase3b_admission_20260609'
REPO    = 'D:/AI/Nao_u_BOT/Claude'

def fsck_corrupt():
    r = subprocess.run(['git','fsck','--no-progress'], capture_output=True, text=True, cwd=REPO)
    out = r.stdout + r.stderr
    shas = set()
    for line in out.split('\n'):
        if 'corrupt loose object' in line:
            for tok in line.split():
                tok = tok.strip("'\"")
                if len(tok) == 40 and all(c in '0123456789abcdef' for c in tok):
                    shas.add(tok)
    return shas

def try_repair(sha):
    obj_path = os.path.join(GIT_DIR, 'objects', sha[:2], sha[2:])
    # Get type from clone
    t = subprocess.run(['git','-C',CLONE,'cat-file','-t',sha], capture_output=True, text=True)
    if t.returncode != 0:
        return False, f'not in clone'
    obj_type = t.stdout.strip()
    # Extract content from clone
    content = subprocess.run(['git','-C',CLONE,'cat-file',obj_type,sha], capture_output=True)
    if content.returncode != 0:
        return False, f'extract fail'
    # Remove corrupt loose
    if os.path.exists(obj_path):
        try:
            os.chmod(obj_path, 0o644)
            os.remove(obj_path)
        except Exception as e:
            return False, f'rm fail {e}'
    # Write fresh
    w = subprocess.run(['git','hash-object','-w','-t',obj_type,'--stdin'],
                       input=content.stdout, capture_output=True, cwd=REPO)
    if w.returncode == 0 and w.stdout.decode().strip() == sha:
        return True, 'ok'
    return False, f'write fail {w.stderr.decode()[:80]}'

if __name__ == '__main__':
    shas = fsck_corrupt()
    print(f'found {len(shas)} corrupt objects', flush=True)
    fixed = 0
    failed = []
    for sha in sorted(shas):
        ok, msg = try_repair(sha)
        if ok:
            fixed += 1
            print(f'  FIX {sha}', flush=True)
        else:
            failed.append((sha, msg))
            print(f'  FAIL {sha}: {msg}', flush=True)
    print(f'\nresult: fixed={fixed} failed={len(failed)}', flush=True)
