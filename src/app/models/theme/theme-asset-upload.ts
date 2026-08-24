import {
	rock,
	pop,
	alternative,
	hipHop,
	universal,
	rnb,
	dance,
	country,
} from "@/models/theme/beatstar-themes-data";

export interface IdentifiedFile {
	file: File;
	assetType: string;
	dimensions: string;
}

export interface AssetTypeInfo {
	key: string;
	label: string;
	expectedWidth: number;
	expectedHeight: number | null;
}

export const ASSET_TYPES: AssetTypeInfo[] = [
	{ key: "icon", label: "Icon", expectedWidth: 256, expectedHeight: 256 },
	{ key: "track", label: "Track", expectedWidth: 512, expectedHeight: null },
	{ key: "top", label: "Top", expectedWidth: 512, expectedHeight: 256 },
	{
		key: "perfectBar",
		label: "Perfect Bar",
		expectedWidth: 64,
		expectedHeight: 256,
	},
	{
		key: "perfectLine",
		label: "Perfect Line",
		expectedWidth: 512,
		expectedHeight: 32,
	},
	{ key: "circle", label: "Circle", expectedWidth: 256, expectedHeight: 256 },
	{ key: "bottom", label: "Bottom", expectedWidth: 512, expectedHeight: 256 },
];

export const OBLIGATORY_TYPES = ["icon", "top", "perfectBar"];

export function getAssetLabel(key: string): string {
	return ASSET_TYPES.find((a) => a.key === key)?.label ?? key;
}

export function buildUuidLookup(): Map<string, AssetTypeInfo[]> {
	const lookup = new Map<string, AssetTypeInfo[]>();
	const allThemes = [
		...rock,
		...pop,
		...alternative,
		...hipHop,
		...universal,
		...rnb,
		...dance,
		...country,
	];

	for (const theme of allThemes) {
		for (const [type, uuid] of Object.entries(theme.assets)) {
			if (!uuid) continue;
			const assetInfo = ASSET_TYPES.find((a) => a.key === type);
			if (!assetInfo) continue;

			const existing = lookup.get(uuid);
			if (existing) {
				existing.push(assetInfo);
			} else {
				lookup.set(uuid, [assetInfo]);
			}
		}
	}

	return lookup;
}

export function loadImageDimensions(
	file: File,
): Promise<{ width: number; height: number }> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		const url = URL.createObjectURL(file);
		img.onload = () => {
			URL.revokeObjectURL(url);
			resolve({ width: img.naturalWidth, height: img.naturalHeight });
		};
		img.onerror = () => {
			URL.revokeObjectURL(url);
			reject(new Error(`Could not load image: ${file.name}`));
		};
		img.src = url;
	});
}
