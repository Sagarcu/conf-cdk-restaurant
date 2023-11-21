const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    mode: 'production',
    entry: './src/website/restaurant-wrapper.ts',
    output: {
        filename: '[name].[contenthash].js', // Use content hashes for caching
        path: path.resolve(__dirname, './src/website/dist'),
        clean: true, // Clean the dist folder before each build
    },
    devtool: 'source-map',
    resolve: {
        extensions: ['.ts', '.js'],
    },
    optimization: {
        splitChunks: {
            chunks: 'all',
        },
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
        ],
    },
    devServer: {
        static: {
            directory: './src/website',
        },
        open: true,
        compress: true,
        port: 8001,
        liveReload: true,
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/website/index.html',
            filename: 'index.html',
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
            },
        }),
        new MiniCssExtractPlugin({
            filename: '[name].[contenthash].css',
            chunkFilename: '[id].[contenthash].css',
        }),
    ],
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    }
};