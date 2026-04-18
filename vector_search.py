#!/usr/bin/env python3
"""
vector_search.py — 意味的類似度ベース記憶検索（B-3 vector層、Phase 0雛形）

栄養の偏り問題への直接処置:
  associative_search.py の共起語展開は「自分が書いたものの中の近接性」しか引けない。
  「書いていないが似ているもの」を引くには埋め込みベクトルが必要。

設計:
  build: memory/ docs/ projects/ knowledge/ の.mdを段落単位チャンク化→
         sentence-transformers (paraphrase-multilingual-MiniLM-L12-v2) で埋め込み→
         .vector_index.npy + .vector_index_meta.jsonl 保存
  search: クエリを同モデルで埋め込み→cos類似度Top-K→チャンクと元ファイルを返す

接続点:
  - associative_search.py の --search 結果に vector Top-K をマージする方向で統合予定（Phase 2）
  - memory_walk.py / memory_activate.py の補助検索源として呼び出し可能にする

実装段階:
  Phase 0 (2026-04-17): この雛形。CLI骨格のみ。sentence-transformers未導入でもimportエラーは
                       「インストールしてください」のメッセージで丁寧に止まる。
  Phase 1 (2026-04-18予定): 実インデックス構築・保存・検索。所要時間と容量を実測。
  Phase 2 (Phase 1完了直後): grepヒット0件のサンプル3問で効果検証。

Usage:
  python vector_search.py build              # 全.mdをチャンク化＋埋め込み構築
  python vector_search.py search "クエリ"    # 上位10件を出力
  python vector_search.py stats              # インデックス統計
"""
import argparse
import json
import sys
from pathlib import Path

if sys.stdout.encoding and sys.stdout.encoding.lower().startswith("cp"):
    sys.stdout = open(sys.stdout.fileno(), mode='w', encoding='utf-8',
                      errors='replace', closefd=False)

REPO_DIR = Path(__file__).parent
INDEX_PATH = REPO_DIR / ".vector_index.npy"
META_PATH = REPO_DIR / ".vector_index_meta.jsonl"
SCAN_DIRS = ["memory", "docs", "projects", "knowledge"]
MODEL_NAME = "paraphrase-multilingual-MiniLM-L12-v2"
CHUNK_MIN_CHARS = 80
CHUNK_MAX_CHARS = 800


def _require_sentence_transformers():
    try:
        from sentence_transformers import SentenceTransformer
        import numpy as np
        return SentenceTransformer, np
    except ImportError:
        sys.stderr.write(
            "sentence-transformers が未導入。Phase 1で次を実行:\n"
            "  pip install sentence-transformers\n"
            "  （初回はモデル数百MBのダウンロードが入る）\n"
        )
        sys.exit(2)


def iter_md_files():
    for d in SCAN_DIRS:
        base = REPO_DIR / d
        if not base.exists():
            continue
        for p in base.rglob("*.md"):
            yield p


def chunk_markdown(text: str):
    """段落（空行区切り）でチャンク化。長すぎる段落は文単位で分割。"""
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks = []
    for para in paragraphs:
        if len(para) <= CHUNK_MAX_CHARS:
            if len(para) >= CHUNK_MIN_CHARS:
                chunks.append(para)
            continue
        buf = ""
        for sent in para.replace("。", "。\n").split("\n"):
            sent = sent.strip()
            if not sent:
                continue
            if len(buf) + len(sent) > CHUNK_MAX_CHARS:
                if len(buf) >= CHUNK_MIN_CHARS:
                    chunks.append(buf)
                buf = sent
            else:
                buf += sent
        if len(buf) >= CHUNK_MIN_CHARS:
            chunks.append(buf)
    return chunks


def cmd_build(args):
    SentenceTransformer, np = _require_sentence_transformers()
    model = SentenceTransformer(MODEL_NAME)

    metas = []
    texts = []
    for path in iter_md_files():
        try:
            content = path.read_text(encoding="utf-8")
        except Exception as e:
            sys.stderr.write(f"skip {path}: {e}\n")
            continue
        rel = path.relative_to(REPO_DIR).as_posix()
        for i, chunk in enumerate(chunk_markdown(content)):
            metas.append({"file": rel, "chunk_idx": i, "preview": chunk[:120]})
            texts.append(chunk)

    if not texts:
        sys.stderr.write("no chunks found\n")
        sys.exit(1)

    sys.stderr.write(f"encoding {len(texts)} chunks...\n")
    vecs = model.encode(texts, batch_size=32, show_progress_bar=True,
                        normalize_embeddings=True)
    np.save(INDEX_PATH, vecs)
    with META_PATH.open("w", encoding="utf-8") as f:
        for m in metas:
            f.write(json.dumps(m, ensure_ascii=False) + "\n")
    sys.stderr.write(f"saved {INDEX_PATH.name} ({vecs.shape}) + {META_PATH.name}\n")


_cache = {"model": None, "vecs": None, "metas": None}


def search(query: str, top_k: int = 10):
    """B-3 Phase 3接続点: associative_search.py から呼び出す関数API。
    戻り値: [(sim, file, chunk_idx, preview), ...] top_k件。
    index未構築/依存未導入時は空リストを返す（呼び出し側のフォールバックに任せる）。"""
    if not INDEX_PATH.exists() or not META_PATH.exists():
        return []
    try:
        from sentence_transformers import SentenceTransformer
        import numpy as np
    except ImportError:
        return []
    if _cache["model"] is None:
        _cache["model"] = SentenceTransformer(MODEL_NAME)
        _cache["vecs"] = np.load(INDEX_PATH)
        _cache["metas"] = [json.loads(line) for line in META_PATH.open(encoding="utf-8")]
    qvec = _cache["model"].encode([query], normalize_embeddings=True)[0]
    sims = _cache["vecs"] @ qvec
    top_idx = np.argsort(-sims)[:top_k]
    return [(float(sims[i]), _cache["metas"][i]["file"],
             _cache["metas"][i]["chunk_idx"], _cache["metas"][i]["preview"])
            for i in top_idx]


def cmd_search(args):
    hits = search(args.query, args.top_k)
    if not hits:
        sys.stderr.write("index not built or dependency missing. run: python vector_search.py build\n")
        sys.exit(1)
    for rank, (sim, fpath, cidx, prev) in enumerate(hits, 1):
        print(f"[{rank}] sim={sim:.3f} {fpath} #chunk{cidx}")
        print(f"    {prev}")


def cmd_stats(args):
    if not INDEX_PATH.exists():
        print("no index built")
        return
    SentenceTransformer, np = _require_sentence_transformers()
    vecs = np.load(INDEX_PATH)
    n_meta = sum(1 for _ in META_PATH.open(encoding="utf-8"))
    print(f"vectors: {vecs.shape}, metadata lines: {n_meta}")
    print(f"file size: {INDEX_PATH.stat().st_size / 1024 / 1024:.1f} MB")


def main():
    p = argparse.ArgumentParser(description=__doc__)
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("build")
    sp = sub.add_parser("search")
    sp.add_argument("query")
    sp.add_argument("--top-k", type=int, default=10)
    sub.add_parser("stats")
    args = p.parse_args()
    {"build": cmd_build, "search": cmd_search, "stats": cmd_stats}[args.cmd](args)


if __name__ == "__main__":
    main()
