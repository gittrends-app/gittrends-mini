/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
  mode: isDevelopment ? 'development' : 'production',
  entry: './src/scripts/queue-board/App.tsx',
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    path: path.resolve(__dirname, 'assets'),
    filename: 'index.bundle.js',
  },
  devServer: {
    static: path.resolve(__dirname, 'assets'),
    compress: true,
    port: process.env.DEV_SERVER_PORT || 8081,
    proxy: { '/api': process.env.BULL_BOARD_URL || 'http://localhost:8080' },
    hot: true,
  },
};
