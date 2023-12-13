import { describe, jest, it, expect } from "@jest/globals";
import { observable } from "../observables";
import { autorun } from "../observer";
import { batch } from "../batch";
import { computed } from "../computed";

describe("batch", () => {
  it("merge value mutations", () => {
    const value = observable.box<number>(1);

    const fn = jest.fn();
    autorun(() => {
      value.value;
      fn();
    });

    value.value = 2;
    expect(fn).toBeCalledTimes(2);
    batch(() => {
      value.value = 2;
      value.value = 3;
    });
    expect(fn).toBeCalledTimes(3);
  });

  it("merge object mutations", () => {
    const value = observable.object({
      a: 1,
      b: 2,
    }).value;

    const fn = jest.fn();
    autorun(() => {
      value.a;
      value.b;
      fn();
    });

    expect(fn).toBeCalledTimes(1);
    batch(() => {
      value.a = 2;
      value.b = 3;
    });
    expect(fn).toBeCalledTimes(2);
  });

  it("merge computed mutations", () => {
    const value = observable.object({
      a: 1,
      b: 2,
    }).value;
    const computedValue = computed(() => {
      return value.a + 100;
    });

    const fn = jest.fn();
    autorun(() => {
      value.a;
      value.b;
      computedValue.value;
      fn();
    });

    expect(fn).toBeCalledTimes(1);
    batch(() => {
      value.a = 2;
      value.b = 3;
    });
    expect(fn).toBeCalledTimes(2);
  });

  it("merge array mutations", () => {
    const value = observable.array([1, 2, 3]).value;

    const fn = jest.fn();
    autorun(() => {
      value[0];
      value[1];
      fn();
    });

    expect(fn).toBeCalledTimes(1);
    batch(() => {
      value[0] = 100;
      value[1] = 50;
    });
    expect(fn).toBeCalledTimes(2);
  });

  it("merge map mutations", () => {
    const value = observable.map<number, number>(new Map()).value;

    const fn = jest.fn();
    autorun(() => {
      value.get(0);
      value.get(1);
      fn();
    });

    expect(fn).toBeCalledTimes(1);
    batch(() => {
      value.set(0, 1);
      value.set(1, 2);
    });
    expect(fn).toBeCalledTimes(2);
  });

  it("merge set mutations", () => {
    const value = observable.set<number>(new Set()).value;

    const fn = jest.fn();
    autorun(() => {
      value.has(0);
      value.has(1);
      fn();
    });

    expect(fn).toBeCalledTimes(1);
    batch(() => {
      value.add(0);
      value.add(1);
    });
    expect(fn).toBeCalledTimes(2);
  });
});
