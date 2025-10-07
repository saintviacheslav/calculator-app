const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
   entry: './app.js',
   output: {
      filename: 'app.bundle.js',
      path: path.resolve(__dirname, 'dist'),
      clean: true,
   },
   mode: 'production',
   resolve: {
      extensions: ['.js', '.css'],
   },
   module: {
      rules: [
         {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
               loader: 'babel-loader',
               options: {
                  presets: ['@babel/preset-env'],
               },
            },
         },
         {
            test: /\.css$/,
            use: [
               'style-loader',
               {
                  loader: 'css-loader',
                  options: {
                     importLoaders: 1,
                  },
               },
            ],
         },
      ],
   },
   plugins: [
      new HtmlWebpackPlugin({
         template: './index.html',
         filename: 'index.html',
      }),
   ],
   optimization: {
      minimize: true,
      minimizer: [
         new TerserPlugin({
            terserOptions: {
               compress: true,
               mangle: true,
            },
         }),
      ],
      usedExports: true,
   },
   devServer: {
      static: path.resolve(__dirname, 'dist'),
      compress: true,
      port: 8080,
      open: true,
   },
};
