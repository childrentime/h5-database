import { Suspense, useContext, useState } from "react";
import Header from "./header";
import styles from "./index.module.scss";
import { useStyles } from "@mpa-ssr/core";
import { MobXProviderContext, observer } from "mobx-react";
import { Header1 } from "./header/header1";


const Home = observer(() => {
  useStyles(styles);
  const { store } = useContext(MobXProviderContext);
  const { title } = store;

  return (
    <div>
      <Header1/>
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
