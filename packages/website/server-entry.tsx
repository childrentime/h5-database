import { renderToPipeableStream } from "react-dom/server";
import express from "express";
import { getConfig } from "../mpa-ssr/configs/runtime.config";
import { pageEntries } from "../mpa-ssr/configs/entry";
import { InsertCss, StyleContext, ISOStyle } from "@mpa-ssr/core";
import { Transform } from "stream";
import { Provider, enableStaticRendering } from "mobx-react";
import { AppStore } from "./app/home/store";
import { STREAMING_DESERIALIZATION_EVENT } from "./constant";
import { toJS } from "./store/utils";
import serializeJavascript from "serialize-javascript";

enableStaticRendering(true);
const app = express();


app.get("*", async (req, res) => {
  const { url } = req;
  const path = url.split("/").pop()!.split(".")[0];

  if (!pageEntries[path]) {
    return;
  }

  const { assets, pages, header } = getConfig();

  const Page = pages[path];

  const asset = assets[path] as {
    js: string[] | string;
  };

  const { js } = asset;
  const jsArr = typeof js === "string" ? [js] : [...js];
  const criticalStyles = new Map<string, string>();
  const insertCss: InsertCss = (styles: ISOStyle[]) => {
    styles.forEach((style) => {
      criticalStyles.set(style._getHash(), style._getCss());
    });
  };

  const preloadJS = jsArr.map(js => {
    return `<link rel="preload" href="${js}" as="script"/>`
  })

  // SSR之前，js资源可以先发了preload
  res.setHeader("content-type", "text/html");
  res.write(`<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>React App</title>
    ${preloadJS}
    `)

  const store = new AppStore();
  const promiseArr = store.streamSSR()
  await store.SSR();

  const jsx = (
    <StyleContext.Provider value={{ insertCss }}>
      <Provider store={store}>
        <Page />
      </Provider>
    </StyleContext.Provider>
  );

  const { pipe, abort } = renderToPipeableStream(jsx, {
    bootstrapScripts: [...jsArr],
    onShellReady() {

      const injectableTransform = new Transform({
        transform(chunk, encoding, callback) {
          this.push(chunk);
          callback();
        }
      })

      const styles = [...criticalStyles.keys()]
        .map((key) => {
          const style = criticalStyles.get(key);
          return `<style type="text/css" id=${key}>${style}</style>`;
        })
        .join("");

      res.write(`
        ${styles}
        <script>window.data=${serializeJavascript(toJS(store),{isJSON: true})}</script>
      </head>
      <body>
        <div id="main">`);
      criticalStyles.clear();
      pipe(injectableTransform).pipe(res,{end: false});
      
      // 流式输出 模块的关键性CSS 部分补全store
      promiseArr.forEach(promise => {
        promise.then(data => {
          console.log('chunk data',data)
          const applyScript = `<script async>
          const event = new CustomEvent('${STREAMING_DESERIALIZATION_EVENT}', {
            detail: ${serializeJavascript(data,{isJSON: true})}
          });document.dispatchEvent(event);</script>`;
          const styles = [...criticalStyles.keys()]
          .map((key) => {
            const style = criticalStyles.get(key);
            return `<style type="text/css" id=${key}>${style}</style>`;
          })
          .join("");
          const applyStyle = `<script async>document.head.insertAdjacentHTML("beforeend", ${JSON.stringify(
            styles
          )});</script>`;
          res.write(`${applyStyle}${applyScript}`);
          criticalStyles.clear();
        })
      })
      // 所有流式接口都完成后，结束res
      Promise.all(promiseArr).then(() => {
        res.end();
      })
    },
    onShellError(error) {
      console.log(error);
      res.statusCode = 500;
      res.setHeader("content-type", "text/html");
      res.end("<h1>Something went wrong</h1>");
    },
    onError(error) {
      console.error(error);
    },
  });

  setTimeout(() => {
    abort();
    //TODO: fallback 到csr
  }, 10000);
});

export { app };
