import { IObservable, IObservableMode } from "./types";
import { observable as innerObservable } from "./observables";
import { isServer } from "@mpa-ssr/core-utils";
import { Computed, computed as innerComputed } from "./computed";

export function observable(
  type: "set" | "map" | "object" | "array" | "box" = "box",
  mode: IObservableMode = "deep"
) {
  return (
    { get, set }: ClassAccessorDecoratorTarget<unknown, any>,
    { name, kind }: ClassAccessorDecoratorContext
  ) => {
    if (kind === "accessor") {
      let obs: IObservable;
      const result: ClassAccessorDecoratorResult<any, any> = {
        init(this, value) {
          if (isServer) {
            obs = value;
            return value;
          }
          /**@ts-ignore */
          obs = innerObservable[type](value, mode);
          return obs.value;
        },
        get() {
          if (isServer) {
            return obs;
          }
          return obs.value;
        },
        set(newValue) {
          if (isServer) {
            obs = newValue;
            return;
          }
          obs.value = newValue;
        },
      };

      return result;
    }
  };
}

export function computed(
  value: () => unknown,
  context: ClassGetterDecoratorContext
) {
  const { kind, name } = context;
  if (kind === "getter") {
    let init = false;
    let compute: Computed;
    return function (this: ThisType<unknown>) {
      if (!init) {
        compute = innerComputed(value.bind(this));
        init = true;
      }
      return compute.value as any;
    };
  }

  throw new Error("can not apply decorator computed bisides getter");
}
