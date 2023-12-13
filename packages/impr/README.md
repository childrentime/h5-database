# Impr

元素曝光组件

## Usage

### 埋点方法注入

```tsx
import { ImprContext } from "impr";

<ImprContext.Provider
  value={(trackingInfo) => {
    console.log("trackingInfo", trackingInfo);
  }}
>
  <App />
</ImprContext.Provider>;
```

### 给组件埋点

```tsx
<Impr trackingInfo={{ a: 1 }}>
  <div>hello world</div>
</Impr>
```
