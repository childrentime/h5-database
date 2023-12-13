"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/index.ts





var _coreutils = require('@mpa-ssr/core-utils');
var navigation = {};
if (_coreutils.isClient) {
  let querys = _coreutils.parseQuery.call(void 0, window.location.search);
  navigation = exports.navigation = window.Navigation = {
    querySet: null,
    back: (url, onSuccess) => {
      setTimeout(function() {
        if (url == null) {
          history.back();
        } else {
          location.href = url;
        }
        typeof onSuccess === "function" && onSuccess();
      }, 0);
    },
    replaceURL: (url, onSuccess, state = null) => {
      querys = _coreutils.parseUrlQuery.call(void 0, url);
      try {
        history.replaceState(state, "", url);
      } catch (e) {
        console.error(e);
      }
      typeof onSuccess === "function" && onSuccess();
    },
    replaceQuery: function(query, onSuccess) {
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
          is_back: "1"
        }
      );
      window.Navigation.replaceURL(
        _coreutils.appendQuery.call(void 0, window.Navigation.querySet, location.href),
        () => {
        },
        window.history.state
      );
    },
    forward: (url, onSuccess) => {
      navigation.prepareForwardUrl();
      setTimeout(function() {
        location.href = url;
        typeof onSuccess === "function" && onSuccess();
      }, 0);
    }
  };
}


exports.navigation = navigation;
