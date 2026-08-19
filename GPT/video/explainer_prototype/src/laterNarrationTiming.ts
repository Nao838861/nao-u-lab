import narrationManifest from '../narration/later-cuts.json';

const getCut = (id: string) => {
  const cut = narrationManifest.cuts.find((candidate) => candidate.id === id);
  if (!cut) throw new Error(`後半ナレーション定義が見つかりません: ${id}`);
  return cut;
};

export const c17Timing = getCut('C17');
export const c18Timing = getCut('C18');
export const c19Timing = getCut('C19');
export const c20Timing = getCut('C20');
export const c21Timing = getCut('C21');
export const c22Timing = getCut('C22');
export const c23Timing = getCut('C23');

export const laterNarrationPreviewDurationInFrames =
  c19Timing.startFrame + c19Timing.durationFrames;

export const workflowNarrationPreviewDurationInFrames =
  c23Timing.startFrame + c23Timing.durationFrames - c20Timing.startFrame;
