import {
  TUTORIAL_ADVICE, TUTORIAL_GOALS, TUTORIAL_LETTERS, TUTORIAL_LETTER_ATTENTION,
  TUTORIAL_ELENA_COMPLETIONS, TUTORIAL_ELENA_MESSAGES, TUTORIAL_LETTER_MESSAGES,
  TUTORIAL_PLAYER_TITLES, TUTORIAL_SYSTEM_INSTRUCTIONS,
  authorTutorialLetter, isRequiredTutorialGoal, isTutorialGoalUnlocked, tutorialLetterDelivery,
} from './tutorial_content.js?v=v004.19.0-canon-performance';

const SAVE_VERSION = 1;

function clone(value) {
  return structuredClone(value);
}

function playerFacingText(value) {
  return String(value ?? '')
    .replaceAll('食料輸入EMA', '本土から買う食料（1日あたり・30日ならし）')
    .replaceAll('島内食料生産EMA', '島で作る食料（1日あたり・30日ならし）')
    .replaceAll('生産EMA', '生産量（1日あたり・30日ならし）')
    .replaceAll('相場EMA', '相場（30日ならし）')
    .replaceAll('EMA', '30日ならし')
    .replaceAll('tick', '時間ぶん')
    .replaceAll('input棚', '原料棚')
    .replaceAll('productionCost', '実際にかかった原価')
    .replaceAll('haulJobId', '今回の荷車')
    .replaceAll('snapshot', '観測時点')
    .replaceAll('入力ジャーナル', '操作記録')
    .replaceAll('journal', '操作記録')
    .replaceAll('エンジン状態', '島の状態')
    .replaceAll('経済エンジン', '島の営み')
    .replaceAll('E-Stable', '長期見本都市')
    .replaceAll('教程', '案内')
    .replaceAll('実記録', '記録')
    .replaceAll('実際に', '');
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
    advice: [],
    adviceState: {},
  };
}

function restoredState(state) {
  if (!state) return initialState();
  if (state.version !== SAVE_VERSION) throw new Error(`未対応のチュートリアル保存版です: ${state.version}`);
  return {
    ...initialState(),
    ...clone(state),
    letters: clone(state.letters ?? []).map(letter => ({
      ...letter,
      delivery: letter.delivery ?? tutorialLetterDelivery(letter.id),
      announced: Boolean(letter.announced),
      elenaMessage: playerFacingText(
        letter.elenaMessage ?? TUTORIAL_LETTER_MESSAGES[letter.id] ?? '',
      ),
    })),
    advice: clone(state.advice ?? []),
    adviceState: clone(state.adviceState ?? {}),
  };
}

export class TutorialDirector {
  constructor({
    goals = TUTORIAL_GOALS,
    letters = TUTORIAL_LETTERS,
    advice = TUTORIAL_ADVICE,
    state = null,
  } = {}) {
    this.goals = goals;
    this.letterDefinitions = letters;
    this.adviceDefinitions = advice;
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
      const rendered = authorTutorialLetter(
        definition.id,
        definition.render({ model, events, state: this.readState() }),
      );
      const delivery = rendered.delivery ?? definition.delivery
        ?? tutorialLetterDelivery(definition.id);
      for (const letter of this.state.letters) {
        if (letter.delivery === 'message') letter.unread = false;
      }
      this.state.letters.push({
        id: definition.id,
        source: definition.source ?? 'event',
        delivery,
        announced: false,
        attention: rendered.attention ?? definition.attention
          ?? TUTORIAL_LETTER_ATTENTION[definition.id] ?? 'action',
        issuedDay: model.day,
        issuedTick: model.tick,
        unread: true,
        ...rendered,
        title: playerFacingText(rendered.title),
        summary: playerFacingText(rendered.summary),
        body: playerFacingText(rendered.body),
        elenaMessage: playerFacingText(
          rendered.elenaMessage ?? TUTORIAL_LETTER_MESSAGES[definition.id] ?? '',
        ),
      });
    }

    const evaluateGoal = goal => {
      const result = goal.evaluate({ model, events, state: this.readState() });
      this.state.goalResults[goal.id] = clone(result);
      if (result.complete) this.state.completedGoals.push(goal.id);
    };
    for (const goal of this.goals) {
      if (!isRequiredTutorialGoal(goal) || this.state.completedGoals.includes(goal.id)) continue;
      evaluateGoal(goal);
      break;
    }
    for (const goal of this.goals) {
      if (isRequiredTutorialGoal(goal) || this.state.completedGoals.includes(goal.id)) continue;
      if (!isTutorialGoalUnlocked(goal, this.state)) continue;
      evaluateGoal(goal);
    }

    for (const definition of this.adviceDefinitions) {
      if (definition.startAfter
        && !this.state.completedGoals.includes(definition.startAfter)) continue;
      const previous = this.state.adviceState[definition.id] ?? {};
      const result = definition.evaluate({
        model, events, state: this.readState(), previous: clone(previous),
      });
      this.state.adviceState[definition.id] = clone(result.evidence ?? previous);
      let row = this.state.advice.find(candidate => candidate.id === definition.id);
      if (result.completed) {
        if (row) {
          row.completed = true;
          row.unread = false;
        }
        continue;
      }
      if (!result.active) {
        if (definition.dismissWhenInactive && row) row.unread = false;
        continue;
      }
      const repeatAfterDays = definition.repeatAfterDays ?? Infinity;
      const shouldIssue = !row || model.day - row.issuedDay >= repeatAfterDays;
      if (!shouldIssue) continue;
      const next = {
        id: definition.id,
        channel: definition.channel ?? 'advice',
        priority: result.priority ?? 'info',
        kicker: result.kicker ?? 'エレナの助言',
        title: playerFacingText(result.title),
        detail: playerFacingText(result.detail),
        speech: playerFacingText(result.speech ?? ''),
        target: clone(result.target ?? null),
        issuedDay: model.day,
        issuedTick: model.tick,
        repeatCount: (row?.repeatCount ?? 0) + 1,
        unread: true,
        completed: false,
      };
      if (row) Object.assign(row, next);
      else this.state.advice.push(next);
    }
    return this.readState();
  }

  currentObjective() {
    if (!this.state.active) return null;
    const requiredGoals = this.goals.filter(isRequiredTutorialGoal);
    const current = requiredGoals.find(goal => !this.state.completedGoals.includes(goal.id));
    const goal = current ?? requiredGoals.at(-1);
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
      title: TUTORIAL_PLAYER_TITLES[goal.id] ?? goal.title,
      elenaMessage: TUTORIAL_ELENA_MESSAGES[goal.id] ?? '',
      elenaCompletion: TUTORIAL_ELENA_COMPLETIONS[goal.id] ?? '',
      systemInstruction: TUTORIAL_SYSTEM_INSTRUCTIONS[goal.id] ?? '',
      ...result,
      detail: playerFacingText(result.detail),
      complete: this.state.completedGoals.includes(goal.id) || result.complete,
    });
  }

  isComplete() {
    const requiredGoals = this.goals.filter(isRequiredTutorialGoal);
    return requiredGoals.length > 0
      && requiredGoals.every(goal => this.state.completedGoals.includes(goal.id));
  }

  isActive() {
    return this.state.active;
  }

  letters() {
    return clone(this.state.letters);
  }

  visibleLetters() {
    return clone(this.state.letters.filter(letter => letter.delivery !== 'message'));
  }

  messages() {
    return clone(this.state.letters.filter(letter => letter.delivery === 'message'));
  }

  advice() {
    return clone(this.state.advice);
  }

  markLetterRead(id) {
    const letter = this.state.letters.find(candidate => candidate.id === id);
    if (!letter) return false;
    letter.unread = false;
    return true;
  }

  markLetterAnnounced(id) {
    const letter = this.state.letters.find(candidate => candidate.id === id);
    if (!letter) return false;
    letter.announced = true;
    return true;
  }

  markAdviceRead(id) {
    const row = this.state.advice.find(candidate => candidate.id === id);
    if (!row) return false;
    row.unread = false;
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
