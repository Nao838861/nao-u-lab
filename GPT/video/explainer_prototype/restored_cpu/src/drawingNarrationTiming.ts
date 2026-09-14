import narrationManifest from '../narration/drawing-cuts.json';

const getCut = (id: string) => {
  const cut = narrationManifest.cuts.find((candidate) => candidate.id === id);
  if (!cut) throw new Error(`描画ナレーション定義が見つかりません: ${id}`);
  return cut;
};

export const c08Timing = getCut('C08');
export const c10Timing = getCut('C10');

export const drawingNarrationDurationInFrames =
  c10Timing.startFrame + c10Timing.durationFrames;
