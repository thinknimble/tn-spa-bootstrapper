module.exports = {
  runtimeCompiler: true,
  assetsDir: 'static',
  devServer: {
    proxy: {
      public: process.env.VUE_APP_DEV_SERVER_PUBLIC || '0.0.0.0:8080',
      '/api/': {
        target: (process.env.VUE_APP_DEV_SERVER_BACKEND +'/api/'|| 'https://{{ cookiecutter.project_slug }}-staging.herokuapp.com') + '/api/',
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
