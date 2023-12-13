import { makeObservable, observable, action } from "mobx";
import { ComponentStore } from "./header/store";

export class AppStore {
  @observable title = "hello world";

  /**
   * 使用装饰器标记为流式store， 收集name
   */
  @observable.ref componentData = new ComponentStore();

  /**
   * 需要进行服务端和客户端之间promises状态的同步
   * 客户端的promises初始化的时候都没有resolve
   * 流式来了一个resolve掉一个
   */
  promises: Promise<any>[] = [];

  constructor() {
    makeObservable(this);
  }

  async getInitPromise() {
    this.title = "world hello";
  }

  getStreamPromise() {
    const resultArr: { key: string; value: string }[] = [];
    const promiseMap = new Map<Promise<any>, string>();
    promiseMap.set(this.componentData.fulFillData(), "componentData");

    this.promises = [...promiseMap.keys()];
    this.promises.forEach((promise) => {
      promise.then(
        (value) => {
          console.log("New Promise completed:", value);
          const key = promiseMap.get(promise) as string;
          const result = this[key];
          resultArr.push({
            key,
            value: result,
          });
        },
        (reason) => {
          console.log("Promise rejected:", reason);
        }
      );
    });

    return resultArr;
  }

  fromJS(data: string) {
    this.title = data.title;
  }
}
