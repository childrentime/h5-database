import { PropsWithChildren, createContext } from "react";

export interface SendImprFunc {
  (trackingInfo?: any): void;
}

export type ImprPrividerProps = PropsWithChildren<{
  value: SendImprFunc;
}>;

const noop = () => {};

export const ImprContext = createContext<SendImprFunc>(noop);

export const ImprProvider = (props: ImprPrividerProps) => {
  const { children, value } = props;

  return <ImprContext.Provider value={value}>{children}</ImprContext.Provider>;
};
