function speechClauses(text) {
  const source = String(text ?? "").trim().replace(/\s*\n\s*/g, "");
  if (!source) return [];
  return [...source.matchAll(/[^、。！？!?]*[、。！？!?]+[」』）】]?|[^、。！？!?]+$/g)]
    .map(match => match[0])
    .filter(Boolean);
}

function balancedClauseLines(clauses, lineCount) {
  const target = clauses.join("").length / lineCount;
  const memo = new Map();

  function partition(start, remaining) {
    const key = `${start}:${remaining}`;
    if (memo.has(key)) return memo.get(key);
    if (remaining === 1) {
      const line = clauses.slice(start).join("");
      const result = { score: (line.length - target) ** 2, lines: [line] };
      memo.set(key, result);
      return result;
    }

    let best = null;
    const finalEnd = clauses.length - remaining + 1;
    for (let end = start + 1; end <= finalEnd; end += 1) {
      const line = clauses.slice(start, end).join("");
      const rest = partition(end, remaining - 1);
      const score = (line.length - target) ** 2 + rest.score;
      if (!best || score < best.score) best = { score, lines: [line, ...rest.lines] };
    }
    memo.set(key, best);
    return best;
  }

  return partition(0, lineCount).lines;
}

export function formatElenaSpeech(text, { maxLines = 3 } = {}) {
  const clauses = speechClauses(text);
  if (clauses.length === 0) return "";
  const safeMaximum = Math.max(1, Math.floor(maxLines));
  const lineCount = Math.min(safeMaximum, clauses.length);
  return balancedClauseLines(clauses, lineCount).join("\n");
}
