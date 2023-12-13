import { origin } from "./env";
import { reaction as internalReaction, autorun, when } from "./observer";
import { IObservable } from "./types";
import { observable } from "./decorator";
import {__DEV__} from '@mpa-ssr/core-utils'

const reaction = (values: any[], callback: () => void | (() => void)) => {
  const deps: IObservable[] = [];

  for (const value of values) {
    const dep = value[origin];
    if (!dep && __DEV__) {
      console.log("[reaction]: value is not a observable value", value);
    } else {
      deps.push(dep);
    }
  }

  return internalReaction(deps, callback);
};

export { autorun, when, observable, reaction };
