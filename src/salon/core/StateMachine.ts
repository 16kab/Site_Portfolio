export type State =
  | 'LOADING'
  | 'WAITING_CLICK'
  | 'INTRO'
  | 'TV_ON'
  | 'ZAPPING'
  | 'ENTERING'
  | 'IN_PROJECT'
  | 'EXITING'
  | 'TV_OFF'
  | 'OVERHEATING';

/** Allowed transitions (see CLAUDE.md §6.5). */
const TRANSITIONS: Record<State, readonly State[]> = {
  LOADING: ['WAITING_CLICK', 'TV_ON'],
  WAITING_CLICK: ['INTRO'],
  INTRO: ['TV_ON'],
  TV_ON: ['ZAPPING', 'ENTERING', 'TV_OFF', 'OVERHEATING'],
  ZAPPING: ['TV_ON', 'ZAPPING', 'TV_OFF', 'OVERHEATING'],
  ENTERING: ['IN_PROJECT'],
  IN_PROJECT: ['EXITING'],
  EXITING: ['TV_ON'],
  TV_OFF: ['TV_ON'],
  OVERHEATING: ['TV_OFF'],
};

type Listener = (next: State, prev: State) => void;

export class StateMachine {
  private current: State;
  private listeners: Listener[] = [];

  constructor(initial: State) {
    this.current = initial;
  }

  get state(): State {
    return this.current;
  }

  is(...states: State[]): boolean {
    return states.includes(this.current);
  }

  can(next: State): boolean {
    return TRANSITIONS[this.current].includes(next);
  }

  go(next: State): boolean {
    if (!this.can(next)) {
      if (import.meta.env.DEV) {
        console.warn(`[state] refused ${this.current} → ${next}`);
      }
      return false;
    }
    const prev = this.current;
    this.current = next;
    for (const listener of this.listeners) listener(next, prev);
    return true;
  }

  onChange(listener: Listener): void {
    this.listeners.push(listener);
  }
}
