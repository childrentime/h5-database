import { Observer, observerContext } from "./observer";
import { IObservable, IObservableMode } from "./types";
import { addHiddenFinalProp } from "./utils";
import { origin } from "./env";
import { isBatching } from "./batch";
import { createChildObservable } from "./observables";
import { Computed, computedContext } from "./computed";

const setChangeMethod = ["add", "clear", "delete"] as const;

type SetChangeMethod = typeof setChangeMethod;
/**
 * https://stackoverflow.com/a/57958494/17433865
 */
const setHandlers: ProxyHandler<Set<any> & { [origin]: ObservableSet<any> }> = {
  get(target, prop) {
    const observableSet = target[origin];

    if (prop === origin) {
      return observableSet;
    }
    const result = Reflect.get(target, prop);
    /** @ts-ignore */
    if (setChangeMethod.includes(prop)) {
      return function (...args: readonly any[]) {
        const result = Reflect.apply(
          target[prop as SetChangeMethod[number]],
          target,
          args
        );
        observableSet.notify();
        return result;
      };
    }
    observableSet.observe();
    if (typeof result === "function") {
      /** proxy does not has internal slot*/
      return result.bind(target);
    } else {
      return result;
    }
  },
};

export class ObservableSet<T> extends IObservable {
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
  proxy: Set<T> | undefined;
  /**
   * origin object
   */
  target: Set<T>;

  /**
   * observe mode
   */
  mode: IObservableMode;

  constructor(
    set: Set<T>,
    options: {
      mode?: IObservableMode;
      parentContexts?: Set<Observer | Computed> | null;
    } = {}
  ) {
    super();
    const { mode = "deep", parentContexts = null } = options;
    this.contexts = new Set();
    this.mode = mode;

    if (parentContexts) {
      this.contexts = parentContexts;
    }

    if (this.mode === "ref") {
      addHiddenFinalProp(set, origin, this);
      this.target = set;
      return;
    }
    /**
     * recursively transfrom to observables
     */
    if (mode === "deep") {
      const values = [...set.values()];
      set.clear();
      for (const value of values) {
        const observable = createChildObservable(value, this.contexts);
        set.add(observable);
      }
    }

    addHiddenFinalProp(set, origin, this);
    this.proxy = new Proxy(set, setHandlers);
    this.target = set;
  }

  /**
   * auto dependency collect
   */
  public get value(): Set<T> {
    if (this.mode === "ref") {
      return this.target;
    }
    this.observe();

    return this.proxy as Set<T>;
  }

  /**
   * reassign set
   *
   */
  public set value(set: Set<T>) {
    if (this.target === set) {
      return;
    }
    this.target.clear();
    if (this.mode === "deep") {
      const values = [...set.values()];
      for (const value of values) {
        const observable = createChildObservable(value, this.contexts);
        this.target.add(observable);
      }
    } else {
      set.forEach((value) => this.target.add(value));
    }

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

  public peek(): Set<T> {
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
