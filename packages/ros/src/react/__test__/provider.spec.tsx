/**
 * @jest-environment jsdom
 */

import { describe, it, expect } from "@jest/globals";
import { RosProvider as Provider, RosProviderContext } from "../provider";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/jest-globals";

describe("provider", () => {
  it("should work in a simple case", () => {
    function A() {
      return (
        <Provider rootStore="bar">
          <RosProviderContext.Consumer>
            {(rootStore) => rootStore}
          </RosProviderContext.Consumer>
        </Provider>
      );
    }

    const { container } = render(<A />);
    expect(container).toHaveTextContent("bar");
  });

  it("should not provide the children prop", () => {
    function A() {
      return (
        <Provider>
          <RosProviderContext.Consumer>
            {(store) =>
              store ? "children was provided" : "children was not provided"
            }
          </RosProviderContext.Consumer>
        </Provider>
      );
    }

    const { container } = render(<A />);
    expect(container).toHaveTextContent("children was not provided");
  });
});
