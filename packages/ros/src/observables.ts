import { Computed } from "./computed";
import { ObservableArray } from "./observableArray";
import { ObservableMap } from "./observableMap";
import { ObservableObject } from "./observableObject";
import { ObservableSet } from "./observableSet";
import { ObservableValue, PrimitiveType } from "./observableValue";
import { Observer } from "./observer";
import { IObservableMode } from "./types";
import { isES6Map, isES6Set, isPlainObject, isProxy } from "./utils";

export const createChildObservable = (
  value: any,
  contexts: Set<Observer | Computed>
) => {
  if (typeof value === "object" && value !== null) {
    if (isProxy(value)) {
      return value;
    }
    if (Array.isArray(value)) {
      return new ObservableArray(value, {
        parentContexts: contexts,
      }).value;
    }
    if (isPlainObject(value)) {
      return new ObservableObject(value, {
        parentContexts: contexts,
      }).value;
    }
    if (isES6Map(value)) {
      return new ObservableMap(value, {
        parentContexts: contexts,
      }).value;
    }
    if (isES6Set(value)) {
      return new ObservableSet(value, {
        parentContexts: contexts,
      }).value;
    }
    return value;
  }
  return value;
};

export const observable = {
  box<T extends PrimitiveType = any>(value: T): ObservableValue<T> {
    return new ObservableValue(value);
  },
  array<T = any>(
    initialValues: T[],
    mode: IObservableMode = "deep"
  ): ObservableArray<T> {
    return new ObservableArray(initialValues, {
      mode,
    });
  },
  map<K = any, V = any>(
    initialValues: Map<K, V>,
    mode: IObservableMode = "deep"
  ): ObservableMap<K, V> {
    return new ObservableMap(initialValues, {
      mode,
    });
  },
  set<T = any>(
    initialValues: Set<T>,
    mode: IObservableMode = "deep"
  ): ObservableSet<T> {
    return new ObservableSet<T>(initialValues, {
      mode,
    });
  },
  object<T extends object = any>(
    props: T,
    mode: IObservableMode = "deep"
  ): ObservableObject<T> {
    return new ObservableObject<T>(props, { mode });
  },
};
