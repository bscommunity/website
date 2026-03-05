/* Inserts a static fallback from tokens.css into styles.css to make color swatches available in VSCode colors preview */

const fs = require('fs');
const path = require('path');

function readFile(filePath) {
	return fs.readFileSync(filePath, 'utf8');
}

function writeFile(filePath, content) {
	fs.writeFileSync(filePath, content, 'utf8');
}

function extractTokens(css, theme) {
	// theme: 'light' or 'dark'
	let blockMatch;
	if (theme === 'dark') {
		// Match .dark { ... }
		blockMatch = css.match(/\.dark\s*\{([\s\S]*?)\}/m);
	} else {
		// Default: Light Theme :root, :host { ... }
		blockMatch = css.match(/:root,\s*\n\s*:host\s*\{([\s\S]*?)\}/m);
	}
	if (!blockMatch) return {};

	const block = blockMatch[1];
	const tokenMap = {};

	// Match lines like: --mat-sys-primary: #2c5f9f;
	const varRegex = /(--[a-zA-Z0-9\-]+)\s*:\s*([^;]+);/g;
	let m;
	while ((m = varRegex.exec(block)) !== null) {
		const name = m[1].trim();
		const value = m[2].trim();
		tokenMap[name] = value;
	}
	return tokenMap;
}

function addFallbacksToVars(css, tokenMap, opts = {}) {
	const { force = false } = opts;
	let changed = 0;
	let out = css;

	if (force) {
		// Update existing fallbacks: var(--xxx, old) -> var(--xxx, new)
		const reWithFallback = /var\(\s*(--mat-sys-[a-zA-Z0-9\-_]+)\s*,\s*([^)]+?)\s*\)/g;
		out = out.replace(reWithFallback, (full, varName) => {
			const fallback = tokenMap[varName];
			if (!fallback) return full;
			changed++;
			return `var(${varName}, ${fallback})`;
		});
	}

	// Add missing fallbacks: var(--xxx) -> var(--xxx, new)
	const reNoFallback = /var\(\s*(--mat-sys-[a-zA-Z0-9\-_]+)\s*\)/g;
	out = out.replace(reNoFallback, (full, varName) => {
		const fallback = tokenMap[varName];
		if (!fallback) return full;
		changed++;
		return `var(${varName}, ${fallback})`;
	});

	return { css: out, changed };
}

function main() {
	// CLI flags: --dark or --theme=dark to use dark tokens
	const argv = process.argv.slice(2);
	let theme = 'light';
	if (argv.includes('--dark')) theme = 'dark';
	const themeArg = argv.find((a) => a.startsWith('--theme='));
	if (themeArg) theme = themeArg.split('=')[1] || 'light';
	const force = argv.includes('--force') || argv.includes('--replace') || argv.includes('--overwrite');

	const repoRoot = path.resolve(__dirname, '..');
	const tokensPath = path.resolve(repoRoot, 'src', 'styles', 'tokens.css');
	const stylesPath = path.resolve(repoRoot, 'src', 'styles.css');

	if (!fs.existsSync(tokensPath)) {
		console.error(`Tokens file not found: ${tokensPath}`);
		process.exitCode = 1;
		return;
	}
	if (!fs.existsSync(stylesPath)) {
		console.error(`Styles file not found: ${stylesPath}`);
		process.exitCode = 1;
		return;
	}

	const tokensCss = readFile(tokensPath);
	const tokenMap = extractTokens(tokensCss, theme);

	const stylesCss = readFile(stylesPath);
	const { css: updated, changed } = addFallbacksToVars(stylesCss, tokenMap, { force });

	if (changed === 0) {
		console.log('No fallbacks added. Styles already up to date or no matches found.');
		return;
	}

	writeFile(stylesPath, updated);
	console.log(`Applied ${changed} fallback${changed === 1 ? '' : 's'} using ${theme}${force ? ' (force)' : ''} tokens to ${path.relative(repoRoot, stylesPath)}`);
}

main();

