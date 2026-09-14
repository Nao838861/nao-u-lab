import narrationManifest from '../narration/development-cuts.json';

const getCut = (id: string) => {
  const cut = narrationManifest.cuts.find((candidate) => candidate.id === id);
  if (!cut) throw new Error(`開発ナレーション定義が見つかりません: ${id}`);
  return cut;
};

export const c04Timing = getCut('C04');
export const c05Timing = getCut('C05');
export const c06Timing = getCut('C06');
export const c07Timing = getCut('C07');

export const developmentNarrationDurationInFrames =
  c07Timing.startFrame + c07Timing.durationFrames;
