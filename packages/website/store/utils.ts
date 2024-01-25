import { ChildStore, RootStore } from ".";

export function toJS(store: RootStore | ChildStore) {
  const data = {} as {[key: string]: any};
  for(const key of store.serializeKeys){
    if(store[key] instanceof ChildStore){
      data[key] = toJS(store[key])
      continue;
    }
    data[key] = store[key]
  }

  return data;
}