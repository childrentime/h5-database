import { isServer } from "@mpa-ssr/core-utils";
import { useCallback, useRef, useState } from "react";
import { Observer } from "../observer";
import { useSyncExternalStore } from "use-sync-external-store/shim";

export function useObserver(render: () => any) {
  if (isServer) {
    return render();
  }

  const storeChangeRef = useRef<() => void>();
  const observerRef = useRef<Observer>();
  const symbolRef = useRef<Symbol>();
  const [, forceUpdate] = useState<Symbol>()

  if(!symbolRef.current){
    symbolRef.current = Symbol();
  }

  if (!observerRef.current) {
    observerRef.current = new Observer(() => {
      symbolRef.current = Symbol();
      storeChangeRef.current?.();
    });
  }

  const subscribe = useCallback((onStoreChange: () => void) => {
    storeChangeRef.current = onStoreChange;
    /**
     *  We've lost our reaction and therefore all subscriptions, occurs when <StrictMode>
     */
    if(!observerRef.current){
      observerRef.current = new Observer(() => {
        symbolRef.current = Symbol();
        storeChangeRef.current?.();
      });
      forceUpdate(Symbol())
    }

    return () => {
      storeChangeRef.current = undefined;
      observerRef.current?.dispose();
      observerRef.current = undefined;
    };
  }, []);

  const getSnapshot = useCallback(() => {
    return symbolRef.current;
  }, []);

  const getServerSnapShot = useCallback(() => {
    return symbolRef.current;
  }, []);

  useSyncExternalStore(subscribe, getSnapshot, getServerSnapShot);

  let renderResult;
  let exception;


  observerRef.current!.track(() => {
    try {
      renderResult = render();
    } catch (error) {
      exception = error;
    }
  });

  if (exception) {
    throw exception; // re-throw any exceptions caught during rendering
  }

  return renderResult;
}
