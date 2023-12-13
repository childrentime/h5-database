import { allContext } from "./observer";

export let isBatching = false;

export const batch = (batchFn: () => void) => {
  isBatching = true;
  batchFn();
  isBatching = false;

  allContext.forEach((context) => {
    if (context.status === "out-of-date") {
      context.trigger();
    }
  });
};
