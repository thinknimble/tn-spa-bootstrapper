const path = require('path');  
module.exports = {
  runtimeCompiler: true,
  assetsDir: 'static',
  devServer: {
    proxy: {
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
  configureWebpack: {  
    resolve: {  
      alias: {  
        '@composables': path.resolve(__dirname, 'composables'),  
      },  
    },  
  }
}
