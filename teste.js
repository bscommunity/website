async function generateAndExportKey() {
    const key = await crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );

    const exportedKey = await crypto.subtle.exportKey("raw", key);
    const base64Key = btoa(String.fromCharCode(...new Uint8Array(exportedKey))); // Convert to Base64

    console.log("Base64 Key:", base64Key); // Copy and store in `.env`
    return base64Key;
}

generateAndExportKey().then((key) => {
    console.log(key);
});