import { action, makeObservable, observable } from "mobx";

export class ComponentStore {
  @observable title = "unfulfilled data";

  constructor() {
    makeObservable(this);
  }

  @action
  fulFillData = async () => {
    const data = (await new Promise((resolve) => {
      setTimeout(() => {
        resolve("fulfilled data");
      }, 0);
    })) as string;
    this.title = data;
  };

  @action
  fromJS = (data) => {
    this.title = data.title;
  };
}
