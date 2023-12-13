import "intersection-observer";

interface ElementInfo {
  el: HTMLElement;
  info: any;
  once: boolean;
  delay: number;
  sendImprMetrics: (trackingInfo: any) => void;
}

const MIN_RATIO_THRESHOLD = 0.75;
const OBSERVER_CONFIGS = {
  rootMargin: "0px",
  threshold: [MIN_RATIO_THRESHOLD],
};

class ImprObserver {
  #uniqid: number;
  #observer: IntersectionObserver | null;
  #entryQuene: Map<number, IntersectionObserverEntry>;
  #elStore: Map<number, ElementInfo>;
  #stashQuene: ((...args: any) => any)[];
  #lastTimer: ReturnType<typeof setTimeout> | null;
  #sendImprMetrics!: (trackingInfo?: any) => void;

  constructor() {
    this.#uniqid = 1;
    this.#observer = null;
    this.#entryQuene = new Map();
    this.#elStore = new Map();
    this.#stashQuene = [];
    this.#lastTimer = null;
    this.init();
  }

  private init = async () => {
    if (typeof window === "undefined") {
      return;
    }

    this.createOberver();
  };

  private createOberver = () => {
    this.#observer = new IntersectionObserver(
      this.observerCallBack,
      OBSERVER_CONFIGS
    );
    // observer没有建立之前 可能已经有注册曝光的元素了
    Array.isArray(this.#stashQuene) &&
      this.#stashQuene.forEach((func) => {
        func && func();
      });
    this.#stashQuene = [];
  };

  observerCallBack: IntersectionObserverCallback = (entries) => {
    //  与屏幕相交时触发回调，分为进入屏幕和移出屏幕
    entries.forEach((entry) => {
      //  使用opts.inIntersection和otps.intersectionRatio >= threshold均可以判断
      //  但是后者在video标签或内部元素小于外部且外部overflow: hidden的情况会失效
      const uniqId = parseInt(
        (entry.target as HTMLElement).dataset.uniqid || "",
        10
      );
      if (!uniqId) {
        return;
      }

      // Guard against show / hide callback, which doesn't respect threshold.
      // https://github.com/w3c/IntersectionObserver/issues/357
      const shouldTrigger =
        entry.isIntersecting && entry.intersectionRatio >= MIN_RATIO_THRESHOLD;

      const { delay = 0 } = this.#elStore.get(uniqId) || {};
      if (shouldTrigger) {
        if (delay === 0) {
          this.log(uniqId);
          return;
        }
        this.#entryQuene.set(uniqId, entry);
      } else {
        if (this.#entryQuene.get(uniqId)) {
          if (entry.time - this.#entryQuene.get(uniqId)!.time >= delay) {
            this.log(uniqId);
          }
          this.#entryQuene.delete(uniqId);
        }
      }
      //  debounce 防止反复触发
      if (this.#lastTimer) {
        clearTimeout(this.#lastTimer);
        this.#lastTimer = null;
      }
      this.#lastTimer = setTimeout(() => {
        const keys = [...this.#entryQuene.keys()];
        keys.forEach((id) => {
          this.log(id);
          this.#entryQuene.delete(id);
        });
      }, delay);
    });
  };

  log = (id: number) => {
    if (!this.#elStore.get(id)) {
      return;
    }
    const { info, once, el } = this.#elStore.get(id) || {};
    if (!el) {
      return;
    }
    once && this.unRegister(el, id);
    this.#sendImprMetrics(info);
  };

  public register = (elementInfo: ElementInfo) => {
    const { el, info, sendImprMetrics } = elementInfo;
    if (!this.#sendImprMetrics) {
      this.#sendImprMetrics = sendImprMetrics;
    }
    if (!el || !info) {
      return;
    }
    const id = this.#uniqid;
    this.#uniqid++;
    el.dataset.uniqid = String(id);
    this.#elStore.set(id, elementInfo);
    if (this.#observer) {
      this.#observer.observe(el);
    } else {
      this.#stashQuene.push(() => {
        this.#observer!.observe(el);
      });
    }
  };

  unRegister = (el: Element, id: number) => {
    if (this.#observer) {
      this.#observer.unobserve(el);
    }
    this.#elStore.delete(id);
    this.#entryQuene.delete(id);
  };
}

export default new ImprObserver();
