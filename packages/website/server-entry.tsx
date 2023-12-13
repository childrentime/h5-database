import { renderToPipeableStream } from "react-dom/server";
import express from "express";
import { getConfig } from "../mpa-ssr/configs/runtime.config";
import { pageEntries } from "../mpa-ssr/configs/entry";
import { InsertCss, StyleContext, ISOStyle } from "@mpa-ssr/core";
import { Transform } from "stream";
import { Provider, enableStaticRendering } from "mobx-react";
import { AppStore } from "./app/home/store";
import serialize from "serialize-javascript";
import { STREAMING_DESERIALIZATION_EVENT } from "./constant";

enableStaticRendering(true);
const app = express();

function joinChunk<Chunk extends { toString: () => string }>(
  before = "",
  chunk: Chunk,
  after = ""
) {
  return `${before}${chunk.toString()}${after}`;
}

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

  const store = new AppStore();
  await store.getInitPromise();
  const resultArr = store.getStreamPromise();

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
        transform(_chunk, _encoding, callback) {
          try {
            let chunk = _chunk;
            if (criticalStyles.size !== 0) {
              if (resultArr.length !== 0) {
                const result = resultArr[0];
                const applyScript = `<script async>
                const event = new CustomEvent('${STREAMING_DESERIALIZATION_EVENT}', {
                  detail: ${serialize(result, { isJSON: true })}
                });document.dispatchEvent(event);</script>`;
                chunk = joinChunk(applyScript, chunk);
              }

              const styles = [...criticalStyles.keys()]
                .map((key) => {
                  const style = criticalStyles.get(key);
                  return `<style type="text/css" id=${key}>${style}</style>`;
                })
                .join("");
              const applyStyle = `<script async>document.head.insertAdjacentHTML("beforeend", ${JSON.stringify(
                styles
              )});</script>`;
              chunk = joinChunk(applyStyle, chunk);
            }

            this.push(chunk);
            callback();
          } catch (e) {
            if (e instanceof Error) {
              callback(e);
            } else {
              callback(new Error("Received unkown error when streaming"));
            }
          }
        },
      });

      const styles = [...criticalStyles.keys()]
        .map((key) => {
          const style = criticalStyles.get(key);
          return `<style type="text/css" id=${key}>${style}</style>`;
        })
        .join("");

      res.statusCode = 200;
      res.setHeader("content-type", "text/html");
      res.write(`<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>React App</title>
        ${styles}
        <script>window.data=${serialize(store, { isJSON: true })}</script>
      </head>
      <body>
        <div id="main">`);
      criticalStyles.clear();
      pipe(injectableTransform).pipe(res);
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
    // fallback 到csr
  }, 10000);
});

export { app };
