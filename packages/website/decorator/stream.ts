import { RootStore } from "../store";

export function serialize(_value: any, { name, addInitializer }: any) {
  addInitializer(function (this: RootStore) { 
    if (!this.serializeKeys) {
      this.serializeKeys = new Set();
    }
    this.serializeKeys.add(name);
  });
}

const isServer = typeof window === 'undefined';
export const promiseMap = new Map<string, (...args: any[]) => Promise<any>>();
export const promiseStatusMap = new Map<string, 'settled' | 'pending'>();
export const throwIfUnresolved = (key: string) => {
  const status = promiseStatusMap.get(key)!;
  if(status !== 'settled'){
    throw Promise.resolve("waiting for promise fulfilled....")
  }
}
export function pending(key: string) {
  return (value: (...args: any) => Promise<any>, {addInitializer,name }: ClassMethodDecoratorContext<any, any>) => {
    addInitializer(function () { 
      const bindValue = value.bind(this); 

      if (!isServer) {
        this[name] = bindValue;
        promiseMap.set(key, this[name]);
      }else {
        this[name] = async (args: any) => {
            return bindValue(args).then((res: any) => {
              promiseStatusMap.set(key,'settled')
              return [key, res];
            }).catch((err) => {
              promiseStatusMap.set(key,'settled')
            })
        };
      }
    });    
  }
}
