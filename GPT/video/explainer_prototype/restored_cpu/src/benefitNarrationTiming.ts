import narrationManifest from '../narration/benefit-cuts.json';

const getCut = (id: string) => {
  const cut = narrationManifest.cuts.find((candidate) => candidate.id === id);
  if (!cut) throw new Error(`メリット・欠点ナレーション定義が見つかりません: ${id}`);
  return cut;
};

export const c11Timing = getCut('C11');
export const c12Timing = getCut('C12');
export const c13Timing = getCut('C13');

export const benefitNarrationDurationInFrames =
  c13Timing.startFrame + c13Timing.durationFrames;
