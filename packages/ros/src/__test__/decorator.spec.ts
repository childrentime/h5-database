/**
 * @jest-environment jsdom
 */


import { describe, expect, it, jest } from "@jest/globals";
import { observable, computed } from "../decorator";
import { autorun } from "../observer";
import { batch } from "../batch";


describe("decorator", () => {
  it("decorator box", () => {
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
    expect(dummy).toBe(100);
  });

  it("decorator array", () => {
    class Order {
      @observable("array", "shallow") accessor prices = [100,99];
    }
    const order = new Order();
    let dummy;
    autorun(() => {
      dummy = order.prices[0];
    })
    expect(dummy).toBe(100);
    order.prices[0] = 50;
    expect(dummy).toBe(50);
  });

  it("decorator computed", () => {
    class Order {
      @observable() accessor price: number = 3;
      @computed get pricePlus() {
        return this.price + 1;
      }
    }
    const order = new Order();
    let dummy;
    autorun(() => {
      dummy = order.pricePlus;
    });
    expect(dummy).toBe(4);
    order.price = 100;
    expect(dummy).toBe(101);
  });

  it("decorator batch", () => {
    class Order {
      @observable() accessor price: number = 3;
      @observable() accessor time: number = 4;

      update() {
        batch(() => {
          this.price = 4;
          this.time = 5;
        });
      }
    }
    const order = new Order();
    const fn = jest.fn();
    autorun(() => {
      order.price;
      order.time;
      fn();
    });
    expect(fn).toBeCalledTimes(1);
    order.update();
    expect(fn).toBeCalledTimes(2);
  });
});
