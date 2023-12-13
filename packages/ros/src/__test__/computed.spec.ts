import { describe, expect, it, jest } from "@jest/globals";
import { observable } from "../observables";
import { computed } from "../computed";
import { autorun, reaction } from "../observer";

describe("computed", () => {
  it("should return updated value", () => {
    const value = observable.object<{ foo?: number }>({});
    const cValue = computed(() => value.value.foo);
    expect(cValue.value).toBe(undefined);
    value.value.foo = 1;
    expect(cValue.value).toBe(1);
  });

  it("should compute lazily", () => {
    const value = observable.object<{ foo?: number }>({});
    const getter = jest.fn(() => value.value.foo);
    const cValue = computed(getter);

    // lazy
    expect(getter).not.toHaveBeenCalled();

    expect(cValue.value).toBe(undefined);
    expect(getter).toHaveBeenCalledTimes(1);

    // should not compute again
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(1);

    // should not compute until needed
    value.value.foo = 1;
    expect(getter).toHaveBeenCalledTimes(1);

    // now it should compute
    expect(cValue.value).toBe(1);
    expect(getter).toHaveBeenCalledTimes(2);

    // should not compute again
    cValue.value;
    expect(getter).toHaveBeenCalledTimes(2);
  });

  it("should trigger effect", () => {
    const value = observable.object<{ foo?: number }>({});
    const cValue = computed(() => value.value.foo);
    let dummy = 0 as any;
    reaction([cValue], () => {
      dummy = cValue.value;
    });
    expect(dummy).toBe(0);
    value.value.foo = 1;
    expect(dummy).toBe(1);
  });

  it("should work when chained", () => {
    const value = observable.object({ foo: 0 }).value;
    const c1 = computed(() => value.foo, "c1");
    const c2 = computed(() => c1.value + 1, "c2");
    expect(c2.value).toBe(1);
    expect(c1.value).toBe(0);
    value.foo++;
    expect(c2.value).toBe(2);
    expect(c1.value).toBe(1);
  });

  it("should work with array", () => {
    const value = observable.array([1, 2, 3]).value;
    const c1 = computed(() => value[0]);
    expect(c1.value).toBe(1);
    value[0] = 2;
    expect(c1.value).toBe(2);
  });

  it("should trigger effect when chained", () => {
    const value = observable.object({ foo: 0 }).value;
    const getter1 = jest.fn(() => value.foo);
    const getter2 = jest.fn(() => {
      return c1.value + 1;
    });
    const c1 = computed(getter1);
    const c2 = computed(getter2);

    let dummy;
    autorun(() => {
      dummy = c2.value;
    });
    expect(dummy).toBe(1);
    expect(getter1).toHaveBeenCalledTimes(1);
    expect(getter2).toHaveBeenCalledTimes(1);
    value.foo++;
    expect(dummy).toBe(2);
    // should not result in duplicate calls
    expect(getter1).toHaveBeenCalledTimes(2);
    expect(getter2).toHaveBeenCalledTimes(2);
  });

  it("should trigger effect when chained (mixed invocations)", () => {
    const value = observable.object({ foo: 0 }).value;
    const getter1 = jest.fn(() => value.foo);
    const getter2 = jest.fn(() => {
      return c1.value + 1;
    });
    const c1 = computed(getter1);
    const c2 = computed(getter2);

    let dummy;
    autorun(() => {
      dummy = c1.value + c2.value;
    });
    expect(dummy).toBe(1);

    expect(getter1).toHaveBeenCalledTimes(1);
    expect(getter2).toHaveBeenCalledTimes(1);
    value.foo++;
    expect(dummy).toBe(3);
    // should not result in duplicate calls
    expect(getter1).toHaveBeenCalledTimes(2);
    expect(getter2).toHaveBeenCalledTimes(2);
  });

  it("should invalidate before non-computed effects", () => {
    let plusOneValues: number[] = [];
    const n = observable.box(0);
    const plusOne = computed(() => n.value + 1);
    autorun(() => {
      n.value;
      plusOneValues.push(plusOne.value);
    });
    // mutate n
    n.value++;
    expect(plusOneValues).toStrictEqual([1, 2, 2]);
  });
});
