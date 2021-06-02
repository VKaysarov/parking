module.exports = {
  devServer: {
    proxy: {
      "/photo": {
        changeOrigin: true,
        target: "http://gpu3-chel1:8083",
      },
      "/marking/v2": {
        changeOrigin: true,
        target: "http://10.80.0.147:5002",
      },
    },
  },

  transpileDependencies: ["vuetify"],
};
