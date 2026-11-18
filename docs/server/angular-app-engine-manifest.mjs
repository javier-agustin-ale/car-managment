
export default {
  basePath: "/car-management",
  allowedHosts: [],
  supportedLocales: {
  "en-US": ""
},
  entryPoints: {
    "": () => import('./main.server.mjs')
  },
};
