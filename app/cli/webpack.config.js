/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
  mode: isDevelopment ? 'development' : 'production',
  entry: './src/scripts/queue-board/index.tsx',
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
    port: 3001,
    proxy: { '/api': 'http://localhost:3000' },
    hot: true,
  },
};
