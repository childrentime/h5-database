# 回退缓存

## 原理

1. 在跳转之前缓存页面的html和css，以及store数据

2. 返回的时候，将页面降级为csr渲染，并且阻止csr侧的请求

3. 将缓存的html,css和store注入页面中

