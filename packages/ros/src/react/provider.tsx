import { PropsWithChildren, createContext } from "react";

export type IValueMap = {
  rootStore?: any;
};
export const RosProviderContext = createContext<any>({});

export function RosProvider(props: PropsWithChildren<IValueMap>) {
  const { children, rootStore } = props;

  return (
    <RosProviderContext.Provider value={rootStore}>
      {children}
    </RosProviderContext.Provider>
  );
}


RosProvider.displayName = "RosProvider"