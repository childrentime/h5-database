import { Request, Response, NextFunction } from "express";
import { matchBackCache } from "./common";

const backCacheScript: string = `function backCacheScript({ mainNodeSelector }) {
  const MAIN_NODE_SELECTOR = "#main";
  const HISTORY_CACHED_HTML = "BC_CACHED_HTML";
  const HISTORY_CACHED_STORES = "BC_CACHED_STORES";
  mainNodeSelector = mainNodeSelector || MAIN_NODE_SELECTOR;
  /**
   * 恢复history.state[HISTORY_CACHED_STORES]中的stores到rawData中
   */

  const { history } = window;

  if (history && history.state && history.state[HISTORY_CACHED_STORES]) {
    window.rawData = history.state[HISTORY_CACHED_STORES];
  }
  /**
   * 恢复history.state[HISTORY_CACHED_HTML]中的html、css到mainNode中作为占位
   */

  const mainNode = document.querySelector(mainNodeSelector);

  if (history.state && history.state[HISTORY_CACHED_HTML] && mainNode) {
    document.querySelector(mainNodeSelector).innerHTML =
      history.state[HISTORY_CACHED_HTML];
  }
};`;

export interface BackUpMiddlewareOptions {
  main: string;
}

export const middleware = (options: BackUpMiddlewareOptions) => {
  const { main } = options;
  const scriptStr = `(${backCacheScript})({mainNodeSelector:'${main}'})`;
  return (req: Request, res: Response, next: NextFunction) => {
    const { query = {} } = req;

    if (matchBackCache(query)) {
      req.query.ssr = '0';
      res.locals.backCacheScript = scriptStr;
    }

    next();
  };
};
