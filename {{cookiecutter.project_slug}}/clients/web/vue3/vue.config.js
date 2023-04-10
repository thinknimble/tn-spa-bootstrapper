module.exports = {
  runtimeCompiler: true,
  assetsDir: 'static',
  devServer: {
    public: 'localhost:8080',
    proxy: {
      '/api/': {
        target: (process.env.VUE_APP_DEV_SERVER_BACKEND || 'http://server:8000') + '/api',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '',
        },
      },
    },
  },
  css: {
    loaderOptions: {
      css: {},
    },
  },
}
