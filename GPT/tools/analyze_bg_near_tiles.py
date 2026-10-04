"""BG Studio の同一絵・1画素違いの統合候補を非破壊で実測する。"""
import argparse
import hashlib
import json
from collections import Counter
from pathlib import Path
from time import perf_counter


def find_merges(tiles, protected, *, preserve_single_pixel=True):
    """番号順で残存タイルにだけ統合。推移的な統合で誤差を増やさない。"""
    kept = {}
    mapping = {}
    distances = Counter()
    examples = []
    single_pixel = {n for n, pixels in tiles.items() if sum(c != '0' for c in pixels) == 1}
    for number in sorted(tiles):
        pixels = tiles[number]
        if len(pixels) != 64 or any(c not in '0123' for c in pixels):
            raise ValueError(f'タイル {number} の画素が不正です')
        target = None
        if number not in protected:
            target = kept.get(pixels)
            # 1点の絵は色・点数を変えず、完全一致のみまとめる。
            positions = () if preserve_single_pixel and number in single_pixel else enumerate(pixels)
            for pos, value in positions:
                prefix, suffix = pixels[:pos], pixels[pos + 1:]
                for color in '0123':
                    if color == value:
                        continue
                    candidate = kept.get(prefix + color + suffix)
                    if preserve_single_pixel and candidate in single_pixel:
                        continue
                    if candidate is not None and (target is None or candidate < target):
                        target = candidate
        if target is None:
            mapping[number] = number
            kept.setdefault(pixels, number)
        else:
            mapping[number] = target
            distance = sum(a != b for a, b in zip(pixels, tiles[target]))
            assert distance <= 1 and mapping[target] == target and target < number
            distances[distance] += 1
            if len(examples) < 20:
                examples.append(dict(removed=number, retained=target, pixel_difference=distance))
    return mapping, distances, examples


def analyze(path, *, preserve_single_pixel=True):
    started = perf_counter()
    raw = path.read_bytes()
    document = json.loads(raw)
    if document.get('format') != 'famibasic-bg-studio-2':
        raise ValueError('BG Studio v2 の原本を指定してください')
    tiles = {int(n): pixels for n, pixels in document['tiles'].items()}
    protected = set(document['protected_tiles'])
    loaded = perf_counter()
    mapping, distances, examples = find_merges(tiles, protected, preserve_single_pixel=preserve_single_pixel)
    compared = perf_counter()
    references = Counter(c[0] for m in document['maps'] for b in m['block_defs'] for c in b['cells'])
    missing = sorted(set(references) - set(tiles))
    return dict(
        source=str(path.resolve()), source_sha256=hashlib.sha256(raw).hexdigest(),
        policy='numeric order; earliest retained tile; pixel indices; distance <= 1; protected tiles retained',
        preserve_single_pixel=preserve_single_pixel,
        single_pixel_tiles=sum(sum(c != '0' for c in pixels) == 1 for pixels in tiles.values()),
        single_pixel_policy='exact matches only, in either direction' if preserve_single_pixel else 'distance <= 1',
        original_tiles=len(tiles), retained_tiles=sum(n == target for n, target in mapping.items()),
        identical_merges=distances[0], one_pixel_merges=distances[1],
        protected_tiles=sorted(protected),
        original_max_tile=max(tiles),
        references_to_merged_tiles=sum(count for n, count in references.items() if mapping.get(n, n) != n),
        missing_referenced_tiles=missing,
        maps=[dict(id=m['id'], role=m.get('asset_role', m.get('screen_role', 'map'))) for m in document['maps']],
        examples=examples,
        load_seconds=round(loaded - started, 4), comparison_seconds=round(compared - loaded, 4),
        total_seconds=round(perf_counter() - started, 4),
        source_modified=False,
    )


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('--output', type=Path)
    parser.add_argument('--allow-single-pixel-merges', action='store_true',
                        help='1点の絵も1画素差統合に含める（既定では完全一致のみ）')
    args = parser.parse_args()
    if args.output and args.output.resolve() == args.source.resolve():
        parser.error('出力先は原本と別にしてください')
    report = analyze(args.source, preserve_single_pixel=not args.allow_single_pixel_merges)
    text = json.dumps(report, ensure_ascii=False, indent=2)
    if args.output:
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(text + '\n', encoding='utf-8')
    print(text)


if __name__ == '__main__':
    main()
