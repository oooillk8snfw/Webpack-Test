const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const cssLoaders = extra => {
  const loaders = [{
    loader: MiniCSSExtractPlugin.loader,
    options: {
      hmr: isDev,
      reloadAll: true
    }
  }, 'css-loader'
  ]

  if (extra) {
    loaders.push(extra)
  }

  return loaders
}

const optimizaton = () => {
  const config = {
    splitChunks: {
      chunks: 'all'
    }
  }

  if (isProd) {
    config.minimizer = [
      new OptimizeCSSAssetsWebpackPlugin(),
      new TerserWebpackPlugin()
    ]
  }

  return config
}

const babelOptions = preset => {
  const opts = {
    presets: [
      '@babel/preset-env'
    ],
    plugins: [
      '@babel/plugin-proposal-class-properties'
    ]
  }

  if (preset) {
    opts.presets.push(preset)
  }

  return opts
}

const jsLoaders = () => {
  const loaders = [{
    loader: 'babel-loader',
    options: babelOptions()
  }]

  if (isDev) {
    loaders.push('eslint-loader')
  }

  return loaders
}

const plugins = () => {
  const base = [
    new HTMLWebpackPlugin({
      template: './index.html',
      minify: {
        collapseWhitespace: isProd
      }
    }),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, 'src/forsenW.ico'),
        to: path.resolve(__dirname, 'dist')
      }
    ]),
    new MiniCSSExtractPlugin({
      filename: filename('css')
    })
  ]

  if (isProd) {
    base.push(new BundleAnalyzerPlugin())
  }

  return base
}

const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`
console.log('IS DEV:', isDev)

module.exports = {
  context: path.resolve(__dirname, 'src'),
  mode: 'development',
  entry: {
    main: ['@babel/polyfill', './index.jsx'],
    anal: './analytics.ts'
  },
  output: {
    filename: filename('js'),
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    // extensions: ['.js', '.json', '.jpg'],
    alias: {
      '@models': path.resolve(__dirname, 'src/models'),
      '@': path.resolve(__dirname, 'src')
    }
  },
  optimization: optimizaton(),
  devServer: {
    port: 3228,
    hot: isDev
  },
  devtool: isDev ? 'source-map' : '',
  plugins: plugins(),
  module: {
    rules: [{
      test: /\.css$/,
      use: cssLoaders()
    },
    {
      test: /\.less$/,
      use: cssLoaders('less-loader')
    },
    {
      test: /\.s[ac]ss$/,
      use: cssLoaders('sass-loader')
    },
    {
      test: /\.(png|jpg|svg|gif)$/,
      use: ['file-loader']
    },
    {
      test: /\.(ttf|woff|woff2|eot)$/,
      use: ['file-loader']
    },
    {
      test: /\.xml$/,
      use: ['xml-loader']
    },
    {
      test: /\.js$/,
      exclude: /node_modules/,
      use: jsLoaders()
    },
    {
      test: /\.ts$/,
      exclude: /node_modules/,
      loader: {
        loader: 'babel-loader',
        options: babelOptions('@babel/preset-typescript')
      }
    },
    {
      test: /\.jsx$/,
      exclude: /node_modules/,
      loader: {
        loader: 'babel-loader',
        options: babelOptions('@babel/preset-react')
      }
    }
    ]
  }
}