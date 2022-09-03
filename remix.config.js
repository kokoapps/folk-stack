const { flatRoutes } = require("remix-flat-routes");
module.exports = {
  // ignore all files in routes folder
  ignoredRouteFiles: ["**/*"],
  routes: async (defineRoutes) => {
    return flatRoutes("routes", defineRoutes);
  },
};
