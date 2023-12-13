import { describe, expect, it, jest } from "@jest/globals";
import { observable } from "../observables";
import { isProxy } from "../utils";
import { autorun } from "../observer";

describe("observable map", () => {
  it("instanceof", () => {
    const original = new Map();
    const observed = observable.map(original).value;
    expect(isProxy(observed)).toBe(true);
    expect(original).toBeInstanceOf(Map);
    expect(observed).toBeInstanceOf(Map);
  });

  it("should observe mutations", () => {
    let dummy;
    const map = observable.map(new Map()).value;
    autorun(() => {
      dummy = map.get("key");
    });

    expect(dummy).toBe(undefined);
    map.set("key", "value");
    expect(dummy).toBe("value");
    map.set("key", "value2");
    expect(dummy).toBe("value2");
    map.delete("key");
    expect(dummy).toBe(undefined);
  });

  it("should observe mutations with observed value as key", () => {
    let dummy;
    const key = observable.object({}).value;
    const value = observable.object({}).value;
    const map = observable.map(new Map()).value;
    autorun(() => {
      dummy = map.get(key);
    });

    expect(dummy).toBe(undefined);
    map.set(key, value);
    expect(dummy).toBe(value);
    map.delete(key);
    expect(dummy).toBe(undefined);
  });

  it("should observe size mutations", () => {
    let dummy;
    const map = observable.map(new Map()).value;
    autorun(() => {
      dummy = map.size;
    });

    expect(dummy).toBe(0);
    map.set("key1", "value");
    map.set("key2", "value2");
    expect(dummy).toBe(2);
    map.delete("key1");
    expect(dummy).toBe(1);
    map.clear();
    expect(dummy).toBe(0);
  });

  it("should observe for of iteration", () => {
    let dummy;
    const map = observable.map(new Map()).value;
    autorun(() => {
      dummy = 0;
      // eslint-disable-next-line no-unused-vars
      for (let [key, num] of map) {
        key;
        dummy += num;
      }
    });

    expect(dummy).toBe(0);
    map.set("key1", 3);
    expect(dummy).toBe(3);
    map.set("key2", 2);
    expect(dummy).toBe(5);
    // iteration should track mutation of existing entries (#709)
    map.set("key1", 4);
    expect(dummy).toBe(6);
    map.delete("key1");
    expect(dummy).toBe(2);
    map.clear();
    expect(dummy).toBe(0);
  });

  it("should observe forEach iteration", () => {
    let dummy: any;
    const map = observable.map(new Map()).value;
    autorun(() => {
      dummy = 0;
      map.forEach((num: any) => (dummy += num));
    });

    expect(dummy).toBe(0);
    map.set("key1", 3);
    expect(dummy).toBe(3);
    map.set("key2", 2);
    expect(dummy).toBe(5);
    // iteration should track mutation of existing entries (#709)
    map.set("key1", 4);
    expect(dummy).toBe(6);
    map.delete("key1");
    expect(dummy).toBe(2);
    map.clear();
    expect(dummy).toBe(0);
  });

  it("should observe keys iteration", () => {
    let dummy;
    const map = observable.map(new Map()).value;
    autorun(() => {
      dummy = 0;
      for (let key of map.keys()) {
        dummy += key;
      }
    });

    expect(dummy).toBe(0);
    map.set(3, 3);
    expect(dummy).toBe(3);
    map.set(2, 2);
    expect(dummy).toBe(5);
    map.delete(3);
    expect(dummy).toBe(2);
    map.clear();
    expect(dummy).toBe(0);
  });

  it("should observe values iteration", () => {
    let dummy;
    const map = observable.map(new Map()).value;
    autorun(() => {
      dummy = 0;
      for (let num of map.values()) {
        dummy += num;
      }
    });

    expect(dummy).toBe(0);
    map.set("key1", 3);
    expect(dummy).toBe(3);
    map.set("key2", 2);
    expect(dummy).toBe(5);
    // iteration should track mutation of existing entries (#709)
    map.set("key1", 4);
    expect(dummy).toBe(6);
    map.delete("key1");
    expect(dummy).toBe(2);
    map.clear();
    expect(dummy).toBe(0);
  });

  it("should observe entries iteration", () => {
    let dummy;
    let dummy2;
    const map = observable.map(new Map()).value;
    autorun(() => {
      dummy = "";
      dummy2 = 0;
      // eslint-disable-next-line no-unused-vars
      for (let [key, num] of map.entries()) {
        dummy += key;
        dummy2 += num;
      }
    });

    expect(dummy).toBe("");
    expect(dummy2).toBe(0);
    map.set("key1", 3);
    expect(dummy).toBe("key1");
    expect(dummy2).toBe(3);
    map.set("key2", 2);
    expect(dummy).toBe("key1key2");
    expect(dummy2).toBe(5);
    // iteration should track mutation of existing entries (#709)
    map.set("key1", 4);
    expect(dummy).toBe("key1key2");
    expect(dummy2).toBe(6);
    map.delete("key1");
    expect(dummy).toBe("key2");
    expect(dummy2).toBe(2);
    map.clear();
    expect(dummy).toBe("");
    expect(dummy2).toBe(0);
  });

  it("should be triggered by clearing", () => {
    let dummy;
    const map = observable.map(new Map()).value;
    autorun(() => (dummy = map.get("key")));

    expect(dummy).toBe(undefined);
    map.set("key", 3);
    expect(dummy).toBe(3);
    map.clear();
    expect(dummy).toBe(undefined);
  });

  it("should not observe custom property mutations", () => {
    let dummy;
    const map: any = observable.map(new Map()).value;
    autorun(() => (dummy = map.customProp));

    expect(dummy).toBe(undefined);
    map.customProp = "Hello World";
    expect(dummy).toBe(undefined);
  });

  it("should not observe non value changing mutations", () => {
    let dummy;
    const map = observable.map(new Map()).value;
    const mapSpy = jest.fn(() => (dummy = map.get("key")));
    autorun(mapSpy);

    expect(dummy).toBe(undefined);
    expect(mapSpy).toHaveBeenCalledTimes(1);
    map.set("key", undefined);
    expect(dummy).toBe(undefined);
    expect(mapSpy).toHaveBeenCalledTimes(2);
    map.set("key", "value");
    expect(dummy).toBe("value");
    expect(mapSpy).toHaveBeenCalledTimes(3);
    map.set("key", "value");
    expect(dummy).toBe("value");
    expect(mapSpy).toHaveBeenCalledTimes(3);
    map.delete("key");
    expect(dummy).toBe(undefined);
    expect(mapSpy).toHaveBeenCalledTimes(4);
    map.delete("key");
    expect(dummy).toBe(undefined);
    expect(mapSpy).toHaveBeenCalledTimes(4);
    map.clear();
    expect(dummy).toBe(undefined);
    expect(mapSpy).toHaveBeenCalledTimes(4);
  });

  it("should return observable versions of contained values", () => {
    const observed = observable.map(new Map()).value;
    const value = {};
    observed.set("key", value);
    const wrapped = observed.get("key");
    expect(isProxy(wrapped)).toBe(true);
  });

  it("should observed nested data", () => {
    const observed = observable.map(new Map()).value;
    observed.set("key", { a: 1 });
    let dummy;
    autorun(() => {
      dummy = observed.get("key").a;
    });
    observed.get("key").a = 2;
    expect(dummy).toBe(2);
  });

  it("should observe nested values in iterations (forEach)", () => {
    const map = observable.map(new Map([[1, { foo: 1 }]])).value;
    let dummy: any;
    autorun(() => {
      dummy = 0;
      map.forEach((value) => {
        expect(isProxy(value)).toBe(true);
        dummy += value.foo;
      });
    });
    expect(dummy).toBe(1);
    map.get(1)!.foo++;
    expect(dummy).toBe(2);
  });

  it('should observe nested values in iterations (values)', () => {
    const map = observable.map(new Map([[1, { foo: 1 }]])).value;
    let dummy: any
    autorun(() => {
      dummy = 0
      for (const value of map.values()) {
        expect(isProxy(value)).toBe(true)
        dummy += value.foo
      }
    })
    expect(dummy).toBe(1)
    map.get(1)!.foo++
    expect(dummy).toBe(2)
  })

  it('should observe nested values in iterations (entries)', () => {
    const key = {}
    const map = observable.map(new Map([[key, { foo: 1 }]])).value;
    let dummy: any
    autorun(() => {
      dummy = 0
      for (const [key, value] of map.entries()) {
        key
        expect(isProxy(key)).toBe(false)
        expect(isProxy(value)).toBe(true)
        dummy += value.foo
      }
    })
    expect(dummy).toBe(1)
    map.get(key)!.foo++
    expect(dummy).toBe(2)
  })

  it('should work with reactive keys in raw map', () => {
    const raw = new Map()
    const key = observable.object({}).value;
    raw.set(key, 1)
    const map = observable.map(raw).value;

    expect(map.has(key)).toBe(true)
    expect(map.get(key)).toBe(1)

    expect(map.delete(key)).toBe(true)
    expect(map.has(key)).toBe(false)
    expect(map.get(key)).toBeUndefined()
  })

  it('should track set of reactive keys in raw map', () => {
    const raw = new Map()
    const key = observable.object({}).value;
    raw.set(key, 1)
    const map = observable.map(raw).value;

    let dummy
    autorun(() => {
      dummy = map.get(key)
    })
    expect(dummy).toBe(1)

    map.set(key, 2)
    expect(dummy).toBe(2)
  })

  it('should track deletion of reactive keys in raw map', () => {
    const raw = new Map()
    const key = observable.object({}).value;
    raw.set(key, 1)
    const map = observable.map(raw).value;

    let dummy
    autorun(() => {
      dummy = map.has(key)
    })
    expect(dummy).toBe(true)

    map.delete(key)
    expect(dummy).toBe(false)
  })
});
