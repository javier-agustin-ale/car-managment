
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  baseHref: "/car-management/",
  criticalCssPlans: [[1,"/styles-Q5E3GPMD.css",149,["html","body"],[],[[5,[1,2],"{height:100%}",[0,0]],[5,1,"{color-scheme:light}",[0]],[37,2,"{margin:0;background-color:#fff;color:#212121;font:400 14px/1.43 Roboto,Helvetica Neue,sans-serif}",[0],["roboto","helvetica neue","sans-serif"]]]]],
  locale: undefined,
  routes: [
  {
    "renderMode": 0,
    "route": "/car-management"
  },
  {
    "renderMode": 0,
    "route": "/car-management/car/*"
  },
  {
    "renderMode": 0,
    "route": "/car-management/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    "index.csr.html": {size: 17941, hash: "7e7c99050a30f56d", text: () => import("./assets-chunks/index_csr_html.mjs").then(m => m.default)},
    "index.server.html": {size: 18000, hash: "25e59ffe879071f3", text: () => import("./assets-chunks/index_server_html.mjs").then(m => m.default)}
  },
};
