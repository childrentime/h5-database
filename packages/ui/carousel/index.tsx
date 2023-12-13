import { CSSProperties, PropsWithChildren, useEffect, useState } from "react";

export interface CarouselProps {
  /**
   * @default y
   */
  axis?: "x" | "y";
  className?: string;
  style?: CSSProperties;
}

const FIRST = 0;
/**
 * 实现首尾循环轮播需要首尾元素相同
 */
export const Carousel = (props: PropsWithChildren<CarouselProps>) => {
  const { children, className, style, axis } = props;

  const [transition, setTransition] = useState(true);
  const [index, setIndex] = useState(FIRST);

  const play = () => {
    setTimeout(() => {
      setTransition(true);
      setIndex((index) => index + 1);
    }, 3000);
  };

  const end = () => {
    // 如果索引等于第一个索引了 切换回第一张图片 停止动画
    if (index !== FIRST && index % length === FIRST) {
      setTransition(false);
      setIndex(FIRST);
    }
    play();
  };

  useEffect(() => {
    if (length < 2) {
      return;
    }
    play();
  }, [length]);

  return (
    <div
      style={{
        ...style,
        ...(transition ? { transition: "transform 500ms ease 0s" } : {}),
        transform: `translate3d(-${axis === "x" ? index * 100 : 0}%, -${
          axis === "y" ? index * 100 : 0
        }%, 0px)`,
      }}
      className={className}
      onTransitionEnd={end}
    >
      {children}
    </div>
  );
};
