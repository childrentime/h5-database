/**
 * @jest-environment jsdom
 */

import { describe, it, expect, jest, afterEach } from "@jest/globals";
import { observable } from "../../observables";
import { observer } from "../observer";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import {
  StrictMode,
  createElement,
  createRef,
  forwardRef,
  memo,
  useImperativeHandle,
  useRef,
} from "react";
import { useObserver } from "../useObserver";
import { observable as observableDecorator } from "../../decorator";
import "@testing-library/jest-dom/jest-globals";

afterEach(cleanup);

let consoleWarnMock: any;
afterEach(() => {
  consoleWarnMock?.mockRestore();
});

describe("nest rendering", () => {
  const execute = () => {
    const store = observable.object({
      todos: [
        {
          completed: false,
          title: "a",
        },
      ],
    }).value;
    const renderings = {
      item: 0,
      list: 0,
    };

    const TodoItem = observer(({ todo }: { todo: (typeof store.todos)[0] }) => {
      renderings.item++;
      return <li>|{todo.title}</li>;
    });

    const TodoList = observer(() => {
      renderings.list++;
      return (
        <div>
          <span>{store.todos.length}</span>
          {store.todos.map((todo, idx) => (
            <TodoItem key={idx} todo={todo} />
          ))}
        </div>
      );
    });
    const rendered = render(<TodoList />);
    return { ...rendered, store, renderings };
  };

  it("first rendering", () => {
    const { getAllByText, renderings } = execute();
    expect(renderings.list).toBe(1);
    expect(renderings.item).toBe(1);
    expect(getAllByText("1")).toHaveLength(1);
    expect(getAllByText("|a")).toHaveLength(1);
  });

  it("inner store changed", () => {
    const { store, getAllByText, renderings } = execute();
    act(() => {
      store.todos[0].title += "a";
    });
    expect(renderings.list).toBe(2);
    expect(renderings.item).toBe(2);
    expect(getAllByText("1")).toHaveLength(1);
    expect(getAllByText("|aa")).toHaveLength(1);
  });

  it("rerendering with outer store added", () => {
    const { store, container, getAllByText, renderings } = execute();
    act(() => {
      store.todos.push({
        completed: true,
        title: "b",
      });
    });
    expect(container.querySelectorAll("li").length).toBe(2);
    expect(getAllByText("2")).toHaveLength(1);
    expect(getAllByText("|b")).toHaveLength(1);
    expect(renderings.list).toBe(2);
    expect(renderings.item).toBe(3);
  });

  it("rerendering with outer store pop", () => {
    const { store, container, renderings } = execute();
    let oldTodo;
    act(() => {
      oldTodo = store.todos.pop();
    });
    expect(renderings.list).toBe(2);
    expect(renderings.item).toBe(1);
    expect(container.querySelectorAll("li").length).toBe(0);
  });
});

describe("should only rerender child component", () => {
  const execute = () => {
    const store = observable.object({
      todos: [
        {
          completed: false,
          title: "a",
        },
      ],
    }).value;
    const store1 = observable.object({ name: "abc" }).value;
    const renderings = {
      item: 0,
      list: 0,
    };

    const TodoItem = observer(() => {
      renderings.item++;
      return <li>{store1.name}</li>;
    });

    const TodoList = observer(() => {
      renderings.list++;
      return (
        <div>
          <span>{store.todos.length}</span>
          <TodoItem />
        </div>
      );
    });
    const rendered = render(<TodoList />);
    return { ...rendered, store, renderings, store1 };
  };

  it("first rendering", () => {
    const { getAllByText, renderings } = execute();
    expect(renderings.list).toBe(1);
    expect(renderings.item).toBe(1);
    expect(getAllByText("1")).toHaveLength(1);
    expect(getAllByText("abc")).toHaveLength(1);
  });

  it("inner store changed", () => {
    const { store1, getAllByText, renderings } = execute();
    act(() => {
      store1.name = "dadsa";
    });
    expect(renderings.list).toBe(1);
    expect(renderings.item).toBe(2);
    expect(getAllByText("1")).toHaveLength(1);
    expect(getAllByText("dadsa")).toHaveLength(1);
  });
});

describe("observers", () => {
  it("observer(forwardRef(cmp)) + useImperativeHandle", () => {
    interface IMethods {
      focus(): void;
    }

    interface IProps {
      value: string;
    }

    const FancyInput = observer(
      forwardRef((props: IProps, ref: React.Ref<IMethods>) => {
        const inputRef = useRef<HTMLInputElement>(null);
        useImperativeHandle(
          ref,
          () => ({
            focus: () => {
              inputRef.current!.focus();
            },
          }),
          []
        );
        return <input ref={inputRef} defaultValue={props.value} />;
      })
    );

    const cr = createRef<IMethods>();
    render(<FancyInput ref={cr} value="" />);
    expect(cr).toBeTruthy();
    expect(cr.current).toBeTruthy();
    expect(typeof cr.current!.focus).toBe("function");
  });

  it("useImperativeHandle and forwardRef should work with useObserver", () => {
    consoleWarnMock = jest.spyOn(console, "warn").mockImplementation(() => {});
    interface IMethods {
      focus(): void;
    }

    interface IProps {
      value: string;
    }

    const FancyInput = memo(
      forwardRef((props: IProps, ref: React.Ref<IMethods>) => {
        const inputRef = useRef<HTMLInputElement>(null);
        useImperativeHandle(
          ref,
          () => ({
            focus: () => {
              inputRef.current!.focus();
            },
          }),
          []
        );
        return useObserver(() => {
          return <input ref={inputRef} defaultValue={props.value} />;
        });
      })
    );

    const cr = createRef<IMethods>();
    render(<FancyInput ref={cr} value="" />);
    expect(cr).toBeTruthy();
    expect(cr.current).toBeTruthy();
    expect(typeof cr.current!.focus).toBe("function");
    expect(consoleWarnMock).toMatchSnapshot();
  });

  it("should hoist known statics only", () => {
    function isNumber() {
      return null;
    }

    function MyHipsterComponent() {
      return null;
    }
    MyHipsterComponent.defaultProps = { x: 3 };
    MyHipsterComponent.propTypes = { x: isNumber };
    MyHipsterComponent.randomStaticThing = 3;
    MyHipsterComponent.type = "Nope!";
    MyHipsterComponent.compare = "Nope!";
    MyHipsterComponent.render = "Nope!";

    const wrapped = observer(MyHipsterComponent) as any;
    expect(wrapped.randomStaticThing).toEqual(3);
    expect(wrapped.defaultProps).toEqual({ x: 3 });
    expect(wrapped.propTypes).toEqual({ x: isNumber });
    expect(wrapped.type).toBeInstanceOf(Function); // And not "Nope!"; this is the wrapped component, the property is introduced by memo
    expect(wrapped.compare).toBe(null); // another memo field
    expect(wrapped.render).toBe(undefined);
  });

  it("should inherit original name/displayName #3438", () => {
    function Name() {
      return null;
    }
    Name.displayName = "DisplayName";
    const TestComponent = observer(Name);

    expect((TestComponent as any).type.name).toBe("Name");
    expect((TestComponent as any).type.displayName).toBe("DisplayName");
  });

  it("parent / childs render in the right order", (done) => {
    // See: https://jsfiddle.net/gkaemmer/q1kv7hbL/13/
    const events: string[] = [];

    class User {
      @observableDecorator() accessor name = "User's name";
    }

    class Store {
      @observableDecorator("object") accessor user: User | null = new User();
      public logout() {
        this.user = null;
      }
    }

    const store = new Store();

    function tryLogout() {
      try {
        store.logout();
        expect(true).toBeTruthy();
      } catch (e) {
        // t.fail(e)
      }
    }

    const Parent = observer(() => {
      events.push("parent");
      if (!store.user) {
        return <span>Not logged in.</span>;
      }
      return (
        <div>
          <Child />
          <button onClick={tryLogout}>Logout</button>
        </div>
      );
    });

    const Child = observer(() => {
      events.push("child");
      if (!store.user) {
        return null;
      }
      return <span>Logged in as: {store.user.name}</span>;
    });

    render(<Parent />);

    tryLogout();
    expect(events).toEqual(["parent", "child"]);
    done();
  });

  it("should have overload for props with children", () => {
    interface IProps {
      value: string;
    }
    const TestComponent = observer<IProps>(({ value }) => {
      return null;
    });

    render(<TestComponent value="1" />);

    // this test has no `expect` calls as it verifies whether such component compiles or not
  });

  it("should preserve generic parameters", () => {
    interface IColor {
      name: string;
      css: string;
    }

    interface ITestComponentProps<T> {
      value: T;
      callback: (value: T) => void;
    }
    const TestComponent = observer(
      <T extends unknown>(props: ITestComponentProps<T>) => {
        return null;
      }
    );

    function callbackString(value: string) {
      return;
    }
    function callbackColor(value: IColor) {
      return;
    }

    render(<TestComponent value="1" callback={callbackString} />);
    render(
      <TestComponent
        value={{ name: "red", css: "rgb(255, 0, 0)" }}
        callback={callbackColor}
      />
    );

    // this test has no `expect` calls as it verifies whether such component compiles or not
  });

  it("should preserve generic parameters when forwardRef", () => {
    interface IMethods {
      focus(): void;
    }

    interface IColor {
      name: string;
      css: string;
    }

    interface ITestComponentProps<T> {
      value: T;
      callback: (value: T) => void;
    }
    const TestComponent = observer(
      <T extends unknown>(
        props: ITestComponentProps<T>,
        ref: React.Ref<IMethods>
      ) => {
        return null;
      }
    );

    function callbackString(value: string) {
      return;
    }
    function callbackColor(value: IColor) {
      return;
    }

    render(<TestComponent value="1" callback={callbackString} />);
    render(
      <TestComponent
        value={{ name: "red", css: "rgb(255, 0, 0)" }}
        callback={callbackColor}
      />
    );

    // this test has no `expect` calls as it verifies whether such component compiles or not
  });

  it("should keep original props types", () => {
    interface TestComponentProps {
      a: number;
    }

    function TestComponent({ a }: TestComponentProps): JSX.Element | null {
      return null;
    }

    const ObserverTestComponent = observer(TestComponent);

    const element = createElement(ObserverTestComponent, { a: 1 });
    render(element);

    // this test has no `expect` calls as it verifies whether such component compiles or not
  });

  it("StrictMode", async () => {
    const o = observable.object({ x: 0 }).value;

    const Cmp = observer(() => {
      return o.x;
    });

    const { container, unmount } = render(
      <StrictMode>
        <Cmp />
      </StrictMode>
    );

    expect(container).toHaveTextContent("0");
    act(() => {
      o.x++;
    });
    expect(container).toHaveTextContent("1");
    unmount();
  });
});
