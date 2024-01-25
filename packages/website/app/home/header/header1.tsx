import { MobXProviderContext } from "mobx-react";
import { useContext } from "react";
import { AppStore } from "../store";

export const Header1 = () => {
  const { store } = useContext(MobXProviderContext);
  const { componentData } = store as AppStore;
  const { header1 } = componentData;
  return <div>{header1}</div>
}