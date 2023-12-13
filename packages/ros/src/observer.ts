import { IObservable } from "./types";

export const autorun = (callback: () => void | (() => void)): (() => void) => {
  const observer = new Observer(callback);
  try {
    observer.trigger();
  } catch (error) {
    observer.dispose();
    throw error;
  }

  return observer.dispose.bind(observer);
};

export const reaction = (
  deps: IObservable[],
  callback: () => void | (() => void)
) => {
  const observer = new Observer(callback);
  for (const dep of deps) {
    dep.register(observer);
    observer.observables.add(dep);
  }

  return observer.dispose.bind(observer);
};

export const when = (predicate: () => boolean, callback: () => void) => {
  const dispose = autorun(() => {
    const v = predicate();
    if (v) {
      callback();
      dispose();
    }
  });

  return dispose;
};

/**
 * 执行上下文，收集observer依赖
 */
export let observerContext: Observer | void = void 0;

/**
 * 所有的autorun instance
 */
export const allContext: Set<Observer> = new Set();

export class Observer {
  status: "up-to-date" | "out-of-date";
  observables: Set<IObservable>;
  /**
   * 回调
   */
  callback: () => void | (() => void);
  /**
   * 清理
   */
  #cleanup: (() => void) | void = void 0;
  /**
   * 解除所有订阅
   */
  dispose() {
    this.observables.forEach((observable) => {
      observable.unregister(this);
    });
    allContext.delete(this);
  }

  constructor(callback: () => void | (() => void)) {
    this.callback = callback;
    this.observables = new Set();
    this.status = "up-to-date";
    allContext.add(this);
  }

  trigger() {
    const prevContext = observerContext;
    observerContext = this;
    if (typeof this.#cleanup === "function") {
      this.#cleanup();
    }
    this.#cleanup = this.callback();
    this.status = "up-to-date";
    observerContext = prevContext;
  }

  track(callback: () => void) {
    console.log('track start')
    const prevContext = observerContext;
    observerContext = this;
    callback();
    this.status = "up-to-date";
    observerContext = prevContext;
    console.log('track end')
  }
}
