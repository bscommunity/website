const fs = require('fs');
const path = require('path');
const successColor = '\x1b[32m%s\x1b[0m';
const checkSign = '\u{2705}';
require('dotenv').config({ path: '.env' });;

const envFile = `export const environment = {
	DISCORD_CLIENT_ID: '${process.env.DISCORD_CLIENT_ID}',
	REDIRECT_URI: '${process.env.REDIRECT_URI}',
	LASTFM_API_KEY: '${process.env.LASTFM_API_KEY}',
	SPOTIFY_CLIENT_ID: '${process.env.SPOTIFY_CLIENT_ID}',
	SPOTIFY_API_KEY: '${process.env.SPOTIFY_API_KEY}',
	ENCODING_KEY: '${process.env.ENCODING_KEY}',
};
`;
const targetPath = path.join(process.cwd(), 'src/environments/environment.ts');
fs.writeFile(targetPath, envFile, (err) => {
    if (err) {
        console.error(err);
        throw err;
    } else {
        console.log(successColor, `${checkSign} Successfully generated environment.ts`);
    }
});