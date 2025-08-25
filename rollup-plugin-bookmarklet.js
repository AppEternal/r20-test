import { readFileSync, writeFileSync } from "fs";

export default function createBookmarklet(options = {}) {
	return {
		name: "bookmarklet",
		async writeBundle(outputOptions, bundle) {
			const outputFile = outputOptions.file;
			if (outputFile) {
				try {
					// Dynamic import for bookmarklet
					const bookmarkletModule = await import("bookmarklet");

					// Read the generated bundle
					const bundleCode = readFileSync(outputFile, "utf8");

					// Generate bookmarklet using the convert function
					const result = await bookmarkletModule.convert(bundleCode, {
						urlencode: true,
						iife: false, // Bundle already wrapped
						mangleVars: false, // Already minified by terser
					});

					// Write bookmarklet file
					const bookmarkletFile = outputFile.replace(/\.js$/, ".bookmarklet.txt");
					writeFileSync(bookmarkletFile, result);

					console.log(`📖 Bookmarklet generated: ${bookmarkletFile}`);
					console.log(`📏 Bookmarklet length: ${result.length} characters`);
				} catch (error) {
					console.error("Error generating bookmarklet:", error);
				}
			}
		},
	};
}
