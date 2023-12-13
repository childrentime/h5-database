import { describe, it, expect, jest } from "@jest/globals";
import { observable } from "../observables";
import { isProxy } from "../utils";
import { autorun } from "../observer";

describe("set", () => {
  it("instanceof", () => {
    const original = new Set();
    const observed = observable.set(original).value;
    expect(isProxy(observed)).toBe(true);
    expect(original).toBeInstanceOf(Set);
    expect(observed).toBeInstanceOf(Set);
  });

  it("should observe mutations", () => {
    let dummy;
    const set = observable.set(new Set()).value;
    autorun(() => {
      dummy = set.has("value");
    });

    expect(dummy).toBe(false);
    set.add("value");
    expect(dummy).toBe(true);
    set.delete("value");
    expect(dummy).toBe(false);
  });

  it("should observe mutations with observed value", () => {
    let dummy;
    const value = observable.object({}).value;
    const set = observable.set(new Set()).value;
    autorun(() => {
      dummy = set.has(value);
    });

    expect(dummy).toBe(false);
    set.add(value);
    expect(dummy).toBe(true);
    set.delete(value);
    expect(dummy).toBe(false);
  });

  it("should observe for of iteration", () => {
    let dummy;
    const set = observable.set(new Set() as Set<number>).value;
    autorun(() => {
      dummy = 0;
      for (let num of set) {
        dummy += num;
      }
    });

    expect(dummy).toBe(0);
    set.add(2);
    set.add(1);
    expect(dummy).toBe(3);
    set.delete(2);
    expect(dummy).toBe(1);
    set.clear();
    expect(dummy).toBe(0);
  });

  it("should observe forEach iteration", () => {
    let dummy: any;
    const set = observable.set(new Set()).value;
    autorun(() => {
      dummy = 0;
      set.forEach((num) => (dummy += num));
    });

    expect(dummy).toBe(0);
    set.add(2);
    set.add(1);
    expect(dummy).toBe(3);
    set.delete(2);
    expect(dummy).toBe(1);
    set.clear();
    expect(dummy).toBe(0);
  });

  it("should observe values iteration", () => {
    let dummy;
    const set = observable.set(new Set() as Set<number>).value;
    autorun(() => {
      dummy = 0;
      for (let num of set.values()) {
        dummy += num;
      }
    });

    expect(dummy).toBe(0);
    set.add(2);
    set.add(1);
    expect(dummy).toBe(3);
    set.delete(2);
    expect(dummy).toBe(1);
    set.clear();
    expect(dummy).toBe(0);
  });

  it("should observe keys iteration", () => {
    let dummy;
    const set = observable.set(new Set() as Set<number>).value;
    autorun(() => {
      dummy = 0;
      for (let num of set.keys()) {
        dummy += num;
      }
    });

    expect(dummy).toBe(0);
    set.add(2);
    set.add(1);
    expect(dummy).toBe(3);
    set.delete(2);
    expect(dummy).toBe(1);
    set.clear();
    expect(dummy).toBe(0);
  });

  it("should observe entries iteration", () => {
    let dummy;
    const set = observable.set(new Set<number>()).value;
    autorun(() => {
      dummy = 0;
      // eslint-disable-next-line no-unused-vars
      for (let [key, num] of set.entries()) {
        key;
        dummy += num;
      }
    });

    expect(dummy).toBe(0);
    set.add(2);
    set.add(1);
    expect(dummy).toBe(3);
    set.delete(2);
    expect(dummy).toBe(1);
    set.clear();
    expect(dummy).toBe(0);
  });

  it("should be triggered by clearing", () => {
    let dummy;
    const set = observable.set(new Set()).value;
    autorun(() => {
      dummy = set.has("key");
    });

    expect(dummy).toBe(false);
    set.add("key");
    expect(dummy).toBe(true);
    set.clear();
    expect(dummy).toBe(false);
  });

  it("should not observe custom property mutations", () => {
    let dummy;
    const set: any = observable.set(new Set()).value;
    autorun(() => (dummy = set.customProp));

    expect(dummy).toBe(undefined);
    set.customProp = "Hello World";
    expect(dummy).toBe(undefined);
  });

  it("should observe size mutations", () => {
    let dummy;
    const set = observable.set(new Set()).value;
    autorun(() => {
      dummy = set.size;
    });

    expect(dummy).toBe(0);
    set.add("value");
    set.add("value2");
    expect(dummy).toBe(2);
    set.delete("value");
    expect(dummy).toBe(1);
    set.clear();
    expect(dummy).toBe(0);
  });

  it("should support objects as key", () => {
    let dummy;
    const key = {};
    const set = observable.set(new Set()).value;
    const setSpy = jest.fn(() => {
      dummy = set.has(key);
    });
    autorun(setSpy);

    expect(dummy).toBe(false);
    expect(setSpy).toHaveBeenCalledTimes(1);

    set.add({});
    expect(dummy).toBe(false);
    expect(setSpy).toHaveBeenCalledTimes(2);

    set.add(key);
    expect(dummy).toBe(true);
    expect(setSpy).toHaveBeenCalledTimes(3);
  });

  it("should observe nested values in iterations (forEach)", () => {
    const set = observable.set(new Set([{ foo: 1 }])).value;
    let dummy: any;
    autorun(() => {
      dummy = 0;
      set.forEach((value) => {
        expect(isProxy(value)).toBe(true);
        dummy += value.foo;
      });
    });
    expect(dummy).toBe(1);
    set.forEach((value) => {
      value.foo++;
    });
    expect(dummy).toBe(2);
  });

  it("should observe nested values in iterations (values)", () => {
    const set = observable.set(new Set([{ foo: 1 }])).value;
    let dummy: any;
    autorun(() => {
      dummy = 0;
      for (const value of set.values()) {
        expect(isProxy(value)).toBe(true);
        dummy += value.foo;
      }
    });
    expect(dummy).toBe(1);
    set.forEach((value) => {
      value.foo++;
    });
    expect(dummy).toBe(2);
  });

  it("should observe nested values in iterations (entries)", () => {
    const set = observable.set(new Set([{ foo: 1 }])).value;
    let dummy: any;
    autorun(() => {
      dummy = 0;
      for (const [key, value] of set.entries()) {
        expect(isProxy(key)).toBe(true);
        expect(isProxy(value)).toBe(true);
        dummy += value.foo;
      }
    });
    expect(dummy).toBe(1);
    set.forEach((value) => {
      value.foo++;
    });
    expect(dummy).toBe(2);
  });

  it("should observe nested values in iterations (for...of)", () => {
    const set = observable.set(new Set([{ foo: 1 }])).value;
    let dummy: any;
    autorun(() => {
      dummy = 0;
      for (const value of set) {
        expect(isProxy(value)).toBe(true);
        dummy += value.foo;
      }
    });
    expect(dummy).toBe(1);
    set.forEach((value) => {
      value.foo++;
    });
    expect(dummy).toBe(2);
  });

  it('should work with reactive entries in raw set', () => {
    const raw = new Set()
    const entry = observable.object({}).value;
    raw.add(entry)
    const set = observable.set(raw).value;

    expect(set.has(entry)).toBe(true)

    expect(set.delete(entry)).toBe(true)
    expect(set.has(entry)).toBe(false)
  })

  it('should track deletion of reactive entries in raw set', () => {
    const raw = new Set()
    const entry = observable.object({}).value;
    raw.add(entry)
    const set = observable.set(raw).value;

    let dummy
    autorun(() => {
      dummy = set.has(entry)
    })
    expect(dummy).toBe(true)

    set.delete(entry)
    expect(dummy).toBe(false)
  })

});
