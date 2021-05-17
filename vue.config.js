module.exports = {
  devServer: {
    proxy: {
      "/photo": {
        changeOrigin: true,
        target: "http://gpu3-chel1:8083",
      },
    },
  },
};
