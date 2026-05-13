#!/bin/bash
# scripts/test_rebase_guard.sh — rebase-in-progress guard self-test
#
# 目的: scripts/backup_memory.sh / git_sync.py / auto_git_sync.bat の冒頭に
# 入れた rebase 検出ガードが、実際に .git/rebase-merge / .git/rebase-apply の
# 存在を検知して exit 0 で抜けることを確認する。
#
# 検証方式:
#   1. 各スクリプトに guard 文字列が含まれていることを静的に確認 (grep)
#   2. 合成 .git/rebase-merge/ を作って git_sync.py を起動 → "SKIP: rebase in progress"
#      が stdout に出ること、HEAD が変化しないこと、exit code が 0 であることを確認
#   3. 後始末で合成ディレクトリを必ず削除する (trap)
#
# 注意:
#   - 本テストは実リポの .git/ を操作する。実行中に backup_memory.sh 等が並走しても
#     ガードが効くので衝突しないが、HEAD が確実に動かないことを確認する設計
#   - HEAD 比較で test 中に第三者 commit が入った場合は誤判定する可能性あり
#     (短時間で完了するので実用上は問題にならない)

set -eu

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GIT_DIR_REAL="$(git -C "$REPO_ROOT" rev-parse --git-dir)"
# Windows パス (C:/...) または POSIX 絶対パス (/...) を absolute と判定
if [[ ! "$GIT_DIR_REAL" =~ ^([A-Za-z]:[/\\]|/) ]]; then
    GIT_DIR_REAL="$REPO_ROOT/$GIT_DIR_REAL"
fi

PASS=0
FAIL=0

assert_pass() {
    PASS=$((PASS + 1))
    echo "  [PASS] $1"
}
assert_fail() {
    FAIL=$((FAIL + 1))
    echo "  [FAIL] $1"
}

echo "[test_rebase_guard] === Static check: guard string in each script ==="

# git_sync.py
if grep -q "rebase-merge" "$REPO_ROOT/git_sync.py" 2>/dev/null; then
    assert_pass "git_sync.py: guard string present"
else
    assert_fail "git_sync.py: guard string missing"
fi

# scripts/backup_memory.sh
if grep -q "rebase-merge" "$REPO_ROOT/scripts/backup_memory.sh" 2>/dev/null; then
    assert_pass "scripts/backup_memory.sh: guard string present"
else
    assert_fail "scripts/backup_memory.sh: guard string missing"
fi

# auto_git_sync.bat
if grep -q "rebase-merge" "$REPO_ROOT/auto_git_sync.bat" 2>/dev/null; then
    assert_pass "auto_git_sync.bat: guard string present"
else
    assert_fail "auto_git_sync.bat: guard string missing"
fi

echo ""
echo "[test_rebase_guard] === Functional check: synthesized .git/rebase-merge ==="

# Pre-existing rebase 状態がないこと
if [[ -d "$GIT_DIR_REAL/rebase-merge" ]] || [[ -d "$GIT_DIR_REAL/rebase-apply" ]]; then
    echo "  [SKIP] Real rebase in progress at $GIT_DIR_REAL — functional test cannot run safely"
    echo ""
    echo "[test_rebase_guard] Summary: $PASS PASS / $FAIL FAIL (functional test skipped)"
    if [[ $FAIL -eq 0 ]]; then
        exit 0
    else
        exit 1
    fi
fi

HEAD_BEFORE="$(git -C "$REPO_ROOT" rev-parse HEAD)"
FAKE_REBASE_MERGE="$GIT_DIR_REAL/rebase-merge"

cleanup() {
    if [[ -d "$FAKE_REBASE_MERGE" ]]; then
        rmdir "$FAKE_REBASE_MERGE" 2>/dev/null || true
    fi
}
trap cleanup EXIT INT TERM

mkdir "$FAKE_REBASE_MERGE"

# git_sync.py を起動 (DRY_RUN 用変数なしの素の状態)
OUT="$(python "$REPO_ROOT/git_sync.py" 2>&1)"
RC=$?

if [[ $RC -eq 0 ]]; then
    assert_pass "git_sync.py: exit code 0 on synthesized rebase-merge"
else
    assert_fail "git_sync.py: exit code $RC (expected 0)"
fi

if echo "$OUT" | grep -q "SKIP: rebase in progress"; then
    assert_pass "git_sync.py: emitted SKIP message"
else
    assert_fail "git_sync.py: missing SKIP message. Output: $OUT"
fi

HEAD_AFTER="$(git -C "$REPO_ROOT" rev-parse HEAD)"
if [[ "$HEAD_BEFORE" == "$HEAD_AFTER" ]]; then
    assert_pass "HEAD unchanged: $HEAD_BEFORE"
else
    assert_fail "HEAD moved: $HEAD_BEFORE -> $HEAD_AFTER (guard did not block git operations)"
fi

# backup_memory.sh も同じ合成下で起動
OUT_BACKUP="$(bash "$REPO_ROOT/scripts/backup_memory.sh" 2>&1)"
RC_BACKUP=$?

if [[ $RC_BACKUP -eq 0 ]] && echo "$OUT_BACKUP" | grep -q "SKIP: rebase in progress"; then
    assert_pass "backup_memory.sh: SKIPped on synthesized rebase-merge"
else
    assert_fail "backup_memory.sh: did not SKIP. RC=$RC_BACKUP, OUT=$OUT_BACKUP"
fi

# 合成ディレクトリ削除 (trap でも消すが明示的に)
rmdir "$FAKE_REBASE_MERGE"

# 削除後はガードが clear して通常動作経路に入ること (起動はしない、状態だけ確認)
if [[ ! -d "$FAKE_REBASE_MERGE" ]]; then
    assert_pass "rebase-merge synthesis cleaned up"
else
    assert_fail "rebase-merge synthesis not cleaned up"
fi

echo ""
echo "[test_rebase_guard] Summary: $PASS PASS / $FAIL FAIL"
if [[ $FAIL -eq 0 ]]; then
    echo "[test_rebase_guard] ALL PASS"
    exit 0
else
    echo "[test_rebase_guard] FAILURE"
    exit 1
fi
