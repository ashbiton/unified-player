const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: "./index.js",
    mode: 'development',
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [MiniCssExtractPlugin.loader, "css-loader"],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./index.html",
        }),
        new MiniCssExtractPlugin({
            filename: "styles.css",
        }),
    ],
    devServer: {
        static: [
            {
                directory: path.resolve(__dirname, "dist"),
            },
            {
                directory: path.resolve(__dirname),
                publicPath: "/",
            },
        ],
        port: 3000, // Port to run the server
        open: true, // Automatically open the browser
        hot: true,  // Enable hot module replacement
        allowedHosts: "all",
    }
};