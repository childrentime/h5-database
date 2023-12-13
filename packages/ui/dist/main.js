"use strict";Object.defineProperty(exports, "__esModule", {value: true});var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));

// tabSlider/index.tsx
var _core = require('@reactuses/core');





var _react = require('react');

// tabSlider/bounceDistance.ts
function bounceDistance(min, max, value, maxBounceDistance, bounceRate = 10) {
  if (value < min) {
    return min - Math.min((min - value) / bounceRate, maxBounceDistance);
  }
  if (value > max) {
    return max + Math.min((value - max) / bounceRate, maxBounceDistance);
  }
  return value;
}

// tabSlider/gesture.ts
var isSwipeLeft = (dx, dy, dt) => {
  return Math.abs(dx) > Math.abs(dy) && dx < 0 && Math.abs(dx) > 10 && Math.abs(dx / dt) > 0.3;
};
var isSwipeRight = (dx, dy, dt) => {
  return Math.abs(dx) > Math.abs(dy) && dx > 0 && Math.abs(dx) > 10 && Math.abs(dx / dt) > 0.3;
};

// tabSlider/scroll.ts
function setScrollTop(value, node) {
  if (node && node !== document.body) {
    node.scrollTop = value;
    return;
  }
  if (value === 0) {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    return;
  }
  document.body.scrollTop = value;
  if (document.body.scrollTop !== 0) {
    return;
  }
  document.documentElement.scrollTop = value;
}

// tabSlider/index.tsx
var _jsxruntime = require('react/jsx-runtime');
var DEFUALT_DURATION = 300;
var MOVE_SPEED = 1.2;
function TabSlider(props) {
  const {
    children,
    index,
    reserveScrollPosition = true,
    className,
    style,
    onSlide,
    onSlideEnd,
    disable
  } = props;
  const rootRef = _react.useRef.call(void 0, null);
  const contentRef = _react.useRef.call(void 0, null);
  const rerender = _core.useUpdate.call(void 0, );
  const dnrRef = _react.useRef.call(void 0, {
    width: 0,
    activeIndex: index,
    startX: 0,
    startY: 0,
    startTime: 0,
    direction: 0 /* Unkown */,
    lock: false,
    isTransition: false,
    isGesture: false,
    offsets: [],
    isIndexChange: false,
    offset: 0
  });
  const length = _react.Children.count(children);
  _react.useEffect.call(void 0, () => {
    if (!rootRef.current) {
      return;
    }
    dnrRef.current.width = rootRef.current.offsetWidth;
    const onResize = () => {
      if (!rootRef.current) {
        return;
      }
      dnrRef.current.width = rootRef.current.offsetWidth;
      rerender();
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);
  const moveEnd = _react.useCallback.call(void 0, () => {
    const dnr = dnrRef.current;
    dnr.lock = false;
    dnr.isTransition = false;
    if (reserveScrollPosition) {
      setScrollTop(dnr.offsets[dnr.activeIndex]);
    }
    if (dnr.isIndexChange) {
      onSlideEnd == null ? void 0 : onSlideEnd(dnr.activeIndex);
    }
  }, []);
  const doMove = _react.useCallback.call(void 0, 
    (moveParams) => {
      const computedStyle = getComputedStyle(contentRef.current);
      const { isTransition, offset, index: index2, isGesture, immediately } = moveParams;
      const getElTranlateX = () => {
        const left = computedStyle.left;
        return Number(left.replace("px", "")) || 0;
      };
      const move = () => {
        const dnr = dnrRef.current;
        if (dnr.lock) {
          dnr.lock = true;
        }
        dnr.isTransition = isTransition;
        dnr.isGesture = isGesture;
        dnr.isIndexChange = index2 !== dnr.activeIndex;
        const rootRec = rootRef.current.getBoundingClientRect();
        const rootRecTop = Math.round(rootRec.top);
        dnr.offsets[dnr.activeIndex] = -rootRecTop;
        const currentTranslateX = -dnr.activeIndex * dnr.width + dnr.offset;
        const totalWidth = dnr.width * (length - 1);
        const targetTranslateX = bounceDistance(
          -totalWidth,
          0,
          -index2 * dnr.width + offset,
          dnr.width,
          5
        );
        const dis = Math.abs(currentTranslateX - targetTranslateX);
        let transitionDuration = 0;
        if (isTransition && dis && getElTranlateX() !== targetTranslateX) {
          transitionDuration = DEFUALT_DURATION;
        }
        const content = contentRef.current;
        content.style.left = `${targetTranslateX}px`;
        content.style.transitionDuration = `${transitionDuration}ms`;
        content.style.webkitTransitionDuration = `${transitionDuration}ms`;
        dnr.activeIndex = index2;
        dnr.offset = offset;
        console.log(
          "index",
          dnr.activeIndex,
          isGesture,
          isTransition,
          dnr.isIndexChange
        );
        if (dnr.isIndexChange && dnr.isGesture) {
          onSlide == null ? void 0 : onSlide(dnr.activeIndex);
        }
        if (!isTransition && !dnr.isGesture) {
          moveEnd();
        }
        if (isTransition && transitionDuration === 0) {
          moveEnd();
        }
      };
      if (immediately) {
        move();
      } else {
        requestAnimationFrame(() => {
          move();
        });
      }
    },
    [moveEnd]
  );
  const handleTransitionEnd = _react.useCallback.call(void 0, 
    (e) => {
      console.log("transition end");
      if (e.target !== e.currentTarget) {
        return;
      }
      moveEnd();
    },
    [moveEnd]
  );
  const onStart = _react.useCallback.call(void 0, (e) => {
    const touch = e.touches[0];
    const dnr = dnrRef.current;
    dnr.startX = touch.clientX;
    dnr.startY = touch.clientY;
    dnr.direction = 0 /* Unkown */;
    dnr.startTime = Date.now();
  }, []);
  const onMove = _react.useCallback.call(void 0, 
    (e) => {
      const touch = e.touches[0];
      const dnr = dnrRef.current;
      const moveX = touch.clientX - dnr.startX;
      const moveY = touch.clientY - dnr.startY;
      if (dnr.isTransition) {
        e.preventDefault();
        dnr.startX = touch.clientX;
        dnr.startY = touch.clientY;
        dnr.direction = 0 /* Unkown */;
        dnr.startTime = Date.now();
        return;
      }
      if (dnr.direction === 0 /* Unkown */) {
        const absX = Math.abs(moveX);
        const absY = Math.abs(moveY);
        if (absX > absY) {
          dnr.direction = 1 /* Horizontal */;
        } else {
          dnr.direction = 2 /* Vertical */;
        }
      }
      if (dnr.direction === 1 /* Horizontal */) {
        e.preventDefault();
        doMove({
          isTransition: false,
          // 精确到小数点2位解决抖动问题
          offset: Math.ceil(moveX * MOVE_SPEED * 100) / 100,
          index: dnr.activeIndex,
          isGesture: true,
          immediately: true
        });
      }
    },
    [doMove]
  );
  const onEnd = _react.useCallback.call(void 0, 
    (e) => {
      const dnr = dnrRef.current;
      const touch = e.changedTouches[0];
      const { startX, startY, startTime, width, activeIndex, offset } = dnr;
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      const dt = Date.now() - startTime;
      let newIndex = activeIndex;
      if (dnr.direction === 1 /* Horizontal */) {
        if (isSwipeLeft(dx, dy, dt)) {
          newIndex += 1;
        } else if (isSwipeRight(dx, dy, dt)) {
          newIndex -= 1;
        } else if (Math.abs(offset) > width * 0.5) {
          if (offset > 0) {
            newIndex -= 1;
          } else {
            newIndex += 1;
          }
        }
        newIndex = Math.min(Math.max(newIndex, 0), length - 1);
        doMove({
          index: newIndex,
          offset: 0,
          isTransition: true,
          isGesture: true,
          immediately: true
        });
      }
      dnr.direction = 0 /* Unkown */;
    },
    [doMove]
  );
  _react.useEffect.call(void 0, () => {
    const dnr = dnrRef.current;
    if (dnr.activeIndex !== index) {
      const isTransition = !disable && Math.abs(dnr.activeIndex - index) === 1;
      doMove({
        index: Math.min(Math.max(index, 0), length - 1),
        offset: 0,
        isTransition,
        isGesture: false,
        immediately: false
      });
    }
  }, [index]);
  _react.useEffect.call(void 0, () => {
    if (disable) {
      return;
    }
    if (!rootRef.current) {
      return;
    }
    const root = rootRef.current;
    root.addEventListener("touchstart", onStart);
    root.addEventListener("touchmove", onMove);
    root.addEventListener("touchend", onEnd);
    root.addEventListener("touchcancel", onEnd);
    return () => {
      if (!rootRef.current) {
        return;
      }
      root.removeEventListener("touchstart", onStart);
      root.removeEventListener("touchmove", onMove);
      root.removeEventListener("touchend", onEnd);
      root.removeEventListener("touchcancel", onEnd);
    };
  }, []);
  return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, 
    "div",
    {
      ref: rootRef,
      className,
      style: __spreadProps(__spreadValues({}, style), {
        overflowX: "hidden",
        width: "100%"
      }),
      children: /* @__PURE__ */ _jsxruntime.jsx.call(void 0, 
        "div",
        {
          style: {
            position: "relative",
            width: "100%",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "stretch",
            touchAction: "pan-x pan-y",
            transitionTimingFunction: "ease-out",
            transitionProperty: "left",
            willChange: "left",
            left: 0,
            transitionDuration: "0.3s",
            WebkitTransitionDuration: "0.3s"
          },
          onTransitionEnd: handleTransitionEnd,
          ref: contentRef,
          children: _react.Children.map(children, (child, i) => {
            return /* @__PURE__ */ _jsxruntime.jsx.call(void 0, "div", { children: child }, i);
          })
        }
      )
    }
  );
}


exports.TabSlider = TabSlider;
