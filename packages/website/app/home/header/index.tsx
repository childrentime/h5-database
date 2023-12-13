import { MobXProviderContext, observer } from "mobx-react";
import styles from "./index.module.scss";
import { useStyles } from "@mpa-ssr/core";
import { use, useContext } from "react";
import { AppStore } from "../store";

const Header = observer(() => {
  const { store } = useContext(MobXProviderContext);
  const { componentData, promises } = store as AppStore;
  const { title } = componentData;
  // if (typeof window === "undefined") {
    use(promises[0]);
  // }
  console.log('????')

  useStyles(styles);
  return (
    <div
      className={styles.red}
      onClick={() => {
        console.log('???')
      }}
    >
      {title}
    </div>
  );
});

export default Header;
