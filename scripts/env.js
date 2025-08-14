const fs = require("fs");
const path = require("path");
const successColor = "\x1b[32m%s\x1b[0m";
const checkSign = "\u{2705}";

require("dotenv").config({ path: ".env" });

const dotenv = require("dotenv");
const envConfig = dotenv.parse(fs.readFileSync(".env"));

const envVars = Object.entries(envConfig)
	.map(([key, value]) => {
		// Try to determine the type of the value
		if (value === "true" || value === "false") {
			return `  ${key}: ${value},`;
		} else if (!isNaN(value) && value !== "" && value !== null) {
			return `  ${key}: ${value},`;
		} else {
			return `  ${key}: '${value}',`;
		}
	})
	.join("\n");

const envFile = `export const environment = {\n${envVars}\n};\n`;
const targetPath = path.join(process.cwd(), "src/environments/environment.ts");

// Create the target directory if it doesn't exist
fs.mkdirSync("src/environments", { recursive: true });

fs.writeFile(targetPath, envFile, (err) => {
	if (err) {
		console.error(err);
		throw err;
	} else {
		console.log(
			successColor,
			`${checkSign} Successfully generated environment.ts`,
		);
	}
});
