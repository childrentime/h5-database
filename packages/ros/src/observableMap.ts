import { Observer, observerContext } from "./observer";
import { IObservable, IObservableMode } from "./types";
import { addHiddenFinalProp } from "./utils";
import { origin } from "./env";
import { isBatching } from "./batch";
import { createChildObservable } from "./observables";
import { Computed, computedContext } from "./computed";

const mapChangeMethod = ["set", "clear", "delete"] as const;

type MapChangeMethod = typeof mapChangeMethod;
/**
 * https://stackoverflow.com/a/57958494/17433865
 */
const mapHandlers: ProxyHandler<
  Map<any, any> & { [origin]: ObservableMap<any, any> }
> = {
  get(target, prop) {
    const observableMap = target[origin];
    if (prop === origin) {
      return observableMap;
    }
    const result = Reflect.get(target, prop);
    /** @ts-ignore */
    if (mapChangeMethod.includes(prop)) {
      return function (...args: readonly any[]) {
        const map = observableMap.peek();
        if (prop === "set") {
          const [key, newValue] = args;
          const setNewValue = () => {
            if (observableMap.mode === "deep") {
              const observable = createChildObservable(
                newValue,
                observableMap.contexts
              );
              map.set(key, observable);
            } else {
              map.set(key, newValue);
            }
            observableMap.notify();
            return true;
          };
          /** set */
          if (map.has(key)) {
            const value = map.get(key);
            if (value === newValue) {
              return false;
            }
            return setNewValue();
          }
          /** add */
          return setNewValue();
        } else if (prop === "delete") {
          const [key] = args;
          if (!map.has(key)) {
            return false;
          }
          map.delete(key);
          observableMap.notify();
          return true;
        } else if (prop === "clear") {
          if (map.size === 0) {
            return false;
          }
          map.clear();
          observableMap.notify();
          return true;
        }

        /** unexpected not notify */
        return Reflect.apply(
          target[prop as MapChangeMethod[number]],
          target,
          args
        );
      };
    }
    observableMap.observe();
    if (typeof result === "function") {
      /** proxy does not has internal slot*/
      return result.bind(target);
    } else {
      return result;
    }
  },
};

export class ObservableMap<K = any, V = any> extends IObservable {
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
  proxy: Map<K, V> | undefined;
  /**
   * origin object
   */
  target: Map<K, V>;
  /**
   * observe mode
   */
  mode: IObservableMode;

  constructor(
    map: Map<K, V>,
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
      addHiddenFinalProp(map, origin, this);
      this.target = map;
      return;
    }
    /**
     * recursively transfrom to observables
     */
    if (this.mode === "deep") {
      const entries = [...map.entries()];
      for (const [k, v] of entries) {
        const observable = createChildObservable(v, this.contexts);
        map.set(k, observable);
      }
    }

    addHiddenFinalProp(map, origin, this);
    this.target = map;
    this.proxy = new Proxy(map, mapHandlers);
  }

  /**
   * auto dependency collect
   */
  public get value(): Map<K, V> {
    if (this.mode === "ref") {
      return this.target;
    }
    this.observe();

    return this.proxy as Map<K, V>;
  }

  /**
   * reassign set
   *
   */
  public set value(values: Map<K, V>) {
    if (this.target === values) {
      return;
    }
    this.target.clear();
    if (this.mode === "deep") {
      const entries = [...values.entries()];
      for (const [k, v] of entries) {
        const observable = createChildObservable(v, this.contexts);
        this.target.set(k, observable);
      }
    } else {
      values.forEach((value, key) => this.target.set(key, value));
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

  public peek(): Map<K, V> {
    return this.target;
  }

  toJSON = () => {
    return JSON.stringify(Array.from(this.target));
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
