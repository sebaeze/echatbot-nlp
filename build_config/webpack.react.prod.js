/*
*
*/
const path                        = require('path');
const webpack                     = require("webpack");
const CompressionPlugin           = require('compression-webpack-plugin');
const BrotliPlugin                = require('brotli-webpack-plugin');
// const BundleAnalyzerPlugin        = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
/*
const CopyWebpackPlugin           = require('copy-webpack-plugin');
const HtmlWebpackPlugin           = require('html-webpack-plugin');
const HtmlWebpackPrefixPlugin     = require('html-webpack-prefix-plugin') ;
*/
//
let tempURLbackend = process.env.URL_BACKEND ? process.env.URL_BACKEND : "http://localhost:3001" ;
if ( tempURLbackend.substr((tempURLbackend.length-1),1)=="/"){ tempURLbackend=tempURLbackend.substr(0,(tempURLbackend.length-1)); }
//
console.log('\n\n AMBIENTE: '+process.env.AMBIENTE+';') ;
console.log('tempURLbackend: '+tempURLbackend+'. \n\n') ;
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
  plugins: [
    // new BundleAnalyzerPlugin(),
    new webpack.DefinePlugin({
      '__URL_BACKEND__': JSON.stringify(tempURLbackend)
    }),
    new CompressionPlugin({
        filename: '[path].gz[query]',
        algorithm: 'gzip',
        test: /\.js$|\.css$|\.html$/,
        threshold: 10240,
        minRatio: 0.7
      }),
      new BrotliPlugin({
        asset: '[path].br[query]',
        test: /\.js$|\.css$|\.html$/,
        threshold: 10240,
        minRatio: 0.7
      })
  ]
};
//