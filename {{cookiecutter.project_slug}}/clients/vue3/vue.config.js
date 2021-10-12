module.exports = {
  runtimeCompiler: true,
  assetsDir: 'static',
  devServer: {
    proxy: {
      '/api/': {
        target: (process.env.DEV_SERVER_BACKEND || '{{ cookiecutter.staging_url }}') + '/api/',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '',
        },
      },
    },
  },
  css: {
    loaderOptions: {
      sass: {
        additionalData: '', //@import "@/styles/abstracts/styles.scss";
      },
    },
  },
}
