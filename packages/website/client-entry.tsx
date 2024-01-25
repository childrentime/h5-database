import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { InsertCss, StyleContext } from "@mpa-ssr/core";
import { Provider } from "mobx-react";
import { AppStore } from "./app/home/store";
import { ImprContext } from "@mpa-ssr/impr";
import { STREAMING_DESERIALIZATION_EVENT } from "./constant";
import { promiseMap, promiseStatusMap } from "./decorator/stream";

const startApp = (Page: () => JSX.Element) => {
  const insertCss: InsertCss = (styles) => {
    const removeCss = styles.map((style) => style._insertCss());
    return () => removeCss.forEach((dispose) => dispose());
  };

  const store = new AppStore();
  const data = (window as any).data;
  store.fromSSR(data);
  console.log('store',data,store)

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

  // 同步客户端/服务端promise
  document.addEventListener(STREAMING_DESERIALIZATION_EVENT , (event) => {
    const { detail: data } = event as CustomEvent;
    console.log('data',data)
    const [key,value] = data;
    const promise = promiseMap.get(key)!;
    promise(value).then(() => {
      promiseStatusMap.set(key,'settled')
    }).catch(() => {
      promiseStatusMap.set(key,'settled')
    })
  });
};

export { startApp };
