async function generateAndExportKey(): Promise<string> {
	const key = await crypto.subtle.generateKey(
		{ name: "AES-GCM", length: 256 },
		true,
		["encrypt", "decrypt"],
	);

	const exportedKey = await crypto.subtle.exportKey("raw", key);
	const base64Key = btoa(String.fromCharCode(...new Uint8Array(exportedKey))); // Convert to Base64

	console.log("Base64 Key:", base64Key);
	return base64Key;
}

// Convert Base64 key from .env to CryptoKey
async function importKey(base64Key: string): Promise<CryptoKey> {
	const rawKey = Uint8Array.from(atob(base64Key), (c) => c.charCodeAt(0));

	return crypto.subtle.importKey("raw", rawKey, { name: "AES-GCM" }, true, [
		"encrypt",
		"decrypt",
	]);
}

// Encrypt a string
async function encrypt(
	text: string,
	key: CryptoKey,
): Promise<{ iv: number[]; encrypted: number[] }> {
	const iv = crypto.getRandomValues(new Uint8Array(12)); // 12-byte IV for AES-GCM
	const encoder = new TextEncoder();
	const data = encoder.encode(text);

	const encrypted = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv: iv },
		key,
		data,
	);

	return {
		iv: Array.from(iv),
		encrypted: Array.from(new Uint8Array(encrypted)),
	};
}

// Decrypt a string
async function decrypt(
	encryptedObj: { iv: number[]; encrypted: number[] },
	key: CryptoKey,
): Promise<string> {
	const { iv, encrypted } = encryptedObj;

	const decrypted = await crypto.subtle.decrypt(
		{ name: "AES-GCM", iv: new Uint8Array(iv) },
		key,
		new Uint8Array(encrypted),
	);

	return new TextDecoder().decode(decrypted);
}

export { importKey, encrypt, decrypt };
