/**
 * 提供一些同构的方法
 * 2.shareContext
 * 3. serverContext
 * 4. clientContext
 *
 * 封装流式接口和非流式接口
 * 1. getInitData()
 * 2. getStreamData()
 *
 * 同步客户端和服务端之间的promise状态,使用装饰器收集
 *
 * 提供getSnapShot 和 restoreSnapShot 方法，来进行序列化和反序列化
 */
import serialize from "serialize-javascript";
import { ChildStore } from "./childStore";
import { createPatch, applyPatch } from "rfc6902";

export class RootStore {
  serverContext;
  clientContext;
  shareContext;

  /**
   * todo
   */
  promises: Promise<any>[];

  async getInitData() {
    throw new Error("This method must be implemented in child classes.");
  }

  /**
   * todo 等`use`正式发布，看看在server和client端分别怎么用
   */
  getStreamData() {
    throw new Error("This method must be implemented in child classes.");
  }

  constructor() {
    this.promises = [];
  }

  /**
   * 流式一次生成一次
   */
  toSnapshot() {
    return serialize(this, { isJSON: true });
  }

  fromSnapshot(snapshot: string) {
    const store = JSON.parse(snapshot);
    for (const key of Object.keys(store)) {
      if (this[key] instanceof ChildStore) {
        this[key] = new ChildStore(this);
      } else {
        this[key] = store[key];
      }
    }
  }

  fromPatch(patch: string) {
    const diff = JSON.parse(patch);
    console.log("diff", diff, this);
    applyPatch(this, diff);
  }

  genaratePatch(snapshot: string) {
    const patch = createPatch(JSON.parse(snapshot), this);
    console.log("diff", patch);
    return serialize(patch, { isJSON: true });
  }
}

class Store extends RootStore {
  slowData: any = null;
  fastData: any = null;
  childStore = new ChildStore(this);

  async getFastData() {
    const result = await new Promise((r) => {
      setTimeout(() => {
        r(1000);
      }, 1000);
    });
    this.fastData = result;
  }
  async getInitData() {
    this.slowData = 100;
  }

  getStreamData() {
    this.promises.push(this.getFastData());
    Promise.all(this.promises);
  }
}

const store = new Store();
const snap = store.toSnapshot();
console.log(snap);
store.getInitData();
const patch = store.genaratePatch(snap);
console.log(store.toSnapshot());

console.log("patch", patch);
const store1 = new Store();
store1.fromSnapshot(snap);
store1.fromPatch(patch);
console.log(store1.toSnapshot());
console.log(store1.childStore);
