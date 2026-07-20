import { TUTORIAL_GOALS, TUTORIAL_LETTERS } from './tutorial_content.js';

const SAVE_VERSION = 1;

function clone(value) {
  return structuredClone(value);
}

function initialState() {
  return {
    version: SAVE_VERSION,
    active: true,
    skipped: false,
    observedDay: null,
    observedTick: null,
    lastEventSequence: 0,
    completedGoals: [],
    goalResults: {},
    letters: [],
  };
}

function restoredState(state) {
  if (!state) return initialState();
  if (state.version !== SAVE_VERSION) throw new Error(`未対応のチュートリアル保存版です: ${state.version}`);
  return clone(state);
}

export class TutorialDirector {
  constructor({ goals = TUTORIAL_GOALS, letters = TUTORIAL_LETTERS, state = null } = {}) {
    this.goals = goals;
    this.letterDefinitions = letters;
    this.state = restoredState(state);
  }

  observe(model, events = []) {
    if (!model || !Array.isArray(events)) throw new TypeError('model and events are required');
    if (!this.state.active) return this.readState();
    this.state.observedDay = model.day;
    this.state.observedTick = model.tick;
    if (events.length) {
      this.state.lastEventSequence = Math.max(
        this.state.lastEventSequence,
        ...events.map(event => event.sequence ?? 0),
      );
    }

    for (const definition of this.letterDefinitions) {
      if (this.state.letters.some(letter => letter.id === definition.id)) continue;
      if (!definition.when({ model, events, state: this.readState() })) continue;
      const rendered = definition.render({ model, events, state: this.readState() });
      this.state.letters.push({
        id: definition.id,
        source: definition.source ?? 'event',
        issuedDay: model.day,
        issuedTick: model.tick,
        unread: true,
        ...rendered,
      });
    }

    for (const goal of this.goals) {
      if (this.state.completedGoals.includes(goal.id)) continue;
      const result = goal.evaluate({ model, events });
      this.state.goalResults[goal.id] = clone(result);
      if (result.complete) this.state.completedGoals.push(goal.id);
      break;
    }
    return this.readState();
  }

  currentObjective() {
    if (!this.state.active) return null;
    const current = this.goals.find(goal => !this.state.completedGoals.includes(goal.id));
    const goal = current ?? this.goals.at(-1);
    if (!goal) return null;
    const result = this.state.goalResults[goal.id] ?? {
      complete: this.state.completedGoals.includes(goal.id),
      progress: { done: 0, total: 1 },
      detail: '',
      evidence: {},
    };
    return clone({
      id: goal.id,
      chapter: goal.chapter,
      title: goal.title,
      ...result,
      complete: this.state.completedGoals.includes(goal.id) || result.complete,
    });
  }

  letters() {
    return clone(this.state.letters);
  }

  markLetterRead(id) {
    const letter = this.state.letters.find(candidate => candidate.id === id);
    if (!letter) return false;
    letter.unread = false;
    return true;
  }

  skip() {
    this.state.active = false;
    this.state.skipped = true;
    return this.readState();
  }

  readState() {
    return clone(this.state);
  }

  exportSave(engineJournal) {
    if (!Array.isArray(engineJournal)) throw new TypeError('engine journal must be an array');
    return clone({
      version: SAVE_VERSION,
      engineJournal,
      tutorialState: this.state,
    });
  }
}

export function createTutorialDirector(options = {}) {
  return new TutorialDirector(options);
}

export function createTutorialDirectorForMode(mode, options = {}) {
  return mode === 'tutorial' ? createTutorialDirector(options) : null;
}
