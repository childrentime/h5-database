import { action, observable } from "mobx";
import { sleep } from "../../../utils/sleep";
import { ChildStore } from "../../../store";
import { pending, serialize } from "../../../decorator/stream";
import { streamKey } from "./constant";

export class ComponentStore extends ChildStore {
  @serialize @observable accessor title: string  = "1231";

  @serialize @observable accessor header1 = 'fallbakc'

  getHeader1 = async () => {
    await sleep(3000);
    this.header1 = 'header1'
  }


  @pending(streamKey)
  @action
  async fulFillData (d?: string): Promise<string> {
    const data = d || (await new Promise((resolve) => {
      setTimeout(() => {
        resolve("fulfilled data");
      }, 0);
    })) as string;
    this.title = data;
    return data;
  };
}
