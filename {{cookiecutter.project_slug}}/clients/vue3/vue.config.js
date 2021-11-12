module.exports = {
  runtimeCompiler: true,
  assetsDir: 'static',
  devServer: {
    proxy: {
      '/api/': {
        target: (process.env.DEV_SERVER_BACKEND || '{{ https://{{ cookiecutter.project_slug }}-staging.herokuapp.com }}') + '/api/',
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
