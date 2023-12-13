import * as react_jsx_runtime from 'react/jsx-runtime';
import { CSSProperties, PropsWithChildren } from 'react';

interface TabSliderProps {
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
declare function TabSlider(props: PropsWithChildren<TabSliderProps>): react_jsx_runtime.JSX.Element;

export { TabSlider, TabSliderProps };
