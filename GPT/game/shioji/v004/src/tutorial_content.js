function tileKind(model, x, y) {
  return model.terrain[y]?.[x]?.kind ?? null;
}

function roadTouchesForest(model, key) {
  const [x, y] = key.split(',').map(Number);
  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      if ((dx !== 0 || dy !== 0) && tileKind(model, x + dx, y + dy) === 'forest') return true;
    }
  }
  return false;
}

export const TUTORIAL_GOALS = Object.freeze([
  Object.freeze({
    id: 'first-road-and-logger',
    chapter: '第一章・最初の一荷',
    title: '森の際へ道を敷き、木こりを置く',
    evaluate({ model }) {
      const forestRoads = model.roadKeys.filter(key => roadTouchesForest(model, key)).length;
      const loggers = model.buildings.filter(building => building.type === 'logger').length;
      const done = Number(forestRoads > 0) + Number(loggers > 0);
      return {
        complete: done === 2,
        progress: { done, total: 2 },
        detail: `森の際に届いた道 ${forestRoads}区画 / 木こり ${loggers}棟`,
        evidence: { forestRoads, loggers },
      };
    },
  }),
]);

export const TUTORIAL_LETTERS = Object.freeze([
  Object.freeze({
    id: 'arrival-report',
    source: 'snapshot',
    when({ model }) {
      return model.buildings.some(building => building.roles?.includes('port'));
    },
    render({ model }) {
      const ports = model.buildings.filter(building => building.roles?.includes('port')).length;
      return {
        kicker: '着任時の島況',
        title: '島の現況を報告します',
        summary: `港 ${ports}棟・人口 ${model.population}人・道路 ${model.roadKeys.length}区画`,
        body: [
          `${model.day}日目。盤上では港が${ports}棟稼働し、人口は${model.population}人、完成道路は${model.roadKeys.length}区画です。`,
          'まず森の際まで道を敷き、木こりの区画を指定してください。島の変化は、実際の建物と出来事に沿ってお知らせします。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
]);
