import { Children, Component, PropsWithChildren } from "react";
import { ImprContext } from "./provider";
import { findDOMNode } from "react-dom";
import observer from "./observer";

export interface ImprProps {
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
export class Impr extends Component<PropsWithChildren<ImprProps>> {
  static contextType = ImprContext;

  declare context: React.ContextType<typeof ImprContext>

  render() {
    return Children.only(this.props.children);
  }

  /**
   * 这些属性的变化不需要导致dom的重新渲染
   */
  el: HTMLElement | null = null;
  isRegistered: boolean = false;
  lock: boolean = false;

  componentDidMount = () => {
    const { doImpr = true } = this.props;
    this.el = findDOMNode(this) as HTMLElement;
    if (doImpr) {
      this.registerImpr();
    }
  };

  registerImpr = () => {
    const { trackingInfo, once = true, delay = 0 } = this.props;
    if (!this.el) {
      return;
    }

    console.log('context',this.context);
    observer.register({
      el: this.el,
      info: trackingInfo,
      once,
      delay,
      sendImprMetrics: this.context,
    });
    this.isRegistered = true;
  };
}

export * from './provider';
