/**
 * 方便模块化的定义数据
 * 通过 $root获取rootStore的例子，注意序列化死循环
 */
export class ChildStore<R> {
  private getRoot: () => R;

  get $root() {
    return this.getRoot();
  }

  constructor(root: R) {
    this.getRoot = () => root;
  }
}
