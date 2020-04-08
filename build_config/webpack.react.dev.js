/*
*
*/
const path                        = require('path');
const webpack                     = require("webpack");
const HtmlWebpackPlugin           = require('html-webpack-plugin');
//
let tempURLbackend = process.env.URL_BACKEND ? process.env.URL_BACKEND : "http://localhost:3001" ;
if ( tempURLbackend.substr((tempURLbackend.length-1),1)=="/"){ tempURLbackend=tempURLbackend.substr(0,(tempURLbackend.length-1)); }
//
module.exports = {
  entry: './src/widget.js',
  output: {
    filename: 'widget.js',
    path: path.join(__dirname, '../dist')
  },
  module:{
	   rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      },
      {
        test: /\.(svg|woff|woff2|ttf|eot|otf)([\?]?.*)$/,
        //loader: 'url-loader?limit=false'
        // Muy importante indicar la direccion para buscar por nombre "/" indica que busca en directorio raiz
        loader: 'file-loader?name=/[name].[ext]',
     },
     {
      test: /\.(gif|png|jpe?g|svg)$/i,
      use: [
        'file-loader',
        {
          loader: 'image-webpack-loader',
          options: {
            mozjpeg: {
              progressive: true,
              quality: 65
            },
            // optipng.enabled: false will disable optipng
            optipng: {
              enabled: false,
            },
            pngquant: {
              quality: '65-90',
              speed: 4
            },
            gifsicle: {
              interlaced: false,
            },
            // the webp option will enable WEBP
            webp: {
              quality: 75
            }
          }
        },
      ]
     }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx','.css'],
    modules: [ path.join(__dirname,'../node_modules') ]
  },
  resolveLoader: {
    modules: [ path.join(__dirname,'../node_modules') ]
  },
  devServer: {
    port: 9001,
    //open: true,
    proxy: {
        "/": "http://localhost:3001"
    },
    headers: {
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-id, Content-Length, X-Requested-With",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
    }
    //publicPath: "/test",
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: "test.html",
      template: "./test/test.html",
      title:"testWidget",
      inject: true,
      prefix: '/',
      minify:{
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true
      },
      hash:true,
    }),
    new webpack.DefinePlugin({
      '__URL_BACKEND__': JSON.stringify(tempURLbackend)
    })
  ]
};
//