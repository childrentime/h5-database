import { isBatching } from "./batch";
import { Observer, observerContext } from "./observer";
import { IObservable } from "./types";

export let computedContext: Computed | void = void 0;

export class Computed<T = any> extends IObservable {
  status: "up-to-date" | "out-of-date";
  observables: Set<IObservable>;
  #value!: T;
  getter: () => T;
  contexts: Set<Observer | Computed>;
  /**
   * for debug
   */
  name?: string;

  get observers(): Observer[] {
    return [...this.contexts].filter(
      (c) => c instanceof Observer
    ) as Observer[];
  }

  get computes(): Computed[] {
    return [...this.contexts].filter(
      (c) => c instanceof Computed
    ) as Computed[];
  }

  constructor(getter: () => T, name?: string) {
    super();
    this.getter = getter;
    this.observables = new Set();
    this.status = "out-of-date";
    this.contexts = new Set();
    this.name = name;
  }

  /**
   * defer trigger to [get]
   */
  trigger() {
    this.status = "out-of-date";
    this.notify();
  }

  runWithContext() {
    this.observe();
    const prevContext = computedContext;
    computedContext = this;
    if (this.status !== "up-to-date") {
      this.#value = this.getter();
      this.status = "up-to-date";
    }
    computedContext = prevContext;
  }

  get value(): T {
    this.runWithContext();
    return this.#value;
  }

  public observe() {
    if (
      observerContext !== undefined &&
      !observerContext.observables.has(this)
    ) {
      observerContext.observables.add(this);
      this.contexts.add(observerContext);
    }
    if (
      computedContext !== undefined &&
      !computedContext.observables.has(this)
    ) {
      computedContext.observables.add(this);
      this.contexts.add(computedContext);
    }
  }

  /**
   * make observer know computed value change
   */
  notify = () => {
    if (isBatching) {
      this.computes.forEach((context) => (context.status = "out-of-date"));
      this.observers.forEach((context) => (context.status = "out-of-date"));
    } else {
      this.computes.forEach((c) => c.trigger());
      this.observers.forEach((o) => o.trigger());
    }
  };

  /**
   * if not auto collect deps,trigger once
   */
  public register = (context: Observer) => {
    this.contexts.add(context);
    this.runWithContext();
  };

  public unregister = (context: Observer) => {
    this.contexts.delete(context);
  };

  public peek(): T {
    return this.#value;
  }

  toJSON = () => {
    return JSON.stringify(this.#value);
  };

  toString = () => {
    return String(this.#value);
  };

  valueOf = () => {
    return this.#value;
  };

  [Symbol.toPrimitive] = () => {
    return this.valueOf();
  };
}

export function computed<T>(getter: () => T, name?: string) {
  return new Computed(getter, name);
}
