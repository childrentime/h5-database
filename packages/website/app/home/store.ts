import { makeObservable, observable } from "mobx";
import { ComponentStore } from "./header/store";
import { sleep } from "../../utils/sleep";
import { RootStore } from "../../store";
import { serialize } from "../../decorator/stream";

export class AppStore extends RootStore {
  @serialize @observable accessor title = "hello world";
  @serialize @observable.ref  accessor componentData = new ComponentStore();

  test = '???'

  constructor() {
    super();
    makeObservable(this);
  }

  async SSR() {
    await Promise.all([sleep(200),this.componentData.getHeader1()]);
    this.title = "world hello";
  }

  streamSSR() {
    return [this.componentData.fulFillData()];
  }

  fromStreamSSR(data: any) {
    
  }

}