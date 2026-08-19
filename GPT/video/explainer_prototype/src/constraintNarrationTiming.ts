import narrationManifest from '../narration/constraint-cuts.json';

const getCut = (id: string) => {
  const cut = narrationManifest.cuts.find((candidate) => candidate.id === id);
  if (!cut) throw new Error(`制約ナレーション定義が見つかりません: ${id}`);
  return cut;
};

export const c14Timing = getCut('C14');
export const c15Timing = getCut('C15');
export const c16Timing = getCut('C16');

export const constraintNarrationDurationInFrames =
  c16Timing.startFrame + c16Timing.durationFrames;
