#!/bin/bash
# backup_memory.sh — メモリファイルをインスタンス名付きディレクトリにバックアップ
#
# 用途: pre-push hookから呼ばれる。手動実行も可。
# 設計: バックアップ失敗でもexit 0（pushを止めない）
#
# インスタンス検出:
#   Win2 (C:\AI\nao-u-lab) = Ash
#   Win  (D:\AI\nao-u-lab) = Log
#   Mac  (~/.../nao-u-lab) = Mir

set -u

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_BASE="${REPO_ROOT}/memory_backup"

# --- インスタンス名の検出 ---
detect_instance() {
    local repo_path="$REPO_ROOT"

    # Windows: ドライブレターで判別
    if echo "$repo_path" | grep -qi "^/c/AI\|^C:/AI\|^c:/AI"; then
        echo "ash"
        return
    fi
    if echo "$repo_path" | grep -qi "^/d/AI\|^D:/AI\|^d:/AI"; then
        echo "log"
        return
    fi

    # Mac/Linux
    if [[ "$(uname)" == "Darwin" ]]; then
        echo "mir"
        return
    fi

    # フォールバック: ホスト名ベース
    local host
    host="$(hostname 2>/dev/null || echo unknown)"
    case "$host" in
        ROGXbox*) echo "ash" ;;
        *)        echo "unknown_${host}" ;;
    esac
}

# --- メモリソースディレクトリの検出 ---
find_memory_source() {
    # Claude Code のメモリディレクトリを探す
    local candidates=(
        "$HOME/.claude/projects/C--AI-nao-u-lab/memory"
        "$HOME/.claude/projects/D--AI-nao-u-lab/memory"
        "$HOME/.claude/projects/nao-u-lab/memory"
    )

    for dir in "${candidates[@]}"; do
        if [[ -d "$dir" ]] && [[ -f "$dir/MEMORY.md" ]]; then
            echo "$dir"
            return
        fi
    done

    # 見つからない場合
    echo ""
}

# --- メイン処理 ---
main() {
    local instance
    instance="$(detect_instance)"

    local memory_src
    memory_src="$(find_memory_source)"

    if [[ -z "$memory_src" ]]; then
        echo "[backup_memory] WARNING: メモリソースが見つかりません。スキップします。"
        exit 0
    fi

    local backup_dir="${BACKUP_BASE}/${instance}"

    # バックアップディレクトリ作成
    mkdir -p "$backup_dir"

    # ファイル数カウント（バックアップ前）
    local src_count
    src_count="$(find "$memory_src" -maxdepth 1 -name '*.md' | wc -l)"

    if [[ "$src_count" -eq 0 ]]; then
        echo "[backup_memory] WARNING: メモリファイルが0件。スキップします。"
        exit 0
    fi

    # コピー実行（既存ファイルを上書き）
    local copied=0
    local failed=0

    for src_file in "$memory_src"/*.md; do
        local filename
        filename="$(basename "$src_file")"
        if cp "$src_file" "$backup_dir/$filename" 2>/dev/null; then
            copied=$((copied + 1))
        else
            failed=$((failed + 1))
            echo "[backup_memory] ERROR: コピー失敗: $filename"
        fi
    done

    # タイムスタンプファイルを残す（最終バックアップ日時）
    echo "instance: ${instance}" > "$backup_dir/.backup_info"
    echo "timestamp: $(date -u '+%Y-%m-%dT%H:%M:%SZ' 2>/dev/null || date '+%Y-%m-%d %H:%M:%S')" >> "$backup_dir/.backup_info"
    echo "source: ${memory_src}" >> "$backup_dir/.backup_info"
    echo "files_copied: ${copied}" >> "$backup_dir/.backup_info"
    echo "files_failed: ${failed}" >> "$backup_dir/.backup_info"

    # git add（リポジトリ内にいる場合）
    if git -C "$REPO_ROOT" rev-parse --is-inside-work-tree &>/dev/null; then
        git -C "$REPO_ROOT" add "$backup_dir" 2>/dev/null

        # 変更があればcommit
        if ! git -C "$REPO_ROOT" diff --cached --quiet -- "$backup_dir" 2>/dev/null; then
            git -C "$REPO_ROOT" commit -m "backup: ${instance} memory (${copied} files)" --no-verify 2>/dev/null
            echo "[backup_memory] ${instance}: ${copied}件バックアップ + commit完了"
        else
            echo "[backup_memory] ${instance}: ${copied}件コピー（変更なし、commitスキップ）"
        fi
    else
        echo "[backup_memory] ${instance}: ${copied}件コピー完了（git外）"
    fi

    if [[ "$failed" -gt 0 ]]; then
        echo "[backup_memory] WARNING: ${failed}件のコピーに失敗"
    fi

    exit 0
}

main "$@"
