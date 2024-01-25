import { action, makeObservable } from "mobx";

export abstract class RootStore {

  abstract SSR(): Promise<void>;

  constructor() {
    makeObservable(this);
  }

  streamSSR(): any {

  }

  fromStreamSSR?(data: any): void {

  }

  @action
  fromSSR(data: any) {
    for (const key of Object.keys(data)) {
      const property = this?.[key];
      // 原始值
      if (typeof property !== 'object') {
        this[key] = data[key];
        // 数组
      } else if (Array.isArray(property)) {
        this[key] = data[key]
        // 子store
      } else if (property instanceof ChildStore) {
        this[key].fromSSR(data[key])
        // map
      } else if (property instanceof Map) {
        this[key] = data[key]
        // set
      } else if (property instanceof Set) {
        this[key] = data[key]
        // object
      } else {
        this[key] = data[key]
      }
    }
  }

  serializeKeys: Set<string> = new Set();

  [key: string]: any;

}

export abstract class ChildStore {
  SSR() {

  }

  streamSSR() {

  }

  constructor() {
    makeObservable(this);
  }


  fromStreamSSR(data: any) {

  }

  serializeKeys: Set<string> = new Set();

  @action
  fromSSR(data: any) {
    for (const key of Object.keys(data)) {
      const property = this?.[key];
      // 原始值
      if (typeof property !== 'object') {
        this[key] = data[key];
        // 数组
      } else if (Array.isArray(property)) {
        this[key] = data[key]
        // 子store
      } else if (property instanceof ChildStore) {
        this[key].fromSSR(data[key])
        // map
      } else if (property instanceof Map) {
        this[key] = data[key]
        // set
      } else if (property instanceof Set) {
        this[key] = data[key]
        // object
      } else {
        this[key] = data[key]
      }
    }
  }
  [key: string]: any;
}