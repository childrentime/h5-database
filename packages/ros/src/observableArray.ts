import { isBatching } from "./batch";
import { Observer, observerContext } from "./observer";
import { IObservable, IObservableMode } from "./types";
import { addHiddenFinalProp } from "./utils";
import { origin } from "./env";
import { createChildObservable } from "./observables";
import { Computed, computedContext } from "./computed";

const arrayChangeMethod = [
  "copyWithin",
  "fill",
  "pop",
  "push",
  "reverse",
  "shift",
  "sort",
  "splice",
  "unshift",
] as const;

type ArrayChangeMethod = typeof arrayChangeMethod;

const arrayHandlers: ProxyHandler<
  Array<any> & { [origin]: ObservableArray<any> }
> = {
  get(target, prop) {
    const observableArray = target[origin];

    if (prop === origin) {
      return observableArray;
    }

    /** @ts-ignore */
    if (arrayChangeMethod.includes(prop)) {
      return function (...args: readonly any[]) {
        const result = Reflect.apply(
          target[prop as ArrayChangeMethod[number]],
          target,
          args
        );
        observableArray.notify();
        return result;
      };
    }
    observableArray.observe();
    return Reflect.get(target, prop);
  },

  set(target, prop, value): boolean {
    const observableArray = target[origin];
    const result = Reflect.set(target, prop, value);
    /**
     * length change
     */
    if (prop === "length") {
      observableArray.notify();
      return result;
    }
    /**
     * index change
     */
    if (!(typeof prop === "symbol" || isNaN(+prop))) {
      observableArray.notify();
      return result;
    }

    return result;
  },
};

export class ObservableArray<T> extends IObservable {
  contexts: Set<Observer | Computed>;

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
  /**
   * proxy object, don't create it when in ref mode
   */
  proxy: T[] | undefined;
  /**
   * origin object
   */
  target: T[];
  /**
   * observe mode
   */
  mode: IObservableMode;

  constructor(
    value: T[],
    options: {
      mode?: IObservableMode;
      parentContexts?: Set<Observer | Computed> | null;
    } = {}
  ) {
    super();
    const { mode = "deep", parentContexts = null } = options;
    addHiddenFinalProp(value, origin, this);
    this.contexts = new Set();
    this.mode = mode;
    if (parentContexts) {
      this.contexts = parentContexts;
    }
    this.target = value;
    if (this.mode === "ref") {
      return;
    }

    this.proxy = new Proxy(value, arrayHandlers);
    /**
     * recursively transfrom to observables
     */
    if (this.mode === "deep") {
      for (let index = 0; index < this.target.length; index++) {
        const value = this.target[index];
        const observable = createChildObservable(value, this.contexts);
        this.target[index] = observable;
      }
    }
  }

  /**
   * auto dependency collect
   */
  public get value(): T[] {
    if (this.mode === "ref") {
      return this.target;
    }
    this.observe();
    return this.proxy as T[];
  }

  /**
   * vue3 reactive can't reassign array
   * clear and push origin object
   */
  public set value(value: T[]) {
    if (this.target === value) {
      return;
    }
    this.target.length = 0;
    this.target.push(...value);
    this.notify();
  }

  public observe() {
    if (computedContext !== undefined) {
      if (!computedContext.observables.has(this)) {
        computedContext.observables.add(this);
        this.contexts.add(computedContext);
      }
      return;
    }
    if (
      observerContext !== undefined &&
      !observerContext.observables.has(this)
    ) {
      observerContext.observables.add(this);
      this.contexts.add(observerContext);
    }
  }

  /**
   * trigger rerender
   */
  public notify = () => {
    /**
     * modify in context will cause infinite loop
     */
    if (observerContext || computedContext) {
      return;
    }
    if (isBatching) {
      this.computes.forEach((c) => (c.status = "out-of-date"));
      this.observers.forEach((o) => (o.status = "out-of-date"));
    } else {
      this.computes.forEach((c) => c.trigger());
      this.observers.forEach((o) => o.trigger());
    }
  };

  public register = (context: Observer) => {
    this.contexts.add(context);
  };

  public unregister = (context: Observer) => {
    this.contexts.delete(context);
  };

  public peek(): T[] {
    return this.target;
  }

  toJSON = () => {
    return JSON.stringify(this.target);
  };

  toString = () => {
    return String(this.target);
  };

  valueOf = () => {
    return this.target;
  };

  [Symbol.toPrimitive] = () => {
    return this.valueOf();
  };
}
