import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { InsertCss, StyleContext } from "@mpa-ssr/core";
import { Provider } from "mobx-react";
import { AppStore } from "./app/home/store";
import { ImprContext } from "@mpa-ssr/impr";
import { STREAMING_DESERIALIZATION_EVENT } from "./constant";

const startApp = (Page: () => JSX.Element) => {
  /**
   * 反序列化store 在pipe之前在window上挂载 rawData
   */
  console.log("page", Page);
  const insertCss: InsertCss = (styles) => {
    const removeCss = styles.map((style) => style._insertCss());
    return () => removeCss.forEach((dispose) => dispose());
  };

  const store = new AppStore();
  const data = (window as any).data;
  store.fromJS(data);
  store.getStreamPromise();

  console.log('store',store);
  const root = document.getElementById("main") as HTMLElement;

  hydrateRoot(
    root,
    <StrictMode>
      <ImprContext.Provider
        value={(trackingInfo) => {
          console.log("trackingInfo", trackingInfo);
        }}
      >
        <StyleContext.Provider value={{ insertCss }}>
          <Provider store={store}>
            <Page />
          </Provider>
        </StyleContext.Provider>
      </ImprContext.Provider>
    </StrictMode>
  );

  document.addEventListener(STREAMING_DESERIALIZATION_EVENT , (event) => {
    const { detail: data } = event as CustomEvent;
    /** 还需要的数据，知道自己是数组中第几个请求 然后把这个对应的promise resolve掉 */
    const { key, value } = data;
    // @ts-ignore
    store[key].fromJS(value);
  });
};

export { startApp };
