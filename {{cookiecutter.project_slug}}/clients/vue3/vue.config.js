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
  extensions: ['.js', '.vue', '.json'],
  configureWebpack: {  
    resolve: {  
      alias: {  
        "@": path.join(__dirname, './src')
        // '@composables': path.resolve(__dirname, 'composables'),  
      },  
    },  
  }
}
