import { useEffect, useRef, useState } from "react";
import {
  CACHED_NODE_ID,
  HISTORY_CACHED_HTML,
  HISTORY_CACHED_STORES,
  MAIN_NODE_SELECTOR,
  QUERY_BUILD_VERSION,
  QUERY_CACHED_HTML,
} from "./constant";
import {
  getDocumentCssText,
  handleBeforeForward,
  interceptHistoryState,
  setHistoryStateItem,
} from "./common";
import { appendQuery } from "@mpa-ssr/core-utils";
import { navigation } from "@mpa-ssr/navigation";

export interface BackCacheProps {
  store: any;
}
const BackCache = (props: BackCacheProps) => {
  const { store } = props;
  const clearArr = useRef<(() => void)[]>([]);
  const initialized = useRef(false);

  useState(() => {
    // constructor
    if (!process.env.BROWSER || initialized.current) {
      return;
    }
    /**
     * 该组件仅允许被初始化一次
     */
    initialized.current = true; // 缓存store/html/css

    const doCache = ({
      mainNodeSelector = MAIN_NODE_SELECTOR,
    }: any) => {
      try {
        const styleText = `<style>${getDocumentCssText()}</style>`;

        const mainNode = document.querySelector(mainNodeSelector);
        const htmlText = mainNode && mainNode.innerHTML.toString();

        /**
         * 外面包一层section标签是为了再渲染的时候把section的内容清除，避免hydrate出错
         * 插入完整style、html是为了hydrate前首屏占位
         */

        setHistoryStateItem(
          HISTORY_CACHED_HTML,
          `<section id="${CACHED_NODE_ID}">${
            styleText + (htmlText || "")
          }</section>`
        );
      } catch (error) {
        console.error("backcache: 缓存html、css报错 \r\n", error);
      }

      // 当做是服务端渲染，不再发起客户端初始化流程（即使是csr的页面）
      store.isServerRendered = true; // 标记store是否来自回退缓存
      store.$isBackCache = true;

      const plainStore = store.getSnapShot();
      setHistoryStateItem(HISTORY_CACHED_STORES, plainStore);
      navigation.replaceQuery({
        [QUERY_CACHED_HTML]: '1',
        [QUERY_BUILD_VERSION]: process.env.BUILD_VERSION,
      });
    };
    const { history } = window;

    if (
      store &&
      history &&
      /** @ts-ignore */
      history.replaceState
    ) {
      clearArr.current = [
        /**
         * 拦截history.replaceState
         */
        interceptHistoryState(),
        /**
         * 监听navigation的forward、uniformForward事件
         * 在BeforeForward时，做缓存相关动作
         */
        handleBeforeForward(doCache.bind(null)),
      ];
    }
  });

  useEffect(() => {
    const { href } = window.location;

    if (href.includes(`${QUERY_CACHED_HTML}=1`)) {
      // 回退缓存生效后修改标记清理数据，让下拉刷新等场景重新获取数据
      navigation.replaceURL(
        appendQuery(
          {
            [QUERY_CACHED_HTML]: undefined,
            [QUERY_BUILD_VERSION]: undefined,
          },
          href
        ),
        undefined,
        {
          [HISTORY_CACHED_HTML]: null,
          [HISTORY_CACHED_STORES]: null,
        }
      ); // destroy

      return () => {
        clearArr.current.forEach((clear) => clear());
      };
    }
  }, []);
  return null;
};

export default BackCache;
