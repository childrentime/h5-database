import { Observer, observerContext } from "./observer";
import { isBatching } from "./batch";
import { IObservable } from "./types";
import { Computed, computedContext } from "./computed";

export type PrimitiveType = number | string | boolean | null | undefined;

export class ObservableValue<
  T extends PrimitiveType = any
> extends IObservable {
  target: T;
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

  constructor(value: T) {
    super();
    this.target = value;
    this.contexts = new Set();
  }

  public set value(value: T) {
    if (this.target === value) {
      return;
    }
    this.target = value;
    this.notify();
  }

  /**
   * auto dependency collect
   */
  public get value(): T {
    this.observe();
    return this.target;
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
