const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const config = {
    entry: './src/index.ts',
    output: {
        libraryTarget: 'window',
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js'
    },
    resolve: {
        extensions: ['.ts']
    },
    node: {
        fs: 'empty'
    },
    externals: [
        'dtrace-provider'
    ],
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.ts?$/,
                exclude: /node_modules/,
                loader: 'eslint-loader',
                options: {
                    emitError: true,
                    emitWarning: true,
                    failOnError: true,
                    failOnWarning: true
                }
            },
            {
                test: /\.ts?$/,
                exclude: /node_modules/,
                use: 'ts-loader'
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html',
            inject: true
        }),
        new CleanWebpackPlugin()
    ]
}

module.exports = (env, argv) => {
    if(argv.mode === 'development') {
        config.devServer = {
            port: 3700,
            contentBase: __dirname,
            watchOptions: {
                ignored: 'node_modules',
                aggregateTimeout: 500,
                poll: 1000
            }
        }

        config.resolve = {
            extensions: ['.ts', '.tsx', '.jsx', '.js', '.json']
        }

        config.devtool = 'inline-source-map';
    }

    return config;
}