import { describe, expect, it } from "@jest/globals";
import { isProxy } from "../utils";
import { observable } from "../observables";

describe("observables", () => {
  it("Object", () => {
    const original = { foo: 1 };
    const observed = observable.object(original);
    expect(observed.value).not.toBe(original);
    // get
    expect(observed.value.foo).toBe(1);
    // has
    expect("foo" in observed.value).toBe(true);
    // ownKeys
    expect(Object.keys(observed.value)).toEqual(["foo"]);
  });

  it("nested", () => {
    const original = {
      nested: {
        foo: 1,
      },
      array: [{ bar: 2 }],
    };
    const observed = observable.object(original);
    expect(isProxy(observed.value.nested)).toBe(true);
    expect(isProxy(observed.value.array)).toBe(true);
    expect(isProxy(observed.value.array[0])).toBe(true);
  });

  it("observed value should proxy mutations to original (Object)", () => {
    const original: any = { foo: 1 };
    const observed = observable.object(original);
    // set
    observed.value.bar = 1;
    expect(observed.value.bar).toBe(1);
    expect(original.bar).toBe(1);
    // delete
    delete observed.value.foo;
    expect("foo" in observed.value).toBe(false);
    expect("foo" in original).toBe(false);
  });

  it("original value change should reflect in observed value (Object)", () => {
    const original: any = { foo: 1 };
    const observed = observable.object(original);
    // set
    original.bar = 1;
    expect(original.bar).toBe(1);
    expect(observed.value.bar).toBe(1);
    // delete
    delete original.foo;
    expect("foo" in original).toBe(false);
    expect("foo" in observed.value).toBe(false);
  });

  it("setting a property with an unobserved value should wrap with reactive", () => {
    const observed = observable.object<{ foo?: object }>({});
    const raw = {};
    observed.value.foo = raw;
    expect(observed.value.foo).not.toBe(raw);
    expect(isProxy(observed.value.foo)).toBe(true);
  });

  it('should not observe non-extensible objects', () => {
    const obj = observable.object({
      foo: Object.preventExtensions({ a: 1 }),
      // sealed or frozen objects are considered non-extensible as well
      bar: Object.freeze({ a: 1 }),
      baz: Object.seal({ a: 1 })
    })
    expect(isProxy(obj.value.foo)).toBe(false)
    expect(isProxy(obj.value.bar)).toBe(false)
    expect(isProxy(obj.value.baz)).toBe(false)
  })
});
