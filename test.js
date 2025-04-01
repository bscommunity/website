const fetchArtworkUrls = async (songs) => {
    const baseUrl = "https://itunes.apple.com/search";
    const urls = [];

    for (const [artist, track] of songs) {
        const query = encodeURIComponent(`${track} ${artist}`);
        const url = `${baseUrl}?term=${query}&media=music&limit=1`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.results.length > 0) {
                const artworkUrl = data.results[0].artworkUrl100.replace("100x100", "600x600");
                urls.push(artworkUrl);
            } else {
                console.log(`Nenhum resultado encontrado para: ${track} por ${artist}`);
            }
        } catch (error) {
            console.error(`Erro ao buscar ${track} por ${artist}:`, error);
        }
    }

    return urls;
};

const songs = [
    ["Billie Eilish", "CHIHIRO"],
    ["Olivia Rodrigo", "drivers license"],
    ["Sabrina Carpenter", "Espresso"],
    ["The Prodigy", "Firestarter"],
    ["FINNEAS", "Let's Fall in Love for the Night"],
    ["ANAVITÓRIA", "Trevo (Tu)"],
    ["Ed Sheeran", "Shape of You"],
    ["Adele", "Hello"],
    ["Drake", "Hotline Bling"],
    ["Taylor Swift", "Shake It Off"],
    ["Bruno Mars", "Uptown Funk"],
    ["Rihanna", "Diamonds"],
    ["Justin Bieber", "Sorry"],
    ["Shawn Mendes", "Stitches"],
    ["Dua Lipa", "New Rules"]
];

function writeToJsonFile(filePath, data) {
    const fs = require('fs');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

fetchArtworkUrls(songs).then(urls => {
    // Write to JSON file
    const fs = require('fs');
    const filePath = 'artworkUrls.json';

    const data = { urls };
    writeToJsonFile(filePath, data);
    console.log(`URLs de arte foram salvas em ${filePath}`);
});
