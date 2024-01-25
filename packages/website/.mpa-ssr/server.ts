import home from '/Users/zhangyuanqing/works/github/h5-database/packages/website/app/home/index.tsx';

const { setConfig } = require('/Users/zhangyuanqing/works/github/h5-database/packages/mpa-ssr/configs/runtime.config.ts');

const pages = { home };

const assets = __non_webpack_require__('../webpack-assets.json');

setConfig({ pages, assets });
