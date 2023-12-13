import { describe, it, expect, jest } from "@jest/globals";
import { autorun, reaction, when } from "../observer";
import { observable } from "../observables";

describe("observer", () => {
  it("should run the passed function once (wrapped by a effect)", () => {
    const fnSpy = jest.fn(() => {});
    autorun(fnSpy);
    expect(fnSpy).toHaveBeenCalledTimes(1);
  });

  it("reactions", () => {
    const fnSpy = jest.fn(() => {});
    reaction([], fnSpy);
    expect(fnSpy).toHaveBeenCalledTimes(0);
  });

  it("reactions observe value", () => {
    let dummy;
    let counter = observable.box<number>(10);
    reaction([counter], () => {
      dummy = counter.value;
    });

    expect(dummy).toBe(undefined);
    counter.value = 100;
    expect(dummy).toBe(100);
  });

  it("when", () => {
    let counter = observable.box<number>(10);
    const fn = jest.fn();
    when(
      () => {
        return counter.value === 100;
      },
      () => {
        fn();
      }
    );

    expect(fn).toBeCalledTimes(0);
    counter.value = 100;
    expect(fn).toBeCalledTimes(1);
  });

  it("should observe value", () => {
    let dummy;
    let counter = observable.box<number>(10);
    autorun(() => {
      dummy = counter.value;
    });

    expect(dummy).toBe(10);
    counter.value = 100;
    expect(dummy).toBe(100);
  });

  it("should observe object", () => {
    let dummy: any;
    const observed = observable.object({ foo: { num: 1 } });
    const counter = observed.value;
    autorun(() => {
      dummy = counter.foo.num;
    });
    expect(dummy).toBe(1);
    observed.value = { foo: { num: 2 } };
    expect(dummy).toBe(2);
  });

  it("should observe basic properties", () => {
    let dummy;
    const counter = observable.object({ num: 0 }).value;
    autorun(() => {
      dummy = counter.num;
    });

    expect(dummy).toBe(0);
    counter.num = 7;
    expect(dummy).toBe(7);
  });

  it("should observe multiple properties", () => {
    let dummy;
    const counter = observable.object({ num1: 0, num2: 0 }).value;
    autorun(() => {
      dummy = counter.num1 + counter.num1 + counter.num2;
    });

    expect(dummy).toBe(0);
    counter.num1 = counter.num2 = 7;
    expect(dummy).toBe(21);
  });

  it("should handle multiple effects", () => {
    let dummy1, dummy2;
    const counter = observable.object({ num: 0 }).value;
    autorun(() => {
      dummy1 = counter.num;
    });
    autorun(() => {
      dummy2 = counter.num;
    });

    expect(dummy1).toBe(0);
    expect(dummy2).toBe(0);
    counter.num++;
    expect(dummy1).toBe(1);
    expect(dummy2).toBe(1);
  });

  it("should observe nested properties", () => {
    let dummy;
    const counter = observable.object({ nested: { num: 0 } }).value;
    autorun(() => {
      dummy = counter.nested.num;
    });

    expect(dummy).toBe(0);
    counter.nested.num = 8;
    expect(dummy).toBe(8);
  });

  it("should observe delete operations", () => {
    let dummy;
    const obj = observable.object<{
      prop?: string;
    }>({ prop: "value" }).value;
    autorun(() => {
      dummy = obj.prop;
    });

    expect(dummy).toBe("value");
    delete obj.prop;
    expect(dummy).toBe(undefined);
  });

  it("should observe has operations", () => {
    let dummy;
    const obj = observable.object<{ prop?: string | number }>({
      prop: "value",
    }).value;
    autorun(() => {
      dummy = "prop" in obj;
    });

    expect(dummy).toBe(true);
    delete obj.prop;
    expect(dummy).toBe(false);
    obj.prop = 12;
    expect(dummy).toBe(true);
  });

  it("should observe function call chains", () => {
    let dummy;
    const counter = observable.object({ num: 0 }).value;
    autorun(() => {
      dummy = getNum();
    });

    function getNum() {
      return counter.num;
    }

    expect(dummy).toBe(0);
    counter.num = 2;
    expect(dummy).toBe(2);
  });

  it("should observe iteration", () => {
    let dummy;
    const list = observable.array(["Hello"]).value;
    autorun(() => {
      dummy = list.join(" ");
    });

    expect(dummy).toBe("Hello");
    list.push("World!");
    expect(dummy).toBe("Hello World!");
    list.shift();
    expect(dummy).toBe("World!");
  });

  it("should observe implicit array length changes", () => {
    let dummy;
    const list = observable.array(["Hello"]).value;
    autorun(() => {
      dummy = list.join(" ");
    });

    expect(dummy).toBe("Hello");
    list[1] = "World!";
    expect(dummy).toBe("Hello World!");
    list[3] = "Hello!";
    expect(dummy).toBe("Hello World!  Hello!");
  });

  it("should observe sparse array mutations", () => {
    let dummy;
    const list = observable.array<string>([]).value;
    list[1] = "World!";
    autorun(() => {
      dummy = list.join(" ");
    });

    expect(dummy).toBe(" World!");
    list[0] = "Hello";
    expect(dummy).toBe("Hello World!");
    list.pop();
    expect(dummy).toBe("Hello");
  });

  it("should observe enumeration", () => {
    let dummy = 0;
    const numbers = observable.object<Record<string, number>>({
      num1: 3,
    }).value;
    autorun(() => {
      dummy = 0;
      for (let key in numbers) {
        dummy += numbers[key];
      }
    });

    expect(dummy).toBe(3);
    numbers.num2 = 4;
    expect(dummy).toBe(7);
    delete numbers.num1;
    expect(dummy).toBe(4);
  });

  it("should observe symbol keyed properties", () => {
    const key = Symbol("symbol keyed prop");
    let dummy, hasDummy;
    const obj = observable.object<{ [key]?: string }>({ [key]: "value" }).value;
    autorun(() => {
      dummy = obj[key];
    });
    autorun(() => {
      hasDummy = key in obj;
    });

    expect(dummy).toBe("value");
    expect(hasDummy).toBe(true);
    obj[key] = "newValue";
    expect(dummy).toBe("newValue");
    delete obj[key];
    expect(dummy).toBe(undefined);
    expect(hasDummy).toBe(false);
  });

  it("should not observe well-known symbol keyed properties", () => {
    const key = Symbol.isConcatSpreadable;
    let dummy;
    const array: any = observable.array([]).value;
    autorun(() => (dummy = array[key]));

    expect(array[key]).toBe(undefined);
    expect(dummy).toBe(undefined);
    array[key] = true;
    expect(array[key]).toBe(true);
    expect(dummy).toBe(undefined);
  });

  it("should observe function valued properties", () => {
    const oldFunc = () => {};
    const newFunc = () => {};

    let dummy;
    const obj = observable.object({ func: oldFunc }).value;
    autorun(() => (dummy = obj.func));

    expect(dummy).toBe(oldFunc);
    obj.func = newFunc;
    expect(dummy).toBe(newFunc);
  });

  it("should observe chained getters relying on this", () => {
    const obj = observable.object({
      a: 1,
      get b() {
        return this.a;
      },
    }).value;

    let dummy;
    autorun(() => {
      dummy = obj.b;
    });
    expect(dummy).toBe(1);
    obj.a++;
    expect(dummy).toBe(2);
  });

  it("should observe methods relying on this", () => {
    const obj = observable.object({
      a: 1,
      b() {
        return this.a;
      },
    }).value;

    let dummy;
    autorun(() => {
      dummy = obj.b();
    });
    expect(dummy).toBe(1);
    obj.a++;
    expect(dummy).toBe(2);
  });

  it("should not observe set operations without a value change", () => {
    let hasDummy, getDummy;
    const obj = observable.object({ prop: "value" }).value;

    const getSpy = jest.fn(() => {
      getDummy = obj.prop;
    });
    const hasSpy = jest.fn(() => {
      hasDummy = "prop" in obj;
    });
    autorun(getSpy);
    autorun(hasSpy);

    expect(getDummy).toBe("value");
    expect(hasDummy).toBe(true);
    obj.prop = "value";
    expect(getSpy).toHaveBeenCalledTimes(1);
    expect(hasSpy).toHaveBeenCalledTimes(1);
    expect(getDummy).toBe("value");
    expect(hasDummy).toBe(true);
  });

  it("should not observe raw mutations", () => {
    let dummy;
    const obj = observable.object<{ prop?: string }>({}).peek();
    autorun(() => {
      dummy = obj.prop;
    });

    expect(dummy).toBe(undefined);
    obj.prop = "value";
    expect(dummy).toBe(undefined);
  });

  it("should not be triggered by raw mutations", () => {
    let dummy;
    const obj = observable.object<{ prop?: string }>({}).peek();
    autorun(() => {
      dummy = obj.prop;
    });

    expect(dummy).toBe(undefined);
    obj.prop = "value";
    expect(dummy).toBe(undefined);
  });

  it("should avoid implicit infinite recursive loops with itself", () => {
    const counter = observable.object({ num: 0 }).value;

    const counterSpy = jest.fn(() => {
      counter.num++;
    });
    autorun(counterSpy);
    expect(counter.num).toBe(1);
    expect(counterSpy).toHaveBeenCalledTimes(1);
    counter.num = 4;
    expect(counter.num).toBe(5);
    expect(counterSpy).toHaveBeenCalledTimes(2);
  });

  it("should avoid infinite recursive loops when use Array.prototype.push/unshift/pop/shift", () => {
    (["push", "unshift"] as const).forEach((key) => {
      const arr = observable.array<number>([]).value;
      const counterSpy1 = jest.fn(() => (arr[key] as any)(1));
      const counterSpy2 = jest.fn(() => (arr[key] as any)(2));
      autorun(counterSpy1);
      autorun(counterSpy2);
      expect(arr.length).toBe(2);
      expect(counterSpy1).toHaveBeenCalledTimes(1);
      expect(counterSpy2).toHaveBeenCalledTimes(1);
    });
    (["pop", "shift"] as const).forEach((key) => {
      const arr = observable.array<number>([1, 2, 3, 4]).value;
      const counterSpy1 = jest.fn(() => (arr[key] as any)());
      const counterSpy2 = jest.fn(() => (arr[key] as any)());
      autorun(counterSpy1);
      autorun(counterSpy2);
      expect(arr.length).toBe(2);
      expect(counterSpy1).toHaveBeenCalledTimes(1);
      expect(counterSpy2).toHaveBeenCalledTimes(1);
    });
  });

  it("should allow explicitly recursive raw function loops", () => {
    const counter = observable.object({ num: 0 }).value;
    const numSpy = jest.fn(() => {
      counter.num++;
      if (counter.num < 10) {
        numSpy();
      }
    });
    autorun(numSpy);
    expect(counter.num).toEqual(10);
    expect(numSpy).toHaveBeenCalledTimes(10);
  });

  it("should avoid infinite loops with other effects", () => {
    const nums = observable.object({ num1: 0, num2: 1 }).value;

    const spy1 = jest.fn(() => {
      nums.num1 = nums.num2;
    });
    const spy2 = jest.fn(() => {
      nums.num2 = nums.num1;
    });
    autorun(spy1);
    autorun(spy2);
    expect(nums.num1).toBe(1);
    expect(nums.num2).toBe(1);
    expect(spy1).toHaveBeenCalledTimes(1);
    expect(spy2).toHaveBeenCalledTimes(1);
    nums.num2 = 4;
    expect(nums.num1).toBe(4);
    expect(nums.num2).toBe(4);
    expect(spy1).toHaveBeenCalledTimes(2);
    expect(spy2).toHaveBeenCalledTimes(2);
    nums.num1 = 10;
    expect(nums.num1).toBe(4);
    expect(nums.num2).toBe(4);
    expect(spy1).toHaveBeenCalledTimes(3);
    expect(spy2).toHaveBeenCalledTimes(3);
  });

  it("should not run multiple times for a single mutation", () => {
    let dummy;
    const obj = observable.object<Record<string, number>>({}).value;
    const fnSpy = jest.fn(() => {
      for (const key in obj) {
        dummy = obj[key];
      }
      dummy = obj.prop;
    });
    autorun(fnSpy);

    expect(fnSpy).toHaveBeenCalledTimes(1);
    obj.prop = 16;
    expect(dummy).toBe(16);
    expect(fnSpy).toHaveBeenCalledTimes(2);
  });

  it("should observe json methods", () => {
    let dummy = <Record<string, number>>{};
    const obj = observable.object<Record<string, number>>({}).value;
    autorun(() => {
      dummy = JSON.parse(JSON.stringify(obj));
    });
    obj.a = 1;
    expect(dummy.a).toBe(1);
  });
});
