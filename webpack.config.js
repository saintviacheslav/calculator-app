const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
   entry: './app.js', // Точка входа — твой основной JS в корне
   output: {
      filename: 'app.bundle.js', // Выходной JS: один минифицированный бандл
      path: path.resolve(__dirname, 'dist'), // Папка: dist/
      clean: true, // Очищает dist перед билдом
   },
   mode: 'production', // Оптимизация: минификация, tree-shaking
   resolve: {
      extensions: ['.js', '.css'], // Явно разрешаем .js и .css (фиксит resolve)
   },
   module: {
      rules: [
         // JS: Babel для ES6+ (если нужно; иначе удали)
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
         // CSS: Встраиваем в JS + минификация
         {
            test: /\.css$/,
            use: [
               'style-loader', // В CSS-in-JS
               {
                  loader: 'css-loader',
                  options: {
                     importLoaders: 1, // Для @import (variables.css)
                  },
               },
            ],
         },
      ],
   },
   plugins: [
      new HtmlWebpackPlugin({
         template: './index.html', // Твой HTML как шаблон
         filename: 'index.html', // Выход: dist/index.html с <script src="app.bundle.js">
      }),
   ],
   optimization: {
      minimize: true,
      minimizer: [
         new TerserPlugin({
            terserOptions: {
               compress: true,
               mangle: true, // Обфускация имён переменных
            },
         }),
      ],
      usedExports: true, // Tree-shaking: удаляет неиспользуемый код
   },
   // Dev-сервер для теста
   devServer: {
      static: path.resolve(__dirname, 'dist'),
      compress: true,
      port: 8080,
      open: true,
   },
};
