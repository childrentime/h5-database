# h5 常见知识点

## MPA SSR搭建

## AB测试

## 曝光埋点

## 性能优化

## 错误上报与sourcemap反解

## UI组件和功能组件

### 轮播图

### Tab手势横滑

### 微信回退缓存

### 无限滚动

### 贝塞尔曲线动画

## node性能监控

@streamable标记一个store中的对象，如果对象 [[GET]] 为 null值，则抛出一个 promise。

@pending标记一个方法，这个方法里面是相关的慢接口 不参与promise.all中
在客户端的时候，会注入服务端的原始数据到方法的最后一个参数中。

@pending需要接受一个string作为参数

```tsx
const map = new Map();
function pending(key: string) {
  return (value, {kind}) => {
     if(typeof window === 'undefined'){
          return value();
     }else {
      // 流式数据好了之后根据key找到方法
      map.set(key,[value]);
      return;
     }
  };
}

// example
@pending('streamFetchTitle')
streamFetchTitle = async (d: string) => {
  const data = d || (await new Promise((resolve) => {
    setTimeout(() => {
      resolve("fulfilled data");
    }, 3000);
  })) as string;
  
  return data;
};
```