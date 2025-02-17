import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import stringPlugin from "rollup-plugin-string"; // changed import
import { terser } from "rollup-plugin-terser";

export default {
	input: "src/getAll.js",
	output: {
		file: "dist/bundle.js",
		format: "iife",
		name: "bundle",
	},
	plugins: [
		resolve(),
		commonjs(),
		stringPlugin({
			// updated usage
			// Process all html files in the project folder
			include: "**/*.html",
		}),
		terser(), // added minification
	],
};
