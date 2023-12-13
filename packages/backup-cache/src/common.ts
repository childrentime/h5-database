import { QUERY_BUILD_VERSION, QUERY_CACHED_HTML } from "./constant";

export function isBackPage() {
  if (typeof window === "undefined") return false;

  return (
    window.performance &&
    performance.navigation &&
    performance.navigation.type === 2
  );
}

/**
 * 需要在服务端判断页面是否会回退
 */
export const matchBackCache = (query: Record<string, any> = {}) => {
  return (
    +query.is_back === 1 &&
    query[QUERY_BUILD_VERSION] === process.env.BUILD_VERSION &&
    +query[QUERY_CACHED_HTML] === 1
  );
};

export const getDocumentCssText = () => {
  const sheet = document.styleSheets;
  const rules = Array.from(sheet)
    .map((s) => {
      try {
        return Array.from(s.cssRules || s.rules);
      } catch (e) {
        return [];
      }
    })
    .reduce((acc, cur) => {
      return acc.concat(cur);
    }, []);
  return rules.map((r) => r.cssText).join("");
};

export const restoreOriginFn = (
  host: any,
  action: any,
  origin: any,
  hack: any
) => {
  host[action] = hack;
  return () => {
    if (host[action] === hack) {
      host[action] = origin;
    }
  };
};

export const setHistoryStateItem = (key: string, value: string) => {
  const { history } = window;
  history.replaceState(
    {
      [key]: value,
    },
    ""
  );
};

export const interceptHistoryState = () => {
  const { history } = window;
  const action = "replaceState";
  const replace = history[action];

  const hack = (...args: any) => {
    if (!args[0]) {
      args[0] = history.state;
    } else {
      args[0] = { ...history.state, ...args[0] };
    }

    return replace.apply(history, args);
  };

  return restoreOriginFn(history, action, replace, hack);
};

export const handleBeforeForward = (cb: any = () => {}) => {
  const actions = ["forward"];
  const clearArr: (() => void)[] = [];
  let enable = true;
  actions.forEach((action) => {
    const origin = navigation[action];

    const hack = (...args: any) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      enable && cb();
      origin.apply(navigation, args);
    };

    clearArr.push(restoreOriginFn(navigation, action, origin, hack));
  });
  return () => {
    enable = false;
    clearArr.forEach((clear) => clear());
  };
};