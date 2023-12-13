import { origin } from "./env";

export const defineProperty = Object.defineProperty;

export function addHiddenFinalProp(
  object: any,
  propName: PropertyKey,
  value: any
) {
  defineProperty(object, propName, {
    enumerable: false,
    writable: false,
    configurable: true,
    value,
  });
}

export function isStringish(value: any): value is string | number | symbol {
  const t = typeof value;
  switch (t) {
    case "string":
    case "symbol":
    case "number":
      return true;
  }
  return false;
}

export function isProxy(proxy: any): proxy is any {
  return !!proxy[origin];
}

export function isObject(value: any): value is Object {
  return value !== null && typeof value === "object";
}

const plainObjectString = Object.toString();

export function isPlainObject(value: any) {
  if (!isObject(value)) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  if (proto == null) {
    return true;
  }
  const protoConstructor =
    Object.hasOwnProperty.call(proto, "constructor") && proto.constructor;
  return (
    typeof protoConstructor === "function" &&
    protoConstructor.toString() === plainObjectString
  );
}

export function isES6Map(value: any): value is Map<any, any> {
  return value instanceof Map;
}

export function isES6Set(value: any): value is Set<any> {
  return value instanceof Set;
}
