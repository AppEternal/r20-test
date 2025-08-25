import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import stringPlugin from "rollup-plugin-string";
import { terser } from "rollup-plugin-terser";
import createBookmarklet from "./rollup-plugin-bookmarklet.js";

// Define shared plugins to avoid duplication
const sharedPlugins = [
	resolve(),
	commonjs(),
	stringPlugin({
		include: "**/*.html",
	}),
	terser(),
	createBookmarklet(),
];

export default [
	{
		// First bundle configuration
		input: "src/getAll.js",
		output: {
			file: "dist/bundle.js",
			format: "iife",
			name: "bundle1",
		},
		plugins: sharedPlugins,
	},
	{
		// Second bundle configuration
		input: "src/roll18/roll18.js",
		output: {
			file: "dist/bundle18.js",
			format: "iife",
			name: "bundle2",
		},
		plugins: sharedPlugins,
	},
];
