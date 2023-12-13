import { isBatching } from "./batch";
import { Computed, computedContext } from "./computed";
import { origin } from "./env";
import { createChildObservable } from "./observables";
import { Observer, observerContext } from "./observer";
import { IObservable, IObservableMode } from "./types";
import { addHiddenFinalProp, isProxy, isStringish } from "./utils";

const objectHandlers: ProxyHandler<any & { [origin]: ObservableObject<any> }> =
  {
    set(target, prop: PropertyKey, value: any) {
      const observableObject = target[origin] as ObservableObject<any>;
      if (!isStringish(prop)) {
        return false;
      }
      const oldValue = observableObject.peek()[prop];
      if (oldValue === value) {
        return true;
      }
      const result = Reflect.set(target, prop, value);
      observableObject.notify();
      return result;
    },

    has(target, prop: PropertyKey): boolean {
      const observableObject = target[origin];
      const result = Reflect.has(target, prop);
      observableObject.observe();
      return result;
    },

    deleteProperty(target, prop) {
      const observableObject = target[origin];
      if (!isStringish(prop)) {
        return false;
      }
      const result = Reflect.deleteProperty(target, prop);
      observableObject.notify();
      return result;
    },

    defineProperty(target, prop, value) {
      const observableObject = target[origin];
      if (!isStringish(prop)) {
        return false;
      }
      const result = Reflect.defineProperty(target, prop, value);
      observableObject.notify();
      return result;
    },

    get(target, prop) {
      const observableObject = target[origin] as ObservableObject<any>;

      if (prop === origin) {
        return observableObject;
      }
      const value = target[prop];
      /**
       * default shallow
       */
      if (
        typeof value !== "object" ||
        observableObject.mode !== "deep" ||
        !Object.isExtensible(value)
      ) {
        observableObject.observe();
        return value;
      }
      /**
       * recursively transfrom to observables
       */
      if (isProxy(value)) {
        return value;
      } else {
        const observable = createChildObservable(
          value,
          observableObject.contexts
        );
        target[prop] = observable;
        return observable;
      }
    },
  };

export class ObservableObject<T extends object = any> extends IObservable {
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
  proxy: T | undefined;
  /**
   * origin object
   */
  target: T;
  /**
   * observe mode
   */
  mode: IObservableMode;

  constructor(
    value: T,
    options: {
      mode?: IObservableMode;
      parentContexts?: Set<Observer | Computed> | null;
    } = {}
  ) {
    super();
    this.contexts = new Set();
    const { mode = "deep", parentContexts = null } = options;
    this.mode = mode;
    if (parentContexts) {
      this.contexts = parentContexts;
    }
    addHiddenFinalProp(value, origin, this);
    this.target = value;
    if (this.mode === "ref" || !Object.isExtensible(value)) {
      return;
    }
    this.proxy = new Proxy(value, objectHandlers);
  }

  /**
   * auto dependency collect
   */
  public get value(): T {
    if (this.mode === "ref") {
      return this.target;
    }
    this.observe();
    return this.proxy as T;
  }

  /**
   * reassign object
   *
   */
  public set value(value: T) {
    if (this.target === value) {
      return;
    }
    /**@ts-ignore */
    Object.keys(this.target).forEach((key) => delete this.target[key]);
    Object.assign(this.target, value);
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

  public peek(): T {
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
