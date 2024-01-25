const assert =require('node:assert');

function collect(_value, {name, addInitializer}) {
  addInitializer(function () { // (A)
    console.log('this',this);
    if (!this.collectedMethodKeys) {
      this.collectedMethodKeys = new Set();
    }
    this.collectedMethodKeys.add(name);
  });
}

function pending(key: string) {
  return (value, {kind}) => { // decorator function
    if (kind === 'method') {
      return function (...args) {
        if(typeof window === 'undefined'){
          return value.apply(this, args).then
        }else {
          const data = map.get(key);
          return value.apply(this, [...args,data])
        }
      };
      
    }
  };
}

class C {
  @collect
  toString() {}
  @collect
  [Symbol.iterator]() {}

  a;
  b;

  constructor() {
    this.a = new A();
    this.b = new A();
  }
}

class A {
  @collect
  toString1() {}
  @collect
  [Symbol.iterator]() {}
}
const inst = new C();
  // @ts-ignore
console.log('inst.collectedMethodKeys',inst.collectedMethodKeys)
assert.deepEqual(
  // @ts-ignore
  inst.collectedMethodKeys,
  new Set(['toString', Symbol.iterator])
);
