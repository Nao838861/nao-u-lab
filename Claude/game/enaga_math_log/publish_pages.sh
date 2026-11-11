#!/usr/bin/env bash
# けいさん団子を GitHub Pages（master）に公開する。
# 作業ブランチの他の変更には触れず、このフォルダだけを master に反映する。
# 公開URL: https://nao838861.github.io/nao-u-lab/Claude/game/enaga_math_log/
set -euo pipefail
SRC="$(cd "$(dirname "$0")" && pwd)"
REPO="$(git -C "$SRC" rev-parse --show-toplevel)"
REL="Claude/game/enaga_math_log"
W="$(mktemp -d)/pages"
git -C "$REPO" fetch -q origin master
git -C "$REPO" worktree add -q --no-checkout --detach "$W" origin/master
trap 'git -C "$REPO" worktree remove --force "$W" >/dev/null 2>&1 || true' EXIT
cd "$W"
git sparse-checkout init --no-cone >/dev/null
printf '/%s/\n' "$REL" > "$(git rev-parse --git-path info/sparse-checkout)"
git checkout -q
mkdir -p "$REL"
cp -r "$SRC/." "$REL/"
git add "$REL"
if git diff --cached --quiet; then echo "変更なし"; exit 0; fi
git commit -q -m "${1:-game: けいさん団子 を公開版に反映}"
for i in 1 2 3; do
  if git push -q origin HEAD:master; then echo "pushed"; exit 0; fi
  git fetch -q origin master && git rebase -q origin/master
done
echo "push できませんでした" >&2; exit 1
