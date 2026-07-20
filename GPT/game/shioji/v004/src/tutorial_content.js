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

function portRoadComponent(model) {
  const roads = new Set(model.roadKeys);
  const ports = model.buildings.filter(building => building.roles?.includes('port'));
  const queue = ports
    .map(building => building.entrance)
    .filter(Boolean)
    .filter(point => roads.has(`${point.x},${point.y}`));
  const connected = new Set();
  while (queue.length) {
    const point = queue.shift();
    const key = `${point.x},${point.y}`;
    if (connected.has(key)) continue;
    connected.add(key);
    for (let dy = -1; dy <= 1; dy += 1) {
      for (let dx = -1; dx <= 1; dx += 1) {
        if ((!dx && !dy) || !roads.has(`${point.x + dx},${point.y + dy}`)) continue;
        queue.push({ x: point.x + dx, y: point.y + dy });
      }
    }
  }
  return connected;
}

function newHouseholdEvent(events) {
  return events.find(event => event.type === 'arrival' && event.reason === 'new_household');
}

export const TUTORIAL_GOALS = Object.freeze([
  Object.freeze({
    id: 'first-road-and-logger',
    chapter: '第一章・最初の一荷',
    title: '森の際へ道を敷き、木こりを置く',
    evaluate({ model }) {
      const portRoads = portRoadComponent(model);
      const forestRoads = [...portRoads].filter(key => roadTouchesForest(model, key)).length;
      const loggers = model.buildings.filter(building => building.type === 'logger').length;
      const done = Number(forestRoads > 0) + Number(loggers > 0);
      return {
        complete: done === 2,
        progress: { done, total: 2 },
        detail: `港から森の際へ届いた道 ${forestRoads}区画 / 木こり ${loggers}棟`,
        evidence: { connectedRoads: portRoads.size, forestRoads, loggers },
      };
    },
  }),
  Object.freeze({
    id: 'first-settlers-arrive',
    chapter: '第一章・最初の一荷',
    title: '最初の入植世帯を迎える',
    evaluate({ model }) {
      const households = model.households.filter(household => household.job === 'logger').length;
      return {
        complete: households > 0,
        progress: { done: Number(households > 0), total: 1 },
        detail: `木こりの入植世帯 ${households}世帯 / 島の人口 ${model.population}人`,
        evidence: { households, population: model.population },
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
  Object.freeze({
    id: 'first-settlers-report',
    source: 'event',
    when({ model, events }) {
      const event = newHouseholdEvent(events);
      return Boolean(event && model.households.some(household => (
        household.id === event.householdId && household.job === 'logger'
      )));
    },
    render({ model, events }) {
      const event = newHouseholdEvent(events);
      const household = model.households.find(candidate => candidate.id === event.householdId);
      return {
        kicker: '入植船の着岸報告',
        title: '最初の世帯が島へ入りました',
        summary: `${event.day}日目・${household.members}人の世帯・島の人口 ${model.population}人`,
        body: [
          `${event.day}日目。入植船から${household.members}人の世帯が降り、木こりの区画へ入りました。島の人口は${model.population}人です。`,
          '人が来れば、仕事と暮らしが動き始めます。まずは丸太が積み上がる様子を見届けましょう。',
        ].join('\n\n'),
        signature: '会社秘書 エレナ',
      };
    },
  }),
]);
