import { useUpdate } from "@reactuses/core";
import {
  CSSProperties,
  Children,
  PropsWithChildren,
  TransitionEvent,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { bounceDistance } from "./bounceDistance";
import { isSwipeLeft, isSwipeRight } from "./gesture";
import { setScrollTop } from "./scroll";

export interface TabSliderProps {
  /**
   * @description 元素数组索引
   * @default 0
   */
  index: number;
  /**
   * @description 滑动时的回调
   * @default undefined
   */
  onSlide?: (index: number) => void;
  /**
   * @description 滑动完成的回调
   * @default undefined
   */
  onSlideEnd?: (index: number) => void;
  /**
   * @default true
   */
  reserveScrollPosition?: boolean;
  /**
   * @description 禁止手势滑动
   * @default false
   */
  disable?: boolean;
  className?: string;
  style?: CSSProperties;
}

enum Direction {
  Unkown,
  Horizontal,
  Vertical,
}

const DEFUALT_DURATION = 300;
const MOVE_SPEED = 1.2;

export function TabSlider(props: PropsWithChildren<TabSliderProps>) {
  const {
    children,
    index,
    reserveScrollPosition = true,
    className,
    style,
    onSlide,
    onSlideEnd,
    disable,
  } = props;
  const rootRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const rerender = useUpdate();
  const dnrRef = useRef({
    width: 0,
    activeIndex: index,
    startX: 0,
    startY: 0,
    startTime: 0,
    direction: Direction.Unkown,
    lock: false,
    isTransition: false,
    isGesture: false,
    offsets: [] as number[],
    isIndexChange: false,
    offset: 0,
  });
  const length = Children.count(children);

  useEffect(() => {
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

  const moveEnd = useCallback(() => {
    const dnr = dnrRef.current;
    dnr.lock = false;
    dnr.isTransition = false;
    if (reserveScrollPosition) {
      setScrollTop(dnr.offsets[dnr.activeIndex]);
    }
    if (dnr.isIndexChange) {
      onSlideEnd?.(dnr.activeIndex);
    }
  }, []);

  const doMove = useCallback(
    (moveParams: {
      isTransition: boolean;
      offset: number;
      index: number;
      isGesture: boolean;
      /**
       * @default false
       */
      immediately?: boolean;
    }) => {
      const computedStyle = getComputedStyle(contentRef.current!);
      const { isTransition, offset, index, isGesture, immediately } =
        moveParams;

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
        dnr.isIndexChange = index !== dnr.activeIndex;
        const rootRec = rootRef.current!.getBoundingClientRect();
        const rootRecTop = Math.round(rootRec.top);
        dnr.offsets[dnr.activeIndex] = -rootRecTop;

        const currentTranslateX = -dnr.activeIndex * dnr.width + dnr.offset;
        const totalWidth = dnr.width * (length - 1);
        const targetTranslateX = bounceDistance(
          -totalWidth,
          0,
          -index * dnr.width + offset,
          dnr.width,
          5
        );
        const dis = Math.abs(currentTranslateX - targetTranslateX);
        let transitionDuration = 0;
        if (isTransition && dis && getElTranlateX() !== targetTranslateX) {
          transitionDuration = DEFUALT_DURATION;
        }

        /**
         * 执行transfrom
         */
        const content = contentRef.current!;
        content.style.left = `${targetTranslateX}px`;
        content.style.transitionDuration = `${transitionDuration}ms`;
        content.style.webkitTransitionDuration = `${transitionDuration}ms`;

        dnr.activeIndex = index;
        dnr.offset = offset;
        console.log(
          "index",
          dnr.activeIndex,
          isGesture,
          isTransition,
          dnr.isIndexChange
        );

        if (dnr.isIndexChange && dnr.isGesture) {
          onSlide?.(dnr.activeIndex);
        }

        // 非动画且非手势（外部无动画触发），主动结束；
        if (!isTransition && !dnr.isGesture) {
          moveEnd();
        }

        // 如果是动画，但没有动画距离为0，则主动结束；
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

  const handleTransitionEnd = useCallback(
    (e: TransitionEvent) => {
      console.log("transition end");
      if (e.target !== e.currentTarget) {
        return;
      }
      moveEnd();
    },
    [moveEnd]
  );

  const onStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    const dnr = dnrRef.current;
    dnr.startX = touch.clientX;
    dnr.startY = touch.clientY;
    dnr.direction = Direction.Unkown;
    dnr.startTime = Date.now();
  }, []);

  const onMove = useCallback(
    (e: TouchEvent) => {
      const touch = e.touches[0];
      const dnr = dnrRef.current;
      const moveX = touch.clientX - dnr.startX;
      const moveY = touch.clientY - dnr.startY;

      if (dnr.isTransition) {
        e.preventDefault();
        dnr.startX = touch.clientX;
        dnr.startY = touch.clientY;
        dnr.direction = Direction.Unkown;
        dnr.startTime = Date.now();
        return;
      }

      if (dnr.direction === Direction.Unkown) {
        const absX = Math.abs(moveX);
        const absY = Math.abs(moveY);

        if (absX > absY) {
          dnr.direction = Direction.Horizontal;
        } else {
          dnr.direction = Direction.Vertical;
        }
      }
      if (dnr.direction === Direction.Horizontal) {
        e.preventDefault();
        // 被拖住平移，不改变索引的时候
        doMove({
          isTransition: false,
          // 精确到小数点2位解决抖动问题
          offset: Math.ceil(moveX * MOVE_SPEED * 100) / 100,
          index: dnr.activeIndex,
          isGesture: true,
          immediately: true,
        });
      }
    },
    [doMove]
  );

  const onEnd = useCallback(
    (e: TouchEvent) => {
      const dnr = dnrRef.current;
      const touch = e.changedTouches[0];
      const { startX, startY, startTime, width, activeIndex, offset } = dnr;
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      const dt = Date.now() - startTime;
      let newIndex = activeIndex;
      if (dnr.direction === Direction.Horizontal) {
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
          immediately: true,
        });
      }

      dnr.direction = Direction.Unkown;
    },
    [doMove]
  );

  useEffect(() => {
    const dnr = dnrRef.current;
    if (dnr.activeIndex !== index) {
      const isTransition = !disable && Math.abs(dnr.activeIndex - index) === 1;
      doMove({
        index: Math.min(Math.max(index, 0), length - 1),
        offset: 0,
        isTransition,
        isGesture: false,
        immediately: false,
      });
    }
  }, [index]);

  useEffect(() => {
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

  return (
    <div
      ref={rootRef}
      className={className}
      style={{
        ...style,
        overflowX: "hidden",
        width: "100%",
      }}
    >
      <div
        style={{
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
          WebkitTransitionDuration: "0.3s",
        }}
        onTransitionEnd={handleTransitionEnd}
        ref={contentRef}
      >
        {Children.map(children, (child, i) => {
          return <div key={i}>{child}</div>;
        })}
      </div>
    </div>
  );
}
