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
	heuristicMatch?: boolean;
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

export function detect256x256ImageType(
	file: File,
): Promise<"icon" | "circle" | null> {
	return new Promise((resolve) => {
		const img = new Image();
		const url = URL.createObjectURL(file);

		img.onload = () => {
			const canvas = document.createElement("canvas");
			canvas.width = 256;
			canvas.height = 256;
			const ctx = canvas.getContext("2d");
			if (!ctx) {
				URL.revokeObjectURL(url);
				resolve(null);
				return;
			}

			ctx.drawImage(img, 0, 0, 256, 256);
			URL.revokeObjectURL(url);

			const imageData = ctx.getImageData(0, 0, 256, 256);
			const data = imageData.data;

			const corners = [
				0, // top-left: (0,0)
				(255 * 4), // top-right: (255,0)
				(255 * 256 * 4), // bottom-left: (0,255)
				(255 * 256 * 4 + 255 * 4), // bottom-right: (255,255)
			];

			const allTransparent = corners.every(
				(offset) => data[offset + 3] < 128,
			);
			const allOpaque = corners.every((offset) => data[offset + 3] >= 128);

			if (allTransparent) {
				resolve("circle");
			} else if (allOpaque) {
				resolve("icon");
			} else {
				resolve(null);
			}
		};

		img.onerror = () => {
			URL.revokeObjectURL(url);
			resolve(null);
		};

		img.src = url;
	});
}

export function detect512x256ImageType(
	file: File,
): Promise<"top" | "bottom" | null> {
	return new Promise((resolve) => {
		const img = new Image();
		const url = URL.createObjectURL(file);

		img.onload = () => {
			const canvas = document.createElement("canvas");
			canvas.width = 512;
			canvas.height = 256;
			const ctx = canvas.getContext("2d");
			if (!ctx) {
				URL.revokeObjectURL(url);
				resolve(null);
				return;
			}

			ctx.drawImage(img, 0, 0, 512, 256);
			URL.revokeObjectURL(url);

			const imageData = ctx.getImageData(0, 0, 512, 256);
			const data = imageData.data;

			const bottomLeft = (255 * 512 * 4) + 3;
			const bottomRight = (255 * 512 * 4 + 511 * 4) + 3;
			const topLeft = 3;
			const topRight = (511 * 4) + 3;

			const bottomTransparent =
				data[bottomLeft] < 128 && data[bottomRight] < 128;
			const topTransparent =
				data[topLeft] < 128 && data[topRight] < 128;

			if (bottomTransparent) {
				resolve("top");
			} else if (topTransparent) {
				resolve("bottom");
			} else {
				resolve(null);
			}
		};

		img.onerror = () => {
			URL.revokeObjectURL(url);
			resolve(null);
		};

		img.src = url;
	});
}
