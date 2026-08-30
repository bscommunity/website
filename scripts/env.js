const fs = require("fs");
const path = require("path");
const successColor = "\x1b[32m%s\x1b[0m";
const checkSign = "\u{2705}";
require("dotenv").config({ path: ".env" });

const envFile = `export const environment = {
    PRODUCTION: ${process.env.PRODUCTION},
    DEV_MODE: ${process.env.DEV_MODE},
    API_URL: '${process.env.API_URL}',
	DISCORD_CLIENT_ID: '${process.env.DISCORD_CLIENT_ID}',
	REDIRECT_URI: '${process.env.REDIRECT_URI}',
	LASTFM_API_KEY: '${process.env.LASTFM_API_KEY}',
	SPOTIFY_CLIENT_ID: '${process.env.SPOTIFY_CLIENT_ID}',
	SPOTIFY_API_KEY: '${process.env.SPOTIFY_API_KEY}',
	ENCODING_KEY: '${process.env.ENCODING_KEY}',
	GOOGLE_CLIENT_ID: '${process.env.GOOGLE_CLIENT_ID}',
	GOOGLE_CLIENT_SECRET: '${process.env.GOOGLE_CLIENT_SECRET}',
	GOOGLE_REDIRECT_URI: '${process.env.GOOGLE_REDIRECT_URI}',
	GOOGLE_SCOPES: '${process.env.GOOGLE_SCOPES}',
};
`;
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
