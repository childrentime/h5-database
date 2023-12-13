import { describe, expect, it } from "@jest/globals";
import { observable } from "../decorator";
import { autorun } from "../observer";
import { isProxy } from "../utils";

describe("decorator server", () => {
  it("should not observe", () => {
    class Order {
      @observable() accessor price: number = 3;
    }
    const order = new Order();
    let dummy;
    autorun(() => {
      dummy = order.price;
    });
    expect(dummy).toBe(3);
    order.price = 100;
    expect(dummy).toBe(3);
  });

  it("should not be proxy", () => {
    let object =  { a: 1 };
    class Order {
      @observable("object") accessor price = object;
    }
    const order = new Order();
    expect(isProxy(order.price)).toBe(false);
    expect(order.price).toBe(object);
  });
});
