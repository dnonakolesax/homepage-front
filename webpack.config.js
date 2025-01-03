const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const webpack = require('webpack');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

module.exports = [
    {
        name: 'client',
        context: path.resolve(__dirname, 'src'),
        entry: './index.js',
        devServer: {
            port: 7676,
            historyApiFallback: true,
            hot: true,
        },
        module: {
            exprContextCritical: false,
            rules: [
                {
                    test: /\.(gif|png)$/i,
                    type: 'asset/resource',
                    use: [
                        {
                            loader: 'image-webpack-loader',
                        },
                    ],
                },
                {test: /\.svg/, type: 'asset/inline'},
                {
                    test: /\.mp4$/,
                    use: [
                        {
                            loader: "file-loader",
                            options: {
                                name: "[name].[ext]",
                                outputPath: "video"
                            }
                        }
                    ]
                },
                {
                    test: /\.hbs$/,
                    loader: 'handlebars-loader',
                    options: {
                        knownHelpersOnly: false,
                        partialDirs: [
                            path.resolve(__dirname, 'src/components/Plate'),
                            path.resolve(__dirname, 'src/components/Car'),
                            path.resolve(__dirname, 'src/components/Shipment'),
                            path.resolve(__dirname, 'src/components/Cargo'),
                            path.resolve(__dirname, 'src/partials/card'),
                            path.resolve(__dirname, 'src/partials/player-cards'),
                            path.resolve(__dirname, 'src/partials/cards-zone'),
                        ],
                        helperDirs: path.join(__dirname, 'src/helpers/'),
                        encoding: 'utf-8',
                    }
                },
                {
                    test: /\.(js)$/, exclude: /node_modules/, use: {
                        loader: 'babel-loader',
                    }
                },
                {
                    test: /\.scss$/,
                    exclude: /node_modules/,
                    use: [
                        'style-loader',
                        'css-loader',
                        'postcss-loader',
                        'sass-loader'],
                },
                {
                    test: /\.css$/,
                    use: [
                        'style-loader',
                        'css-loader',],
                },
                {
                    test: /\.ttf$/,
                    use: ['file-loader']
                }
            ]
        },
        resolve: {
            alias: {
                '@pages': path.resolve(__dirname, 'src/pages'),
                '@configs': path.resolve(__dirname, 'src/configs'),
                '@modules': path.resolve(__dirname, 'src/modules'),
                '@partials': path.resolve(__dirname, 'src/partials'),
                '@static': path.resolve(__dirname, 'static/'),
            },
            fallback: {
                "async_hooks": false,
                "path": require.resolve("path-browserify"),
                "zlib": require.resolve("browserify-zlib"),
                "querystring": require.resolve("querystring-es3"),
                "fs": false,
                "stream": require.resolve("stream-browserify"),
                "assert": require.resolve('assert'),
                "util": require.resolve('util'),
                // "crypto": require.resolve("crypto-browserify"),
                // "http": require.resolve("stream-http"),
                //"url": require.resolve("url/"),
                // "net": require.resolve("net-browserify"),
                // "process": require.resolve("process/browser"),
                // "timers": require.resolve("timers-browserify")
            }
        },
        output: {
            path: path.resolve(__dirname, 'dist/client'),
            publicPath: '/',
            filename: 'index_bundle.js',
            environment: {
                arrowFunction: false
            }
        },
        plugins: [
            new HtmlWebpackPlugin({template: './index.html'}),
            new FaviconsWebpackPlugin('../favicon.ico'),
            new MonacoWebpackPlugin()
        ],
    },
]
