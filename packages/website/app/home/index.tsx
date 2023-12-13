import { Suspense, useContext, useState } from "react";
import Header from "./header";
import styles from "./index.module.scss";
import { useStyles } from "@mpa-ssr/core";
import { MobXProviderContext, observer } from "mobx-react";


const Home = observer(() => {
  useStyles(styles);
  const { store } = useContext(MobXProviderContext);
  const { title } = store;

  return (
    <div>
      <Suspense>
        <Header />
      </Suspense>
      <Suspense>
        <div className={styles.title} onClick={() => {
          console.log('I can be clicked')
        }}>{title}</div>
      </Suspense>
    </div>
  );
});

export default Home;
