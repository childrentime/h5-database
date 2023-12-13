import { __DEV__, isServer, copyStaticProperties } from "@mpa-ssr/core-utils";
import { forwardRef, memo } from "react";
import { useObserver } from "./useObserver";

const hasSymbol = typeof Symbol === "function" && Symbol.for;
const ReactForwardRefSymbol = hasSymbol
  ? Symbol.for("react.forward_ref")
  : typeof forwardRef === "function" &&
    forwardRef((props: any) => null)["$$typeof"];

export function observer<P extends object, R = {}>(
  baseComponent: React.ForwardRefExoticComponent<
    React.PropsWithoutRef<P> & React.RefAttributes<R>
  >
): React.MemoExoticComponent<
  React.ForwardRefExoticComponent<
    React.PropsWithoutRef<P> & React.RefAttributes<R>
  >
>;

export function observer<P extends object>(
  baseComponent: React.FunctionComponent<P>
): React.FunctionComponent<P>;

export function observer<
  C extends React.FunctionComponent<any> | React.ForwardRefRenderFunction<any>
>(baseComponent: C): C;

/**
 * copy from mobx-react
 */
export function observer<P extends object, R>(
  baseComponent:
    | React.ForwardRefRenderFunction<R, P>
    | React.FunctionComponent<P>
    | React.ForwardRefExoticComponent<
        React.PropsWithoutRef<P> & React.RefAttributes<R>
      >
) {
  if (isServer) {
    return baseComponent;
  }
  let render = baseComponent;
  let useForwardRef = false;

  if (
    ReactForwardRefSymbol &&
    /**@ts-ignore */
    baseComponent["$$typeof"] === ReactForwardRefSymbol
  ) {
    useForwardRef = true;
    /**@ts-ignore */
    render = baseComponent["render"];
  }

  let observerComponent = (props: any, ref: React.Ref<R>) => {
    return useObserver(() => render(props, ref));
  };

  (observerComponent as React.FunctionComponent).displayName =
    baseComponent.displayName;
  Object.defineProperty(observerComponent, "name", {
    value: baseComponent.name,
    writable: true,
    configurable: true,
  });

  if ((baseComponent as any).contextTypes) {
    (observerComponent as React.FunctionComponent).contextTypes = (
      baseComponent as any
    ).contextTypes;
  }

  if (useForwardRef) {
    // `forwardRef` must be applied prior `memo`
    // `forwardRef(observer(cmp))` throws:
    // "forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...))"
    observerComponent = forwardRef(observerComponent);
  }

  observerComponent = memo(observerComponent);

  copyStaticProperties(baseComponent, observerComponent);

  if (__DEV__) {
    Object.defineProperty(observerComponent, "contextTypes", {
      set() {
        throw new Error(
          `[mobx-react-lite] \`${
            this.displayName ||
            this.type?.displayName ||
            this.type?.name ||
            "Component"
          }.contextTypes\` must be set before applying \`observer\`.`
        );
      },
    });
  }

  return observerComponent;
}
