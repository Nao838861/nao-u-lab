import narrationManifest from '../narration/prototype-cuts.json';

const getCut = (id: string) => {
  const cut = narrationManifest.cuts.find((candidate) => candidate.id === id);
  if (!cut) throw new Error(`ナレーション定義が見つかりません: ${id}`);
  return cut;
};

export const c01Timing = getCut('C01');
export const c02Timing = getCut('C02');
export const c03Timing = getCut('C03');

export const narrationPreviewDurationInFrames =
  c03Timing.startFrame + c03Timing.durationFrames;

const originalNarrationPreviewDurationInFrames = 840;
export const narrationTimingOffset =
  narrationPreviewDurationInFrames - originalNarrationPreviewDurationInFrames;

export const fullCompositionDurationInFrames = 7050 + narrationTimingOffset;
