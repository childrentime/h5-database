import * as react from 'react';
import { PropsWithChildren, Component } from 'react';
import * as react_jsx_runtime from 'react/jsx-runtime';

interface SendImprFunc {
    (trackingInfo?: any): void;
}
type ImprPrividerProps = PropsWithChildren<{
    value: SendImprFunc;
}>;
declare const ImprContext: react.Context<SendImprFunc>;
declare const ImprProvider: (props: ImprPrividerProps) => react_jsx_runtime.JSX.Element;

interface ImprProps {
    /**
     * @description 是否曝光
     * @default true
     */
    doImpr?: boolean;
    /**
     * @description 是否一次
     * @default true
     */
    once?: boolean;
    /**
     * @description 埋点信息
     * @default {}
     */
    trackingInfo: any;
    /**
     * @description 是否立即打点
     * @default 0
     */
    delay?: number;
}
declare class Impr extends Component<PropsWithChildren<ImprProps>> {
    static contextType: react.Context<SendImprFunc>;
    context: React.ContextType<typeof ImprContext>;
    render(): react.ReactNode;
    /**
     * 这些属性的变化不需要导致dom的重新渲染
     */
    el: HTMLElement | null;
    isRegistered: boolean;
    lock: boolean;
    componentDidMount: () => void;
    registerImpr: () => void;
}

export { Impr, ImprContext, ImprPrividerProps, ImprProps, ImprProvider, SendImprFunc };
