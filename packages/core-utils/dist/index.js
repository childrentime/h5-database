"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/url.ts
function appendQuery(params, href) {
  const url = new URL(href);
  for (const key in params) {
    const value = params[key];
    if (value === void 0) {
      url.searchParams.delete(key);
    } else {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}
function parseQuery(queryString) {
  const searchParams = new URLSearchParams(queryString);
  const params = {};
  for (const [key, value] of searchParams) {
    if (params.hasOwnProperty(key)) {
      if (Array.isArray(params[key])) {
        params[key].push(value);
      } else {
        params[key] = [params[key], value];
      }
    } else {
      params[key] = value;
    }
  }
  return params;
}
function parseUrlQuery(url) {
  var _a;
  const query = ((_a = url.split("?")) == null ? void 0 : _a[1]) || "";
  return parseQuery(query);
}

// src/env.ts
var __DEV__ = process.env.NODE_ENV !== "production";
var isClient = typeof window !== "undefined";
var isServer = !isClient;

// src/react.ts
var hoistBlackList = {
  $$typeof: true,
  render: true,
  compare: true,
  type: true,
  // Don't redefine `displayName`,
  // it's defined as getter-setter pair on `memo` (see #3192).
  displayName: true
};
function copyStaticProperties(base, target) {
  Object.keys(base).forEach((key) => {
    if (!hoistBlackList[key]) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(base, key));
    }
  });
}








exports.__DEV__ = __DEV__; exports.appendQuery = appendQuery; exports.copyStaticProperties = copyStaticProperties; exports.isClient = isClient; exports.isServer = isServer; exports.parseQuery = parseQuery; exports.parseUrlQuery = parseUrlQuery;
