//webpack.config.js
const path = require('path')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

const rootFolder = path.resolve(__dirname, '..', '..')
const typeScriptConfigFilePath = path.resolve(__dirname, 'tsconfig.json')

module.exports = {
  mode: 'production',
  target: 'node',
  entry: {
    main: path.resolve(__dirname, 'index.ts'),
  },
  output: {
    path: path.resolve(rootFolder, 'build'),
    filename: 'worker-bundle.js',
  },
  stats: {
    warnings: false,
  },
  // see https://github.com/trentm/node-bunyan#webpack
  externals: ['dtrace-provider', 'fs', 'mv', 'os', 'source-map-support'],
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    extensionAlias: {
      '.js': ['.js', '.ts'],
      '.cjs': ['.cjs', '.cts'],
      '.mjs': ['.mjs', '.mts'],
    },
    plugins: [
      new TsconfigPathsPlugin({ configFile: typeScriptConfigFilePath }),
    ],
  },
  module: {
    rules: [
      { 
        test: /\.([cm]?ts|ts)$/, 
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: typeScriptConfigFilePath,
            }
          }
        ]
      },
      {
        test: /\.node$/,
        loader: "node-loader",
      }
    ],
  },
}
