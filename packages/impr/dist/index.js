"use strict";Object.defineProperty(exports, "__esModule", {value: true});var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var __privateWrapper = (obj, member, setter, getter) => ({
  set _(value) {
    __privateSet(obj, member, value, setter);
  },
  get _() {
    return __privateGet(obj, member, getter);
  }
});
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.ts
var _react = require('react');

// src/provider.tsx

var _jsxruntime = require('react/jsx-runtime');
var noop = () => {
};
var ImprContext = _react.createContext.call(void 0, noop);
var ImprProvider = (props) => {
  const { children, value } = props;
  return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, ImprContext.Provider, { value, children });
};

// src/index.ts
var _reactdom = require('react-dom');

// src/observer.ts
require('intersection-observer');
var MIN_RATIO_THRESHOLD = 0.75;
var OBSERVER_CONFIGS = {
  rootMargin: "0px",
  threshold: [MIN_RATIO_THRESHOLD]
};
var _uniqid, _observer, _entryQuene, _elStore, _stashQuene, _lastTimer, _sendImprMetrics;
var ImprObserver = class {
  constructor() {
    __privateAdd(this, _uniqid, void 0);
    __privateAdd(this, _observer, void 0);
    __privateAdd(this, _entryQuene, void 0);
    __privateAdd(this, _elStore, void 0);
    __privateAdd(this, _stashQuene, void 0);
    __privateAdd(this, _lastTimer, void 0);
    __privateAdd(this, _sendImprMetrics, void 0);
    this.init = () => __async(this, null, function* () {
      if (typeof window === "undefined") {
        return;
      }
      this.createOberver();
    });
    this.createOberver = () => {
      __privateSet(this, _observer, new IntersectionObserver(
        this.observerCallBack,
        OBSERVER_CONFIGS
      ));
      Array.isArray(__privateGet(this, _stashQuene)) && __privateGet(this, _stashQuene).forEach((func) => {
        func && func();
      });
      __privateSet(this, _stashQuene, []);
    };
    this.observerCallBack = (entries) => {
      entries.forEach((entry) => {
        const uniqId = parseInt(
          entry.target.dataset.uniqid || "",
          10
        );
        if (!uniqId) {
          return;
        }
        const shouldTrigger = entry.isIntersecting && entry.intersectionRatio >= MIN_RATIO_THRESHOLD;
        const { delay = 0 } = __privateGet(this, _elStore).get(uniqId) || {};
        if (shouldTrigger) {
          if (delay === 0) {
            this.log(uniqId);
            return;
          }
          __privateGet(this, _entryQuene).set(uniqId, entry);
        } else {
          if (__privateGet(this, _entryQuene).get(uniqId)) {
            if (entry.time - __privateGet(this, _entryQuene).get(uniqId).time >= delay) {
              this.log(uniqId);
            }
            __privateGet(this, _entryQuene).delete(uniqId);
          }
        }
        if (__privateGet(this, _lastTimer)) {
          clearTimeout(__privateGet(this, _lastTimer));
          __privateSet(this, _lastTimer, null);
        }
        __privateSet(this, _lastTimer, setTimeout(() => {
          const keys = [...__privateGet(this, _entryQuene).keys()];
          keys.forEach((id) => {
            this.log(id);
            __privateGet(this, _entryQuene).delete(id);
          });
        }, delay));
      });
    };
    this.log = (id) => {
      if (!__privateGet(this, _elStore).get(id)) {
        return;
      }
      const { info, once, el } = __privateGet(this, _elStore).get(id) || {};
      if (!el) {
        return;
      }
      once && this.unRegister(el, id);
      __privateGet(this, _sendImprMetrics).call(this, info);
    };
    this.register = (elementInfo) => {
      const { el, info, sendImprMetrics } = elementInfo;
      if (!__privateGet(this, _sendImprMetrics)) {
        __privateSet(this, _sendImprMetrics, sendImprMetrics);
      }
      if (!el || !info) {
        return;
      }
      const id = __privateGet(this, _uniqid);
      __privateWrapper(this, _uniqid)._++;
      el.dataset.uniqid = String(id);
      __privateGet(this, _elStore).set(id, elementInfo);
      if (__privateGet(this, _observer)) {
        __privateGet(this, _observer).observe(el);
      } else {
        __privateGet(this, _stashQuene).push(() => {
          __privateGet(this, _observer).observe(el);
        });
      }
    };
    this.unRegister = (el, id) => {
      if (__privateGet(this, _observer)) {
        __privateGet(this, _observer).unobserve(el);
      }
      __privateGet(this, _elStore).delete(id);
      __privateGet(this, _entryQuene).delete(id);
    };
    __privateSet(this, _uniqid, 1);
    __privateSet(this, _observer, null);
    __privateSet(this, _entryQuene, /* @__PURE__ */ new Map());
    __privateSet(this, _elStore, /* @__PURE__ */ new Map());
    __privateSet(this, _stashQuene, []);
    __privateSet(this, _lastTimer, null);
    this.init();
  }
};
_uniqid = new WeakMap();
_observer = new WeakMap();
_entryQuene = new WeakMap();
_elStore = new WeakMap();
_stashQuene = new WeakMap();
_lastTimer = new WeakMap();
_sendImprMetrics = new WeakMap();
var observer_default = new ImprObserver();

// src/index.ts
var Impr = class extends _react.Component {
  constructor() {
    super(...arguments);
    /**
     * 这些属性的变化不需要导致dom的重新渲染
     */
    this.el = null;
    this.isRegistered = false;
    this.lock = false;
    this.componentDidMount = () => {
      const { doImpr = true } = this.props;
      this.el = _reactdom.findDOMNode.call(void 0, this);
      if (doImpr) {
        this.registerImpr();
      }
    };
    this.registerImpr = () => {
      const { trackingInfo, once = true, delay = 0 } = this.props;
      if (!this.el) {
        return;
      }
      console.log("context", this.context);
      observer_default.register({
        el: this.el,
        info: trackingInfo,
        once,
        delay,
        sendImprMetrics: this.context
      });
      this.isRegistered = true;
    };
  }
  render() {
    return _react.Children.only(this.props.children);
  }
};
Impr.contextType = ImprContext;




exports.Impr = Impr; exports.ImprContext = ImprContext; exports.ImprProvider = ImprProvider;
