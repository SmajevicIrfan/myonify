const path = require('path');
const webpack = require('webpack');

const debug = process.env.NODE_ENV !== 'production';

module.exports = {
	context: __dirname,
	devtool: debug ? 'inline-sourcemap' : false,
	entry: path.resolve(__dirname, 'src', 'App.js'),
	output: {
		path: path.resolve(__dirname, 'src'),
		filename: 'App.min.js'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: 'babel-loader'
			}
		]
	},
	plugins: debug ? [] : [
		new webpack.optimize.OccurrenceOrderPlugin(),
		new webpack.optimize.UglifyJsPlugin({ mangle: false, sourcemap: false }),
	],
};