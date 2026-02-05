const fs = require('fs');
const path = require('path');

// Configuration
const ASSETS_DIR = path.join(__dirname, '../assets'); // Your current assets folder
const OUTPUT_FILE = path.join(__dirname, '../lib/data/EmbeddedAssets.ts'); // Where to save the code

// Helper to walk through directories
function getAllFiles(dirPath, arrayOfFiles) {
	const files = fs.readdirSync(dirPath);
	arrayOfFiles = arrayOfFiles || [];

	files.forEach(function (file) {
		if (fs.statSync(dirPath + '/' + file).isDirectory()) {
			arrayOfFiles = getAllFiles(dirPath + '/' + file, arrayOfFiles);
		} else {
			// Only grab PNGs
			if (file.endsWith('.png')) {
				arrayOfFiles.push(path.join(dirPath, '/', file));
			}
		}
	});
	return arrayOfFiles;
}

console.log('📦 Embedding assets...');

// 1. Get all files
const allFiles = getAllFiles(ASSETS_DIR);
const assetsMap = {};

// 2. Convert each to Base64
allFiles.forEach((filePath) => {
	// Create a key relative to the assets folder (e.g., "vtm/disciplines/Celerity.png")
	const relativeKey = path.relative(ASSETS_DIR, filePath).replace(/\\/g, '/');

	// Read file as binary
	const fileData = fs.readFileSync(filePath);
	// Convert to Base64
	const base64 = `data:image/png;base64,${fileData.toString('base64')}`;

	assetsMap[relativeKey] = base64;
	console.log(`   + Embedded: ${relativeKey}`);
});

// 3. Write the TypeScript file
const fileContent = `/* eslint-disable */
// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.
export const EMBEDDED_ASSETS: Record<string, string> = ${JSON.stringify(assetsMap, null, 4)};
`;

fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
fs.writeFileSync(OUTPUT_FILE, fileContent);

console.log(
	`✅ Done! Embedded ${Object.keys(assetsMap).length} assets into lib/data/EmbeddedAssets.ts`,
);
