import {
  parseQuery,
  isClient,
  parseUrlQuery,
  appendQuery,
} from "@mpa-ssr/core-utils";

let navigation = {} as {
  back: (url: string, onSuccess?: () => any) => void;
  replaceURL: (url: string, onSuccess?: () => any, state?: any) => void;
  replaceQuery: (query: Record<PropertyKey, string | undefined>, onSuccess?: () => any) => void
  forward: (url: string, onSuccess?: () => any) => void;
  [key: string]: any;
};

if (isClient) {
  let querys = parseQuery(window.location.search);
  navigation = window.Navigation = {
    querySet: null,
    back: (url: string, onSuccess?: () => any) => {
      setTimeout(function () {
        if (url == null) {
          history.back();
        } else {
          location.href = url;
        }
        typeof onSuccess === "function" && onSuccess();
      }, 0);
    },

    replaceURL: (url: string, onSuccess?: () => any, state = null) => {
      querys = parseUrlQuery(url);
      try {
        history.replaceState(state, "", url);
      } catch (e) {
        console.error(e);
      }
      typeof onSuccess === "function" && onSuccess();
    },

    replaceQuery: function (query: Record<string,string | undefined>, onSuccess?: () => any) {
      window.Navigation.querySet = Object.assign(
        {},
        window.Navigation.querySet,
        query
      );
      typeof onSuccess === "function" && onSuccess();
    },

    prepareForwardUrl: () => {
      window.Navigation.querySet = Object.assign(
        {},
        querys,
        window.Navigation.querySet,
        {
          is_back: "1",
        }
      );
      window.Navigation.replaceURL(
        appendQuery(window.Navigation.querySet, location.href),
        () => {},
        window.history.state
      );
    },

    forward: (url: string, onSuccess?: () => any) => {
      navigation.prepareForwardUrl();
      setTimeout(function () {
        location.href = url;
        typeof onSuccess === "function" && onSuccess();
      }, 0);
    },
  };
}

export { navigation };
