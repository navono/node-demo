/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

module.exports = {
  entry: './src/main',
  target: 'node',
  // 置为空即可忽略webpack-node-externals插件
  // ts文件的处理
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: {
          loader: 'ts-loader',
          options: { transpileOnly: true },
        },
        exclude: /node_modules/,
      },
      {
        test: /.node$/,
        use: 'node-loader',
      },
    ],
  },
  // 打包后的文件名称以及位置
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  resolve: {
    extensions: ['.js', '.ts', '.json'],
    plugins: [new TsconfigPathsPlugin()],
    fallback: { util: false },
  },
  externals: {
    sqlite3: 'commonjs sqlite3',
  },
  plugins: [
    // 需要进行忽略的插件
    new webpack.IgnorePlugin({
      checkResource(resource) {
        const lazyImports = [
          '@nestjs/microservices',
          '@nestjs/microservices/microservices-module',
          // '@nestjs/websockets/socket-module',
          'cache-manager',
          'class-validator',
          'class-transformer',
          'class-transformer/storage',
        ];
        if (!lazyImports.includes(resource)) {
          return false;
        }
        try {
          require.resolve(resource, {
            paths: [process.cwd()],
          });
        } catch (err) {
          return true;
        }
        return false;
      },
    }),
    new ForkTsCheckerWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        // 拷贝swagger相关的文件
        {
          from: __dirname + '/node_modules/swagger-ui-dist/',
          to: './',
        },
      ],
    }),
    // 删除多余的文件
    new CleanWebpackPlugin({
      cleanAfterEveryBuildPatterns: [
        __dirname + '/dist/*.html',
        __dirname + '/dist/*.map',
        __dirname + '/dist/*.md',
        __dirname + '/dist/*.json',
        __dirname + '/dist/index.js',
        __dirname + '/dist/LICENSE',
        __dirname + '/dist/NOTICE',
      ],
    }),
  ],
};
