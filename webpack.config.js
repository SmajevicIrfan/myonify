const path = require('path');
const webpack = require('webpack');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

let config = {
	context: __dirname,
	entry: path.resolve(__dirname, 'assets', 'src', 'js', 'main.js'),
	output: {
		path: path.resolve(__dirname, 'assets', 'dist'),
		filename: 'js/main.min.js'
	},
	module: {
		rules: [
			/*{
				test: /\.js$/,
				exclude: /node_modules/,
				use: 'babel-loader'
			},*/
		]
	}
};

module.exports = (env, argv) => {
	if (argv.mode == 'development') {
		config.devtool = 'inline-sourcemap';
		config.module.rules.push({
			test: /\.scss$/,
			use: [
				'style-loader',
				'css-loader',
				'sass-loader'
			]
		});
		config.plugins = [];
	}
	else {
		config.devtool == false;
		config.module.rules.push({
			test: /\.scss$/,
			use: [
				MiniCssExtractPlugin.loader,
				'css-loader',
				'sass-loader'
			]
		});
		config.plugins = [
			new webpack.optimize.OccurrenceOrderPlugin(),
			//new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
			new MiniCssExtractPlugin({
				//path: path.resolve(__dirname, 'assets', 'dist', 'css'),
				filename: 'css/[name].min.css',
				chunkFilename: '[id].css'
			})
		];
	}

	return config;
};