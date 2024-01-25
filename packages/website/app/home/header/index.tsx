import { MobXProviderContext, observer } from "mobx-react";
import styles from "./index.module.scss";
import { useStyles } from "@mpa-ssr/core";
import { useContext } from "react";
import { AppStore } from "../store";
import { throwIfUnresolved } from "../../../decorator/stream";
import { streamKey } from "./constant";

const Header = observer(() => {
  const { store } = useContext(MobXProviderContext);
  const { componentData } = store as AppStore;
  const { title } = componentData;

  throwIfUnresolved(streamKey)
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
