# MPA-SSR

## 使用说明

### 目录结构

``` shell
|-- app 页面文件夹
```

### 类型提示导入

### express实例暴露

暴露出直出页面的 express 实例来供修改

## 作用

* 开箱即用，无需任何配置

## 流程

启动一个 express app

### 访问路由

1. 访问路由，找到路由对应的入口文件
2. 在 server 端编译路由  server-entry.tsx webpack.pageNode.config.ts
3. 在 client 端编译路由  client-entry.tsx webpack.pageWeb.config.ts
4. 编译加载页面的express服务器 使用 `_handle` 内部方法接管 编译出html renderPage.ts webpack.renderPage.config.ts
5. 加载客户端 js

### 保存文件

1. client 端热更新
2. 使用 nodejs 热交换重新加载编译加载页面的express服务器，保证手动刷新页面的时候服务端内容与客户端内容都是最新的

## Css处理

将每个页面的Css打包到一个单独的css文件中

### 方案对比

1. MiniCssExtractPlugin

将css提取到一个单独的文件中，并且在html中使用link标签插入

优点： 简单易用

2. isomorphic-style-loader

在服务端 `renderToString`,加载每一个被渲染的模块的 css

eg:

```tsx
function App() {
    if(true){
        return <ModuleA>
    }

    // css of moduleB will be not loaded
    return <ModuleB>
}
```

在客户端 render 的过程中，通过 `useEffect` 来加载其余的 css

优点：减少 css 体积，只加载首屏 css

缺点： 需要在每个组件中使用 `useStyles` hook

为了更好的性能，我们使用 `isomorphic-style-loader` 来同构地渲染 css

### 直出

## 状态管理

使用 `mobx` 作为状态管理工具。每个页面有一个根 `store`, 可以在根 `store` 里面添加子 `store`

### RootStore

### ChildStore

## 流式渲染
