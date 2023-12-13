import { Computed } from "./computed";
import { Observer } from "./observer";

export abstract class IObservable {
  abstract contexts: Set<Observer | Computed>;
  abstract notify: () => void;
  abstract register: (context: Observer) => void;
  abstract unregister: (context: Observer) => void;
  abstract toJSON: () => string;
  abstract toString: () => string;
  abstract valueOf: () => any;
  abstract observers: Observer[];
  abstract computes: Computed[];
  abstract value: any;
}

export type IObservableMode = 'deep' | 'shallow' | 'ref';
